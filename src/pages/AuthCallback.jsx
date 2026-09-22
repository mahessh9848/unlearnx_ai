/**
 * AuthCallback — Redirect page (no longer used for OAuth, kept for backward compat).
 * Simply redirects to home.
 */
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const returnUrl = searchParams.get("returnUrl") || "/";
    navigate(returnUrl, { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-card">
        <Loader2 size={42} className="spin-icon" color="var(--accent-red)" />
        <h2>Redirecting...</h2>
        <p>Taking you back to UnlearnX.</p>
      </div>
    </div>
  );
}
