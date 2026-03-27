import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { THEME } from '@iter/shared';
import api from '../../../services/api';

export default function EvaluacionScreen() {
  const { id, id_assignacio } = useLocalSearchParams(); // id is student_id (or subscription id?)
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [ratings, setRatings] = useState<{[key: number]: number}>({});
  const [observations, setObservations] = useState('');
  
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
        setLoading(true);
        // 1. Fetch Competencies Definition
        const compRes = await api.get('evaluacions/competencies');
        setCompetencies(compRes.data);

        // 2. Fetch existing evaluation for this student/assignacio if exists
        // Assuming we evaluate an 'inscripcio'. We need to know the inscripcio ID or call by student+assignacio.
        // The previous screen passed `id` as `student.id_alumne`.
        // We might need to find the `inscripcio` id first or the backend handles it.
        // Let's assume the backend `avaluacio/inscripcio/:id` takes inscripcio ID.
        // We probably need a way to look it up. For now, let's fetch competencies first.
        
    } catch (error) {
        console.error("Error loading evaluation data", error);
        Alert.alert("Error", "No s'han pogut carregar les dades.");
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
      if (Object.keys(ratings).length < competencies.length) {
          Alert.alert("Incomplet", "Si us plau, puntua totes les competències.");
          return;
      }

      setSubmitting(true);
      try {
          // Construct payload
          const payload = {
              id_alumne: id,
              id_assignacio: id_assignacio,
              competencies: Object.keys(ratings).map(k => ({
                  id_competencia: parseInt(k),
                  puntuacio: ratings[parseInt(k)]
              })),
              observacions: observations
          };
          
          await api.post('evaluacions/upset', payload); // Adjust endpoint as needed
          
          Alert.alert("Guardat", "Avaluació guardada correctament", [
              { text: "OK", onPress: () => router.back() }
          ]);
      } catch (error) {
          console.error("Error saving evaluation", error);
          Alert.alert("Error", "No s'ha pogut guardar l'avaluació.");
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

  const technicalCompetencies = competencies.filter(c => c.tipus === 'Tecnica');
  const transversalCompetencies = competencies.filter(c => c.tipus === 'Transversal');

  const renderCompetencyBlock = (title: string, items: any[], icon: string, colorClass: string) => (
      <View className="mb-6 bg-background-surface p-5 rounded-3xl border border-border-subtle/50 shadow-sm">
        <View className="flex-row items-center mb-6 border-b border-border-subtle/30 pb-4">
          <View className={`p-3 mr-4 rounded-2xl ${colorClass}`}>
            <Ionicons name={icon as any} size={22} color={THEME.colors.primary} />
          </View>
          <Text className="text-xl font-bold text-text-primary tracking-tight flex-1">{title}</Text>
        </View>
        
        {items.map((comp) => (
            <View key={comp.id_competencia} className="mb-8 last:mb-2">
                <Text className="text-text-primary font-semibold text-base mb-4 leading-6">
                    {comp.nom}
                </Text>
                <View className="flex-row justify-between gap-3">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isSelected = ratings[comp.id_competencia] === num;
                    return (
                      <TouchableOpacity
                        key={num}
                        onPress={() => setRatings(prev => ({ ...prev, [comp.id_competencia]: num }))}
                        className={`flex-1 aspect-square items-center justify-center rounded-full border-2 shadow-sm ${isSelected ? 'bg-primary border-primary shadow-primary/30' : 'bg-background-subtle border-transparent'}`}
                      >
                        <Text className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-text-muted'}`}>{num}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
            </View>
        ))}
      </View>
  );

  return (
    <View className="flex-1 bg-background-page">
     <Stack.Screen options={{ 
        title: "Avaluació Competencial",
        headerTintColor: THEME.colors.beige,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' }, // Use transparent for NativeWind background compliance or remove entirely
        headerTransparent: true, // This allows the page background to show through 
     }} />
     <ScrollView className="flex-1 pt-24 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {renderCompetencyBlock("Competències Tècniques", technicalCompetencies, "construct", "bg-blue-500/10")}
        {renderCompetencyBlock("Competències Transversals", transversalCompetencies, "people", "bg-purple-500/10")}

        <View className="mb-8 bg-background-surface p-5 rounded-3xl border border-border-subtle/50 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="bg-orange-500/10 p-3 mr-4 rounded-2xl">
              <Ionicons name="chatbox-ellipses" size={22} color="#F97316" />
            </View>
            <Text className="text-xl font-bold text-text-primary tracking-tight">Observacions</Text>
          </View>
          <TextInput
            className="bg-background-subtle/50 border border-border-subtle p-4 rounded-2xl h-36 text-text-primary font-medium text-base leading-6"
            multiline
            placeholder="Afegeix comentaris qualitatius sobre l'evolució de l'alumne..."
            placeholderTextColor={THEME.colors.gray}
            textAlignVertical="top"
            value={observations}
            onChangeText={setObservations}
          />
        </View>

        <TouchableOpacity 
          className={`py-4 items-center mb-10 rounded-2xl shadow-lg active:opacity-90 ${submitting ? 'bg-background-subtle' : 'bg-primary'}`}
          onPress={handleSave}
          disabled={submitting}
          style={{ shadowColor: THEME.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
        >
          {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg tracking-wide">Guardar Avaluació</Text>}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
