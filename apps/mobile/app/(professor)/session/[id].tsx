import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import api, { getStudents, getAttendance } from '../../../services/api';
import StudentSessionCard from '../../../components/session/StudentSessionCard';

export default function SessionScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{[key: string]: string}>({}); 
  const [observations, setObservations] = useState('');
  const [sessionMode, setSessionMode] = useState<'ATTENDANCE' | 'WORK'>('ATTENDANCE');
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get List of Enrollments (Standardized)
      const studentsRes = await getStudents(id as string);
      const enrollmentList = studentsRes.data;
      setEnrollments(enrollmentList);
      
      // 2. Initial state: Mark all as PRESENT by default
      const initialAttendance: any = {};
      enrollmentList.forEach((e: any) => {
          initialAttendance[e.studentId] = 'PRESENT';
      });

      // 3. Check if attendance already exists (to pre-fill)
      try {
        const existingRes = await getAttendance(id as string);
        if (existingRes.data && existingRes.data.length > 0) {
            existingRes.data.forEach((record: any) => {
                initialAttendance[record.studentId] = record.status;
            });
            if(existingRes.data[0].observations) {
                setObservations(existingRes.data[0].observations);
            }
            setIsSubmitted(true);
        }
      } catch (err) {
        // No existing attendance
      }

      setAttendance(initialAttendance);
      if (isSubmitted || Object.keys(initialAttendance).some(k => initialAttendance[k] !== 'PRESENT')) {
          // If we have data, we might want to start in WORK mode, but for now let's respect isSubmitted
          if (isSubmitted) setSessionMode('WORK');
      }

    } catch (error) {
      console.error("Error fetching session data:", error);
      Alert.alert(t('Common.error'), t('Session.error_loading_students'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [id])
  );

  const updateStatus = (studentId: string, status: string) => {
    if (isSubmitted && sessionMode === 'WORK') return;
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    setSubmitting(true);
    try {
        const payload = Object.keys(attendance).map(studentId => ({
            assignmentId: parseInt(id as string),
            studentId: parseInt(studentId),
            status: attendance[studentId],
            observations: observations
        }));

        await api.post('attendance/batch', { attendance: payload, assignmentId: id }); 
        
        setIsSubmitted(true);
        setSessionMode('WORK');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
        
    } catch (error) {
        console.error("Error submitting attendance:", error);
        Alert.alert(t('Common.error'), t('Session.submit_attendance_error'));
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-page">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background-page">
      <Stack.Screen 
        options={{ 
          title: sessionMode === 'ATTENDANCE' ? t('Session.title_attendance') : t('Session.title_work'),
          headerBackTitle: t('Common.back'),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: THEME.colors.background },
        }} 
      />
      
      {showSuccess && (
          <View className="absolute top-4 left-6 right-6 z-50 bg-emerald-500 p-4 rounded-2xl flex-row items-center shadow-lg">
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text className="text-white font-bold ml-3">{t('Session.attendance_sent_success')}</Text>
          </View>
      )}

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}>
         
         <View className="mb-8">
            <Text className="text-text-primary text-2xl font-extrabold mb-2" style={{ fontFamily: THEME.fonts.primary }}>
                {sessionMode === 'ATTENDANCE' ? t('Session.attendance_header') : t('Session.work_header')}
            </Text>
            <Text className="text-text-muted text-sm font-medium leading-5">
                {sessionMode === 'ATTENDANCE' 
                    ? t('Session.attendance_instruction') 
                    : t('Session.work_instruction')}
            </Text>
         </View>

         {enrollments.map((item) => (
             <StudentSessionCard
                key={item.enrollmentId}
                student={item.student}
                status={attendance[item.studentId]}
                onStatusChange={(status) => updateStatus(String(item.studentId), status)}
                onEvaluate={() => router.push(`/(professor)/evaluation/${item.enrollmentId}?assignmentId=${id}`)}
                evaluated={item.evaluated}
                mode={sessionMode}
                disabled={isSubmitted && sessionMode === 'WORK'}
             />
         ))}

         {sessionMode === 'ATTENDANCE' && (
            <View className="mt-4">
                <Text className="text-text-primary font-bold mb-3 ml-1">{t('Session.observations_label')}</Text>
                <TextInput 
                    className="bg-background-surface p-5 rounded-[32px] text-text-primary h-32 leading-6 border border-border-subtle shadow-sm"
                    multiline
                    textAlignVertical="top"
                    placeholder={t('Session.observations_placeholder')}
                    placeholderTextColor={THEME.colors.text.muted}
                    value={observations}
                    onChangeText={setObservations}
                />
            </View>
         )}
      </ScrollView>

      {sessionMode === 'ATTENDANCE' && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-background-page/80">
            <TouchableOpacity 
                onPress={submitAttendance}
                disabled={submitting || isSubmitted}
                activeOpacity={0.8}
                className={`w-full h-16 rounded-3xl items-center justify-center shadow-xl ${submitting || isSubmitted ? 'bg-background-subtle' : 'bg-primary shadow-slate-300'}`}
            >
                {submitting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-base font-bold tracking-widest uppercase">
                        {t('Session.finish_and_send')}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
      )}

      {sessionMode === 'WORK' && !isSubmitted && (
          <View className="absolute bottom-6 right-6">
              <TouchableOpacity 
                onPress={() => setSessionMode('ATTENDANCE')}
                className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-lg border border-border-subtle"
              >
                  <Ionicons name="list" size={24} color={THEME.colors.primary} />
              </TouchableOpacity>
          </View>
      )}
    </View>
  );
}
