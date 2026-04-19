import * as React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import api, { getStudents } from '../../../services/api';
import StudentSessionCard from '../../../components/session/StudentSessionCard';
import { StatusBar } from 'expo-status-bar';
import { Button } from '../../../components/ui/Button';

export default function SessionScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const paramNum = params.sessionNum as string;
  
  const insets = useSafeAreaInsets();

  const num = paramNum ? parseInt(paramNum) : 1;

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [enrollments, setEnrollments] = React.useState<any[]>([]);
  const [attendance, setAttendance] = React.useState<{[key: string]: string}>({}); 
  const [observations, setObservations] = React.useState('');
  const [sessionMode, setSessionMode] = React.useState<'ATTENDANCE' | 'WORK'>('ATTENDANCE');
  const [showSuccess, setShowSuccess] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    console.log("🔍 [SessionScreen] Fetching REAL data for ID:", id);
    setLoading(true);
    try {
      const studentsRes = await getStudents(id);
      console.log("🔍 [SessionScreen] API response for students:", studentsRes.data?.length);
      const studentList = studentsRes.data || [];
      
      setEnrollments(studentList);
      
      const initialAttendance: any = {};
      studentList.forEach((s: any) => {
          const key = String(s.enrollmentId || s.studentId);
          initialAttendance[key] = 'PRESENT';
      });

      try {
        console.log("🔍 [SessionScreen] Checking existing attendance for assignment:", id, "session:", num);
        const existingRes = await api.get(`assignments/${id}/sessions/${num}`);
        console.log("🔍 [SessionScreen] Raw existingRes.data:", JSON.stringify(existingRes.data));
        
        if (existingRes.data && Array.isArray(existingRes.data) && existingRes.data.length > 0) {
            console.log("🔍 [SessionScreen] Existing attendance found:", existingRes.data.length, "records");
            existingRes.data.forEach((record: any) => {
                const key = String(record.enrollmentId || record.studentId);
                initialAttendance[key] = record.status;
            });
            if(existingRes.data[0].observations) {
                setObservations(existingRes.data[0].observations);
            }
            setIsSubmitted(true);
            setSessionMode('WORK');
        } else {
            console.log("🔍 [SessionScreen] No attendance records in existingRes.data");
        }
      } catch (err: any) {
        console.error("❌ [SessionScreen] Error fetching existing attendance:", err.response?.data || err.message);
      }

      setAttendance(initialAttendance);
    } catch (error) {
      console.error("❌ [SessionScreen] Error fetching real session data:", error);
    } finally {
      setLoading(false);
    }
  }, [id, num]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const updateStatus = (key: string, status: string) => {
    console.log("👆 [SessionScreen] Updating status for student", key, "to:", status);
    if (isSubmitted && sessionMode === 'WORK') {
        console.log("🚫 [SessionScreen] Update blocked: Session already submitted and in WORK mode");
        return;
    }
    setAttendance(prev => {
        const newState = { ...prev, [key]: status };
        console.log("✅ [SessionScreen] New attendance state for", key, ":", newState[key]);
        return newState;
    });
  };

  const submitAttendance = async () => {
    console.log("🚀 [SessionScreen] Submitting attendance...");
    setSubmitting(true);
    try {
        const payload = enrollments.map(s => {
            const key = String(s.enrollmentId || s.studentId);
            return {
                enrollmentId: s.enrollmentId,
                status: attendance[key] || 'PRESENT',
                observations: observations
            };
        });

        console.log("📦 [SessionScreen] Payload:", JSON.stringify(payload));
        // Using the correct endpoint: assignments/:id/sessions/:num
        await api.post(`assignments/${id}/sessions/${num}`, payload); 
        
        console.log("✅ [SessionScreen] Attendance submitted successfully");
        setIsSubmitted(true);
        setSessionMode('WORK');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
    } catch (error: any) {
        console.error("❌ [SessionScreen] Error submitting attendance:", error.response?.data || error.message);
        Alert.alert(t('Common.error'), t('Session.submit_attendance_error'));
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <StatusBar style="auto" />
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTitle: '',
          headerBackTitle: t('Common.back'),
          headerShadowVisible: false,
          headerTransparent: true,
        }} 
      />
      
      {showSuccess && (
          <View style={{
            position: 'absolute',
            top: insets.top + 60,
            left: 20,
            right: 20,
            zIndex: 1000,
            backgroundColor: '#34C759',
            padding: 16,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5
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
            paddingBottom: 120,
            paddingHorizontal: 24
        }}
      >
         
         {/* Apple-style Header (Matched with Login) */}
         <View className="mb-10 px-2">
            <Text className="text-[40px] font-light text-black dark:text-white tracking-tight leading-[44px] mb-2">
                {sessionMode === 'ATTENDANCE' ? t('Session.attendance_header') : t('Session.work_header')}
            </Text>
            <Text className="text-[16px] font-normal text-gray-500 dark:text-gray-400 leading-relaxed max-w-[90%]">
                {sessionMode === 'ATTENDANCE' 
                    ? t('Session.attendance_instruction') 
                    : t('Session.work_instruction')}
            </Text>
         </View>

         {/* Student List */}
         <View className="mb-8">
            {enrollments.map((item, index) => {
                const key = String(item.enrollmentId || item.studentId);
                return (
                    <StudentSessionCard
                        key={key || `student-${index}`}
                        student={item}
                        status={attendance[key]}
                        onStatusChange={(status) => updateStatus(key, status)}
                        mode={sessionMode}
                        disabled={isSubmitted && sessionMode === 'WORK'}
                    />
                );
            })}
         </View>

         {/* Observations */}
         {sessionMode === 'ATTENDANCE' && (
            <View className="mb-10">
                <Text className="text-gray-400 dark:text-gray-500 font-medium text-[13px] mb-3 ml-1 uppercase tracking-widest">
                    {t('Session.observations_label')}
                </Text>
                <TextInput 
                    className="bg-[#F2F2F7] dark:bg-zinc-900 p-5 rounded-2xl text-black dark:text-white h-32 leading-relaxed"
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
         {!isSubmitted && (
            <Button
                label={(t('Session.finish_and_send') || 'Finalitzar i Enviar Llista') as string}
                onPress={submitAttendance}
                loading={submitting}
                className="rounded-2xl h-[60px] mt-4"
            />
         )}

         {/* Mode Switcher */}
         {isSubmitted && sessionMode === 'WORK' && (
            <Button
                label="Editar Assistència"
                onPress={() => {
                    setIsSubmitted(false);
                    setSessionMode('ATTENDANCE');
                }}
                variant="secondary"
                className="rounded-2xl h-[60px] mt-4"
            />
         )}
      </ScrollView>
    </View>
  );
}
