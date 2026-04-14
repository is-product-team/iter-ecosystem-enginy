import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { THEME, ROLES } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import { login } from '../services/api';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [roleError, setRoleError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', t('Auth.login.fill_all_fields'));
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email, password });
      const { token, user } = response.data;
      
      if (!user) {
        throw new Error('Invalid response: User data missing');
      }

      const userAny: any = user;

      // Role restriction: Only TEACHERS can access the mobile app
      const roleName = userAny.role?.roleName;
      if (roleName !== ROLES.TEACHER && roleName !== 'PROFESSOR') {
        setLoading(false);
        setRoleError(t('Auth.login.exclusive_use_error'));
        return;
      }

      setRoleError(null);

      // Save token and user info
      if (Platform.OS === 'web') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userAny));
      } else {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(userAny));
      }

      router.replace('/(professor)' as any);
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || t('Auth.login.error_generic');
      Alert.alert(t('Auth.login.error_title'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-background-surface"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-8 pt-24 pb-12">
          {/* Logo / Header Area */}
          <View className="mb-16">
            <View className="w-16 h-2 bg-pink-red mb-6" />
            <Text className="text-4xl font-bold text-primary dark:text-white leading-[45px] tracking-tight">
              {t('Auth.login.title')}
            </Text>
            <View className="flex-row items-center mt-4">
              <Text className="text-text-muted font-bold text-xs uppercase tracking-widest">Plataforma Iter</Text>
              <View className="h-[1px] flex-1 bg-border-subtle ml-4" />
            </View>
          </View>

          {/* Form */}
          <View className="space-y-6">
            <View>
              <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">{t('Auth.login.email')}</Text>
              <View className="flex-row items-center border border-border-subtle p-4 bg-background-subtle dark:bg-background-surface">
                <Ionicons name="mail-outline" size={20} color={THEME.colors.primary} />
                <TextInput
                  className="flex-1 ml-4 font-bold text-text-primary dark:text-white"
                  placeholder="exemple@email.cat"
                  placeholderTextColor={THEME.colors.gray}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View className="mt-6">
              <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">{t('Auth.login.password')}</Text>
              <View className="flex-row items-center border border-border-subtle p-4 bg-background-subtle dark:bg-background-surface">
                <Ionicons name="lock-closed-outline" size={20} color={THEME.colors.primary} />
                <TextInput
                  className="flex-1 ml-4 font-bold text-text-primary dark:text-white"
                  placeholder="••••••••"
                  placeholderTextColor={THEME.colors.gray}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={THEME.colors.gray} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {roleError && (
            <View className="my-6 p-5 bg-pink-red/10 border-l-4 border-pink-red">
              <View className="flex-row items-center mb-2">
                <Ionicons name="warning-outline" size={18} color="#F26178" />
                <Text className="ml-2 font-black text-[10px] text-pink-red uppercase tracking-widest">{t('Auth.login.access_restricted')}</Text>
              </View>
              <Text className="text-xs font-bold text-text-secondary leading-relaxed mb-4">
                {roleError}
              </Text>
              <TouchableOpacity 
                onPress={() => Linking.openURL('https://iter.consorci.cat')}
                className="flex-row items-center border-b border-pink-red self-start pb-0.5"
              >
                <Text className="text-pink-red font-black text-[10px] uppercase tracking-widest">{t('Auth.login.go_to_web')}</Text>
                <Ionicons name="arrow-forward" size={12} color="#F26178" className="ml-2" />
              </TouchableOpacity>
            </View>
          )}

          <View className="mt-12">
            <TouchableOpacity 
              className={`bg-primary py-4 items-center justify-center ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-sm uppercase tracking-wider">{t('Auth.login.submit')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="mt-8 items-center">
              <Text className="text-text-muted font-bold text-xs uppercase tracking-widest">{t('Auth.login.forgot_password')}</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Branding */}
          <View className="mt-auto items-center">
            <Text className="text-[9px] font-black text-text-muted opacity-40 uppercase tracking-[4px]">
              {t('Common.branding')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
