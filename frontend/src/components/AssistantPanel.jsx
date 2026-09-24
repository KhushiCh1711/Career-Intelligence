import React, { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { C, FONT } from "../theme.js";
import { api } from "../api/client.js";

const pillBtnStyle = {
  textAlign: "left", background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8,
  padding: "7px 10px", fontSize: 12.5, color: C.ink, cursor: "pointer", fontFamily: FONT,
};

export default function AssistantPanel({ studentFirstName, onClose }) {
  const [language, setLanguage] = useState("english"); // "english" | "hinglish"
  const [messages, setMessages] = useState([
    { from: "ai", text: `Hi ${studentFirstName}. Ask me anything — career advice, your skills, or anything else on your mind.` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (text) => {
    if (!text.trim() || busy) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await api.post("/ai/ask", { question: text, language });
      setMessages((m) => [...m, { from: "ai", text: reply }]);
    } catch {
      setMessages((m) => [...m, { from: "ai", text: "Sorry, I couldn't reach the assistant just now." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, width: 340, background: C.card, borderRadius: 14,
      border: `1px solid ${C.border}`, boxShadow: "0 12px 32px rgba(0,0,0,0.18)", zIndex: 50, fontFamily: FONT,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.green900, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink }}>Pathway AI</div>
            <div style={{ fontSize: 11.5, color: C.sub }}>Your career copilot</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.sub }}><X size={17} /></button>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "10px 14px 0" }}>
        {["english", "hinglish"].map((lang) => (
          <button key={lang} onClick={() => setLanguage(lang)} style={{
            flex: 1, border: `1px solid ${language === lang ? C.green600 : C.border}`,
            background: language === lang ? C.green900 : "transparent", color: language === lang ? "#fff" : C.sub,
            borderRadius: 7, padding: "5px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
          }}>{lang === "english" ? "English" : "Hinglish"}</button>
        ))}
      </div>

      <div style={{ padding: 14, maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.from === "ai" ? "flex-start" : "flex-end",
            background: m.from === "ai" ? C.cardAlt : C.green100,
            border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 11px", fontSize: 13.5, color: C.ink, maxWidth: "88%", lineHeight: 1.4,
          }}>{m.text}</div>
        ))}
        {busy && <div style={{ fontSize: 12, color: C.sub }}>Thinking…</div>}
      </div>
      <div style={{ padding: "0 14px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
        <button onClick={() => send("What should I learn next?")} style={pillBtnStyle}>What should I learn next?</button>
        <button onClick={() => send("How can I improve my score?")} style={pillBtnStyle}>How can I improve my score?</button>
      </div>
      <div style={{ display: "flex", gap: 6, padding: 12, borderTop: `1px solid ${C.border}` }}>
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={language === "hinglish" ? "Kuch bhi pucho..." : "Ask anything about your path..."}
          style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", fontFamily: FONT }}
        />
        <button onClick={() => send(input)} style={{ background: C.green900, border: "none", borderRadius: 8, width: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Send size={14} color="#fff" />
        </button>
      </div>
    </div>
  );
}
