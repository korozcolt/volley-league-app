import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar panel administrativo de usuarios
// Gestionar roles, permisos, activar/desactivar

export default function AdminUsersScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Gestión de Usuarios</ThemedText>
      <ThemedText>TODO: Implementar panel administrativo de usuarios</ThemedText>
    </ThemedView>
  );
}
