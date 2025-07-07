// app/tournament/create.tsx
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { TournamentStatus, TournamentType } from '@/lib/types/models';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { tournaments } from '@/lib/providers';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useState } from 'react';

export default function CreateTournamentScreen() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        type: TournamentType.POINTS,
        status: TournamentStatus.UPCOMING,
        teams_to_qualify: null as number | null,
    });

    const [loading, setLoading] = useState(false);
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const handleCreate = async () => {
        // Validaciones básicas
        if (!formData.name.trim()) {
            Alert.alert('Error', 'El nombre del torneo es obligatorio');
            return;
        }

        if (!formData.start_date) {
            Alert.alert('Error', 'La fecha de inicio es obligatoria');
            return;
        }

        try {
            setLoading(true);

            const { data, error } = await tournaments.create({
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                start_date: formData.start_date,
                end_date: formData.end_date || null,
                location: formData.location.trim() || null,
                type: formData.type,
                status: formData.status,
                teams_to_qualify: formData.teams_to_qualify,
            });

            if (error || !data) {
                throw new Error(error || 'Error creando torneo');
            }

            Alert.alert(
                'Éxito',
                'Torneo creado correctamente',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error creating tournament:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            Alert.alert('Error', `No se pudo crear el torneo: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
            <ThemedView className="p-6">
                {/* Header */}
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#FFF' : '#000'} />
                    </TouchableOpacity>
                    <ThemedText className="text-2xl font-bold flex-1">Crear Torneo</ThemedText>
                </View>

                {/* Form */}
                <View className="space-y-4">
                    {/* Nombre */}
                    <View>
                        <ThemedText className="text-sm font-medium mb-2">Nombre del Torneo *</ThemedText>
                        <TextInput
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            placeholder="Ingresa el nombre del torneo"
                            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                        />
                    </View>

                    {/* Descripción */}
                    <View>
                        <ThemedText className="text-sm font-medium mb-2">Descripción</ThemedText>
                        <TextInput
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                            value={formData.description}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                            placeholder="Descripción del torneo (opcional)"
                            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Fecha de inicio */}
                    <View>
                        <ThemedText className="text-sm font-medium mb-2">Fecha de Inicio *</ThemedText>
                        <TextInput
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                            value={formData.start_date}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, start_date: text }))}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                        />
                    </View>

                    {/* Fecha de fin */}
                    <View>
                        <ThemedText className="text-sm font-medium mb-2">Fecha de Fin</ThemedText>
                        <TextInput
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                            value={formData.end_date}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, end_date: text }))}
                            placeholder="YYYY-MM-DD (opcional)"
                            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                        />
                    </View>

                    {/* Ubicación */}
                    <View>
                        <ThemedText className="text-sm font-medium mb-2">Ubicación</ThemedText>
                        <TextInput
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                            value={formData.location}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                            placeholder="Lugar donde se realizará el torneo"
                            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                        />
                    </View>

                    {/* Equipos a clasificar */}
                    <View>
                        <ThemedText className="text-sm font-medium mb-2">Equipos a Clasificar</ThemedText>
                        <TextInput
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                            value={formData.teams_to_qualify?.toString() || ''}
                            onChangeText={(text) => {
                                const num = parseInt(text);
                                setFormData(prev => ({
                                    ...prev,
                                    teams_to_qualify: isNaN(num) ? null : num
                                }));
                            }}
                            placeholder="Número de equipos que clasificarán (opcional)"
                            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Botones */}
                <View className="flex-row space-x-3 mt-8">
                    <TouchableOpacity
                        className="flex-1 bg-gray-300 dark:bg-gray-700 p-4 rounded-lg"
                        onPress={() => router.back()}
                        disabled={loading}
                    >
                        <ThemedText className="text-center font-medium">Cancelar</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`flex-1 p-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-600'
                            }`}
                        onPress={handleCreate}
                        disabled={loading}
                    >
                        <ThemedText className="text-white text-center font-medium">
                            {loading ? 'Creando...' : 'Crear Torneo'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        </ScrollView>
    );
}