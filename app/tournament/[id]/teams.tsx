import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar lista de equipos del torneo
// Incluir opciones de inscripción/desinscripción para admins

export default function TournamentTeamsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Equipos del Torneo</ThemedText>
      <ThemedText>TODO: Implementar gestión de equipos del torneo #{id}</ThemedText>
    </ThemedView>
  );
}
