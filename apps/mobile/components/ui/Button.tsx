import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ label, loading, variant = 'primary', className = '', disabled, ...props }: ButtonProps) {
  const baseClass = "py-4 items-center justify-center rounded-xl flex-row";
  
  let variantClass = "bg-[#4197CB]";
  let textClass = "text-white";

  if (variant === 'secondary') {
    variantClass = "bg-transparent border border-border-subtle";
    textClass = "text-[#4197CB]";
  } else if (variant === 'danger') {
    variantClass = "bg-[#FF3B30]";
  }

  const opacityClass = (disabled || loading) ? "opacity-70" : "active:opacity-80";

  return (
    <TouchableOpacity 
      className={`${baseClass} ${variantClass} ${opacityClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#F26178' : 'white'} />
      ) : (
        <Text className={`${textClass} font-semibold text-[17px]`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
