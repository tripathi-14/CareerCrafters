import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
  return (
    <div style={style} className={`bg-surface border border-border text-text-primary rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;