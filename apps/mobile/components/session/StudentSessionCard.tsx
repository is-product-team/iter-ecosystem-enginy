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
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      {/* Header Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <View style={{ 
          width: 52, 
          height: 52, 
          backgroundColor: '#EBF2FF', 
          borderRadius: 14, 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginRight: 14,
          borderWidth: 1,
          borderColor: '#D1E0FF'
        }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: '#00426B',
            fontFamily: THEME.fonts.primary 
          }}>
            {student.fullName?.charAt(0)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '800', 
              color: '#000000', 
              marginBottom: 2,
              fontFamily: THEME.fonts.primary,
            }}>
              {student.fullName} {student.lastName}
            </Text>
            {student.imageRightsValidated === false && (
                <View style={{ 
                    backgroundColor: '#FEE2E2', 
                    paddingHorizontal: 6, 
                    paddingVertical: 2, 
                    borderRadius: 6, 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    gap: 3,
                    borderWidth: 0.5,
                    borderColor: '#FECACA'
                }}>
                    <Ionicons name="camera-outline" size={10} color="#B91C1C" />
                    <Ionicons name="close" size={8} color="#B91C1C" style={{ marginLeft: -4 }} />
                    <Text style={{ fontSize: 8, fontWeight: '900', color: '#B91C1C', textTransform: 'uppercase' }}>NO FOTOS</Text>
                </View>
            )}
          </View>
          <Text style={{ 
            fontSize: 12, 
            fontWeight: 'bold', 
            color: '#94A3B8', 
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
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

      <AttendanceSegmentedControl 
        currentStatus={status || 'PRESENT'} 
        onStatusChange={onStatusChange}
        disabled={disabled}
      />
    </View>
  );
};

export default StudentSessionCard;
