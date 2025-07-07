// app/tournament/[id].tsx
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Tournament } from '@/lib/types/models';
import { tournaments } from '@/lib/providers';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TournamentDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const colorScheme = useColorScheme() as 'light' | 'dark';

    useEffect(() => {
        if (id) {
            fetchTournament();
        }
    }, [id]);

    const fetchTournament = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await tournaments.getById(id);

            if (fetchError) {
                throw new Error(fetchError);
            }

            if (!data) {
                throw new Error('Torneo no encontrado');
            }

            setTournament(data);
        } catch (error) {
            console.error('Error al cargar torneo:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(errorMessage);
            Alert.alert('Error', `No se pudo cargar el torneo: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ThemedView className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
                <ThemedText className="mt-4">Cargando torneo...</ThemedText>
            </ThemedView>
        );
    }

    if (error || !tournament) {
        return (
            <ThemedView className="flex-1 justify-center items-center p-6">
                <Ionicons
                    name="alert-circle-outline"
                    size={64}
                    color={colorScheme === 'dark' ? '#EF4444' : '#DC2626'}
                />
                <ThemedText className="text-lg font-semibold mt-4 text-center">
                    Error al cargar el torneo
                </ThemedText>
                <ThemedText className="text-center mt-2 opacity-70">
                    {error || 'Torneo no encontrado'}
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
                    <ThemedText className="text-2xl font-bold flex-1">{tournament.name}</ThemedText>
                </View>

                {/* Info Cards */}
                <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
                    <ThemedText className="text-lg font-semibold mb-3">Información del Torneo</ThemedText>

                    <View className="space-y-3">
                        <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                            <ThemedText className="ml-3">
                                Inicio: {new Date(tournament.start_date).toLocaleDateString()}
                            </ThemedText>
                        </View>

                        {tournament.end_date && (
                            <View className="flex-row items-center">
                                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                                <ThemedText className="ml-3">
                                    Fin: {new Date(tournament.end_date).toLocaleDateString()}
                                </ThemedText>
                            </View>
                        )}

                        {tournament.location && (
                            <View className="flex-row items-center">
                                <Ionicons name="location-outline" size={20} color="#6B7280" />
                                <ThemedText className="ml-3">{tournament.location}</ThemedText>
                            </View>
                        )}

                        <View className="flex-row items-center">
                            <Ionicons name="trophy-outline" size={20} color="#6B7280" />
                            <ThemedText className="ml-3">Tipo: {tournament.type}</ThemedText>
                        </View>

                        <View className="flex-row items-center">
                            <Ionicons name="flag-outline" size={20} color="#6B7280" />
                            <ThemedText className="ml-3">Estado: {tournament.status}</ThemedText>
                        </View>
                    </View>
                </View>

                {tournament.description && (
                    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
                        <ThemedText className="text-lg font-semibold mb-3">Descripción</ThemedText>
                        <ThemedText className="opacity-70">{tournament.description}</ThemedText>
                    </View>
                )}

                {/* Action Buttons */}
                <View className="space-y-3">
                    <TouchableOpacity
                        className="bg-blue-600 p-4 rounded-lg flex-row items-center justify-center"
                        onPress={() => router.push(`/tournament/${id}/teams` as any)}
                    >
                        <Ionicons name="people-outline" size={20} color="white" />
                        <ThemedText className="text-white font-medium ml-2">Ver Equipos</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-green-600 p-4 rounded-lg flex-row items-center justify-center"
                        onPress={() => router.push(`/tournament/${id}/matches` as any)}
                    >
                        <Ionicons name="football-outline" size={20} color="white" />
                        <ThemedText className="text-white font-medium ml-2">Ver Partidos</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-purple-600 p-4 rounded-lg flex-row items-center justify-center"
                        onPress={() => router.push(`/tournament/${id}/standings` as any)}
                    >
                        <Ionicons name="podium-outline" size={20} color="white" />
                        <ThemedText className="text-white font-medium ml-2">Ver Clasificación</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        </ScrollView>
    );
}