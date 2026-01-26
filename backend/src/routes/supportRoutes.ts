import { Router } from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  createSupportTicket,
  getUserSupportTickets,
  getSupportTicketById,
} from "../controllers/supportController.js";

const router = Router();

router.use(protectRoute);

router.post("/", createSupportTicket);

router.get("/", getUserSupportTickets);

router.get("/:ticketId", getSupportTicketById);

export default router;