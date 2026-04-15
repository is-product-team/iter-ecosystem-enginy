import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import { getMyAssignments, getPhases, getNotifications } from '../../../services/api';
import { CalendarEvent } from '../../../components/EventDetailModal';
import WorkshopDetailModal from '../../../components/WorkshopDetailModal';
import { HeroCard } from '../../../components/dashboard/HeroCard';
import { QuickAccessGrid } from '../../../components/dashboard/QuickAccessGrid';

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
      } catch (_storageError) {
        router.replace('/login');
        return;
      }

      if (userData) {
        const user = JSON.parse(userData);
        if (user.firstName) setUserName(user.firstName);
        else if (user.fullName) setUserName(user.fullName.split(' ')[0]);

        if (user.fullName) {
          const initials = user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
          setUserInitials(initials);
        }

        if (userImage) setAvatar(userImage);

        const roleName = user.role?.roleName;
        if (roleName !== 'PROFESSOR' && roleName !== 'TEACHER') {
          router.replace('/login');
          return;
        }
      } else {
        router.replace('/login');
        return;
      }

      const [phasesRes, assignmentsRes, notifsRes] = await Promise.all([
        getPhases(),
        getMyAssignments(),
        getNotifications(),
      ]);

      const phasesData = phasesRes.data as any;
      const phasesArray = Array.isArray(phasesData) ? phasesData : phasesData.data;
      setPhases(Array.isArray(phasesArray) ? phasesArray : []);
      setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
      setUnreadCount(notifsRes.data.filter((n: any) => !n.isRead).length);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setPhases([]);
      setAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router, t]);

  useFocusEffect(
    React.useCallback(() => {
      checkRoleAndFetchData();
    }, [checkRoleAndFetchData])
  );

  const onRefresh = React.useCallback(() => {
    checkRoleAndFetchData(true);
  }, [checkRoleAndFetchData]);

  // ── Derived data ─────────────────────────────────────────────────────────

  const getNextSession = () => {
    if (assignments.length === 0) return null;
    const now = new Date();
    const allSessions: any[] = [];
    assignments.forEach(assign => {
      if (assign.sessions && assign.sessions.length > 0) {
        assign.sessions.forEach((session: any) => {
          allSessions.push({
            assignmentId: assign.assignmentId,
            workshop: assign.workshop,
            center: assign.center,
            startDate: session.sessionDate,
            startTime: session.startTime,
            endTime: session.endTime,
            isSession: true,
            submissions: assign.submissions,
          });
        });
      } else {
        allSessions.push({
          assignmentId: assign.assignmentId,
          workshop: assign.workshop,
          center: assign.center,
          startDate: assign.startDate,
          startTime: null,
          isSession: false,
          submissions: assign.submissions,
        });
      }
    });
    allSessions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return allSessions.find(s => new Date(s.startDate).getTime() >= now.getTime() - 72000000) || allSessions[allSessions.length - 1];
  };

  const isEvaluated = (assignment: any) => {
    if (!assignment.submissions) return false;
    return assignment.submissions.some((s: any) => s.status === 'RESPONDED' && s.target === 'TEACHER');
  };

  const nextWorkshop = getNextSession();
  const recentWorkshops = assignments
    .filter(a => a.assignmentId !== nextWorkshop?.assignmentId)
    .slice(0, 3);

  const activePhase = phases.find(p => p.isActive);
  const activePhaseName = activePhase ? activePhase.name : null;
  const isEvalPhase = activePhaseName?.includes('Evaluation') || activePhaseName?.includes('Closure') || activePhaseName?.includes('Phase 4');
  const pendingAssignments = assignments.filter(a => !isEvaluated(a));

  const today = new Date();
  const hasTodaySession = nextWorkshop
    ? new Date(nextWorkshop.startDate).toDateString() === today.toDateString()
    : false;

  const { greeting, subtitle } = getContextualGreeting(
    t,
    userName,
    hasTodaySession,
    nextWorkshop?.startDate,
    i18n
  );

  const handleWorkshopClick = (assignment: any) => {
    const evaluated = isEvaluated(assignment);
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
      },
    };
    setSelectedWorkshop(formattedEvent);
    setModalVisible(true);
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-subtle dark:bg-background-surface">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  // ── Quick access items ────────────────────────────────────────────────────

  const quickAccessItems = [
    {
      id: 'notifications',
      icon: 'notifications' as const,
      iconColor: '#FF3B30',
      iconBg: '#FF3B3015',
      label: t('Notifications.title'),
      badge: unreadCount,
      value: unreadCount > 0 ? t('Dashboard.pending_count', { count: unreadCount }) : t('Dashboard.none_new'),
      onPress: () => router.push('/(professor)/notifications'),
    },
    {
      id: 'phase',
      icon: 'rocket' as const,
      iconColor: THEME.colors.primary,
      iconBg: `${THEME.colors.primary}15`,
      label: t('Dashboard.phase_status'),
      value: activePhaseName || 'N/A',
      onPress: () => {},
    },
    {
      id: 'coordination',
      icon: 'people' as const,
      iconColor: '#34C759',
      iconBg: '#34C75915',
      label: t('Coordination.collaboration'),
      value: t('Coordination.contact'),
      onPress: () => router.push('/(professor)/coordination'),
    },
    ...(isEvalPhase && pendingAssignments.length > 0 ? [{
      id: 'evaluations',
      icon: 'star' as const,
      iconColor: '#FF9500',
      iconBg: '#FF950015',
      label: t('Evaluation.title'),
      value: t('Dashboard.pending_count', { count: pendingAssignments.length }),
      onPress: () => router.push(`/(professor)/questionnaire/${pendingAssignments[0].assignmentId}`),
    }] : []),
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  const centerName = assignments.length > 0 ? assignments[0].center.name : null;

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background-subtle dark:bg-background-surface">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
        }
      >
        {/* ── Contextual Header ── */}
        <View className="px-5 pt-10 pb-6 flex-row justify-between items-center">
          <View className="flex-1 mr-4">
            <Text className="text-[32px] font-bold text-text-primary dark:text-white tracking-tighter leading-tight">
              {greeting}
            </Text>
            {centerName && (
              <Text className="text-[13px] font-bold text-primary uppercase tracking-widest mt-1">
                {centerName}
              </Text>
            )}
            <Text className="text-[15px] font-medium text-text-muted mt-0.5">
              {subtitle}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
            className="w-12 h-12 rounded-full bg-primary items-center justify-center overflow-hidden"
          >
            {avatar ? (
              <Image source={{ uri: avatar }} className="w-full h-full" />
            ) : (
              <Text className="text-sm font-black text-white">{userInitials}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Hero Card ── */}
        <HeroCard
          workshop={nextWorkshop ? {
            title: nextWorkshop.workshop.title,
            center: nextWorkshop.center.name,
            date: nextWorkshop.startDate,
            startTime: nextWorkshop.startTime,
            endTime: nextWorkshop.endTime,
            isToday: hasTodaySession,
          } : undefined}
          onPress={nextWorkshop ? () => handleWorkshopClick(nextWorkshop) : undefined}
        />

        {/* ── Quick Access Grid ── */}
        <QuickAccessGrid items={quickAccessItems} />

        {/* ── Recent Activity ── */}
        {recentWorkshops.length > 0 && (
          <View className="mt-2">
            <View className="px-5 pb-3">
              <Text className="text-[17px] font-bold text-text-primary dark:text-white">
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
                    <Ionicons name="journal-outline" size={20} color={THEME.colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-semibold text-text-primary dark:text-white" numberOfLines={1}>
                      {item.workshop.title}
                    </Text>
                    <Text className="text-[12px] text-text-muted mt-0.5">
                      {item.center.name}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D1D6" />
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
