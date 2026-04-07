import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';

interface StatusMetric {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
}

interface StatusCardProps {
  title: string;
  percentage: number;
  primaryMetric: string;
  primaryLabel: string;
  secondaryMetric: string;
  secondaryLabel: string;
  footerMetrics: StatusMetric[];
}

export default function StatusCard({
  title,
  percentage,
  primaryMetric,
  primaryLabel,
  secondaryMetric,
  secondaryLabel,
  footerMetrics
}: StatusCardProps) {
  return (
    <View className="w-full bg-background-surface rounded-3xl p-6 mb-6 shadow-sm border border-border-subtle">
      <View className="flex-row justify-between items-center mb-6">
        {/* Ring visualization (pseudo-ring) */}
        <View className="w-24 h-24 rounded-full items-center justify-center bg-background-page relative overflow-hidden">
            <View className="absolute inset-0 rounded-full border-[8px] border-primary/20" />
            {/* Top part representing the glowing progress */}
            <View className="absolute top-0 left-0 right-0 h-1/2 border-t-[8px] border-l-[8px] border-r-[8px] border-primary rounded-t-full shadow-md" />
            <Text className="text-text-primary text-2xl font-black" style={{ fontFamily: THEME.fonts.primary }}>{percentage}%</Text>
        </View>

        {/* Info */}
        <View className="flex-1 ml-6">
          <Text className="text-text-primary text-xl font-bold mb-3" style={{ fontFamily: THEME.fonts.primary }}>{title}</Text>
          <View className="mb-2">
             <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ fontFamily: THEME.fonts.primary }}>{primaryLabel}</Text>
             <Text className="text-text-primary text-sm font-bold" style={{ fontFamily: THEME.fonts.primary }}>{primaryMetric}</Text>
          </View>
          <View>
             <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ fontFamily: THEME.fonts.primary }}>{secondaryLabel}</Text>
             <Text className="text-text-primary text-sm font-bold" style={{ fontFamily: THEME.fonts.primary }}>{secondaryMetric}</Text>
          </View>
        </View>
      </View>

      {/* Extra metrics footer layout */}
      <View className="flex-row justify-between pt-4 border-t border-border-subtle">
         {footerMetrics.map((metric, index) => (
             <View key={index} className="flex-1">
                <View className="flex-row items-center mb-1">
                   <Ionicons name={metric.icon} size={14} color={metric.iconColor} />
                   <Text className="text-text-muted text-xs font-medium ml-1" style={{ fontFamily: THEME.fonts.primary }}>{metric.label}</Text>
                </View>
                <Text className="text-text-primary font-bold text-sm" style={{ fontFamily: THEME.fonts.primary }}>{metric.value}</Text>
             </View>
         ))}
      </View>
    </View>
  );
}
