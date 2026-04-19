import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import issueService, { Issue } from '@/services/issueService';
import { THEME } from '@iter/shared';

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef<ScrollView>(null);

  const [issue, setIssue] = React.useState<Issue | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const fetchIssue = React.useCallback(async () => {
    try {
      const data = await issueService.getById(Number(id));
      setIssue(data);
      // Auto scroll to bottom
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
    } catch (error) {
      console.error('Error fetching issue:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchIssue();
  }, [fetchIssue]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;
    
    setSending(true);
    try {
      await issueService.addMessage(Number(id), message);
      setMessage('');
      await fetchIssue();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-page">
        <ActivityIndicator color={THEME.colors.primary} size="large" />
      </View>
    );
  }

  if (!issue) return null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background-page"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={{ paddingTop: insets.top + 60 }} className="flex-1">
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

        {/* Header Info */}
        <View className="px-8 pb-4 border-b border-border-subtle">
           <Text className="text-[14px] font-bold text-primary uppercase tracking-widest mb-1">
             #{issue.issueId} • {t(`Issues.categories.${issue.category}`)}
           </Text>
           <Text className="text-[28px] font-bold text-text-primary tracking-tight leading-[32px] mb-2">
             {issue.title}
           </Text>
           <View className="flex-row items-center">
             <View 
                className="w-2 h-2 rounded-full mr-2" 
                style={{ backgroundColor: issue.status === 'OPEN' ? '#3B82F6' : '#10B981' }} 
             />
             <Text className="text-text-muted text-[13px] font-medium">
                {issue.status} • {issue.priority}
             </Text>
           </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4" 
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Initial Description as first "message" */}
          <View className="items-center mb-8 px-4">
             <View className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 w-full">
                <Text className="text-text-secondary text-[15px] italic leading-relaxed">
                  &quot;{issue.description}&quot;
                </Text>
                <Text className="text-[11px] text-text-muted mt-2 text-right">
                   {new Date(issue.createdAt).toLocaleString()}
                </Text>
             </View>
          </View>

          {/* Messages */}
          {issue.messages?.map((msg) => {
            const isSystem = msg.isSystem;
            const isMe = msg.senderId === issue.creatorId;

            if (isSystem) {
              return (
                <View key={msg.messageId} className="items-center my-4">
                  <View className="bg-background-subtle px-4 py-1.5 rounded-full border border-border-subtle">
                    <Text className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      {msg.content}
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <View 
                key={msg.messageId} 
                className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center mr-2 self-end">
                    <Ionicons name="person" size={16} color="#94A3B8" />
                  </View>
                )}
                <View 
                  className={`max-w-[80%] p-4 rounded-3xl ${isMe ? 'bg-primary rounded-br-none' : 'bg-white dark:bg-gray-800 border border-border-subtle rounded-bl-none'}`}
                  style={Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 } : {}}
                >
                  <Text className={`text-[15px] leading-relaxed ${isMe ? 'text-white' : 'text-text-primary'}`}>
                    {msg.content}
                  </Text>
                  <Text className={`text-[10px] mt-1.5 text-right ${isMe ? 'opacity-70 text-white' : 'text-text-muted'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Area */}
        <View 
          style={{ paddingBottom: insets.bottom + 10 }} 
          className="px-4 pt-3 bg-background-surface border-t border-border-subtle"
        >
           <View className="flex-row items-end bg-background-subtle rounded-[24px] px-4 py-2 border border-border-subtle">
              <TextInput 
                className="flex-1 min-h-[40px] max-h-[120px] py-2 text-text-primary text-[16px]"
                placeholder={t('Issues.chat.placeholder')}
                placeholderTextColor="#94A3B8"
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <TouchableOpacity 
                disabled={!message.trim() || sending}
                onPress={handleSendMessage}
                className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${message.trim() ? 'bg-primary' : 'bg-slate-200'}`}
              >
                 {sending ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="arrow-up" size={24} color="white" />}
              </TouchableOpacity>
           </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
