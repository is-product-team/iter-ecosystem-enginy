import * as React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import api, { getStudents, getAttendance } from '../../../services/api';
import StudentSessionCard from '../../../components/session/StudentSessionCard';
import { StatusBar } from 'expo-status-bar';
import { Button } from '../../../components/ui/Button';

export default function SessionScreen() {
  const { t } = useTranslation();
  const { id, sessionNum: paramNum, sessionId: paramId } = useLocalSearchParams<{ id: string, sessionNum?: string, sessionId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const num = paramNum ? parseInt(paramNum) : 1;
  const sessionId = paramId ? parseInt(paramId) : null;

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [enrollments, setEnrollments] = React.useState<any[]>([]);
  const [attendance, setAttendance] = React.useState<{[key: string]: string}>({}); 
  const [observations, setObservations] = React.useState('');
  const [sessionMode, setSessionMode] = React.useState<'ATTENDANCE' | 'WORK'>('ATTENDANCE');
  const [showSuccess, setShowSuccess] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const studentsRes = await getStudents(id as string);
      const enrollmentList = studentsRes.data;
      setEnrollments(enrollmentList);
      
      const initialAttendance: any = {};
      enrollmentList.forEach((e: any) => {
          initialAttendance[e.studentId] = 'PRESENT';
      });

      try {
        const existingRes = await api.get(`assignments/${id}/sessions/${num}`);
        if (existingRes.data && existingRes.data.length > 0) {
            existingRes.data.forEach((record: any) => {
                initialAttendance[record.studentId] = record.status;
            });
            if(existingRes.data[0].observations) {
                setObservations(existingRes.data[0].observations);
            }
            setIsSubmitted(true);
        }
      } catch (_err) {
        // No existing attendance for this specific session
      }

      setAttendance(initialAttendance);
      if (isSubmitted) {
          setSessionMode('WORK');
      }

    } catch (error) {
      console.error("Error fetching session data:", error);
    } finally {
      setLoading(false);
    }
  }, [id, num, isSubmitted, t]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const updateStatus = (studentId: string, status: string) => {
    if (isSubmitted && sessionMode === 'WORK') return;
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    setSubmitting(true);
    try {
        const payload = enrollments.map(e => ({
            enrollmentId: e.enrollmentId,
            status: attendance[e.studentId] || 'PRESENT',
            observations: observations
        }));

        await api.post(`assignments/${id}/sessions/${num}`, payload); 
        
        setIsSubmitted(true);
        setSessionMode('WORK');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
    } catch (error) {
        Alert.alert(t('Common.error'), t('Session.submit_attendance_error'));
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: '',
          headerBackTitle: t('Common.back'),
          headerShadowVisible: false,
          headerTransparent: true,
          headerTintColor: '#007AFF',
        }} 
      />
      
      {showSuccess && (
          <View style={{
            position: 'absolute',
            top: insets.top + 10,
            left: 20,
            right: 20,
            zIndex: 100,
            backgroundColor: '#34C759',
            padding: 16,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
              <Ionicons name="checkmark-circle" size={22} color="white" />
              <Text style={{ color: 'white', fontWeight: '600', marginLeft: 10, fontSize: 14 }}>
                {t('Session.attendance_sent_success')}
              </Text>
          </View>
      )}

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}>
         
         <View style={{ marginBottom: 40, marginTop: 12, paddingHorizontal: 8 }}>
            <View className="flex-row justify-between items-center mb-1">
               <View className="flex-row items-center gap-2">
                 <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.colors.success }} />
                 <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">En línia</Text>
               </View>
               {isSubmitted && (
                 <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex-row items-center gap-1">
                   <Ionicons name="cloud-done" size={12} color={THEME.colors.success} />
                   <Text className="text-[10px] font-bold text-emerald-700 uppercase">Sincronitzat</Text>
                 </View>
               )}
            </View>
            <View className="flex-row justify-between items-end">
              <View className="flex-1">
                <Text style={{ 
                  color: THEME.colors.text.primary, 
                  fontSize: 34, 
                  fontWeight: '900', 
                  marginBottom: 12,
                  fontFamily: THEME.fonts.primary,
                  letterSpacing: -1
                }}>
                    {sessionMode === 'ATTENDANCE' ? t('Session.attendance_header') : t('Session.work_header')}
                </Text>
              </View>
              {sessionMode === 'ATTENDANCE' && !isSubmitted && (
                <Pressable 
                  onPress={() => {
                    const allPresent: any = {};
                    enrollments.forEach(e => allPresent[e.studentId] = 'PRESENT');
                    setAttendance(allPresent);
                  }}
                  className="bg-indigo-50 px-5 py-2.5 rounded-2xl mb-3 border border-indigo-100 active:bg-indigo-100"
                >
                  <Text className="text-indigo-700 font-black text-[10px] uppercase tracking-widest">{t('Session.mark_all_present') || 'Tots presents'}</Text>
                </Pressable>
              )}
            </View>
            <Text style={{ 
              color: THEME.colors.text.muted, 
              fontSize: 15, 
              fontWeight: '400', 
              lineHeight: 24,
              fontFamily: THEME.fonts.primary,
              maxWidth: '90%'
            }}>
                {sessionMode === 'ATTENDANCE' 
                    ? t('Session.attendance_instruction') 
                    : t('Session.work_instruction')}
            </Text>
         </View>

         {/* Student List */}
         <View className="mb-8">
            {enrollments.map((item, index) => (
                <StudentSessionCard
                    key={item.enrollmentId || `student-${index}`}
                    student={item.student}
                    status={attendance[item.studentId]}
                    onStatusChange={(status) => updateStatus(String(item.studentId), status)}
                    onEvaluate={() => router.push(`/(professor)/evaluation/${item.enrollmentId}?assignmentId=${id}`)}
                    evaluated={item.evaluated}
                    mode={sessionMode}
                    disabled={isSubmitted && sessionMode === 'WORK'}
                />
            ))}
         </View>

         {/* Observations */}
         {sessionMode === 'ATTENDANCE' && (
            <View className="mb-10">
                <Text className="text-gray-400 font-medium text-[13px] mb-3 ml-1 uppercase tracking-widest">
                    {t('Session.observations_label')}
                </Text>
                <TextInput 
                    className="bg-[#F2F2F7] p-5 rounded-2xl text-black h-32 leading-relaxed"
                    multiline
                    textAlignVertical="top"
                    placeholder={t('Session.observations_placeholder')}
                    placeholderTextColor="#AEAEB2"
                    value={observations}
                    onChangeText={setObservations}
                />
            </View>
         )}

         {/* Submit Button (Apple style like Login) */}
         {sessionMode === 'ATTENDANCE' && (
            <Button
                label={t('Session.finish_and_send') as string}
                onPress={submitAttendance}
                loading={submitting}
                disabled={isSubmitted}
                className="rounded-2xl h-[60px]"
            />
         )}

         {/* Mode Switcher */}
         {sessionMode === 'WORK' && !isSubmitted && (
            <Button
                label="Editar Assistència"
                onPress={() => setSessionMode('ATTENDANCE')}
                variant="secondary"
                className="rounded-2xl h-[60px]"
            />
         )}
      </ScrollView>
    </View>
  );
}
