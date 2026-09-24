import mongoose from "mongoose";
import Student from "../models/Student.js";
import College from "../models/College.js";
import { computeReadiness, computeEvidenceBoost } from "../utils/scoring.js";

function collegeDisplayName(college) {
  return college.name || college.universityName || college.collegeName || college.title
    || college["Name of the University"] || college["University Name"] || String(college._id);
}

function collegeTag(college) {
  return college.tag || college.shortName || college.code || college.Type || college.state || String(college._id);
}

function tenantIds(collegeId) {
  const ids = [collegeId];
  if (mongoose.Types.ObjectId.isValid(collegeId)) ids.push(new mongoose.Types.ObjectId(collegeId));
  return ids;
}

async function findCollege(collegeId) {
  return College.collection.findOne({ _id: { $in: tenantIds(collegeId) } });
}

async function studentsForCollege(collegeId) {
  const students = await Student.collection.find({ collegeId: { $in: tenantIds(collegeId) } }).toArray();
  return students.map((s) => {
    const evidence = {
      projectScore: s.projects?.length ? s.projects.reduce((sum, project) => sum + (Number(project.evidenceScore) || 0), 0) / s.projects.length : 0,
      codingScore: s.codingResults?.length ? s.codingResults.reduce((sum, result) => sum + (Number(result.score) || 0), 0) / s.codingResults.length : 0,
      interviewScore: s.interviews?.length ? s.interviews.reduce((sum, interview) => sum + (Number(interview.score) || 0), 0) / s.interviews.length : 0,
      githubScore: s.github?.score || 0,
    };
    const gaps = Object.entries(s.skills || {}).sort(([, first], [, second]) => Number(first) - Number(second)).slice(0, 3).map(([skill, score]) => ({ skill, score: Number(score) || 0 }));
    return { ...s, readiness: Math.min(100, computeReadiness(s.skills) + computeEvidenceBoost(evidence)), gaps };
  });
}

// GET /api/university/overview — strictly scoped to req.auth.tenantId (the admin's own college).
// Every query here has collegeId baked in: a university admin can never read another college's rows.
export async function overview(req, res) {
  const collegeId = req.auth.tenantId;
  const college = await findCollege(collegeId);
  if (!college) return res.status(404).json({ error: "College not found" });
  const students = await studentsForCollege(collegeId);

  const avg = students.length ? Math.round(students.reduce((s, st) => s + st.readiness, 0) / students.length) : 0;
  const ready = students.filter((s) => s.readiness >= 70).length;

  const buckets = [
    { label: "0-40", count: students.filter((s) => s.readiness < 40).length },
    { label: "40-60", count: students.filter((s) => s.readiness >= 40 && s.readiness < 60).length },
    { label: "60-80", count: students.filter((s) => s.readiness >= 60 && s.readiness < 80).length },
    { label: "80-100", count: students.filter((s) => s.readiness >= 80).length },
  ];

  const skillNames = [...new Set(students.flatMap((student) => Object.keys(student.skills || {})))];
  const gapSkills = skillNames.map((sk) => ({
    skill: sk,
    avg: students.length ? Math.round(students.reduce((s, st) => s + (st.skills[sk] || 0), 0) / students.length) : 0,
  })).sort((a, b) => a.avg - b.avg);

  const rankedStudents = [...students].sort((a, b) => b.readiness - a.readiness);
  const topStudents = rankedStudents.slice(0, 5).map((student) => ({
    id: student._id, name: student.name, department: student.department, avatarColor: student.avatarColor,
    readiness: student.readiness, gaps: student.gaps,
  }));
  const gapUpdates = students.sort((first, second) => (first.gaps[0]?.score || 0) - (second.gaps[0]?.score || 0)).slice(0, 8).map((student) => ({
    id: student._id, name: student.name, readiness: student.readiness, gaps: student.gaps,
  }));

  res.json({ college: { id: String(college._id), name: collegeDisplayName(college), tag: collegeTag(college) }, totalStudents: students.length, hasStudentData: students.length > 0, avgReadiness: avg, readyCount: ready, buckets, gapSkills, topStudents, gapUpdates });
}

// GET /api/university/students?query=&sort=readiness|name
export async function directory(req, res) {
  const collegeId = req.auth.tenantId;
  const { query = "", sort = "readiness" } = req.query;

  let students = (await studentsForCollege(collegeId)).filter((s) => s.name.toLowerCase().includes(String(query).toLowerCase()));
  students = students.sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : b.readiness - a.readiness);

  res.json(students.map((s) => ({
    id: s._id, name: s.name, department: s.department, avatarColor: s.avatarColor, readiness: s.readiness, gaps: s.gaps,
  })));
}
