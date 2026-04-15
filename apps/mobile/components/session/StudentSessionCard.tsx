import React from 'react';
import { View, Text, Pressable } from 'react-native';
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
  if (!student) return null;

  return (
    <View 
      style={{
        backgroundColor: '#F9F9F9',
        borderRadius: 20,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EFEFEF',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ 
                width: 40, 
                height: 40, 
                backgroundColor: '#E5E5EA', 
                borderRadius: 20, 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: 12,
            }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1C1C1E' }}>
                    {student.fullName?.charAt(0)}
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1C1C1E', letterSpacing: -0.3 }}>
                    {student.fullName} {student.lastName}
                </Text>
                <Text style={{ fontSize: 12, color: '#8E8E93', marginTop: 1 }}>
                    ID: {student.idalu}
                </Text>
            </View>
        </View>

        {evaluated ? (
            <View style={{ backgroundColor: '#E5F9EF', padding: 6, borderRadius: 12 }}>
                <Ionicons name="checkmark-circle" size={18} color="#34C759" />
            </View>
        ) : (
            <Pressable onPress={onEvaluate} style={{ padding: 6 }}>
                <Ionicons name="ribbon-outline" size={20} color="#007AFF" />
            </Pressable>
        )}
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
