import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { THEME } from '@iter/shared';
import api, { getNotifications } from '../../services/api';
import type { Notification } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function NotificationsTabScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const formatContent = (content: string, paramsContext: any = {}): string => {
    if (!content) return '';

    // Default params to avoid FORMATTING_ERROR in i18next if params are missing
    const defaultParams: Record<string, any> = {
      name: '',
      title: '',
      status: '',
      status_low: '',
      doc: '',
      comment: '',
      time: '',
      ...paramsContext
    };

    try {
      if (content.startsWith('{')) {
        const parsed = JSON.parse(content);
        if (parsed.key) {
          const params = { ...defaultParams, ...parsed.params };

          // Recursive translation for params (like the web version)
          for (const key in params) {
            const val = params[key];
            if (typeof val === 'string' && val.length > 0 && !val.includes(' ')) {
              const transVal = t(`Notifications.${val}`) as string;
              if (transVal !== `Notifications.${val}`) {
                params[key] = transVal;
              }
            }
          }

          return t(`Notifications.${parsed.key}`, params) as string;
        }
      }

      const translated = t(`Notifications.${content}`, defaultParams) as string;
      if (translated !== `Notifications.${content}`) {
        return translated;
      }
    } catch {
      // Not JSON or other error
    }

    return content;
  };
  const getParamsFromNotification = (notif: Notification) => {
    try {
      // Try to extract params from message if it's JSON
      if (notif.message.startsWith('{')) {
        const parsed = JSON.parse(notif.message);
        return parsed.params || {};
      }
      // Or from title
      if (notif.title.startsWith('{')) {
        const parsed = JSON.parse(notif.title);
        return parsed.params || {};
      }
    } catch {}
    return {};
  };

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch {
      console.error("Error fetching notifications mobile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markRead = async (id: number) => {
    try {
      await api.patch(`notifications/${id}/read`);
      setNotifications(prev => prev.map(n => {
        if (n.notificationId === id) {
          return { ...n, isRead: true };
        }
        return n;
      }));
    } catch {
      console.error("Error marking read mobile");
    }
  };

  const deleteNotif = async (id: number) => {
    try {
      await api.delete(`notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.notificationId !== id));
    } catch {
      console.error("Error deleting notification mobile");
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-background-page">
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top + 60 }} className="flex-1 bg-background-page">
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          headerTitle: '', 
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackTitle: t('Common.back'),
          headerTintColor: '#4197CB',
        }} 
      />
      
      {/* Apple-style Large Header */}
      <View className="px-8 pb-6">
         <Text className="text-[16px] font-normal text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
           {t('Notifications.tagline')}
         </Text>
         <Text className="text-[44px] font-light text-black dark:text-white tracking-tight leading-[48px]">
           {t('Notifications.title')}
         </Text>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4197CB" />
        }
      >
        <View className="border-t border-b border-border-subtle bg-background-surface">
          {notifications.length > 0 ? (
            notifications.map((notif, index) => {
              const isRead = notif.isRead;
              const isLast = index === notifications.length - 1;
              const sharedParams = getParamsFromNotification(notif);

              return (
                <View key={notif.notificationId}>
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    className={`p-5 flex-row items-center ${isRead ? 'opacity-50' : ''}`}
                  >
                    {/* Unread indicator dot */}
                    <View className="w-2 h-full absolute left-0 justify-center items-center">
                       {!isRead && <View className="w-2 h-2 rounded-full bg-[#4197CB] ml-4" />}
                    </View>

                    {/* Notification Icon - Apple Style Circle */}
                    <View className="w-12 h-12 rounded-full bg-[#4197CB]/10 items-center justify-center mr-4 border border-[#4197CB]/20">
                      <Ionicons name="notifications" size={20} color="#4197CB" />
                    </View>
                    
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-1">
                        <Text className="text-text-primary text-[17px] font-semibold flex-1 pr-2" numberOfLines={1}>
                          {formatContent(notif.title, sharedParams)}
                        </Text>
                        <Text className="text-text-muted text-[11px] font-bold uppercase opacity-60">
                          {new Date(notif.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>
                      
                      <Text className="text-text-secondary text-[14px] leading-snug mb-3" numberOfLines={2}>
                        {formatContent(notif.message, sharedParams)}
                      </Text>

                      <View className="flex-row space-x-6">
                        {!isRead && (
                          <TouchableOpacity 
                            onPress={() => markRead(notif.notificationId)} 
                            className="flex-row items-center"
                          >
                            <Ionicons name="checkmark-done-outline" size={16} color="#4197CB" />
                            <Text className="text-[#4197CB] font-bold text-[12px] ml-1.5 uppercase tracking-tight">{t('Notifications.mark_read')}</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                          onPress={() => deleteNotif(notif.notificationId)} 
                          className="flex-row items-center"
                        >
                          <Ionicons name="trash-outline" size={15} color="#F26178" />
                          <Text className="text-[#F26178] font-bold text-[12px] ml-1.5 uppercase tracking-tight">{t('Notifications.delete')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {!isLast && (
                    <View className="ml-20 h-[0.5px] bg-border-subtle" />
                  )}
                </View>
              );
            })
          ) : (
            <View className="items-center justify-center py-24 px-10">
               <View className="w-20 h-20 bg-background-subtle rounded-full items-center justify-center mb-6">
                  <Ionicons name="notifications-off-outline" size={40} color="#CBD5E1" />
               </View>
               <Text className="text-slate-400 font-medium text-center">{t('Notifications.empty')}</Text>
            </View>
          )}
        </View>
        
        <View className="h-12" />
      </ScrollView>
    </View>
  );
}
