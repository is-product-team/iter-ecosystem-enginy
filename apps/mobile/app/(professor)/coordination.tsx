import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '@iter/shared';
import { getMyAssignments } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// WhatsApp-style Section Header
const SectionHeader = ({ title }: { title: string }) => (
  <View className="px-6 pt-6 pb-2">
    <Text className="text-text-muted text-[12px] font-bold uppercase tracking-wider">
      {title}
    </Text>
  </View>
);

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
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background-page">
      
      {/* Refined Left-Aligned Header */}
      <View className="px-6 pt-8 pb-6 bg-background-surface border-b border-border-subtle">
         <Text className="text-[11px] font-black text-text-muted uppercase tracking-[2px] mb-1">
           {t('Coordination.teacher_space')}
         </Text>
         <Text className="text-2xl font-black text-text-primary tracking-tight" style={{ fontFamily: THEME.fonts.primary }}>
           {t('Coordination.collaboration')}
         </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pb-10">
          {assignments.length > 0 ? (
            assignments.map((assig) => (
              <View key={assig.assignmentId} className="">
                <SectionHeader title={assig.workshop.title} />
                
                <View className="border-t border-b border-border-subtle bg-background-surface">
                  {[
                    { teacher: assig.teacher1, label: t('Coordination.main_referent') },
                    { teacher: assig.teacher2, label: t('Coordination.secondary_referent') }
                  ].map((item, idx, arr) => {
                    if (!item.teacher) return null;
                    const isLast = idx === arr.length - 1 || !arr[idx+1].teacher;
                    
                    return (
                      <View 
                        key={`${assig.assignmentId}-${idx}`}
                        className="p-5 flex-row items-center relative"
                      >
                         <View className="w-12 h-12 rounded-full bg-background-subtle items-center justify-center mr-4 border border-border-subtle">
                            <Text className="text-text-primary font-black text-lg">{item.teacher.name?.charAt(0)}</Text>
                         </View>
                         
                         <View className="flex-1">
                            <Text className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-0.5">{item.label}</Text>
                            <Text className="text-text-primary text-base font-bold mb-2">{item.teacher.name}</Text>
                            
                            <View className="flex-row space-x-6">
                               {item.teacher.contact && (
                                 <TouchableOpacity onPress={() => handleCall(item.teacher.contact)} className="flex-row items-center bg-background-subtle px-3 py-1.5 rounded-lg border border-border-subtle">
                                   <Ionicons name="call" size={14} color={THEME.colors.primary} />
                                   <Text className="text-primary font-black text-[10px] uppercase ml-2 tracking-widest">{t('Common.call')}</Text>
                                 </TouchableOpacity>
                               )}
                               <TouchableOpacity onPress={() => handleEmail(item.teacher.email || 'info@consorci.cat')} className="flex-row items-center bg-background-subtle px-3 py-1.5 rounded-lg border border-border-subtle">
                                 <Ionicons name="mail" size={14} color={THEME.colors.primary} />
                                 <Text className="text-primary font-black text-[10px] uppercase ml-2 tracking-widest">Email</Text>
                               </TouchableOpacity>
                            </View>
                         </View>

                         {!isLast && (
                           <View className="absolute bottom-0 left-20 right-0 h-[0.5px] bg-border-subtle" />
                         )}
                      </View>
                    );
                  })}

                  {!assig.teacher1 && !assig.teacher2 && (
                    <View className="p-10 items-center">
                       <Ionicons name="people-outline" size={32} color={THEME.colors.primary} className="opacity-20 mb-3" />
                       <Text className="text-text-muted font-bold text-xs uppercase text-center">{t('Coordination.no_referents_assigned')}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="items-center py-20 bg-background-surface border-t border-b border-border-subtle">
               <Ionicons name="school-outline" size={48} color={THEME.colors.primary} className="opacity-20 mb-4" />
               <Text className="text-text-muted font-bold uppercase tracking-widest text-[10px] text-center">{t('Coordination.no_contacts_yet')}</Text>
            </View>
          )}

          <SectionHeader title={t('Common.coming_soon')} />
          <View className="bg-background-surface border-t border-b border-border-subtle p-6 flex-row items-center">
            <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center mr-4 border border-primary/20">
              <Ionicons name="chatbubbles" size={20} color={THEME.colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-bold text-base mb-1">{t('Coordination.group_chat_instruction').split('.')[0]}</Text>
              <Text className="text-text-secondary text-sm leading-tight">
                {t('Coordination.group_chat_instruction')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
