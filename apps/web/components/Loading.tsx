'use client';

import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'mini';
  white?: boolean;
}

/**
 * Apple-Style Minimalist Loading Component
 * Features a high-fidelity tick-based spinner and backdrop-blur overlays.
 */
const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message,
  size = 'md',
  white = false
}) => {
  const sizeClasses = {
    mini: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const spinnerColor = white ? 'stroke-white' : 'stroke-text-primary dark:stroke-white';
  const textColor = white ? 'text-white/70' : 'text-text-muted';

  const content = (
    <div 
      className="flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
      aria-label={message || "Loading"}
    >
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Apple Style Tick Spinner */}
        <svg 
          className="w-full h-full animate-spin [animation-duration:1s]" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {[...Array(8)].map((_, i) => (
            <line
              key={i}
              x1="12"
              y1="4.5"
              x2="12"
              y2="7"
              className={spinnerColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                transform: `rotate(${i * 45}deg)`,
                transformOrigin: '12px 12px',
                opacity: 1 - (i * 0.12)
              }}
            />
          ))}
        </svg>
      </div>

      {message && size !== 'mini' && (
        <p className={`text-[11px] font-medium uppercase tracking-[0.2em] ${textColor} animate-pulse duration-[2000ms]`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background-page/60 dark:bg-black/40 backdrop-blur-md transition-all duration-500 animate-in fade-in">
        {content}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center w-full ${size === 'mini' ? '' : 'py-12'} animate-in fade-in duration-700`}>
      {content}
    </div>
  );
};

export default Loading;
