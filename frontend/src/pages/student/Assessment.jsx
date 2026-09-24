import React, { useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { C, FONT } from "../../theme.js";
import { api } from "../../api/client.js";

const QUESTIONS = [
  { id: "q1", skill: "JavaScript", prompt: "What does a JavaScript closure allow a function to do?", options: ["Access variables from its outer scope", "Run only once", "Convert code to HTML", "Connect directly to a database"], answer: 0 },
  { id: "q2", skill: "React", prompt: "Which React hook is used to store state in a function component?", options: ["useEffect", "useState", "useMemo", "useRef"], answer: 1 },
  { id: "q3", skill: "Node.js", prompt: "Which built-in Node.js module is commonly used to create an HTTP server?", options: ["http", "path", "events", "crypto"], answer: 0 },
  { id: "q4", skill: "SQL", prompt: "Which SQL clause filters rows after selecting from a table?", options: ["ORDER BY", "GROUP BY", "WHERE", "CREATE"], answer: 2 },
  { id: "q5", skill: "System Design", prompt: "What is the main purpose of a load balancer?", options: ["Store passwords", "Distribute traffic across servers", "Compile JavaScript", "Design database tables"], answer: 1 },
  { id: "q6", skill: "Python", prompt: "Which Python data type stores key-value pairs?", options: ["list", "tuple", "set", "dict"], answer: 3 },
  { id: "q7", skill: "TypeScript", prompt: "What does TypeScript add to JavaScript?", options: ["Static type checking", "A new database", "CSS styling", "A web server"], answer: 0 },
  { id: "q8", skill: "AWS", prompt: "Which AWS service is designed to store files as objects?", options: ["EC2", "S3", "Lambda", "RDS"], answer: 1 },
  { id: "q9", skill: "JavaScript", prompt: "What does an async function return?", options: ["A Promise", "Only a string", "A database connection", "A CSS rule"], answer: 0 },
  { id: "q10", skill: "React", prompt: "Why is a key prop used when rendering a React list?", options: ["To hide the list", "To help React identify items between renders", "To encrypt the item", "To call an API"], answer: 1 },
];

export default function Assessment({ onComplete }) {
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const answered = QUESTIONS.filter((question) => answers[question.id] !== undefined).length;
  async function submit(event) {
    event.preventDefault();
    if (answered !== QUESTIONS.length) return setError("Please answer every question so we can calculate your starting point.");
    setBusy(true); setError("");
    try { await api.post("/students/me/assessment", { answers }); onComplete(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, padding: "48px 24px" }}><form onSubmit={submit} style={{ maxWidth: 720, margin: "0 auto", background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px clamp(22px, 5vw, 52px)" }}>
    <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 24 }}><div style={{ width: 42, height: 42, borderRadius: 11, background: C.green100, display: "flex", alignItems: "center", justifyContent: "center" }}><ClipboardCheck size={21} color={C.green700} /></div><div><div style={{ color: C.ink, fontWeight: 700, fontSize: 21 }}>Full-stack knowledge test</div><div style={{ color: C.sub, fontSize: 13 }}>10 multiple-choice questions to estimate your starting skill levels.</div></div></div>
    <div style={{ height: 7, background: C.green100, borderRadius: 8, marginBottom: 28 }}><div style={{ width: `${(answered / QUESTIONS.length) * 100}%`, height: "100%", background: C.green600, borderRadius: 8, transition: "width .2s" }} /></div>
    {QUESTIONS.map((question, index) => <fieldset key={question.id} style={{ border: 0, borderTop: `1px solid ${C.border}`, padding: "22px 0 4px", margin: 0 }}><legend style={{ color: C.ink, fontWeight: 650, fontSize: 15, padding: 0, marginBottom: 12 }}>{index + 1}. {question.prompt}<span style={{ display: "block", color: C.green700, fontSize: 12, marginTop: 4 }}>{question.skill}</span></legend><div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>{question.options.map((option, optionIndex) => <label key={option} style={{ border: `1px solid ${answers[question.id] === optionIndex ? C.green600 : C.border}`, background: answers[question.id] === optionIndex ? C.green100 : "transparent", borderRadius: 8, padding: "11px 9px", color: C.ink, fontSize: 12, cursor: "pointer" }}><input type="radio" name={question.id} value={optionIndex} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} style={{ position: "absolute", opacity: 0 }} />{answers[question.id] === optionIndex && <CheckCircle2 size={13} color={C.green700} style={{ verticalAlign: "middle", marginRight: 5 }} />}{option}</label>)}</div></fieldset>)}
    {error && <div style={{ color: C.red, background: C.redBg, borderRadius: 8, padding: "9px 12px", marginTop: 18, fontSize: 13 }}>{error}</div>}<button disabled={busy} style={{ width: "100%", marginTop: 24, border: 0, borderRadius: 9, padding: "13px 0", background: busy ? C.border : C.green900, color: "#fff", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>{busy ? "Calculating your profile…" : "Finish assessment"}</button>
  </form></div>;
}
