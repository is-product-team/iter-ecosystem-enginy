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
export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  className = "", 
  hasNativeHeader = false,
  profileImage,
  userInitials = "??"
}) => {
  const insets = useSafeAreaInsets();
  
  const topPadding = hasNativeHeader ? (insets.top + 82) : (insets.top + 20);
  
  return (
    <View 
      style={{ paddingTop: topPadding }} 
      className={`px-8 pb-8 bg-background-page ${className}`}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-4">
          <Text 
            className="text-[44px] font-light text-text-primary tracking-tight leading-[48px]"
            numberOfLines={2}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="text-[16px] font-normal text-text-secondary mt-2 leading-relaxed">
              {subtitle}
            </Text>
          )}
        </View>

        {/* Dynamic Avatar */}
        <View className="mt-2">
          <View className="w-14 h-14 rounded-full bg-background-subtle items-center justify-center border-2 border-border-subtle shadow-sm overflow-hidden">
            {profileImage ? (
              <Image source={{ uri: profileImage }} className="w-full h-full" />
            ) : (
              <Text className="text-lg font-bold text-text-muted">{userInitials}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
