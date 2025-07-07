// app/team/[id].tsx
import { ActivityIndicator, Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Team } from '@/lib/types/models';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { teams } from '@/lib/providers';
import { useAuth } from '@/lib/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, userDetails } = useAuth();
  const colorScheme = useColorScheme() as 'light' | 'dark';

  useEffect(() => {
    if (id) {
      fetchTeam();
    }
  }, [id]);

  const fetchTeam = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await teams.getById(id);

      if (fetchError) {
        throw new Error(fetchError);
      }

      if (!data) {
        throw new Error('Equipo no encontrado');
      }

      setTeam(data);
    } catch (error) {
      console.error('Error al cargar equipo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isTeamManager = team?.manager_id === userDetails?.id;
  const canEdit = isAdmin || isTeamManager;

  if (loading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <ThemedText className="mt-4">Cargando equipo...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !team) {
    return (
      <ThemedView className="flex-1 justify-center items-center p-6">
        <Ionicons 
          name="alert-circle-outline" 
          size={64} 
          color={colorScheme === 'dark' ? '#EF4444' : '#DC2626'} 
        />
        <ThemedText className="text-lg font-semibold mt-4 text-center">
          Error al cargar el equipo
        </ThemedText>
        <ThemedText className="text-center mt-2 opacity-70">
          {error || 'Equipo no encontrado'}
        </ThemedText>
        <TouchableOpacity
          className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <ThemedText className="text-white font-medium">Volver</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ThemedView className="p-6">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#FFF' : '#000'} />
          </TouchableOpacity>
          <ThemedText className="text-2xl font-bold flex-1">{team.name}</ThemedText>
          {canEdit() && (
            <TouchableOpacity
              onPress={() => router.push(`/team/${id}/edit` as any)}
              className="ml-4"
            >
              <Ionicons name="create-outline" size={24} color="#4a90e2" />
            </TouchableOpacity>
          )}
        </View>

        {/* Team Info Card */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            {team.logo_url ? (
              <Image 
                source={{ uri: team.logo_url }} 
                className="w-16 h-16 rounded-full mr-4"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 mr-4 items-center justify-center">
                <Ionicons name="shield-outline" size={32} color="#6B7280" />
              </View>
            )}
            
            <View className="flex-1">
              <ThemedText className="text-xl font-bold">{team.name}</ThemedText>
              <View className={`px-2 py-1 rounded mt-1 self-start ${
                team.active ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <ThemedText className={`text-xs font-medium ${
                  team.active ? 'text-green-800' : 'text-red-800'
                }`}>
                  {team.active ? 'Activo' : 'Inactivo'}
                </ThemedText>
              </View>
              {team.verified && (
                <View className="bg-blue-100 px-2 py-1 rounded mt-1 self-start">
                  <ThemedText className="text-xs font-medium text-blue-800">
                    ✓ Verificado
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Contact Info */}
          <View className="space-y-3">
            {team.coach_name && (
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <ThemedText className="ml-3">Entrenador: {team.coach_name}</ThemedText>
              </View>
            )}
            
            {team.contact_email && (
              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <ThemedText className="ml-3">{team.contact_email}</ThemedText>
              </View>
            )}
            
            {team.contact_phone && (
              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <ThemedText className="ml-3">{team.contact_phone}</ThemedText>
              </View>
            )}
            
            {team.manager && (
              <View className="flex-row items-center">
                <Ionicons name="briefcase-outline" size={20} color="#6B7280" />
                <ThemedText className="ml-3">Manager: {team.manager.full_name}</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-lg flex-row items-center justify-center"
            onPress={() => router.push(`/team/${id}/players` as any)}
          >
            <Ionicons name="people-outline" size={20} color="white" />
            <ThemedText className="text-white font-medium ml-2">Ver Jugadores</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-600 p-4 rounded-lg flex-row items-center justify-center"
            onPress={() => router.push(`/team/${id}/matches` as any)}
          >
            <Ionicons name="football-outline" size={20} color="white" />
            <ThemedText className="text-white font-medium ml-2">Ver Partidos</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-purple-600 p-4 rounded-lg flex-row items-center justify-center"
            onPress={() => router.push(`/team/${id}/tournaments` as any)}
          >
            <Ionicons name="trophy-outline" size={20} color="white" />
            <ThemedText className="text-white font-medium ml-2">Ver Torneos</ThemedText>
          </TouchableOpacity>

          {canEdit() && (
            <TouchableOpacity
              className="bg-orange-600 p-4 rounded-lg flex-row items-center justify-center"
              onPress={() => router.push(`/player/create?teamId=${id}` as any)}
            >
              <Ionicons name="person-add-outline" size={20} color="white" />
              <ThemedText className="text-white font-medium ml-2">Agregar Jugador</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Card */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4 shadow-sm">
          <ThemedText className="text-lg font-semibold mb-3">Estadísticas</ThemedText>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <ThemedText className="text-2xl font-bold text-blue-600">0</ThemedText>
              <ThemedText className="text-sm text-gray-500">Jugadores</ThemedText>
            </View>
            <View className="items-center flex-1">
              <ThemedText className="text-2xl font-bold text-green-600">0</ThemedText>
              <ThemedText className="text-sm text-gray-500">Partidos</ThemedText>
            </View>
            <View className="items-center flex-1">
              <ThemedText className="text-2xl font-bold text-purple-600">0</ThemedText>
              <ThemedText className="text-sm text-gray-500">Torneos</ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}