import { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = useCallback((sectionId) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      // Navigate to home first, then scroll after render
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.pathname, navigate]);

  const scrollToTop = useCallback(() => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, navigate]);

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
          <li><button className={`navbar-link-btn ${location.pathname === "/history" ? "active" : ""}`} onClick={() => { setMobileOpen(false); navigate("/history"); }}>History</button></li>
          <li>
            <button className="navbar-cta" onClick={() => navigate("/analyze")}>
              Analyze My Career <ArrowRight size={14} />
            </button>
          </li>
        </ul>

        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className={`navbar-mobile-menu ${mobileOpen ? "open" : ""}`}>
        <button className="navbar-mobile-link" onClick={scrollToTop}>Home</button>
        <button className="navbar-mobile-link" onClick={() => scrollToSection("how-it-works")}>How It Works</button>
        <button className="navbar-mobile-link" onClick={() => scrollToSection("features")}>Features</button>
        <button className="navbar-mobile-link" onClick={() => { setMobileOpen(false); navigate("/history"); }}>History</button>
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
