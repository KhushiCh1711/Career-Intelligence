import React from "react";
import { C, tierColor } from "../theme.js";

export default function Bar({ label, value, right, height = 8 }) {
  const t = tierColor(value);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 15 }}>
        <span style={{ color: C.ink }}>{label}</span>
        <span style={{ color: C.ink, fontWeight: 600 }}>{right !== undefined ? right : `${value}%`}</span>
      </div>
      <div style={{ height, background: C.green100, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: t.fg, borderRadius: 999, transition: "width .4s ease" }} />
      </div>
    </div>
  );
}
