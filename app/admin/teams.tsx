import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar panel administrativo de equipos
// Crear, editar, eliminar, activar/desactivar

export default function AdminTeamsScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Gestión de Equipos</ThemedText>
      <ThemedText>TODO: Implementar panel administrativo de equipos</ThemedText>
    </ThemedView>
  );
}
