import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  progress?: number; // 0 to 1
  onPress: () => void;
}

interface FeatureListModuleProps {
  title: string;
  items: FeatureItem[];
}

export default function FeatureListModule({ title, items }: FeatureListModuleProps) {
  return (
    <View className="w-full mb-8">
      <Text className="text-text-primary text-xl font-bold mb-4 ml-1" style={{ fontFamily: THEME.fonts.primary }}>
        {title}
      </Text>
      
      <View className="bg-background-surface rounded-3xl overflow-hidden shadow-sm border border-border-subtle">
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.onPress}
            activeOpacity={0.7}
            className={`flex-row items-center p-5 ${index !== items.length - 1 ? 'border-b border-border-subtle' : ''}`}
          >
            {/* Icon Box */}
            <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: item.iconBgColor || '#00426B' }}
            >
              <Ionicons name={item.icon} size={20} color={item.iconColor || '#4197CB'} />
            </View>
            
            {/* Content */}
            <View className="flex-1 justify-center">
              <Text className="text-text-primary text-base font-bold mb-1" numberOfLines={1} style={{ fontFamily: THEME.fonts.primary }}>
                {item.title}
              </Text>
              <View className="flex-row items-center">
                {item.progress !== undefined && (
                  <View className="flex-1 h-1 bg-background-subtle rounded-full mr-3 overflow-hidden">
                    <View 
                      className="absolute top-0 bottom-0 left-0 bg-primary rounded-full" 
                      style={{ width: `${item.progress * 100}%` }} 
                    />
                  </View>
                )}
                <Text className="text-text-muted text-xs font-medium" style={{ fontFamily: THEME.fonts.primary }}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color="#64748B" className="ml-2" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
