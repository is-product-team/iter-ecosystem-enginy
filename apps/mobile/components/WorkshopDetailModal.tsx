import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Animated, Dimensions, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { CalendarEvent } from './EventDetailModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WorkshopDetailModalProps {
  visible: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

const WorkshopDetailModal: React.FC<WorkshopDetailModalProps> = ({ visible, onClose, event }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(0.5)),
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true })
      ]).start();
    }
  }, [visible]);

  if (!event) return null;

  const metadata = event.metadata || {};
  const isEvaluated = metadata.isEvaluated;
  const isPast = metadata.isPast;
  const isCurrent = metadata.isCurrent;
  
  // Logic from requirements:
  // 1. "Pasar lista" (Manage): Enabled ONLY IF isCurrent. Disabled if isPast or future.
  // 2. "Evaluar Taller": Enabled ONLY IF isPast. Disabled if isCurrent or future/today.
  // 3. Status "Evaluated" (Green) only if isPast.
  const canManage = isCurrent;
  const canEvaluate = isPast;
  const showEvaluated = isEvaluated && isPast;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true })
    ]).start(() => onClose());
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      animationType="none"
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View 
          style={{ 
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            opacity: fadeAnim 
          }} 
        >
          <Pressable style={{ flex: 1 }} onPress={handleClose} />
        </Animated.View>
        
        <Animated.View 
          style={{ 
            maxHeight: SCREEN_HEIGHT * 0.90, 
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            overflow: 'hidden',
            transform: [{ translateY: slideAnim }]
          }}
          className="bg-background-surface"
        >
          <View className="items-center pt-4 pb-1">
             <View className="w-10 h-1.5 bg-border-subtle rounded-full" />
          </View>

          {/* ── Header ── */}
          <View className="pt-2 pb-6 px-8 flex-row justify-between items-start">
             <View className="flex-1 mr-4">
                 <View className="mb-2">
                    <Text className="text-[12px] font-medium text-text-muted uppercase tracking-[2px]">
                       {event.type === 'assignment' ? t('Common.practical_workshop') : t('Common.session')}
                    </Text>
                 </View>
                 <Text className="text-[38px] font-light text-text-primary tracking-tighter leading-[42px]">
                    {event.title}
                 </Text>
             </View>
             <TouchableOpacity 
               onPress={handleClose} 
               activeOpacity={0.7}
               className="w-10 h-10 bg-background-subtle rounded-full items-center justify-center mt-2"
             >
                <Ionicons name="close" size={20} color={colorScheme === 'dark' ? '#676767' : THEME.colors.gray} />
             </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ flexShrink: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 0, paddingBottom: 160 }}
          >
             {/* Key Info Grid */}
             <View className="flex-row justify-between mb-6">
                 <View className="w-[48%] bg-background-subtle p-5 rounded-[28px] border border-border-subtle">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="time-outline" size={14} color="#F97316" />
                        <Text className="text-text-muted text-[10px] font-medium uppercase tracking-widest ml-2">{t('Common.time')}</Text>
                    </View>
                    <Text className="text-text-primary font-light text-[22px] tracking-tighter">
                        {metadata.time || t('Common.all_day')}
                    </Text>
                 </View>

                 <View className="w-[48%] bg-background-subtle p-5 rounded-[28px] border border-border-subtle">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="location-outline" size={14} color={colorScheme === 'dark' ? '#4197CB' : THEME.colors.primary} />
                        <Text className="text-text-muted text-[10px] font-medium uppercase tracking-widest ml-2">{t('Common.room')}</Text>
                    </View>
                    <Text className="text-text-primary font-light text-[22px] tracking-tighter" numberOfLines={1}>
                        {metadata.center || t('Common.not_available')}
                    </Text>
                 </View>
             </View>

             <View className="bg-background-subtle px-6 py-5 rounded-[28px] border border-border-subtle flex-row items-center mb-6">
                <View className="w-10 h-10 bg-background-surface rounded-xl items-center justify-center shadow-sm mr-4">
                    <Ionicons name="people-outline" size={20} color={colorScheme === 'dark' ? '#4197CB' : THEME.colors.secondary} />
                </View>
                <View className="flex-1">
                    <Text className="text-text-muted text-[10px] font-medium uppercase tracking-widest mb-0.5">{t('Common.assigned_group')}</Text>
                    <Text className="text-text-primary font-light text-[20px] tracking-tighter">{t('Common.practice_group')}</Text>
                </View>
             </View>

             <View className="bg-background-subtle px-6 py-5 rounded-[28px] border border-border-subtle flex-row items-center mb-6">
                <View className="w-10 h-10 bg-background-surface rounded-xl items-center justify-center shadow-sm mr-4">
                    <Ionicons name="calendar-outline" size={20} color="#14B8A6" />
                </View>
                <View className="flex-1">
                    <Text className="text-text-muted text-[10px] font-medium uppercase tracking-widest mb-0.5">{t('Calendar.title')}</Text>
                    <Text className="text-text-primary font-light text-[20px] tracking-tighter">
                        {new Date(event.date).toLocaleDateString(i18n.language || 'ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Text>
                </View>
             </View>

             {event.description && (
                 <View className="bg-background-subtle p-6 rounded-[32px] border border-border-subtle mb-6">
                     <Text className="text-text-muted text-[10px] font-medium uppercase tracking-widest mb-3">
                        {t('Common.session_objectives')}
                     </Text>
                     <Text className="text-[17px] text-text-secondary leading-[24px] font-light tracking-tight">
                        {event.description}
                     </Text>
                 </View>
             )}
          </ScrollView>

           {/* ── Action Bar ── */}
           {event.type === 'assignment' && metadata.assignmentId && (
               <View className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-12 bg-background-surface/95 border-t border-border-subtle">
                    <View className="flex-row gap-3">
                         {/* Button: Pasar lista (previously Manage Session) */}
                         <TouchableOpacity 
                            onPress={() => {
                              onClose();
                              router.push({
                                pathname: `/(professor)/session/${metadata.assignmentId}`,
                                params: { 
                                  sessionNum: metadata.sessionNum || 1,
                                  sessionId: metadata.sessionId 
                                }
                              } as any);
                            }}
                            activeOpacity={0.8}
                            disabled={!canManage}
                            style={{ opacity: canManage ? 1 : 0.4 }}
                            className="flex-[1.5] h-14 rounded-[22px] bg-primary items-center justify-center shadow-sm"
                         >
                            <Text className="text-white text-[16px] font-bold uppercase tracking-wide">
                                {isPast ? "Pasar lista (Finalizado)" : "Pasar lista"}
                            </Text>
                         </TouchableOpacity>

                         {/* Button: Evaluar Taller */}
                         <TouchableOpacity 
                            onPress={() => {
                              if (showEvaluated) return;
                              onClose();
                              router.push(`/(professor)/questionnaire/${metadata.assignmentId}`);
                            }}
                            activeOpacity={0.7}
                            disabled={!canEvaluate || showEvaluated}
                            style={{ opacity: (canEvaluate && !showEvaluated) ? 1 : 0.4 }}
                            className={`flex-1 h-14 rounded-[22px] items-center justify-center border ${
                                showEvaluated 
                                ? 'bg-green-500 border-green-500' 
                                : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'
                            }`}
                         >
                            {showEvaluated ? (
                                <View className="flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={18} color="white" style={{ marginRight: 6 }} />
                                    <Text className="text-white text-[14px] font-bold uppercase">{t('Common.workshop_evaluated')}</Text>
                                </View>
                            ) : (
                                <Text className={`text-[14px] font-bold uppercase ${canEvaluate ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                                   {t('Common.evaluate_workshop')}
                                </Text>
                            )}
                         </TouchableOpacity>
                    </View>
               </View>
           )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default WorkshopDetailModal;
