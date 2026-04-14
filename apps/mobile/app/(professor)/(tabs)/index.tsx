import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME, ROLES } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import { getMyAssignments, getPhases, getNotifications } from '../../../services/api';

import { CalendarEvent } from '../../../components/EventDetailModal';
import WorkshopDetailModal from '../../../components/WorkshopDetailModal';

// Reusable WhatsApp-style Section Header
const SectionHeader = ({ title }: { title: string }) => (
  <View className="px-6 pt-6 pb-2">
    <Text className="text-text-muted text-[12px] font-bold uppercase tracking-wider">
      {title}
    </Text>
  </View>
);

// Reusable Dashboard Item (WhatsApp Style)
const DashboardItem = ({ 
  icon, 
  iconColor, 
  title, 
  subtitle, 
  onPress, 
  badge,
  isLast = false 
}: { 
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  badge?: number;
  isLast?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-row items-center py-4 px-6 bg-background-surface"
  >
    <View className="w-10 h-10 rounded-full items-center justify-center mr-4 bg-background-subtle border border-border-subtle">
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View className="flex-1 justify-center">
      <Text className="text-text-primary text-[16px] font-bold" style={{ fontFamily: THEME.fonts.primary }}>
        {title}
      </Text>
      {subtitle && (
        <Text className="text-text-muted text-[13px] mt-0.5" numberOfLines={1} style={{ fontFamily: THEME.fonts.primary }}>
          {subtitle}
        </Text>
      )}
    </View>
    {badge !== undefined && badge > 0 && (
      <View className="bg-primary px-2 py-0.5 rounded-full mr-2">
        <Text className="text-white text-[10px] font-black">{badge}</Text>
      </View>
    )}
    <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
    {!isLast && (
      <View className="absolute bottom-0 left-20 right-0 h-[0.5px] bg-border-subtle" />
    )}
  </TouchableOpacity>
);

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
  const [userName, setUserName] = React.useState('Professor');
  const [userInitials, setUserInitials] = React.useState('??');
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [avatar, setAvatar] = React.useState<string | null>(null);
  
  const checkRoleAndFetchData = async (isRefresh = false) => {
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
        } catch (storageError) {
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
          getNotifications()
        ]);
        
        const phasesData = phasesRes.data as any;
        const phasesArray = Array.isArray(phasesData) ? phasesData : phasesData.data;
        setPhases(Array.isArray(phasesArray) ? phasesArray : []);
        setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
        setUnreadCount(notifsRes.data.filter((n: any) => !n.isRead).length);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
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

  useFocusEffect(
    React.useCallback(() => {
      checkRoleAndFetchData();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    checkRoleAndFetchData(true);
  }, []);

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
            time: (assignment.startTime || "09:00") + ' - ' + (assignment.endTime || "13:00"), 
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
      <View className="flex-1 justify-center items-center bg-background-page">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  const pendingAssignments = assignments.filter(a => !isEvaluated(a));

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background-page">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
        }
      >
        
        {/* Refined Left-Aligned Header */}
        <View className="px-6 pt-8 pb-6 bg-background-surface border-b border-border-subtle flex-row justify-between items-end">
           <View className="flex-1">
              <Text className="text-[11px] font-black text-text-muted uppercase tracking-[2px] mb-1">
                {t('Common.practical_workshop')}
              </Text>
              <Text className="text-2xl font-black text-text-primary tracking-tight" style={{ fontFamily: THEME.fonts.primary }}>
                {t('Dashboard.welcome', { name: userName })}
              </Text>
           </View>
           <TouchableOpacity 
             onPress={() => router.push('/profile')}
             activeOpacity={0.8}
             className="w-12 h-12 rounded-full bg-primary items-center justify-center shadow-sm overflow-hidden mb-1"
           >
              {avatar ? (
                <Image source={{ uri: avatar }} className="w-full h-full" />
              ) : (
                <Text className="text-sm font-black text-white">{userInitials}</Text>
              )}
           </TouchableOpacity>
        </View>

        {/* Current Status Section */}
        <SectionHeader title={t('Dashboard.overview')} />
        <View className="bg-background-surface border-t border-b border-border-subtle p-6">
           <View className="bg-background-subtle rounded-[24px] p-5 flex-row items-center border border-border-subtle">
              <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center">
                 <Ionicons name="rocket" size={20} color="white" />
              </View>
              <View className="ml-4 flex-1">
                 <Text className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-0.5">{t('Dashboard.current_phase_label')}</Text>
                 <Text className="text-text-primary text-base font-black">{activePhaseName || "N/A"}</Text>
              </View>
              <View className="bg-white/80 px-2.5 py-1 rounded-full border border-border-subtle">
                 <Text className="text-primary text-[9px] font-black uppercase">{t('Dashboard.active')}</Text>
              </View>
           </View>
        </View>

        {/* Sessions & Tasks */}
        <SectionHeader title={t('Dashboard.next_session')} />
        <View className="border-t border-b border-border-subtle">
           {nextWorkshop ? (
             <DashboardItem 
                icon="calendar"
                iconColor="#007AFF"
                title={nextWorkshop.workshop.title}
                subtitle={`${nextWorkshop.center.name} • ${nextWorkshop.startTime || "09:00"}`}
                onPress={() => handleWorkshopClick(nextWorkshop)}
                isLast={pendingAssignments.length === 0}
             />
           ) : (
             <View className="p-8 items-center bg-background-surface">
                <Text className="text-text-muted text-sm italic">{t('Dashboard.no_upcoming_workshops')}</Text>
             </View>
           )}

           {isEvalPhase && pendingAssignments.map((assign, idx) => (
             <DashboardItem 
                key={assign.assignmentId}
                icon="star"
                iconColor="#FF9500"
                title={assign.workshop.title}
                subtitle={t('Dashboard.evaluate_finished_workshop')}
                onPress={() => router.push(`/(professor)/questionnaire/${assign.assignmentId}`)}
                isLast={idx === pendingAssignments.length - 1}
             />
           ))}
        </View>

        {/* Communications */}
        <SectionHeader title={t('Coordination.collaboration')} />
        <View className="border-t border-b border-border-subtle">
           <DashboardItem 
              icon="notifications"
              iconColor="#FF3B30"
              title={t('Notifications.title')}
              subtitle={unreadCount > 0 ? `${unreadCount} ${t('Notifications.empty').replace(t('Notifications.empty'), 'avisos pendents')}` : t('Notifications.empty')}
              badge={unreadCount}
              onPress={() => router.push('/(professor)/notifications')}
           />
           <DashboardItem 
              icon="people"
              iconColor="#34C759"
              title={t('Coordination.collaboration')}
              subtitle={t('Coordination.teacher_space')}
              onPress={() => router.push('/(professor)/coordination')}
              isLast
           />
        </View>

        <View className="h-12" />
      </ScrollView>

      <WorkshopDetailModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        event={selectedWorkshop} 
      />
    </View>
  );
}
