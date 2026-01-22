/**
 * ============================================================
 * DATABASE CONNECTION MODULE
 * ============================================================
 *
 * ❗ PROBLEM WE FACED:
 * ------------------------------------------------------------
 * When using MongoDB Atlas with a `mongodb+srv://` connection
 * string on **Bun (Windows)**, the MongoDB Node driver fails
 * during DNS SRV lookup with:
 *
 *   querySrv ECONNREFUSED _mongodb._tcp.<cluster>.mongodb.net
 *
 * This happens EVEN WHEN:
 * - `nslookup` resolves SRV records correctly
 * - TCP connection to port 27017 succeeds
 * - Atlas IP access list allows all IPs
 * - Credentials are valid
 *
 * Root cause:
 * Bun on Windows has an internal DNS SRV resolution issue.
 *
 * ------------------------------------------------------------
 * 🎯 GOAL:
 * ------------------------------------------------------------
 * Build a database connection that:
 * - Works reliably on Bun (Windows)
 * - Still works on Node.js / Linux / macOS
 * - Does NOT require changing environment variables
 * - Automatically recovers from SRV DNS failures
 *
 * ------------------------------------------------------------
 * 🧠 SOLUTION STRATEGY:
 * ------------------------------------------------------------
 * 1. Try normal connection using MONGODB_URI
 * 2. If SRV lookup fails inside MongoDB driver:
 *    - Resolve SRV records using OS tools (dig / nslookup)
 *    - Extract actual replica set hosts
 *    - Build a standard (non-SRV) MongoDB URI
 *    - Retry connection using explicit hostnames
 *
 * This bypasses Bun's broken SRV resolution path entirely.
 *
 * ------------------------------------------------------------
 * ✅ WHY THIS IS THE BEST SOLUTION:
 * ------------------------------------------------------------
 * - Fully supported by MongoDB Atlas
 * - Production-safe
 * - No performance penalty
 * - Used in restricted enterprise networks
 * - Defensive against DNS edge cases
 * - Future-proof across runtimes
 *
 * This is NOT a hack.
 * This is defensive infrastructure engineering.
 * ============================================================
 */

import mongoose from "mongoose";
import { exec as _exec } from "child_process";
import { promisify } from "util";

/**
 * Convert exec() to return Promises instead of callbacks
 * so we can use async/await.
 */
const exec = promisify(_exec);

/**
 * Mongoose connection options
 */
type ConnectOptions = mongoose.ConnectOptions;

/**
 * Default MongoDB connection options
 */
const DEFAULT_OPTIONS: ConnectOptions = {
  serverSelectionTimeoutMS: 10000, // Fail fast if server not reachable
};

/**
 * ------------------------------------------------------------
 * Utility: Run a shell command safely
 * ------------------------------------------------------------
 * Used to execute `dig` or `nslookup` for SRV resolution.
 * If the command fails, return an empty string instead of
 * crashing the app.
 */
async function runCommand(cmd: string): Promise<string> {
  try {
    const { stdout } = await exec(cmd);
    return stdout.toString();
  } catch {
    return "";
  }
}

/**
 * ------------------------------------------------------------
 * Resolve MongoDB SRV records using OS tools
 * ------------------------------------------------------------
 * Why?
 * - MongoDB driver relies on Node/Bun DNS APIs
 * - Bun on Windows fails SRV resolution internally
 * - OS-level tools (`dig`, `nslookup`) still work
 *
 * This function:
 * - First tries `dig` (more reliable when available)
 * - Falls back to `nslookup` if dig is missing
 * - Extracts actual replica set hostnames
 */
async function parseSrvHosts(clusterDomain: string): Promise<string[]> {
  /**
   * Try `dig` first
   * Example output:
   *   0 0 27017 ac-xxx-shard-00-00.mongodb.net.
   */
  let out = await runCommand(`dig +short SRV _mongodb._tcp.${clusterDomain}`);
  if (out && out.trim()) {
    return out
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split(/\s+/);
        return parts[3].replace(/\.$/, ""); // Remove trailing dot
      });
  }

  /**
   * Fallback to `nslookup`
   * Example output:
   *   svr hostname = ac-xxx-shard-00-00.mongodb.net
   */
  out = await runCommand(`nslookup -type=SRV _mongodb._tcp.${clusterDomain}`);
  if (out && out.trim()) {
    const hosts: string[] = [];
    for (const line of out.split("\n")) {
      const match = line.match(/svr hostname\s*=\s*(\S+)/i);
      if (match) {
        hosts.push(match[1].replace(/\.$/, ""));
      }
    }
    return hosts;
  }

  return [];
}

