/**
 * historyService.js — Local demo history using localStorage, keyed per-user.
 * No external database or auth service required.
 */

const HISTORY_KEY = "unlearnx_analyses";
const MAX_ENTRIES = 50;

// ── Internal helpers ──────────────────────────────────────────────────────────

function loadAll() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  return [];
}

function saveAll(entries) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // Storage quota — trim and retry
    const trimmed = entries.slice(0, Math.floor(MAX_ENTRIES / 2));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Save a completed analysis for the given user.
 * Returns the saved record.
 */
export async function saveAnalysisRecord(userId, formData, resultData) {
  if (!userId || !resultData) return null;

  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    createdAt: new Date().toISOString(),
    // Top-level searchable fields (also in formData for backward compat)
    careerGoal:      formData?.careerGoal      || "",
    targetIndustry:  formData?.targetIndustry  || "",
    experienceLevel: formData?.experienceLevel || "",
    priority:        formData?.learningPriority || formData?.priority || "",
    currentSkills:   formData?.currentSkills   || "",
    // Scores
    careerScore: resultData.careerScore ?? null,
    careerRisk:  resultData.careerRisk  ?? null,
    summary:     resultData.summary     || "",
    // Full payload
    formData,
    results: resultData,
  };

  const all = loadAll();
  // Prevent duplicate saves within the same minute for same user+goal
  const isDuplicate = all.some(
    (e) =>
      e.userId === userId &&
      e.careerGoal === record.careerGoal &&
      Math.abs(new Date(e.createdAt) - new Date(record.createdAt)) < 60_000
  );
  if (isDuplicate) return null;

  const updated = [record, ...all].slice(0, MAX_ENTRIES);
  saveAll(updated);
  return record;
}

/**
 * Fetch all analyses for a specific user, sorted newest-first.
 */
export async function fetchUserAnalyses(userId) {
  if (!userId) return [];
  const all = loadAll();
  return all.filter((e) => e.userId === userId);
}

/**
 * Fetch a single analysis by ID for the given user.
 */
export async function fetchAnalysisById(analysisId, userId) {
  if (!analysisId || !userId) return null;
  const all = loadAll();
  return all.find((e) => e.id === analysisId && e.userId === userId) || null;
}

/**
 * Delete a specific analysis for the given user.
 */
export async function deleteUserAnalysis(analysisId, userId) {
  if (!analysisId || !userId) return false;
  const all = loadAll();
  const filtered = all.filter(
    (e) => !(e.id === analysisId && e.userId === userId)
  );
  saveAll(filtered);
  return true;
}

/**
 * Clear all analyses for the given user.
 */
export async function clearUserAnalyses(userId) {
  if (!userId) return false;
  const all = loadAll();
  saveAll(all.filter((e) => e.userId !== userId));
  return true;
}
