import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import api, { getStudents, getAttendance } from '../../../services/api';

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

  const toggleStatus = (studentId: string) => {
    if (isSubmitted) return;
    setAttendance(prev => {
        const current = prev[studentId];
        let next = 'PRESENT';
        if (current === 'PRESENT') next = 'ABSENT';
        else if (current === 'ABSENT') next = 'LATE';
        else if (current === 'LATE') next = 'PRESENT';
        return { ...prev, [studentId]: next };
    });
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
        
        Alert.alert(t('Common.success'), t('Session.attendance_sent_success'), [
            { text: t('Common.ok'), onPress: () => router.back() }
        ]);
        
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
          title: t('Session.title'),
          headerBackTitle: t('Common.back'),
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
         
         <Text className="text-text-secondary text-sm mb-6 font-medium">
            {t('Session.attendance_instruction')}
         </Text>

         {enrollments.map((item) => {
             const student = item.student;
             const status = attendance[item.studentId];
             let statusColor = "bg-background-surface text-emerald-700 border-emerald-100";
             let statusIcon = "checkmark-circle";
             
             if (status === 'ABSENT') {
                 statusColor = "bg-background-surface text-rose-700 border-rose-100";
                 statusIcon = "close-circle";
             } else if (status === 'LATE') {
                 statusColor = "bg-background-surface text-amber-700 border-amber-100";
                 statusIcon = "time";
             }

             return (
                 <View key={item.enrollmentId} className="bg-background-subtle rounded-3xl mb-3 overflow-hidden border border-border-subtle">
                     {/* Attendance Row */}
                     <TouchableOpacity 
                        onPress={() => toggleStatus(String(item.studentId))}
                        activeOpacity={0.7}
                        className="p-5 flex-row items-center justify-between"
                     >
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 bg-background-surface rounded-full items-center justify-center mr-4">
                                <Text className="font-bold text-text-muted text-lg">{student.fullName?.charAt(0)}</Text>
                            </View>
                            <View className="flex-1 mr-2">
                                <Text className="font-bold text-text-primary text-base mb-0.5" numberOfLines={1} ellipsizeMode="tail">
                                    {student.fullName} {student.lastName}
                                </Text>
                                <Text className="text-text-muted text-xs font-medium tracking-wide">ID: {student.idalu}</Text>
                            </View>
                        </View>

                        <View className={`px-3 py-1.5 rounded-full border flex-row items-center ${statusColor.split(' ')[0]} ${statusColor.split(' ')[2]}`}>
                            <Ionicons name={statusIcon as any} size={14} color={status === 'ABSENT' ? '#BE123C' : status === 'LATE' ? '#B45309' : '#047857'} />
                            <Text className={`font-bold text-[10px] ml-1.5 uppercase tracking-wider ${statusColor.split(' ')[1]}`}>
                                {t(`Session.status_${status.toLowerCase()}`)}
                            </Text>
                        </View>
                     </TouchableOpacity>

                     {/* Evaluation Action */}
                     <View className="h-[1px] w-full bg-border-subtle" />
                     {item.evaluated ? (
                         <View className="flex-row items-center justify-center py-4 bg-background-subtle opacity-60">
                             <Ionicons name="checkmark-done-circle" size={16} color={THEME.colors.success} />
                             <Text className="ml-2 font-bold text-xs text-text-muted uppercase tracking-wider">
                                 {t('Session.evaluated')}
                             </Text>
                         </View>
                     ) : (
                        <TouchableOpacity
                            onPress={() => router.push(`/(professor)/evaluation/${item.enrollmentId}?assignmentId=${id}`)}
                            className="flex-row items-center justify-center py-4 bg-background-surface active:bg-background-subtle"
                        >
                            <Ionicons name="ribbon-outline" size={16} color={THEME.colors.primary} />
                            <Text className="ml-2 font-bold text-xs text-primary uppercase tracking-wider">
                                {t('Session.evaluate_competencies')}
                            </Text>
                        </TouchableOpacity>
                     )}
                 </View>
             );
         })}

         <View className="mt-6 mb-24">
            <Text className="text-text-primary font-bold mb-3 ml-1">{t('Session.observations_label')}</Text>
            <TextInput 
                className="bg-background-subtle p-5 rounded-3xl text-text-primary h-32 leading-6 border border-border-subtle"
                multiline
                textAlignVertical="top"
                placeholder={t('Session.observations_placeholder')}
                placeholderTextColor={THEME.colors.gray}
                value={observations}
                onChangeText={setObservations}
            />
         </View>

      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-6 bg-background-surface border-t border-border-subtle">
         <TouchableOpacity 
            onPress={submitAttendance}
             disabled={submitting || isSubmitted}
             className={`w-full h-14 rounded-2xl items-center justify-center shadow-lg ${submitting || isSubmitted ? 'bg-background-subtle' : 'bg-primary shadow-slate-200'}`}
          >
              {submitting ? (
                  <ActivityIndicator color="white" />
              ) : isSubmitted ? (
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color={THEME.colors.success} style={{ marginRight: 8 }} />
                    <Text className="text-text-muted text-lg font-bold tracking-wide uppercase">{t('Session.attendance_registered')}</Text>
                  </View>
              ) : (
                  <Text className="text-white text-lg font-bold tracking-wide uppercase">{t('Session.finish_and_send')}</Text>
              )}
         </TouchableOpacity>
      </View>

    </View>
  );
}
