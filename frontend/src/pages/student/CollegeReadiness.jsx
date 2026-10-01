import React from "react";
import { ArrowUpRight, CheckCircle2, GraduationCap, TrendingUp } from "lucide-react";
import { C } from "../../theme.js";

const readinessPatterns = [
  {
    title: "Skills are now a stronger signal than GPA alone",
    detail: "Recruiters increasingly value projects, internships, and practical problem solving over a single academic score.",
  },
  {
    title: "Interview readiness is tied to demonstrating depth",
    detail: "Students who can explain choices, trade-offs, and outcomes in projects stand out more than those with only theoretical knowledge.",
  },
  {
    title: "High-demand tools appear repeatedly in campus hiring",
    detail: "Topics like JavaScript, APIs, data analysis, cloud basics, security practices, and product thinking recur in assessments and interviews.",
  },
];

const focusAreas = [
  "SQL and data querying",
  "REST APIs and backend fundamentals",
  "System design basics",
  "Cloud and DevOps workflows",
  "Machine learning fundamentals",
  "Communication and case interviews",
  "Projects with measurable outcomes",
  "Internship experience and portfolio proof",
];

export default function CollegeReadiness({ profile }) {
  const chosenFields = profile?.fields || [];

  return (
    <div className="tool-page" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className="tool-heading">
        <div>
          <div className="tool-kicker">College readiness</div>
          <h1>Focus on what matters for campus hiring</h1>
          <p>Use this view to spot the practical patterns that recruiters care about most in recent hiring cycles.</p>
        </div>
        <GraduationCap size={32} color={C.green700} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 18 }}>
        {readinessPatterns.map((item) => (
          <div key={item.title} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.green700, fontWeight: 700, marginBottom: 10 }}>
              <TrendingUp size={16} />
              Pattern
            </div>
            <div style={{ fontWeight: 700, color: C.ink, marginBottom: 8 }}>{item.title}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: C.sub }}>{item.detail}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: 20 }}>
          <div style={{ fontWeight: 800, color: C.ink, marginBottom: 14 }}>Priority preparation areas</div>
          <div style={{ display: "grid", gap: 12 }}>
            {focusAreas.map((area) => (
              <div key={area} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", background: "#F6FAF8" }}>
                <CheckCircle2 size={16} color={C.green700} />
                <span style={{ color: C.ink, fontWeight: 500 }}>{area}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: 20 }}>
          <div style={{ fontWeight: 800, color: C.ink, marginBottom: 10 }}>Selected interest fields</div>
          {chosenFields.length === 0 ? (
            <div style={{ color: C.sub, fontSize: 14 }}>Your selected fields will appear here after you complete the orientation flow.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {chosenFields.map((entry) => (
                <div key={`${entry.field}-${entry.months}-${entry.score}`} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", background: "#F6FAF8" }}>
                  <div style={{ fontWeight: 700, color: C.ink }}>{entry.field}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 13, color: C.sub }}>
                    <span>{entry.months} months</span>
                    <span>{entry.score || 0}% score</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 22, background: "linear-gradient(135deg, rgba(8,127,91,0.08), rgba(13, 113, 110, 0.04))", border: `1px solid ${C.border}`, borderRadius: 18, padding: 18 }}>
        <div style={{ fontWeight: 700, color: C.ink, marginBottom: 8 }}>Decision support</div>
        <div style={{ color: C.sub, lineHeight: 1.7 }}>
          Students can prioritize the right mix of technical depth, projects, internships, and communication practice instead of chasing only C.G.P.A. This keeps academic decisions aligned with the kinds of roles recruiters actually hire for.
        </div>
        <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, border: "none", borderRadius: 12, background: C.green900, color: "#fff", padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
          Review readiness <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}
