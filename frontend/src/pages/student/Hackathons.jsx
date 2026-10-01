import React from "react";
import { BellRing, CalendarDays, ExternalLink, Trophy } from "lucide-react";
import { C } from "../../theme.js";

const alerts = [
  {
    platform: "Hackerrank",
    name: "CodeSprint 2026",
    date: "18 Oct 2026",
    mode: "Remote",
    highlight: "AI + product engineering challenge",
  },
  {
    platform: "Google Developer Group",
    name: "Build with Cloud",
    date: "22 Oct 2026",
    mode: "Hybrid",
    highlight: "Hands-on workshop on cloud deployments",
  },
  {
    platform: "Microsoft Reactor",
    name: "Secure by Design",
    date: "28 Oct 2026",
    mode: "Online",
    highlight: "Cybersecurity and application hardening session",
  },
  {
    platform: "NVIDIA Developer",
    name: "AI/ML Lab Bootcamp",
    date: "03 Nov 2026",
    mode: "Remote",
    highlight: "Model building and practical ML workflows",
  },
];

export default function HackathonsPage() {
  return (
    <div className="tool-page" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className="tool-heading">
        <div>
          <div className="tool-kicker">Opportunities feed</div>
          <h1>Hackathons and workshop alerts</h1>
          <p>Track the latest competitions, student workshops, and practical learning events that can sharpen your readiness.</p>
        </div>
        <BellRing size={30} color={C.green700} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, marginTop: 18 }}>
        {alerts.map((item) => (
          <div key={`${item.platform}-${item.name}`} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ color: C.green700, fontWeight: 700 }}>{item.platform}</div>
              <div style={{ background: C.green100, color: C.green700, borderRadius: 999, padding: "5px 8px", fontSize: 11, fontWeight: 700 }}>{item.mode}</div>
            </div>

            <div style={{ fontWeight: 800, color: C.ink, marginTop: 14, marginBottom: 8 }}>{item.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.sub, fontSize: 14, marginBottom: 8 }}>
              <CalendarDays size={14} />
              {item.date}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.sub, fontSize: 14, marginBottom: 10 }}>
              <Trophy size={14} />
              {item.highlight}
            </div>
            <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 10, background: C.green900, color: "#fff", padding: "10px 12px", fontWeight: 700, cursor: "pointer" }}>
              View details <ExternalLink size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
