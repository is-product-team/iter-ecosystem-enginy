import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <View className="mx-8 mb-8 bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[28px] p-8">
        <View className="w-12 h-12 rounded-2xl bg-white dark:bg-black items-center justify-center mb-4 shadow-sm">
          <Ionicons name="calendar-outline" size={24} color="#8E8E93" />
        </View>
        <Text className="text-[19px] font-semibold text-black dark:text-white leading-tight">
          {t('Dashboard.no_upcoming_sessions')}
        </Text>
        <Text className="text-[15px] font-normal text-gray-500 mt-2 leading-relaxed">
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
      activeOpacity={0.8}
      style={{
        backgroundColor: '#FFFFFF', // Blanco puro
        borderRadius: 32,
        padding: 28,
        marginHorizontal: 15, 
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#EFEFEF', // Borde muy sutil
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      {/* Label Indicator */}
      <View className="flex-row items-center mb-6">
        <View style={{ backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 }}>
          <Text style={{ color: '#8E8E93', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
            {isToday ? t('Common.today') : t('Dashboard.next_session_label')}
          </Text>
        </View>
      </View>

      {/* Workshop Title */}
      <Text 
        className="text-black dark:text-white text-[28px] font-light leading-tight mb-6" 
        style={{ letterSpacing: -0.8 }}
        numberOfLines={2}
      >
        {workshop.title}
      </Text>

      {/* Meta Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F2F2F7' }}>
        <View className="flex-row items-center flex-1">
          <Ionicons name="business" size={14} color="#8E8E93" />
          <Text className="text-gray-500 text-[13px] font-medium ml-2" numberOfLines={1}>
            {workshop.center}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons name="time" size={14} color="#4197CB" />
          <Text style={{ color: '#4197CB', fontSize: 13, fontWeight: '700', marginLeft: 6 }}>
            {timeLabel || dateLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
