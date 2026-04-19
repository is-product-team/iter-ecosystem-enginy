import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Modal, Pressable, Image, ActivityIndicator, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ISSUE_PRIORITIES, ISSUE_CATEGORIES, THEME } from '@iter/shared';
import issueService from '@/services/issueService';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import api from '@/services/api';

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
      <Ionicons name={icon} size={20} color="#4197CB" />
      <Text className="flex-1 text-text-primary text-[16px] ml-3">
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
  const colorScheme = useColorScheme();
  const tintColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<any>(ISSUE_CATEGORIES.OTHER);
  
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState<'category' | 'attachments' | null>(null);
  const [hasIssues, setHasIssues] = React.useState(false);

  React.useEffect(() => {
    issueService.getAll().then(data => {
      setHasIssues(data && data.length > 0);
    }).catch(err => console.warn("Failed to check issues", err));
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('Common.error'), 'Es necessiten permisos para accedir a la galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.6,
      allowsMultipleSelection: true,
      selectionLimit: 5 - attachments.length,
    });

    if (!result.canceled) {
      const newFiles = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || `media_${Date.now()}.${asset.mimeType?.split('/')[1] || 'jpg'}`,
        type: asset.mimeType || 'image/jpeg',
        size: asset.fileSize || 0
      }));
      setAttachments([...attachments, ...newFiles]);
    }
    setModalVisible(null);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
      });

      if (!result.canceled) {
        const newFiles = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/pdf',
          size: asset.size || 0
        }));
        setAttachments([...attachments, ...newFiles]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
    setModalVisible(null);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(t('Common.error'), t('Auth.login.fill_all_fields'));
      return;
    }

    setSubmitting(true);
    try {
      let centerId = 0;
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        const user = JSON.parse(userData);
        centerId = user.centerId || 0;
      }

      // 1. Upload Files first
      let uploadedFiles = [];
      if (attachments.length > 0) {
        const formData = new FormData();
        attachments.forEach((file) => {
          // @ts-ignore
          formData.append('files', {
            uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
            name: file.name,
            type: file.type,
          });
        });

        const uploadRes = await api.post('/upload/multimedia', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedFiles = uploadRes.data.files;
      }

      // 2. Create issue
      await issueService.create({
        title,
        description,
        category,
        priority: ISSUE_PRIORITIES.MEDIUM,
        centerId,
        attachments: uploadedFiles
      });

      Alert.alert(t('Common.success'), t('Issues.create_success'));
      router.back();
    } catch (error) {
      console.error('Error creating issue:', error);
      Alert.alert(t('Common.error'), 'No s\'ha pogut crear la incidència.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderModal = () => {
    if (!modalVisible) return null;
    
    const isCategory = modalVisible === 'category';
    
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
            <Text className="text-xl font-bold text-text-primary mb-6 text-center">
              {isCategory ? t('Issues.form.category') : 'Afegir Multimedia'}
            </Text>
            
            {isCategory ? (
              Object.values(ISSUE_CATEGORIES).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setCategory(cat);
                    setModalVisible(null);
                  }}
                  className="flex-row items-center py-4 border-b border-border-subtle"
                >
                  <Text className={`flex-1 text-[17px] ${ category === cat ? "text-primary font-bold" : "text-text-primary"}`}>
                    {t(`Issues.categories.${cat}`)}
                  </Text>
                  {category === cat && (
                    <Ionicons name="checkmark-circle" size={24} color={THEME.colors.primary} />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View className="flex-row justify-around py-4">
                 <TouchableOpacity onPress={pickImage} className="items-center">
                    <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-2">
                       <Ionicons name="image" size={30} color={THEME.colors.primary} />
                    </View>
                    <Text className="text-[12px] font-bold text-text-primary">Galeria</Text>
                 </TouchableOpacity>

                 <TouchableOpacity onPress={pickDocument} className="items-center">
                    <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-2">
                       <Ionicons name="document-text" size={30} color="#EF4444" />
                    </View>
                    <Text className="text-[12px] font-bold text-text-primary">PDF</Text>
                 </TouchableOpacity>
              </View>
            )}
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
            headerTintColor: tintColor,
            headerRight: () => hasIssues ? (
              <TouchableOpacity 
                onPress={() => router.push('/(professor)/issue')}
                className="mr-2 flex-row items-center p-2"
                activeOpacity={0.7}
              >
                <Text 
                  style={{ color: tintColor }}
                  className="text-[17px] font-normal mr-1"
                >
                  {t('Issues.view_all')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={tintColor} />
              </TouchableOpacity>
            ) : null,
          }} 
        />
        
        <View className="px-8 pb-6">
           <Text className="text-[16px] font-normal text-gray-500 dark:text-gray-400 mb-2 tracking-tight">
             {t('Issues.new')}
           </Text>
           <Text className="text-[38px] font-light text-black dark:text-white tracking-tighter leading-[42px]">
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
            <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
              {t('Issues.form.title')} *
            </Text>
            <TextInput 
              className="bg-white dark:bg-gray-800 border border-border-subtle rounded-2xl px-6 py-5 text-text-primary text-[17px] shadow-sm font-medium"
              placeholder="Ex: Problema amb el material..."
              placeholderTextColor="#475569"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Category Selector */}
          <SelectorField 
            label={t('Issues.form.category')}
            value={t(`Issues.categories.${category}`)}
            icon="apps-outline"
            onPress={() => setModalVisible('category')}
          />

          {/* Description Input */}
          <View className="mb-8">
            <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
              {t('Issues.form.description')} *
            </Text>
            <TextInput 
              className="bg-white dark:bg-gray-800 border border-border-subtle rounded-[24px] px-6 py-5 text-text-primary text-[17px] min-h-[180px] shadow-sm leading-relaxed"
              placeholder="Explica'ns què ha passat amb detall..."
              placeholderTextColor="#475569"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Multimedia Section */}
          <View className="mb-10">
             <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Multimedia</Text>
                <TouchableOpacity 
                   onPress={() => setModalVisible('attachments')}
                   disabled={attachments.length >= 5}
                   className="flex-row items-center gap-1"
                >
                   <Ionicons name="add-circle-outline" size={18} color={attachments.length >= 5 ? '#CBD5E1' : '#4197CB'} />
                   <Text className={`text-[12px] font-bold ${attachments.length >= 5 ? 'text-gray-300' : 'text-primary'}`}>Afegir</Text>
                </TouchableOpacity>
             </View>

             {attachments.length === 0 ? (
               <TouchableOpacity 
                 onPress={() => setModalVisible('attachments')}
                 className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-border-subtle rounded-3xl py-10 items-center justify-center"
               >
                  <Ionicons name="cloud-upload-outline" size={32} color="#CBD5E1" />
                  <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">Adjuntar proves (opcional)</Text>
               </TouchableOpacity>
             ) : (
               <View className="flex-row flex-wrap gap-3">
                  {attachments.map((file, idx) => (
                    <View key={idx} className="relative w-[100px] h-[100px] bg-white dark:bg-gray-800 rounded-2xl border border-border-subtle overflow-hidden shadow-sm">
                       {file.type.startsWith('image/') ? (
                         <Image source={{ uri: file.uri }} className="w-full h-full" />
                       ) : (
                         <View className="w-full h-full items-center justify-center p-2">
                            <Ionicons name={file.type.includes('pdf') ? 'document-text' : 'videocam'} size={32} color="#4197CB" />
                            <Text className="text-[9px] font-bold text-text-muted mt-1 text-center truncate w-full px-1">{file.name}</Text>
                         </View>
                       )}
                       <TouchableOpacity 
                         onPress={() => removeAttachment(idx)}
                         className="absolute -top-1 -right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white shadow-sm"
                       >
                          <Ionicons name="close" size={14} color="white" />
                       </TouchableOpacity>
                    </View>
                  ))}
               </View>
             )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
            className={`w-full py-5 rounded-2xl items-center justify-center shadow-lg ${submitting ? 'bg-slate-300' : 'bg-primary'}`}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg uppercase tracking-widest">
                {t('Issues.form.submit')}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
      {renderModal()}
    </KeyboardAvoidingView>
  );
}
