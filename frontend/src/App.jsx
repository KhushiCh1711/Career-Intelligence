import React, { useState } from "react";
import { LayoutGrid, Target, BookOpen, BarChart3, MessageSquare, Users, Bookmark, ClipboardCheck, Code2, FolderKanban, Github, Activity, Mic2, Building2 } from "lucide-react";
import { C, FONT } from "./theme.js";
import { useAuth } from "./context/AuthContext.jsx";
import SignIn from "./pages/SignIn.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AssistantPanel from "./components/AssistantPanel.jsx";
import Settings from "./pages/Settings.jsx";
import StudentOverview from "./pages/student/Overview.jsx";
import StudentSkills from "./pages/student/Skills.jsx";
import StudentRoadmap from "./pages/student/Roadmap.jsx";
import StudentInsights from "./pages/student/Insights.jsx";
import UniversityOverview from "./pages/university/Overview.jsx";
import UniversityDirectory from "./pages/university/Directory.jsx";
import CompanyOverview from "./pages/company/Overview.jsx";
import CompanySaved from "./pages/company/Saved.jsx";
import Assessment from "./pages/student/Assessment.jsx";
import CodingChallenges from "./pages/student/CodingChallenges.jsx";
import Projects from "./pages/student/Projects.jsx";
import GithubPage from "./pages/student/Github.jsx";
import InterviewSimulator from "./pages/student/InterviewSimulator.jsx";

const NAV_BY_ROLE = {
  student: [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "assessment", label: "Assessment Center", icon: ClipboardCheck },
    { id: "coding", label: "Coding Challenges", icon: Code2 },
    { id: "projects", label: "My Projects", icon: FolderKanban },
    { id: "github", label: "GitHub Connection", icon: Github },
    { id: "skills", label: "Skill Progress", icon: Target },
    { id: "interview", label: "Interview Simulator", icon: Mic2 },
    { id: "insights", label: "Company Readiness", icon: Building2 },
    { id: "roadmap", label: "Learning Roadmap", icon: BookOpen },
    { id: "assistant", label: "AI assistant", icon: MessageSquare },
  ],
  university: [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "directory", label: "Student directory", icon: Users },
  ],
  company: [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "saved", label: "Saved candidates", icon: Bookmark },
  ],
};

export default function App() {
  const { user, loading, updateUser } = useAuth();
  const [page, setPage] = useState("overview");
  const [assistantOpen, setAssistantOpen] = useState(false);

  if (loading) return <div className="app-loading" />;
  if (!user) return <SignIn />;
  if (user.role === "student" && user.needsAssessment) return <Assessment onComplete={() => updateUser({ needsAssessment: false })} />;

  const nav = NAV_BY_ROLE[user.role];

  return (
    <div className="app-shell">
      <Sidebar
        nav={nav}
        activePage={page}
        onNavigate={setPage}
        onOpenAssistant={() => setAssistantOpen(true)}
        onSettings={() => setPage("settings")}
        settingsActive={page === "settings"}
      />

      <main className="app-content">
        {user.role === "student" && page === "overview" && <StudentOverview onOpenAssistant={() => setAssistantOpen(true)} />}
        {user.role === "student" && page === "assessment" && <Assessment onComplete={() => updateUser({ needsAssessment: false })} />}
        {user.role === "student" && page === "coding" && <CodingChallenges />}
        {user.role === "student" && page === "projects" && <Projects />}
        {user.role === "student" && page === "github" && <GithubPage />}
        {user.role === "student" && page === "skills" && <StudentSkills />}
        {user.role === "student" && page === "interview" && <InterviewSimulator />}
        {user.role === "student" && page === "roadmap" && <StudentRoadmap />}
        {user.role === "student" && page === "insights" && <StudentInsights />}

        {user.role === "university" && page === "overview" && <UniversityOverview />}
        {user.role === "university" && page === "directory" && <UniversityDirectory />}

        {user.role === "company" && page === "overview" && <CompanyOverview />}
        {user.role === "company" && page === "saved" && <CompanySaved />}

        {page === "settings" && <Settings />}
      </main>

      {assistantOpen && user.role === "student" && (
        <AssistantPanel studentFirstName={user.label.split(" ")[0]} onClose={() => setAssistantOpen(false)} />
      )}
    </div>
  );
}
