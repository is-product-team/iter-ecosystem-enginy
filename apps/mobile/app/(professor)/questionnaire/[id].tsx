import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { THEME } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';

export default function WorkshopQualityScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams(); // This is assignmentId
  const router = useRouter();
  
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [model, setModel] = React.useState<any>(null);
  const [answers, setAnswers] = React.useState<{[key: number]: any}>({});
  
  const loadQuestionnaire = React.useCallback(async () => {
    try {
        setLoading(true);
        // 1. Fetch all models
        const res = await api.get('questionnaires/models');
        // 2. Filter for Professor
        const professorModel = res.data.find((m: any) => m.target === 'PROFESSOR');
        
        if (professorModel) {
            // 3. Fetch full details (questions)
            const modelId = professorModel.modelId;
            const detailRes = await api.get(`questionnaires/model/${modelId}`);
            setModel(detailRes.data);
        } else {
            Alert.alert(t('Common.error'), t('Questionnaire.model_not_found'));
            router.back();
        }
    } catch (error) {
        console.error("Error fetching questionnaire", error);
        Alert.alert(t('Common.error'), t('Questionnaire.load_error'));
    } finally {
        setLoading(false);
    }
  }, [t, router]);

  React.useEffect(() => {
    loadQuestionnaire();
  }, [loadQuestionnaire]);

  const handleSubmit = async () => {
    // Validate
    if (!model) return;
    const questions = model.questions;
    const missing = questions.some((p: any) => {
        const type = p.type;
        const qId = p.questionId;
        return type.startsWith('Likert') && !answers[qId];
    });

    if (missing) {
        Alert.alert(t('Questionnaire.incomplete_error'), t('Questionnaire.incomplete_message'));
        return;
    }

    setSubmitting(true);
    try {
        const trackRes = await api.post('questionnaires/track', {
            assignmentId: parseInt(id as string),
            target: 'PROFESSOR'
        });
        const token = trackRes.data.token;

        // 2. Submit responses
        const responsesPayload = Object.keys(answers).map(k => ({
            questionId: parseInt(k),
            value: String(answers[parseInt(k)])
        }));

        await api.post('questionnaires/respond', {
            token: token,
            responses: responsesPayload
        });

        Alert.alert(t('Questionnaire.thanks_title'), t('Questionnaire.thanks_message'), [
            { text: t('Common.ok'), onPress: () => router.back() }
        ]);

    } catch (error) {
        console.error("Error submitting questionnaire", error);
        Alert.alert(t('Common.error'), t('Questionnaire.submit_error'));
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
      return (
          <View className="flex-1 justify-center items-center bg-background-page">
              <ActivityIndicator size="large" color={THEME.colors.primary} />
          </View>
      );
  }

  if (!model) return null;

  const questions = model.questions;

  return (
    <View className="flex-1 bg-background-page">
      <Stack.Screen options={{ title: t('Questionnaire.title') }} />
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
            <Text className="text-xl font-bold text-text-primary mb-2">{model.name}</Text>
            <Text className="text-text-secondary">{t('Questionnaire.instruction')}</Text>
        </View>

        {questions.map((p: any) => {
            const qId = p.questionId;
            const type = p.type;
            const text = p.text;

            return (
                <View key={qId} className="mb-8 bg-background-surface p-6 rounded-2xl border border-border-subtle shadow-sm">
                    <Text className="text-base font-bold text-text-primary mb-4">{text}</Text>
                    
                    {type === 'Likert_1_5' || type === 'Likert_1_10' ? (
                    <View className="flex-row justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <TouchableOpacity
                                key={num}
                                onPress={() => setAnswers(prev => ({ ...prev, [qId]: num }))}
                                className={`flex-1 h-12 items-center justify-center rounded-xl border ${answers[qId] === num ? 'bg-[#4197CB] border-[#4197CB]' : 'bg-background-subtle border-border-subtle'}`}
                            >
                                <Text className={`font-bold text-lg ${answers[qId] === num ? 'text-white' : 'text-text-muted'}`}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                    </View> 
                    ) : (
                        <TextInput
                            className="bg-background-subtle border border-border-subtle p-4 rounded-xl min-h-[100px] text-text-primary font-medium"
                            multiline
                            textAlignVertical="top"
                            placeholder={t('Questionnaire.placeholder')}
                            placeholderTextColor={THEME.colors.gray}
                            value={answers[qId] || ''}
                            onChangeText={(txt) => setAnswers(prev => ({ ...prev, [qId]: txt }))}
                        />
                    )}
                </View>
            );
        })}

        <TouchableOpacity 
          className={`py-4 items-center mb-24 rounded-2xl ${submitting ? 'bg-background-subtle' : 'bg-[#4197CB]'}`}
          onPress={handleSubmit}
          disabled={submitting}
          style={{ 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.1, 
            shadowRadius: 10, 
            elevation: 4 
          }}
        >
          {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base uppercase tracking-wider">{t('Questionnaire.submit_button')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
