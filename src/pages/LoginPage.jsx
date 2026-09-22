import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, AlertCircle, ArrowLeft, Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, signIn, signUp, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from || "/analyze";

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (mode === "signup" && name.trim().length < 2) {
      setLocalError("Please enter your full name.");
      return;
    }
    if (!email.includes("@")) {
      setLocalError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
      // navigation handled by the useEffect above
    } catch (err) {
      setLocalError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setLocalError(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  const fillDemo = () => {
    setMode("signin");
    setEmail("demo@unlearnx.ai");
    setPassword("demo1234");
    setLocalError(null);
  };

  const error = localError || authError;

  return (
    <div className="login-page-container">
      <div className="login-page-glow login-glow-1" />
      <div className="login-page-glow login-glow-2" />

      <div className="login-card">
        <Link to="/" className="login-back-btn">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Header */}
        <div className="login-header">
          <div className="login-logo-badge">
            <Sparkles size={22} color="var(--accent-red)" />
          </div>
          <h1 className="login-title">UnlearnX</h1>
          <p className="login-subtitle">
            {mode === "signin"
              ? "Sign in to save and revisit your learning analyses."
              : "Create your free account to track your career intelligence."}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === "signin" ? "active" : ""}`}
            onClick={() => { setMode("signin"); setLocalError(null); }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`login-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => { setMode("signup"); setLocalError(null); }}
            type="button"
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-alert login-alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {mode === "signup" && (
            <div className="login-field">
              <label className="login-label" htmlFor="login-name">Full Name</label>
              <div className="login-input-wrap">
                <User size={16} className="login-input-icon" />
                <input
                  id="login-name"
                  type="text"
                  className="login-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="login-field">
            <label className="login-label" htmlFor="login-email">Email Address</label>
            <div className="login-input-wrap">
              <Mail size={16} className="login-input-icon" />
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-password">Password</label>
            <div className="login-input-wrap">
              <Lock size={16} className="login-input-icon" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="login-input login-input-password"
                placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                disabled={loading}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>{mode === "signin" ? "Signing In..." : "Creating Account..."}</span>
              </>
            ) : (
              <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
            )}
          </button>
        </form>

        {/* Demo quick fill */}
        <div className="login-demo-section">
          <span className="login-demo-label">Just exploring?</span>
          <button type="button" className="login-demo-btn" onClick={fillDemo}>
            Use Demo Account
          </button>
        </div>

        {/* Switch mode */}
        <p className="login-switch-text">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" className="login-switch-link" onClick={switchMode}>
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>

        <p className="login-privacy-note">
          This is a demo system. Data is stored locally in your browser only.
        </p>
      </div>
    </div>
  );
}
