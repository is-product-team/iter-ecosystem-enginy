import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    { label: 'PRESENT', value: 'PRESENT', icon: 'checkmark-circle', activeColor: THEME.colors.success },
    { label: 'ABSENT', value: 'ABSENT', icon: 'close-circle', activeColor: THEME.colors.error },
    { label: 'LATE', value: 'LATE', icon: 'time', activeColor: THEME.colors.warning }
  ] as const;

  return (
    <View className="flex-row bg-background-subtle p-1 rounded-2xl border border-border-subtle">
      {options.map((opt) => {
        const isActive = currentStatus === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => !disabled && onStatusChange(opt.value)}
            disabled={disabled}
            activeOpacity={0.7}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${isActive ? 'bg-background-surface shadow-sm' : ''}`}
          >
            <Ionicons 
              name={opt.icon as any} 
              size={16} 
              color={isActive ? opt.activeColor : THEME.colors.text.muted} 
            />
            <Text 
              className={`text-[10px] font-bold ml-2 tracking-widest ${isActive ? 'text-text-primary' : 'text-text-muted'}`}
              style={{ fontFamily: THEME.fonts.primary }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default AttendanceSegmentedControl;
