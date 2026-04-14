import React from 'react';
import { View, Text } from 'react-native';

interface FormGroupProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function FormGroup({ children, title, className = '' }: FormGroupProps) {
  return (
    <View className={`w-full ${className}`}>
      {title && (
        <Text className="text-text-muted text-[13px] font-medium uppercase tracking-wider mb-2 ml-4">
          {title}
        </Text>
      )}
      <View className="bg-background-surface rounded-2xl border border-border-subtle overflow-hidden">
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child;
          
          const isLast = index === React.Children.count(children) - 1;
          
          return (
            <View>
              {child}
              {!isLast && <View className="h-[0.5px] bg-border-subtle ml-12" />}
            </View>
          );
        })}
      </View>
    </View>
  );
}
