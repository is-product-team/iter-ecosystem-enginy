import React from 'react';
import { View, TextInput as RNTextInput, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';

interface InputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
}

export function TextInput({ icon, rightElement, className = '', ...props }: InputProps) {
  return (
    <View className={`flex-row items-center py-5 px-4 bg-background-surface ${className}`}>
      {icon && (
        <View className="w-8 items-center mr-3">
          <Ionicons name={icon} size={22} color={THEME.colors.gray} />
        </View>
      )}
      <RNTextInput
        className="flex-1 font-normal text-[18px] text-text-primary dark:text-white"
        placeholderTextColor={THEME.colors.gray}
        {...props}
      />
      {rightElement && (
        <View className="ml-2">
          {rightElement}
        </View>
      )}
    </View>
  );
}
