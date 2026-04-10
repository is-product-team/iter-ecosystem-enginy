import * as React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { THEME } from '@iter/shared';
import { getCalendar } from '../../../services/api';
import CalendarView, { CalendarEvent } from '../../../components/CalendarView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

export default function CalendarTabScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isRangeFetching, setIsRangeFetching] = React.useState(false);

  const fetchRangeData = React.useCallback(async (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const start = new Date(year, month, 1 - 7);
    const end = new Date(year, month + 1, 7);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    setIsRangeFetching(true);
    try {
      const calendarRes = await getCalendar(startStr, endStr);
      setCalendarEvents(calendarRes.data);
    } catch (err) {
      console.error("Error fetching range data:", err);
    } finally {
      setIsRangeFetching(false);
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRangeData(new Date());
  }, [fetchRangeData]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-page">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background-page">
      {/* Refined Left-Aligned Header */}
      <View className="px-6 pt-8 pb-6 bg-background-surface border-b border-border-subtle">
         <Text className="text-[11px] font-black text-text-muted uppercase tracking-[2px] mb-1">
           {t('Calendar.academic_agenda')}
         </Text>
         <Text className="text-2xl font-black text-text-primary tracking-tight" style={{ fontFamily: THEME.fonts.primary }}>
           {t('Calendar.title')}
         </Text>
      </View>

      <View className="flex-1">
        <CalendarView 
          events={calendarEvents} 
          isLoading={isRangeFetching}
          onMonthChange={fetchRangeData}
          onEventClick={(event) => {
            if (event.type === 'assignment' && event.metadata?.assignmentId) {
               router.push(`/assignment/${event.metadata.assignmentId}`);
            }
          }}
        />
      </View>
    </View>
  );
}
