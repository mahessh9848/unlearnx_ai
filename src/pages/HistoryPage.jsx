import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  TrendingUp,
  Trash2,
  ArrowRight,
  History,
  ChevronRight,
  AlertCircle,
  Search,
  RefreshCw,
  Loader2,
  Layers,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  fetchUserAnalyses,
  deleteUserAnalysis,
  clearUserAnalyses,
} from "../services/historyService";

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function riskColor(risk) {
  if (risk == null) return "var(--text-muted)";
  if (risk <= 33) return "var(--green)";
  if (risk <= 66) return "var(--yellow)";
  return "var(--accent-red)";
}

function riskLabel(risk) {
  if (risk == null) return "—";
  if (risk <= 33) return "Low Risk";
  if (risk <= 66) return "Med Risk";
  return "High Risk";
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserAnalyses(user.id);
      setEntries(data || []);
    } catch (err) {
      console.error("History fetch error:", err);
      setError("Failed to load your analysis history. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!id || !user?.id) return;
    try {
      setDeletingId(id);
      const success = await deleteUserAnalysis(id, user.id);
      if (success) {
        setEntries((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    if (!user?.id) return;
    try {
      setLoading(true);
      const success = await clearUserAnalyses(user.id);
      if (success) {
        setEntries([]);
      }
      setConfirmClear(false);
    } catch (err) {
      console.error("Clear failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (entry) => {
    navigate("/results", {
      state: {
        results: entry.results,
        formData: entry.formData,
        fromHistory: true,
        savedAt: entry.createdAt,
      },
    });
  };

  // Extract unique industries for filter pills
  const industries = useMemo(() => {
    const set = new Set();
    entries.forEach((e) => {
      if (e.targetIndustry) set.add(e.targetIndustry);
    });
    return Array.from(set);
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.careerGoal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.currentSkills?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetIndustry?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesIndustry =
        selectedIndustry === "all" || item.targetIndustry === selectedIndustry;

      return matchesSearch && matchesIndustry;
    });
  }, [entries, searchQuery, selectedIndustry]);

  return (
    <div className="history-page">
      {/* Header */}
      <div className="history-header">
        <div className="history-header-top">
          <div className="history-title-group">
            <div className="history-icon-wrap">
              <History size={24} color="var(--accent-red)" />
            </div>
            <div>
              <h1 className="history-title">Recent Career Analyses</h1>
              <p className="history-subtitle">
                Your saved learning intelligence reports. Click any analysis to restore the exact roadmap.
              </p>
            </div>
          </div>

          <div className="history-actions">
            <button className="btn-ghost" onClick={() => navigate("/analyze")}>
              <TrendingUp size={15} />
              <span>New Analysis</span>
            </button>
            {entries.length > 0 && (
              <button
                className={`btn-danger-ghost ${confirmClear ? "confirming" : ""}`}
                onClick={handleClearAll}
              >
                <Trash2 size={15} />
                <span>{confirmClear ? "Confirm Clear All" : "Clear All"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        {entries.length > 0 && (
          <div className="history-filter-bar">
            <div className="history-search-wrap">
              <Search size={16} className="history-search-icon" />
              <input
                type="text"
                className="history-search-input"
                placeholder="Search by goal, industry, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="history-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </button>
              )}
            </div>

            {industries.length > 0 && (
              <div className="history-industry-pills">
                <button
                  className={`history-pill ${selectedIndustry === "all" ? "active" : ""}`}
                  onClick={() => setSelectedIndustry("all")}
                >
                  All ({entries.length})
                </button>
                {industries.map((ind) => (
                  <button
                    key={ind}
                    className={`history-pill ${selectedIndustry === ind ? "active" : ""}`}
                    onClick={() => setSelectedIndustry(ind)}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="history-loading-container">
          <div className="history-skeleton-card" />
          <div className="history-skeleton-card" />
          <div className="history-skeleton-card" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="history-error-container">
          <AlertCircle size={36} color="var(--accent-red)" />
          <h3>Unable to load analyses</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadData}>
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && entries.length === 0 && (
        <div className="history-empty">
          <div className="history-empty-icon">
            <Sparkles size={36} color="var(--accent-red)" />
          </div>
          <h2 className="history-empty-title">No analyses yet</h2>
          <p className="history-empty-desc">
            Complete your first career assessment to discover high-value skills and build a personalized 6-month roadmap.
          </p>
          <button
            className="hero-v2-cta"
            style={{ marginTop: 24 }}
            onClick={() => navigate("/analyze")}
          >
            <span>Start Your First Analysis</span>
            <ArrowRight size={17} />
          </button>
        </div>
      )}

      {/* Filtered Empty State */}
      {!loading && !error && entries.length > 0 && filteredEntries.length === 0 && (
        <div className="history-empty-filtered">
          <p>No analyses match your search criteria.</p>
          <button
            className="btn-ghost"
            onClick={() => {
              setSearchQuery("");
              setSelectedIndustry("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Analysis Card List */}
      {!loading && !error && filteredEntries.length > 0 && (
        <div className="history-list">
          {filteredEntries.map((entry) => {
            const {
              id,
              careerGoal,
              targetIndustry,
              experienceLevel,
              priority,
              careerScore,
              careerRisk,
              createdAt,
              results,
              summary,
            } = entry;

            const toLearnCount = results?.skillsToLearn?.length || 0;
            const toAvoidCount = results?.skillsToAvoid?.length || 0;
            const altsCount = results?.betterAlternatives?.length || 0;

            return (
              <div
                className={`history-card ${deletingId === id ? "deleting" : ""}`}
                key={id}
                onClick={() => handleView(entry)}
              >
                <div className="history-card-main">
                  <div className="history-card-top">
                    <h3 className="history-card-goal">{careerGoal || "Career Analysis"}</h3>
                    <span className="history-card-time">
                      <Clock size={12} />
                      {timeAgo(createdAt)}
                    </span>
                  </div>

                  <div className="history-card-tags">
                    {targetIndustry && (
                      <span className="history-tag history-tag-blue">{targetIndustry}</span>
                    )}
                    {experienceLevel && (
                      <span className="history-tag history-tag-muted">{experienceLevel}</span>
                    )}
                    {priority && (
                      <span className="history-tag history-tag-purple">{priority}</span>
                    )}
                  </div>

                  {summary && (
                    <p className="history-card-summary-snippet">
                      {summary.length > 140 ? `${summary.substring(0, 140)}...` : summary}
                    </p>
                  )}

                  <div className="history-card-stats">
                    {/* Career Score */}
                    <div className="history-stat">
                      <span
                        className="history-stat-val"
                        style={{
                          color:
                            careerScore != null
                              ? careerScore >= 70
                                ? "var(--green)"
                                : careerScore >= 45
                                ? "var(--yellow)"
                                : "var(--accent-red)"
                              : "var(--text-muted)",
                        }}
                      >
                        {careerScore != null ? careerScore : "—"}
                      </span>
                      <span className="history-stat-label">Score</span>
                    </div>

                    {/* Risk Badge */}
                    <div className="history-stat">
                      <span
                        className="history-stat-val"
                        style={{ color: riskColor(careerRisk) }}
                      >
                        {riskLabel(careerRisk)}
                      </span>
                      <span className="history-stat-label">Risk</span>
                    </div>

                    {/* Skills to Learn */}
                    <div className="history-stat">
                      <span className="history-stat-val" style={{ color: "var(--blue)" }}>
                        {toLearnCount}
                      </span>
                      <span className="history-stat-label">Learn</span>
                    </div>

                    {/* Skills to Avoid */}
                    <div className="history-stat">
                      <span className="history-stat-val" style={{ color: "var(--accent-red)" }}>
                        {toAvoidCount}
                      </span>
                      <span className="history-stat-label">Avoid</span>
                    </div>

                    {/* Alternatives */}
                    <div className="history-stat">
                      <span className="history-stat-val" style={{ color: "var(--green)" }}>
                        {altsCount}
                      </span>
                      <span className="history-stat-label">Alt</span>
                    </div>
                  </div>

                  <div className="history-card-date">{formatDate(createdAt)}</div>
                </div>

                {/* Right: actions */}
                <div className="history-card-actions">
                  <button
                    className="history-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(entry);
                    }}
                    title="View full saved analysis"
                  >
                    <span>View</span>
                    <ChevronRight size={15} />
                  </button>
                  <button
                    className="history-delete-btn"
                    onClick={(e) => handleDelete(id, e)}
                    disabled={deletingId === id}
                    title="Delete this analysis"
                  >
                    {deletingId === id ? (
                      <Loader2 size={15} className="spin-icon" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
