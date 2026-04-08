'use client';

import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  white?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message = 'Carregant...',
  size = 'md',
  white = false
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const ringColor = white ? 'text-white' : 'text-consorci-darkBlue';
  const dotColor = white ? 'bg-white' : 'bg-consorci-darkBlue';
  const textColor = white ? 'text-white/60' : 'text-text-muted';

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer Glow Removed for Minimalist Look */}

        {/* Modern Circular Spinner */}
        <svg className="w-full h-full animate-spin" viewBox="0 0 50 50">
          <circle
            className={`${ringColor} opacity-10`}
            cx="25"
            cy="25"
            r="22"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            className={ringColor}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M25,3 A22,22 0 0,1 47,25"
          />
        </svg>

        {/* Inner Pulsing Circle */}
        {size !== 'sm' && (
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 ${dotColor} animate-pulse`}
            style={{ animationDuration: '2s' }}
          ></div>
        )}
      </div>

      {message && size !== 'sm' && (
        <p className={`text-[12px] font-medium ${textColor}`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background-page z-[9999] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${size === 'sm' ? '' : 'w-full py-20'}`}>
      {content}
    </div>
  );
};

export default Loading;
