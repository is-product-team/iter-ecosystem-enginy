import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@iter/shared';
import { getMyAssignments } from '../../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function CoordinationScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const renderReferent = (teacher: any, label: string) => {
    if (!teacher) return null;
    return (
      <View key={teacher.teacherId} className="bg-background-subtle rounded-2xl p-4 shadow-sm border border-border-subtle flex-row">
        {/* Left Column - Avatar Style */}
        <View className="w-14 items-center justify-center border-r border-border-subtle mr-4 pr-4">
           <View className="w-10 h-10 rounded-full bg-background-surface items-center justify-center border border-border-subtle shadow-sm">
             <Text className="text-text-primary font-bold text-base">{teacher.name?.charAt(0)}</Text>
           </View>
        </View>

        {/* Right Content */}
        <View className="flex-1 justify-center">
            
            <View className="mb-2">
               <Text className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">{label}</Text>
               <Text className="text-base font-extrabold text-text-primary leading-tight">{teacher.name}</Text>
            </View>

            {/* Actions Footer */}
            <View className="flex-row items-center pt-3 border-t border-border-subtle border-dashed space-x-4">
               {teacher.contact && (
                 <TouchableOpacity 
                   onPress={() => handleCall(teacher.contact)}
                   className="flex-row items-center"
                 >
                   <Ionicons name="call" size={12} color={THEME.colors.primary} />
                   <Text className="text-text-secondary font-bold text-[10px] uppercase tracking-wider ml-1.5">{t('Common.call')}</Text>
                 </TouchableOpacity>
               )}
               <TouchableOpacity 
                 onPress={() => handleEmail(teacher.email || 'info@consorci.cat')}
                 className="flex-row items-center"
               >
                 <Ionicons name="mail" size={12} color={THEME.colors.primary} />
                 <Text className="text-text-secondary font-bold text-[10px] uppercase tracking-wider ml-1.5">Email</Text>
               </TouchableOpacity>
            </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background-page">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Professional Header */}
        <View className="px-6 pb-6 pt-4 bg-background-surface border-b border-border-subtle mb-6">
           <Text className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">
             {t('Coordination.teacher_space')}
           </Text>
           <Text className="text-3xl font-extrabold text-text-primary leading-tight">
             {t('Coordination.collaboration')}
           </Text>
        </View>

        <View className="px-6 pb-10">
          {assignments.length > 0 ? (
            assignments.map((assig) => (
              <View key={assig.assignmentId} className="mb-6">
                {/* Section Header */}
                <View className="flex-row items-center mb-3 ml-1">
                   <View className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 mr-2">
                      <Text className="text-primary font-bold text-[9px] uppercase tracking-wide">{t('Coordination.teaching_team')}</Text>
                   </View>
                   <Text className="flex-1 text-text-muted font-bold text-[10px] uppercase tracking-wide" numberOfLines={1}>{assig.workshop.title}</Text>
                </View>
                
                {renderReferent(assig.teacher1, t('Coordination.main_referent'))}
                {renderReferent(assig.teacher2, t('Coordination.secondary_referent'))}

                {!assig.teacher1 && !assig.teacher2 && (
                  <View className="p-6 bg-background-subtle rounded-2xl border-2 border-dashed border-border-subtle items-center">
                     <Ionicons name="people-outline" size={24} color={THEME.colors.primary} className="mb-2 opacity-40" />
                     <Text className="text-text-muted font-bold text-xs uppercase text-center">{t('Coordination.no_referents_assigned')}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className="items-center py-20 bg-background-subtle rounded-3xl border border-border-subtle shadow-sm mx-0">
               <View className="w-14 h-14 bg-background-surface rounded-full items-center justify-center mb-3 border border-border-subtle shadow-sm">
                  <Ionicons name="school-outline" size={28} color={THEME.colors.primary} className="opacity-40" />
               </View>
               <Text className="text-text-muted font-bold uppercase tracking-widest text-[10px] text-center">{t('Coordination.no_contacts_yet')}</Text>
            </View>
          )}

          <View className="bg-background-subtle rounded-2xl p-5 border border-border-subtle items-center mt-6 shadow-sm flex-row">
            <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4 border border-primary/20">
              <Ionicons name="chatbubbles" size={18} color={THEME.colors.primary} />
            </View>
            <Text className="text-text-secondary font-medium text-xs flex-1">
              <Text className="font-bold text-text-primary">{t('Common.coming_soon')}: </Text>
              {t('Coordination.group_chat_instruction')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
