
import React from 'react';
import SparkleIcon from './icons/SparkleIcon';

const InteractiveAILoader: React.FC = () => {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      {/* Outer rotating arc */}
      <div
        className="absolute w-full h-full rounded-full border-4 border-transparent border-t-primary animate-spin"
        style={{ animationDuration: '1.5s' }}
      ></div>

      {/* Inner static circle */}
      <div className="absolute w-[75%] h-[75%] bg-transparent rounded-full border-2 border-primary/20"></div>

      {/* Central Sparkle Icon on a solid background circle */}
      <div className="absolute w-14 h-14 bg-surface rounded-full flex items-center justify-center shadow-inner">
        <SparkleIcon className="w-7 h-7 text-primary" />
      </div>
    </div>
  );
};

export default InteractiveAILoader;
