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
      activeOpacity={0.75}
      style={{ height: fullWidth ? 100 : 110 }}
      className={`bg-background-surface rounded-[24px] p-4 justify-between shadow-sm ${fullWidth ? 'w-full' : 'flex-1'}`}
    >
      <View className="flex-row items-start justify-between">
        <View
          className="w-10 h-10 rounded-[14px] items-center justify-center"
          style={{ backgroundColor: item.iconBg.endsWith('15') ? item.iconBg.replace('15', '25') : item.iconBg }}
        >
          <Ionicons name={item.icon} size={20} color={item.iconColor} />
        </View>
        {item.badge !== undefined && item.badge > 0 && (
          <View className="bg-[#FF3B30] rounded-full min-w-[22px] h-[22px] items-center justify-center px-1.5">
            <Text className="text-white text-[12px] font-black">{item.badge > 99 ? '99+' : item.badge}</Text>
          </View>
        )}
      </View>

      <View className={fullWidth ? 'mt-0' : 'mt-3'}>
        {item.value && (
          <Text className="text-text-primary text-[15px] font-bold leading-tight mb-0.5" numberOfLines={1}>
            {item.value}
          </Text>
        )}
        <Text className="text-text-muted text-[12px] font-semibold uppercase tracking-wider opacity-60">{item.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function QuickAccessGrid({ items }: QuickAccessGridProps) {
  if (items.length === 0) return null;

  // The first item (Notifications) should be full width
  const firstItem = items[0];
  // The rest (Coordination, Support) should be in rows of 2
  const restItems = items.slice(1);
  const rows: QuickAccessItem[][] = [];
  for (let i = 0; i < restItems.length; i += 2) {
    rows.push(restItems.slice(i, i + 2));
  }

  return (
    <View className="mx-6 mb-10">
      {/* First item - Full Width */}
      <GridCard item={firstItem} fullWidth={true} />

      {/* Subsequent items - Rows of 2 */}
      {rows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          className="flex-row gap-4 mt-4"
        >
          {row.map((item) => (
            <GridCard key={item.id} item={item} />
          ))}
          {row.length === 1 && <View className="flex-1" />}
        </View>
      ))}
    </View>
  );
}
