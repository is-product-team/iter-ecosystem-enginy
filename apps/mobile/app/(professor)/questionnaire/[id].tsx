import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { THEME } from '@iter/shared';
import api from '../../../services/api';

export default function WorkshopQualityScreen() {
  const { id } = useLocalSearchParams(); // This is id_assignacio
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
        const res = await api.get('questionaris/models');
        // 2. Filter for Professor
        const professorModel = res.data.find((m: any) => m.destinatari === 'PROFESSOR');
        
        if (professorModel) {
            // 3. Fetch full details (questions)
            const detailRes = await api.get(`questionaris/model/${professorModel.id_model}`);
            setModel(detailRes.data);
        } else {
            Alert.alert("Error", "No s'ha trobat el model de qüestionari.");
            router.back();
        }
    } catch (error) {
        console.error("Error fetching questionnaire", error);
        Alert.alert("Error", "No s'ha pogut carregar el qüestionari.");
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (!model) return;
    const missing = model.preguntes.some((p: any) => p.tipus_resposta.startsWith('Likert') && !answers[p.id_pregunta]);
    if (missing) {
        Alert.alert("Incomplet", "Si us plau, respon totes les preguntes de valoració.");
        return;
    }

    setSubmitting(true);
    try {
        // 1. Track shipment (create 'enviament' if not exists, or just direct submit).
        // API submitRespostes expects 'enviamentId'.
        // We first need to 'track' or ensure an enviament exists for this assignacio.
        // Or we might need an endpoint that handles both.
        // Let's check `questionari.controller.ts`. `trackEnviament` returns an enviament.
        
        const trackRes = await api.post('questionaris/track', {
            modelId: model.id_model,
            assignacioId: parseInt(id as string)
        });
        const enviamentId = trackRes.data.id_enviament;

        // 2. Submit responses
        const respostesPayload = Object.keys(answers).map(k => ({
            id_pregunta: parseInt(k),
            valor: String(answers[parseInt(k)])
        }));

        await api.post('questionaris/respond', {
            enviamentId: enviamentId,
            respostes: respostesPayload
        });

        Alert.alert("Gràcies", "La teva valoració s'ha enviat correctament.", [
            { text: "Tornar", onPress: () => router.back() }
        ]);

    } catch (error) {
        console.error("Error submitting questionnaire", error);
        Alert.alert("Error", "No s'ha pogut enviar el qüestionari.");
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

  return (
    <View className="flex-1 bg-background-page">
      <Stack.Screen options={{ title: "Valoració del Taller" }} />
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
            <Text className="text-xl font-bold text-text-primary mb-2">{model.titol}</Text>
            <Text className="text-text-secondary">Si us plau, valora els següents aspectes del taller realitzat.</Text>
        </View>

        {model.preguntes.map((p: any) => (
            <View key={p.id_pregunta} className="mb-8 bg-background-surface p-6 rounded-2xl border border-border-subtle shadow-sm">
                <Text className="text-base font-bold text-text-primary mb-4">{p.enunciat}</Text>
                
                {p.tipus_resposta === 'Likert_1_5' || p.tipus_resposta === 'Likert_1_10' ? (
                   <View className="flex-row justify-between gap-2">
                       {[1, 2, 3, 4, 5].map((num) => (
                           <TouchableOpacity
                               key={num}
                               onPress={() => setAnswers(prev => ({ ...prev, [p.id_pregunta]: num }))}
                               className={`flex-1 h-12 items-center justify-center rounded-xl border ${answers[p.id_pregunta] === num ? 'bg-primary border-primary' : 'bg-background-subtle border-border-subtle'}`}
                           >
                               <Text className={`font-bold text-lg ${answers[p.id_pregunta] === num ? 'text-white' : 'text-text-muted'}`}>{num}</Text>
                           </TouchableOpacity>
                       ))}
                   </View> 
                ) : (
                    <TextInput
                        className="bg-background-subtle border border-border-subtle p-4 rounded-xl min-h-[100px] text-text-primary font-medium"
                        multiline
                        textAlignVertical="top"
                        placeholder="Escriu la teva resposta..."
                        placeholderTextColor={THEME.colors.gray}
                        value={answers[p.id_pregunta] || ''}
                        onChangeText={(txt) => setAnswers(prev => ({ ...prev, [p.id_pregunta]: txt }))}
                    />
                )}
            </View>
        ))}

        <TouchableOpacity 
          className={`py-4 items-center mb-24 rounded-2xl shadow-lg ${submitting ? 'bg-background-subtle' : 'bg-primary shadow-slate-200'}`}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base uppercase tracking-wider">Enviar Valoració</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
