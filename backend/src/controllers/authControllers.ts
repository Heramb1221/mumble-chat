import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { clerkClient} from "@clerk/express";
import { verifyToken } from "@clerk/backend";

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function authCallback(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    const clerkId = payload.sub;

    let user = await User.findOne({ clerkId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);

      user = await User.create({
        clerkId,
        name:
          clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0],
        email: clerkUser.emailAddresses[0]?.emailAddress,
        avatar: clerkUser.imageUrl,
      });
    }

    res.json(user);
  } catch (err) {
    console.error("Auth callback error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
}