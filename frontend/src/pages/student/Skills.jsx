import React, { useEffect, useState } from "react";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";
import Bar from "../../components/Bar.jsx";

export default function StudentSkills() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/students/me").then(setData); }, []);
  if (!data) return <div style={{ color: C.sub }}>Loading…</div>;

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 19, color: C.ink, marginBottom: 2 }}>My skills</div>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>Full breakdown across every tracked skill</div>
      {Object.entries(data.skills || {}).map(([skill, value]) => <Bar key={skill} label={skill} value={value} />)}
    </Card>
  );
}
