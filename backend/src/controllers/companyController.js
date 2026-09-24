import Student from "../models/Student.js";
import Company from "../models/Company.js";
import College from "../models/College.js";
import Shortlist from "../models/Shortlist.js";
import { computeMatch, computeReadiness } from "../utils/scoring.js";

// GET /api/company/roles — only this company's own roles (companies never see each other's).
export async function roles(req, res) {
  const company = await Company.findById(req.auth.tenantId).lean();
  if (!company) return res.status(404).json({ error: "Company not found" });
  const companyRoles = Array.isArray(company.roles) ? company.roles : [];
  if (companyRoles.length === 0) {
    return res.json([{ id: "all-candidates", title: "All candidates", pkg: "Review talent pool", required: {} }]);
  }
  res.json(companyRoles.map((r) => ({
    id: String(r._id),
    title: r.title || "Untitled role",
    pkg: r.packageRange || "Package not specified",
    required: r.requiredSkills && typeof r.requiredSkills === "object" ? r.requiredSkills : {},
  })));
}

// GET /api/company/matches?roleId=...
// Companies are intentionally allowed to read across every college's student pool — that's the
// cross-tenant business case — but only through this aggregated, read-only matching view, never
// raw access to a college's own collection or another company's roles.
export async function matches(req, res) {
  const { roleId } = req.query;
  const company = await Company.findById(req.auth.tenantId).lean();
  if (!company) return res.status(404).json({ error: "Role not found for this company" });
  const companyRoles = Array.isArray(company.roles) ? company.roles : [];
  const role = roleId === "all-candidates" && companyRoles.length === 0
    ? { _id: "all-candidates", title: "All candidates", packageRange: "Review talent pool", requiredSkills: {} }
    : companyRoles.find((r) => String(r._id) === String(roleId));
  if (!role) return res.status(404).json({ error: "Role not found for this company" });

  const [students, colleges] = await Promise.all([Student.find().lean(), College.find().lean()]);

  const requiredSkills = role.requiredSkills && typeof role.requiredSkills === "object" ? role.requiredSkills : {};
  const scored = students
    .map((s) => ({ ...s, match: Object.keys(requiredSkills).length ? computeMatch(s.skills, requiredSkills) : 100 }))
    .sort((a, b) => b.match - a.match);

  const qualified = scored.filter((s) => s.match >= 70);
  const byCollege = colleges.map((c) => ({
    college: { id: c._id, name: c.name, tag: c.tag },
    total: students.filter((s) => s.collegeId === c._id).length,
    qualified: qualified.filter((s) => s.collegeId === c._id).length,
  }));

  res.json({
    role: { id: String(role._id), title: role.title || "Untitled role", pkg: role.packageRange || "Package not specified", required: requiredSkills },
    qualifiedCount: qualified.length,
    byCollege,
    top: scored.slice(0, 10).map((s) => ({
      id: s._id, name: s.name, department: s.department, avatarColor: s.avatarColor,
      collegeId: s.collegeId, match: s.match,
    })),
  });
}

// POST /api/company/shortlist/:studentId — toggle
export async function toggleShortlist(req, res) {
  const { studentId } = req.params;
  const companyId = req.auth.tenantId;

  const existing = await Shortlist.findOne({ companyId, studentId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ studentId, shortlisted: false });
  }
  await Shortlist.create({ companyId, studentId });
  res.json({ studentId, shortlisted: true });
}

// GET /api/company/shortlist
export async function shortlist(req, res) {
  const rows = await Shortlist.find({ companyId: req.auth.tenantId }).sort({ createdAt: -1 }).lean();
  const studentIds = rows.map((r) => r.studentId);
  const students = await Student.find({ _id: { $in: studentIds } }).lean();
  const byId = Object.fromEntries(students.map((s) => [s._id, s]));

  res.json(rows.map((r) => {
    const s = byId[r.studentId];
    return s ? { id: s._id, name: s.name, department: s.department, avatarColor: s.avatarColor, collegeId: s.collegeId } : null;
  }).filter(Boolean));
}
