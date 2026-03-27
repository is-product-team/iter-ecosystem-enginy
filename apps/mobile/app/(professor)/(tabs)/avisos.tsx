import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import api, { getNotifications } from '../../../services/api';
import type { Notification } from '../../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AvisosScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markRead = async (id: number) => {
    try {
      await api.patch(`notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id_notification === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Error marking read mobile:", error);
    }
  };

  const deleteNotif = async (id: number) => {
    try {
      await api.delete(`notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id_notification !== id));
    } catch (error) {
      console.error("Error deleting notification mobile:", error);
    }
  };

  const getImportanceColor = (imp: string) => {
    switch (imp) {
      case 'URGENT': return '#EF4444';
      case 'WARNING': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PETICIO': return 'document-text';
      case 'FASE': return 'calendar';
      default: return 'notifications';
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
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
        }
      >
        <View className="px-6 pb-6 pt-4 bg-background-surface border-b border-border-subtle mb-6">
          <Text className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Communications</Text>
          <Text className="text-3xl font-extrabold text-text-primary leading-tight">Official Notices</Text>
        </View>

        <View className="px-6 pb-12">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <View 
                key={notif.id_notification}
                className={`mb-3 bg-background-subtle rounded-2xl p-4 shadow-sm border border-border-subtle flex-row ${notif.read ? 'opacity-60' : ''}`}
              >
                {/* Date Side - Calendar Style */}
                <View className="w-14 items-center justify-center border-r border-border-subtle mr-4 pr-4">
                  <Text className="text-text-muted text-[10px] font-bold uppercase mb-1">
                    {new Date(notif.createdAt).toLocaleDateString('ca-ES', { month: 'short' }).slice(0, 3)}
                  </Text>
                  <Text className="text-text-primary text-xl font-bold">
                    {new Date(notif.createdAt).getDate()}
                  </Text>
                </View>

                {/* Content */}
                <View className="flex-1 justify-center">
                  
                  {/* Top Row: Type & Status */}
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${notif.read ? 'text-text-muted' : 'text-primary'}`}>
                       {notif.type}
                    </Text>
                    
                    {!notif.read && (
                      <View className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </View>

                  <Text className="text-text-primary font-bold text-base leading-tight mb-1" numberOfLines={1}>
                    {notif.title}
                  </Text>
                  
                  <Text className="text-text-secondary text-xs leading-relaxed line-clamp-2 mb-3" numberOfLines={2}>
                    {notif.message}
                  </Text>

                  {/* Minimal Actions */}
                  <View className="flex-row justify-end items-center pt-3 border-t border-border-subtle border-dashed">
                     {!notif.read && (
                       <TouchableOpacity 
                          onPress={() => markRead(notif.id_notification)}
                          className="mr-4"
                          hitSlop={10}
                       >
                          <Text className="text-primary font-bold text-[10px] uppercase">Mark Read</Text>
                       </TouchableOpacity>
                     )}
                     <TouchableOpacity 
                        onPress={() => deleteNotif(notif.id_notification)}
                        hitSlop={10}
                     >
                        <Text className="text-text-muted font-bold text-[10px] uppercase hover:text-red-500">Delete</Text>
                     </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="items-center justify-center py-10 rounded-2xl border-2 border-dashed border-border-subtle">
               <Text className="text-text-muted font-medium text-sm">No new notices</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
