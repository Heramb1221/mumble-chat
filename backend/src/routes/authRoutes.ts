import { Router } from "express";
import { authCallback, getMe } from "../controllers/authControllers.js";
import { protectRoute } from "../middleware/auth.js";

const router = Router();

router.get("/me", protectRoute ,getMe);
router.post("/callback", authCallback);

export default router;