import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '@iter/shared';

interface MobileNavbarProps {
  title?: string;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ title = 'Iter' }) => {
  return (
    <SafeAreaView edges={['top']} className="bg-primary dark:bg-background-surface">
      <View className="flex-row justify-between items-center h-16 px-6 border-b border-border-subtle">
        <View className="flex-row items-center">
          {/* Logo - Linear Style */}
          <View className="w-8 h-8 bg-white dark:bg-primary flex items-center justify-center mr-4 border-2 border-text-primary shadow-sm">
            <Text className="text-primary dark:text-white font-black text-sm">I</Text>
          </View>
          <View>
            <Text className="text-xl font-black text-white dark:text-text-primary uppercase tracking-tighter">{title}</Text>
            <View className="w-12 h-1 bg-consorci-lightBlue mt-0.5" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MobileNavbar;
