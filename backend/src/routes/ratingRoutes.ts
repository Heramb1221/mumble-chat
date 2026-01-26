import { Router } from "express";
import { protectRoute } from "../middleware/auth.js";
import { submitRating, getUserRating, getAppStats } from "../controllers/ratingController.js";

const router = Router();

router.use(protectRoute);

router.post("/", submitRating);

router.get("/me", getUserRating);

router.get("/stats", getAppStats);

export default router;