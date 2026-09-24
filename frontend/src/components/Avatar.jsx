import React from "react";

export default function Avatar({ letter, color, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size / 2.2, flexShrink: 0,
    }}>{letter}</div>
  );
}
