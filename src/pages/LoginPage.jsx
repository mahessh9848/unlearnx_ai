import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Sparkles, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, signInWithGoogle, isConfigured, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const destination = location.state?.from || "/analyze";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, destination]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setLocalError(null);
      await signInWithGoogle(destination);
    } catch (err) {
      console.error("Google sign-in error:", err);
      setLocalError(err.message || "Failed to initialize Google sign-in.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-glow login-glow-1" />
      <div className="login-page-glow login-glow-2" />

      <div className="login-card">
        <Link to="/" className="login-back-btn">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="login-header">
          <div className="login-logo-badge">
            <Sparkles size={22} color="var(--accent-red)" />
          </div>
          <h1 className="login-title">UnlearnX</h1>
          <p className="login-subtitle">
            Sign in with your Google account to automatically save, revisit, and track your personalized AI career analyses.
          </p>
        </div>

        {(localError || authError) && (
          <div className="login-alert login-alert-error">
            <AlertCircle size={18} />
            <span>{localError || authError}</span>
          </div>
        )}

        {!isConfigured && (
          <div className="login-alert login-alert-warning">
            <AlertCircle size={18} />
            <span>
              <strong>Supabase Setup Required:</strong> Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your environment variables to enable live Google sign-in.
            </span>
          </div>
        )}

        <div className="login-action-section">
          <button
            type="button"
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spin-icon" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        <div className="login-security-notice">
          <Shield size={14} color="var(--accent-cyan)" />
          <span>Secure authentication handled by Google. We never ask for or store your Google password.</span>
        </div>
      </div>
    </div>
  );
}
