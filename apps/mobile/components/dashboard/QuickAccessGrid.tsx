import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickAccessItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  badge?: number;
  onPress?: () => void;
}

interface QuickAccessGridProps {
  items: QuickAccessItem[];
}

function GridCard({ item, fullWidth = false }: { item: QuickAccessItem, fullWidth?: boolean }) {
  return (
    <TouchableOpacity
      onPress={item.onPress}
      activeOpacity={0.8}
      style={{ 
        height: fullWidth ? 130 : 160, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      }}
      className={`bg-background-surface rounded-[32px] p-7 justify-between border border-border-subtle ${fullWidth ? 'w-full' : 'flex-1'}`}
    >
      <View className="flex-row items-start justify-between">
        <View
          className="w-11 h-11 rounded-[14px] items-center justify-center"
          style={{ backgroundColor: item.iconBg }}
        >
          <Ionicons name={item.icon} size={22} color={item.iconColor} />
        </View>
        
        {item.badge !== undefined && item.badge > 0 && (
          <View className="bg-[#FF3B30] rounded-full min-w-[20px] h-[20px] items-center justify-center px-1.5 border-2 border-background-surface">
            <Text className="text-white text-[10px] font-black">{item.badge > 99 ? '99+' : item.badge}</Text>
          </View>
        )}
      </View>

      <View>
        <Text 
          className="text-text-primary" 
          style={{ 
            fontSize: fullWidth ? 24 : 20, 
            fontWeight: '300', 
            lineHeight: fullWidth ? 30 : 24, 
            letterSpacing: -0.6 
          }}
          numberOfLines={2}
        >
          {item.value || "---"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function QuickAccessGrid({ items }: QuickAccessGridProps) {
  if (items.length === 0) return null;

  const firstItem = items[0];
  const restItems = items.slice(1);

  return (
    <View className="mx-6 mb-12">
      {/* 1 Large Top Card */}
      <GridCard item={firstItem} fullWidth={true} />

      {/* 2 Small Cards Grid */}
      {restItems.length > 0 && (
         <View className="flex-row gap-5 mt-5">
           {restItems.map((item) => (
             <GridCard key={item.id} item={item} fullWidth={false} />
           ))}
           {restItems.length === 1 && <View className="flex-1" />}
         </View>
      )}
    </View>
  );
}
