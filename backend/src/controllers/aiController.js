import dns from "node:dns";
import Student from "../models/Student.js";
import Company from "../models/Company.js";
import { computeMatch } from "../utils/scoring.js";

// Some Windows networks advertise IPv6 for Google APIs but cannot route it reliably.
// Prefer IPv4 so Gemini requests do not hang until the timeout and fall back unnecessarily.
dns.setDefaultResultOrder("ipv4first");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_URL = (key) => `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

function buildSystemPrompt(student, roles, language) {
  const skills = student.skills && typeof student.skills === "object" ? student.skills : {};
  const skillLines = Object.entries(skills)
    .sort((a, b) => b[1] - a[1])
    .map(([sk, v]) => `${sk}: ${v}%`)
    .join(", ");

  const roleLines = roles.slice(0, 4)
    .map((r) => `${r.title} at ${r.company} (${r.match}% match, ${r.pkg})`)
    .join("; ");

  const roadmapLines = (Array.isArray(student.roadmap) ? student.roadmap : [])
    .map((s) => `${s.title} — ${s.done ? "done" : `${s.pct}% complete`}`)
    .join("; ");

  const languageInstruction = language === "hinglish"
    ? "Reply in Hinglish — a natural mix of Hindi and English written in Latin script (roman letters), the way Indian students actually text each other. Keep it casual and friendly, not a literal Hindi translation."
    : "Reply in plain, friendly English.";

  return `You are Pathway AI, a career-readiness copilot embedded in a student's dashboard.
You are talking to ${student.name}, a ${student.department} student.

Their real data (use this to ground your answers — never invent skills, companies, or numbers that aren't here):
- Skills: ${skillLines}
- Overall readiness score: computed from these skills
- Roles they currently match: ${roleLines || "none loaded"}
- Their learning roadmap: ${roadmapLines}

${languageInstruction}

Answer whatever the student actually asks — career advice, general study questions, or anything
else — helpfully and directly. When a question relates to their career readiness, skills, or job
matches, ground your answer in the real data above instead of generic advice. Keep answers
conversational and concise (roughly 2-5 sentences) unless the question genuinely needs more.`;
}

async function callGemini(systemPrompt, question) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS) || 30000;
  const signal = AbortSignal.timeout(timeoutMs);
  const res = await fetch(GEMINI_URL(apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: question }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
    }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!text.trim()) throw new Error("Gemini returned an empty response");
  return text.trim();
}

// Safety-net only — used if GEMINI_API_KEY is missing or the API call fails, so the assistant
// never just goes silent. This is NOT the primary experience anymore.
function fallbackReply(question, skills, assessmentComplete) {
  const availableSkills = skills && typeof skills === "object" ? Object.entries(skills) : [];
  if (!assessmentComplete || availableSkills.length === 0) {
    return "Your skill profile is not ready yet. Complete the assessment first, then I can give you personalized advice based on your actual strengths and gaps.";
  }

  const weakest = availableSkills.sort(([, first], [, second]) => Number(first) - Number(second))[0];
  return `The AI service is temporarily unavailable, so this is a local recommendation based on your assessment. Your current lowest skill is ${weakest[0]} at ${weakest[1]}%. Practice one focused exercise in that area today and reassess your progress after it.`;
}

// POST /api/ai/ask  { question, language: "english" | "hinglish" }
export async function ask(req, res) {
  const { question, language = "english" } = req.body;
  if (typeof question !== "string" || !question.trim()) return res.status(400).json({ error: "question is required" });

  const student = await Student.findById(req.auth.refId).lean();
  if (!student) return res.status(404).json({ error: "Student not found" });

  const companies = await Company.find().lean();
  const roles = companies
    .flatMap((c) => (Array.isArray(c.roles) ? c.roles : []).map((r) => ({ title: r.title, company: c.name, pkg: r.packageRange, match: computeMatch(student.skills, r.requiredSkills) })))
    .sort((a, b) => b.match - a.match);

  try {
    const systemPrompt = buildSystemPrompt(student, roles, language);
    const reply = await callGemini(systemPrompt, question);
    res.json({ reply, source: "gemini" });
  } catch (err) {
    console.error("Gemini call failed, using fallback:", err.message);
    res.json({ reply: fallbackReply(question, student.skills, student.assessmentComplete), source: "fallback" });
  }
}
