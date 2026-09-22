/**
 * AuthContext — Local Demo Authentication
 * Uses localStorage to simulate user sessions. No external auth service.
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AUTH_SESSION_KEY = "unlearnx_demo_session";
const USERS_STORE_KEY  = "unlearnx_demo_users";

// ─── Seed demo accounts (created automatically on first load) ────────────────
const SEED_USERS = [
  {
    id: "demo-user-001",
    name: "Demo User",
    email: "demo@unlearnx.ai",
    password: "demo1234",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "demo-user-002",
    name: "Alex Smith",
    email: "alex@example.com",
    password: "password123",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  // First-time: seed and persist demo accounts
  localStorage.setItem(USERS_STORE_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORE_KEY, JSON.stringify(users));
}

function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  return null;
}

function persistSession(user) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Restore session on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved) setUser(saved);
    setLoading(false);
  }, []);

  // ── signIn ──────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    setError(null);
    const users = loadUsers();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.password === password
    );
    if (!found) {
      const err = "Invalid email or password.";
      setError(err);
      throw new Error(err);
    }
    // Strip password before storing in session
    const { password: _pw, ...sessionUser } = found;
    persistSession(sessionUser);
    setUser(sessionUser);
    return sessionUser;
  }, []);

  // ── signUp ──────────────────────────────────────────────────────────────────
  const signUp = useCallback(async (name, email, password) => {
    setError(null);
    const users = loadUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
    if (exists) {
      const err = "An account with this email already exists. Please sign in.";
      setError(err);
      throw new Error(err);
    }
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    const { password: _pw, ...sessionUser } = newUser;
    persistSession(sessionUser);
    setUser(sessionUser);
    return sessionUser;
  }, []);

  // ── signOut ─────────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    clearSession();
    setUser(null);
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
