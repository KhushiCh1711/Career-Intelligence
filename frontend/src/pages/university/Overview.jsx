import React, { useEffect, useState } from "react";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";
import Bar from "../../components/Bar.jsx";
import Avatar from "../../components/Avatar.jsx";

export default function UniversityOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/university/overview").then(setData).catch((requestError) => setError(requestError.message)); }, []);
  if (error) return <div style={{ color: C.red, background: C.redBg, borderRadius: 8, padding: 12 }}>{error}</div>;
  if (!data) return <div style={{ color: C.sub }}>Loading…</div>;

  const maxBucket = Math.max(1, ...data.buckets.map((b) => b.count));

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: C.green700, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>University workspace</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>{data.college.name}</div>
        <div style={{ color: C.sub, fontSize: 14.5, marginTop: 4 }}>Batch readiness across {data.totalStudents} tracked students · isolated to your tenant</div>
      </div>

      {!data.hasStudentData && <Card style={{ marginBottom: 18, borderColor: C.amber, background: C.amberBg }}>
        <div style={{ fontWeight: 700, color: C.ink, marginBottom: 6 }}>No student records for this university yet</div>
        <div style={{ color: C.sub, fontSize: 13, lineHeight: 1.5 }}>Readiness, rankings, and skill gaps will appear after students register with this university and complete the assessment. The current database contains university records, but no students are linked to this campus.</div>
      </Card>}

      {data.hasStudentData && <><div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 18 }}>
        <Card><div style={{ fontSize: 13, color: C.sub, marginBottom: 8 }}>Average readiness</div><div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>{data.avgReadiness}%</div></Card>
        <Card><div style={{ fontSize: 13, color: C.sub, marginBottom: 8 }}>Placement-ready students</div><div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>{data.readyCount}<span style={{ fontSize: 15, color: C.sub }}>/{data.totalStudents}</span></div></Card>
        <Card><div style={{ fontSize: 13, color: C.sub, marginBottom: 8 }}>Tenant</div><div style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>{data.college.tag}</div></Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 18 }}>Readiness distribution</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 140 }}>
            {data.buckets.map((b) => (
              <div key={b.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 110, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <div style={{ width: "60%", height: `${(b.count / maxBucket) * 100}%`, background: C.green600, borderRadius: "6px 6px 0 0" }} />
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 8 }}>{b.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{b.count}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 2 }}>Skill gap heatmap</div>
          <div style={{ fontSize: 12.5, color: C.sub, marginBottom: 16 }}>Cohort average, lowest first</div>
          {data.gapSkills.map((g) => <Bar key={g.skill} label={g.skill} value={g.avg} />)}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 4 }}>Best-performing students</div>
          <div style={{ fontSize: 12.5, color: C.sub, marginBottom: 14 }}>Ranked by readiness, including verified project and interview evidence.</div>
          {data.topStudents?.length ? data.topStudents.map((student, index) => <div className="university-student-row" key={student.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="student-rank">0{index + 1}</span><Avatar letter={student.name[0]} color={student.avatarColor} size={30} /><div><strong>{student.name}</strong><div className="tool-muted">{student.department}</div></div></div><strong className="university-score">{student.readiness}%</strong>
          </div>) : <div className="tool-muted">No student records are available for this campus yet.</div>}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 4 }}>Student gap updates</div>
          <div style={{ fontSize: 12.5, color: C.sub, marginBottom: 14 }}>The lowest tracked skills to prioritize in mentoring sessions.</div>
          {data.gapUpdates?.length ? data.gapUpdates.map((student) => <div className="university-gap-row" key={student.id}><div><strong>{student.name}</strong><div className="gap-pill-list">{student.gaps.map((gap) => <span key={gap.skill}>{gap.skill} {gap.score}%</span>)}</div></div><strong className="university-score">{student.readiness}%</strong></div>) : <div className="tool-muted">Gap updates will appear as students complete assessments.</div>}
        </Card>
      </div></>}
    </div>
  );
}
