import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, LogOut, History, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = useCallback(
    (sectionId) => {
      setMobileOpen(false);
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    },
    [location.pathname, navigate]
  );

  const scrollToTop = useCallback(() => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, navigate]);

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await signOut();
    navigate("/");
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          UnlearnX
        </Link>

        <ul className="navbar-links">
          <li><button className="navbar-link-btn" onClick={scrollToTop}>Home</button></li>
          <li><button className="navbar-link-btn" onClick={() => scrollToSection("how-it-works")}>How It Works</button></li>
          <li><button className="navbar-link-btn" onClick={() => scrollToSection("features")}>Features</button></li>
          {isAuthenticated && (
            <li>
              <button
                className={`navbar-link-btn ${location.pathname === "/history" ? "active" : ""}`}
                onClick={() => { setMobileOpen(false); navigate("/history"); }}
              >
                History
              </button>
            </li>
          )}
          <li>
            <button className="navbar-cta" onClick={() => navigate("/analyze")}>
              Analyze My Career <ArrowRight size={14} />
            </button>
          </li>

          {/* User Profile / Auth State */}
          {isAuthenticated ? (
            <li className="navbar-profile-container" ref={dropdownRef}>
              <button
                className="navbar-avatar-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="User profile menu"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="navbar-avatar-img" />
                ) : (
                  <span className="navbar-avatar-initial">{initial}</span>
                )}
              </button>

              {profileOpen && (
                <div className="navbar-profile-dropdown">
                  <div className="profile-dropdown-user">
                    <p className="profile-dropdown-name">{displayName}</p>
                    <p className="profile-dropdown-email">{user?.email}</p>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button
                    className="profile-dropdown-item"
                    onClick={() => { setProfileOpen(false); navigate("/history"); }}
                  >
                    <History size={15} /> My Analyses
                  </button>
                  <button className="profile-dropdown-item text-danger" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li>
              <button className="navbar-signin-btn" onClick={() => navigate("/login")}>
                Sign In
              </button>
            </li>
          )}
        </ul>

        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`navbar-mobile-menu ${mobileOpen ? "open" : ""}`}>
        <button className="navbar-mobile-link" onClick={scrollToTop}>Home</button>
        <button className="navbar-mobile-link" onClick={() => scrollToSection("how-it-works")}>How It Works</button>
        <button className="navbar-mobile-link" onClick={() => scrollToSection("features")}>Features</button>

        {isAuthenticated ? (
          <>
            <button
              className="navbar-mobile-link"
              onClick={() => { setMobileOpen(false); navigate("/history"); }}
            >
              My Analyses History
            </button>
            <div className="navbar-mobile-user-card">
              <div className="navbar-mobile-user-avatar">
                {avatarUrl ? <img src={avatarUrl} alt={displayName} /> : initial}
              </div>
              <div className="navbar-mobile-user-info">
                <span className="navbar-mobile-user-name">{displayName}</span>
                <span className="navbar-mobile-user-email">{user?.email}</span>
              </div>
            </div>
            <button
              className="navbar-mobile-link text-danger"
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </>
        ) : (
          <button
            className="navbar-mobile-link"
            onClick={() => { setMobileOpen(false); navigate("/login"); }}
            style={{ color: "var(--accent-red)", fontWeight: 600 }}
          >
            Sign In with Google
          </button>
        )}

        <button
          className="navbar-cta"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={() => { setMobileOpen(false); navigate("/analyze"); }}
        >
          Analyze My Career <ArrowRight size={14} />
        </button>
      </div>
    </nav>
  );
}
