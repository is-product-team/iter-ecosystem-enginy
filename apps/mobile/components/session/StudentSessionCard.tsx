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
  return (
    <View 
      style={{
        backgroundColor: THEME.colors.background,
        borderRadius: 20,
        marginBottom: 16,
        padding: 16, // Reducido de 24 a 16 para ganar ancho
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
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '800', 
            color: '#000000', 
            marginBottom: 2,
            fontFamily: THEME.fonts.primary,
          }}>
            {student.fullName} {student.lastName}
          </Text>
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

      {/* Conditional Footer based on Mode */}
      {mode === 'ATTENDANCE' ? (
        <View>
          <Text style={{ 
            fontSize: 12, 
            fontWeight: '900', 
            color: '#000000', 
            textTransform: 'uppercase', 
            letterSpacing: 1, 
            marginBottom: 16, 
          }}>
            Estat d&apos;Assistència
          </Text>
          <AttendanceSegmentedControl 
            currentStatus={status} 
            onStatusChange={onStatusChange}
            disabled={disabled}
          />
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                    name={status === 'ABSENT' ? 'close-circle' : status === 'LATE' ? 'time' : 'checkmark-circle'} 
                    size={16} 
                    color={status === 'ABSENT' ? THEME.colors.error : status === 'LATE' ? THEME.colors.warning : THEME.colors.success} 
                />
                <Text style={{ 
                  fontSize: 11, 
                  fontWeight: '800', 
                  color: THEME.colors.text.secondary, 
                  marginLeft: 8, 
                  textTransform: 'uppercase', 
                  letterSpacing: 0.5 
                }}>
                    {status}
                </Text>
            </View>

            {evaluated ? (
                <View className="flex-row items-center bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-100">
                    <Ionicons name="ribbon" size={14} color={THEME.colors.success} />
                    <Text className="ml-2 font-bold text-[10px] text-emerald-700 uppercase tracking-wider">Evaluado</Text>
                </View>
            ) : (
                <Pressable
                    onPress={onEvaluate}
                    style={({ pressed }) => [
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: THEME.colors.primary,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
                        opacity: pressed ? 0.8 : 1,
                      }
                    ]}
                >
                    <Ionicons name="ribbon-outline" size={14} color="white" />
                    <Text className="ml-2 font-bold text-[10px] text-white uppercase tracking-wider">Avaluar</Text>
                </Pressable>
            )}
        </View>
      )}
    </View>
  );
};

export default StudentSessionCard;
