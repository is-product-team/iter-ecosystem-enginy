import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Linking, Modal, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('ca-ES', { month: 'long' });
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
    const firstDay = (firstDayOfMonth(year, currentDate.getMonth()) + 6) % 7; // Adjust to Monday start
    const days = [];

    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, currentDate.getMonth(), d);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.push({ day: d, date: dateStr });
    }

    // Padding for next month to complete the last week
    while (days.length % 7 !== 0) {
      days.push({ day: null, date: null });
    }

    return days;
  }, [currentDate]);

  const getEventsForDay = (dateStr: string) => {
    return events.filter(event => {
      const eStart = event.date.split('T')[0];
      const eEnd = (event.endDate || event.date).split('T')[0];
      return dateStr >= eStart && dateStr <= eEnd;
    });
  };

  const dayEvents = useMemo(() => getEventsForDay(selectedDate), [selectedDate, events]);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'milestone': return THEME.colors.primary;
      case 'deadline': return THEME.colors.accent;
      case 'assignment': return THEME.colors.secondary;
      default: return THEME.colors.gray;
    }
  };

  const openMaps = (address: string, label: string) => {
    if (!address) return;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const url = Platform.select({
      ios: `${scheme}${label}@${address}`,
      android: `${scheme}0,0?q=${address}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-background-page">
      
      {/* Calendar Grid (Seamless) */}
      <View className="px-6 pb-4 pt-2">
        <View className="pb-4">
          
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-extrabold text-text-primary mr-2 capitalize">
                {monthName}
              </Text>
              <Text className="text-lg font-bold text-primary">
                {year}
              </Text>
            </View>
            <View className="flex-row space-x-2">
              <TouchableOpacity onPress={prevMonth} className="w-8 h-8 rounded-full bg-background-subtle items-center justify-center">
                <Ionicons name="chevron-back" size={18} color={THEME.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={nextMonth} className="w-8 h-8 rounded-full bg-background-subtle items-center justify-center">
                <Ionicons name="chevron-forward" size={18} color={THEME.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekdays */}
          <View className="flex-row mb-2">
            {['DL', 'DT', 'DC', 'DJ', 'DV', 'DS', 'DG'].map(d => (
              <View key={d} className="flex-1 items-center">
                <Text className="text-[10px] font-bold text-text-muted">{d}</Text>
              </View>
            ))}
          </View>

          {/* Grid */}
          <View className="flex-row flex-wrap">
            {calendarDays.map((dateObj, idx) => {
              const isSelected = dateObj.date === selectedDate;
              const isToday = dateObj.date === new Date().toISOString().split('T')[0];
              const dayEventsForDot = dateObj.date ? getEventsForDay(dateObj.date) : [];

              return (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => dateObj.date && setSelectedDate(dateObj.date)}
                  className="w-[14.28%] aspect-square items-center justify-center"
                  disabled={!dateObj.date}
                >
                  {dateObj.day && (
                    <View className="items-center">
                      <View className={`w-8 h-8 items-center justify-center rounded-full mb-1 ${
                        isSelected ? 'bg-primary' : isToday ? 'bg-primary/20 border border-primary/40' : ''
                      }`}>
                        <Text className={`text-sm font-bold ${
                          isSelected ? 'text-white' : isToday ? 'text-primary' : 'text-text-primary'
                        }`}>
                          {dateObj.day}
                        </Text>
                      </View>
                      
                      {/* Event Dots */}
                      <View className="flex-row space-x-[2px] h-1">
                        {dayEventsForDot.slice(0, 3).map((e, i) => (
                          <View 
                            key={i} 
                            className="w-1 h-1 rounded-full"
                            style={{ 
                              backgroundColor: e.type === 'milestone' ? '#6366F1' : 
                                             e.type === 'deadline' ? '#EF4444' : 
                                             e.type === 'assignment' ? THEME.colors.primary : THEME.colors.gray
                            }} 
                          />
                        ))}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Subtle loading overlay on the grid */}
          {isLoading && (
            <View className="absolute inset-0 bg-white/30 items-center justify-center">
              <ActivityIndicator color={THEME.colors.primary} />
            </View>
          )}
        </View>
      </View>

      {/* Events List / Agenda (Scrollable) */}
      <View className="flex-1 px-4">
        <View className="py-3">
          <Text className="text-text-muted text-xs font-bold uppercase tracking-widest pl-2">
             {new Date(selectedDate).toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {dayEvents.length === 0 ? (
            <View className="items-center justify-center py-10 rounded-2xl border-2 border-dashed border-border-subtle">
              <Text className="text-text-muted font-medium text-sm">No hi ha esdeveniments</Text>
            </View>
          ) : (
            dayEvents.map(event => (
              <TouchableOpacity 
                key={event.id}
                onPress={() => handleEventClick(event)}
                className="bg-background-surface rounded-2xl p-4 mb-3 shadow-sm border border-border-subtle flex-row"
              >
                {/* Time Column */}
                <View className="w-16 border-r border-border-subtle mr-4 justify-center">
                  <Text className="text-text-primary font-bold text-sm">
                    {event.metadata?.hora ? event.metadata.hora.split(' - ')[0] : 'Tot el dia'}
                  </Text>
                  {event.metadata?.hora && (
                    <Text className="text-text-muted text-[10px] font-bold">
                      {event.metadata.hora.split(' - ')[1]}
                    </Text>
                  )}
                </View>

                {/* Content */}
                <View className="flex-1 justify-center">
                   <View className="flex-row items-center mb-1">
                      <View className={`w-2 h-2 rounded-full mr-2`} style={{ backgroundColor: getEventColor(event.type) }} />
                      <Text className="text-text-primary font-bold text-base flex-1" numberOfLines={1}>{event.title}</Text>
                   </View>
                  
                  {event.metadata?.adreca && (
                    <View className="flex-row items-center">
                        <Ionicons name="location" size={12} color={THEME.colors.gray} className="mr-1" />
                        <Text className="text-text-secondary text-xs font-medium" numberOfLines={1}>
                        {event.metadata.adreca}
                        </Text>
                    </View>
                  )}
                </View>

                {/* Arrow */}
                <View className="justify-center pl-2">
                    <Ionicons name="chevron-forward" size={16} color={THEME.colors.gray} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <WorkshopDetailModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        event={selectedEvent} 
      />
    </View>
  );
};

export default CalendarView;
