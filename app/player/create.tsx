import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar formulario de registro de jugadores
// Incluir campos: nombre, posición, número, equipo

export default function CreatePlayerScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Registrar Jugador</ThemedText>
      <ThemedText>TODO: Implementar formulario de registro</ThemedText>
    </ThemedView>
  );
}
