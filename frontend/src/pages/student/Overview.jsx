import React, { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Lightbulb, CheckCircle2, RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";
import Bar from "../../components/Bar.jsx";
import Avatar from "../../components/Avatar.jsx";
import RadialGauge from "../../components/RadialGauge.jsx";

export default function StudentOverview({ onOpenAssistant }) {
  const [data, setData] = useState(null);
  const [simSkills, setSimSkills] = useState([]);
  const [simResult, setSimResult] = useState(null);

  const load = () => api.get("/students/me").then(setData);
  useEffect(() => { load(); }, []);

  if (!data) return <div style={{ color: C.sub }}>Loading your dashboard…</div>;

  const skills = data.skills || {};
  const history = data.history || [];
  const roadmap = data.roadmap || [];
  const strongest = Object.entries(skills).sort((a, b) => b[1] - a[1])[0] || ["No skills recorded", 0];
  const chartData = history.map((h) => ({ month: h.month, score: h.score }));
  const latestScore = history[history.length - 1]?.score || data.readiness;
  const previousScore = history[history.length - 2]?.score || latestScore;
  const simCandidates = Object.keys(skills).filter((skill) => (skills[skill] || 0) < 75);

  const toggleStep = async (stepId) => {
    const updated = await api.patch(`/students/me/roadmap/${stepId}`);
    setData((cur) => ({
      ...cur,
      roadmap: cur.roadmap.map((r) => r.id === stepId ? { ...r, ...updated } : r),
    }));
  };

  const runSimulation = async () => {
    const result = await api.post("/students/me/simulate", { skills: simSkills });
    setSimResult(result);
  };

  const applyProgress = async () => {
    const result = await api.post("/students/me/skills/progress", { skills: simSkills });
    const refreshed = await api.get("/students/me");
    setData(refreshed);
    setSimSkills([]);
    setSimResult(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ color: C.green700, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Student workspace</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>Good morning, {data.name.split(" ")[0]}</div>
          <div style={{ color: C.sub, marginTop: 4, fontSize: 15 }}>Here's your path to becoming placement-ready.</div>
        </div>
        <button onClick={onOpenAssistant} style={{
          display: "flex", alignItems: "center", gap: 8, background: C.green900, color: "#fff", border: "none",
          borderRadius: 9, padding: "10px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}><Sparkles size={16} /> Ask pathway AI</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, marginBottom: 18 }}>
        <div style={{ background: `linear-gradient(135deg, ${C.green900}, ${C.green700})`, borderRadius: 14, padding: 26, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ opacity: 0.85, fontSize: 13.5, marginBottom: 8 }}>Your readiness score</div>
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>Tracking toward<br />placement-ready.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 22, fontSize: 13.5, opacity: 0.9 }}>
              <TrendingUp size={15} /> Up {Math.max(0, latestScore - previousScore)} points since your last assessment
            </div>
          </div>
          <RadialGauge value={data.readiness} />
        </div>
        <Card>
          <div style={{ color: C.sub, fontSize: 13.5, marginBottom: 6 }}>Strongest skill</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, marginBottom: 12 }}>{strongest[0]}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>{strongest[1]}<span style={{ fontSize: 14, color: C.sub, fontWeight: 500 }}>/100</span></div>
          <div style={{ height: 8, background: C.green100, borderRadius: 999, margin: "10px 0" }}>
            <div style={{ width: `${strongest[1]}%`, height: "100%", background: C.green600, borderRadius: 999 }} />
          </div>
          <div style={{ fontSize: 12.5, color: C.sub }}>{data.department}</div>
        </Card>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.ink }}>Your placement momentum</div>
            <div style={{ fontSize: 13, color: C.sub }}>Your readiness score over the last 6 months</div>
          </div>
        </div>
        <div style={{ width: "100%", height: 180 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="momentum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.green600} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.green600} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={C.border} />
              <XAxis dataKey="month" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke={C.green700} strokeWidth={2.5} fill="url(#momentum)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 2 }}>Skill gaps</div>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 18 }}>Most requested by your target roles</div>
          {Object.entries(skills).sort(([, first], [, second]) => first - second).slice(0, 5).map(([skill, value]) => <Bar key={skill} label={skill} value={value} />)}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 2 }}>Roles that match you</div>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>Based on your skills, goals, and placement data</div>
          {data.roles.slice(0, 3).map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar letter={r.company[0]} color={r.color} size={34} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: C.ink }}>{r.title}</div>
                  <div style={{ fontSize: 12.5, color: C.sub }}>{r.company} · {r.pkg}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: C.green700, fontSize: 15 }}>{r.match}%</div>
                <div style={{ fontSize: 11, color: C.sub }}>match</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.ink }}>Your next best steps</div>
          <Lightbulb size={17} color={C.amber} />
        </div>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 18 }}>Small actions, meaningful progress</div>
        {roadmap.map((step, i) => (
          <div key={step.id} style={{ padding: "14px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => toggleStep(step.id)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: 1 }}>
                  {step.done ? <CheckCircle2 size={20} color={C.green600} /> :
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.cardAlt, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.sub }}>{i + 1}</div>}
                </button>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>{step.title}</div>
                  <div style={{ fontSize: 12.5, color: C.sub }}>{step.sub}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>{step.pct}%</div>
            </div>
            <div style={{ height: 6, background: C.green100, borderRadius: 999, marginTop: 10, marginLeft: 32 }}>
              <div style={{ width: `${step.pct}%`, height: "100%", background: step.pct === 100 ? C.green600 : C.amber, borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.ink }}>What-if simulator <span style={{ background: C.green100, color: C.green700, fontSize: 11, padding: "3px 8px", borderRadius: 999, marginLeft: 8, fontWeight: 600 }}>AI powered</span></div>
          <button onClick={() => { setSimSkills([]); setSimResult(null); }} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: C.sub, fontSize: 13, cursor: "pointer" }}><RotateCcw size={13} /> Reset</button>
        </div>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 18 }}>See how learning a new skill could change your job matches — this calls the real /simulate endpoint.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 10 }}>Add skills to simulate</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {simCandidates.map((s) => {
                const active = simSkills.includes(s);
                return (
                  <button key={s} onClick={() => setSimSkills((cur) => active ? cur.filter((x) => x !== s) : [...cur, s])} style={{
                    display: "flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "8px 14px", fontSize: 13.5, cursor: "pointer",
                    border: `1px solid ${active ? C.green600 : C.border}`, background: active ? C.green900 : "transparent", color: active ? "#fff" : C.ink, fontWeight: 500,
                  }}>{active && "✓ "}{s}</button>
                );
              })}
            </div>
          </div>
          <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 12.5, color: C.sub, marginBottom: 6 }}>Projected match score</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>
              {simResult ? simResult.readiness : data.readiness}%
              <span style={{ fontSize: 13, color: C.green600, fontWeight: 600, marginLeft: 8 }}>+{simResult ? simResult.delta : 0} pts</span>
            </div>
            <button onClick={runSimulation} disabled={simSkills.length === 0} style={{
              marginTop: 12, width: "100%", background: simSkills.length ? C.green700 : C.border, color: "#fff", border: "none",
              borderRadius: 8, padding: "9px 0", fontWeight: 600, fontSize: 14, cursor: simSkills.length ? "pointer" : "not-allowed",
            }}>Simulate</button>
            {simResult && <>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 10 }}>
                {simResult.newRoles > 0 ? `You could qualify for ${simResult.newRoles} more role${simResult.newRoles === 1 ? "" : "s"}.` : `Your best role match could improve by ${simResult.matchDelta} points (${simResult.bestMatchBefore}% to ${simResult.bestMatchAfter}%).`}
              </div>
              <button onClick={applyProgress} style={{ marginTop: 10, width: "100%", background: C.green900, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Apply learning progress</button>
            </>}
          </div>
        </div>
      </Card>
    </div>
  );
}
