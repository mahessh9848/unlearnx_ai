import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { LOADING_STEPS } from "../utils/constants";
import { analyzeCareer } from "../services/api";

export default function LoadingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!formData) {
      navigate("/analyze", { replace: true });
      return;
    }

    // Animate loading steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 800);

    // Call API
    analyzeCareer(formData)
      .then((results) => {
        // Wait for animations to finish
        const minDelay = LOADING_STEPS.length * 800 + 400;
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDelay - elapsed);

        setTimeout(() => {
          navigate("/results", { state: { results, formData }, replace: true });
        }, remaining);
      })
      .catch((err) => {
        clearInterval(stepInterval);
        setError(err.message || "Something went wrong. Please try again.");
      });

    const startTime = Date.now();

    return () => clearInterval(stepInterval);
  }, []);

  if (error) {
    return (
      <div className="loading-page">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Analysis Failed</h2>
          <p className="error-message">{error}</p>
          <button className="btn-primary" onClick={() => navigate("/analyze")}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-page">
      <div className="loading-card">
        <h2 className="loading-title">Analyzing your career...</h2>
        <div className="loading-steps">
          {LOADING_STEPS.map((label, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <div
                key={label}
                className={`loading-step ${isDone ? "done" : isActive ? "active" : ""}`}
              >
                <div className="loading-step-icon">
                  {isDone ? <Check size={14} /> : isActive ? <Loader2 size={14} className="spin" /> : ""}
                </div>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
