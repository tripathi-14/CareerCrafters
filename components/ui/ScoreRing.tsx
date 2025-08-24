import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 40, strokeWidth = 4, className = '' }) => {
  const normalizedScore = Math.max(0, Math.min(score, 10));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedScore / 10) * circumference;

  const scoreColor = normalizedScore >= 8 ? 'text-green-500' : normalizedScore >= 5 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-slate-200"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${scoreColor} transition-all duration-1000 ease-out`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${scoreColor}`}>
          {normalizedScore}
        </span>
      </div>
    </div>
  );
};

export default ScoreRing;
