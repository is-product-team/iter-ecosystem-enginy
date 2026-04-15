import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { THEME } from '@iter/shared';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function SupportChatScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = React.useState('');

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
        
        {/* Apple-style Large Header */}
        <View className="px-8 pb-6">
           <Text className="text-[16px] font-normal text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
             {t('Support.direct_contact')}
           </Text>
           <Text className="text-[44px] font-light text-black dark:text-white tracking-tight leading-[48px]">
             {t('Support.title')}
           </Text>
        </View>

        <ScrollView 
          className="flex-1 px-6" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Support Info Card */}
          <View className="bg-white dark:bg-gray-800 p-6 rounded-[24px] mb-8 shadow-sm border border-border-subtle">
            <View className="flex-row items-center mb-4">
               <View className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="chatbubbles" size={24} color="#FF9500" />
               </View>
               <View>
                  <Text className="text-text-primary font-bold text-lg">{t('Support.chat_admin')}</Text>
                  <Text className="text-text-muted text-sm">{t('Common.coming_soon')}</Text>
               </View>
            </View>
            <Text className="text-text-secondary leading-relaxed">
              {t('Coordination.group_chat_instruction')}
            </Text>
          </View>

          {/* Placeholder for chat history */}
          <View className="items-center py-20">
             <View className="w-20 h-20 bg-background-subtle rounded-full items-center justify-center mb-4">
                <Ionicons name="chatbubble-ellipses-outline" size={40} color="#CBD5E1" />
             </View>
             <Text className="text-slate-400 font-medium text-center px-10">
                Encara no hi ha cap conversa activa amb l'administració.
             </Text>
          </View>
        </ScrollView>

        {/* Input Area (Placeholder) */}
        <View 
          style={{ paddingBottom: insets.bottom + 20 }} 
          className="px-6 pt-4 bg-background-surface border-t border-border-subtle"
        >
           <View className="flex-row items-center bg-background-subtle rounded-2xl px-4 py-2 border border-border-subtle">
              <TextInput 
                className="flex-1 py-2 text-text-primary text-[16px]"
                placeholder="Escriu un missatge..."
                placeholderTextColor="#94A3B8"
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <TouchableOpacity 
                disabled={!message.trim()}
                className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${message.trim() ? 'bg-primary' : 'bg-slate-200'}`}
              >
                 <Ionicons name="arrow-up" size={24} color="white" />
              </TouchableOpacity>
           </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
