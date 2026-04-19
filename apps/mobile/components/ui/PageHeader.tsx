import React from 'react';
import { View, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PageHeaderProps {
  title: string;
  subtitle?: string | null;
  className?: string;
  hasNativeHeader?: boolean;
  profileImage?: string | null;
  userInitials?: string;
}

/**
 * Standardized Header for Mobile Screens
 * Implements the "Apple-style" Large Title -> Subtitle pattern
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, className = "", hasNativeHeader = false }) => {
  const insets = useSafeAreaInsets();
  
  // Base padding + safe area. If there's a native header (back button), we need more space.
  const topPadding = hasNativeHeader ? (insets.top + 82) : (insets.top + 20);
  
  return (
    <View 
      style={{ paddingTop: topPadding }} 
      className={`px-8 pb-8 bg-background-page ${className}`}
    >
      <Text className="text-[44px] font-light text-text-primary tracking-tight leading-[48px]">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-[16px] font-normal text-text-secondary mt-2 leading-relaxed">
          {subtitle}
        </Text>
      )}
    </View>
  );
};
