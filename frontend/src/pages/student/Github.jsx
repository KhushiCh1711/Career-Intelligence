import React, { useEffect, useState } from "react";
import { Github as GithubIcon, GitBranch } from "lucide-react";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";

export default function Github() {
  const [data, setData] = useState(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const load = () => api.get("/students/me").then(setData);
  useEffect(() => { load(); }, []);
  const connect = async (event) => { event.preventDefault(); setError(""); try { await api.post("/students/me/github", { url }); load(); } catch (e) { setError(e.message); } };
  if (!data) return <div style={{ color: C.sub }}>Loading GitHub evidence...</div>;
  return <div className="tool-page"><div className="tool-heading"><div><div className="tool-kicker">Evidence lab</div><h1>GitHub connection</h1><p>Connect a public repository and receive an interview-readiness code-quality check.</p></div><GithubIcon size={32} color={C.green700} /></div>
    <div className="evidence-layout"><Card><h2>{data.github?.url ? "Update repository" : "Connect a repository"}</h2><form className="tool-form" onSubmit={connect}><input required type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://github.com/username/repository" />{error && <div className="form-error">{error}</div>}<button className="primary-tool-button"><GitBranch size={15} /> Analyze public repository</button></form><p className="tool-muted">We check the public repository description, README, dependency manifest, tests, and detected languages. No private code is accessed.</p></Card>
      <Card>{data.github?.url ? <><div className="score-hero"><span>Repository evidence</span><strong>{data.github.score}%</strong></div><div className="evidence-tags">{data.github.languages?.map((language) => <span key={language}>{language}</span>)}</div><h3>Signals found</h3>{data.github.signals?.map((signal) => <div className="signal good" key={signal}>+ {signal}</div>)}<h3>Next improvements</h3>{data.github.gaps?.map((gap) => <div className="signal" key={gap}>- {gap}</div>)}</> : <p className="tool-muted">No repository connected yet.</p>}</Card>
    </div></div>;
}
