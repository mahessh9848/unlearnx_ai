import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  saveToHistory as saveLocalHistory,
  loadHistory as loadLocalHistory,
  deleteHistoryEntry as deleteLocalHistoryEntry,
  clearHistory as clearLocalHistory,
} from "../utils/history";

/**
 * Save a completed career analysis for an authenticated user.
 */
export async function saveAnalysisRecord(userId, formData, resultData) {
  if (!userId || !resultData || resultData.careerScore === undefined) {
    return null;
  }

  // If Supabase is configured, save directly to Postgres table with RLS
  if (isSupabaseConfigured) {
    try {
      const record = {
        user_id: userId,
        career_goal: formData.careerGoal || "Career Goal",
        target_industry: formData.targetIndustry || "General",
        experience_level: formData.experienceLevel || "Mid",
        priority: formData.priority || "Growth",
        current_skills: formData.currentSkills || "",
        career_score: Number(resultData.careerScore) || 0,
        career_risk: Number(resultData.careerRisk) || 0,
        summary: resultData.summary || "",
        result_data: resultData,
      };

      const { data, error } = await supabase
        .from("analysis_history")
        .insert([record])
        .select()
        .single();

      if (error) {
        console.error("Supabase saveAnalysis error:", error);
        // Fallback to local storage on error
        saveLocalHistory(formData, resultData);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Exception saving analysis to Supabase:", err);
      saveLocalHistory(formData, resultData);
      return null;
    }
  }

  // If Supabase is not configured, fallback to localStorage
  return saveLocalHistory(formData, resultData);
}

/**
 * Fetch all history entries for the authenticated user, sorted newest-first.
 */
export async function fetchUserAnalyses(userId) {
  if (!userId) return [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("analysis_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading Supabase history:", error);
        throw error;
      }

      // Map Supabase rows to consistent format
      return (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        createdAt: row.created_at,
        careerGoal: row.career_goal,
        targetIndustry: row.target_industry,
        experienceLevel: row.experience_level,
        priority: row.priority,
        currentSkills: row.current_skills,
        careerScore: row.career_score,
        careerRisk: row.career_risk,
        summary: row.summary,
        results: row.result_data,
        formData: {
          careerGoal: row.career_goal,
          targetIndustry: row.target_industry,
          experienceLevel: row.experience_level,
          priority: row.priority,
          currentSkills: row.current_skills,
        },
      }));
    } catch (err) {
      console.error("Failed to fetch analyses from database:", err);
      throw err;
    }
  }

  // Fallback to localStorage
  return loadLocalHistory();
}

/**
 * Fetch a single analysis by ID for the current authenticated user.
 */
export async function fetchAnalysisById(analysisId, userId) {
  if (!analysisId || !userId) return null;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("analysis_history")
        .select("*")
        .eq("id", analysisId)
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        console.error("Error loading specific analysis:", error);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        createdAt: data.created_at,
        careerGoal: data.career_goal,
        targetIndustry: data.target_industry,
        experienceLevel: data.experience_level,
        priority: data.priority,
        currentSkills: data.current_skills,
        careerScore: data.career_score,
        careerRisk: data.career_risk,
        summary: data.summary,
        results: data.result_data,
        formData: {
          careerGoal: data.career_goal,
          targetIndustry: data.target_industry,
          experienceLevel: data.experience_level,
          priority: data.priority,
          currentSkills: data.current_skills,
        },
      };
    } catch (err) {
      console.error("Exception in fetchAnalysisById:", err);
      return null;
    }
  }

  // Local fallback
  const all = loadLocalHistory();
  return all.find((item) => item.id === analysisId) || null;
}

/**
 * Delete a specific analysis record belonging to the authenticated user.
 */
export async function deleteUserAnalysis(analysisId, userId) {
  if (!analysisId || !userId) return false;

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("analysis_history")
        .delete()
        .eq("id", analysisId)
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to delete analysis record:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Exception deleting analysis record:", err);
      return false;
    }
  }

  deleteLocalHistoryEntry(analysisId);
  return true;
}

/**
 * Clear all analysis history records for the authenticated user.
 */
export async function clearUserAnalyses(userId) {
  if (!userId) return false;

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("analysis_history")
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to clear user analyses:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Exception clearing user analyses:", err);
      return false;
    }
  }

  clearLocalHistory();
  return true;
}
