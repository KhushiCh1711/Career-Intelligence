import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import College from "../models/College.js";
import Company from "../models/Company.js";
import Student from "../models/Student.js";
import {
  signAccessToken, generateRefreshToken, hashRefreshToken, refreshCookieOptions,
} from "../utils/tokens.js";

const DEMO_TENANT_PASSWORD = "demo1234";

async function collegeExists(id) {
  const ids = [{ _id: id }];
  if (mongoose.Types.ObjectId.isValid(id)) ids.push({ _id: new mongoose.Types.ObjectId(id) });
  return Boolean(await College.collection.findOne({ $or: ids }, { projection: { _id: 1 } }));
}

function tenantUsernamePattern(tenant, role) {
  const tenantId = String(tenant._id ?? tenant.id ?? tenant);
  const prefix = role === "university" ? "admin" : "hiring";
  return role === "university"
    ? `${prefix}@${tenantId}.edu`
    : `${prefix}@${tenantId}.com`;
}

function legacyTenantUsername(tenant, role) {
  const tenantId = String(tenant._id ?? tenant.id ?? tenant);
  const prefix = role === "university" ? "admin" : "hiring";
  return `${prefix}+${tenantId}@pathway.local`;
}

async function ensureTenantLogin(tenant, role) {
  const primaryUsername = tenantUsernamePattern(tenant, role);
  const legacyUsername = legacyTenantUsername(tenant, role);
  const existing = await User.findOne({
    role,
    tenantId: tenant._id,
    $or: [{ username: primaryUsername }, { username: legacyUsername }],
  }, "username").lean();

  if (existing) return existing.username;

  try {
    const created = await User.create({
      role,
      tenantId: tenant._id,
      refId: null,
      username: primaryUsername,
      passwordHash: bcrypt.hashSync(DEMO_TENANT_PASSWORD, 10),
      label: `${tenant.name} · ${role === "university" ? "University admin" : "Hiring team"}`,
    });
    return created.username;
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const concurrentUser = await User.findOne({ role, tenantId: tenant._id }, "username").lean();
    return concurrentUser?.username || primaryUsername;
  }
}

export async function login(req, res) {
  const { username: identifier, password } = req.body;
  if (!identifier || !password) return res.status(400).json({ error: "username or email and password are required" });

  const normalizedIdentifier = identifier.trim().toLowerCase();
  const legacyIdentifier = normalizedIdentifier.includes("@pathway.local") ? normalizedIdentifier : null;

  let user = await User.findOne({ $or: [{ username: normalizedIdentifier }, { email: normalizedIdentifier }] });

  if (!user && legacyIdentifier) {
    user = await User.findOne({ username: legacyIdentifier });
  }

  if (!user) {
    const student = await Student.findOne({ email: normalizedIdentifier }, "_id").lean();
    if (student) user = await User.findOne({ refId: student._id.toString(), role: "student" });
  }
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const tenantExists = user.role === "university"
    ? await collegeExists(user.tenantId)
    : user.role === "company" ? await Company.exists({ _id: user.tenantId }) : true;
  if (!tenantExists) return res.status(401).json({ error: "This workspace is no longer available" });

  const needsAssessment = user.role === "student"
    ? !(await Student.exists({ _id: user.refId, assessmentComplete: true }))
    : false;
  user.needsAssessment = needsAssessment;

  const payload = { userId: user._id.toString(), role: user.role, tenantId: user.tenantId, refId: user.refId };
  const accessToken = signAccessToken(payload);
  const refreshToken = generateRefreshToken();
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();

  res.cookie("pw_refresh", refreshToken, refreshCookieOptions());
  res.json({ accessToken, user: { role: user.role, tenantId: user.tenantId, refId: user.refId, label: user.label, needsAssessment } });
}

