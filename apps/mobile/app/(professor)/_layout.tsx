import * as React from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

export default function ProfessorStackLayout() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack 
      initialRouteName="(tabs)"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
        },
        headerTintColor: isDark ? '#E0C5AC' : '#00426B',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontFamily: 'Inter',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="session/[id]" />
      <Stack.Screen name="questionnaire/[id]" />
      <Stack.Screen name="support" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="coordination" />
    </Stack>
  );
}
