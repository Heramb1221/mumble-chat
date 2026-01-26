import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Support } from "../models/Support.js";

export async function createSupportTicket(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const { category, subject, message } = req.body;

    console.log("📝 Creating support ticket:", {
      userId,
      category,
      subject,
      messageLength: message?.length,
    });

    // Validation
    if (!category || !subject || !message) {
      console.log("❌ Validation failed: Missing fields");
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const validCategories = ["bug", "feature", "help", "other"];
    if (!validCategories.includes(category)) {
      console.log("❌ Validation failed: Invalid category:", category);
      res.status(400).json({ message: "Invalid category" });
      return;
    }

    if (subject.trim().length < 5) {
      console.log("❌ Validation failed: Subject too short");
      res.status(400).json({ message: "Subject must be at least 5 characters" });
      return;
    }

    if (message.trim().length < 10) {
      console.log("❌ Validation failed: Message too short");
      res.status(400).json({ message: "Message must be at least 10 characters" });
      return;
    }

    // Create support ticket
    const ticket = await Support.create({
      user: userId,
      category,
      subject: subject.trim(),
      message: message.trim(),
    });

    console.log("✅ Support ticket created:", ticket._id);

    // Populate user info
    await ticket.populate("user", "name email");

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("💥 Error creating support ticket:", error);
    res.status(500);
    next(error);
  }
}

export async function getUserSupportTickets(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    const tickets = await Support.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(tickets);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function getSupportTicketById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const { ticketId } = req.params;

    const ticket = await Support.findOne({
      _id: ticketId,
      user: userId,
    }).populate("user", "name email avatar");

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }

    res.json(ticket);
  } catch (error) {
    res.status(500);
    next(error);
  }
}