export async function registerStudent(req, res) {
  const { username, email, password, name, dateOfBirth, age, degree, stream, collegeId } = req.body;
  if (!email || !password || !name || !dateOfBirth || !degree || !stream || !collegeId) {
    return res.status(400).json({ error: "name, email, password, date of birth, degree, stream, and college are required" });
  }
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address" });
  if (!await collegeExists(collegeId)) return res.status(400).json({ error: "Choose a valid college" });
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username?.trim().toLowerCase() || normalizedEmail;
  const emailConflict = await User.exists({ email: normalizedEmail });
  if (emailConflict) return res.status(409).json({ error: "That email is already registered. Try logging in with it or use another email." });
  const usernameConflict = await User.exists({ username: normalizedUsername });
  if (usernameConflict) return res.status(409).json({ error: "That username is already in use. Please choose another username." });
  const existingStudent = await Student.findOne({ email: normalizedEmail }, "_id").lean();
  if (existingStudent) {
    const linkedUser = await User.exists({ refId: existingStudent._id.toString(), role: "student" });
    if (linkedUser) return res.status(409).json({ error: "That email is already registered. Try logging in with it or use another email." });
    // Remove an incomplete profile left behind if a previous account creation stopped midway.
    await Student.deleteOne({ _id: existingStudent._id });
  }

  const studentId = `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let student;
  let user;
  try {
    student = await Student.create({
      _id: studentId,
      collegeId,
      name: name.trim(),
      email: normalizedEmail,
      dateOfBirth: new Date(dateOfBirth),
      age: age ? Number(age) : null,
      degree: degree.trim(),
      stream: stream.trim(),
      department: stream.trim(),
      avatarColor: "#146341",
      skills: {},
      history: [],
      roadmap: [],
      assessmentComplete: false,
    });
    user = await User.create({
      role: "student", tenantId: collegeId, refId: student._id,
      username: normalizedUsername, email: normalizedEmail, passwordHash: bcrypt.hashSync(password, 10),
      label: `${student.name} · Student`, needsAssessment: true,
    });
    const payload = { userId: user._id.toString(), role: user.role, tenantId: user.tenantId, refId: user.refId };
    const accessToken = signAccessToken(payload);
    const refreshToken = generateRefreshToken();
    user.refreshTokenHash = hashRefreshToken(refreshToken);
    await user.save();
    res.cookie("pw_refresh", refreshToken, refreshCookieOptions());
    return res.status(201).json({ accessToken, user: { role: user.role, tenantId: user.tenantId, refId: user.refId, label: user.label, needsAssessment: true } });
  } catch (error) {
    if (user) await User.deleteOne({ _id: user._id });
    if (student) await Student.deleteOne({ _id: student._id });
    if (error?.code === 11000) {
      const duplicateFields = Object.keys(error.keyPattern || error.keyValue || {});
      if (duplicateFields.includes("email")) {
        return res.status(409).json({ error: "That email is already registered. Try logging in with it or use another email." });
      }
      if (duplicateFields.includes("username")) {
        return res.status(409).json({ error: "That username is already in use. Please choose another username." });
      }
    }
    throw error;
  }
}

export async function refresh(req, res) {
  const raw = req.cookies?.pw_refresh;
  if (!raw) return res.sendStatus(204);

  const incomingHash = hashRefreshToken(raw);
  const user = await User.findOne({ refreshTokenHash: incomingHash });

  if (!user) {
    // Presented a refresh token that doesn't match any stored hash — possible reuse of a
    // rotated/stolen token. A production system should also revoke the whole session family here.
      res.clearCookie("pw_refresh", { path: "/api/auth" });
      return res.sendStatus(204);
  }
    const tenantExists = user.role === "university"
      ? await collegeExists(user.tenantId)
      : user.role === "company" ? await Company.exists({ _id: user.tenantId }) : true;
    if (!tenantExists) {
      await user.updateOne({ $set: { refreshTokenHash: null } });
      res.clearCookie("pw_refresh", { path: "/api/auth" });
      return res.sendStatus(204);
    }

  const needsAssessment = user.role === "student"
    ? !(await Student.exists({ _id: user.refId, assessmentComplete: true }))
    : false;
  user.needsAssessment = needsAssessment;

  const payload = { userId: user._id.toString(), role: user.role, tenantId: user.tenantId, refId: user.refId };
  const accessToken = signAccessToken(payload);
  const newRefresh = generateRefreshToken();
  user.refreshTokenHash = hashRefreshToken(newRefresh);
  await user.save();

  res.cookie("pw_refresh", newRefresh, refreshCookieOptions());
  res.json({ accessToken, user: { role: user.role, tenantId: user.tenantId, refId: user.refId, label: user.label, needsAssessment } });
}

export async function logout(req, res) {
  const raw = req.cookies?.pw_refresh;
  if (raw) {
    await User.updateOne({ refreshTokenHash: hashRefreshToken(raw) }, { $set: { refreshTokenHash: null } });
  }
  res.clearCookie("pw_refresh", { path: "/api/auth" });
  res.json({ ok: true });
}

// Public directory lookups so the sign-in screen can list tenants without being authenticated yet.
export async function listColleges(req, res) {
  const colleges = await College.find({}).lean();
  const normalizedColleges = colleges.map((college) => ({
    ...college,
    id: String(college._id),
    name: college.name || college.universityName || college.collegeName || college.title || college["Name of the University"] || college["University Name"] || String(college._id),
    tag: college.tag || college.shortName || college.code || college.Type || college.state || String(college._id),
  }));
  const usernames = await Promise.all(normalizedColleges.map((college) => ensureTenantLogin(college, "university")));
  res.json(normalizedColleges.map((college, index) => ({ id: college.id, name: college.name, tag: college.tag, username: usernames[index] })));
}
export async function listCompanies(req, res) {
  const companies = await Company.find({}, "name color").lean();
  const usernames = await Promise.all(companies.map((company) => ensureTenantLogin(company, "company")));
  res.json(companies.map((company, index) => ({ id: company._id, name: company.name, color: company.color, username: usernames[index] })));
}
export async function listStudentsForCollege(req, res) {
  const rows = await Student.find({ collegeId: req.params.collegeId }, "name avatarColor").lean();
  res.json(rows.map((s) => ({ id: s._id, name: s.name, avatar_color: s.avatarColor })));
}
