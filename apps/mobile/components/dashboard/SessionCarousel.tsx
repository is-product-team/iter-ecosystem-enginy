import React from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 30; 
const DOT_CONTAINER_WIDTH = 16; // Balanced width for each dot slot
const VISIBLE_DOTS = 4;
const VIEWPORT_WIDTH = DOT_CONTAINER_WIDTH * VISIBLE_DOTS + 10; 

interface Session {
  sessionId: number | string;
  assignmentId: number;
  workshop: { title: string };
  center: { name: string };
  startDate: string;
  startTime?: string;
  endTime?: string;
  isToday?: boolean;
  isPast?: boolean;
  isCurrent?: boolean;
  isSession?: boolean;
  isEvaluated?: boolean;
}

interface SessionCarouselProps {
  sessions: Session[];
  initialIndex?: number;
  onPressSession: (session: Session) => void;
}

// ── Components ──────────────────────────────────────────────────────────────

const PaginationDot = ({ index, scrollX, isPast, isEvaluated }: { index: number, scrollX: Animated.Value, isPast?: boolean, isEvaluated?: boolean }) => {
  const { colorScheme } = useColorScheme();
  const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

  const width = scrollX.interpolate({
    inputRange,
    outputRange: [6, 14, 6],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  // Traffic light logic
  let activeColor = colorScheme === 'dark' ? '#4197CB' : '#007AFF'; // Future/Current
  if (isPast) {
    activeColor = isEvaluated ? '#34C759' : '#FF3B30'; // Green if done, Red if pending
  }

  return (
    <View style={{ width: DOT_CONTAINER_WIDTH, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          width,
          height: 6,
          borderRadius: 3,
          backgroundColor: activeColor,
          opacity,
        }}
      />
    </View>
  );
};

function formatDate(dateStr: string, t: any, i18n: any): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return t('Common.today');
  if (date.toDateString() === tomorrow.toDateString()) return t('Common.tomorrow');

  return date.toLocaleDateString(i18n.language || 'ca-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function SessionCarousel({ sessions, initialIndex = 0, onPressSession }: SessionCarouselProps) {
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();
  const flatListRef = React.useRef<FlatList>(null);
  const scrollX = React.useRef(new Animated.Value(initialIndex * SCREEN_WIDTH)).current;
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);

  // Sync scrollX and activeIndex when initialIndex changes from parent
  // This is crucial for the first data load
  React.useEffect(() => {
    if (sessions.length > 0) {
      scrollX.setValue(initialIndex * SCREEN_WIDTH);
      setActiveIndex(initialIndex);
      
      // Secondary fallback scroll
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialIndex, sessions.length, scrollX]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / SCREEN_WIDTH);
        if (index !== activeIndex) {
          setActiveIndex(index);
        }
      }
    }
  );

  const renderItem = ({ item }: { item: Session }) => {
    const dateLabel = formatDate(item.startDate, t, i18n);
    const timeLabel = item.startTime
      ? `${item.startTime}${item.endTime ? ` – ${item.endTime}` : ''}`
      : null;

    let badgeText = t('Dashboard.next_session_label');
    let textColor = '#8E8E93';

    if (item.isCurrent) {
      badgeText = t('Dashboard.current_session_label') || 'ARA MATEIX';
      textColor = '#34C759';
    } else if (item.isPast) {
      const showEvaluated = item.isEvaluated;
      badgeText = showEvaluated ? t('Common.evaluated') || 'VALORAT' : t('Dashboard.past_session_label') || 'REALITZADA';
      textColor = showEvaluated ? '#34C759' : '#FF3B30';
    } else if (item.isToday) {
      badgeText = t('Common.today');
      textColor = '#007AFF';
    }

    return (
      <TouchableOpacity
        onPress={() => onPressSession(item)}
        activeOpacity={0.8}
        className="bg-background-surface border border-border-subtle shadow-sm mx-[15px] mb-8 p-7 rounded-[32px]"
        style={{
          width: CARD_WIDTH,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 3,
          opacity: (item.isPast && item.isEvaluated) ? 0.7 : 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ paddingVertical: 4 }}>
            <Text style={{ color: textColor, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {badgeText}
            </Text>
          </View>
          {item.isPast && (
            <Ionicons 
              name={item.isEvaluated ? "checkmark-circle" : "alert-circle"} 
              size={16} 
              color={item.isEvaluated ? "#34C759" : "#FF3B30"} 
              style={{ marginLeft: 8 }} 
            />
          )}
        </View>

        <Text 
          className="text-text-primary"
          style={{ fontSize: 28, fontWeight: '300', lineHeight: 34, marginBottom: 24, letterSpacing: -0.8 }}
          numberOfLines={2}
        >
          {item.workshop.title}
        </Text>

        <View 
          className="border-t border-border-subtle"
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 20 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="business" size={14} color={colorScheme === 'dark' ? '#676767' : '#8E8E93'} />
            <Text className="text-text-secondary ml-2 flex-1" style={{ fontSize: 13, fontWeight: '500' }} numberOfLines={1}>
              {item.center.name}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time" size={14} color={item.isCurrent ? "#34C759" : (colorScheme === 'dark' ? '#4197CB' : "#4197CB")} />
            <Text style={{ color: item.isCurrent ? "#34C759" : (colorScheme === 'dark' ? '#4197CB' : "#4197CB"), fontSize: 13, fontWeight: '700', marginLeft: 6 }}>
              {timeLabel || dateLabel}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (sessions.length === 0) {
    return (
      <View className="bg-background-surface border border-border-subtle shadow-sm mx-4 mb-6 p-6 rounded-[24px]" style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
      }}>
        <View className="bg-background-subtle w-11 h-11 rounded-[12px] items-center justify-center mb-4">
          <Ionicons name="calendar-outline" size={22} color={colorScheme === 'dark' ? '#4197CB' : "#00426B"} />
        </View>
        <Text className="text-text-primary" style={{ fontSize: 16, fontWeight: '600', letterSpacing: -0.3 }}>
          {t('Dashboard.no_upcoming_sessions')}
        </Text>
        <Text className="text-text-muted mt-1" style={{ fontSize: 13, fontWeight: '400', lineHeight: 18 }}>
          {t('Dashboard.no_upcoming_workshops')}
        </Text>
      </View>
    );
  }

  // Calculate sliding animation for the dots container
  const translateX = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH * Math.max(1, sessions.length - 1)],
    outputRange: [
        0, 
        -(Math.max(0, sessions.length - VISIBLE_DOTS) * DOT_CONTAINER_WIDTH)
    ],
    extrapolate: 'clamp'
  });

  return (
    <View>
      <FlatList
        key={`carousel-${sessions.length}`} // Force fresh mount when data arrives
        ref={flatListRef}
        data={sessions}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.sessionId}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        initialScrollIndex={initialIndex > 0 ? initialIndex : undefined}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
          }, 100);
        }}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        contentContainerStyle={{ paddingLeft: 0 }}
      />
      
      {/* Pagination Dots - High-Precision Continuous Sliding Viewport */}
      <View style={{ 
        height: 20,
        width: VIEWPORT_WIDTH,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: 5,
        marginBottom: 30,
        overflow: 'hidden',
        alignSelf: 'center',
      }}>
        <Animated.View style={{ 
          flexDirection: 'row',
          alignItems: 'center',
          transform: [{ translateX }] 
        }}>
          {sessions.map((session, index) => (
            <PaginationDot 
              key={`dot-${index}`} 
              index={index}
              scrollX={scrollX}
              isPast={session.isPast}
              isEvaluated={session.isEvaluated}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}
