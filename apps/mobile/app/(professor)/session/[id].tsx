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
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
      } catch (_err) {}

      setAttendance(initialAttendance);
    } catch (error) {
      console.error("Error fetching session data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

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

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
            paddingTop: insets.top + 60, 
            paddingBottom: 40,
            paddingHorizontal: 32 
        }}
      >
         
         {/* Apple-style Header (Matched with Login) */}
         <View className="mb-10">
            <Text className="text-[44px] font-light text-black tracking-tight leading-[48px]">
                {sessionMode === 'ATTENDANCE' ? t('Session.attendance_header') : t('Session.work_header')}
            </Text>
            <Text className="text-[16px] font-normal text-gray-500 mt-2 leading-relaxed">
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
