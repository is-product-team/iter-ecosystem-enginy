import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { THEME } from '@iter/shared';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';

export default function WorkshopQualityScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams(); // This is assignmentId
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [answers, setAnswers] = useState<{[key: number]: any}>({});
  
  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const loadQuestionnaire = async () => {
    try {
        setLoading(true);
        // 1. Fetch all models
        const res = await api.get('questionnaires/models');
        // 2. Filter for Professor
        const professorModel = res.data.find((m: any) => m.target === 'PROFESSOR' || m.destinatari === 'PROFESSOR');
        
        if (professorModel) {
            // 3. Fetch full details (questions)
            const modelId = professorModel.modelId || professorModel.id_model;
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
  };

  const handleSubmit = async () => {
    // Validate
    if (!model) return;
    const questions = model.questions || model.preguntes;
    const missing = questions.some((p: any) => {
        const type = p.responseType || p.tipus_resposta;
        const qId = p.questionId || p.id_pregunta;
        return type.startsWith('Likert') && !answers[qId];
    });

    if (missing) {
        Alert.alert(t('Questionnaire.incomplete_error'), t('Questionnaire.incomplete_message'));
        return;
    }

    setSubmitting(true);
    try {
        const modelId = model.modelId || model.id_model;
        const trackRes = await api.post('questionnaires/track', {
            modelId: modelId,
            assignmentId: parseInt(id as string)
        });
        const submissionId = trackRes.data.submissionId || trackRes.data.id_enviament;

        // 2. Submit responses
        const respostesPayload = Object.keys(answers).map(k => ({
            questionId: parseInt(k),
            value: String(answers[parseInt(k)])
        }));

        await api.post('questionnaires/respond', {
            submissionId: submissionId,
            responses: respostesPayload
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

  const questions = model.questions || model.preguntes;

  return (
    <View className="flex-1 bg-background-page">
      <Stack.Screen options={{ title: t('Questionnaire.title') }} />
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
            <Text className="text-xl font-bold text-text-primary mb-2">{model.title}</Text>
            <Text className="text-text-secondary">{t('Questionnaire.instruction')}</Text>
        </View>

        {questions.map((p: any) => {
            const qId = p.questionId || p.id_pregunta;
            const type = p.responseType || p.tipus_resposta;
            const statement = p.statement || p.enunciat;

            return (
                <View key={qId} className="mb-8 bg-background-surface p-6 rounded-2xl border border-border-subtle shadow-sm">
                    <Text className="text-base font-bold text-text-primary mb-4">{statement}</Text>
                    
                    {type === 'Likert_1_5' || type === 'Likert_1_10' ? (
                    <View className="flex-row justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <TouchableOpacity
                                key={num}
                                onPress={() => setAnswers(prev => ({ ...prev, [qId]: num }))}
                                className={`flex-1 h-12 items-center justify-center rounded-xl border ${answers[qId] === num ? 'bg-primary border-primary' : 'bg-background-subtle border-border-subtle'}`}
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
          className={`py-4 items-center mb-24 rounded-2xl shadow-lg ${submitting ? 'bg-background-subtle' : 'bg-primary shadow-slate-200'}`}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base uppercase tracking-wider">{t('Questionnaire.submit_button')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
