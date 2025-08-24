import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

const Slider: React.FC<SliderProps> = ({ className = '', ...props }) => {
  return (
    <input
      type="range"
      className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer
                  ${className}`}
      {...props}
    />
  );
};

export default Slider;