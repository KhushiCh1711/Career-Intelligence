import React from "react";
import { FONT } from "../theme.js";

export default function RadialGauge({ value, size = 120 }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth="10" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} stroke="#FFFFFF" strokeWidth="10" fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="46%" textAnchor="middle" fontSize="26" fontWeight="700" fill="#fff" fontFamily={FONT}>{value}%</text>
      <text x="50%" y="64%" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)" fontFamily={FONT}>job ready</text>
    </svg>
  );
}
