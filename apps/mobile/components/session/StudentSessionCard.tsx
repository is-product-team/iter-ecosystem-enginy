import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import AttendanceSegmentedControl from './AttendanceSegmentedControl';

interface StudentSessionCardProps {
  student: any;
  status: string;
  onStatusChange: (status: string) => void;
  mode: 'ATTENDANCE' | 'WORK';
  disabled?: boolean;
}

const StudentSessionCard: React.FC<StudentSessionCardProps> = ({
  student,
  status,
  onStatusChange,
  mode,
  disabled
}) => {
  if (!student) return null;

  return (
    <View 
      className="bg-[#F9F9F9] dark:bg-zinc-900 rounded-[20px] mb-3 p-4 border border-[#E2E8F0] dark:border-zinc-800 shadow-sm"
    >
      {/* Header Info */}
      <View className="flex-row items-center mb-5">
        <View className="w-[52px] h-[52px] bg-[#EBF2FF] dark:bg-zinc-800 rounded-[14px] items-center justify-center mr-[14px] border border-[#D1E0FF] dark:border-zinc-700">
          <Text 
            className="text-[20px] font-bold text-[#00426B] dark:text-blue-400"
            style={{ fontFamily: THEME.fonts.primary }}
          >
            {student.fullName?.charAt(0)}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text 
              className="text-[18px] font-extrabold text-black dark:text-white mb-0.5"
              style={{ fontFamily: THEME.fonts.primary }}
            >
              {student.fullName} {student.lastName}
            </Text>
            {student.imageRightsValidated === false && (
                <View className="bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-md flex-row items-center gap-1 border border-red-200 dark:border-red-800">
                    <Ionicons name="camera-outline" size={10} color="#B91C1C" />
                    <Ionicons name="close" size={8} color="#B91C1C" style={{ marginLeft: -4 }} />
                    <Text className="text-[8px] font-black text-[#B91C1C] dark:text-red-400 uppercase">NO FOTOS</Text>
                </View>
            )}
          </View>
          <Text className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            ID: {student.idalu}
          </Text>
        </View>
      </View>

      <AttendanceSegmentedControl 
        currentStatus={status || 'PRESENT'} 
        onStatusChange={onStatusChange}
        disabled={disabled}
      />
    </View>
  );
};

export default StudentSessionCard;
