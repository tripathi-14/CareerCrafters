
import React from 'react';
import Card from './ui/Card';
import InteractiveAILoader from './InteractiveAILoader';

interface Props {
  message: string;
}

const AnalyzingLoader: React.FC<Props> = ({ message }) => {
  return (
    <Card className="flex flex-col items-center justify-center gap-6 py-12 animate-scale-in">
      <InteractiveAILoader />
      <h3 className="text-xl font-bold text-text-primary mt-2">{message}</h3>
      <p className="text-text-secondary">This may take a few moments...</p>
    </Card>
  );
};

export default AnalyzingLoader;