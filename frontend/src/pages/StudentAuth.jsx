import React, { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { C, FONT } from "../theme.js";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = { username: "", email: "", password: "", confirmPassword: "", name: "", dateOfBirth: "", age: "", degree: "", stream: "", collegeId: "" };
const inputStyle = { width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: FONT, color: C.ink, background: "#fff" };

export default function StudentAuth({ onBack }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [colleges, setColleges] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/auth/colleges").then(setColleges).catch((e) => setError(e.message)); }, []);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (mode === "register" && form.password !== form.confirmPassword) return setError("Passwords do not match");
    setBusy(true);
    try {
      if (mode === "login") await login(form.username.trim().toLowerCase(), form.password);
      else await register(form);
    } catch (e) {
      setError(e.message || "Unable to continue");
    } finally { setBusy(false); }
  }

  return (
    <div className="student-auth-form">
      <form className="student-auth-card" onSubmit={submit}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: C.sub, padding: 0, cursor: "pointer", display: "flex", gap: 6, alignItems: "center", fontSize: 13, marginBottom: 20 }}><ArrowLeft size={15} /> Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: C.green100, display: "flex", alignItems: "center", justifyContent: "center" }}><UserRoundPlus size={19} color={C.green700} /></div>
          <div><div style={{ fontWeight: 700, fontSize: 19, color: C.ink }}>{mode === "login" ? "Welcome back" : "Create your student account"}</div><div style={{ fontSize: 13, color: C.sub }}>{mode === "login" ? "Sign in to continue your career journey." : "Your answers help us personalize your pathway."}</div></div>
        </div>
        {error && <div style={{ background: C.redBg, color: C.red, borderRadius: 8, padding: "9px 12px", fontSize: 13, margin: "16px 0" }}>{error}</div>}
        <div style={{ display: "grid", gap: 13, marginTop: 22 }}>
          {mode === "register" && <>
            <label style={{ fontSize: 13, color: C.sub }}>Full name<input required value={form.name} onChange={update("name")} style={inputStyle} placeholder="e.g. Aisha Sharma" /></label>
            <label style={{ fontSize: 13, color: C.sub }}>Email address<input required type="email" value={form.email} onChange={update("email")} style={inputStyle} placeholder="you@example.com" /></label>
          </>}
          <label style={{ fontSize: 13, color: C.sub }}>{mode === "login" ? "Username or email" : "Username (optional)"}<input required={mode === "login"} value={form.username} onChange={update("username")} style={inputStyle} placeholder={mode === "login" ? "Enter your username or email" : "Leave blank to use your email"} autoComplete="username" /></label>
          {mode === "register" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ fontSize: 13, color: C.sub }}>Date of birth<input required type="date" value={form.dateOfBirth} onChange={update("dateOfBirth")} style={inputStyle} /></label>
            <label style={{ fontSize: 13, color: C.sub }}>Age<input type="number" min="13" max="100" value={form.age} onChange={update("age")} style={inputStyle} placeholder="Age" /></label>
          </div>}
          {mode === "register" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><label style={{ fontSize: 13, color: C.sub }}>Degree<input required value={form.degree} onChange={update("degree")} style={inputStyle} placeholder="B.Tech" /></label><label style={{ fontSize: 13, color: C.sub }}>Stream<input required value={form.stream} onChange={update("stream")} style={inputStyle} placeholder="Computer Science" /></label></div>
            <label style={{ fontSize: 13, color: C.sub }}>College or university<select required value={form.collegeId} onChange={update("collegeId")} style={inputStyle}><option value="">Select your institution</option>{colleges.map((college) => <option key={college.id} value={college.id}>{college.name}</option>)}</select></label>
          </>}
          <label style={{ fontSize: 13, color: C.sub }}>Password<div style={{ position: "relative" }}><input required minLength={mode === "register" ? 8 : undefined} type={showPassword ? "text" : "password"} value={form.password} onChange={update("password")} style={{ ...inputStyle, paddingRight: 42 }} placeholder={mode === "register" ? "At least 8 characters" : "Your password"} autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" onClick={() => setShowPassword((value) => !value)} style={{ position: "absolute", right: 10, top: 8, border: 0, background: "none", color: C.sub, cursor: "pointer" }}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {mode === "register" && <label style={{ fontSize: 13, color: C.sub }}>Confirm password<input required type="password" value={form.confirmPassword} onChange={update("confirmPassword")} style={inputStyle} placeholder="Repeat your password" autoComplete="new-password" /></label>}
        </div>
        <button disabled={busy} style={{ width: "100%", marginTop: 22, background: busy ? C.border : C.green900, color: "#fff", border: 0, borderRadius: 9, padding: "12px 0", fontWeight: 600, fontSize: 14.5, cursor: busy ? "wait" : "pointer" }}>{busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}</button>
        <div style={{ textAlign: "center", marginTop: 17, fontSize: 13, color: C.sub }}>{mode === "login" ? "New to Pathway?" : "Already have an account?"} <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{ color: C.green700, border: 0, background: "none", fontWeight: 700, cursor: "pointer" }}>{mode === "login" ? "Create an account" : "Sign in instead"}</button></div>
      </form>
    </div>
  );
}
