import React from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
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
    { label: 'Present', value: 'PRESENT' },
    { label: 'Absent', value: 'ABSENT' },
    { label: 'Retard', value: 'LATE' }
  ];

  return (
    <View style={{ 
      flexDirection: 'row', 
      backgroundColor: '#F2F2F7', 
      borderRadius: 12, 
      padding: 2,
      width: '100%',
      height: 40,
    }}>
      {options.map((opt) => {
        const isActive = currentStatus === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => !disabled && onStatusChange(opt.value)}
            disabled={disabled}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              backgroundColor: isActive ? 'white' : 'transparent',
              // Apple-style subtle shadow for the active item
              shadowColor: isActive ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: isActive ? 2 : 0,
            }}
          >
            <Text 
              style={{
                fontSize: 13,
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#000000' : '#8E8E93',
                fontFamily: THEME.fonts.primary,
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
