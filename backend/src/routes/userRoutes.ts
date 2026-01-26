import { Router } from "express";
import { protectRoute } from "../middleware/auth.js";
import { getUsers, updateProfile } from "../controllers/userController.js";

const router = Router();

router.get("/", protectRoute, getUsers);

router.put("/profile", protectRoute, updateProfile);

export default router;