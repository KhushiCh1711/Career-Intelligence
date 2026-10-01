import React, { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Circle, Search, Sparkles } from "lucide-react";
import { C } from "../../theme.js";

const FIELD_OPTIONS = [
  "Web Developer",
  "Full Stack Developer",
  "Front End Developer",
  "Back End Developer",
  "Software Development",
  "Mobile Development",
  "AI / Machine Learning Engineer",
  "Data Science",
  "Data Analytics",
  "Cybersecurity",
  "Cloud Computing",
  "DevOps",
  "Site Reliability Engineer",
  "Platform Engineer",
  "Software Engineer",
  "Computer Networks",
  "Network Architecture",
  "Systems Administration",
  "Blockchain",
  "Web3",
  "IoT",
  "Embedded Systems",
  "Robotics",
  "AR / VR / Graphics Systems",
  "Game Development",
  "Quantum Computing",
  "UX / UI Design",
  "Human Computer Interaction",
];

const GENERIC_QUESTIONS = [
  { question: "Which of the following is the best description of a REST API?", options: ["A protocol used only for file downloads", "A set of rules for exchanging data over HTTP", "A style for rendering UI only", "A database storage method"], answer: 1 },
  { question: "Which data structure follows the FIFO principle?", options: ["Stack", "Tree", "Queue", "Hash map"], answer: 2 },
  { question: "Which layer of a system is most directly responsible for business logic and application workflows?", options: ["Frontend", "Backend", "CSS", "Database schema"], answer: 1 },
  { question: "What is the primary purpose of indexing in a database?", options: ["To increase storage cost", "To speed up data lookup", "To reduce code size", "To hide duplicate records"], answer: 1 },
  { question: "Which of these is a common sign of a reliable cloud deployment pipeline?", options: ["Manual updates on every release", "Automated testing and deployment checks", "No monitoring or logs", "Random server restarts"], answer: 1 },
  { question: "What is the best reason to write modular code?", options: ["It reduces code reuse", "It makes code easier to maintain and test", "It removes logic from apps", "It prevents data from being stored"], answer: 1 },
  { question: "Which of the following is most important for good UX design?", options: ["Using the largest possible color palette", "Reducing friction and making the product clear", "Avoiding all user feedback", "Leaving every interaction hidden"], answer: 1 },
  { question: "Which of these is a key benefit of version control systems like Git?", options: ["It automatically writes code for you", "It tracks changes and allows collaboration", "It turns code into hardware", "It removes all bugs"], answer: 1 },
  { question: "Which concept best describes a system that can detect patterns in large data sets and make predictions?", options: ["Static typing", "Machine learning", "HTTP caching", "Pixel rendering"], answer: 1 },
  { question: "Which practice is most useful when debugging a production issue?", options: ["Guessing randomly", "Logging, isolating the root cause, and validating the fix", "Deleting the app", "Ignoring errors"], answer: 1 },
];

const scoreSkills = (percentage) => [
  { label: "Core concepts", value: Math.min(100, percentage + 5) },
  { label: "Problem solving", value: Math.min(100, percentage + 8) },
  { label: "System thinking", value: Math.min(100, percentage + 3) },
  { label: "Communication", value: Math.min(100, percentage + 6) },
];

