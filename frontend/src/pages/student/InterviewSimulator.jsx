import React, { useEffect, useState } from "react";
import { MessageSquare, Mic2 } from "lucide-react";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";

const prompts = ["Tell me about a project you are proud of.", "What was the hardest technical decision you made?", "How would you improve the project if you had another week?"];
export default function InterviewSimulator() {
  const [data, setData] = useState(null); const [role, setRole] = useState(""); const [score, setScore] = useState(70); const [feedback, setFeedback] = useState(""); const [saved, setSaved] = useState(false);
  useEffect(() => { api.get("/students/me").then(setData); }, []);
  const save = async (event) => { event.preventDefault(); await api.post("/students/me/interviews", { role: role || "General interview", score, feedback }); setSaved(true); };
  if (!data) return <div style={{ color: C.sub }}>Loading interview simulator...</div>;
  return <div className="tool-page"><div className="tool-heading"><div><div className="tool-kicker">Practice room</div><h1>Interview simulator</h1><p>Practice the questions employers ask about your work, decisions, and communication.</p></div><Mic2 size={32} color={C.green700} /></div>
    <div className="evidence-layout"><Card><h2>Project interview round</h2>{prompts.map((prompt, index) => <div className="prompt-row" key={prompt}><span>0{index + 1}</span>{prompt}</div>)}<p className="tool-muted">Answer out loud or record your response separately, then score the round honestly below.</p></Card><Card><form className="tool-form" onSubmit={save}><label>Target role<input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Frontend Engineer" /></label><label>Self-assessed score: <strong>{score}%</strong><input type="range" min="0" max="100" value={score} onChange={(event) => setScore(Number(event.target.value))} /></label><textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="What went well? What should you improve?" rows="5" /><button className="primary-tool-button"><MessageSquare size={15} /> Save interview evidence</button>{saved && <div className="result-note">Interview evidence saved and included in readiness.</div>}</form></Card></div></div>;
}
