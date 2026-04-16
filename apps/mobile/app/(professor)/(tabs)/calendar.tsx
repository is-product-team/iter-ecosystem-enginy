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
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-white dark:bg-black">
      {/* Apple-style Large Header */}
      <View className="px-8 pb-10">
         <Text className="text-[16px] font-normal text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
           {t('Calendar.academic_agenda')}
         </Text>
         <Text className="text-[44px] font-light text-black dark:text-white tracking-tight leading-[48px]">
           {t('Calendar.title')}
         </Text>
      </View>

      <View className="flex-1">
        <CalendarView 
          events={calendarEvents} 
          isLoading={isRangeFetching}
          onMonthChange={fetchRangeData}
          onEventClick={(event) => {
            if (event.type === 'session' && event.metadata?.assignmentId) {
               router.push({
                 pathname: `/(professor)/session/${event.metadata.assignmentId}`,
                 params: { 
                   sessionNum: event.metadata.sessionNum,
                   sessionId: event.metadata.sessionId 
                 }
               } as any);
            } else if (event.type === 'assignment' && event.metadata?.assignmentId) {
               router.push(`/(professor)/session/${event.metadata.assignmentId}`);
            }
          }}
        />
      </View>
    </View>
  );
}
