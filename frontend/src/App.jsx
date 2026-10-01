import React, { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { api } from "./api/client.js";
import SignIn from "./pages/SignIn.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { LayoutGrid, Target, BookOpen, MessageSquare, Code2, FolderKanban, Mic2, Building2, BriefcaseBusiness, Sparkles, BellRing } from "lucide-react";
import AssistantPanel from "./components/AssistantPanel.jsx";
import Settings from "./pages/Settings.jsx";
import StudentOverview from "./pages/student/Overview.jsx";
import StudentSkills from "./pages/student/Skills.jsx";
import StudentRoadmap from "./pages/student/Roadmap.jsx";
import StudentInsights from "./pages/student/Insights.jsx";
import CodingChallenges from "./pages/student/CodingChallenges.jsx";
import Projects from "./pages/student/Projects.jsx";
import InterviewSimulator from "./pages/student/InterviewSimulator.jsx";
import CareerStudio from "./pages/student/CareerStudio.jsx";
import StudentFieldFlow from "./pages/student/FieldInterestFlow.jsx";
import CollegeReadiness from "./pages/student/CollegeReadiness.jsx";
import HackathonsPage from "./pages/student/Hackathons.jsx";

const PROFILE_STORAGE_KEY = "pathway-student-profile";

const readStudentProfile = () => {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { fields: [], onboardingComplete: false };
  } catch (error) {
    return { fields: [], onboardingComplete: false };
  }
};

const NAV_BY_ROLE = {
  student: [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "coding", label: "Coding Challenges", icon: Code2 },
    { id: "projects", label: "My Projects", icon: FolderKanban },
    { id: "skills", label: "Skill Progress", icon: Target },
    { id: "college-readiness", label: "College Readiness", icon: Building2 },
    { id: "interview", label: "Interview Simulator", icon: Mic2 },
    { id: "hackathons", label: "Hackathons & Alerts", icon: BellRing },
    { id: "insights", label: "Company Readiness", icon: Sparkles },
    { id: "studio", label: "Career Studio", icon: BriefcaseBusiness },
    { id: "roadmap", label: "Learning Roadmap", icon: BookOpen },
    { id: "assistant", label: "AI assistant", icon: MessageSquare },
  ],
};

export default function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("overview");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState(readStudentProfile);
  const [studentAssessmentComplete, setStudentAssessmentComplete] = useState(false);

  useEffect(() => {
    if (user?.role === "student") {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(studentProfile));
    }
  }, [studentProfile, user]);

  useEffect(() => {
    if (user?.role !== "student") return;
    api.get("/students/me")
      .then((data) => {
        const saved = Array.isArray(data.interestFields) ? data.interestFields : [];
        const onboardingReady = Boolean(saved.length > 0 || data.assessmentComplete);
        setStudentProfile((current) => ({
          ...current,
          fields: saved,
          onboardingComplete: onboardingReady,
        }));
        setStudentAssessmentComplete(Boolean(data.assessmentComplete));
      })
      .catch(() => {
        setStudentProfile((current) => ({
          ...current,
          onboardingComplete: false,
        }));
      });
  }, [user]);

  if (loading) return <div className="app-loading" />;
  if (!user) return <SignIn />;

  const nav = NAV_BY_ROLE[user.role] || [];
  const studentOnboarded = Boolean(
    user.role === "student" &&
      (studentProfile?.onboardingComplete || (studentProfile?.fields && studentProfile.fields.length > 0) || studentAssessmentComplete)
  );
  const showStudentOnboarding = user.role === "student" && !studentOnboarded;

  const handleProfileComplete = async (entry) => {
    if (entry) {
      try {
        const response = await api.post("/students/me/field-profile", { profile: entry });
        const saved = Array.isArray(response.interestFields) ? response.interestFields : [];
        const onboardingReady = saved.length > 0 || Boolean(entry?.score !== undefined || entry?.months !== undefined);
        setStudentProfile((current) => ({
          ...current,
          fields: saved,
          onboardingComplete: onboardingReady,
        }));
        setStudentAssessmentComplete(true);
        return;
      } catch (error) {
        console.warn("Unable to save onboarding profile to server", error);
      }
    }

    setStudentProfile((current) => {
      const previous = current && Array.isArray(current.fields) ? current.fields : [];
      const next = entry ? [...previous, entry] : previous;
      return {
        ...current,
        fields: next,
        onboardingComplete: true,
      };
    });
    setStudentAssessmentComplete(true);
  };

  return (
    <div className="app-shell">
      {!showStudentOnboarding && (
        <Sidebar
          nav={nav}
          activePage={page}
          onNavigate={setPage}
          onOpenAssistant={() => setAssistantOpen(true)}
          onSettings={() => setPage("settings")}
          settingsActive={page === "settings"}
        />
      )}

      <main className="app-content">
        {showStudentOnboarding && <StudentFieldFlow onComplete={handleProfileComplete} />}
        {user.role === "student" && studentOnboarded && page === "overview" && <StudentOverview onOpenAssistant={() => setAssistantOpen(true)} />}
        {user.role === "student" && studentOnboarded && page === "coding" && <CodingChallenges />}
        {user.role === "student" && studentOnboarded && page === "projects" && <Projects />}
        {user.role === "student" && studentOnboarded && page === "skills" && <StudentSkills />}
        {user.role === "student" && studentOnboarded && page === "college-readiness" && <CollegeReadiness profile={studentProfile} />}
        {user.role === "student" && studentOnboarded && page === "interview" && <InterviewSimulator />}
        {user.role === "student" && studentOnboarded && page === "hackathons" && <HackathonsPage />}
        {user.role === "student" && studentOnboarded && page === "roadmap" && <StudentRoadmap />}
        {user.role === "student" && studentOnboarded && page === "insights" && <StudentInsights />}
        {user.role === "student" && studentOnboarded && page === "studio" && <CareerStudio />}

        {page === "settings" && <Settings />}
      </main>

      {assistantOpen && user.role === "student" && (
        <AssistantPanel studentFirstName={user.label.split(" ")[0]} onClose={() => setAssistantOpen(false)} />
      )}
    </div>
  );
}
