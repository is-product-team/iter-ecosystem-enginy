import * as React from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Dimensions, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import api from '../../../services/api';
import { Button } from '../../../components/ui/Button';
import { useColorScheme } from 'nativewind';


// ── Components ──────────────────────────────────────────────────────────────

const StarRating = ({ value = 0, onSelect }: { value?: number, onSelect: (val: number) => void }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => onSelect(star)}
          style={({ pressed }) => [
            styles.starButton,
            { 
              borderColor: value >= star ? "#007AFF" : "transparent",
              backgroundColor: value >= star ? "#007AFF" : (isDark ? "#27272a" : "white"),
              opacity: pressed ? 0.7 : 1,
              borderWidth: 2,
            }
          ]}
        >
          <Ionicons 
            name={value >= star ? "star" : "star-outline"} 
            size={28} 
            color={value >= star ? "white" : "#AEAEB2"} 
          />
        </Pressable>
      ))}
    </View>
  );
};
const ChoiceSelector = ({ options, selectedValue, onSelect }: { options: string[], selectedValue: string, onSelect: (val: string) => void }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.choiceGrid}>
      {options.map((option, index) => {
        const isSelected = selectedValue === option;
        // For a clean grid: if it's the last item and we have an odd number, make it full width
        const isFullWidth = options.length % 2 !== 0 && index === options.length - 1;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [
              styles.choiceCard,
              { 
                width: isFullWidth ? '100%' : '48%',
                backgroundColor: isSelected ? "#007AFF" : (isDark ? "#27272a" : "white"),
                borderColor: isSelected ? "#007AFF" : "transparent",
                borderWidth: 2,
                opacity: pressed ? 0.8 : 1,
              }
            ]}
          >
            <Text 
              numberOfLines={2}
              style={[
                styles.choiceCardText,
                { 
                  color: isSelected ? "#FFFFFF" : (isDark ? "#FFFFFF" : "#1C1C1E"),
                }
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

// ── Screen ──────────────────────────────────────────────────────────────────

export default function WorkshopQualityScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams(); // This is assignmentId
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [model, setModel] = React.useState<any>(null);
  const [answers, setAnswers] = React.useState<{[key: number]: any}>({});
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
        headerShown: true,
        headerTitle: '',
        headerTransparent: true,
        headerShadowVisible: false,
        headerTintColor: '#007AFF',
        headerBackTitle: t('Common.back'),
    });
  }, [navigation, t]);

  const loadQuestionnaire = React.useCallback(async () => {
    try {
        setLoading(true);
        const res = await api.get('questionnaires/models');
        console.log("🔍 [WorkshopQualityScreen] Models found:", res.data?.length);
        
        // 2. Filter for Professor (extremely inclusive search)
        const professorModel = res.data.find((m: any) => 
            m.target === 'TEACHER' || 
            m.target === 'DOCENT' || 
            m.target === 'PROFESSOR' ||
            m.name.toLowerCase().includes('teacher') ||
            m.name.toLowerCase().includes('docent') ||
            m.name.toLowerCase().includes('profesor')
        );
        
        if (professorModel) {
            const modelId = professorModel.modelId;
            const detailRes = await api.get(`questionnaires/model/${modelId}`);
            setModel(detailRes.data);
        } else {
            console.error("❌ [WorkshopQualityScreen] Teacher model not found in:", res.data);
            Alert.alert(t('Common.error'), t('Questionnaire.model_not_found'));
            router.back();
        }
    } catch (error) {
        console.error("❌ [WorkshopQualityScreen] Error fetching questionnaire:", error);
        Alert.alert(t('Common.error'), t('Questionnaire.load_error'));
    } finally {
        setLoading(false);
    }
  }, [t, router]);

  React.useEffect(() => {
    loadQuestionnaire();
  }, [loadQuestionnaire]);

  const handleSubmit = async () => {
    if (!model) return;
    const questions = model.questions;
    const missing = questions.some((p: any) => !answers[p.questionId]);

    if (missing) {
        Alert.alert(t('Questionnaire.incomplete_error'), t('Questionnaire.incomplete_message'));
        return;
    }

    setSubmitting(true);
    try {
        // Use the model target to ensure consistency with DB
        const trackRes = await api.post('questionnaires/track', {
            assignmentId: parseInt(id as string),
            target: model.target
        });
        const token = trackRes.data.token;

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
          <View className="flex-1 justify-center items-center bg-white dark:bg-black">
              <ActivityIndicator size="large" color="#007AFF" />
          </View>
      );
  }

  if (!model) return null;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <StatusBar style="auto" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
            paddingTop: insets.top + 60, 
            paddingBottom: 160, 
            paddingHorizontal: 28 
        }}
      >
        <View className="mb-10 px-2">
            <Text className="text-[40px] font-light text-black dark:text-white tracking-tight leading-[44px] mb-3">
              {t('Questionnaire.title')}
            </Text>
            <Text className="text-[16px] font-normal text-gray-500 dark:text-gray-400 leading-relaxed max-w-[90%]">
              {t('Questionnaire.instruction')}
            </Text>
        </View>

        {model.questions.map((p: any) => (
            <View key={p.questionId} className="mb-10 px-2">
                <Text className="text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">
                    {p.text}
                </Text>
                
                <View style={{ marginTop: 4 }}>
                  {p.type === 'RATING' ? (
                    <StarRating 
                      value={answers[p.questionId]} 
                      onSelect={(val) => setAnswers(prev => ({ ...prev, [p.questionId]: val }))} 
                    />
                  ) : p.type === 'TEXT' ? (
                      <TextInput
                          className="bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-3xl min-h-[160px] text-black dark:text-white text-[17px] leading-relaxed"
                          multiline
                          textAlignVertical="top"
                          placeholder={t('Questionnaire.placeholder')}
                          placeholderTextColor="#AEAEB2"
                          value={answers[p.questionId] || ''}
                          onChangeText={(txt) => setAnswers(prev => ({ ...prev, [p.questionId]: txt }))}
                          style={{ fontFamily: 'Inter_400Regular' }}
                      />
                  ) : p.type === 'SINGLE_CHOICE' ? (
                    <ChoiceSelector 
                      options={p.options || []}
                      selectedValue={answers[p.questionId]}
                      onSelect={(val) => setAnswers(prev => ({ ...prev, [p.questionId]: val }))}
                    />
                  ) : (
                      <TextInput
                          className="bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl min-h-[120px] text-black dark:text-white text-[16px] leading-relaxed"
                          multiline
                          textAlignVertical="top"
                          placeholder={t('Questionnaire.placeholder')}
                          placeholderTextColor="#AEAEB2"
                          value={answers[p.questionId] || ''}
                          onChangeText={(txt) => setAnswers(prev => ({ ...prev, [p.questionId]: txt }))}
                      />
                  )}

                </View>
            </View>
        ))}

        <View style={{ marginTop: 20 }}>
            <Button
                label={t('Questionnaire.submit_button')}
                onPress={handleSubmit}
                loading={submitting}
                className="rounded-3xl h-[64px]"
            />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  starRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  starButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: 12,
  },
  choiceCard: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  choiceCardText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 18,
  },
  submitButton: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    marginTop: 32,
    marginBottom: 60, // Ensure visibility with extra bottom padding
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  }
});
