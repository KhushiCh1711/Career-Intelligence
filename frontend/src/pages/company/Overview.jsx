import React, { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";
import Bar from "../../components/Bar.jsx";
import Avatar from "../../components/Avatar.jsx";

export default function CompanyOverview() {
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState(null);
  const [data, setData] = useState(null);
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/company/roles"), api.get("/company/shortlist")]).then(([rs, rows]) => {
      setRoles(rs);
      if (rs[0]) setRoleId(rs[0].id);
      setShortlisted(rows.map((r) => r.id));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (roleId) api.get(`/company/matches?roleId=${roleId}`).then(setData);
  }, [roleId]);

  const toggle = async (studentId) => {
    const res = await api.post(`/company/shortlist/${studentId}`);
    setShortlisted((cur) => res.shortlisted ? [...cur, studentId] : cur.filter((id) => id !== studentId));
  };

  if (loading) return <div style={{ color: C.sub }}>Loading…</div>;
  if (!roles.length) return (
    <div>
      <div style={{ color: C.green700, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Company workspace</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>Company dashboard</div>
      <Card style={{ marginTop: 22 }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: C.ink }}>No roles configured</div>
        <div style={{ color: C.sub, marginTop: 8 }}>This company account is ready. Add roles and required skills in MongoDB to enable candidate matching.</div>
      </Card>
    </div>
  );
  if (!data) return <div style={{ color: C.sub }}>Loading role matches…</div>;
  const fitByCampus = data.byCollege.filter((campus) => campus.qualified > 0);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: C.green700, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Company workspace</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>Cross-college talent matching</div>
        <div style={{ color: C.sub, fontSize: 14.5, marginTop: 4 }}>Reading candidates across every connected campus, in real time</div>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 10 }}>Target role</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {roles.map((r) => (
            <button key={r.id} onClick={() => setRoleId(r.id)} style={{
              border: `1px solid ${r.id === roleId ? C.green600 : C.border}`, background: r.id === roleId ? C.green900 : "transparent",
              color: r.id === roleId ? "#fff" : C.ink, borderRadius: 999, padding: "8px 14px", fontSize: 13.5, cursor: "pointer", fontWeight: 500,
            }}>{r.title}</button>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 18 }}>
        <Card><div style={{ fontSize: 13, color: C.sub, marginBottom: 8 }}>Qualified candidates</div><div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>{data.qualifiedCount}</div></Card>
        <Card><div style={{ fontSize: 13, color: C.sub, marginBottom: 8 }}>Package range</div><div style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>{data.role.pkg}</div></Card>
        <Card><div style={{ fontSize: 13, color: C.sub, marginBottom: 8 }}>Campuses represented</div><div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>{data.byCollege.filter((b) => b.qualified > 0).length}<span style={{ fontSize: 15, color: C.sub }}>/{data.byCollege.length}</span></div></Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 18 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 16 }}>Fit by campus</div>
          {fitByCampus.length === 0 && <div style={{ color: C.sub, fontSize: 14 }}>No campuses currently have candidates who match this role.</div>}
          {fitByCampus.map((b) => (
            <Bar key={b.college.id} label={b.college.tag} value={Math.round((b.qualified / Math.max(1, b.total)) * 100)} right={`${b.qualified} candidates`} />
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 16 }}>Top candidates for {data.role.title}</div>
          {data.top.map((m, i) => {
            const saved = shortlisted.includes(m.id);
            return (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar letter={m.name[0]} color={m.avatarColor} size={32} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.ink }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: C.sub }}>{m.collegeId.toUpperCase()} · {m.department}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontWeight: 700, color: C.green700 }}>{m.match}%</div>
                  <button onClick={() => toggle(m.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    {saved ? <BookmarkCheck size={18} color={C.green700} /> : <Bookmark size={18} color={C.sub} />}
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
