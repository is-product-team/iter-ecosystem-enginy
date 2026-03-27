import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME, PHASES } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import api, { getMyAssignments, getFases, getNotificacions } from '../../../services/api';

import { CalendarEvent } from '../../../components/EventDetailModal';
import WorkshopDetailModal from '../../../components/WorkshopDetailModal';

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fases, setFases] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<CalendarEvent | null>(null);
  const [userName, setUserName] = useState('Professor');
  
  // 1. Helpers
  const isPhaseActive = (nomFase: string) => {
    const fase = fases.find(f => f.nom === nomFase);
    return fase ? fase.activa : false;
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
          console.warn("⚠️ [Dashboard] Error accedint al magatzem:", storageError);
          router.replace('/login');
          return;
        }
        
        if (userData) {
          const user = JSON.parse(userData);
          if (user.nom) setUserName(user.nom);
          if (user.rol?.nom_rol !== 'PROFESSOR') {
            router.replace('/login');
            return;
          }
        } else {
          router.replace('/login');
          return;
        }

        const [fasesRes, assignmentsRes] = await Promise.all([
          getFases(),
          getMyAssignments()
        ]);
        setFases(fasesRes.data.data);
        setAssignments(assignmentsRes.data);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
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
            assign.sessions.forEach((sess: any) => {
                allSessions.push({
                    id_assignacio: assign.id_assignacio,
                    taller: assign.taller,
                    centre: assign.centre,
                    data_inici: sess.data_sessio, 
                    hora_inici: sess.hora_inici,
                    hora_fi: sess.hora_fi,
                    isSession: true,
                    enviaments: assign.enviaments // Pass enviaments
                });
            });
        } else {
             allSessions.push({
                id_assignacio: assign.id_assignacio,
                taller: assign.taller,
                centre: assign.centre,
                data_inici: assign.data_inici,
                hora_inici: null,
                isSession: false,
                enviaments: assign.enviaments
             });
        }
    });
    allSessions.sort((a, b) => new Date(a.data_inici).getTime() - new Date(b.data_inici).getTime());
    return allSessions.find(s => new Date(s.data_inici).getTime() >= now.getTime() - 72000000) || allSessions[allSessions.length - 1];
  };

  const isEvaluated = (assignment: any) => {
      if (!assignment.enviaments) return false;
      return assignment.enviaments.some((e: any) => 
          e.estat === 'Respost' && e.model?.destinatari === 'PROFESSOR'
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
  const activePhase = fases.find(f => f.activa);
  const activePhaseName = activePhase ? activePhase.nom : '';
  const isEvalPhase = activePhaseName.includes('Avaluació') || activePhaseName.includes('Tancament') || activePhaseName.includes('Fase 4');

  const handleWorkshopClick = (workshop: any) => {
    // If we are clicking 'nextWorkshop' (which might be a session object), we need to ensure it has enviaments
    // However, sessions object created in getNextSession carries enviaments now.
    
    // Check if evaluated using the assignment data (workshop)
    // If workshop is just a session, we might need to find the original assignment or ensure enviaments is passed. 
    // In getNextSession above I added enviaments to the flattened object.
    
    const evaluated = isEvaluated(workshop);

    const formattedEvent: CalendarEvent = {
        id: workshop.id_assignacio,
        title: workshop.taller.titol,
        date: workshop.data_inici,
        type: 'assignment',
        description: workshop.taller.descripcio || t('Common.no_description'),
        metadata: {
            hora: new Date(workshop.data_inici).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(new Date(workshop.data_inici).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }), 
            centre: workshop.centre.nom,
            adreca: workshop.centre.adreca,
            id_assignacio: workshop.id_assignacio,
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
        <View className="px-6 pb-6 pt-4 bg-background-surface border-b border-border-subtle mb-6">
          <View className="flex-row items-baseline">
            <Text className="text-text-muted text-xs font-bold uppercase tracking-widest mr-2">
              {new Date().toLocaleDateString(i18n.language, { weekday: 'long' })}
            </Text>
            <Text className="text-text-muted opacity-60 text-xs font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <Text className="text-3xl font-extrabold text-text-primary leading-tight mt-1">
            {t('Dashboard.welcome', { name: userName })}
          </Text>
        </View>

        <View className="px-6">
          
          {/* Phase Status */}
          <View className="w-full bg-background-subtle rounded-2xl p-4 flex-row items-center justify-between mb-8">
             <View>
                 <Text className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">{t('Dashboard.current_phase')}</Text>
                 <Text className="text-xl font-bold text-text-primary tracking-tight">
                    {fases.find(f => f.activa)?.nom || t('Dashboard.loading_data')}
                 </Text>
             </View>
             <View className="flex-row items-center bg-background-surface px-3 py-1.5 rounded-full border border-border-subtle">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-xs font-semibold text-text-secondary">{t('Dashboard.active')}</Text>
             </View>
          </View>

           {/* Workshop Evaluation - Only in Phase 4 */}
           {(isEvalPhase) && pendingAssignments.length > 0 && (
             <View className="mb-8">
               <Text className="text-text-primary text-lg font-bold mb-4">{t('Dashboard.pending_tasks')}</Text>
               {pendingAssignments.map(assign => (
                 <TouchableOpacity
                    key={assign.id_assignacio}
                    onPress={() => router.push(`/(professor)/questionnaire/${assign.id_assignacio}`)}
                    className="w-full bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-5 border border-orange-200 dark:border-orange-800 mb-3 flex-row items-center justify-between"
                 >
                    <View className="flex-1 mr-4">
                      <Text className="text-text-primary dark:text-orange-100 font-bold text-base mb-1">{assign.taller.titol}</Text>
                      <Text className="text-text-secondary dark:text-orange-200/70 text-xs font-medium">{t('Dashboard.evaluate_finished_workshop')}</Text>
                    </View>
                    <View className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-full items-center justify-center">
                       <Ionicons name="star" size={20} color="#F97316" />
                    </View>
                 </TouchableOpacity>
               ))}
             </View>
           )}

          {/* Next Session */}
          <Text className="text-text-primary text-lg font-bold mb-4">{t('Dashboard.next_session')}</Text>

          {nextWorkshop ? (
             <TouchableOpacity 
               onPress={() => handleWorkshopClick(nextWorkshop)}
               activeOpacity={0.9}
               className="w-full bg-slate-900 dark:bg-background-subtle rounded-3xl p-6 shadow-lg shadow-slate-200 relative overflow-hidden mb-8"
             >
                {/* Decorative circle */}
                <View className="absolute -right-6 -top-6 w-32 h-32 bg-slate-800 dark:bg-background-surface rounded-full opacity-50" />
                
                <View>
                    {/* Top Row: Time & Status */}
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center bg-slate-800 dark:bg-background-surface px-3 py-1.5 rounded-full border border-slate-700 dark:border-border-subtle">
                           <Ionicons name="time" size={14} color="#94A3B8" />
                           <Text className="text-gray-200 dark:text-text-primary text-xs font-bold ml-2">
                              {nextWorkshop.hora_inici 
                                ? `${nextWorkshop.hora_inici}${nextWorkshop.hora_fi ? ' - ' + nextWorkshop.hora_fi : ''}`
                                : new Date(nextWorkshop.data_inici).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })
                              }
                           </Text>
                        </View>
                        {isPhaseActive(PHASES.EJECUCION) && (
                            <View className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                                <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-wide">{t('Dashboard.in_progress')}</Text>
                            </View>
                        )}
                    </View>

                    {/* Title */}
                    <Text className="text-2xl font-black text-white dark:text-text-primary mb-2 leading-tight" numberOfLines={2}>
                        {nextWorkshop.taller.titol}
                    </Text>

                    {/* Location */}
                    <View className="flex-row items-center mb-6">
                        <Ionicons name="location" size={16} color="#94A3B8" />
                        <Text className="text-slate-400 dark:text-text-secondary text-sm font-medium ml-1.5" numberOfLines={1}>
                            {nextWorkshop.centre.nom}
                        </Text>
                    </View>

                    {/* Action Footer */}
                    <View className="flex-row justify-between items-center pt-4 border-t border-slate-800 dark:border-border-subtle">
                        <Text className="text-slate-400 dark:text-text-muted text-xs font-bold uppercase tracking-widest">
                           {isEvalPhase 
                             ? (isEvaluated(nextWorkshop) ? t('Dashboard.evaluated_workshop') : t('Dashboard.evaluate_workshop'))
                             : (isPhaseActive(PHASES.EJECUCION) ? t('Dashboard.manage_session') : t('Dashboard.view_details'))
                           }
                        </Text>
                        <View className="w-10 h-10 rounded-full bg-white/10 dark:bg-background-surface items-center justify-center">
                            {isEvaluated(nextWorkshop) ? (
                                <Ionicons name="checkmark" size={18} color="white" />
                            ) : (
                                <Ionicons name="arrow-forward" size={18} color="white" />
                            )}
                        </View>
                    </View>
                </View>
             </TouchableOpacity>
          ) : (
            <View className="w-full items-center justify-center py-10 rounded-2xl border-2 border-dashed border-border-subtle mb-8">
               <Text className="text-text-muted font-medium text-sm">{t('Dashboard.no_upcoming_workshops')}</Text>
            </View>
          )}

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

// Helper to check for active sessions today
const hasActiveSession = (assignments: any[]) => {
   const today = new Date().toLocaleDateString();
   return assignments.some(a => new Date(a.data_inici).toLocaleDateString() === today);
};