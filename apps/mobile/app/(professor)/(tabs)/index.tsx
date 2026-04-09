import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME, PHASES } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import { getMyAssignments, getPhases, getNotifications } from '../../../services/api';

import { CalendarEvent } from '../../../components/EventDetailModal';
import WorkshopDetailModal from '../../../components/WorkshopDetailModal';
import StatusCard from '../../../components/dashboard/StatusCard';
import FeatureListModule from '../../../components/dashboard/FeatureListModule';

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phases, setPhases] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<CalendarEvent | null>(null);
  const [userName, setUserName] = useState('Professor');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // 1. Helpers
  const isPhaseActive = (phaseName: string) => {
    const phase = phases.find(p => p.name === phaseName);
    return phase ? phase.isActive : false;
  };

  const checkRoleAndFetchData = async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        let userData = null;
        try {
          userData = Platform.OS === 'web' 
            ? localStorage.getItem('user') 
            : await SecureStore.getItemAsync('user');
        } catch (storageError) {
          console.warn("⚠️ [Dashboard] Error accessing storage:", storageError);
          router.replace('/login');
          return;
        }
        
        if (userData) {
          const user = JSON.parse(userData);
          console.log("🔍 [DEBUG DASHBOARD] User found:", user.email, "Role:", user.role?.roleName);

          if (user.firstName) setUserName(user.firstName);
          else if (user.fullName) setUserName(user.fullName.split(' ')[0]);
          
          const roleName = user.role?.roleName;
          if (roleName !== 'PROFESSOR' && roleName !== 'TEACHER') {
            console.warn("⚠️ [Dashboard] Unauthorized role:", roleName);
            router.replace('/login');
            return;
          }
        } else {
          console.log("🔍 [DEBUG DASHBOARD] No user data, redirecting...");
          router.replace('/login');
          return;
        }

        const [phasesRes, assignmentsRes] = await Promise.all([
          getPhases(),
          getMyAssignments()
        ]);
        
        // The /phases API returns { data: [...], meta: [...] }
        const phasesData = phasesRes.data as any;
        const phasesArray = Array.isArray(phasesData) ? phasesData : phasesData.data;
        setPhases(Array.isArray(phasesArray) ? phasesArray : []);
        
        // Assignments API returns the array directly
        setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);

        // 4. Fetch Notifications
        const notifsRes = await getNotifications();
        const unread = notifsRes.data.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        // Ensure state remains valid even on error
        setPhases([]);
        setAssignments([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
  };

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
                    submissions: assign.submissions
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
                submissions: assign.submissions
             });
        }
    });
    allSessions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return allSessions.find(s => new Date(s.startDate).getTime() >= now.getTime() - 72000000) || allSessions[allSessions.length - 1];
  };

  const isEvaluated = (assignment: any) => {
      if (!assignment.submissions) return false;
      return assignment.submissions.some((s: any) => 
          s.status === 'RESPONDED' && s.target === 'TEACHER'
      );
  };

  // 2. Effects
  useFocusEffect(
    React.useCallback(() => {
      checkRoleAndFetchData();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    checkRoleAndFetchData(true);
  }, []);

  // 3. Derived State
  const nextWorkshop = getNextSession();
  const activePhase = phases.find(p => p.isActive);
  const activePhaseName = activePhase ? activePhase.name : '';
  const isEvalPhase = activePhaseName.includes('Evaluation') || activePhaseName.includes('Closure') || activePhaseName.includes('Phase 4');

  const handleWorkshopClick = (assignment: any) => {
    const evaluated = isEvaluated(assignment);

    const formattedEvent: CalendarEvent = {
        id: assignment.assignmentId,
        title: assignment.workshop.title,
        date: assignment.startDate,
        type: 'assignment',
        description: assignment.workshop.description || t('Common.no_description'),
        metadata: {
            time: new Date(assignment.startDate).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(new Date(assignment.startDate).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }), 
            center: assignment.center.name,
            address: assignment.center.address,
            assignmentId: assignment.assignmentId,
            isEvaluation: isEvalPhase,
            isEvaluated: evaluated
        }
    };
    setSelectedWorkshop(formattedEvent);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9FAFB]">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  // Filter assignments for pending tasks
  const pendingAssignments = assignments.filter(a => !isEvaluated(a));

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background-page">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={THEME.colors.primary} 
            colors={[THEME.colors.primary]} 
          />
        }
      >
        
        {/* Professional Header */}
        <View className="px-6 pb-6 pt-4 mb-6">
          <View className="flex-row items-baseline mb-2">
            <Text className="text-text-muted text-xs font-bold uppercase tracking-widest mr-2" style={{ fontFamily: THEME.fonts.primary }}>
              {new Date().toLocaleDateString(i18n.language, { weekday: 'long' })}
            </Text>
            <Text className="text-text-secondary text-xs font-bold uppercase tracking-widest" style={{ fontFamily: THEME.fonts.primary }}>
              {new Date().toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <Text className="text-3xl font-extrabold text-text-primary leading-tight" style={{ fontFamily: THEME.fonts.primary }}>
            {t('Dashboard.welcome', { name: userName })}
          </Text>
        </View>

        <View className="px-6">
          <StatusCard
            title={t('Dashboard.overview')}
            percentage={assignments.length > 0 ? Math.round(((assignments.length - pendingAssignments.length) / assignments.length) * 100) : 0}
            primaryLabel={t('Dashboard.current_phase_label')}
            primaryMetric={activePhaseName || t('Dashboard.loading_data')}
            secondaryLabel={t('Dashboard.total_workshops')}
            secondaryMetric={`${assignments.length}`}
            footerMetrics={[
              {
                icon: "school",
                iconColor: "#4197CB",
                label: t('Common.status'),
                value: t('Dashboard.active')
              },
              {
                icon: "time",
                iconColor: "#F26178",
                label: t('Dashboard.next_session_label'),
                value: nextWorkshop?.startTime || "N/A"
              }
            ]}
          />

          {/* Pending Tasks Module */}
          {isEvalPhase && pendingAssignments.length > 0 && (
            <FeatureListModule
              title={t('Dashboard.pending_tasks')}
              items={pendingAssignments.map(assign => ({
                id: assign.assignmentId,
                title: assign.workshop.title,
                subtitle: t('Dashboard.evaluate_finished_workshop'),
                icon: 'star',
                iconColor: '#F59E0B',
                iconBgColor: '#78350F',
                onPress: () => router.push(`/(professor)/questionnaire/${assign.assignmentId}`)
              }))}
            />
          )}

          {/* Next Session Module */}
          {nextWorkshop ? (
            <FeatureListModule
              title={t('Dashboard.next_session')}
              items={[{
                id: nextWorkshop.assignmentId,
                title: nextWorkshop.workshop.title,
                subtitle: nextWorkshop.center.name,
                icon: 'calendar',
                iconColor: '#38BDF8',
                iconBgColor: '#0C4A6E',
                onPress: () => handleWorkshopClick(nextWorkshop)
              }]}
            />
          ) : (
            <View className="w-full items-center justify-center py-10 rounded-3xl border border-border-subtle border-dashed mb-8">
               <Text className="text-text-muted font-medium text-sm" style={{ fontFamily: THEME.fonts.primary }}>{t('Dashboard.no_upcoming_workshops')}</Text>
            </View>
          )}

          {/* Communications Section */}
          <FeatureListModule
            title={t('Coordination.collaboration')}
            items={[
              {
                id: 'notifications',
                title: t('Notifications.title'),
                subtitle: unreadCount > 0 ? `${unreadCount} ${t('Notifications.empty').replace(t('Notifications.empty'), 'avisos pendents')}` : t('Notifications.empty'),
                icon: 'notifications',
                iconColor: '#F87171',
                iconBgColor: '#450a0a',
                onPress: () => router.push('/(professor)/notifications')
              },
              {
                id: 'coordination',
                title: t('Coordination.collaboration'),
                subtitle: t('Coordination.teacher_space'),
                icon: 'people',
                iconColor: '#34D399',
                iconBgColor: '#064e3b',
                onPress: () => router.push('/(professor)/coordination')
              }
            ]}
          />

          <View className="h-6" /> 
        </View>
      </ScrollView>

      <WorkshopDetailModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        event={selectedWorkshop} 
      />
    </View>
  );
}
