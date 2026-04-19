import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ISSUE_PRIORITIES, ISSUE_CATEGORIES, THEME } from '@iter/shared';
import issueService from '@/services/issueService';

// Custom Selection Component
const SelectorField = ({ label, value, onPress, icon }: any) => (
  <View className="mb-6">
    <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
      {label}
    </Text>
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-white dark:bg-gray-800 border border-border-subtle rounded-2xl px-5 py-4 shadow-sm"
    >
      <Ionicons name={icon} size={20} color="#4197CB" className="mr-3" />
      <Text className="flex-1 text-text-primary text-[16px] ml-2">
        {value}
      </Text>
      <Ionicons name="chevron-down" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  </View>
);

export default function NewIssueScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<any>(ISSUE_CATEGORIES.OTHER);
  const [priority, setPriority] = React.useState<any>(ISSUE_PRIORITIES.MEDIUM);
  
  const [submitting, setSubmitting] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState<'category' | 'priority' | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(t('Common.error'), t('Auth.login.fill_all_fields'));
      return;
    }

    setSubmitting(true);
    try {
      let centerId = 0;
      try {
        const userData = await SecureStore.getItemAsync('user');
        if (userData) {
          const user = JSON.parse(userData);
          centerId = user.centerId || 0;
        }
      } catch (e) {
        console.warn('Error reading user centerId:', e);
      }

      await issueService.create({
        title,
        description,
        category,
        priority,
        centerId,
      });
      router.back();
    } catch (error) {
      console.error('Error creating issue:', error);
      Alert.alert(t('Common.error'), t('Common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderModal = () => {
    const isCategory = modalVisible === 'category';
    const options = isCategory 
      ? Object.values(ISSUE_CATEGORIES).map(cat => ({ label: t(`Issues.categories.${cat}`), value: cat }))
      : Object.values(ISSUE_PRIORITIES).map(p => ({ label: p, value: p }));

    return (
      <Modal
        visible={!!modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(null)}
      >
        <Pressable 
          className="flex-1 bg-black/40 justify-end" 
          onPress={() => setModalVisible(null)}
        >
          <View className="bg-background-surface rounded-t-[32px] p-8 pb-12 shadow-2xl">
            <View className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full self-center mb-6" />
            <Text className="text-xl font-bold text-text-primary mb-6">
              {isCategory ? t('Issues.form.category') : t('Issues.form.priority')}
            </Text>
            
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  if (isCategory) setCategory(opt.value);
                  else setPriority(opt.value);
                  setModalVisible(null);
                }}
                className="flex-row items-center py-4 border-b border-border-subtle"
              >
                <Text className={`flex-1 text-[17px] ${ (isCategory ? category : priority) === opt.value ? "text-primary font-bold" : "text-text-primary"}`}>
                  {opt.label}
                </Text>
                {(isCategory ? category : priority) === opt.value && (
                  <Ionicons name="checkmark-circle" size={24} color={THEME.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background-page"
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
        
        <View className="px-8 pb-6">
           <Text className="text-[16px] font-normal text-gray-500 dark:text-gray-400 mb-2">
             {t('Issues.new')}
           </Text>
           <Text className="text-[38px] font-light text-black dark:text-white tracking-tight leading-[42px]">
             {t('Issues.form.submit')}
           </Text>
        </View>

        <ScrollView 
          className="flex-1 px-8" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Title Input */}
          <View className="mb-6">
            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              {t('Issues.form.title')} *
            </Text>
            <TextInput 
              className="bg-white dark:bg-gray-800 border border-border-subtle rounded-2xl px-5 py-4 text-text-primary text-[16px] shadow-sm"
              placeholder="Ex: Problema amb el material..."
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Selectors */}
          <SelectorField 
            label={t('Issues.form.category')}
            value={t(`Issues.categories.${category}`)}
            icon="apps-outline"
            onPress={() => setModalVisible('category')}
          />

          <SelectorField 
            label={t('Issues.form.priority')}
            value={priority}
            icon="flag-outline"
            onPress={() => setModalVisible('priority')}
          />

          {/* Description Input */}
          <View className="mb-8">
            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
              {t('Issues.form.description')} *
            </Text>
            <TextInput 
              className="bg-white dark:bg-gray-800 border border-border-subtle rounded-[24px] px-5 py-4 text-text-primary text-[16px] min-h-[150px] shadow-sm"
              placeholder={t('Issues.chat.placeholder')}
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
            className={`w-full py-5 rounded-2xl items-center justify-center shadow-lg ${submitting ? 'bg-slate-300' : 'bg-primary'}`}
          >
            <Text className="text-white font-bold text-lg uppercase tracking-widest">
              {submitting ? t('Common.loading') : t('Issues.form.submit')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      {renderModal()}
    </KeyboardAvoidingView>
  );
}
