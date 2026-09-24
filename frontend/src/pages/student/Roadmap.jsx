import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";

export default function StudentRoadmap() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/students/me").then(setData); }, []);
  if (!data) return <div style={{ color: C.sub }}>Loading…</div>;

  const toggleStep = async (stepId) => {
    const updated = await api.patch(`/students/me/roadmap/${stepId}`);
    setData((cur) => ({ ...cur, roadmap: cur.roadmap.map((r) => r.id === stepId ? { ...r, ...updated } : r) }));
  };

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 19, color: C.ink, marginBottom: 2 }}>Learning roadmap</div>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>Your full-stack track, step by step</div>
      {data.roadmap.map((step, i) => (
        <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
          <button onClick={() => toggleStep(step.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            {step.done ? <CheckCircle2 size={20} color={C.green600} /> : <Circle size={20} color={C.border} />}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: step.done ? C.sub : C.ink, textDecoration: step.done ? "line-through" : "none" }}>{step.title}</div>
            <div style={{ fontSize: 12.5, color: C.sub }}>{step.sub}</div>
          </div>
          <div style={{ fontWeight: 700, color: C.ink }}>{step.pct}%</div>
        </div>
      ))}
    </Card>
  );
}
