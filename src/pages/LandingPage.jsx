import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart2, Brain, Clock, ShieldCheck } from "lucide-react";

const OBSOLETE_SKILLS = [
  "Dreamweaver",
  "CoffeeScript",
  "Silverlight",
  "jQuery",
  "COBOL",
  "Flash",
  "AngularJS",
  "ActionScript",
  "ColdFusion",
  "Grunt",
  "Pascal",
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [skillIndex, setSkillIndex] = useState(0);
  const [animClass, setAnimClass] = useState("in");

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimClass("out");
      setTimeout(() => {
        setSkillIndex((prev) => (prev + 1) % OBSOLETE_SKILLS.length);
        setAnimClass("in");
      }, 350);
    }, 2200);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="landing-main">
      {/* ======== HERO ======== */}
      <section className="hero-v2" id="hero">
        <div className="hero-v2-content">
          <div className="hero-v2-badge">⚡ AI-Powered Career Intelligence</div>
          <h1 className="hero-v2-title">
            Don't learn{" "}
            <span className="hero-v2-strike-container">
              <span className={`hero-v2-strike-word ${animClass}`}>
                {OBSOLETE_SKILLS[skillIndex]}
              </span>
            </span>
            .<br />
            Learn what <span className="hero-v2-glow">actually matters</span>.
          </h1>
          <p className="hero-v2-subtitle">
            Our engine analyzes industry trends, automation risks, and market demand
            to reveal which skills are wasting your time — and what to learn instead.
          </p>
          <button className="hero-v2-cta" onClick={() => navigate("/analyze")}>
            <span>Analyze My Career</span>
            <ArrowRight size={18} className="cta-arrow" />
          </button>
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section className="section-v2" id="features">
        <div className="section-v2-header">
          <h2 className="section-v2-title">Craft Your Next Breakthrough</h2>
          <p className="section-v2-desc">
            Stop following outdated advice. Make data-informed learning decisions.
          </p>
        </div>
        <div className="features-v2-grid">
          <FeatureCard
            icon={<BarChart2 size={26} strokeWidth={1.5} />}
            title="Data-Driven Analysis"
            desc="Analyze career paths using relevant market and skill signals."
            color="accent"
          />
          <FeatureCard
            icon={<Brain size={26} strokeWidth={1.5} />}
            title="AI Career Insights"
            desc="Get personalized career recommendations powered by Gemini AI."
            color="blue"
          />
          <FeatureCard
            icon={<Clock size={26} strokeWidth={1.5} />}
            title="Save Time"
            desc="Reduce time spent learning skills that are low priority for your target path."
            color="green"
          />
          <FeatureCard
            icon={<ShieldCheck size={26} strokeWidth={1.5} />}
            title="Future-Ready Skills"
            desc="Focus on skills aligned with your selected career direction."
            color="purple"
          />
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section className="section-v2" id="how-it-works">
        <div className="section-v2-header">
          <h2 className="section-v2-title">How It Works</h2>
          <p className="section-v2-desc">
            Five steps to a smarter career strategy
          </p>
        </div>
        <div className="hiw-v2-timeline">
          {[
            { step: "01", title: "Tell Us About Yourself", desc: "Share your career goal, current skills, target industry, and learning priority." },
            { step: "02", title: "Analyze Your Skills", desc: "Our AI evaluates your current skill set against market demand and career trajectories." },
            { step: "03", title: "Evaluate Career Relevance", desc: "Each skill is scored for relevance, automation risk, and future growth potential." },
            { step: "04", title: "Generate Recommendations", desc: "Receive personalized insights: what to learn, what to skip, and smarter alternatives." },
            { step: "05", title: "Build Your Roadmap", desc: "Get a 6-month learning plan with projects, milestones, and estimated time commitments." },
          ].map((item) => (
            <div className="hiw-v2-item" key={item.step}>
              <div className="hiw-v2-step-num">{item.step}</div>
              <div className="hiw-v2-line" />
              <h3 className="hiw-v2-title">{item.title}</h3>
              <p className="hiw-v2-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======== CTA BANNER ======== */}
      <section className="cta-banner">
        <h2 className="cta-banner-title">Ready to optimize your career?</h2>
        <p className="cta-banner-desc">Get your personalized AI career intelligence report in under 60 seconds.</p>
        <button className="hero-v2-cta" onClick={() => navigate("/analyze")}>
          <span>Analyze My Career</span>
          <ArrowRight size={18} className="cta-arrow" />
        </button>
      </section>
    </main>
  );
}

/* ========== SUB-COMPONENTS ========== */

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className={`feature-v2-card feature-v2-${color}`}>
      <div className="feature-v2-icon">{icon}</div>
      <h3 className="feature-v2-title">{title}</h3>
      <p className="feature-v2-desc">{desc}</p>
    </div>
  );
}


