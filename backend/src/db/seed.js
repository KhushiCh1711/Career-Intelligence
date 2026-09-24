import bcrypt from "bcryptjs";
import "dotenv/config";
import { connectDB } from "../config/db.js";
import College from "../models/College.js";
import Company from "../models/Company.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import Shortlist from "../models/Shortlist.js";
import { SKILLS, computeReadiness } from "../utils/scoring.js";

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return h; }
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rngFor = (id) => mulberry32(hashStr(id) >>> 0);

const COLLEGES = [
  { id: "ccsu", name: "Chaudhary Charan Singh University", tag: "CCSU" },
  { id: "dit", name: "Delhi Institute of Technology", tag: "DIT" },
  { id: "pni", name: "Pune National Institute", tag: "PNI" },
];
const COMPANIES = [
  { id: "infosys", name: "Infosys", color: "#0B4630", roles: [{ title: "Graduate Software Engineer", pkg: "₹7.2–9.5 LPA", required: { "JavaScript": 55, "React": 45, "SQL": 40 } }] },
  { id: "razorpay", name: "Razorpay", color: "#146341", roles: [{ title: "Frontend Engineer", pkg: "₹12–16 LPA", required: { "JavaScript": 75, "React": 70, "TypeScript": 50 } }] },
  { id: "deloitte", name: "Deloitte", color: "#C0821F", roles: [{ title: "Technology Analyst", pkg: "₹8–11 LPA", required: { "SQL": 60, "System Design": 40, "Python": 40 } }] },
  { id: "zeta", name: "Zeta Labs", color: "#1C7A4E", roles: [{ title: "Backend Engineer", pkg: "₹10–14 LPA", required: { "Node.js": 65, "SQL": 60, "System Design": 55 } }] },
];
const FIRST = ["Aisha", "Rohan", "Priya", "Karan", "Simran", "Vikram", "Ananya", "Arjun", "Neha", "Aditya", "Kavya", "Rahul", "Ishita", "Manav", "Tanvi", "Devansh", "Riya", "Yash"];
const LAST = ["Sharma", "Verma", "Gupta", "Mehta", "Singh", "Kapoor", "Reddy", "Nair", "Iyer", "Malhotra", "Chopra", "Bhat", "Rao", "Joshi", "Kulkarni", "Desai"];
const AVATAR_COLORS = ["#0B4630", "#146341", "#C0821F", "#8A4B3B", "#3B5B8A", "#6B4B8A"];
const DEPARTMENTS = ["Computer Science", "Information Technology", "Electronics", "Data Science"];
const DEMO_PASSWORD = "demo1234";

function tenantLogin(tenant, role) {
  const prefix = role === "university" ? "admin" : "hiring";
  return {
    role,
    tenantId: tenant._id,
    refId: null,
    username: `${prefix}@${tenant._id}.${role === "university" ? "edu" : "com"}`,
    passwordHash: bcrypt.hashSync(DEMO_PASSWORD, 10),
    label: `${tenant.name} · ${role === "university" ? "University admin" : "Hiring team"}`,
  };
}

async function run() {
  await connectDB();

  await Promise.all([
    College.deleteMany({}), Company.deleteMany({}), Student.deleteMany({}),
    User.deleteMany({}), Shortlist.deleteMany({}),
  ]);

  // Older databases may still have a non-sparse email index from before
  // accounts without email addresses were supported.
  await User.collection.dropIndex("email_1").catch(() => {});
  await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true, name: "email_1" });

  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  await College.insertMany(COLLEGES.map((c) => ({ _id: c.id, name: c.name, tag: c.tag })));
  await Company.insertMany(COMPANIES.map((c) => ({
    _id: c.id, name: c.name, color: c.color,
    roles: c.roles.map((r) => ({ title: r.title, packageRange: r.pkg, requiredSkills: r.required })),
  })));

  const users = [
    ...COLLEGES.map((college) => tenantLogin({ _id: college.id, name: college.tag }, "university")),
    ...COMPANIES.map((company) => tenantLogin({ _id: company.id, name: company.name }, "company")),
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const students = [];
  let idx = 0;

  COLLEGES.forEach((college) => {
    for (let i = 0; i < 7; i++) {
      const id = `${college.id}-s${i}`;
      const rand = rngFor(id);
      const name = `${FIRST[idx % FIRST.length]} ${LAST[(idx * 3) % LAST.length]}`;
      const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
      const department = DEPARTMENTS[idx % DEPARTMENTS.length];

      const skills = {};
      SKILLS.forEach((sk, si) => {
        const base = 25 + rand() * 65;
        const bump = si === idx % SKILLS.length ? 15 : 0;
        skills[sk] = Math.round(Math.min(97, Math.max(15, base + bump)));
      });

      const readiness = computeReadiness(skills);
      let cur = Math.max(20, readiness - 18 - Math.round(rand() * 10));
      const history = months.map((m, mi) => {
        cur = mi === 5 ? readiness : Math.min(readiness, cur + Math.round(2 + rand() * 5));
        return { month: m, score: cur };
      });

      const roadmap = [
        { id: "r1", title: "Build a full-stack project", sub: "In progress · 4 lessons left", pct: 68, done: false },
        { id: "r2", title: "Practice technical interviews", sub: "Next up · 6 mock interviews", pct: 24, done: false },
        { id: "r3", title: "Polish your portfolio", sub: "Recommended · 3 activities", pct: 0, done: false },
      ];

      students.push({ _id: id, collegeId: college.id, name, department, avatarColor, skills, history, roadmap });
      users.push({ role: "student", tenantId: college.id, refId: id, username: `${id}@student.edu`, passwordHash, label: `${name} · Student` });
      idx++;
    }
  });

  await Student.insertMany(students);
  await User.insertMany(users);

  console.log("Seed complete.");
  console.log(`Every account's password is: ${DEMO_PASSWORD}`);
  console.log("Example logins: admin@ccsu.edu, hiring@infosys.com, ccsu-s0@student.edu");
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
