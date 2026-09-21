import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { INDUSTRIES, EXPERIENCE_LEVELS, PRIORITIES } from "../utils/constants";
import { validateAllSteps } from "../utils/validation";

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    careerGoal: "",
    currentSkills: "",
    targetIndustry: "",
    experienceLevel: "",
    priority: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateAllSteps(formData);
    if (validationErrors) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      document.getElementById(`field-${firstErrorKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    navigate("/loading", { state: { formData } });
  }

  return (
    <div className="analyze-page-single">
      <div className="analyze-header">
        <h1 className="analyze-title">Configure Your Analysis</h1>
        <p className="analyze-subtitle">
          Tell us about your goals and we'll identify what <em>NOT</em> to waste time on.
        </p>
      </div>

      <form className="analyze-form-card" onSubmit={handleSubmit} noValidate>
        {/* Career Goal */}
        <div className="form-field-group" id="field-careerGoal">
          <label className="form-field-label">
            <span className="form-field-icon">🎯</span> Career Goal
          </label>
          <input
            className={`form-input ${errors.careerGoal ? "input-error" : ""}`}
            type="text"
            placeholder="e.g., Become a full-stack developer in 6 months"
            value={formData.careerGoal}
            onChange={(e) => handleChange("careerGoal", e.target.value)}
            autoFocus
          />
          {errors.careerGoal ? (
            <span className="form-error">{errors.careerGoal}</span>
          ) : (
            <span className="form-hint">Be specific — include timeline if possible</span>
          )}
        </div>

        {/* Current Skills */}
        <div className="form-field-group" id="field-currentSkills">
          <label className="form-field-label">
            <span className="form-field-icon">🧠</span> Current Skills
          </label>
          <input
            className={`form-input ${errors.currentSkills ? "input-error" : ""}`}
            type="text"
            placeholder="e.g., Python, HTML, CSS, Basic JavaScript"
            value={formData.currentSkills}
            onChange={(e) => handleChange("currentSkills", e.target.value)}
          />
          {errors.currentSkills ? (
            <span className="form-error">{errors.currentSkills}</span>
          ) : (
            <span className="form-hint">Comma-separated list of your existing skills</span>
          )}
        </div>

        {/* Target Industry */}
        <div className="form-field-group" id="field-targetIndustry">
          <label className="form-field-label">
            <span className="form-field-icon">🏢</span> Target Industry
          </label>
          <select
            className={`form-select ${errors.targetIndustry ? "input-error" : ""}`}
            value={formData.targetIndustry}
            onChange={(e) => handleChange("targetIndustry", e.target.value)}
          >
            <option value="">Select industry...</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind.value} value={ind.value}>{ind.label}</option>
            ))}
          </select>
          {errors.targetIndustry && <span className="form-error">{errors.targetIndustry}</span>}
        </div>

        {/* Experience Level */}
        <div className="form-field-group" id="field-experienceLevel">
          <label className="form-field-label">
            <span className="form-field-icon">📊</span> Experience Level
          </label>
          <select
            className={`form-select ${errors.experienceLevel ? "input-error" : ""}`}
            value={formData.experienceLevel}
            onChange={(e) => handleChange("experienceLevel", e.target.value)}
          >
            <option value="">Select level...</option>
            {EXPERIENCE_LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
            ))}
          </select>
          {errors.experienceLevel && <span className="form-error">{errors.experienceLevel}</span>}
        </div>

        {/* Learning Priority */}
        <div className="form-field-group" id="field-priority">
          <label className="form-field-label">
            <span className="form-field-icon">🔥</span> Learning Priority
          </label>
          <select
            className={`form-select ${errors.priority ? "input-error" : ""}`}
            value={formData.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
          >
            <option value="">Select priority...</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {errors.priority && <span className="form-error">{errors.priority}</span>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="analyze-submit-btn"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="analyze-btn-dot pulsing" />
              Preparing Analysis...
            </>
          ) : (
            <>
              <span className="analyze-btn-dot" />
              <Sparkles size={18} />
              Analyze My Path
            </>
          )}
        </button>
      </form>
    </div>
  );
}
