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
  const router = useRouter();
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
      {/* Custom Header matching Dashboard style */}
      <View className="px-6 pb-6 pt-4 mb-2 flex-row justify-between items-end">
        <View>
          <View className="flex-row items-baseline mb-2">
            <Text className="text-text-muted text-xs font-bold uppercase tracking-widest mr-2" style={{ fontFamily: THEME.fonts.primary }}>
              {new Date().toLocaleDateString(i18n.language, { weekday: 'long' })}
            </Text>
            <Text className="text-text-secondary text-xs font-bold uppercase tracking-widest" style={{ fontFamily: THEME.fonts.primary }}>
              {new Date().toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <Text className="text-3xl font-extrabold text-text-primary leading-tight" style={{ fontFamily: THEME.fonts.primary }}>
            {t('Notifications.title')}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-background-surface items-center justify-center border border-border-subtle shadow-sm mb-1"
        >
          <Ionicons name="close" size={20} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
        }
      >
        <View className="px-6 pb-12">
          {notifications.length > 0 ? (
            notifications.map((notif, index) => {
              const isRead = notif.isRead;

              return (
                <View 
                  key={notif.notificationId}
                  className={`bg-white rounded-[32px] p-6 mb-5 shadow-sm border border-neutral-100 ${isRead ? 'opacity-60' : ''}`}
                >
                  {/* Top Section: Icon + Content + Dot */}
                  <View className="flex-row">
                    {/* Icon Box */}
                    <View 
                        className="w-14 h-14 rounded-[20px] items-center justify-center mr-4"
                        style={{ backgroundColor: isRead ? '#334155' : '#450a0a' }}
                    >
                       <Ionicons name="notifications" size={24} color={isRead ? '#94a3b8' : '#F87171'} />
                    </View>
                    
                    {/* Text Content */}
                    <View className="flex-1 relative pr-4">
                      <Text className="text-[#0f172a] text-[17px] font-bold mb-1" style={{ fontFamily: THEME.fonts.primary }}>
                        {notif.title}
                      </Text>
                      
                      <Text className="text-[#475569] text-[14px] leading-tight mb-2" style={{ fontFamily: THEME.fonts.primary }}>
                        {notif.message}
                      </Text>

                      <Text className="text-[#94a3b8] text-[11px] font-bold uppercase">
                        {new Date(notif.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })}
                      </Text>

                      {/* Blue Indicator Dot */}
                      {!isRead && (
                        <View className="w-2.5 h-2.5 rounded-full bg-[#0369a1] absolute top-1.5 -right-1" />
                      )}
                    </View>
                  </View>

                  {/* Actions Section: Row of distinct buttons */}
                  <View className="flex-row space-x-8 mt-6">
                    {!isRead && (
                      <TouchableOpacity 
                        onPress={() => markRead(notif.notificationId)}
                        className="flex-1 bg-neutral-100 rounded-2xl py-4 items-center justify-center"
                        activeOpacity={0.7}
                      >
                        <Text className="text-[#334155] font-bold text-[11px] uppercase tracking-wider">
                          {t('Notifications.mark_read')}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      onPress={() => deleteNotif(notif.notificationId)}
                      className="flex-1 bg-neutral-100 rounded-2xl py-4 items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Text className="text-[#334155] font-bold text-[11px] uppercase tracking-wider">
                        {t('Notifications.delete')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View className="items-center justify-center py-20 rounded-3xl border border-border-subtle border-dashed">
               <Ionicons name="notifications-off-outline" size={40} color={THEME.colors.primary} className="opacity-20 mb-4" />
               <Text className="text-text-muted font-medium text-sm" style={{ fontFamily: THEME.fonts.primary }}>{t('Notifications.empty')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
