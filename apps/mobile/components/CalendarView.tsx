import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import WorkshopDetailModal from './WorkshopDetailModal';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'milestone' | 'deadline' | 'assignment' | 'session';
  description?: string;
  metadata?: any;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onMonthChange?: (date: Date) => void;
  isLoading?: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventClick, onMonthChange, isLoading }) => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString(i18n.language || 'ca-ES', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => {
    const newDate = new Date(year, currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(year, currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(year, currentDate.getMonth());
    const firstDay = (firstDayOfMonth(year, currentDate.getMonth()) + 6) % 7; 
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null });
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, currentDate.getMonth(), d);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.push({ day: d, date: dateStr });
    }

    while (days.length % 7 !== 0) {
      days.push({ day: null, date: null });
    }

    return days;
  }, [currentDate, year]);

  const getEventsForDay = React.useCallback((dateStr: string) => {
    return events.filter(event => {
      const eStart = event.date.split('T')[0];
      const eEnd = (event.endDate || event.date).split('T')[0];
      return dateStr >= eStart && dateStr <= eEnd;
    });
  }, [events]);

  const dayEvents = useMemo(() => getEventsForDay(selectedDate), [selectedDate, getEventsForDay]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">

      {/* Modern Apple-style Calendar Grid */}
      <View className="px-8 pb-6 pt-2">
        
        {/* Month Selector */}
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-[24px] font-semibold text-black dark:text-white capitalize">
              {monthName} <Text className="font-light text-gray-400">{year}</Text>
            </Text>
          </View>
          <View className="flex-row bg-[#F2F2F7] dark:bg-[#1C1C1E] p-1 rounded-full">
            <TouchableOpacity onPress={prevMonth} className="w-8 h-8 items-center justify-center">
              <Ionicons name="chevron-back" size={18} color="#007AFF" />
            </TouchableOpacity>
            <View className="w-[1px] h-4 bg-gray-300 dark:bg-gray-700 self-center" />
            <TouchableOpacity onPress={nextMonth} className="w-8 h-8 items-center justify-center">
              <Ionicons name="chevron-forward" size={18} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Weekdays Labels */}
        <View className="flex-row mb-4">
          {[
            t('Calendar.weekdays.dl'),
            t('Calendar.weekdays.dt'),
            t('Calendar.weekdays.dc'),
            t('Calendar.weekdays.dj'),
            t('Calendar.weekdays.dv'),
            t('Calendar.weekdays.ds'),
            t('Calendar.weekdays.dg'),
          ].map(d => (
            <View key={d} className="flex-1 items-center">
              <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{d}</Text>
            </View>
          ))}
        </View>

        {/* Days Grid */}
        <View className="flex-row flex-wrap">
          {calendarDays.map((dateObj, idx) => {
            const isSelected = dateObj.date === selectedDate;
            const isToday = dateObj.date === new Date().toISOString().split('T')[0];
            const dayEventsForDot = dateObj.date ? getEventsForDay(dateObj.date) : [];

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => dateObj.date && setSelectedDate(dateObj.date)}
                className="w-[14.28%] aspect-square items-center justify-center mb-1"
                disabled={!dateObj.date}
              >
                {dateObj.day && (
                  <View className="items-center justify-center w-full h-full">
                    <View className={`w-9 h-9 items-center justify-center rounded-full ${
                        isSelected ? 'bg-black dark:bg-white' : 
                        isToday ? 'bg-[#007AFF15]' : ''
                      }`}>
                      <Text className={`text-[15px] ${
                          isSelected ? 'font-bold text-white dark:text-black' : 
                          isToday ? 'font-bold text-[#007AFF]' : 'font-medium text-black dark:text-white'
                        }`}>
                        {dateObj.day}
                      </Text>
                    </View>

                    {/* Minimal Dots */}
                    <View className="flex-row space-x-[3px] absolute bottom-1">
                      {dayEventsForDot.slice(0, 1).map((_, i) => (
                        <View
                          key={i}
                          className={`w-1 h-1 rounded-full ${isSelected ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading && (
          <View className="absolute inset-0 bg-white/50 dark:bg-black/50 items-center justify-center rounded-3xl">
            <ActivityIndicator color="#007AFF" />
          </View>
        )}
      </View>

      {/* Agenda Header */}
      <View className="px-8 pt-4 pb-2 border-t border-[#F2F2F7] dark:border-[#1C1C1E]">
        <Text className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">
          {new Date(selectedDate).toLocaleDateString(i18n.language || 'ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      {/* Scrollable Events List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}>
        {dayEvents.length === 0 ? (
          <View className="py-12 items-center justify-center bg-[#F9F9F9] dark:bg-[#1C1C1E] rounded-[24px] border border-dashed border-gray-200 dark:border-gray-800">
            <Text className="text-gray-400 font-medium text-[14px]">{t('Calendar.no_events')}</Text>
          </View>
        ) : (
          dayEvents.map(event => (
            <TouchableOpacity
              key={event.id}
              onPress={() => handleEventClick(event)}
              activeOpacity={0.7}
              style={{
                backgroundColor: '#F9F9F9',
                borderRadius: 20,
                padding: 20,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#EFEFEF',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <View style={{ flex: 1 }}>
                <View className="flex-row items-center mb-1">
                  <View className="w-2 h-2 rounded-full bg-[#007AFF] mr-3" />
                  <Text className="text-black font-semibold text-[16px] flex-1" numberOfLines={1}>
                    {event.title}
                  </Text>
                </View>
                <Text className="text-gray-500 text-[13px] ml-5 font-medium">
                  {event.metadata?.hora || t('Calendar.all_day')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#AEAEB2" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <WorkshopDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        event={selectedEvent}
      />
    </View>
  );
};

export default CalendarView;
