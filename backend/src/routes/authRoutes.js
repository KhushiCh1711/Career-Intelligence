import { Router } from "express";
import { login, registerStudent, refresh, logout, listColleges, listCompanies, listStudentsForCollege } from "../controllers/authController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post("/login", asyncHandler(login));
router.post("/register", asyncHandler(registerStudent));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

// Public directory lookups used only by the sign-in screen (no sensitive data returned).
router.get("/colleges", asyncHandler(listColleges));
router.get("/companies", asyncHandler(listCompanies));
router.get("/colleges/:collegeId/students", asyncHandler(listStudentsForCollege));

export default router;
