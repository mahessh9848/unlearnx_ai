import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, TrendingUp, Trash2, ArrowRight, RotateCcw, History, ChevronRight, AlertCircle } from "lucide-react";
import { loadHistory, deleteHistoryEntry, clearHistory } from "../utils/history";

function timeAgo(isoString) {
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
  return "var(--accent)";
}

function riskLabel(risk) {
  if (risk == null) return "—";
  if (risk <= 33) return "Low";
  if (risk <= 66) return "Medium";
  return "High";
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  function handleDelete(id) {
    deleteHistoryEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearHistory();
    setEntries([]);
    setConfirmClear(false);
  }

  function handleView(entry) {
    navigate("/results", {
      state: {
        results: entry.results,
        formData: entry.formData,
      },
    });
  }

  return (
    <div className="history-page">
      {/* Header */}
      <div className="history-header">
        <div className="history-header-top">
          <div className="history-title-group">
            <div className="history-icon-wrap">
              <History size={22} />
            </div>
            <div>
              <h1 className="history-title">Analysis History</h1>
              <p className="history-subtitle">
                Your recent career intelligence reports — click any entry to view the full results.
              </p>
            </div>
          </div>
          <div className="history-actions">
            <button className="btn-ghost" onClick={() => navigate("/analyze")}>
              <TrendingUp size={15} />
              New Analysis
            </button>
            {entries.length > 0 && (
              <button
                className={`btn-danger-ghost ${confirmClear ? "confirming" : ""}`}
                onClick={handleClearAll}
              >
                <Trash2 size={15} />
                {confirmClear ? "Confirm Clear All" : "Clear All"}
              </button>
            )}
          </div>
        </div>
        {entries.length > 0 && (
          <div className="history-meta">
            <span className="history-count">{entries.length} report{entries.length !== 1 ? "s" : ""}</span>
            <span className="history-meta-dot">·</span>
            <span>Most recent first</span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="history-empty">
          <div className="history-empty-icon">
            <AlertCircle size={40} strokeWidth={1.5} />
          </div>
          <h2 className="history-empty-title">No history yet</h2>
          <p className="history-empty-desc">
            Run your first career analysis and your results will appear here automatically.
          </p>
          <button className="hero-v2-cta" style={{ marginTop: 24 }} onClick={() => navigate("/analyze")}>
            <span>Analyze My Career</span>
            <ArrowRight size={17} />
          </button>
        </div>
      )}

      {/* Entry List */}
      {entries.length > 0 && (
        <div className="history-list">
          {entries.map((entry) => {
            const { formData, summary, savedAt, id } = entry;
            return (
              <div className="history-card" key={id}>
                {/* Left: info */}
                <div className="history-card-main" onClick={() => handleView(entry)}>
                  <div className="history-card-top">
                    <span className="history-card-goal">{formData.careerGoal || "Untitled Analysis"}</span>
                    <span className="history-card-time">
                      <Clock size={12} />
                      {timeAgo(savedAt)}
                    </span>
                  </div>

                  <div className="history-card-tags">
                    {formData.targetIndustry && (
                      <span className="history-tag history-tag-blue">{formData.targetIndustry}</span>
                    )}
                    {formData.experienceLevel && (
                      <span className="history-tag history-tag-muted">{formData.experienceLevel}</span>
                    )}
                    {formData.learningPriority && (
                      <span className="history-tag history-tag-purple">{formData.learningPriority}</span>
                    )}
                  </div>

                  <div className="history-card-stats">
                    {/* Career Score */}
                    <div className="history-stat">
                      <span className="history-stat-val" style={{
                        color: summary.careerScore != null
                          ? (summary.careerScore >= 70 ? "var(--green)" : summary.careerScore >= 45 ? "var(--yellow)" : "var(--accent)")
                          : "var(--text-muted)"
                      }}>
                        {summary.careerScore != null ? `${summary.careerScore}` : "—"}
                      </span>
                      <span className="history-stat-label">Score</span>
                    </div>
                    {/* Risk */}
                    <div className="history-stat">
                      <span className="history-stat-val" style={{ color: riskColor(summary.careerRisk) }}>
                        {riskLabel(summary.careerRisk)}
                      </span>
                      <span className="history-stat-label">Risk</span>
                    </div>
                    {/* Skills to learn */}
                    <div className="history-stat">
                      <span className="history-stat-val" style={{ color: "var(--blue)" }}>
                        {summary.skillsToLearnCount}
                      </span>
                      <span className="history-stat-label">Learn</span>
                    </div>
                    {/* Skills to avoid */}
                    <div className="history-stat">
                      <span className="history-stat-val" style={{ color: "var(--accent)" }}>
                        {summary.skillsToAvoidCount}
                      </span>
                      <span className="history-stat-label">Avoid</span>
                    </div>
                    {/* Alternatives */}
                    <div className="history-stat">
                      <span className="history-stat-val" style={{ color: "var(--green)" }}>
                        {summary.alternativesCount}
                      </span>
                      <span className="history-stat-label">Alt.</span>
                    </div>
                  </div>

                  <div className="history-card-date">{formatDate(savedAt)}</div>
                </div>

                {/* Right: actions */}
                <div className="history-card-actions">
                  <button
                    className="history-view-btn"
                    onClick={() => handleView(entry)}
                    title="View full results"
                  >
                    View <ChevronRight size={15} />
                  </button>
                  <button
                    className="history-delete-btn"
                    onClick={() => handleDelete(id)}
                    title="Delete this entry"
                  >
                    <Trash2 size={15} />
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
