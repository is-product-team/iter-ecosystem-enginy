import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { THEME } from '@iter/shared';
import { getCalendar } from '../../../services/api';
import CalendarView, { CalendarEvent } from '../../../components/CalendarView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function CalendarTabScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const calendarRes = await getCalendar();
        setCalendarEvents(calendarRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-page">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background-page">
      {/* Professional Header */}
      <View className="px-6 pb-6 pt-4 bg-background-surface border-b border-border-subtle mb-6">
         <Text className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
           {t('Calendar.academic_agenda')}
         </Text>
         <Text className="text-3xl font-extrabold text-text-primary leading-tight">
           {t('Calendar.title')}
         </Text>
      </View>

      <CalendarView 
        events={calendarEvents} 
        onEventClick={(event) => {
          if (event.type === 'assignment' && event.metadata?.assignmentId) {
            // Optional: Implement direct navigation
          }
        }}
      />
    </View>
  );
}
