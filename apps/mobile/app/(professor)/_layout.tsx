import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { THEME } from '@iter/shared';

export default function ProfessorStackLayout() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
      },
      headerTintColor: isDark ? '#E0C5AC' : '#00426B',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontFamily: 'Inter',
      },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="session/[id]" options={{ title: t('Routes.session') }} />
      <Stack.Screen name="evaluation/[id]" options={{ title: t('Routes.evaluation') }} />
      <Stack.Screen name="questionnaire/[id]" options={{ title: t('Routes.questionnaire') }} />
    </Stack>
  );
}
