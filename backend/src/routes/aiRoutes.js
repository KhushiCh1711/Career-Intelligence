import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ask, conductInterview } from "../controllers/aiController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.post("/ask", requireAuth, requireRole("student"), asyncHandler(ask));
router.post("/interview", requireAuth, requireRole("student"), asyncHandler(conductInterview));

export default router;
