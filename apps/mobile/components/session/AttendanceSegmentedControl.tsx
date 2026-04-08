import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';

interface AttendanceSegmentedControlProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
}

const AttendanceSegmentedControl: React.FC<AttendanceSegmentedControlProps> = ({
  currentStatus,
  onStatusChange,
  disabled
}) => {
  const options = [
    { 
      label: 'PRESENT', 
      value: 'PRESENT', 
      icon: 'checkmark', 
      iconBg: '#48A461', 
      iconColor: '#FFFFFF' 
    },
    { 
      label: 'ABSENT', 
      value: 'ABSENT', 
      icon: 'close', 
      iconBg: '#F8A4A4', 
      iconColor: '#991B1B' 
    },
    { 
      label: 'LATE', 
      value: 'LATE', 
      icon: 'L', 
      iconBg: '#CB9C2A', 
      iconColor: '#FFFFFF' 
    }
  ];

  return (
    <View style={{ 
      flexDirection: 'row', 
      gap: 10, // Apretamos un poco el gap para ganar ancho de botón
      width: '100%',
    }}>
      {options.map((opt) => {
        const isActive = currentStatus === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => !disabled && onStatusChange(opt.value)}
            disabled={disabled}
            style={({ pressed }) => [
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 20,
                borderRadius: 20,
                backgroundColor: '#F3F4F6',
                borderWidth: isActive ? 1.5 : 0,
                borderColor: THEME.colors.primary,
                opacity: pressed ? 0.8 : 1,
              }
            ]}
          >
            <View style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 18, 
              backgroundColor: opt.iconBg, 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: 12
            }}>
              {opt.icon === 'L' ? (
                <Text style={{ color: opt.iconColor, fontWeight: '900', fontSize: 18 }}>L</Text>
              ) : (
                <Ionicons 
                    name={opt.icon as any} 
                    size={20} 
                    color={opt.iconColor} 
                />
              )}
            </View>
            <Text 
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                letterSpacing: 0.5,
                color: '#000000',
                fontFamily: THEME.fonts.primary
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default AttendanceSegmentedControl;
