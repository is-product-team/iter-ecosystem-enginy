import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator, Platform } from 'react-native';
import { ROLES } from '@iter/shared';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        let token = null;
        let userData = null;

        if (Platform.OS === 'web') {
          token = localStorage.getItem('token');
          userData = localStorage.getItem('user');
        } else {
          try {
            token = await SecureStore.getItemAsync('token');
            userData = await SecureStore.getItemAsync('user');
          } catch (ssError) {
            console.warn("⚠️ [Auth] Error reading SecureStore:", ssError);
            token = null;
            userData = null;
          }
        }

        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            console.log("🔍 [DEBUG AUTH] User checking role:", JSON.stringify(user, null, 2));

            // Support both object structure and flattened role string
            const roleName = user.role?.roleName || user.roleName || user.role;
            
            console.log("🔍 [DEBUG AUTH] Detected roleName:", roleName);

            if (roleName === ROLES.TEACHER || roleName === 'PROFESSOR' || roleName === 'TEACHER') {
              setHasToken(true);
            } else {
              console.warn("⚠️ [Auth] Role not permitted on mobile:", roleName);
              setHasToken(false);
            }
          } catch (e) {
            console.error("⚠️ [Auth] Error parsing user data:", e);
            setHasToken(false);
          }
        } else {
          console.log("🔍 [DEBUG AUTH] No token or userData found");
          setHasToken(false);
        }
      } catch (error) {
        console.error("⚠️ [Auth] Critical error in checkAuth:", error);
        setHasToken(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-page">
        <ActivityIndicator size="large" color="#00426B" />
      </View>
    );
  }

  return hasToken ? <Redirect href={"/(professor)" as any} /> : <Redirect href="/login" />;
}
