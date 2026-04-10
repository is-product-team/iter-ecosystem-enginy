import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '@iter/shared';
import { getMyAssignments } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function CoordinationScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
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
            {t('Coordination.collaboration')}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-background-surface items-center justify-center border border-border-subtle shadow-sm mb-1"
        >
          <Ionicons name="close" size={20} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-10">
          {assignments.length > 0 ? (
            assignments.map((assig) => (
              <View key={assig.assignmentId} className="mb-8">
                {/* Section Title with specific style */}
                <View className="flex-row items-center mb-4 ml-1">
                   <View className="w-1 h-4 bg-primary rounded-full mr-3" />
                   <Text className="text-text-primary font-bold text-lg" style={{ fontFamily: THEME.fonts.primary }}>
                      {assig.workshop.title}
                   </Text>
                </View>
                
                <View className="bg-background-surface rounded-3xl overflow-hidden shadow-sm border border-border-subtle">
                  {[
                    { teacher: assig.teacher1, label: t('Coordination.main_referent') },
                    { teacher: assig.teacher2, label: t('Coordination.secondary_referent') }
                  ].map((item, idx, arr) => {
                    if (!item.teacher) return null;
                    return (
                      <View 
                        key={`${assig.assignmentId}-${idx}`}
                        className={`p-5 flex-row items-center ${idx !== arr.length - 1 && arr[idx+1].teacher ? 'border-b border-border-subtle' : ''}`}
                      >
                         <View className="w-12 h-12 rounded-2xl bg-background-subtle items-center justify-center mr-4 border border-border-subtle">
                            <Text className="text-text-primary font-bold text-lg">{item.teacher.name?.charAt(0)}</Text>
                         </View>
                         
                         <View className="flex-1">
                            <Text className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-0.5">{item.label}</Text>
                            <Text className="text-text-primary text-base font-bold mb-2" style={{ fontFamily: THEME.fonts.primary }}>{item.teacher.name}</Text>
                            
                            <View className="flex-row space-x-6">
                               {item.teacher.contact && (
                                 <TouchableOpacity onPress={() => handleCall(item.teacher.contact)} className="flex-row items-center">
                                   <Ionicons name="call" size={12} color={THEME.colors.primary} />
                                   <Text className="text-primary font-bold text-[10px] uppercase ml-1">{t('Common.call')}</Text>
                                 </TouchableOpacity>
                               )}
                               <TouchableOpacity onPress={() => handleEmail(item.teacher.email || 'info@consorci.cat')} className="flex-row items-center">
                                 <Ionicons name="mail" size={12} color={THEME.colors.primary} />
                                 <Text className="text-primary font-bold text-[10px] uppercase ml-1">Email</Text>
                               </TouchableOpacity>
                            </View>
                         </View>
                      </View>
                    );
                  })}

                  {!assig.teacher1 && !assig.teacher2 && (
                    <View className="p-8 items-center">
                       <Ionicons name="people-outline" size={32} color={THEME.colors.primary} className="opacity-20 mb-3" />
                       <Text className="text-text-muted font-bold text-xs uppercase text-center">{t('Coordination.no_referents_assigned')}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="items-center py-20 rounded-3xl border border-border-subtle border-dashed">
               <Ionicons name="school-outline" size={48} color={THEME.colors.primary} className="opacity-20 mb-4" />
               <Text className="text-text-muted font-bold uppercase tracking-widest text-[10px] text-center" style={{ fontFamily: THEME.fonts.primary }}>{t('Coordination.no_contacts_yet')}</Text>
            </View>
          )}

          <View className="bg-background-subtle rounded-3xl p-6 border border-border-subtle items-center mt-4 shadow-sm flex-row">
            <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center mr-4 border border-primary/20">
              <Ionicons name="chatbubbles" size={20} color={THEME.colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-bold text-sm mb-1">{t('Common.coming_soon')}</Text>
              <Text className="text-text-secondary text-xs leading-relaxed">
                {t('Coordination.group_chat_instruction')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
