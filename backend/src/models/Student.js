import mongoose from "mongoose";

const historyPointSchema = new mongoose.Schema({
  month: { type: String, required: true },
  score: { type: Number, required: true },
}, { _id: false });

const roadmapStepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  sub: { type: String, required: true },
  pct: { type: Number, default: 0 },
  done: { type: Boolean, default: false },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  url: { type: String, required: true },
  techStack: { type: [String], default: [] },
  evidenceScore: { type: Number, default: 0 },
  evidence: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const githubSchema = new mongoose.Schema({
  url: { type: String, default: "" },
  connectedAt: { type: Date, default: null },
  score: { type: Number, default: 0 },
  languages: { type: [String], default: [] },
  signals: { type: [String], default: [] },
  gaps: { type: [String], default: [] },
}, { _id: false });

const codingResultSchema = new mongoose.Schema({
  challengeId: { type: String, required: true },
  title: { type: String, required: true },
  skill: { type: String, required: true },
  score: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now },
}, { _id: false });

const codingPlatformSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  connectedAt: { type: Date, default: Date.now },
}, { _id: false });

const skillAssessmentSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  score: { type: Number, min: 0, max: 100, required: true },
  mcqScore: { type: Number, min: 0, max: 100, required: true },
  codingResponses: { type: Map, of: String, default: {} },
  completedAt: { type: Date, default: Date.now },
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  role: { type: String, required: true },
  score: { type: Number, min: 0, max: 100, required: true },
  feedback: { type: String, default: "" },
  completedAt: { type: Date, default: Date.now },
}, { _id: false });

const interestFieldSchema = new mongoose.Schema({
  field: { type: String, required: true },
  months: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  skills: { type: [{ label: String, value: Number }], default: [] },
  completedAt: { type: Date, default: Date.now },
}, { _id: false });

const studentSchema = new mongoose.Schema({
  _id: { type: String }, // e.g. "ccsu-s0"
  collegeId: { type: String, required: true, index: true }, // the tenant boundary for every university query
  name: { type: String, required: true },
  email: { type: String, default: null },
  dateOfBirth: { type: Date, default: null },
  age: { type: Number, default: null },
  degree: { type: String, default: null },
  stream: { type: String, default: null },
  department: { type: String, required: true },
  avatarColor: { type: String, required: true },
  skills: { type: Object, required: true, default: () => ({}) }, // e.g. { JavaScript: 82, React: 60, ... }
  history: [historyPointSchema],
  roadmap: [roadmapStepSchema],
  assessmentComplete: { type: Boolean, default: false },
  projects: { type: [projectSchema], default: [] },
  github: { type: githubSchema, default: () => ({}) },
  codingResults: { type: [codingResultSchema], default: [] },
  codingPlatforms: { type: [codingPlatformSchema], default: [] },
  skillAssessments: { type: [skillAssessmentSchema], default: [] },
  interviews: { type: [interviewSchema], default: [] },
  interestFields: { type: [interestFieldSchema], default: [] },
}, { _id: false });

export default mongoose.model("Student", studentSchema);
