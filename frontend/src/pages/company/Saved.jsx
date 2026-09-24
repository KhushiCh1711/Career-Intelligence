import React, { useEffect, useState } from "react";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";
import Avatar from "../../components/Avatar.jsx";

export default function CompanySaved() {
  const [students, setStudents] = useState(null);

  const load = () => api.get("/company/shortlist").then(setStudents);
  useEffect(() => { load(); }, []);

  const remove = async (studentId) => {
    await api.post(`/company/shortlist/${studentId}`);
    load();
  };

  if (!students) return <div style={{ color: C.sub }}>Loading…</div>;

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 17, color: C.ink, marginBottom: 4 }}>Saved candidates</div>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 18 }}>Shortlisted across all connected campuses</div>
      {students.length === 0 && <div style={{ color: C.sub, fontSize: 14 }}>Nothing saved yet — bookmark candidates from the Overview page.</div>}
      {students.map((s, i) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar letter={s.name[0]} color={s.avatarColor} size={32} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14.5, color: C.ink }}>{s.name}</div>
              <div style={{ fontSize: 12.5, color: C.sub }}>{s.collegeId.toUpperCase()} · {s.department}</div>
            </div>
          </div>
          <button onClick={() => remove(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.sub, fontSize: 13 }}>Remove</button>
        </div>
      ))}
    </Card>
  );
}
