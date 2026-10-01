import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Mic2, RotateCcw, Send, Sparkles, Volume2 } from "lucide-react";
import { C } from "../../theme.js";
import { api } from "../../api/client.js";

const FOCUSES = [
  "General technology interview",
  "Technical questions",
  "Behavioral questions",
  "Project-based discussion",
  "Problem solving",
  "System design",
  "Coding concepts",
  "Resume discussion",
];

const MAX_ANSWERS = 8;

export default function InterviewSimulator() {
  const [candidate, setCandidate] = useState({ name: "Candidate", skills: {} });
  const [role, setRole] = useState("");
  const [focus, setFocus] = useState(FOCUSES[0]);
  const [context, setContext] = useState("");
  const [started, setStarted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [draft, setDraft] = useState("");
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const supportsVoice = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    api.get("/students/me")
      .then((data) => setCandidate({ name: data.name || "Candidate", skills: data.skills || {} }))
      .catch(() => setCandidate({ name: "Candidate", skills: {} }));
  }, []);

  useEffect(() => {
    if (!supportsVoice) return undefined;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const spokenText = Array.from(event.results).map((result) => result[0].transcript).join("");
      setDraft(spokenText);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setError("Voice capture stopped. You can continue by typing your answer.");
    };
    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [supportsVoice]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript, busy]);

  const answerCount = transcript.filter((entry) => entry.role === "candidate").length;

  const startInterview = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api.post("/ai/interview", { action: "start", role, focus, context, transcript: [] });
      setTranscript([{ role: "interviewer", content: result.message }]);
      setUsingFallback(result.source === "local-fallback");
      setStarted(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const saveInterviewEvidence = async (finalReport) => {
    try {
      await api.post("/students/me/interviews", {
        role: role.trim() || "Mock interview",
        score: Math.round(Number(finalReport.overallRating) * 10),
        feedback: JSON.stringify(finalReport),
      });
      setSaveMessage("Final feedback saved to your interview evidence.");
    } catch {
      setSaveMessage("Your report is ready, but it could not be saved to interview evidence.");
    }
  };

  const finishInterview = async (history = transcript) => {
    if (busy || history.every((entry) => entry.role !== "candidate")) return;
    setBusy(true);
    setError("");
    try {
      const result = await api.post("/ai/interview", { action: "finish", role, focus, context, transcript: history });
      setUsingFallback(result.source === "local-fallback");
      setReport(result.report);
      setTranscript((current) => [...current, { role: "interviewer", content: result.message }]);
      await saveInterviewEvidence(result.report);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const submitAnswer = async (event) => {
    event.preventDefault();
    const answer = draft.trim();
    if (!answer || busy || report) return;
    const nextTranscript = [...transcript, { role: "candidate", content: answer }];
    setTranscript(nextTranscript);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const result = await api.post("/ai/interview", { action: "answer", role, focus, context, transcript: nextTranscript });
      setUsingFallback(result.source === "local-fallback");
      if (result.done && result.report) {
        setReport(result.report);
        setTranscript((current) => [...current, { role: "interviewer", content: result.message }]);
        await saveInterviewEvidence(result.report);
      } else {
        setTranscript((current) => [...current, { role: "interviewer", content: result.message }]);
      }
    } catch (requestError) {
      setTranscript((current) => current.slice(0, -1));
      setDraft(answer);
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleVoiceCapture = () => {
    if (!recognitionRef.current) {
      setError("Voice capture is not supported in this browser. Type your answer instead.");
      return;
    }
    setError("");
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setError("Voice capture could not start. Check microphone permission and try again.");
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) {
      setError("Spoken playback is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const startAnotherInterview = () => {
    setStarted(false);
    setTranscript([]);
    setDraft("");
    setReport(null);
    setError("");
    setSaveMessage("");
    setUsingFallback(false);
  };

  return (
    <div className="tool-page interview-page">
      <div className="tool-heading">
        <div>
          <div className="tool-kicker">Live practice room</div>
          <h1>Interview simulator</h1>
          <p>A realistic, adaptive interview. Answer one question at a time and receive a detailed review when you finish.</p>
        </div>
        <Mic2 size={32} color={C.green700} />
      </div>

      {!started ? (
        <form className="interview-setup" onSubmit={startInterview}>
          <div className="interview-setup-header">
            <div className="tool-kicker">Interview setup</div>
            <h2>Set the room</h2>
            <p>Your interviewer will adapt the conversation to the role and focus you choose.</p>
          </div>
          <div className="interview-setup-fields">
            <label className="tool-form-label">
              Target role
              <input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Software Engineer" maxLength={120} />
            </label>
            <label className="tool-form-label">
              Interview focus
              <select value={focus} onChange={(event) => setFocus(event.target.value)}>
                {FOCUSES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="tool-form-label interview-context-label">
              Resume or project notes <span>Optional</span>
              <textarea value={context} onChange={(event) => setContext(event.target.value)} maxLength={3000} rows={4} placeholder="Add experience, a project, or resume highlights for the interviewer to explore." />
            </label>
          </div>
          <div className="interview-setup-footer">
            <span><Sparkles size={15} /> Prepared for {candidate.name}</span>
            <button className="primary-tool-button" type="submit" disabled={busy}>
              {busy ? "Preparing interview..." : "Start interview"}
            </button>
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
        </form>
      ) : (
        <section className="interview-session" aria-label="Interview conversation">
          <header className="interview-session-header">
            <div>
              <div className="tool-kicker">{report ? "Interview complete" : `${focus} · ${role.trim() || "Software Engineer"}`}</div>
              <h2>{report ? "Your interview review" : "Conversation"}</h2>
            </div>
            <div className="interview-session-actions">
              {!report && <span className="interview-progress">Answer {Math.min(answerCount + 1, MAX_ANSWERS)} of {MAX_ANSWERS}</span>}
              {answerCount > 0 && !report && (
                <button className="interview-end-button" type="button" onClick={() => finishInterview()} disabled={busy}>End interview</button>
              )}
            </div>
          </header>

          {usingFallback && (
            <div className="interview-fallback-notice" role="status">
              AI is temporarily unavailable. This session is using local follow-ups and provisional transcript-based scoring.
            </div>
          )}

          <div className="interview-transcript" aria-live="polite">
            {transcript.map((entry, index) => (
              <article className={`interview-message ${entry.role}`} key={`${entry.role}-${index}`}>
                <div className="interview-message-meta">
                  <strong>{entry.role === "interviewer" ? "Interviewer" : candidate.name}</strong>
                  {entry.role === "interviewer" && (
                    <button className="interview-speak-button" type="button" onClick={() => speak(entry.content)} aria-label="Play interviewer message" title="Play message">
                      <Volume2 size={15} />
                    </button>
                  )}
                </div>
                <p>{entry.content}</p>
              </article>
            ))}
            {busy && <div className="interview-thinking"><span /> Interviewer is considering your answer</div>}
            <div ref={transcriptEndRef} />
          </div>

          {!report && (
            <form className="interview-answer-form" onSubmit={submitAnswer}>
              <label className="sr-only" htmlFor="interview-answer">Your answer</label>
              <textarea
                id="interview-answer"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={4}
                placeholder={isListening ? "Listening... speak naturally" : "Type your answer, or use the microphone..."}
                disabled={busy}
              />
              <div className="interview-answer-actions">
                <button className={isListening ? "interview-voice-button listening" : "interview-voice-button"} type="button" onClick={toggleVoiceCapture} disabled={busy || !supportsVoice} title={supportsVoice ? "Answer using your microphone" : "Voice capture is not available in this browser"}>
                  <Mic2 size={16} /> {isListening ? "Stop listening" : "Use voice"}
                </button>
                <button className="interview-send-button" type="submit" disabled={busy || !draft.trim()}>
                  Send answer <Send size={15} />
                </button>
              </div>
              {error && <div className="form-error" role="alert">{error}</div>}
            </form>
          )}

          {report && (
            <div className="interview-report">
              <div className="interview-report-score">
                <strong>{report.overallRating}<span>/10</span></strong>
                <div><b>Overall rating</b><small>{report.expectedOutcome}</small></div>
              </div>
              <div className="interview-score-grid">
                {[
                  ["Technical", report.technicalScore],
                  ["Communication", report.communicationScore],
                  ["Problem solving", report.problemSolvingScore],
                  ["Confidence", report.confidenceScore],
                ].map(([label, score]) => (
                  <div className="interview-score-item" key={label}><span>{label}</span><strong>{score}/10</strong></div>
                ))}
              </div>
              <div className="interview-feedback-grid">
                <section><h3>Strengths</h3>{report.strengths?.map((item, index) => <p key={index}><CheckCircle2 size={15} />{item}</p>)}</section>
                <section><h3>Weaknesses</h3>{report.weaknesses?.map((item, index) => <p key={index}>{item}</p>)}</section>
                <section><h3>Areas for improvement</h3>{report.areasForImprovement?.map((item, index) => <p key={index}>{item}</p>)}</section>
                <section className="interview-roadmap"><h3>Personalized learning roadmap</h3>{report.learningRoadmap?.map((item, index) => <p key={index}><b>{index + 1}. {item.title || item}</b>{item.reason && <span>{item.reason}</span>}</p>)}</section>
              </div>
              {saveMessage && <div className="result-note">{saveMessage}</div>}
              <button className="interview-restart-button" type="button" onClick={startAnotherInterview}><RotateCcw size={15} /> Start another interview</button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}