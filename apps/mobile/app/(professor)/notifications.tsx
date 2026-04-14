import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications mobile:", error);
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
    } catch (error) {
      console.error("Error marking read mobile:", error);
    }
  };

  const deleteNotif = async (id: number) => {
    try {
      await api.delete(`notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.notificationId !== id));
    } catch (error) {
      console.error("Error deleting notification mobile:", error);
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
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background-page">
      
      {/* Refined Left-Aligned Header */}
      <View className="px-6 pt-8 pb-6 bg-background-surface border-b border-border-subtle">
         <Text className="text-[11px] font-black text-text-muted uppercase tracking-[2px] mb-1">
           {t('Notifications.tagline')}
         </Text>
         <Text className="text-2xl font-black text-text-primary tracking-tight" style={{ fontFamily: THEME.fonts.primary }}>
           {t('Notifications.title')}
         </Text>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
        }
      >
        <View className="border-t border-b border-border-subtle">
          {notifications.length > 0 ? (
            notifications.map((notif, index) => {
              const isRead = notif.isRead;
              const isLast = index === notifications.length - 1;

              return (
                <TouchableOpacity 
                  key={notif.notificationId}
                  activeOpacity={0.7}
                  className={`bg-background-surface p-6 flex-row ${isRead ? 'opacity-60' : ''}`}
                >
                  {!isRead && (
                    <View className="absolute left-2 top-1/2 -mt-1 w-2 h-2 rounded-full bg-primary" />
                  )}
                  
                  <View className="w-12 h-12 rounded-full bg-background-subtle items-center justify-center mr-4 border border-border-subtle">
                    <Ionicons name="notifications" size={22} color={isRead ? "#94a3b8" : THEME.colors.primary} />
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-text-primary text-[16px] font-black flex-1 pr-2" numberOfLines={1}>
                        {notif.title}
                      </Text>
                      <Text className="text-text-muted text-[11px] font-bold uppercase">
                        {new Date(notif.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                    
                    <Text className="text-text-secondary text-sm leading-tight mb-3" numberOfLines={2}>
                      {notif.message}
                    </Text>

                    <View className="flex-row space-x-4">
                      {!isRead && (
                        <TouchableOpacity onPress={() => markRead(notif.notificationId)} className="bg-background-subtle px-3 py-1.5 rounded-lg border border-border-subtle">
                          <Text className="text-text-primary text-[10px] font-black uppercase tracking-widest">{t('Notifications.mark_read')}</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => deleteNotif(notif.notificationId)} className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                        <Text className="text-red-600 text-[10px] font-black uppercase tracking-widest">{t('Notifications.delete')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {!isLast && (
                    <View className="absolute bottom-0 left-24 right-0 h-[0.5px] bg-border-subtle" />
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="items-center justify-center py-20 bg-background-surface">
               <Ionicons name="notifications-off-outline" size={40} color={THEME.colors.primary} className="opacity-20 mb-4" />
               <Text className="text-text-muted font-medium text-sm" style={{ fontFamily: THEME.fonts.primary }}>{t('Notifications.empty')}</Text>
            </View>
          )}
        </View>
        
        <View className="h-12" />
      </ScrollView>
    </View>
  );
}
