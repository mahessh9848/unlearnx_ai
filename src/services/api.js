const API_BASE = "/api";

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function analyzeCareer(formData) {
  const payload = {
    careerGoal: formData.careerGoal,
    currentSkills: formData.currentSkills,
    targetIndustry: formData.targetIndustry,
    experienceLevel: formData.experienceLevel,
    priority: formData.priority,
  };

  let response;
  try {
    response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    if (import.meta.env.DEV) {
      console.warn("Dev mode: API unreachable — returning simulated AI analysis");
      return generateDevMock(formData);
    }
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0
    );
  }

  if (!response.ok) {
    if (import.meta.env.DEV) {
      console.warn(`Dev mode: HTTP ${response.status} — returning simulated AI analysis`);
      return generateDevMock(formData);
    }
    const data = await response.json().catch(() => null);
    const message =
      data?.message ||
      data?.error ||
      `Analysis failed (HTTP ${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  const data = await response.json().catch(() => null);
  if (!data || data.careerScore === undefined) {
    if (import.meta.env.DEV) {
      return generateDevMock(formData);
    }
    throw new ApiError("Received an invalid response from the server.", 502);
  }

  return data;
}

function generateDevMock(formData) {
  const goal = formData.careerGoal || "Software Engineer";
  const industry = formData.targetIndustry || "web-dev";

  return {
    careerScore: 78,
    careerRisk: 22,
    marketDemand: 85,
    futureGrowth: 80,
    automationRisk: 28,
    skillRelevance: 83,
    skillsToLearn: [
      {
        name: "React & Modern Frontend",
        score: 94,
        priority: "high",
        reason: `Core technology for achieving "${goal}" — dominant in the ${industry} ecosystem with massive hiring demand.`,
        estimatedHours: 80,
      },
      {
        name: "Node.js & REST APIs",
        score: 88,
        priority: "high",
        reason: "Full-stack capability that dramatically expands job opportunities and freelance rates.",
        estimatedHours: 60,
      },
      {
        name: "TypeScript",
        score: 82,
        priority: "medium",
        reason: "Industry standard for large codebases — increasingly required in job listings.",
        estimatedHours: 40,
      },
      {
        name: "SQL & Database Design",
        score: 74,
        priority: "medium",
        reason: "Foundational skill for backend roles — every application needs data persistence.",
        estimatedHours: 30,
      },
    ],
    skillsToAvoid: [
      {
        name: "AngularJS (1.x)",
        score: 95,
        reason: "AngularJS 1.x reached end-of-life in 2022. It's a completely different framework from the modern Angular (2+). Learning it is actively harmful to your career.",
        marketInsight: "Zero new projects use AngularJS 1.x. Companies still on it are actively migrating away. Job listings for it have declined 95%.",
        alternative: "Angular (latest) or React",
        estimatedHours: 120,
      },
      {
        name: "jQuery",
        score: 80,
        reason: "jQuery was designed to solve browser compatibility issues that no longer exist. Modern vanilla JS and frameworks handle everything jQuery did, better.",
        marketInsight: "jQuery usage in new projects has dropped below 10% for modern tech stacks. Employers see jQuery on a resume as a red flag for outdated skills.",
        alternative: "Vanilla JS or React",
        estimatedHours: 60,
      },
      {
        name: "PHP (standalone)",
        score: 60,
        reason: "While PHP powers WordPress, standalone PHP development has declining demand compared to Node.js, Python, or Go for new projects.",
        marketInsight: "PHP job postings have dropped 40% in 5 years. Most new SaaS products aren't built on PHP. Laravel is the exception but niche.",
        alternative: "Node.js with Express",
        estimatedHours: 100,
      },
    ],
    betterAlternatives: [
      {
        oldSkill: "AngularJS (1.x)",
        newSkill: "React or Angular (latest)",
        reason: "Modern framework with active ecosystem, massive community, and high hiring demand.",
      },
      {
        oldSkill: "jQuery",
        newSkill: "Vanilla JavaScript + Fetch API",
        reason: "Native browser APIs cover everything jQuery did. No library weight, no legacy mental model.",
      },
      {
        oldSkill: "Standalone PHP",
        newSkill: "Node.js + Express",
        reason: "Same language as frontend (JS), larger ecosystem, better suited for modern APIs and microservices.",
      },
    ],
    roadmap: [
      {
        month: 1,
        skills: ["HTML/CSS Mastery", "JavaScript Fundamentals"],
        projects: ["Portfolio Website", "CSS Animation Showcase"],
        estimatedHours: 40,
        outcome: "Build and deploy a professional portfolio with modern CSS and vanilla JS.",
      },
      {
        month: 2,
        skills: ["React Fundamentals", "Component Architecture"],
        projects: ["Todo App with State", "Weather Dashboard"],
        estimatedHours: 50,
        outcome: "Build interactive single-page applications using React hooks and component patterns.",
      },
      {
        month: 3,
        skills: ["Node.js", "REST API Design"],
        projects: ["CRUD API Server", "Authentication System"],
        estimatedHours: 50,
        outcome: "Design and deploy a production-ready REST API with proper error handling and auth.",
      },
      {
        month: 4,
        skills: ["SQL & PostgreSQL", "Database Design"],
        projects: ["Full-stack Blog App"],
        estimatedHours: 40,
        outcome: "Connect a frontend React app to a PostgreSQL backend with real data persistence.",
      },
      {
        month: 5,
        skills: ["TypeScript", "Testing (Jest/Vitest)"],
        projects: ["Type-safe API Refactor", "Test Suite"],
        estimatedHours: 45,
        outcome: "Add type safety and automated tests to an existing project — job-ready code quality.",
      },
      {
        month: 6,
        skills: ["Deployment (Vercel/Railway)", "CI/CD Basics"],
        projects: ["Capstone Full-Stack App"],
        estimatedHours: 40,
        outcome: "Launch a complete full-stack application with CI/CD pipeline — ready for portfolio and job applications.",
      },
    ],
    summary: `Your background in ${formData.currentSkills || "existing skills"} gives you a solid foundation to achieve "${goal}". The key is avoiding time sinks like outdated frameworks and focusing your energy on high-demand technologies that employers actively seek. With this focused roadmap, you can reach your goal in 6 months.`,
    confidence: 91,
  };
}
