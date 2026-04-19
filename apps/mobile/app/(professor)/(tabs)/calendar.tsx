import * as React from 'react';
import { View, ActivityIndicator, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { getCalendar } from '../../../services/api';
import CalendarView, { CalendarEvent } from '../../../components/CalendarView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { PageHeader } from '../../../components/ui/PageHeader';

export default function CalendarTabScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isRangeFetching, setIsRangeFetching] = React.useState(false);

  const fetchRangeData = React.useCallback(async (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    setIsRangeFetching(true);
    try {
      // Fix: convert year and month to string as API expects strings
      const calendarRes = await getCalendar(String(year), String(month + 1));
      setCalendarEvents(calendarRes.data);
    } catch (err) {
      console.error("Error fetching range data:", err);
    } finally {
      setIsRangeFetching(false);
      setLoading(false);
    }
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchRangeData(new Date());
    setRefreshing(false);
  }, [fetchRangeData]);

  React.useEffect(() => {
    fetchRangeData(new Date());
  }, [fetchRangeData]);

  return (
    <View className="flex-1 bg-background-page">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4197CB"
            colors={['#4197CB']}
            progressViewOffset={insets.top + 40}
          />
        }
      >
        {/* Standardized Header */}
        <PageHeader title={t('Calendar.title')} subtitle={t('Calendar.academic_agenda')} />

        {loading && !calendarEvents.length ? (
          <View 
            className="items-center justify-center bg-background-page"
            style={[StyleSheet.absoluteFill, { zIndex: 50 }]}
          >
            <ActivityIndicator size="large" color="#4197CB" />
          </View>
        ) : (
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
        )}
      </ScrollView>
    </View>
  );
}
