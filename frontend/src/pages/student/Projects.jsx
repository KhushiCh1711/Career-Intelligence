import React, { useEffect, useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";

const empty = { title: "", description: "", url: "", techStack: "" };
export default function Projects() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const load = () => api.get("/students/me").then(setData);
  useEffect(() => { load(); }, []);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setError("");
    try { await api.post("/students/me/projects", { ...form, techStack: form.techStack.split(",").map((item) => item.trim()).filter(Boolean) }); setForm(empty); load(); } catch (e) { setError(e.message); }
  };
  if (!data) return <div style={{ color: C.sub }}>Loading projects...</div>;
  return <div className="tool-page"><div className="tool-heading"><div><div className="tool-kicker">Evidence lab</div><h1>My projects</h1><p>Projects make your skills visible. Add work you can explain in an interview.</p></div><FolderKanban size={32} color={C.green700} /></div>
    <div className="evidence-layout"><Card><h2>Add a project</h2><form className="tool-form" onSubmit={submit}><input required value={form.title} onChange={update("title")} placeholder="Project title" /><textarea value={form.description} onChange={update("description")} placeholder="What did you build, and what problem did it solve?" rows="4" /><input required type="url" value={form.url} onChange={update("url")} placeholder="https://github.com/you/project or live demo" /><input value={form.techStack} onChange={update("techStack")} placeholder="Technologies, separated by commas" />{error && <div className="form-error">{error}</div>}<button className="primary-tool-button"><Plus size={15} /> Save project evidence</button></form></Card>
      <Card><h2>Submitted work</h2>{!data.projects?.length && <p className="tool-muted">No projects submitted yet.</p>}{data.projects?.map((project) => <div className="evidence-row" key={project._id || project.url}><div><strong>{project.title}</strong><div className="tool-muted">{project.url}</div><div className="evidence-tags">{project.techStack?.map((tech) => <span key={tech}>{tech}</span>)}</div></div><strong className="score-text">{project.evidenceScore}%</strong></div>)}</Card>
    </div></div>;
}
