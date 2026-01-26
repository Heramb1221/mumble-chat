import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Rating } from "../models/Rating.js";

export async function submitRating(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const { rating, feedback, version, platform } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    if (feedback && feedback.trim().length > 1000) {
      res.status(400).json({ message: "Feedback is too long (max 1000 characters)" });
      return;
    }

    // Check if user already rated
    const existingRating = await Rating.findOne({ user: userId });

    let userRating;

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.feedback = feedback?.trim();
      existingRating.version = version || "1.0.0";
      existingRating.platform = platform;
      await existingRating.save();
      userRating = existingRating;
    } else {
      // Create new rating
      userRating = await Rating.create({
        user: userId,
        rating,
        feedback: feedback?.trim(),
        version: version || "1.0.0",
        platform,
      });
    }

    await userRating.populate("user", "name email");

    res.status(201).json({
      message: existingRating ? "Rating updated successfully" : "Rating submitted successfully",
      rating: userRating,
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function getUserRating(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    const rating = await Rating.findOne({ user: userId });

    if (!rating) {
      res.status(404).json({ message: "No rating found" });
      return;
    }

    res.json(rating);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function getAppStats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get rating statistics
    const stats = await Rating.aggregate([
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          fiveStars: {
            $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
          },
          fourStars: {
            $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] },
          },
          threeStars: {
            $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] },
          },
          twoStars: {
            $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] },
          },
          oneStar: {
            $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      res.json({
        totalRatings: 0,
        averageRating: 0,
        distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      });
      return;
    }

    res.json({
      totalRatings: stats[0].totalRatings,
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      distribution: {
        5: stats[0].fiveStars,
        4: stats[0].fourStars,
        3: stats[0].threeStars,
        2: stats[0].twoStars,
        1: stats[0].oneStar,
      },
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
}