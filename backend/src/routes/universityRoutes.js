import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { overview, directory } from "../controllers/universityController.js";

const router = Router();
router.use(requireAuth, requireRole("university"));

router.get("/overview", overview);
router.get("/students", directory);

export default router;
