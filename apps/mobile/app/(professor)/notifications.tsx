import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { THEME } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api, { getNotifications } from '../../services/api';
import type { Notification } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';

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
      <View 
        className="items-center justify-center bg-background-page"
        style={[StyleSheet.absoluteFill, { zIndex: 50 }]}
      >
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-page">
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          headerTitle: '', 
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackTitle: t('Common.back'),
        }} 
      />
      
      {/* Standardized Header */}
      <PageHeader 
        title={t('Notifications.title')} 
        subtitle={t('Notifications.tagline')} 
        hasNativeHeader={true} 
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#4197CB" 
            colors={['#4197CB']}
            progressViewOffset={insets.top + 95}
          />
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
                    className={`p-6 flex-row items-center ${isRead ? 'opacity-40' : ''}`}
                  >
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-1">
                         <View className="flex-row items-center flex-1 pr-4">
                            {!isRead && (
                              <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                            )}
                            <Text className="text-text-primary text-[17px] font-bold" numberOfLines={1}>
                              {formatContent(notif.title, sharedParams)}
                            </Text>
                         </View>
                        <Text className="text-text-muted text-[10px] font-bold uppercase tracking-wider opacity-60">
                          {new Date(notif.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>
                      
                      <Text className="text-text-secondary text-[14px] leading-relaxed mb-4" numberOfLines={2}>
                        {formatContent(notif.message, sharedParams)}
                      </Text>

                      <View className="flex-row justify-end space-x-6">
                        {!isRead && (
                          <TouchableOpacity 
                            onPress={() => markRead(notif.notificationId)} 
                            className="w-8 h-8 rounded-full bg-primary/5 items-center justify-center"
                          >
                            <Ionicons name="checkmark-done" size={18} color={THEME.colors.primary} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                          onPress={() => deleteNotif(notif.notificationId)} 
                          className="w-8 h-8 rounded-full bg-red-500/5 items-center justify-center"
                        >
                          <Ionicons name="trash-outline" size={16} color="#F26178" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {!isLast && (
                    <View className="mx-6 h-[0.5px] bg-border-subtle/50" />
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
