import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackgroundEffects from "./components/BackgroundEffects";
import LandingPage from "./pages/LandingPage";
import AnalyzePage from "./pages/AnalyzePage";
import LoadingPage from "./pages/LoadingPage";
import ResultsDashboard from "./pages/ResultsDashboard";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <>
      <BackgroundEffects />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/results" element={<ResultsDashboard />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
      <Footer />
    </>
  );
}
