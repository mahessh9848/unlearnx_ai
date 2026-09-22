import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (!isSupabaseConfigured) {
          setLoading(false);
          return;
        }

        const { data: { session: initialSession }, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error retrieving initial session:", sessionError);
          if (mounted) setError(sessionError.message);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth init exception:", err);
        if (mounted) {
          setError(err.message || "Failed to initialize authentication");
          setLoading(false);
        }
      }
    }

    initAuth();

    // Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (returnUrl = "/analyze") => {
    setError(null);
    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Google sign-in."
      );
    }

    const redirectUri = `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`;

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (signInError) {
      setError(signInError.message);
      throw signInError;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err.message || "Failed to sign out");
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated: Boolean(user),
    isConfigured: isSupabaseConfigured,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
