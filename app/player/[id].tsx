import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar perfil de jugador con estadísticas
// Referencia: Usar PlayerStats component cuando esté extraído

export default function PlayerDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Jugador #{id}</ThemedText>
      <ThemedText>TODO: Implementar perfil y estadísticas del jugador</ThemedText>
    </ThemedView>
  );
}
