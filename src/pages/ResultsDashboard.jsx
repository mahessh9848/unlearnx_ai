import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { RefreshCw, TrendingUp, Shield, Cpu, ArrowRight, AlertTriangle, BarChart3, Rocket, Clock, Check } from "lucide-react";
import RadialScore from "../components/RadialScore";
import { saveToHistory } from "../utils/history";

export default function ResultsDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results;
  const formData = location.state?.formData;

  // Auto-save to history whenever valid results arrive
  useEffect(() => {
    if (results && formData) {
      saveToHistory(formData, results);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!results) {
    return (
      <div className="loading-page">
        <div className="error-card">
          <div className="error-icon">📊</div>
          <h2 className="error-title">No Results Found</h2>
          <p className="error-message">Please run an analysis first to see your career intelligence dashboard.</p>
          <button className="btn-primary" style={{ maxWidth: 200, margin: "0 auto" }} onClick={() => navigate("/analyze")}>
            Start Analysis
          </button>
        </div>
      </div>
    );
  }

  const riskLevel = results.careerRisk <= 33 ? "low" : results.careerRisk <= 66 ? "medium" : "high";
  const riskLabel = riskLevel === "low" ? "LOW RISK" : riskLevel === "medium" ? "MEDIUM RISK" : "HIGH RISK";
  const industry = formData?.targetIndustry || "your industry";

  // Summary stats for the top row
  const totalTimeSaved = results.skillsToAvoid?.reduce((acc, s) => acc + (s.estimatedHours || 80), 0) || 0;
  const skillsToAvoidCount = results.skillsToAvoid?.length || 0;
  const alternativesCount = results.betterAlternatives?.length || 0;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dash-complete-dot" />
        <h1 className="dashboard-title">Analysis Complete</h1>
        <p className="dashboard-subtitle">
          Based on your goal in {industry}, here's what to avoid — and what to learn instead.
        </p>
      </div>

      {/* Summary Stats Row */}
      <div className="results-stats-row">
        <div className="results-stat-card">
          <div className="results-stat-icon">🚫</div>
          <div className="results-stat-num" style={{ color: "var(--accent)" }}>{skillsToAvoidCount}</div>
          <div className="results-stat-label">SKILLS TO AVOID</div>
        </div>
        <div className="results-stat-card">
          <div className="results-stat-icon">⏱</div>
          <div className="results-stat-num" style={{ color: "var(--yellow)" }}>{totalTimeSaved}h</div>
          <div className="results-stat-label">TIME SAVED</div>
        </div>
        <div className="results-stat-card">
          <div className="results-stat-icon">🚀</div>
          <div className="results-stat-num" style={{ color: "var(--green)" }}>{alternativesCount}</div>
          <div className="results-stat-label">BETTER ALTERNATIVES</div>
        </div>
      </div>

      {/* Score + Metrics Grid */}
      <div className="score-grid">
        <div className="score-main-card">
          <RadialScore
            score={results.careerScore}
            color={results.careerScore >= 70 ? "var(--green)" : results.careerScore >= 40 ? "var(--yellow)" : "var(--accent)"}
            label="Career Score"
          />
          <div style={{ marginTop: 12 }}>
            <span className={`risk-badge risk-${riskLevel}`}>{riskLabel}</span>
          </div>
          <p className="score-main-goal">"{formData?.careerGoal || "Your career path"}"</p>
        </div>

        <div className="score-metrics-card">
          <div className="score-metrics-title">
            <BarChart3 size={18} /> Career Metrics
          </div>
          <MetricRow label="Market Demand" value={results.marketDemand} color="var(--green)" />
          <MetricRow label="Future Growth" value={results.futureGrowth} color="var(--blue)" />
          <MetricRow label="Automation Risk" value={results.automationRisk} color="var(--yellow)" />
          <MetricRow label="Skill Relevance" value={results.skillRelevance} color="var(--purple)" />
          <MetricRow label="Career Risk" value={results.careerRisk} color="var(--accent)" />
        </div>
      </div>

      {/* Skills to Avoid — Primary section, matches reference */}
      {results.skillsToAvoid?.length > 0 && (
        <div className="dash-section">
          <h2 className="dash-section-title">
            <Shield size={22} color="var(--accent)" /> Skills to Deprioritize
          </h2>
          <div className="avoid-cards-list">
            {results.skillsToAvoid.map((skill, i) => {
              const oppCost = skill.score ?? 0;
              const isHigh = oppCost >= 60;
              const isMed = oppCost >= 30 && oppCost < 60;
              return (
                <div className="avoid-card-v2" key={i}>
                  <div className="avoid-card-v2-header">
                    <div className="avoid-card-v2-left">
                      <span className="avoid-card-v2-x">✕</span>
                      <div>
                        <span className="avoid-card-v2-name">{skill.name}</span>
                        <div className="avoid-card-v2-tags">
                          {isHigh && <span className="avoid-tag dead">DEAD</span>}
                          {isMed && <span className="avoid-tag outdated">OUTDATED</span>}
                          {!isHigh && !isMed && <span className="avoid-tag niche">NICHE</span>}
                        </div>
                      </div>
                    </div>
                    <span className={`risk-badge-sm ${isHigh ? "risk-high" : "risk-medium"}`}>
                      {isHigh ? "⚠ HIGH RISK" : "⚠ MED RISK"}
                    </span>
                  </div>

                  <div className="avoid-detail-row">
                    <div className="avoid-detail-label">
                      <AlertTriangle size={13} color="var(--yellow)" /> WHY AVOID
                    </div>
                    <p className="avoid-detail-text">{skill.reason}</p>
                  </div>

                  {skill.marketInsight && (
                    <div className="avoid-detail-row">
                      <div className="avoid-detail-label">
                        <BarChart3 size={13} color="var(--blue)" /> MARKET INSIGHT
                      </div>
                      <p className="avoid-detail-text">{skill.marketInsight}</p>
                    </div>
                  )}

                  <div className="avoid-opp-row">
                    <div className="avoid-opp-track">
                      <div
                        className="avoid-opp-fill"
                        style={{ width: `${oppCost}%` }}
                      />
                    </div>
                    <span className="avoid-opp-label">Opp. Cost: {oppCost}%</span>
                  </div>

                  {skill.alternative && (
                    <div className="avoid-alt-row">
                      <div className="avoid-detail-label">
                        <ArrowRight size={13} color="var(--green)" /> BETTER ALTERNATIVE
                      </div>
                      <button className="avoid-alt-btn">→ {skill.alternative}</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills to Learn */}
      {results.skillsToLearn?.length > 0 && (
        <div className="dash-section">
          <h2 className="dash-section-title">
            <TrendingUp size={22} color="var(--green)" /> Skills to Learn
          </h2>
          <div className="skills-grid">
            {results.skillsToLearn.map((skill, i) => (
              <div className="skill-card" key={i}>
                <div className="skill-card-header">
                  <span className="skill-card-name">{skill.name}</span>
                  <span
                    className="skill-card-score"
                    style={{
                      background: skill.score >= 80 ? "var(--green-soft)" : "var(--blue-soft)",
                      color: skill.score >= 80 ? "var(--green)" : "var(--blue)",
                    }}
                  >
                    {skill.score}%
                  </span>
                </div>
                <span className={`skill-card-priority priority-${skill.priority}`}>
                  {skill.priority} priority
                </span>
                <p className="skill-card-reason">{skill.reason}</p>
                <p className="skill-card-hours">
                  <Clock size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                  ~{skill.estimatedHours} hours estimated
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Better Alternatives */}
      {results.betterAlternatives?.length > 0 && (
        <div className="dash-section">
          <h2 className="dash-section-title">
            <Rocket size={22} color="var(--blue)" /> Better Alternatives
          </h2>
          <div className="alt-grid">
            {results.betterAlternatives.map((alt, i) => (
              <div className="alt-card" key={i}>
                <div className="alt-card-top">
                  <span className="alt-old">{alt.oldSkill}</span>
                  <ArrowRight size={18} className="alt-arrow" />
                  <span className="alt-new">{alt.newSkill}</span>
                </div>
                <p className="alt-reason">{alt.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap */}
      {results.roadmap?.length > 0 && (
        <div className="dash-section">
          <h2 className="dash-section-title">
            <Cpu size={22} color="var(--purple)" /> Personalized Roadmap
          </h2>
          <div className="roadmap-timeline">
            {results.roadmap.map((month, i) => (
              <div className="roadmap-item" key={i}>
                <div className="roadmap-dot" />
                <div className="roadmap-month">Month {month.month}</div>
                <div className="roadmap-card">
                  <div className="roadmap-skills">
                    {month.skills?.map((s, j) => (
                      <span className="roadmap-skill-tag" key={j}>{s}</span>
                    ))}
                  </div>
                  {month.projects?.length > 0 && (
                    <p className="roadmap-projects">📁 {month.projects.join(" • ")}</p>
                  )}
                  <p className="roadmap-outcome">
                    <Check size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
                    {month.outcome}
                  </p>
                  <p className="roadmap-hours">⏱ ~{month.estimatedHours} hours</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Reasoning */}
      <div className="ai-summary-card">
        <h2 className="dash-section-title" style={{ marginBottom: 16 }}>
          🧠 AI Reasoning
        </h2>
        <p className="ai-summary-text">{results.summary}</p>

        <div className="confidence-row">
          <span className="confidence-label">AI Confidence</span>
          <div className="confidence-bar-track">
            <div
              className="confidence-bar-fill"
              style={{ width: `${results.confidence}%` }}
            />
          </div>
          <span className="confidence-value">{results.confidence}%</span>
        </div>

        <p className="ai-disclaimer">
          This is an AI assessment based on training data and general industry knowledge — not real-time market data.
          Use these recommendations as a starting point for your own research.
        </p>
      </div>

      {/* Restart */}
      <div className="restart-row">
        <button
          className="btn-secondary"
          onClick={() => navigate("/analyze")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, maxWidth: 260 }}
        >
          <RefreshCw size={16} />
          Run Another Analysis
        </button>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color }) {
  return (
    <div className="metric-row">
      <span className="metric-label">{label}</span>
      <div className="metric-bar-track">
        <div
          className="metric-bar-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="metric-value" style={{ color }}>{value}%</span>
    </div>
  );
}
