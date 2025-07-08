import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar panel administrativo de torneos
// Crear, editar, eliminar, generar partidos

export default function AdminTournamentsScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Gestión de Torneos</ThemedText>
      <ThemedText>TODO: Implementar panel administrativo de torneos</ThemedText>
    </ThemedView>
  );
}
