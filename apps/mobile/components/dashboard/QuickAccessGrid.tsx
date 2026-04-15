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

function GridCard({ item }: { item: QuickAccessItem }) {
  return (
    <TouchableOpacity
      onPress={item.onPress}
      activeOpacity={0.75}
      className="flex-1 bg-background-surface rounded-[24px] p-4 h-[110px] justify-between shadow-sm"
    >
      {/* Icon + badge */}
      <View className="flex-row items-start justify-between">
        <View
          className="w-10 h-10 rounded-[12px] items-center justify-center"
          style={{ backgroundColor: item.iconBg }}
        >
          <Ionicons name={item.icon} size={20} color={item.iconColor} />
        </View>
        {item.badge !== undefined && item.badge > 0 && (
          <View className="bg-[#FF3B30] rounded-full min-w-[20px] h-[20px] items-center justify-center px-1">
            <Text className="text-white text-[11px] font-black">{item.badge > 99 ? '99+' : item.badge}</Text>
          </View>
        )}
      </View>

      {/* Label and value */}
      <View className="mt-3">
        {item.value && (
          <Text className="text-text-primary text-[14px] font-semibold leading-tight mb-0.5" numberOfLines={1}>
            {item.value}
          </Text>
        )}
        <Text className="text-text-muted text-[12px] font-medium">{item.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function QuickAccessGrid({ items }: QuickAccessGridProps) {
  // Render in rows of 2
  const rows: QuickAccessItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View className="mx-4 mb-6">
      {rows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          className={`flex-row gap-4 ${rowIdx > 0 ? 'mt-4' : ''}`}
        >
          {row.map((item) => (
            <GridCard key={item.id} item={item} />
          ))}
          {/* Fill gap if odd number of items */}
          {row.length === 1 && <View className="flex-1" />}
        </View>
      ))}
    </View>
  );
}
