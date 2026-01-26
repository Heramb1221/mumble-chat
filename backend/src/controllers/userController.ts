import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    const users = await User.find({ _id: { $ne: userId } })
      .select("name email avatar")
      .limit(50);

    res.json(users);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { name, avatar } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        ...(avatar && { avatar }),
      },
      { new: true, runValidators: true }
    ).select("name email avatar");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500);
    next(error);
  }
}