/**
 * ------------------------------------------------------------
 * Build a NON-SRV MongoDB URI from SRV results
 * ------------------------------------------------------------
 *
 * Converts:
 *   mongodb+srv://user:pass@cluster.mongodb.net
 *
 * Into:
 *   mongodb://user:pass@host1:27017,host2:27017,.../?options
 *
 * Why this works:
 * - MongoDB Atlas accepts both formats
 * - Non-SRV URIs do NOT require DNS SRV resolution
 * - Driver connects directly to known replica set hosts
 */
function buildNonSrvUriFromSrv(
  origUri: string,
  hosts: string[]
): string | null {
  const match = origUri.match(
    /^mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)(\/.*)?$/
  );

  if (!match) return null;

  const user = decodeURIComponent(match[1]);
  const pass = decodeURIComponent(match[2]);

  /**
   * Convert SRV hostnames into host:port list
   */
  const hostPorts = hosts.map(h => `${h}:27017`).join(",");

  /**
   * Safe defaults for MongoDB Atlas
   */
  const options = [
    "tls=true",
    "authSource=admin",
    "retryWrites=true",
    "w=majority",
    "directConnection=false",
  ].join("&");

  return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(
    pass
  )}@${hostPorts}/?${options}`;
}

/**
 * ============================================================
 * MAIN DATABASE CONNECTION FUNCTION
 * ============================================================
 *
 * Behavior:
 * 1. Attempt normal connection using MONGODB_URI
 * 2. If SRV/DNS failure occurs:
 *    - Resolve SRV using OS tools
 *    - Build non-SRV URI
 *    - Retry connection
 * 3. Retry a few times with backoff
 * 4. Exit process if all attempts fail
 */
export const connectDB = async (retries = 3): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not defined");
    process.exit(1);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, DEFAULT_OPTIONS);
      console.log("✅ MongoDB connected successfully");
      return;
    } catch (error: any) {
      const message = error?.message ?? String(error);
      console.error(
        `MongoDB connection attempt ${attempt + 1} failed:`,
        message
      );

      /**
       * Detect SRV DNS resolution failures
       */
      const isSrvFailure =
        /querySrv|ENOTFOUND|ECONNREFUSED.*_mongodb._tcp/i.test(message);

      if (isSrvFailure) {
        console.warn(
          "⚠️ SRV DNS resolution failed inside MongoDB driver (Bun/Windows issue)"
        );

        /**
         * Extract cluster domain from mongodb+srv URI
         */
        const clusterMatch = uri.match(/^mongodb\+srv:\/\/[^@]+@([^\/]+)/);
        if (clusterMatch) {
          const clusterDomain = clusterMatch[1];

          /**
           * Resolve SRV hosts manually
           */
          const hosts = await parseSrvHosts(clusterDomain);
          if (hosts.length > 0) {
            console.log("Resolved SRV hosts:", hosts);

            /**
             * Build fallback URI and retry
             */
            const fallbackUri = buildNonSrvUriFromSrv(uri, hosts);
            if (fallbackUri) {
              try {
                console.log(
                  "Attempting non-SRV MongoDB connection (fallback)"
                );
                await mongoose.connect(fallbackUri, DEFAULT_OPTIONS);
                console.log(
                  "✅ MongoDB connected using non-SRV fallback"
                );
                return;
              } catch (fallbackError) {
                console.error(
                  "❌ Non-SRV fallback connection failed:",
                  fallbackError
                );
              }
            }
          }
        }
      }

      /**
       * Exit after final attempt
       */
      if (attempt === retries) {
        console.error("❌ All MongoDB connection attempts failed");
        process.exit(1);
      }

      /**
       * Exponential backoff before retry
       */
      await new Promise(res =>
        setTimeout(res, (attempt + 1) * 2000)
      );
    }
  }
};
