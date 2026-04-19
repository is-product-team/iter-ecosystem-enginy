import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import '../i18n'; // Initialize i18n
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { 
  useFonts, 
  Inter_400Regular, 
  Inter_500Medium,
  Inter_700Bold, 
  Inter_800ExtraBold,
  Inter_900Black 
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, vars } from 'nativewind';

// @ts-ignore
import "../global.css";

const lightVars = vars({
  "--bg-page": "#F7F8F9",
  "--bg-surface": "#FFFFFF",
  "--bg-subtle": "#F3F4F6",
  "--bg-brand": "#4197CB",
  "--text-primary": "#111827",
  "--text-secondary": "#374151",
  "--text-muted": "#6B7280",
  "--text-inverse": "#FFFFFF",
  "--text-brand": "#00426B",
  "--border-subtle": "#E5E7EB",
  "--border-focus": "#4197CB",
});

const darkVars = vars({
  "--bg-page": "#171717",
  "--bg-surface": "#212121",
  "--bg-subtle": "#2F2F2F",
  "--bg-brand": "#171717",
  "--text-primary": "#ECECEC",
  "--text-secondary": "#B4B4B4",
  "--text-muted": "#676767",
  "--text-inverse": "#FFFFFF",
  "--text-brand": "#4197CB",
  "--border-subtle": "#424242",
  "--border-focus": "#4197CB",
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    'Inter': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
    'Inter-Black': Inter_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View 
      style={colorScheme === 'dark' ? darkVars : lightVars} 
      className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}
    >
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(professor)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </View>
  );
}

export default RootLayout;
