import Student from "../models/Student.js";
import User from "../models/User.js";
import Company from "../models/Company.js";
import { ASSESSMENT_QUESTIONS, SKILLS, computeReadiness, computeMatch, computeEvidenceBoost } from "../utils/scoring.js";
import { SKILL_ASSESSMENTS } from "../utils/skillAssessments.js";

const CODING_CHALLENGES = [
  { id: "js-async", title: "Async JavaScript", skill: "JavaScript", prompt: "What does an async function return?", options: ["A Promise", "A CSS rule", "Only a number", "A database connection"], answer: 0 },
  { id: "sql-filter", title: "Filter a dataset", skill: "SQL", prompt: "Which clause filters rows before grouping?", options: ["ORDER BY", "WHERE", "CREATE", "ALTER"], answer: 1 },
  { id: "react-state", title: "React state", skill: "React", prompt: "Which hook stores local component state?", options: ["useEffect", "useMemo", "useState", "useRef"], answer: 2 },
];

const CODING_PLATFORMS = [
  { id: "leetcode", name: "LeetCode", hostname: "leetcode.com", description: "Algorithms, data structures, and interview practice." },
  { id: "hackerrank", name: "HackerRank", hostname: "hackerrank.com", description: "Skill certifications and timed coding tracks." },
  { id: "geeksforgeeks", name: "GeeksforGeeks", hostname: "geeksforgeeks.org", description: "DSA practice, tutorials, and company problems." },
  { id: "codeforces", name: "Codeforces", hostname: "codeforces.com", description: "Competitive programming contests and rating." },
  { id: "codechef", name: "CodeChef", hostname: "codechef.com", description: "Contests and practice for competitive programmers." },
  { id: "codingninjas", name: "Coding Ninjas", hostname: "codingninjas.com", description: "Courses and structured coding practice." },
];

async function rolesForSkills(skills) {
  const companies = await Company.find().lean();
  const all = [];
  companies.forEach((c) => (Array.isArray(c.roles) ? c.roles : []).forEach((r) => all.push({
    title: r.title, pkg: r.packageRange, company: c.name, color: c.color,
    requiredSkills: r.requiredSkills && typeof r.requiredSkills === "object" ? r.requiredSkills : {},
    match: computeMatch(skills, r.requiredSkills),
  })));
  return all.sort((a, b) => b.match - a.match);
}

function evidenceSummary(student) {
  const projects = Array.isArray(student.projects) ? student.projects : [];
  const coding = Array.isArray(student.codingResults) ? student.codingResults : [];
  const interviews = Array.isArray(student.interviews) ? student.interviews : [];
  const projectScore = projects.length ? projects.reduce((sum, project) => sum + project.evidenceScore, 0) / projects.length : 0;
  const codingScore = coding.length ? coding.reduce((sum, result) => sum + result.score, 0) / coding.length : 0;
  const interviewScore = interviews.length ? interviews.reduce((sum, interview) => sum + interview.score, 0) / interviews.length : 0;
  const githubScore = Number(student.github?.score) || 0;
  return { projectScore, codingScore, interviewScore, githubScore, boost: computeEvidenceBoost({ projectScore, codingScore, interviewScore, githubScore }) };
}

