// app/tournament/create.tsx
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { TournamentStatus, TournamentType } from '@/lib/types/models';

import { DatePicker } from '@/components/ui/DatePicker';
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

        // ✅ NUEVOS CAMPOS PARA GESTIÓN DE EQUIPOS
        min_teams: 4,
        max_teams: 16,
        min_players_per_team: 6,
        max_players_per_team: 12,
        registration_start_date: '',
        registration_end_date: '',
        allow_public_registration: true,
        require_approval: false,
        teams_to_qualify: null as number | null,
    });

    const [loading, setLoading] = useState(false);
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const handleCreate = async () => {
        // ✅ VALIDACIONES EXTENDIDAS
        if (!formData.name.trim()) {
            Alert.alert('Error', 'El nombre del torneo es obligatorio');
            return;
        }

        if (!formData.start_date) {
            Alert.alert('Error', 'La fecha de inicio es obligatoria');
            return;
        }

        // Validaciones de equipos
        if (formData.min_teams < 2) {
            Alert.alert('Error', 'El mínimo de equipos debe ser al menos 2');
            return;
        }

        if (formData.max_teams < formData.min_teams) {
            Alert.alert('Error', 'El máximo de equipos debe ser mayor o igual al mínimo');
            return;
        }

        // Validaciones de jugadores
        if (formData.min_players_per_team < 6) {
            Alert.alert('Error', 'El mínimo de jugadores por equipo debe ser al menos 6 para voleibol');
            return;
        }

        if (formData.max_players_per_team < formData.min_players_per_team) {
            Alert.alert('Error', 'El máximo de jugadores debe ser mayor o igual al mínimo');
            return;
        }

        // Validaciones de fechas de inscripción
        if (formData.registration_start_date && formData.registration_end_date) {
            const startReg = new Date(formData.registration_start_date);
            const endReg = new Date(formData.registration_end_date);
            const startTournament = new Date(formData.start_date);

            if (endReg < startReg) {
                Alert.alert('Error', 'La fecha de fin de inscripciones debe ser posterior al inicio');
                return;
            }

            if (endReg > startTournament) {
                Alert.alert('Error', 'Las inscripciones deben cerrar antes del inicio del torneo');
                return;
            }
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

                // ✅ PROPIEDADES OBLIGATORIAS AGREGADAS
                min_teams: formData.min_teams,
                max_teams: formData.max_teams,
                min_players_per_team: formData.min_players_per_team,
                max_players_per_team: formData.max_players_per_team,
                registration_start_date: formData.registration_start_date || null,
                registration_end_date: formData.registration_end_date || null,
                allow_public_registration: formData.allow_public_registration,
                require_approval: formData.require_approval,
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

                    {/* Fecha de inicio - CON DATEPICKER */}
                    <DatePicker
                        label="Fecha de Inicio"
                        value={formData.start_date}
                        onChange={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                        required
                        minimumDate={new Date()} // No permitir fechas pasadas
                    />

                    {/* Fecha de fin - CON DATEPICKER */}
                    <DatePicker
                        label="Fecha de Fin"
                        value={formData.end_date}
                        onChange={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                        minimumDate={formData.start_date ? new Date(formData.start_date) : new Date()}
                    />

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

                    {/* ✅ SECCIÓN DE CONFIGURACIÓN DE EQUIPOS */}
                    <View className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-4">
                        <ThemedText className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
                            Configuración de Equipos
                        </ThemedText>

                        {/* Número mínimo de equipos */}
                        <View className="mb-4">
                            <ThemedText className="text-sm font-medium mb-2">Equipos Mínimos Requeridos *</ThemedText>
                            <TextInput
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                                value={formData.min_teams.toString()}
                                onChangeText={(text) => {
                                    const num = parseInt(text);
                                    if (!isNaN(num) && num >= 2) {
                                        setFormData(prev => ({ ...prev, min_teams: num }));
                                    }
                                }}
                                placeholder="Mínimo 2 equipos"
                                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Número máximo de equipos */}
                        <View className="mb-4">
                            <ThemedText className="text-sm font-medium mb-2">Equipos Máximos Permitidos *</ThemedText>
                            <TextInput
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                                value={formData.max_teams.toString()}
                                onChangeText={(text) => {
                                    const num = parseInt(text);
                                    if (!isNaN(num) && num >= formData.min_teams) {
                                        setFormData(prev => ({ ...prev, max_teams: num }));
                                    }
                                }}
                                placeholder="Máximo de equipos"
                                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Jugadores mínimos por equipo */}
                        <View className="mb-4">
                            <ThemedText className="text-sm font-medium mb-2">Jugadores Mínimos por Equipo *</ThemedText>
                            <TextInput
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                                value={formData.min_players_per_team.toString()}
                                onChangeText={(text) => {
                                    const num = parseInt(text);
                                    if (!isNaN(num) && num >= 6) { // Mínimo 6 para voleibol
                                        setFormData(prev => ({ ...prev, min_players_per_team: num }));
                                    }
                                }}
                                placeholder="Mínimo 6 jugadores"
                                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Jugadores máximos por equipo */}
                        <View>
                            <ThemedText className="text-sm font-medium mb-2">Jugadores Máximos por Equipo *</ThemedText>
                            <TextInput
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                                value={formData.max_players_per_team.toString()}
                                onChangeText={(text) => {
                                    const num = parseInt(text);
                                    if (!isNaN(num) && num >= formData.min_players_per_team) {
                                        setFormData(prev => ({ ...prev, max_players_per_team: num }));
                                    }
                                }}
                                placeholder="Máximo de jugadores por equipo"
                                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* ✅ SECCIÓN DE CONFIGURACIÓN DE INSCRIPCIONES */}
                    <View className="bg-green-50 dark:bg-green-900 rounded-lg p-4 mb-4">
                        <ThemedText className="text-lg font-semibold mb-4 text-green-900 dark:text-green-100">
                            Configuración de Inscripciones
                        </ThemedText>

                        {/* Fecha de inicio de inscripciones */}
                        <DatePicker
                            label="Inicio de Inscripciones"
                            value={formData.registration_start_date}
                            onChange={(date) => setFormData(prev => ({ ...prev, registration_start_date: date }))}
                            maximumDate={formData.start_date ? new Date(formData.start_date) : undefined}
                        />

                        {/* Fecha de fin de inscripciones */}
                        <DatePicker
                            label="Fin de Inscripciones"
                            value={formData.registration_end_date}
                            onChange={(date) => setFormData(prev => ({ ...prev, registration_end_date: date }))}
                            minimumDate={formData.registration_start_date ? new Date(formData.registration_start_date) : undefined}
                            maximumDate={formData.start_date ? new Date(formData.start_date) : undefined}
                        />

                        {/* Permitir inscripción pública */}
                        <View className="flex-row items-center justify-between mb-4">
                            <ThemedText className="text-sm font-medium flex-1 mr-4">
                                Permitir Inscripción Pública
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() => setFormData(prev => ({
                                    ...prev,
                                    allow_public_registration: !prev.allow_public_registration
                                }))}
                                className={`w-12 h-6 rounded-full ${formData.allow_public_registration ? 'bg-blue-600' : 'bg-gray-300'
                                    } relative`}
                            >
                                <View className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${formData.allow_public_registration ? 'left-6' : 'left-0.5'
                                    }`} />
                            </TouchableOpacity>
                        </View>

                        {/* Requerir aprobación */}
                        <View className="flex-row items-center justify-between">
                            <ThemedText className="text-sm font-medium flex-1 mr-4">
                                Requerir Aprobación Manual
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() => setFormData(prev => ({
                                    ...prev,
                                    require_approval: !prev.require_approval
                                }))}
                                className={`w-12 h-6 rounded-full ${formData.require_approval ? 'bg-orange-600' : 'bg-gray-300'
                                    } relative`}
                            >
                                <View className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${formData.require_approval ? 'left-6' : 'left-0.5'
                                    }`} />
                            </TouchableOpacity>
                        </View>
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