import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { roles, matches, toggleShortlist, shortlist } from "../controllers/companyController.js";

const router = Router();
router.use(requireAuth, requireRole("company"));

router.get("/roles", roles);
router.get("/matches", matches);
router.post("/shortlist/:studentId", toggleShortlist);
router.get("/shortlist", shortlist);

export default router;
