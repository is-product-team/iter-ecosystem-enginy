import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import { useTranslation } from 'react-i18next';

interface HeroCardProps {
  workshop?: {
    title: string;
    center: string;
    date: string;
    startTime?: string;
    endTime?: string;
    isToday?: boolean;
  };
  onPress?: () => void;
}

function formatDate(dateStr: string, t: any, i18n: any): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return t('Common.today');
  if (date.toDateString() === tomorrow.toDateString()) return t('Common.tomorrow');

  return date.toLocaleDateString(i18n.language || 'ca-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function HeroCard({ workshop, onPress }: HeroCardProps) {
  const { t, i18n } = useTranslation();

  if (!workshop) {
    return (
      <View className="mx-4 mb-6 bg-background-surface rounded-[28px] p-6 shadow-sm">
        <View className="w-12 h-12 rounded-2xl bg-background-subtle items-center justify-center mb-4">
          <Ionicons name="calendar-outline" size={24} color={THEME.colors.gray} />
        </View>
        <Text className="text-[17px] font-semibold text-text-primary leading-snug">
          {t('Dashboard.no_upcoming_sessions')}
        </Text>
        <Text className="text-[14px] font-normal text-text-muted mt-1 leading-relaxed">
          {t('Dashboard.no_upcoming_workshops')}
        </Text>
      </View>
    );
  }

  const dateLabel = formatDate(workshop.date, t, i18n);
  const timeLabel = workshop.startTime
    ? `${workshop.startTime}${workshop.endTime ? ` – ${workshop.endTime}` : ''}`
    : null;
  const isToday = workshop.isToday;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      className="mx-4 mb-6 bg-primary rounded-[28px] p-6 overflow-hidden shadow-lg shadow-primary/20"
    >
      {/* Top row */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="bg-white/20 rounded-xl px-3 py-1.5">
          <Text className="text-white text-[11px] font-bold uppercase tracking-wider">
            {isToday ? t('Common.today') : t('Dashboard.next_session_label')}
          </Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.7)" />
      </View>

      {/* Workshop title */}
      <Text className="text-white text-[22px] font-bold leading-tight mb-1" numberOfLines={2}>
        {workshop.title}
      </Text>

      {/* Divider */}
      <View className="h-[0.5px] bg-white/20 my-4" />

      {/* Meta info row */}
      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center flex-1">
          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.75)" />
          <Text className="text-white/75 text-[13px] font-medium ml-1.5" numberOfLines={1}>
            {workshop.center}
          </Text>
        </View>
        {timeLabel && (
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.75)" />
            <Text className="text-white/75 text-[13px] font-medium ml-1.5">
              {dateLabel} · {timeLabel}
            </Text>
          </View>
        )}
        {!timeLabel && (
          <Text className="text-white/75 text-[13px] font-medium">{dateLabel}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
