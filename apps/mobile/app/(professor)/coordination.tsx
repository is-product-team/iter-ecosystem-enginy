import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { THEME } from '@iter/shared';
import { getMyAssignments } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// WhatsApp-style Section Header

export default function CoordinationScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getMyAssignments()
      .then(res => setAssignments(res.data))
      .catch(err => console.error("Error fetching assignments for coordination:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCall = (number: string) => {
    if (number) Linking.openURL(`tel:${number}`);
  };

  const handleEmail = (email: string) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  if (loading) {
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
           {t('Coordination.teacher_space')}
         </Text>
         <Text className="text-[44px] font-light text-black dark:text-white tracking-tight leading-[48px]">
           {t('Coordination.title')}
         </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pb-10">
          {assignments.length > 0 ? (
            assignments.map((assig) => (
              <View key={assig.assignmentId} className="mb-4">
                {/* Workshop Header - Like a WhatsApp Group/Date Header */}
                <View className="px-8 py-3 bg-background-subtle/50">
                  <Text className="text-[#4197CB] text-[13px] font-bold uppercase tracking-widest">
                    {assig.workshop.title}
                  </Text>
                </View>
                
                <View className="bg-background-surface border-t border-b border-border-subtle">
                  {[
                    { teacher: assig.teacher1, label: t('Coordination.main_referent') },
                    { teacher: assig.teacher2, label: t('Coordination.secondary_referent') }
                  ].map((item, idx, arr) => {
                    if (!item.teacher) return null;
                    const isLast = idx === arr.length - 1 || !arr[idx+1].teacher;
                    
                    return (
                      <View key={`${assig.assignmentId}-${idx}`}>
                        <TouchableOpacity 
                          activeOpacity={0.7}
                          className="flex-row items-center p-5"
                        >
                          {/* Avatar - WhatsApp Style */}
                          <View className="w-14 h-14 rounded-full bg-background-subtle items-center justify-center mr-4 border border-border-subtle shadow-sm">
                             <Text className="text-[#4197CB] font-bold text-xl">{item.teacher.name?.charAt(0)}</Text>
                          </View>
                          
                          <View className="flex-1">
                             <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-text-primary text-[17px] font-semibold">{item.teacher.name}</Text>
                                <Text className="text-text-muted text-[11px] font-bold uppercase tracking-tighter opacity-60">{item.label}</Text>
                             </View>
                             
                             {/* WhatsApp Style Action Row */}
                             <View className="flex-row items-center mt-2 space-x-8">
                                {item.teacher.contact && (
                                  <TouchableOpacity 
                                    onPress={() => handleCall(item.teacher.contact)}
                                    className="flex-row items-center"
                                  >
                                    <View className="w-8 h-8 rounded-full bg-[#4197CB]/10 items-center justify-center mr-2">
                                      <Ionicons name="call" size={14} color="#4197CB" />
                                    </View>
                                    <Text className="text-[#4197CB] font-bold text-[13px]">{t('Common.call')}</Text>
                                  </TouchableOpacity>
                                )}
                                <TouchableOpacity 
                                  onPress={() => handleEmail(item.teacher.email || 'info@consorci.cat')}
                                  className="flex-row items-center"
                                >
                                  <View className="w-8 h-8 rounded-full bg-[#4197CB]/10 items-center justify-center mr-2">
                                    <Ionicons name="mail" size={14} color="#4197CB" />
                                  </View>
                                  <Text className="text-[#4197CB] font-bold text-[13px]">{t('Common.email')}</Text>
                                </TouchableOpacity>
                             </View>
                          </View>
                        </TouchableOpacity>
                        {!isLast && (
                           <View className="ml-[88px] h-[0.5px] bg-border-subtle" />
                        )}
                      </View>
                    );
                  })}

                  {!assig.teacher1 && !assig.teacher2 && (
                    <View className="p-8 items-center">
                       <Ionicons name="people-outline" size={32} color="#CBD5E1" className="mb-2" />
                       <Text className="text-text-muted text-sm font-medium italic">{t('Coordination.no_referents_assigned')}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="items-center py-24 px-10">
               <View className="w-20 h-20 bg-background-subtle rounded-full items-center justify-center mb-6">
                  <Ionicons name="school-outline" size={40} color="#CBD5E1" />
               </View>
               <Text className="text-slate-400 font-medium text-center">{t('Coordination.no_contacts_yet')}</Text>
            </View>
          )}

          {/* Support Section - Like a WhatsApp archived or official chat info */}
          <View className="mt-6">
            <View className="px-8 py-3">
              <Text className="text-text-muted text-[13px] font-bold uppercase tracking-widest">{t('Common.coming_soon')}</Text>
            </View>
            <View className="bg-background-surface border-t border-b border-border-subtle p-6 flex-row items-center">
              <View className="w-14 h-14 bg-[#4197CB]/10 rounded-full items-center justify-center mr-4 border border-[#4197CB]/20">
                <Ionicons name="chatbubbles" size={24} color="#4197CB" />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-bold text-[17px] mb-1">{t('Coordination.group_chat_instruction').split('.')[0]}</Text>
                <Text className="text-text-secondary text-sm leading-snug">
                  {t('Coordination.group_chat_instruction')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
