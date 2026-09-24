import React, { useEffect, useState } from "react";
import { CheckCircle2, Code2, XCircle } from "lucide-react";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";
import Card from "../../components/Card.jsx";

export default function CodingChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  useEffect(() => { api.get("/students/me/coding-challenges").then(setChallenges); }, []);
  const submit = async (challenge) => {
    const result = await api.post(`/students/me/coding-challenges/${challenge.id}`, { answer: answers[challenge.id] });
    setResults((current) => ({ ...current, [challenge.id]: result }));
  };
  return <div className="tool-page">
    <div className="tool-heading"><div><div className="tool-kicker">Evidence lab</div><h1>Coding challenges</h1><p>Short technical checks that turn knowledge into measurable interview evidence.</p></div><Code2 size={32} color={C.green700} /></div>
    <div className="tool-grid">{challenges.map((challenge) => { const result = results[challenge.id]; return <Card key={challenge.id}>
      <div className="tool-card-top"><span className="tool-chip">{challenge.skill}</span>{result && (result.correct ? <CheckCircle2 color={C.green600} /> : <XCircle color={C.red} />)}</div>
      <h2>{challenge.title}</h2><p className="tool-muted">{challenge.prompt}</p>
      <div className="option-list">{challenge.options.map((option, index) => <label className={answers[challenge.id] === index ? "option selected" : "option"} key={option}><input type="radio" name={challenge.id} checked={answers[challenge.id] === index} onChange={() => setAnswers((current) => ({ ...current, [challenge.id]: index }))} />{option}</label>)}</div>
      <button className="primary-tool-button" disabled={answers[challenge.id] === undefined} onClick={() => submit(challenge)}>Submit answer</button>
      {result && <div className="result-note">{result.explanation} Score: <strong>{result.score}%</strong></div>}
    </Card>; })}</div>
  </div>;
}
