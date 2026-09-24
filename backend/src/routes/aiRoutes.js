import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ask } from "../controllers/aiController.js";

const router = Router();
router.post("/ask", requireAuth, requireRole("student"), ask);

export default router;
