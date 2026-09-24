export const SKILLS = ["JavaScript", "React", "Node.js", "SQL", "System Design", "Python", "TypeScript", "AWS"];

export const SKILL_WEIGHTS = {
  "JavaScript": 0.18,
  "React": 0.15,
  "Node.js": 0.14,
  "SQL": 0.14,
  "System Design": 0.13,
  "Python": 0.12,
  "TypeScript": 0.08,
  "AWS": 0.06,
};

export const ASSESSMENT_QUESTIONS = [
  { id: "q1", skill: "JavaScript", prompt: "What does a JavaScript closure allow a function to do?", options: ["Access variables from its outer scope", "Run only once", "Convert code to HTML", "Connect directly to a database"], answer: 0 },
  { id: "q2", skill: "React", prompt: "Which React hook is used to store state in a function component?", options: ["useEffect", "useState", "useMemo", "useRef"], answer: 1 },
  { id: "q3", skill: "Node.js", prompt: "Which built-in Node.js module is commonly used to create an HTTP server?", options: ["http", "path", "events", "crypto"], answer: 0 },
  { id: "q4", skill: "SQL", prompt: "Which SQL clause filters rows after selecting from a table?", options: ["ORDER BY", "GROUP BY", "WHERE", "CREATE"], answer: 2 },
  { id: "q5", skill: "System Design", prompt: "What is the main purpose of a load balancer?", options: ["Store passwords", "Distribute traffic across servers", "Compile JavaScript", "Design database tables"], answer: 1 },
  { id: "q6", skill: "Python", prompt: "Which Python data type stores key-value pairs?", options: ["list", "tuple", "set", "dict"], answer: 3 },
  { id: "q7", skill: "TypeScript", prompt: "What does TypeScript add to JavaScript?", options: ["Static type checking", "A new database", "CSS styling", "A web server"], answer: 0 },
  { id: "q8", skill: "AWS", prompt: "Which AWS service is designed to store files as objects?", options: ["EC2", "S3", "Lambda", "RDS"], answer: 1 },
  { id: "q9", skill: "JavaScript", prompt: "What does an async function return?", options: ["A Promise", "Only a string", "A database connection", "A CSS rule"], answer: 0 },
  { id: "q10", skill: "React", prompt: "Why is a key prop used when rendering a React list?", options: ["To hide the list", "To help React identify items between renders", "To encrypt the item", "To call an API"], answer: 1 },
];

export function computeReadiness(skillsMap) {
  const skills = skillsMap && typeof skillsMap === "object" ? skillsMap : {};
  return Math.round(
    SKILLS.reduce((sum, sk) => sum + (Number(skills[sk]) || 0) * SKILL_WEIGHTS[sk], 0)
  );
}

export function computeEvidenceBoost(evidence = {}) {
  const projectScore = Math.min(100, Number(evidence.projectScore) || 0);
  const codingScore = Math.min(100, Number(evidence.codingScore) || 0);
  const interviewScore = Math.min(100, Number(evidence.interviewScore) || 0);
  const githubScore = Math.min(100, Number(evidence.githubScore) || 0);
  return Math.round(projectScore * 0.1 + codingScore * 0.08 + interviewScore * 0.05 + githubScore * 0.02);
}

export function computeMatch(skillsMap, requiredMap) {
  const skills = skillsMap && typeof skillsMap === "object" ? skillsMap : {};
  const requirements = requiredMap && typeof requiredMap === "object" ? requiredMap : {};
  const entries = Object.entries(requirements);
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, [sk, threshold]) => {
    const required = Number(threshold);
    return sum + (required > 0 ? Math.min(1, (Number(skills[sk]) || 0) / required) : 0);
  }, 0);
  return Math.round((total / entries.length) * 100);
}

export function tierColor(value) {
  if (value >= 70) return "strong";
  if (value >= 40) return "developing";
  return "weak";
}
