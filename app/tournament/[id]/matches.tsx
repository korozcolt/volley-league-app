import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar vista de partidos del torneo
// Incluir calendario, resultados, brackets

export default function TournamentMatchesScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Partidos del Torneo</ThemedText>
      <ThemedText>TODO: Implementar vista de partidos del torneo #{id}</ThemedText>
    </ThemedView>
  );
}
