import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";
import Avatar from "../../components/Avatar.jsx";

export default function StudentInsights() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/students/me").then(setData); }, []);
  if (!data) return <div style={{ color: C.sub }}>Loading…</div>;

  const chartData = data.history.map((h) => ({ month: h.month, score: h.score }));
  const report = { interviewReady: false, interviewReadyRoles: [], gapSkills: [], nextRole: null, companyReadiness: [], ...(data.readinessReport || {}) };

  return (
    <div>
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 2 }}>Placement insights</div>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 18 }}>How your readiness has trended</div>
        <div style={{ width: "100%", height: 180 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="momentum2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.green600} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.green600} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={C.border} />
              <XAxis dataKey="month" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke={C.green700} strokeWidth={2.5} fill="url(#momentum2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card style={{ marginBottom: 18, background: report.interviewReady ? "linear-gradient(135deg, #174A3B, #087F5B)" : "rgba(242, 246, 241, .92)", color: report.interviewReady ? "#F2F6F1" : C.ink }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", opacity: .72 }}>Interview readiness</div>
            <div style={{ fontSize: 25, fontWeight: 800, marginTop: 8 }}>{report.interviewReady ? "You are ready to interview" : "Keep building toward interview-ready"}</div>
            <div style={{ fontSize: 13, opacity: .78, marginTop: 6 }}>{report.interviewReady ? "Your current profile matches these roles at or above the 70% readiness threshold." : "Close the gaps below to unlock your closest role matches."}</div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>{report.interviewReadyRoles.length}</div>
        </div>
        {report.interviewReadyRoles.length > 0 ? report.interviewReadyRoles.map((role) => (
          <div key={`${role.company}-${role.title}`} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,.2)", fontSize: 13 }}>
            <span>{role.company} · {role.title}</span><strong>{role.match}% match</strong>
          </div>
        )) : <>
          {report.nextRole && <div style={{ fontSize: 13, marginBottom: 12 }}><strong>Closest role:</strong> {report.nextRole.company} · {report.nextRole.title} at {report.nextRole.match}%</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{report.gapSkills.map((gap) => <span key={gap.skill} style={{ padding: "7px 9px", borderRadius: 4, background: "#E2F2E8", color: C.ink, fontSize: 12 }}>{gap.skill}: {gap.current}% / {gap.target}%</span>)}</div>
        </>}
      </Card>
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 4 }}>Company-by-company readiness</div>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>A role is interview-ready at 70% match. Gaps show the exact target still needed.</div>
        <div className="company-readiness-table">{report.companyReadiness.map((role) => <div className="company-readiness-row" key={`${role.company}-${role.title}`}><div><strong>{role.company}</strong><div className="tool-muted">{role.title} · {role.pkg}</div>{!role.interviewReady && <div className="readiness-gaps">{role.gaps.slice(0, 3).map((gap) => <span key={gap.skill}>{gap.skill} {gap.current}/{gap.target}</span>)}</div>}</div><div className={role.interviewReady ? "ready-badge" : "match-badge"}>{role.match}% {role.interviewReady ? "Ready" : "match"}</div></div>)}</div>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 16 }}>Every role you match</div>
        {data.roles.map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar letter={r.company[0]} color={r.color} size={32} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: C.ink }}>{r.title}</div>
                <div style={{ fontSize: 12.5, color: C.sub }}>{r.company} · {r.pkg}</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, color: C.green700 }}>{r.match}%</div>
          </div>
        ))}
      </Card>
    </div>
  );
}
