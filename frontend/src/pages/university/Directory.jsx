import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { C, FONT, tierColor } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";
import Avatar from "../../components/Avatar.jsx";

export default function UniversityDirectory() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("readiness");

  useEffect(() => {
    const params = new URLSearchParams({ query, sort });
    api.get(`/university/students?${params}`).then(setStudents);
  }, [query, sort]);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: C.ink }}>Student directory</div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px" }}>
            <Search size={14} color={C.sub} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students" style={{ border: "none", outline: "none", fontSize: 13, fontFamily: FONT }} />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, padding: "6px 8px", fontFamily: FONT }}>
            <option value="readiness">Sort by readiness</option>
            <option value="name">Sort by name</option>
          </select>
        </div>
      </div>
      {students.map((s, i) => {
        const t = tierColor(s.readiness);
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar letter={s.name[0]} color={s.avatarColor} size={32} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: C.ink }}>{s.name}</div>
                <div style={{ fontSize: 12.5, color: C.sub }}>{s.department}</div>
                  <div className="gap-pill-list">{s.gaps?.slice(0, 2).map((gap) => <span key={gap.skill}>{gap.skill} {gap.score}%</span>)}</div>
              </div>
            </div>
            <div style={{ background: t.bg, color: t.fg, borderRadius: 999, padding: "4px 12px", fontWeight: 700, fontSize: 13 }}>{s.readiness}%</div>
          </div>
        );
      })}
      {students.length === 0 && <div style={{ padding: "24px 0", color: C.sub, fontSize: 14 }}>No students are linked to this university yet. Student records will appear here after registration.</div>}
    </Card>
  );
}
