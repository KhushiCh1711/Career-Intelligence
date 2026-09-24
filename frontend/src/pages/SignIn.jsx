import React, { useEffect, useState } from "react";
import { GraduationCap, Building2, Briefcase, Target } from "lucide-react";
import { C, FONT } from "../theme.js";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "../components/Avatar.jsx";
import StudentAuth from "./StudentAuth.jsx";

const roleOptions = [
  { id: "student", label: "Student", icon: GraduationCap, desc: "Track your readiness & get AI guidance" },
  { id: "university", label: "University", icon: Building2, desc: "See how ready your batch is" },
  { id: "company", label: "Company", icon: Briefcase, desc: "Find and shortlist talent across campuses" },
];

export default function SignIn() {
  const { login } = useAuth();
  const [role, setRole] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [collegeId, setCollegeId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
  api.get("/auth/colleges").then(setColleges).catch(e => setError(e.message));
  api.get("/auth/companies").then(setCompanies).catch(e => setError(e.message));
}, []);

  useEffect(() => {
    if (role === "student" && collegeId) {
      api.get(`/auth/colleges/${collegeId}/students`).then(setStudents);
      setSelectedStudent(null);
    }
  }, [role, collegeId]);

  // Demo convenience only: every seeded account shares the password "demo1234".
  // In a real deployment, students/admins would type their own credentials here.
  const doLogin = async (username) => {
    setBusy(true); setError("");
    try {
      await login(username, "demo1234");
    } catch (e) {
      setError(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

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
        <div className="panel-topline"><span>WELCOME TO PATHWAY</span><span className="panel-index">01 / 03</span></div>
        <div className="panel-heading">Choose your<br /><strong>workspace.</strong></div>
        <div className="panel-subheading">Start where your work makes the biggest difference.</div>

        {error && <div className="signin-error">{error}</div>}

        {!role && (
          <div className="role-list">
            {roleOptions.map((r) => (
              <button className="role-option" key={r.id} onClick={() => setRole(r.id)}>
                <div className="role-icon">
                  <r.icon size={20} strokeWidth={1.8} />
                </div>
                <div className="role-copy">
                  <strong>{r.label}</strong>
                  <small>{r.desc}</small>
                </div>
                <span className="role-arrow">↗</span>
              </button>
            ))}
          </div>
        )}

        {role === "student" && false && (
          <>
            <button onClick={() => setRole(null)} style={{ background: "none", border: "none", color: C.sub, fontSize: 13, cursor: "pointer", marginBottom: 16 }}>← Back</button>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Choose your college</div>
            <select value={collegeId || ""} onChange={(e) => setCollegeId(e.target.value)} style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, marginBottom: 16, fontFamily: FONT }}>
              {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Choose a student profile</div>
            <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 16 }}>
              {students.map((s) => (
                <button key={s.id} onClick={() => setSelectedStudent(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", border: `1px solid ${selectedStudent === s.id ? C.green600 : C.border}`,
                  background: selectedStudent === s.id ? C.green100 : "transparent", borderRadius: 9, padding: 10, marginBottom: 6, cursor: "pointer",
                }}>
                  <Avatar letter={s.name[0]} color={s.avatar_color} size={28} />
                  <div style={{ fontSize: 13.5, color: C.ink, fontWeight: 500 }}>{s.name}</div>
                </button>
              ))}
            </div>
            <button disabled={!selectedStudent || busy} onClick={() => doLogin(`${selectedStudent}@student.edu`)}
              style={{ width: "100%", background: selectedStudent ? C.green900 : C.border, color: "#fff", border: "none", borderRadius: 9, padding: "12px 0", fontWeight: 600, fontSize: 14.5, cursor: selectedStudent ? "pointer" : "not-allowed" }}>
              Enter workspace
            </button>
          </>
        )}

        {role === "student" && <StudentAuth onBack={() => setRole(null)} />}

        {role === "university" && (
          <div className="workspace-form">
            <button onClick={() => setRole(null)} style={{ background: "none", border: "none", color: C.sub, fontSize: 13, cursor: "pointer", marginBottom: 16 }}>← Back</button>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Which college do you administer?</div>
            <select value={collegeId || ""} onChange={(event) => setCollegeId(event.target.value)} style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, marginBottom: 16, fontFamily: FONT, background: "#fff", color: C.ink }}>
              <option value="" style={{ color: C.sub, background: "#fff" }}>Select a university</option>
              {colleges.map((college) => <option style={{ color: C.ink, background: "#fff" }} key={college.id} value={college.id}>{college.name || college.tag || college.id}</option>)}
            </select>
            <button className="workspace-button" disabled={busy || !colleges.find((college) => college.id === collegeId)?.username} onClick={() => doLogin(colleges.find((college) => college.id === collegeId)?.username)}>
              Enter workspace <span>↗</span>
            </button>
          </div>
        )}

        {role === "company" && (
          <div className="workspace-form">
            <button onClick={() => setRole(null)} style={{ background: "none", border: "none", color: C.sub, fontSize: 13, cursor: "pointer", marginBottom: 16 }}>← Back</button>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Which company are you hiring for?</div>
            <select value={companyId || ""} onChange={(event) => setCompanyId(event.target.value)} style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, marginBottom: 16, fontFamily: FONT, background: "#fff", color: C.ink }}>
              <option value="" style={{ color: C.sub, background: "#fff" }}>Select a company</option>
              {companies.map((company) => <option style={{ color: C.ink, background: "#fff" }} key={company.id} value={company.id}>{company.name}</option>)}
            </select>
            <button className="workspace-button" disabled={busy || !companies.find((company) => company.id === companyId)?.username} onClick={() => doLogin(companies.find((company) => company.id === companyId)?.username)}>
              Enter workspace <span>↗</span>
            </button>
          </div>
        )}

        <div className="signin-footer"><span>DEMO ACCESS</span> Every account uses <strong>demo1234</strong></div>
        </section>
      </div>
    </main>
  );
}