function publicGithubRepo(url) {
  const match = String(url || "").trim().match(/^https?:\/\/github\.com\/([^/]+)\/([^/#]+)\/?(?:#.*)?$/i);
  return match ? { owner: match[1], repo: match[2].replace(/\.git$/, "") } : null;
}

async function inspectGithub(url) {
  const repo = publicGithubRepo(url);
  if (!repo) throw new Error("Enter a public GitHub repository URL");
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "pathway-career-intelligence" };
  const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`, { headers, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("GitHub repository could not be read. Check that it is public.");
  const details = await response.json();
  const contentsResponse = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/contents`, { headers, signal: AbortSignal.timeout(10000) });
  const contents = contentsResponse.ok ? await contentsResponse.json() : [];
  const names = Array.isArray(contents) ? contents.map((item) => item.name.toLowerCase()) : [];
  const signals = [];
  const gaps = [];
  if (details.description) signals.push("Repository has a project description"); else gaps.push("Add a clear repository description");
  if (names.includes("readme.md")) signals.push("README found"); else gaps.push("Add a README with setup and architecture");
  if (names.some((name) => ["package.json", "requirements.txt", "pom.xml", "go.mod"].includes(name))) signals.push("Dependency manifest found"); else gaps.push("Add a dependency manifest");
  if (names.some((name) => name.includes("test") || name === "__tests__")) signals.push("Test files detected"); else gaps.push("Add automated tests");
  const languagesResponse = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/languages`, { headers, signal: AbortSignal.timeout(10000) });
  const languages = languagesResponse.ok ? Object.keys(await languagesResponse.json()) : [];
  if (languages.length) signals.push(`${languages.length} language${languages.length === 1 ? "" : "s"} detected`); else gaps.push("Add implementation code");
  const score = Math.min(100, signals.length * 20);
  return { url, score, languages, signals, gaps };
}

function roleReport(roles, skills) {
  return roles.map((role) => ({
    company: role.company, title: role.title, pkg: role.pkg, match: role.match,
    interviewReady: role.match >= 70,
    gaps: Object.entries(role.requiredSkills).map(([skill, target]) => ({ skill, current: Number(skills?.[skill]) || 0, target: Number(target) })).filter((gap) => gap.current < gap.target),
  }));
}

// GET /api/students/me — scoped by the auth token's refId, never a client-supplied id.
export async function getMe(req, res) {
  const student = await Student.findById(req.auth.refId).lean();
  if (!student) return res.status(404).json({ error: "Student not found" });

  const skills = student.skills && typeof student.skills === "object" ? student.skills : {};
  const evidence = evidenceSummary(student);
  const readiness = Math.min(100, computeReadiness(skills) + evidence.boost);
  const allRoles = await rolesForSkills(skills);
  const roles = allRoles.slice(0, 6);
  const interviewReadyRoles = allRoles.filter((role) => role.match >= 70).slice(0, 6);
  const gapTargets = {};
  allRoles.slice(0, 10).forEach((role) => Object.entries(role.requiredSkills).forEach(([skill, target]) => {
    const current = Number(skills[skill]) || 0;
    const gap = Math.max(0, Number(target) - current);
    if (gap > (gapTargets[skill]?.gap || 0)) gapTargets[skill] = { skill, current, target: Number(target), gap };
  }));
  const gapSkills = Object.values(gapTargets).sort((first, second) => second.gap - first.gap).slice(0, 5);

  res.json({
    id: student._id,
    name: student.name,
    department: student.department,
    avatarColor: student.avatarColor,
    skills,
    readiness,
    evidence,
    history: student.history,
    roles,
    readinessReport: {
      interviewReady: interviewReadyRoles.length > 0,
      interviewReadyRoles: interviewReadyRoles.map(({ requiredSkills, ...role }) => role),
      nextRole: allRoles.find((role) => role.match < 70) ? (({ requiredSkills, ...role }) => role)(allRoles.find((role) => role.match < 70)) : null,
      gapSkills,
      companyReadiness: roleReport(allRoles, skills),
    },
    roadmap: student.roadmap || [],
    projects: student.projects || [],
    github: student.github || null,
    codingResults: student.codingResults || [],
    interviews: student.interviews || [],
    assessmentComplete: student.assessmentComplete,
    interestFields: student.interestFields || [],
  });
}

export async function saveStudentInterestProfile(req, res) {
  const rawProfile = req.body?.profile ?? req.body;
  if (!rawProfile || !String(rawProfile.field || "").trim()) {
    return res.status(400).json({ error: "Field selection is required" });
  }

  const student = await Student.findById(req.auth.refId);
  if (!student) return res.status(404).json({ error: "Student not found" });
  if (!student.skills || typeof student.skills !== "object" || Array.isArray(student.skills)) student.skills = {};

  const nextEntry = {
    field: String(rawProfile.field).trim(),
    months: Number(rawProfile.months || 0),
    score: Number(rawProfile.score || 0),
    skills: Array.isArray(rawProfile.skills)
      ? rawProfile.skills.map((skill) => ({ label: String(skill.label || ""), value: Number(skill.value || 0) }))
      : [],
    completedAt: new Date(),
  };

  const existing = Array.isArray(student.interestFields) ? student.interestFields : [];
  const index = existing.findIndex((entry) => entry.field === nextEntry.field);
  if (index >= 0) existing[index] = nextEntry; else existing.push(nextEntry);
  student.interestFields = existing;
  await student.save();

  res.status(201).json({ profile: nextEntry, interestFields: student.interestFields });
}

export async function submitAssessment(req, res) {
  const answers = req.body.answers;
  if (!answers || typeof answers !== "object") return res.status(400).json({ error: "Assessment answers are required" });
  if (ASSESSMENT_QUESTIONS.some((question) => !Number.isInteger(answers[question.id]))) {
    return res.status(400).json({ error: "Please answer all assessment questions" });
  }
  const student = await Student.findById(req.auth.refId);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const skillResults = Object.fromEntries(SKILLS.map((skill) => [skill, []]));
  ASSESSMENT_QUESTIONS.forEach((question) => {
    const selected = answers[question.id];
    if (selected < 0 || selected >= question.options.length) return;
    skillResults[question.skill].push(selected === question.answer ? 100 : 0);
  });
  const skills = Object.fromEntries(SKILLS.map((skill) => {
    const results = skillResults[skill];
    return [skill, results.length ? Math.round(results.reduce((sum, value) => sum + value, 0) / results.length) : 0];
  }));
  const readiness = computeReadiness(skills);
  student.skills = skills;
  student.assessmentComplete = true;
  student.history = [{ month: "Today", score: readiness }];
  student.roadmap = [
    { id: "r1", title: "Build a project in your strongest skill", sub: "Recommended starting point", pct: 0, done: false },
    { id: "r2", title: "Strengthen your biggest skill gap", sub: "Based on your assessment", pct: 0, done: false },
    { id: "r3", title: "Practice technical interviews", sub: "Prepare for your target roles", pct: 0, done: false },
  ];
  await student.save();
  await User.updateOne({ _id: req.auth.userId }, { $set: { needsAssessment: false } });
  res.json({ ok: true, readiness, skills });
}

// PATCH /api/students/me/roadmap/:stepId
export async function toggleRoadmapStep(req, res) {
  const { stepId } = req.params;
  const student = await Student.findById(req.auth.refId);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const step = student.roadmap.find((s) => s.id === stepId);
  if (!step) return res.status(404).json({ error: "Step not found" });

  step.done = !step.done;
  step.pct = step.done ? 100 : 0;
  await student.save();

  res.json({ id: step.id, done: step.done, pct: step.pct });
}

// POST /api/students/me/simulate  { skills: ["Node.js","AWS"] }
export async function simulate(req, res) {
  const student = await Student.findById(req.auth.refId).lean();
  if (!student) return res.status(404).json({ error: "Student not found" });

  const skillsToAdd = Array.isArray(req.body.skills) ? req.body.skills.filter((skill) => Object.prototype.hasOwnProperty.call(student.skills || {}, skill)) : [];
  const projected = { ...student.skills };
  skillsToAdd.forEach((s) => { projected[s] = Math.min(97, (projected[s] || 0) + 30); });

  const currentReadiness = computeReadiness(student.skills);
  const projectedReadiness = computeReadiness(projected);

  const currentRoles = await rolesForSkills(student.skills);
  const projectedRoles = await rolesForSkills(projected);
  const before = currentRoles.filter((r) => r.match >= 70).length;
  const after = projectedRoles.filter((r) => r.match >= 70).length;
  const bestBefore = currentRoles[0]?.match || 0;
  const bestAfter = projectedRoles[0]?.match || 0;

  res.json({
    readiness: projectedReadiness,
    delta: projectedReadiness - currentReadiness,
    newRoles: Math.max(0, after - before),
    bestMatchBefore: bestBefore,
    bestMatchAfter: bestAfter,
    matchDelta: bestAfter - bestBefore,
  });
}

// POST /api/students/me/skills/progress { skills: ["JavaScript"] }
// Records a completed learning action or project by increasing the selected skills.
export async function applySkillProgress(req, res) {
  const student = await Student.findById(req.auth.refId);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const skills = Array.isArray(req.body.skills)
    ? req.body.skills.filter((skill) => Object.prototype.hasOwnProperty.call(student.skills || {}, skill))
    : [];
  if (!skills.length) return res.status(400).json({ error: "Select at least one skill to update" });

  skills.forEach((skill) => { student.skills[skill] = Math.min(100, (Number(student.skills[skill]) || 0) + 15); });
  student.markModified("skills");
  const readiness = Math.min(100, computeReadiness(student.skills) + evidenceSummary(student).boost);
  const history = Array.isArray(student.history) ? student.history : [];
  history.push({ month: "Now", score: readiness });
  student.history = history.slice(-6);
  await student.save();

  res.json({ skills: student.skills, readiness, updatedSkills: skills });
}

export function getCodingChallenges(req, res) {
  res.json(CODING_CHALLENGES.map(({ answer, ...challenge }) => challenge));
}

export async function getSkillAssessments(req, res) {
  const student = await Student.findById(req.auth.refId, "skillAssessments").lean();
  if (!student) return res.status(404).json({ error: "Student not found" });
  const completed = Object.fromEntries((student.skillAssessments || []).map((item) => [item.skill, item]));
  res.json(SKILL_ASSESSMENTS.map(({ questions, coding, ...assessment }) => ({
    ...assessment,
    questions: questions.map(({ answer, ...item }) => item),
    coding,
    result: completed[assessment.skill] || null,
  })));
}

export async function submitSkillAssessment(req, res) {
  const assessment = SKILL_ASSESSMENTS.find((item) => item.id === req.params.skillId);
  if (!assessment) return res.status(404).json({ error: "Skill assessment not found" });
  const answers = req.body.answers;
  const codingResponses = req.body.codingResponses;
  if (!answers || typeof answers !== "object" || !codingResponses || typeof codingResponses !== "object") {
    return res.status(400).json({ error: "Complete the MCQs and coding problems" });
  }
  if (assessment.questions.some((item) => !Number.isInteger(answers[item.id]) || answers[item.id] < 0 || answers[item.id] >= item.options.length)) {
    return res.status(400).json({ error: "Answer all 10 multiple-choice questions" });
  }
  if (assessment.coding.some((item) => typeof codingResponses[item.id] !== "string" || !codingResponses[item.id].trim())) {
    return res.status(400).json({ error: "Submit both coding problem responses" });
  }
  const correct = assessment.questions.filter((item) => answers[item.id] === item.answer).length;
  const mcqScore = Math.round((correct / assessment.questions.length) * 100);
  const codingScore = Math.round((assessment.coding.filter((item) => codingResponses[item.id].trim()).length / assessment.coding.length) * 20);
  const score = Math.round(mcqScore * 0.8 + codingScore);
  const student = await Student.findById(req.auth.refId);
  if (!student) return res.status(404).json({ error: "Student not found" });
  const result = { skill: assessment.skill, score, mcqScore, codingResponses, completedAt: new Date() };
  student.skillAssessments = (student.skillAssessments || []).filter((item) => item.skill !== assessment.skill);
  student.skillAssessments.push(result);
  student.skills[assessment.skill] = score;
  student.markModified("skills");
  await student.save();
  res.json({ skill: assessment.skill, score, mcqScore, codingScore, completedAt: result.completedAt });
}

export async function getCodingPlatforms(req, res) {
  const student = await Student.findById(req.auth.refId, "codingPlatforms").lean();
  if (!student) return res.status(404).json({ error: "Student not found" });
  const connected = Object.fromEntries((student.codingPlatforms || []).map((item) => [item.platform, item]));
  res.json({ platforms: CODING_PLATFORMS.map(({ hostname, ...platform }) => ({ ...platform, connected: connected[platform.id] || null })) });
}

export async function connectCodingPlatform(req, res) {
  const { platform, url } = req.body;
  const definition = CODING_PLATFORMS.find((item) => item.id === platform);
  if (!definition) return res.status(400).json({ error: "Choose a supported coding platform" });
  let parsedUrl;
  try {
    parsedUrl = new URL(String(url || "").trim());
  } catch {
    return res.status(400).json({ error: "Enter a valid profile URL" });
  }
  if (parsedUrl.protocol !== "https:" || !(parsedUrl.hostname === definition.hostname || parsedUrl.hostname.endsWith(`.${definition.hostname}`)) || parsedUrl.pathname === "/") {
    return res.status(400).json({ error: `Use a public ${definition.name} profile URL` });
  }
  const student = await Student.findById(req.auth.refId);
  if (!student) return res.status(404).json({ error: "Student not found" });
  const connection = { platform: definition.id, url: parsedUrl.toString(), connectedAt: new Date() };
  student.codingPlatforms = (student.codingPlatforms || []).filter((item) => item.platform !== definition.id);
  student.codingPlatforms.push(connection);
  await student.save();
  res.json({ connection });
}

export async function submitCodingChallenge(req, res) {
  const challenge = CODING_CHALLENGES.find((item) => item.id === req.params.challengeId);
  if (!challenge) return res.status(404).json({ error: "Coding challenge not found" });
  const option = Number(req.body.answer);
  if (!Number.isInteger(option) || option < 0 || option >= challenge.options.length) return res.status(400).json({ error: "Choose an answer" });
  const student = await Student.findById(req.auth.refId);
  if (!student) return res.status(404).json({ error: "Student not found" });
  const score = option === challenge.answer ? 100 : 0;
  const results = Array.isArray(student.codingResults) ? student.codingResults.filter((result) => result.challengeId !== challenge.id) : [];
  results.push({ challengeId: challenge.id, title: challenge.title, skill: challenge.skill, score });
  student.codingResults = results;
  await student.save();
  res.json({ challengeId: challenge.id, score, correct: score === 100, explanation: score === 100 ? "Correct. This is a core concept used in interviews." : `Review ${challenge.skill} fundamentals and try again.`, evidence: evidenceSummary(student) });
}

export async function addProject(req, res) {
  const { title, description = "", url, techStack = [] } = req.body;
  if (!title?.trim() || !url?.trim()) return res.status(400).json({ error: "Project title and URL are required" });
  const student = await Student.findById(req.auth.refId);
  if (!student) return res.status(404).json({ error: "Student not found" });
  const evidence = [];
  if (description.trim().length >= 80) evidence.push("Detailed project explanation");
  if (Array.isArray(techStack) && techStack.length >= 2) evidence.push("Multiple technologies documented");
  if (url.startsWith("http")) evidence.push("Working project link supplied");
  const evidenceScore = Math.min(100, evidence.length * 30 + (title.trim().length >= 8 ? 10 : 0));
  student.projects.push({ title: title.trim(), description: description.trim(), url: url.trim(), techStack: Array.isArray(techStack) ? techStack : [], evidenceScore, evidence });
  await student.save();
  res.status(201).json({ project: student.projects[student.projects.length - 1], evidence: evidenceSummary(student) });
}

export async function connectGithub(req, res) {
  const { url } = req.body;
  if (!url?.trim()) return res.status(400).json({ error: "GitHub repository URL is required" });
  const student = await Student.findById(req.auth.refId);
  if (!student) return res.status(404).json({ error: "Student not found" });
  try {
    const analysis = await inspectGithub(url.trim());
    student.github = { ...analysis, connectedAt: new Date() };
    await student.save();
    res.json({ github: student.github, evidence: evidenceSummary(student) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function addInterviewEvidence(req, res) {
  const { role = "General interview", score, feedback = "" } = req.body;
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) return res.status(400).json({ error: "Interview score must be between 0 and 100" });
  const student = await Student.findById(req.auth.refId);
  if (!student) return res.status(404).json({ error: "Student not found" });
  const interview = {
    role: String(role).trim() || "General interview",
    score: Math.round(numericScore),
    feedback: String(feedback).trim(),
    completedAt: new Date(),
  };
  const result = await Student.updateOne(
    { _id: student._id },
    { $push: { interviews: interview } },
    { runValidators: true },
  );
  if (!result.matchedCount) return res.status(404).json({ error: "Student not found" });
  student.interviews.push(interview);
  res.status(201).json({ interview, evidence: evidenceSummary(student) });
}
