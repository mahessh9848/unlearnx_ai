import { useEffect, useRef } from "react";

export default function RadialScore({ score, maxScore = 100, size = 160, color = "var(--green)", label = "Career Score" }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillRef = useRef(null);

  useEffect(() => {
    if (fillRef.current) {
      const offset = circumference - (score / maxScore) * circumference;
      // Start fully hidden, then animate
      fillRef.current.style.strokeDasharray = `${circumference}`;
      fillRef.current.style.strokeDashoffset = `${circumference}`;
      requestAnimationFrame(() => {
        fillRef.current.style.strokeDashoffset = `${offset}`;
      });
    }
  }, [score, maxScore, circumference]);

  return (
    <div className="radial-score" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="radial-score-bg"
          cx={size / 2} cy={size / 2} r={radius}
        />
        <circle
          ref={fillRef}
          className="radial-score-fill"
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="radial-score-value">
        <span className="radial-score-num" style={{ color }}>{score}</span>
        <span className="radial-score-label">{label}</span>
      </div>
    </div>
  );
}
