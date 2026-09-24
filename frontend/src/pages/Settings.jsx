import React from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { C } from "../theme.js";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/Card.jsx";

export default function Settings() {
  const { user, logout } = useAuth();
  return (
    <Card style={{ maxWidth: 480 }}>
      <div style={{ fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 18 }}>Settings</div>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 4 }}>Signed in as</div>
      <div style={{ fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 18 }}>{user.label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.green100, color: C.green700, borderRadius: 8, padding: "10px 12px", fontSize: 12.5, marginBottom: 20 }}>
        <ShieldCheck size={16} /> Your workspace data is isolated from other tenants on this platform.
      </div>
      <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: C.green900, color: "#fff", borderRadius: 8, padding: "10px 0", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
        <LogOut size={15} /> Sign out
      </button>
    </Card>
  );
}
