import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are UnlearnX, a career intelligence AI. You analyze a user's career profile and return a structured JSON assessment.

IMPORTANT RULES:
- Return ONLY valid JSON. No markdown, no code fences, no explanations outside the JSON.
- Use honest, helpful language. Say "AI assessment" or "estimated relevance" instead of claiming real-time market data.
- Be specific and actionable in recommendations.
- The roadmap should span 6 months with concrete skills, projects, and outcomes.
- Scores should be realistic integers from 0-100.
- Confidence should reflect how specific the user's input was.
- opportunityCost on skillsToAvoid should be 0-100 (higher = bigger waste of time to learn it).

Return this exact JSON structure:
{
  "careerScore": <integer 0-100, overall career alignment score>,
  "careerRisk": <integer 0-100, higher = more risk>,
  "marketDemand": <integer 0-100>,
  "futureGrowth": <integer 0-100>,
  "automationRisk": <integer 0-100>,
  "skillRelevance": <integer 0-100>,
  "skillsToLearn": [
    {
      "name": "<skill name>",
      "score": <integer 0-100, importance score>,
      "priority": "<high|medium|low>",
      "reason": "<why this skill matters for their goal>",
      "estimatedHours": <integer, estimated hours to learn>
    }
  ],
  "skillsToAvoid": [
    {
      "name": "<skill name or technology>",
      "score": <integer 0-100, opportunity cost — higher means more wasteful to pursue>,
      "reason": "<why to deprioritize — be specific and direct>",
      "marketInsight": "<one concrete market fact: e.g. job listings, company migration trends, adoption rates>",
      "alternative": "<what to learn instead>",
      "estimatedHours": <integer, hours wasted if they pursue this skill>
    }
  ],
  "betterAlternatives": [
    {
      "oldSkill": "<current/outdated skill>",
      "newSkill": "<recommended replacement>",
      "reason": "<why the new skill is better>"
    }
  ],
  "roadmap": [
    {
      "month": <integer 1-6>,
      "skills": ["<skill1>", "<skill2>"],
      "projects": ["<project idea>"],
      "estimatedHours": <integer>,
      "outcome": "<what they'll achieve this month>"
    }
  ],
  "summary": "<2-3 sentence personalized career summary>",
  "confidence": <integer 0-100, how confident the AI is in this assessment>
}

Provide 4-6 items in skillsToLearn, 3-5 in skillsToAvoid, 3-5 in betterAlternatives, and exactly 6 months in roadmap.`;

function buildUserPrompt(data) {
  return `Analyze this career profile and return the JSON assessment:

Career Goal: ${data.careerGoal}
Current Skills: ${data.currentSkills}
Target Industry: ${data.targetIndustry}
Experience Level: ${data.experienceLevel}
Career Priority: ${data.priority}`;
}

function validateInput(data) {
  const required = ["careerGoal", "currentSkills", "targetIndustry", "experienceLevel", "priority"];
  const missing = required.filter((key) => !data[key] || String(data[key]).trim() === "");
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`;
  }
  return null;
}

function parseAIResponse(text) {
  let cleaned = text.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned);
}

function validateAIOutput(data) {
  const requiredKeys = [
    "careerScore", "careerRisk", "marketDemand", "futureGrowth",
    "automationRisk", "skillRelevance", "skillsToLearn", "skillsToAvoid",
    "betterAlternatives", "roadmap", "summary", "confidence"
  ];
  const missing = requiredKeys.filter((k) => data[k] === undefined);
  if (missing.length > 0) {
    throw new Error(`AI response missing fields: ${missing.join(", ")}`);
  }
  if (!Array.isArray(data.skillsToLearn) || !Array.isArray(data.skillsToAvoid) ||
      !Array.isArray(data.betterAlternatives) || !Array.isArray(data.roadmap)) {
    throw new Error("AI response has invalid array fields");
  }
  return data;
}

export default async function handler(req) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers }
    );
  }

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return new Response(
      JSON.stringify({
        error: "API configuration error",
        message: "The Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.",
      }),
      { status: 500, headers }
    );
  }

  try {
    const body = await req.json();

    // Validate input
    const validationError = validateInput(body);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: "Invalid input", message: validationError }),
        { status: 400, headers }
      );
    }

    // Call Gemini
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildUserPrompt(body),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    // Extract text — handle both property and method variants
    const text = typeof response.text === "function" ? response.text() : response.text;

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Empty AI response", message: "The AI returned no content. Please try again." }),
        { status: 502, headers }
      );
    }

    // Parse and validate
    let parsed;
    try {
      parsed = parseAIResponse(text);
    } catch (parseErr) {
      console.error("JSON parse error. Raw AI output:", text);
      return new Response(
        JSON.stringify({
          error: "Invalid AI response format",
          message: "The AI did not return valid JSON. Please try again.",
        }),
        { status: 502, headers }
      );
    }

    const validated = validateAIOutput(parsed);

    return new Response(JSON.stringify(validated), { status: 200, headers });
  } catch (err) {
    console.error("Analyze function error:", err);

    // Rate limit detection
    if (err.status === 429 || (err.message && err.message.includes("429"))) {
      return new Response(
        JSON.stringify({
          error: "Rate limited",
          message: "Too many requests. Please wait a moment and try again.",
        }),
        { status: 429, headers }
      );
    }

    // Network / API errors
    return new Response(
      JSON.stringify({
        error: "Analysis failed",
        message: err.message || "An unexpected error occurred while analyzing your career profile.",
      }),
      { status: 502, headers }
    );
  }
}

export const config = {
  path: "/api/analyze",
};
