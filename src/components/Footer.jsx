export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <div className="footer-col-title">Product</div>
          <a href="#how-it-works">Career Analysis</a>
          <a href="#features">Roadmap</a>
          <a href="#how-it-works">How It Works</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Company</div>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Legal</div>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} UnlearnX. AI-powered career intelligence.
      </div>
    </footer>
  );
}
