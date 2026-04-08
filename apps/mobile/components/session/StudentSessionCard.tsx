import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import AttendanceSegmentedControl from './AttendanceSegmentedControl';

interface StudentSessionCardProps {
  student: any;
  status: string;
  onStatusChange: (status: string) => void;
  onEvaluate: () => void;
  evaluated: boolean;
  mode: 'ATTENDANCE' | 'WORK';
  disabled?: boolean;
}

const StudentSessionCard: React.FC<StudentSessionCardProps> = ({
  student,
  status,
  onStatusChange,
  onEvaluate,
  evaluated,
  mode,
  disabled
}) => {
  return (
    <View className="bg-background-surface rounded-[32px] mb-5 p-6 shadow-sm border border-border-subtle">
      {/* Header Info */}
      <View className="flex-row items-center mb-6">
        <View className="w-14 h-14 bg-background-subtle rounded-3xl items-center justify-center mr-4 border border-border-subtle">
          <Text className="font-extrabold text-text-muted text-xl">{student.fullName?.charAt(0)}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-bold text-text-primary text-lg mb-1" style={{ fontFamily: THEME.fonts.primary }}>
            {student.fullName} {student.lastName}
          </Text>
          <Text className="text-text-muted text-xs font-semibold tracking-widest uppercase">
            ID: {student.idalu}
          </Text>
        </View>
      </View>

      {/* Conditional Footer based on Mode */}
      {mode === 'ATTENDANCE' ? (
        <View>
          <Text className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 ml-1">
            Status de Asistencia
          </Text>
          <AttendanceSegmentedControl 
            currentStatus={status} 
            onStatusChange={onStatusChange}
            disabled={disabled}
          />
        </View>
      ) : (
        <View className="flex-row items-center justify-between pt-2">
            <View className="flex-row items-center">
                <Ionicons 
                    name={status === 'ABSENT' ? 'close-circle' : status === 'LATE' ? 'time' : 'checkmark-circle'} 
                    size={16} 
                    color={status === 'ABSENT' ? THEME.colors.error : status === 'LATE' ? THEME.colors.warning : THEME.colors.success} 
                />
                <Text className="text-[11px] font-bold text-text-secondary ml-2 uppercase tracking-wide">
                    {status}
                </Text>
            </View>

            {evaluated ? (
                <View className="flex-row items-center bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-100">
                    <Ionicons name="ribbon" size={14} color={THEME.colors.success} />
                    <Text className="ml-2 font-bold text-[10px] text-emerald-700 uppercase tracking-wider">Evaluado</Text>
                </View>
            ) : (
                <TouchableOpacity
                    onPress={onEvaluate}
                    className="flex-row items-center bg-primary px-5 py-3 rounded-2xl shadow-sm"
                    activeOpacity={0.8}
                >
                    <Ionicons name="ribbon-outline" size={14} color="white" />
                    <Text className="ml-2 font-bold text-[10px] text-white uppercase tracking-wider">Evaluar</Text>
                </TouchableOpacity>
            )}
        </View>
      )}
    </View>
  );
};

export default StudentSessionCard;
