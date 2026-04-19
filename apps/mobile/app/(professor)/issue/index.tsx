import * as React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import issueService, { Issue } from '@/services/issueService';
import { THEME } from '@iter/shared';
import { PageHeader } from '../../../components/ui/PageHeader';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN': return '#4197CB';
    case 'IN_PROGRESS': return '#F59E0B';
    case 'RESOLVED': return '#10B981';
    case 'CLOSED': return '#6B7280';
    default: return '#6B7280';
  }
};

export default function IssueListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const tintColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  const [issues, setIssues] = React.useState<Issue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchIssues = React.useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      const data = await issueService.getAll();
      // Sort: Open/In Progress first, then Resolved/Closed. Within that, newest first.
      const sorted = [...data].sort((a, b) => {
        const order = { 'OPEN': 0, 'IN_PROGRESS': 1, 'RESOLVED': 2, 'CLOSED': 3 };
        const statusDiff = order[a.status] - order[b.status];
        if (statusDiff !== 0) return statusDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setIssues(sorted);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const renderItem = ({ item }: { item: Issue }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/(professor)/issue/${item.issueId}`)}
      className="mb-4 bg-background-surface rounded-[32px] p-6 shadow-sm border border-border-subtle/30"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View 
            className="w-2 h-2 rounded-full mr-2" 
            style={{ backgroundColor: getStatusColor(item.status) }} 
          />
          <Text className="text-text-muted text-[11px] font-bold uppercase tracking-widest">
            {item.status}
          </Text>
        </View>
        <Text className="text-text-muted text-[11px] font-medium font-bold opacity-30">#{item.issueId}</Text>
      </View>

      <Text className="text-[20px] font-bold text-text-primary tracking-tight mb-2">
        {item.title}
      </Text>
      
      <View className="flex-row items-center justify-between mt-2">
         <View className="bg-background-subtle px-3 py-1 rounded-full">
            <Text className="text-text-muted text-[10px] font-bold uppercase">{t(`Issues.categories.${item.category}`)}</Text>
         </View>
         <View className="flex-row items-center opacity-40">
            {item._count?.messages && item._count.messages > 0 && (
              <Ionicons name="chatbubble-ellipses" size={14} color={tintColor} className="mr-3" />
            )}
            <Text className="text-text-muted text-[11px] font-bold">
               {new Date(item.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
            </Text>
         </View>
      </View>
    </TouchableOpacity>
  );


  return (
    <View className="flex-1 bg-background-page">
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          headerTitle: '', 
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackTitle: t('Common.back'),
          headerTintColor: tintColor,
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/(professor)/issue/new')}
              className="mr-2 flex-row items-center p-2"
              activeOpacity={0.7}
            >
              <Text 
                style={{ color: tintColor }}
                className="text-[17px] font-normal mr-1"
              >
                {t('Issues.new')}
              </Text>
              <Ionicons name="add" size={20} color={tintColor} />
            </TouchableOpacity>
          ),
        }} 
      />

      <FlatList
        data={issues}
        renderItem={renderItem}
        keyExtractor={(item) => item.issueId.toString()}
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingBottom: Math.max(insets.bottom, 40)
        }}
        ListHeaderComponent={
          <View 
            style={{ paddingTop: insets.top + 20 }}
            className="px-0 pb-2 mb-2"
          >
             <PageHeader 
                title={t('Issues.title')} 
                subtitle="El teu historial de comunicació" 
                className="px-0"
              />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator color={THEME.colors.primary} />
            </View>
          ) : (
            <View className="py-20 items-center px-10">
              <View className="w-20 h-20 bg-background-subtle rounded-full items-center justify-center mb-6">
                <Ionicons name="chatbox-outline" size={32} color="#CBD5E1" />
              </View>
              <Text className="text-xl font-bold text-text-primary mb-2 text-center">
                {t('Issues.no_incidents')}
              </Text>
              <Text className="text-[14px] text-text-muted text-center leading-relaxed mb-8">
                Aquí veuràs l'historial de les teves consultes i la comunicació amb l'administració.
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(professor)/issue/new')}
                className="bg-primary px-8 py-4 rounded-2xl shadow-lg"
              >
                <Text className="text-white font-bold uppercase tracking-widest">+ Nova Incidència</Text>
              </TouchableOpacity>
            </View>
          )
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => fetchIssues(true)} 
            tintColor="#4197CB"
            colors={['#4197CB']}
            progressViewOffset={insets.top + 95}
          />
        }
      />
    </View>
  );
}
