import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getMe, submitAssessment, toggleRoadmapStep, simulate, applySkillProgress, getCodingChallenges, submitCodingChallenge, addProject, connectGithub, addInterviewEvidence } from "../controllers/studentController.js";

const router = Router();
router.use(requireAuth, requireRole("student"));

router.get("/me", getMe);
router.post("/me/assessment", submitAssessment);
router.patch("/me/roadmap/:stepId", toggleRoadmapStep);
router.post("/me/simulate", simulate);
router.post("/me/skills/progress", applySkillProgress);
router.get("/me/coding-challenges", getCodingChallenges);
router.post("/me/coding-challenges/:challengeId", submitCodingChallenge);
router.post("/me/projects", addProject);
router.post("/me/github", connectGithub);
router.post("/me/interviews", addInterviewEvidence);

export default router;
