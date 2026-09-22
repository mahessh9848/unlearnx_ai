import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let active = true;

    async function handleAuthRedirect() {
      try {
        const returnUrl = searchParams.get("returnUrl") || "/analyze";

        // Check if there is an error in URL params
        const errorDescription = searchParams.get("error_description");
        if (errorDescription) {
          if (active) setErrorMsg(errorDescription);
          return;
        }

        // Allow Supabase to finish parsing hash or code
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          if (active) setErrorMsg(error.message);
          return;
        }

        if (data?.session) {
          // Success: Navigate to returnUrl
          navigate(returnUrl, { replace: true });
        } else {
          // Listen for onAuthStateChange if session hasn't landed yet
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (session && active) {
                subscription?.unsubscribe();
                navigate(returnUrl, { replace: true });
              }
            }
          );

          // Safety timeout after 5s
          setTimeout(() => {
            if (active && !data?.session) {
              navigate("/login?error=timeout", { replace: true });
            }
          }, 5000);
        }
      } catch (err) {
        console.error("Callback exception:", err);
        if (active) setErrorMsg(err.message || "Failed to complete sign-in");
      }
    }

    handleAuthRedirect();

    return () => {
      active = false;
    };
  }, [navigate, searchParams]);

  if (errorMsg) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-card">
          <AlertCircle size={40} color="var(--accent-red)" />
          <h2>Sign-in Encountered an Issue</h2>
          <p>{errorMsg}</p>
          <button className="auth-btn-retry" onClick={() => navigate("/login")}>
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-card">
        <Loader2 size={42} className="spin-icon" color="var(--accent-red)" />
        <h2>Completing Sign-In</h2>
        <p>Connecting your Google account with UnlearnX...</p>
      </div>
    </div>
  );
}
