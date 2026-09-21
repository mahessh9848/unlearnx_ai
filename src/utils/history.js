// Utility functions for persisting analysis history in localStorage

const STORAGE_KEY = "unlearnx_history";
const MAX_ENTRIES = 20;

/**
 * Load all history entries from localStorage.
 * Returns an array sorted newest-first.
 */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save a new analysis result to history.
 * Deduplicates by matching career goal + industry + same day.
 * @param {object} formData - The form inputs used for the analysis
 * @param {object} results - The AI analysis results
 * @returns {string} The ID of the saved entry
 */
export function saveToHistory(formData, results) {
  const entries = loadHistory();

  const newEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
    formData: {
      careerGoal: formData.careerGoal || "",
      targetIndustry: formData.targetIndustry || "",
      experienceLevel: formData.experienceLevel || "",
      learningPriority: formData.learningPriority || "",
      currentSkills: formData.currentSkills || "",
    },
    summary: {
      careerScore: results.careerScore ?? null,
      careerRisk: results.careerRisk ?? null,
      skillsToLearnCount: results.skillsToLearn?.length ?? 0,
      skillsToAvoidCount: results.skillsToAvoid?.length ?? 0,
      alternativesCount: results.betterAlternatives?.length ?? 0,
    },
    results,
  };

  // Trim to max entries (newest first)
  const trimmed = [newEntry, ...entries].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage quota exceeded — remove oldest and retry
    const shortened = [newEntry, ...entries].slice(0, Math.floor(MAX_ENTRIES / 2));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortened));
  }
  return newEntry.id;
}

/**
 * Delete a single history entry by id.
 */
export function deleteHistoryEntry(id) {
  const entries = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Clear all history.
 */
export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
