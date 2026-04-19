import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Platform, Alert, Modal, Pressable, Image, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, ROLES } from '@iter/shared';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import api from '@/services/api';
import * as ExpoConstants from 'expo-constants';
import { PageHeader } from '../../../components/ui/PageHeader';

const Constants = ExpoConstants.default || ExpoConstants;
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://iter.kore29.com';

// WhatsApp-style Setting Row
const SettingItem = ({ 
  icon, 
  iconColor, 
  title, 
  subtitle, 
  onPress, 
  rightElement,
  isLast = false 
}: { 
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isLast?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress && !rightElement}
    activeOpacity={0.7}
    className="flex-row items-center py-4 px-6 bg-background-surface"
  >
    <View className="w-8 items-center mr-4">
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <View className="flex-1 justify-center">
      <Text className="text-text-primary text-[17px] font-medium" style={{ fontFamily: THEME.fonts.primary }}>
        {title}
      </Text>
      {subtitle && (
        <Text className="text-text-muted text-[13px] mt-0.5" style={{ fontFamily: THEME.fonts.primary }}>
          {subtitle}
        </Text>
      )}
    </View>
    {rightElement || (onPress && <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />)}
    {!isLast && (
      <View className="absolute bottom-0 left-16 right-0 h-[0.5px] bg-border-subtle" />
    )}
  </TouchableOpacity>
);

// WhatsApp-style Section Header
const SectionHeader = ({ title }: { title: string }) => (
  <View className="px-6 pt-6 pb-2">
    <Text className="text-text-muted text-[12px] font-bold uppercase tracking-wider">
      {title}
    </Text>
  </View>
);

