import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getMe, submitAssessment, toggleRoadmapStep, simulate, applySkillProgress, getCodingChallenges, submitCodingChallenge, getSkillAssessments, submitSkillAssessment, getCodingPlatforms, connectCodingPlatform, addProject, connectGithub, addInterviewEvidence, saveStudentInterestProfile } from "../controllers/studentController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth, requireRole("student"));

router.get("/me", asyncHandler(getMe));
router.post("/me/field-profile", asyncHandler(saveStudentInterestProfile));
router.post("/me/assessment", asyncHandler(submitAssessment));
router.patch("/me/roadmap/:stepId", asyncHandler(toggleRoadmapStep));
router.post("/me/simulate", asyncHandler(simulate));
router.post("/me/skills/progress", asyncHandler(applySkillProgress));
router.get("/me/coding-challenges", getCodingChallenges);
router.post("/me/coding-challenges/:challengeId", asyncHandler(submitCodingChallenge));
router.get("/me/skill-assessments", asyncHandler(getSkillAssessments));
router.post("/me/skill-assessments/:skillId", asyncHandler(submitSkillAssessment));
router.get("/me/coding-platforms", asyncHandler(getCodingPlatforms));
router.post("/me/coding-platforms", asyncHandler(connectCodingPlatform));
router.post("/me/projects", asyncHandler(addProject));
router.post("/me/github", asyncHandler(connectGithub));
router.post("/me/interviews", asyncHandler(addInterviewEvidence));

export default router;
