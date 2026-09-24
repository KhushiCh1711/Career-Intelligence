import React from "react";
import { Target, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { C } from "../theme.js";

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
      padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
      background: active ? C.green100 : "transparent", color: active ? C.green900 : C.sub,
      fontWeight: active ? 600 : 500, fontSize: 14.5, marginBottom: 2,
    }}>
      <Icon size={17} /> {label}
    </button>
  );
}

export default function Sidebar({ nav, activePage, onNavigate, onOpenAssistant, onSettings, settingsActive }) {
  return (
    <aside className="app-sidebar">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: C.green900, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Target size={16} color="#fff" />
        </div>
        <div style={{ fontWeight: 700, fontSize: 17, color: C.ink }}>pathway</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: 0.5, marginBottom: 8 }}>WORKSPACE</div>
      <div className="sidebar-nav">
        {nav.map((n) => (
          <NavItem key={n.id} icon={n.icon} label={n.label}
            active={n.id !== "assistant" && activePage === n.id}
            onClick={() => n.id === "assistant" ? onOpenAssistant() : onNavigate(n.id)} />
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: 0.5, marginTop: 20, marginBottom: 8 }}>MANAGE</div>
      <NavItem icon={SettingsIcon} label="Settings" active={settingsActive} onClick={onSettings} />
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.sub, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
        <ShieldCheck size={14} /> Tenant isolated
      </div>
    </aside>
  );
}
