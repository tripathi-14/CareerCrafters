import React from 'react';
import { InterviewFeedback } from '../types';
import { Gauge, Zap, Mic, MessageCircleWarning, TrendingUp } from 'lucide-react';

interface VocalDeliveryAnalysisProps {
  vocalDelivery: NonNullable<InterviewFeedback['vocalDelivery']>;
}

const metricDetails = {
  pace: { label: 'Pace', icon: <Gauge size={18} className="text-blue-500" /> },
  clarity: { label: 'Clarity', icon: <Zap size={18} className="text-green-500" /> },
  confidence: { label: 'Confidence', icon: <Mic size={18} className="text-purple-500" /> },
  fillerWords: { label: 'Filler Words', icon: <MessageCircleWarning size={18} className="text-yellow-500" /> },
  energy: { label: 'Energy', icon: <TrendingUp size={18} className="text-red-500" /> },
};

const VocalDeliveryMetricBar: React.FC<{
  metric: keyof typeof metricDetails;
  score: number;
  feedback: string;
}> = ({ metric, score, feedback }) => {
  const { label, icon } = metricDetails[metric];
  const scorePercentage = score * 10;
  const scoreColor = score >= 8 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
            {icon}
            <h6 className="font-semibold text-text-primary text-sm">{label}</h6>
        </div>
        <span className="text-sm font-bold text-text-secondary">{score}/10</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
        <div className={`${scoreColor} h-2 rounded-full`} style={{ width: `${scorePercentage}%` }}></div>
      </div>
      <p className="text-xs text-text-secondary">{feedback}</p>
    </div>
  );
};


const VocalDeliveryAnalysis: React.FC<VocalDeliveryAnalysisProps> = ({ vocalDelivery }) => {
  return (
    <div className="mt-4 border-t border-border pt-4">
      <h5 className="font-semibold text-text-primary mb-3">Vocal Delivery Analysis (Simulated)</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <VocalDeliveryMetricBar metric="pace" score={vocalDelivery.pace.score} feedback={vocalDelivery.pace.feedback} />
        <VocalDeliveryMetricBar metric="clarity" score={vocalDelivery.clarity.score} feedback={vocalDelivery.clarity.feedback} />
        <VocalDeliveryMetricBar metric="confidence" score={vocalDelivery.confidence.score} feedback={vocalDelivery.confidence.feedback} />
        <VocalDeliveryMetricBar metric="fillerWords" score={vocalDelivery.fillerWords.score} feedback={vocalDelivery.fillerWords.feedback} />
        <VocalDeliveryMetricBar metric="energy" score={vocalDelivery.energy.score} feedback={vocalDelivery.energy.feedback} />
      </div>
    </div>
  );
};

export default VocalDeliveryAnalysis;
