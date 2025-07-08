import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar tabla de posiciones del torneo
// Mostrar puntos, victorias, derrotas, sets

export default function TournamentStandingsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Tabla de Posiciones</ThemedText>
      <ThemedText>TODO: Implementar tabla de posiciones del torneo #{id}</ThemedText>
    </ThemedView>
  );
}
