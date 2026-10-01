import React, { useState } from "react";
import { GraduationCap, Target } from "lucide-react";
import { C } from "../theme.js";
import StudentAuth from "./StudentAuth.jsx";

export default function SignIn() {
  const [role, setRole] = useState("student");

  return (
    <main className="signin-shell">
      <div className="signin-orbit signin-orbit-one" />
      <div className="signin-orbit signin-orbit-two" />
      <div className="signin-layout">
        <section className="signin-story">
          <div className="brand-mark"><Target size={19} strokeWidth={2.5} /></div>
          <div className="brand-name">pathway<span>.</span></div>
          <div className="story-kicker">Career intelligence, made human</div>
          <h1>Turn potential<br /><em>into momentum.</em></h1>
          <p className="story-copy">One clear view of the skills, signals, and next steps that move people toward meaningful work.</p>
          <div className="story-meta"><span className="meta-dot" /> Trusted across every connected campus</div>
        </section>

        <section className="signin-panel">
          <div className="panel-topline"><span>WELCOME TO PATHWAY</span><span className="panel-index">01 / 02</span></div>
          <div className="panel-heading">Student<br /><strong>workspace.</strong></div>
          <div className="panel-subheading">Start with your profile and move into the right skill path.</div>

          {role === "student" && (
            <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.green100 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap size={20} color={C.green700} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: C.ink }}>Student access</div>
                <div style={{ fontSize: 12, color: C.sub }}>Create an account or sign in to personalize your roadmap.</div>
              </div>
            </div>
          )}

          <StudentAuth onBack={() => setRole("student")} />

          <div className="signin-footer"><span>DEMO ACCESS</span> Every account uses <strong>demo1234</strong></div>
        </section>
      </div>
    </main>
  );
}
