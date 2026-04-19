import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import issueService, { Issue } from '@/services/issueService';
import { THEME } from '@iter/shared';

export default function SupportScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [issues, setIssues] = React.useState<Issue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchIssues = async () => {
    try {
      const data = await issueService.getAll();
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchIssues();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchIssues();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#3B82F6'; // Blue
      case 'IN_PROGRESS': return '#F59E0B'; // Amber
      case 'RESOLVED': return '#10B981'; // Green
      case 'CLOSED': return '#64748B'; // Slate
      default: return '#64748B';
    }
  };

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
      <View className="px-8 pb-6 flex-row justify-between items-end">
        <View className="flex-1">
           <Text className="text-[16px] font-normal text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
             {t('Support.direct_contact')}
           </Text>
           <Text className="text-[38px] font-light text-black dark:text-white tracking-tight leading-[42px]">
             {t('Issues.title')}
           </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/issue/new')}
          className="w-12 h-12 bg-primary rounded-full items-center justify-center shadow-lg"
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={THEME.colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-6" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
          }
        >
          {issues.length === 0 ? (
            <View className="items-center py-20">
               <View className="w-24 h-24 bg-background-subtle rounded-full items-center justify-center mb-6">
                  <Ionicons name="chatbubble-ellipses-outline" size={48} color="#CBD5E1" />
               </View>
               <Text className="text-slate-400 font-medium text-center px-10 text-[16px]">
                  {t('Issues.no_incidents')}
               </Text>
               <TouchableOpacity 
                 onPress={() => router.push('/issue/new')}
                 className="mt-8 px-8 py-3 bg-white dark:bg-gray-800 rounded-full border border-border-subtle shadow-sm"
               >
                  <Text className="text-primary font-bold">{t('Issues.new')}</Text>
               </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-4 pt-2">
              {issues.map((issue) => {
                return (
                  <TouchableOpacity
                    key={issue.issueId}
                    onPress={() => router.push(`/issue/${issue.issueId}`)}
                    activeOpacity={0.7}
                    className="bg-white dark:bg-gray-800 p-5 rounded-[24px] shadow-sm border border-border-subtle"
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-4">
                        <Text className="text-text-primary font-bold text-[17px] mb-1" numberOfLines={1}>
                          {issue.title}
                        </Text>
                        <Text className="text-text-muted text-[13px]">
                          {new Date(issue.createdAt).toLocaleDateString()} • {t(`Issues.categories.${issue.category}`)}
                        </Text>
                      </View>
                      <View 
                        className="px-3 py-1 rounded-full" 
                        style={{ backgroundColor: `${getStatusColor(issue.status)}20` }}
                      >
                        <Text 
                          className="text-[11px] font-bold" 
                          style={{ color: getStatusColor(issue.status) }}
                        >
                          {issue.status}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-center justify-between border-t border-slate-50 dark:border-slate-700/50 pt-3">
                      <View className="flex-row items-center">
                        <Ionicons name="chatbubbles-outline" size={16} color={THEME.colors.primary} />
                        <Text className="text-primary text-[13px] font-bold ml-1.5">
                          {issue._count?.messages || 0} {t('Issues.chat.messages') || 'missatges'}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
