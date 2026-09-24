import { Router } from "express";
import { login, registerStudent, refresh, logout, listColleges, listCompanies, listStudentsForCollege } from "../controllers/authController.js";

const router = Router();

router.post("/login", login);
router.post("/register", registerStudent);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Public directory lookups used only by the sign-in screen (no sensitive data returned).
router.get("/colleges", listColleges);
router.get("/companies", listCompanies);
router.get("/colleges/:collegeId/students", listStudentsForCollege);

export default router;
