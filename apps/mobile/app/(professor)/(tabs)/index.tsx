import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { getMyAssignments, getPhases, getNotifications, getMe } from '../../../services/api';
import { CalendarEvent } from '../../../components/EventDetailModal';
import WorkshopDetailModal from '../../../components/WorkshopDetailModal';
import { SessionCarousel } from '../../../components/dashboard/SessionCarousel';
import { QuickAccessGrid } from '../../../components/dashboard/QuickAccessGrid';
import { PageHeader } from '../../../components/ui/PageHeader';
import * as ExpoConstants from 'expo-constants';

const Constants = ExpoConstants.default || ExpoConstants;
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://iter.kore29.com';

// ── Helpers ────────────────────────────────────────────────────────────────

function getContextualGreeting(t: any, name: string, hasTodaySession: boolean, nextDate?: string, i18n?: any): { greeting: string; subtitle: string } {
  const hour = new Date().getHours();
  const greeting = hour < 14 
    ? t('Dashboard.greeting_morning', { name }) 
    : t('Dashboard.greeting_afternoon', { name });

  let subtitle = t('Dashboard.no_upcoming_sessions');
  if (hasTodaySession) {
    subtitle = t('Dashboard.session_today');
  } else if (nextDate) {
    const date = new Date(nextDate);
    const label = date.toLocaleDateString(i18n?.language || 'ca-ES', { weekday: 'long', day: 'numeric', month: 'short' });
    subtitle = t('Dashboard.next_session_on', { label });
  }

  return { greeting, subtitle };
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [phases, setPhases] = React.useState<any[]>([]);
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = React.useState<CalendarEvent | null>(null);
  const [userName, setUserName] = React.useState(t('Common.professor'));
  const [userInitials, setUserInitials] = React.useState(t('Common.initials_fallback'));
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [avatar, setAvatar] = React.useState<string | null>(null);

  const isMounted = React.useRef(true);

  React.useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const checkRoleAndFetchData = React.useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      let userData = null;
      let userImage = null;
      try {
        if (Platform.OS === 'web') {
          userData = localStorage.getItem('user');
          userImage = localStorage.getItem('user-avatar');
        } else {
          userData = await SecureStore.getItemAsync('user');
          userImage = await SecureStore.getItemAsync('user-avatar');
        }
      } catch {
        if (isMounted.current) router.replace('/login');
        return;
      }

      if (userData) {
        const user = JSON.parse(userData);
        if (isMounted.current) {
            if (user.firstName) setUserName(user.firstName);
            else if (user.fullName) setUserName(user.fullName.split(' ')[0]);

            if (user.fullName) {
              const initials = user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
              setUserInitials(initials);
            }

            if (userImage) {
              const fullUrl = userImage.startsWith('http') ? userImage : `${API_URL}${userImage}`;
              setAvatar(fullUrl);
            }
        }

        const roleName = user.role?.roleName;
        if (roleName !== 'PROFESSOR' && roleName !== 'TEACHER') {
          if (isMounted.current) router.replace('/login');
          return;
        }
      } else {
        if (isMounted.current) router.replace('/login');
        return;
      }

      // Sync Profile Data (Async, no block)
      getMe().then(res => {
        if (res.data && isMounted.current) {
          const profile = res.data;
          if (profile.photoUrl) {
            const absoluteUrl = profile.photoUrl.startsWith('http') ? profile.photoUrl : `${API_URL}${profile.photoUrl}`;
            setAvatar(absoluteUrl);
            if (Platform.OS === 'web') {
              localStorage.setItem('user-avatar', profile.photoUrl);
            } else {
              SecureStore.setItemAsync('user-avatar', profile.photoUrl);
            }
          }
          if (profile.fullName) {
             setUserName(profile.fullName.split(' ')[0]);
          }
        }
      }).catch(err => console.warn("Silent profile sync failed", err));

      const [phasesRes, assignmentsRes, notifsRes] = await Promise.all([
        getPhases(),
        getMyAssignments(),
        getNotifications(),
      ]);

      if (!isMounted.current) return;

      const phasesData = phasesRes.data as any;
      const phasesArray = Array.isArray(phasesData) ? phasesData : phasesData.data;
      setPhases(Array.isArray(phasesArray) ? phasesArray : []);
      setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
      setUnreadCount(notifsRes.data.filter((n: any) => !n.isRead).length);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (isMounted.current) {
          setPhases([]);
          setAssignments([]);
      }
    } finally {
      if (isMounted.current) {
          setLoading(false);
          setRefreshing(false);
      }
    }
  }, [router]);

  useFocusEffect(
    React.useCallback(() => {
      checkRoleAndFetchData();
    }, [checkRoleAndFetchData])
  );

  const onRefresh = React.useCallback(() => {
    checkRoleAndFetchData(true);
  }, [checkRoleAndFetchData]);

  // ── Derived data ─────────────────────────────────────────────────────────

  const getAllSessions = () => {
    if (assignments.length === 0) return [];
    const now = new Date();
    const all: any[] = [];
    
    assignments.forEach(assign => {
      if (assign.sessions && assign.sessions.length > 0) {
        // Sort sessions of THIS assignment to get correct index
        const sortedAssignmentSessions = [...assign.sessions].sort((a, b) => 
          new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
        );

        sortedAssignmentSessions.forEach((session: any, index: number) => {
          // sessionDate is typically "YYYY-MM-DD" or ISO string
          // We want to treat it as a LOCAL date
          const dateParts = session.sessionDate.split('T')[0].split('-');
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
          const day = parseInt(dateParts[2], 10);

          const startDate = new Date(year, month, day);
          
          // Parse time if available (e.g., "08:00")
          if (session.startTime) {
            const [hours, minutes] = session.startTime.split(':').map(Number);
            startDate.setHours(hours, minutes, 0, 0);
          }
          
          const endDate = new Date(startDate);
          if (session.endTime) {
            const [hours, minutes] = session.endTime.split(':').map(Number);
            endDate.setHours(hours, minutes, 0, 0);
          } else {
            // Default: session is not "past" until the end of the day
            endDate.setHours(23, 59, 59, 999);
          }

          const isPast = endDate < now;
          const isCurrent = now >= startDate && now <= endDate;
          const isToday = startDate.toDateString() === now.toDateString();
          const evaluated = assign.submissions?.some((s: any) => s.status === 'RESPONDED' && s.target === 'TEACHER');

          all.push({
            sessionId: session.sessionId,
            sessionNum: index + 1, // 1-based index
            assignmentId: assign.assignmentId,
            workshop: assign.workshop,
            center: assign.center,
            startDate: session.sessionDate,
            startTime: session.startTime,
            endTime: session.endTime,
            isSession: true,
            isPast,
            isCurrent,
            isToday,
            isEvaluated: evaluated,
            submissions: assign.submissions,
            // Add a sort key for stable sorting
            sortTime: startDate.getTime()
          });
        });
      }
    });

    // Sort by date/time
    return all.sort((a, b) => a.sortTime - b.sortTime);
  };

  const isEvaluated = (assignment: any) => {
    if (!assignment.submissions) return false;
    return assignment.submissions.some((s: any) => s.status === 'RESPONDED' && s.target === 'TEACHER');
  };

  const carouselSessions = getAllSessions();
  const initialCarouselIndex = React.useMemo(() => {
    if (carouselSessions.length === 0) return 0;
    
    // 1. Prioritize any currently active session
    const currentIdx = carouselSessions.findIndex(s => s.isCurrent);
    if (currentIdx !== -1) return currentIdx;

    // 2. Otherwise, find the first upcoming session
    const upcomingIdx = carouselSessions.findIndex(s => !s.isPast);
    if (upcomingIdx !== -1) return upcomingIdx;

    // 3. Fallback to the last past session (most recent)
    return Math.max(0, carouselSessions.length - 1);
  }, [carouselSessions]);

  const nextWorkshop = carouselSessions[initialCarouselIndex];
  
  const recentWorkshops = assignments
    .filter(a => !carouselSessions.some(s => s.assignmentId === a.assignmentId && !s.isPast))
    .slice(0, 3);

  const activePhase = phases.find(p => p.isActive);
  const activePhaseName = activePhase ? activePhase.name : null;
  const isEvalPhase = activePhaseName?.includes('Evaluation') || activePhaseName?.includes('Closure') || activePhaseName?.includes('Phase 4');

  const hasTodaySession = carouselSessions.some(s => s.isToday);

  const { greeting, subtitle } = getContextualGreeting(
    t,
    userName,
    hasTodaySession,
    nextWorkshop?.startDate,
    i18n
  );

  const handleSessionClick = (session: any) => {
    const formattedEvent: CalendarEvent = {
      id: session.assignmentId,
      title: session.workshop.title,
      date: session.startDate,
      type: 'assignment',
      description: session.workshop.description || t('Common.no_description'),
      metadata: {
        time: `${session.startTime || '09:00'} - ${session.endTime || '13:00'}`,
        center: session.center.name,
        address: session.center.address,
        assignmentId: session.assignmentId,
        isEvaluation: isEvalPhase,
        isEvaluated: session.isEvaluated,
        sessionNum: session.sessionNum, // USE THE CORRECT INDEX (1, 2, 3...)
        sessionId: session.sessionId,
        isPast: session.isPast,
        isCurrent: session.isCurrent,
        isToday: session.isToday,
      },
    };
    setSelectedWorkshop(formattedEvent);
    setModalVisible(true);
  };

  const handleWorkshopClick = (assignment: any) => {
    const evaluated = isEvaluated(assignment);
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 4); // Generic fallback

    const formattedEvent: CalendarEvent = {
      id: assignment.assignmentId,
      title: assignment.workshop.title,
      date: assignment.startDate,
      type: 'assignment',
      description: assignment.workshop.description || t('Common.no_description'),
      metadata: {
        time: `${assignment.startTime || '09:00'} - ${assignment.endTime || '13:00'}`,
        center: assignment.center.name,
        address: assignment.center.address,
        assignmentId: assignment.assignmentId,
        isEvaluation: isEvalPhase,
        isEvaluated: evaluated,
        isPast: endDate < now,
        isCurrent: now >= startDate && now <= endDate,
        isToday: startDate.toDateString() === now.toDateString(),
      },
    };
    setSelectedWorkshop(formattedEvent);
    setModalVisible(true);
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View 
        className="items-center justify-center bg-background-page"
        style={[StyleSheet.absoluteFill, { zIndex: 50 }]}
      >
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#4197CB' : THEME.colors.primary} />
      </View>
    );
  }

  // ── Quick access items ────────────────────────────────────────────────────

  const quickAccessItems = [
    {
      id: 'notifications',
      icon: 'notifications' as const,
      iconColor: '#FF3B30',
      iconBg: '#FF3B3010',
      label: "AVISOS",
      badge: unreadCount,
      value: "Missatges i Avisos",
      onPress: () => router.push('/(professor)/notifications'),
    },
    {
      id: 'coordination',
      icon: 'people' as const,
      iconColor: '#34C759',
      iconBg: '#34C75910',
      label: "XAT",
      value: "Xat de l'equip",
      onPress: () => router.push('/(professor)/coordination'),
    },
    {
      id: 'issues',
      icon: 'alert-circle' as const,
      iconColor: '#AF52DE',
      iconBg: '#AF52DE10',
      label: "SUPORT",
      value: t('Issues.new'),
      onPress: () => router.push('/(professor)/issue/new'), 
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────


  return (
    <View className="flex-1 bg-background-page">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colorScheme === 'dark' ? '#4197CB' : THEME.colors.primary}
            colors={['#4197CB']}
            progressViewOffset={insets.top + 40}
          />
        }
      >
        {/* ── Standardized Header ── */}
        <PageHeader 
          title={greeting} 
          subtitle={subtitle} 
          profileImage={avatar}
          userInitials={userInitials}
        />

        {/* ── Sessions Carousel ── */}
        <SessionCarousel
          sessions={carouselSessions}
          initialIndex={initialCarouselIndex}
          onPressSession={handleSessionClick}
        />

        {/* ── Quick Access Grid ── */}
        <QuickAccessGrid items={quickAccessItems} />

        {/* ── Recent Activity ── */}
        {recentWorkshops.length > 0 && (
          <View className="mt-2">
            <View className="px-5 pb-3">
              <Text className="text-[17px] font-bold text-text-primary">
                {t('Dashboard.recent_workshops')}
              </Text>
            </View>
            <View className="mx-4 bg-background-surface rounded-[24px] overflow-hidden shadow-sm">
              {recentWorkshops.map((item, idx) => (
                <TouchableOpacity
                  key={item.assignmentId}
                  onPress={() => handleWorkshopClick(item)}
                  activeOpacity={0.7}
                  className="flex-row items-center py-4 px-5"
                >
                  <View className="w-10 h-10 rounded-xl bg-background-subtle items-center justify-center mr-4">
                    <Ionicons name="journal-outline" size={20} color={colorScheme === 'dark' ? '#4197CB' : THEME.colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-semibold text-text-primary" numberOfLines={1}>
                      {item.workshop.title}
                    </Text>
                    <Text className="text-[12px] text-text-muted mt-0.5">
                      {item.center.name}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colorScheme === 'dark' ? '#424242' : '#D1D1D6'} />
                  {idx < recentWorkshops.length - 1 && (
                    <View className="absolute bottom-0 left-16 right-0 h-[0.5px] bg-border-subtle/40" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View className="h-10" />
      </ScrollView>

      <WorkshopDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        event={selectedWorkshop}
      />
    </View>
  );
}