export default function StudentFieldFlow({ onComplete }) {
  const [screen, setScreen] = useState("field");
  const [search, setSearch] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [months, setMonths] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const filteredFields = useMemo(() =>
    FIELD_OPTIONS.filter((field) => field.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const handleChooseField = () => {
    if (!selectedField) return;
    const monthCount = Number(months) || 0;

    if (monthCount <= 1) {
      onComplete({
        field: selectedField,
        months: monthCount,
        score: 0,
        skills: scoreSkills(0),
        onboardingComplete: true,
      });
      return;
    }

    const quiz = [...GENERIC_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(quiz);
    setAnswers(new Array(quiz.length).fill(null));
    setScreen("quiz");
  };

  const handleAnswer = (index, value) => {
    setAnswers((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const submitQuiz = () => {
    const score = questions.reduce((total, item, index) => {
      return total + (Number(answers[index]) === item.answer ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / questions.length) * 100);
    const entry = {
      field: selectedField,
      months: Number(months),
      score: percentage,
      skills: scoreSkills(percentage),
      onboardingComplete: true,
    };

    setResult(entry);
    setScreen("result");
  };

  const continueToDashboard = () => {
    onComplete(result);
  };

  if (screen === "field") {
    return (
      <div className="tool-page" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="tool-heading" style={{ marginBottom: 18 }}>
          <div>
            <div className="tool-kicker">Career orientation</div>
            <h1>Choose your interested field</h1>
            <p>Build a roadmap that matches the skills employers are tracking for your next role.</p>
          </div>
          <Sparkles size={30} color={C.green700} />
        </div>

        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: 20, boxShadow: "0 10px 32px rgba(23, 74, 59, 0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", background: "#F5FAF7" }}>
            <Search size={16} color={C.sub} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your field"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: C.ink }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 18 }}>
            {filteredFields.map((field) => {
              const active = selectedField === field;
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => setSelectedField(field)}
                  style={{
                    textAlign: "left",
                    border: active ? `1px solid ${C.green700}` : `1px solid ${C.border}`,
                    background: active ? C.green100 : "#fff",
                    color: C.ink,
                    borderRadius: 14,
                    padding: "14px 12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: active ? "0 10px 24px rgba(8, 127, 91, 0.12)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {field}
                </button>
              );
            })}
          </div>

          {selectedField && (
            <div style={{ marginTop: 22, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
              <div style={{ fontSize: 13, color: C.sub, marginBottom: 10 }}>Selected field</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 16 }}>{selectedField}</div>

              <label style={{ display: "block", marginBottom: 18, fontSize: 13, color: C.sub }}>
                Months of experience in this field
                <input
                  type="number"
                  min="0"
                  max="240"
                  value={months}
                  onChange={(event) => setMonths(event.target.value)}
                  style={{ display: "block", width: "100%", marginTop: 8, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, color: C.ink, background: "#fff" }}
                />
              </label>

              <button
                type="button"
                onClick={handleChooseField}
                disabled={!selectedField}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: "none",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #1D5D4F 0%, #0A9F6E 100%)",
                  color: "#fff",
                  padding: "12px 18px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 18px 36px rgba(8, 127, 91, 0.22)",
                  transform: "translateY(0)",
                }}
              >
                Choose your interested field <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "quiz") {
    return (
      <div className="tool-page" style={{ maxWidth: 980, margin: "0 auto" }}>
        <div className="tool-heading" style={{ marginBottom: 18 }}>
          <div>
            <div className="tool-kicker">Field assessment</div>
            <h1>{selectedField}</h1>
            <p>Answer 10 quick MCQs to benchmark your current strength in this field.</p>
          </div>
          <CheckCircle2 size={30} color={C.green700} />
        </div>

        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: 20 }}>
          {questions.map((item, index) => (
            <div key={`${item.question}-${index}`} style={{ padding: "18px 0", borderBottom: index < questions.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontWeight: 700, color: C.ink, marginBottom: 12 }}>
                {index + 1}. {item.question}
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {item.options.map((option, optionIndex) => (
                  <label key={`${option}-${optionIndex}`} style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 10, border: `1px solid ${C.border}`, padding: "10px 12px", background: answers[index] === optionIndex ? C.green100 : "#F7FAF8" }}>
                    <input
                      type="radio"
                      name={`q-${index}`}
                      checked={answers[index] === optionIndex}
                      onChange={() => handleAnswer(index, optionIndex)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={submitQuiz}
            disabled={answers.some((answer) => answer === null)}
            style={{
              marginTop: 20,
              border: "none",
              borderRadius: 12,
              background: answers.some((answer) => answer === null) ? C.border : C.green900,
              color: "#fff",
              padding: "12px 18px",
              fontWeight: 700,
              cursor: answers.some((answer) => answer === null) ? "not-allowed" : "pointer",
            }}
          >
            Submit assessment
          </button>
        </div>
      </div>
    );
  }

  if (screen === "result") {
    return (
      <div className="tool-page" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div className="tool-heading" style={{ marginBottom: 18 }}>
          <div>
            <div className="tool-kicker">Assessment complete</div>
            <h1>{result?.field}</h1>
            <p>Your score breakdown and skill readiness are ready for your next step.</p>
          </div>
          <Sparkles size={30} color={C.green700} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(200px, 260px) 1fr", gap: 22 }}>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: 20, display: "grid", placeItems: "center" }}>
            <div style={{ width: 170, height: 170, borderRadius: "50%", background: "radial-gradient(circle at center, #E5F8EE 0%, #D8F1E3 54%, #A9D9B9 100%)", display: "grid", placeItems: "center", border: `12px solid ${C.green200}` }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.green900 }}>{result?.score}%</div>
                <div style={{ fontSize: 12, color: C.sub }}>Total score</div>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, padding: 20 }}>
            <div style={{ fontWeight: 700, color: C.ink, marginBottom: 16 }}>Skill score list</div>
            <div style={{ display: "grid", gap: 14 }}>
              {result?.skills.map((skill) => (
                <div key={skill.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: C.ink }}>
                    <span>{skill.label}</span>
                    <strong>{Math.round(skill.value)}%</strong>
                  </div>
                  <div style={{ width: "100%", height: 10, background: "#ECF3EE", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${Math.round(skill.value)}%`, height: "100%", background: "linear-gradient(90deg, #2B8A5A 0%, #0A9F6E 100%)", borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>Experience</div>
              <div style={{ fontWeight: 700, color: C.ink }}>{result?.months} months in {result?.field}</div>
            </div>
            <button
              type="button"
              onClick={continueToDashboard}
              style={{
                border: "none",
                borderRadius: 12,
                background: "linear-gradient(135deg, #1D5D4F 0%, #0A9F6E 100%)",
                color: "#fff",
                padding: "12px 18px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Continue to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
