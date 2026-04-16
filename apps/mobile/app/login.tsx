import * as React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { THEME, ROLES } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import { login } from '../services/api';
import { Button } from '../components/ui/Button';
import { FormGroup } from '../components/ui/FormGroup';
import { TextInput } from '../components/ui/TextInput';
import { StatusBar } from 'expo-status-bar';

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
      if (!user) throw new Error('Invalid response: User data missing');

      const userAny: any = user;
      const roleName = userAny.role?.roleName;

      if (roleName !== ROLES.TEACHER && roleName !== 'PROFESSOR') {
        setLoading(false);
        setRoleError(t('Auth.login.exclusive_use_error'));
        return;
      }

      setRoleError(null);
      if (Platform.OS === 'web') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userAny));
      } else {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(userAny));
      }
      router.replace('/(professor)' as any);
    } catch (error: any) {
      let message = error.response?.data?.error || t('Auth.login.error_generic');
      
      // Technical diagnostic for development
      if (__DEV__ && (error.message.includes('Network Error') || error.code === 'ECONNABORTED')) {
        const targetUrl = error.config?.baseURL || 'unknown';
        message = `${t('Auth.login.error_generic')}\n\n[Diagnostic]\nTarget: ${targetUrl}\nError: ${error.message}`;
      }
      
      Alert.alert(t('Auth.login.error_title'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View className="flex-1 px-8 pt-20 pb-12">

            {/* Minimalist Apple-style Header */}
            <View className="mb-14">
              <Image
                source={require('../assets/images/icon-simple.png')}
                className="w-16 h-16 rounded-[16px] mb-6"
                resizeMode="cover"
              />
              <Text className="text-[44px] font-light text-black dark:text-white tracking-tight leading-[48px]">
                {t('Auth.login.welcome_title')}
              </Text>
              <Text className="text-[16px] font-normal text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                {t('Auth.login.welcome_subtitle')}
              </Text>
            </View>

            {/* Inset Grouped Form (Apple Native Look) */}
            <View className="mb-8">
              <FormGroup>
                <TextInput
                  icon="mail-outline"
                  placeholder="exemple@email.cat"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  className="bg-transparent"
                />
                <TextInput
                  icon="lock-closed-outline"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  className="bg-transparent"
                  rightElement={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={THEME.colors.gray} />
                    </TouchableOpacity>
                  }
                />
              </FormGroup>
            </View>

            {roleError && (
              <View className="mb-8 bg-pink-red/10 p-5 rounded-2xl">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="warning" size={16} color="#F26178" />
                  <Text className="ml-2 font-bold text-xs text-pink-red uppercase tracking-wider">{t('Auth.login.access_restricted')}</Text>
                </View>
                <Text className="text-[13px] font-medium text-black/70 dark:text-white/70 leading-relaxed mb-3 mt-2">
                  {roleError}
                </Text>
                <TouchableOpacity onPress={() => Linking.openURL('https://iter.consorci.cat')}>
                  <Text className="text-pink-red font-semibold text-[13px]">{t('Auth.login.go_to_web')} →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Apple-style sticky full width button */}
            <View className="mt-6 mb-2">
              <Button
                label={t('Auth.login.submit') as string || "Entrar"}
                onPress={handleLogin}
                loading={loading}
                className="rounded-2xl"
              />
            </View>

            {/* Minimalist secondary actions */}
            <View className="items-center justify-center mt-6">
              <Text className="text-gray-400 dark:text-gray-500 font-medium text-[13px] mb-1">
                {t('Auth.login.login_problems')}
              </Text>
              <TouchableOpacity>
                <Text className="text-primary font-bold text-[14px] dark:text-pink-red">
                  {t('Auth.login.forgot_password')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Privacy footer */}
            <View className="mt-auto items-center pb-2 pt-12">
              <Text className="text-center text-[12px] text-gray-400 dark:text-gray-500 leading-tight">
                {t('Auth.login.privacy_footer')}
              </Text>
            </View>


          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
