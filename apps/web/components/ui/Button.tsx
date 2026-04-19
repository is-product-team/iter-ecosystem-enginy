'use client';

import React from 'react';
import Loading from '../Loading';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'link' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

/**
 * Standardized Institutional Button Component
 * Follows the "Minimalist Sharp" design system.
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  className = '',
  disabled,
  children,
  ...props
}) => {
  // Variant maps
  const variants = {
    primary: 'bg-consorci-darkBlue text-white border-transparent hover:bg-consorci-lightBlue',
    outline: 'bg-transparent border border-consorci-darkBlue text-consorci-darkBlue hover:border-consorci-lightBlue hover:text-consorci-lightBlue',
    link: 'bg-transparent text-consorci-darkBlue underline hover:text-consorci-lightBlue',
    danger: 'bg-red-500 text-white border-transparent hover:bg-red-600',
    subtle: 'bg-transparent border-transparent text-text-primary hover:bg-consorci-darkBlue hover:text-white'
  };

  // Size maps
  const sizes = {
    sm: 'px-4 py-2 text-[12px] font-medium tracking-wide',
    md: 'px-6 py-3 text-[14px] font-medium',
    lg: 'px-10 py-4 text-[16px] font-semibold'
  };

  const isLink = variant === 'link';
  const baseClasses = 'inline-flex items-center justify-center gap-2 border transition-all duration-200 focus:outline-none';
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'active:bg-opacity-90';
  
  // Link variant shouldn't have borders or padding-based scaling in the same way, 
  // but we keep consistency in size classes for font.
  const linkSpecificClasses = isLink ? 'border-none p-0 h-auto' : '';

  const combinedClasses = `
    ${baseClasses} 
    ${variants[variant]} 
    ${sizes[size]} 
    ${widthClass} 
    ${disabledClass} 
    ${linkSpecificClasses} 
    ${loading ? 'relative !gap-0' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loading size="mini" white={variant === 'primary' || variant === 'danger'} />
        </div>
      )}
      <div className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
        {icon && <span className="shrink-0">{icon}</span>}
      </div>
    </button>
  );
};

export default Button;
