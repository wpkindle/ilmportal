import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizes[size] || sizes.md} border-[#b85d34] border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-xs font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