// Generic Selection Modal (Simulating Dropdown)
const SelectionModal = ({ 
  visible, 
  onClose, 
  title, 
  options, 
  selectedValue, 
  onSelect,
  t
}: { 
  visible: boolean; 
  onClose: () => void; 
  title: string; 
  options: { label: string; value: string; icon?: keyof typeof Ionicons.glyphMap }[]; 
  selectedValue: string;
  onSelect: (value: any) => void;
  t: any;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable 
      className="flex-1 bg-black/40 justify-center items-center px-10" 
      onPress={onClose}
    >
      <Pressable className="bg-background-surface w-full rounded-[28px] overflow-hidden shadow-2xl">
        <View className="p-6 border-b border-border-subtle">
          <Text className="text-xl font-bold text-text-primary">{title}</Text>
        </View>
        <View className="py-2">
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                onSelect(opt.value);
                onClose();
              }}
              className="flex-row items-center px-6 py-4"
            >
              <View className="w-8 mr-2">
                {opt.icon && <Ionicons name={opt.icon} size={20} color={selectedValue === opt.value ? THEME.colors.primary : "#64748B"} />}
              </View>
              <Text className={`flex-1 text-[17px] ${selectedValue === opt.value ? "text-primary font-bold" : "text-text-primary font-medium"}`}>
                {opt.label}
              </Text>
              {selectedValue === opt.value && (
                <Ionicons name="checkmark-circle" size={24} color={THEME.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity 
          onPress={onClose}
          className="p-5 items-center border-t border-border-subtle"
        >
          <Text className="text-primary font-bold text-base uppercase tracking-widest">{t('Common.cancel')}</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);

export default function PerfilScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useColorScheme();
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  }, [fetchUserProfile]);
  
  const handleThemeChange = (val: 'light' | 'dark' | 'system') => {
    setColorScheme(val);
  };
  
  const [notifications, setNotifications] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingImage, setLoadingImage] = React.useState(false);

  const fetchUserProfile = React.useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      const updatedUser = response.data;
      setUser(updatedUser);
      
      // Sync local storage
      if (Platform.OS === 'web') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Error refreshing user profile", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );
  
  // Modal States
  const [langModalVisible, setLangModalVisible] = React.useState(false);
  const [themeModalVisible, setThemeModalVisible] = React.useState(false);

  React.useEffect(() => {
    async function loadUser() {
      try {
        let userData = null;
        
        if (Platform.OS === 'web') {
          userData = localStorage.getItem('user');
        } else {
          userData = await SecureStore.getItemAsync('user');
        }
        
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error("Error loading user", e);
      }
    }
    loadUser();
  }, []);

  const getProfileImage = () => {
    if (user?.photoUrl) {
      return { uri: user.photoUrl.startsWith('http') ? user.photoUrl : `${API_URL}${user.photoUrl}` };
    }
    return null;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        t('Common.error'),
        t('Profile.camera_permission_denied') || "Es necessiten permisos per accedir a la galeria."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setLoadingImage(true);
      
      try {
        // Prepare file for upload
        const formData = new FormData();
        const fileName = uri.split('/').pop() || 'profile.jpg';
        const fileType = fileName.split('.').pop();
        
        // @ts-ignore - FormData needs this structure in React Native
        formData.append('photo', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: fileName,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });

        const response = await api.post(`/upload/profile/user/${user.userId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          const updatedUser = { ...user, photoUrl: response.data.photoUrl };
          setUser(updatedUser);
          
          // Save updated user locally
          if (Platform.OS === 'web') {
            localStorage.setItem('user', JSON.stringify(updatedUser));
            localStorage.setItem('user-avatar', response.data.photoUrl);
          } else {
            await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
            await SecureStore.setItemAsync('user-avatar', response.data.photoUrl);
          }
          
          Alert.alert(t('Common.success') || 'Èxit', t('Profile.photo_updated') || 'Foto de perfil actualizada.');
        }
      } catch (e) {
        console.error("Error uploading avatar", e);
        Alert.alert(t('Common.error'), t('Profile.upload_error') || "Error en pujar la imatge.");
      } finally {
        setLoadingImage(false);
      }
    }
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        if (Platform.OS === 'web') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('user-avatar');
        } else {
          await SecureStore.deleteItemAsync('token');
          await SecureStore.deleteItemAsync('user');
          await SecureStore.deleteItemAsync('user-avatar');
        }
        router.replace('/login');
      } catch (e) {
        console.error("Error during logout", e);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(t('Auth.logout.message'))) {
        await performLogout();
      }
    } else {
      Alert.alert(
        t('Auth.logout.title'),
        t('Auth.logout.message'),
        [
          { text: t('Common.cancel'), style: 'cancel' },
          { text: t('Auth.logout.confirm'), style: 'destructive', onPress: performLogout }
        ]
      );
    }
  };

  const getUserInitials = () => {
    if (!user?.fullName) return '??';
    return user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const currentThemeLabel = React.useMemo(() => {
    if (colorScheme === 'dark') return t('Profile.appearance_options.dark');
    if (colorScheme === 'light') return t('Profile.appearance_options.light');
    return t('Profile.appearance_options.system');
  }, [colorScheme, t]);

  const currentLangLabel = React.useMemo(() => {
    return i18n.language.startsWith('ca') ? t('Profile.languages.ca') : t('Profile.languages.es');
  }, [i18n.language, t]);

  return (
    <View className="flex-1 bg-background-page">
      {loading ? (
        <View 
          className="items-center justify-center bg-background-page"
          style={[StyleSheet.absoluteFill, { zIndex: 50 }]}
        >
          <ActivityIndicator size="large" color="#4197CB" />
        </View>
      ) : (
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor="#4197CB"
              colors={['#4197CB']}
              progressViewOffset={insets.top + 40}
            />
          }
        >
          <PageHeader title={t('Tabs.profile')} subtitle={t('Profile.subtitle')} />
          
          {/* Integrated Profile Identity */}
          <View className="px-6 py-6 flex-row items-center bg-background-surface border-b border-border-subtle">
           <View className="relative">
              <TouchableOpacity 
                onPress={pickImage}
                disabled={loadingImage}
                activeOpacity={0.9}
                className="w-20 h-20 rounded-full bg-primary items-center justify-center shadow-sm overflow-hidden"
              >
                 {loadingImage ? (
                   <ActivityIndicator color="white" />
                 ) : getProfileImage() ? (
                   <Image source={getProfileImage()!} className="w-full h-full" />
                 ) : (
                   <Text className="text-2xl font-black text-white">{getUserInitials()}</Text>
                 )}
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={pickImage}
                disabled={loadingImage}
                className="absolute bottom-0 right-0 bg-secondary w-7 h-7 rounded-full items-center justify-center border-2 border-background-surface shadow-sm"
                activeOpacity={0.8}
              >
                 {loadingImage ? (
                   <ActivityIndicator size="small" color="white" />
                 ) : (
                   <Ionicons name="camera" size={12} color="white" />
                 )}
              </TouchableOpacity>
           </View>
           
           <View className="ml-5 flex-1">
              <Text className="text-xl font-bold text-text-primary mb-0.5">
                {user?.fullName || t('Common.loading')}
              </Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-text-muted text-[14px] font-medium">
                  {(user as any)?.role?.roleName === ROLES.TEACHER ? t('Profile.role_professor') : t('Profile.role_admin')}
                </Text>
              </View>
           </View>
        </View>

        {/* Profile Information Section */}
        <SectionHeader title={t('Profile.information') || "Informació del compte"} />
        <View className="border-t border-b border-border-subtle">
           <SettingItem 
              icon="person-outline" 
              iconColor="#546E7A" 
              title={t('Auth.login.name') || "Nom"}
              subtitle={user?.fullName}
              onPress={() => {}}
           />
           <SettingItem 
              icon="mail-outline" 
              iconColor="#546E7A" 
              title={t('Auth.login.email')}
              subtitle={user?.email || "---"}
              isLast
           />
        </View>

        {/* Preferences Section */}
        <SectionHeader title={t('Profile.preferences')} />
        <View className="border-t border-b border-border-subtle">
           <SettingItem 
              icon="notifications-outline" 
              iconColor="#FF9500" 
              title={t('Profile.notifications')}
              rightElement={
                <Switch 
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#E2E8F0', true: '#34C759' }}
                  thumbColor="white"
                />
              }
           />
           
           <SettingItem 
              icon="color-palette-outline" 
              iconColor="#5856D6" 
              title={t('Profile.appearance')}
              subtitle={currentThemeLabel}
              onPress={() => setThemeModalVisible(true)}
           />

           <SettingItem 
              icon="language-outline" 
              iconColor="#007AFF" 
              title={t('Profile.language')}
              subtitle={currentLangLabel}
              isLast
              onPress={() => setLangModalVisible(true)}
           />
        </View>

        {/* Security & Support */}
        <SectionHeader title={t('Profile.security_support') || "Seguretat i Suport"} />
        <View className="border-t border-b border-border-subtle">
           <SettingItem 
              icon="shield-checkmark-outline" 
              iconColor="#34C759" 
              title={t('Profile.security')}
              onPress={() => {}}
           />
           <SettingItem 
              icon="help-buoy-outline" 
              iconColor="#007AFF" 
              title={t('Profile.help')}
              isLast
              onPress={() => router.push('/support')}
           />
        </View>

        {/* Logout */}
        <View className="mt-8 mb-12 border-t border-b border-border-subtle">
           <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.7}
              className="flex-row items-center py-4 px-6 bg-background-surface"
           >
              <View className="w-8 items-center mr-4">
                <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
              </View>
              <Text className="text-[#FF3B30] text-[17px] font-medium" style={{ fontFamily: THEME.fonts.primary }}>
                {t('Auth.logout.confirm')}
              </Text>
           </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center pb-12">
           <Text className="text-[11px] font-bold text-text-muted opacity-40 uppercase tracking-widest">
             Iter App v1.2.0
           </Text>
        </View>

      </ScrollView>
      )}

      {/* Language Selection Modal */}
      <SelectionModal 
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
        title={t('Profile.language')}
        t={t}
        selectedValue={i18n.language.startsWith('ca') ? 'ca' : 'es'}
        onSelect={async (val) => {
          await i18n.changeLanguage(val);
          if (Platform.OS === 'web') {
            localStorage.setItem('user-language', val);
          } else {
            await SecureStore.setItemAsync('user-language', val);
          }
        }}
        options={[
          { label: t('Profile.languages.ca'), value: 'ca' },
          { label: t('Profile.languages.es'), value: 'es' },
        ]}
      />

      {/* Theme Selection Modal */}
      <SelectionModal 
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
        title={t('Profile.appearance')}
        t={t}
        selectedValue={colorScheme || 'system'}
        onSelect={(val) => handleThemeChange(val)}
        options={[
          { label: t('Profile.appearance_options.light'), value: 'light', icon: 'sunny-outline' },
          { label: t('Profile.appearance_options.dark'), value: 'dark', icon: 'moon-outline' },
          { label: t('Profile.appearance_options.system'), value: 'system', icon: 'settings-outline' },
        ]}
      />
    </View>
  );
}
