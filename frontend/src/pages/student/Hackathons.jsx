import React from "react";
import { BellRing, CalendarDays, ExternalLink, Trophy } from "lucide-react";
import { C } from "../../theme.js";

const alerts = [
  {
    platform: "Unstop",
    name: "Open hackathons",
    scope: "India-focused",
    highlight: "Student competitions with current registration status",
    url: "https://unstop.com/hackathons?oppstatus=open",
  },
  {
    platform: "Devfolio",
    name: "Hackathons",
    scope: "Global and online",
    highlight: "Builder events across web3, AI, and emerging technology",
    url: "https://devfolio.co/hackathons",
  },
  {
    platform: "Devpost",
    name: "Online hackathons",
    scope: "Global",
    highlight: "Remote events across software, data, and emerging tech",
    url: "https://devpost.com/hackathons",
  },
  {
    platform: "Major League Hacking",
    name: "Student hackathon events",
    scope: "2026 season",
    highlight: "Student hackathons hosted by university communities",
    url: "https://mlh.io/seasons/2026/events",
  },
];

export default function HackathonsPage() {
  return (
    <div className="tool-page" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className="tool-heading">
        <div>
          <div className="tool-kicker">Opportunities feed</div>
          <h1>Hackathon alerts</h1>
          <p>Browse live event directories. Listings and registration status are maintained by each platform.</p>
        </div>
        <BellRing size={30} color={C.green700} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, marginTop: 18 }}>
        {alerts.map((item) => (
          <div key={`${item.platform}-${item.name}`} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ color: C.green700, fontWeight: 700 }}>{item.platform}</div>
              <div style={{ background: C.green100, color: C.green700, borderRadius: 999, padding: "5px 8px", fontSize: 11, fontWeight: 700 }}>{item.scope}</div>
            </div>

            <div style={{ fontWeight: 800, color: C.ink, marginTop: 14, marginBottom: 8 }}>{item.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.sub, fontSize: 14, marginBottom: 8 }}>
              <CalendarDays size={14} />
              Live listings
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.sub, fontSize: 14, marginBottom: 10 }}>
              <Trophy size={14} />
              {item.highlight}
            </div>
            <a href={item.url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 10, background: C.green900, color: "#fff", padding: "10px 12px", fontWeight: 700, textDecoration: "none" }}>
              View details <ExternalLink size={14} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
