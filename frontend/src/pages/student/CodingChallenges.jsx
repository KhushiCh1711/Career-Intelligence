import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Code2, ExternalLink, Link2, XCircle } from "lucide-react";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";

function PlatformConnections({ platforms, setPlatforms }) {
  const [profileUrls, setProfileUrls] = useState({});
  const [message, setMessage] = useState("");
  const connectPlatform = async (platform) => {
    setMessage("");
    try {
      const data = await api.post("/students/me/coding-platforms", { platform: platform.id, url: profileUrls[platform.id] });
      setPlatforms((current) => current.map((item) => item.id === platform.id ? { ...item, connected: data.connection } : item));
      setProfileUrls((current) => ({ ...current, [platform.id]: data.connection.url }));
      setMessage(`${platform.name} profile connected.`);
    } catch (error) { setMessage(error.message); }
  };
  return <section className="platform-section">
    <div className="section-heading"><div><div className="tool-kicker">Practice network</div><h2>Connect your coding profiles</h2><p className="tool-muted">Keep your public profiles in one place and jump straight into practice.</p></div><Link2 size={24} color={C.green700} /></div>
    <div className="platform-grid">{platforms.map((platform) => <Card key={platform.id}>
      <div className="platform-card-top"><strong>{platform.name}</strong>{platform.connected && <CheckCircle2 size={18} color={C.green600} />}</div>
      <p className="tool-muted">{platform.description}</p>
      <div className="platform-actions"><input aria-label={`${platform.name} profile URL`} placeholder={`https://${platform.hostname}/...`} value={profileUrls[platform.id] ?? platform.connected?.url ?? ""} onChange={(event) => setProfileUrls((current) => ({ ...current, [platform.id]: event.target.value }))} /><button className="secondary-tool-button" onClick={() => connectPlatform(platform)}>Connect</button></div>
      {platform.connected && <a className="platform-link" href={platform.connected.url} target="_blank" rel="noreferrer">Open profile <ExternalLink size={14} /></a>}
    </Card>)}</div>
    {message && <p className="result-note">{message}</p>}
  </section>;
}

function AssessmentList({ assessments, onOpen }) {
  return <div className="skill-assessment-grid">{assessments.map((assessment) => <button className="skill-assessment-card" key={assessment.id} onClick={() => onOpen(assessment.id)}>
    <span className="skill-assessment-index">{assessment.result ? <CheckCircle2 size={18} /> : <Code2 size={18} />}</span>
    <span><strong>{assessment.skill}</strong><small>{assessment.description}</small><small>10 MCQs + 2 coding problems</small></span>
    {assessment.result && <b>{assessment.result.score}%</b>}
  </button>)}</div>;
}

function SkillAssessment({ assessment, onBack, onSubmitted }) {
  const [answers, setAnswers] = useState({});
  const [codingResponses, setCodingResponses] = useState({});
  const [result, setResult] = useState(assessment.result);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const answered = assessment.questions.filter((question) => answers[question.id] !== undefined).length;
  const submittedCoding = assessment.coding.filter((problem) => codingResponses[problem.id]?.trim()).length;
  const submit = async () => {
    if (answered !== assessment.questions.length || submittedCoding !== assessment.coding.length) return setError("Answer all 10 MCQs and submit both coding responses.");
    setBusy(true); setError("");
    try {
      const data = await api.post(`/students/me/skill-assessments/${assessment.id}`, { answers, codingResponses });
      setResult(data); onSubmitted(data);
    } catch (submitError) { setError(submitError.message); } finally { setBusy(false); }
  };
  return <div className="skill-assessment-view">
    <button className="back-tool-button" onClick={onBack}><ArrowLeft size={15} /> All skill assessments</button>
    <div className="assessment-view-heading"><div><div className="tool-kicker">Skill assessment</div><h2>{assessment.skill}</h2><p className="tool-muted">{assessment.description}</p></div>{result && <strong className="assessment-score">{result.score}%</strong>}</div>
    <div className="assessment-part"><div className="assessment-part-heading"><span>1</span><div><h3>Multiple-choice questions</h3><p className="tool-muted">Answer all 10 questions to measure your fundamentals.</p></div><b>{answered}/{assessment.questions.length}</b></div>
      {assessment.questions.map((question, index) => <fieldset className="assessment-question" key={question.id}><legend>{index + 1}. {question.prompt}</legend><div className="assessment-options">{question.options.map((option, optionIndex) => <label className={answers[question.id] === optionIndex ? "option selected" : "option"} key={option}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} />{option}</label>)}</div></fieldset>)}
    </div>
    <div className="assessment-part"><div className="assessment-part-heading"><span>2</span><div><h3>Coding problems</h3><p className="tool-muted">Explain your approach or paste your solution for both problems.</p></div><b>{submittedCoding}/{assessment.coding.length}</b></div>
      {assessment.coding.map((problem, index) => <div className="coding-problem" key={problem.id}><h4>{index + 1}. {problem.title}</h4><p className="tool-muted">{problem.prompt}</p><textarea aria-label={problem.title} value={codingResponses[problem.id] || ""} onChange={(event) => setCodingResponses((current) => ({ ...current, [problem.id]: event.target.value }))} placeholder="Write your approach or solution..." rows={7} /></div>)}
    </div>
    {error && <div className="form-error">{error}</div>}
    <button className="primary-tool-button assessment-submit" disabled={busy} onClick={submit}>{busy ? "Scoring assessment..." : result ? "Update assessment" : "Submit skill assessment"}</button>
  </div>;
}

export default function CodingChallenges() {
  const [assessments, setAssessments] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    Promise.all([api.get("/students/me/skill-assessments"), api.get("/students/me/coding-platforms")])
      .then(([assessmentData, platformData]) => { setAssessments(assessmentData); setPlatforms(platformData.platforms); })
      .catch((error) => setLoadError(error.message));
  }, []);
  const activeAssessment = assessments.find((assessment) => assessment.id === activeId);
  const updateResult = (result) => setAssessments((current) => current.map((assessment) => assessment.id === activeId ? { ...assessment, result } : assessment));
  return <div className="tool-page">
    <div className="tool-heading"><div><div className="tool-kicker">Evidence lab</div><h1>Coding challenges</h1><p>Build measurable evidence across the skills employers look for.</p></div><Code2 size={32} color={C.green700} /></div>
    {loadError && <div className="form-error">{loadError}</div>}
    <PlatformConnections platforms={platforms} setPlatforms={setPlatforms} />
    {!activeAssessment && <section><div className="section-heading challenges-heading"><div><div className="tool-kicker">Skill practice</div><h2>Skill assessments</h2><p className="tool-muted">Choose a skill to open its 10-question MCQ and 2-problem assessment.</p></div></div><AssessmentList assessments={assessments} onOpen={setActiveId} /></section>}
    {activeAssessment && <SkillAssessment assessment={activeAssessment} onBack={() => setActiveId(null)} onSubmitted={updateResult} />}
  </div>;
}