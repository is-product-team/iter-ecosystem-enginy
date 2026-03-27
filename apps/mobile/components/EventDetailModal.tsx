import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '@iter/shared';
import { useTranslation } from 'react-i18next';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'milestone' | 'deadline' | 'assignment' | 'session';
  description?: string;
  metadata?: any;
}

interface EventDetailModalProps {
  visible: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ visible, onClose, event }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  if (!event) return null;

  const getEventColor = (type: string) => {
    switch (type) {
      case 'milestone': return THEME.colors.primary;
      case 'deadline': return THEME.colors.accent;
      case 'assignment': return THEME.colors.secondary;
      default: return THEME.colors.gray;
    }
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet" 
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background-page">
          {/* Header / Actions */}
          <View className="flex-row justify-end items-center px-6 pt-6 pb-2">
             <TouchableOpacity 
               onPress={onClose} 
               className="w-10 h-10 bg-background-subtle rounded-full items-center justify-center"
             >
                <Ionicons name="close" size={24} color={THEME.colors.primary} />
             </TouchableOpacity>
          </View>

          <ScrollView className="px-6 flex-1">
            <View className="pb-10">
              {/* Title Section */}
              <View className="mb-8">
                <View className="flex-row items-center mb-3">
                  <View 
                    className="px-3 py-1 rounded-full self-start mr-2"
                    style={{ backgroundColor: getEventColor(event.type) + '20' }} // 20% opacity
                  >
                    <Text 
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: getEventColor(event.type) }}
                    >
                      {event.type === 'assignment' ? t('Common.workshop') : t(`Common.${event.type}`)}
                    </Text>
                  </View>
                  {event.type === 'assignment' && (
                     <View className="px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full self-start">
                        <Text className="text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">{t('Common.pending')}</Text>
                     </View>
                  )}
                </View>
                
                <Text className="text-4xl font-extrabold text-text-primary leading-tight mb-2">
                  {event.title}
                </Text>
                
                <Text className="text-lg text-text-muted font-medium">
                   {new Date(event.date).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>


              {/* Modern Info Cards */}
              <View className="space-y-6">
                 
                 {/* Time Row */}
                 <View className="flex-row items-start">
                    <View className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 items-center justify-center mr-4">
                       <Ionicons name="time" size={24} color="#F97316" />
                    </View>
                    <View className="flex-1 pt-1">
                       <Text className="text-text-primary font-bold text-lg mb-0.5">{t('Common.time')}</Text>
                       <Text className="text-text-secondary text-base">
                          {event.metadata?.time || t('Common.all_day')}
                       </Text>
                    </View>
                 </View>

                 {/* Location Row */}
                 {(event.metadata?.address || event.metadata?.center) && (
                     <View className="flex-row items-start">
                        <View className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 items-center justify-center mr-4">
                           <Ionicons name="location" size={24} color="#3B82F6" />
                        </View>
                        <View className="flex-1 pt-1">
                           <Text className="text-text-primary font-bold text-lg mb-0.5">{t('Common.location')}</Text>
                           <Text className="text-text-secondary text-base font-medium">{event.metadata.center}</Text>
                           <Text className="text-text-muted text-sm mt-0.5 leading-5">{event.metadata.address}</Text>
                        </View>
                     </View>
                 )}
                 
                 {/* Description/Notes Row */}
                 {event.description && (
                     <View className="flex-row items-start">
                        <View className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 items-center justify-center mr-4">
                           <Ionicons name="document-text" size={24} color="#8B5CF6" />
                        </View>
                        <View className="flex-1 pt-1">
                           <Text className="text-text-primary font-bold text-lg mb-0.5">{t('Common.description')}</Text>
                           <Text className="text-text-secondary text-base leading-6">
                              {event.description}
                           </Text>
                        </View>
                     </View>
                 )}
              </View>
              
              {/* Action Buttons */}
              <View className="mt-10 space-y-3">
                 {event.type === 'assignment' && event.metadata?.assignmentId && (
                    <TouchableOpacity 
                       onPress={() => {
                         onClose();
                         router.push(`/(professor)/session/${event.metadata.assignmentId}`);
                       }}
                       className="w-full bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
                    >
                        <Text className="text-white text-lg font-bold tracking-wide uppercase">{t('Session.manage_session')}</Text>
                    </TouchableOpacity>
                 )}

                <TouchableOpacity className="w-full h-14 rounded-2xl items-center justify-center border border-border-subtle bg-background-subtle">
                    <Text className="text-text-secondary text-base font-semibold">{t('Calendar.add_to_calendar')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="w-full h-12 items-center justify-center mt-2">
                    <Text className="text-red-400 text-sm font-medium">{t('Calendar.remove_event')}</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
      </View>
    </Modal>
  );
};

export default EventDetailModal;
