import express from "express";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { clerkMiddleware } from '@clerk/express'
import { errorHandler } from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json())
//Middleware that integrates Clerk authentication into your Express application. It checks the request's cookies and headers for a session JWT and, if found, attaches the Auth object to the request object under the auth key.
app.use(clerkMiddleware())

app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "https://your-web-domain.com",
      "http://localhost:5173",
      process.env.FRONTEND_URL!,
    ],
    credentials: true,
  })
);

app.get("/health", (req, res) => {
    res.json({status: "ok", message: "App is running"});
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

//error handles must come after routes to catch error by next methods
app.use(errorHandler);

export default app;