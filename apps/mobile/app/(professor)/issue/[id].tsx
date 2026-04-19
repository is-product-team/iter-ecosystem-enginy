import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Modal, Pressable, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import issueService, { Issue } from '@/services/issueService';
import api from '@/services/api';
import { THEME } from '@iter/shared';
import * as ExpoConstants from 'expo-constants';

const Constants = ExpoConstants.default || ExpoConstants;
const API_URL = Constants.expoConfig?.extra?.apiUrl;

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const colorScheme = useColorScheme();
  const tintColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  const [issue, setIssue] = React.useState<Issue | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const [selectedFiles, setSelectedFiles] = React.useState<any[]>([]);
  const [attachmentModalVisible, setAttachmentModalVisible] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const fetchIssue = React.useCallback(async () => {
    try {
      const data = await issueService.getById(Number(id));
      setIssue(data);
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.6,
      allowsMultipleSelection: true,
      selectionLimit: 5 - selectedFiles.length,
    });

    if (!result.canceled) {
      const newFiles = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || `chat_media_${Date.now()}.${asset.mimeType?.split('/')[1] || 'jpg'}`,
        type: asset.mimeType || 'image/jpeg',
      }));
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
    setAttachmentModalVisible(false);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: true,
    });

    if (!result.canceled) {
      const newFiles = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/pdf',
      }));
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
    setAttachmentModalVisible(false);
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && selectedFiles.length === 0) || sending) return;

    setSending(true);
    try {
      let uploadedFiles = [];

      // 1. Upload attachments if any
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
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

      // 2. Send Message
      await issueService.addMessage(Number(id), message || 'Adjunt multimedia', uploadedFiles);

      setMessage('');
      setSelectedFiles([]);
      await fetchIssue();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const openFile = async (url: string, type: string) => {
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    if (type.startsWith('image/')) {
      setPreviewImage(fullUrl);
    } else {
      await WebBrowser.openBrowserAsync(fullUrl);
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

  const renderAttachments = (attachments: any[]) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <View className="flex-row flex-wrap gap-2 mt-2">
        {attachments.map((att, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => openFile(att.fileUrl, att.fileType)}
            className="w-20 h-20 bg-background-subtle rounded-xl overflow-hidden border border-border-subtle items-center justify-center"
          >
            {att.fileType.startsWith('image/') ? (
              <Image source={{ uri: att.fileUrl.startsWith('http') ? att.fileUrl : `${API_URL}${att.fileUrl}` }} className="w-full h-full" />
            ) : (
              <Ionicons name={att.fileType.includes('pdf') ? 'document-text' : 'videocam'} size={32} color="#4197CB" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
            headerTintColor: tintColor,
          }}
        />

        {/* Header Info (Minimalist) */}
        <View className="px-8 pb-4 pt-2">
           <View className="flex-row items-center mb-1">
              <View 
                className="w-2 h-2 rounded-full mr-2" 
                style={{ backgroundColor: issue.status === 'OPEN' ? '#4197CB' : '#10B981' }} 
              />
              <Text className="text-text-muted text-[11px] font-bold uppercase tracking-widest">
                {issue.status} • #{issue.issueId}
              </Text>
           </View>
           <Text className="text-[32px] font-bold text-text-primary tracking-tight leading-[36px] mb-2">
             {issue.title}
           </Text>
           <Text className="text-[14px] font-medium text-text-muted">
              {t(`Issues.categories.${issue.category}`)} • {issue.center?.name}
           </Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Messages */}
          {issue.messages?.map((msg) => {
            const isSystem = msg.isSystem;
            const isMe = msg.senderId === issue.creatorId;

            if (isSystem) {
              return (
                <View key={msg.messageId} className="items-center my-6">
                  <Text className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">
                    {msg.content}
                  </Text>
                </View>
              );
            }

            return (
              <View
                key={msg.messageId}
                className={`mb-6 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <View className="w-8 h-8 rounded-full bg-background-subtle items-center justify-center mr-2 self-end border border-border-subtle/30">
                    <Ionicons name="person" size={14} color={tintColor} />
                  </View>
                )}
                <View
                  className={`max-w-[85%] p-4 rounded-[28px] ${isMe ? 'bg-primary rounded-br-none shadow-sm' : 'bg-background-surface border border-border-subtle/20 rounded-bl-none shadow-sm'}`}
                >
                  <Text className={`text-[15px] leading-relaxed font-medium ${isMe ? 'text-white' : 'text-text-primary'}`}>
                    {msg.content}
                  </Text>
                  
                  {renderAttachments(msg.attachments as any[])}

                  <Text className={`text-[9px] mt-2 text-right uppercase font-bold tracking-widest opacity-30 ${isMe ? 'text-white' : 'text-text-muted'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Selected Files Row */}
        {selectedFiles.length > 0 && (
          <View className="bg-background-surface border-t border-border-subtle p-3 flex-row gap-2">
            {selectedFiles.map((file, idx) => (
              <View key={idx} className="relative w-14 h-14 bg-background-subtle rounded-xl border border-border-subtle overflow-hidden">
                {file.type.startsWith('image/') ? (
                  <Image source={{ uri: file.uri }} className="w-full h-full" />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Ionicons name={file.type.includes('pdf') ? 'document-text' : 'videocam'} size={20} color="#4197CB" />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Input Area */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          className="px-4 pt-3 bg-background-surface border-t border-border-subtle"
        >
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setAttachmentModalVisible(true)}
              className="w-11 h-11 bg-background-subtle rounded-full items-center justify-center border border-border-subtle"
            >
              <Ionicons name="add" size={24} color="#4197CB" />
            </TouchableOpacity>

            <View className="flex-1 flex-row items-center bg-background-subtle rounded-[24px] px-4 py-1 border border-border-subtle">

              <TextInput
                className="flex-1 min-h-[42px] max-h-[120px] py-2 text-text-primary text-[16px] font-medium"
                placeholder={t('Issues.chat.placeholder')}
                placeholderTextColor="#94A3B8"
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <TouchableOpacity
                disabled={(!message.trim() && selectedFiles.length === 0) || sending}
                onPress={handleSendMessage}
                className={`ml-2 w-9 h-9 rounded-full items-center justify-center ${(message.trim() || selectedFiles.length > 0) ? 'bg-primary' : 'bg-slate-200'}`}
              >
                {sending ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="arrow-up" size={22} color="white" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Attachment Modal */}
      <Modal visible={attachmentModalVisible} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setAttachmentModalVisible(false)}>
          <View className="bg-background-surface rounded-t-[32px] p-8 pb-12">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />
            <Text className="text-xl font-bold text-text-primary mb-8 text-center uppercase tracking-widest">Enviar Adjunt</Text>
            <View className="flex-row justify-around">
              <TouchableOpacity onPress={pickImage} className="items-center">
                <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-3">
                  <Ionicons name="images" size={28} color={THEME.colors.primary} />
                </View>
                <Text className="text-[13px] font-bold text-text-primary">Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={pickDocument} className="items-center">
                <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-3">
                  <Ionicons name="document-attach" size={28} color="#EF4444" />
                </View>
                <Text className="text-[13px] font-bold text-text-primary">Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Image Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <Pressable className="flex-1 bg-black/95 items-center justify-center" onPress={() => setPreviewImage(null)}>
          {previewImage && <Image source={{ uri: previewImage }} className="w-full h-[80%] shrink-0" resizeMode="contain" />}
          <TouchableOpacity
            onPress={() => setPreviewImage(null)}
            className="absolute top-12 right-6 w-10 h-10 bg-white/10 rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
