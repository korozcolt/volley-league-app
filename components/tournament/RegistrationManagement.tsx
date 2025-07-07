import { Alert, FlatList, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TournamentRegistration } from '@/lib/types/models';
import { useAuth } from '@/lib/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

interface RegistrationManagementProps {
    tournamentId: string;
}

export function RegistrationManagement({ tournamentId }: RegistrationManagementProps) {
    const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const fetchRegistrations = useCallback(async () => {
        // Implementar fetch de inscripciones
        setLoading(false);
    }, [tournamentId]);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    const handleApprove = async (registrationId: string) => {
        Alert.alert(
            'Aprobar Inscripción',
            '¿Estás seguro de aprobar esta inscripción?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Aprobar',
                    onPress: async () => {
                        // Implementar aprobación
                        await fetchRegistrations();
                    },
                },
            ]
        );
    };

    const handleReject = async (registrationId: string) => {
        Alert.prompt(
            'Rechazar Inscripción',
            'Ingresa el motivo del rechazo:',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Rechazar',
                    onPress: async (reason) => {
                        if (reason?.trim()) {
                            // Implementar rechazo
                            await fetchRegistrations();
                        }
                    },
                },
            ],
            'plain-text'
        );
    };

    const renderRegistrationItem = ({ item }: { item: TournamentRegistration }) => (
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm">
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <ThemedText className="font-semibold text-base">
                        {item.team?.name || 'Equipo desconocido'}
                    </ThemedText>
                    <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                        Inscrito: {new Date(item.registration_date).toLocaleDateString()}
                    </ThemedText>
                    <View className={`px-2 py-1 rounded mt-2 self-start ${item.status === 'pending' ? 'bg-yellow-100' :
                            item.status === 'approved' ? 'bg-green-100' :
                                'bg-red-100'
                        }`}>
                        <ThemedText className={`text-xs font-medium ${item.status === 'pending' ? 'text-yellow-800' :
                                item.status === 'approved' ? 'text-green-800' :
                                    'text-red-800'
                            }`}>
                            {item.status === 'pending' ? 'Pendiente' :
                                item.status === 'approved' ? 'Aprobado' :
                                    'Rechazado'}
                        </ThemedText>
                    </View>
                </View>

                {isAdmin() && item.status === 'pending' && (
                    <View className="flex-row space-x-2">
                        <TouchableOpacity
                            onPress={() => handleApprove(item.id)}
                            className="bg-green-600 px-3 py-2 rounded-lg"
                        >
                            <Ionicons name="checkmark" size={16} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleReject(item.id)}
                            className="bg-red-600 px-3 py-2 rounded-lg"
                        >
                            <Ionicons name="close" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {item.rejection_reason && (
                <View className="mt-3 bg-red-50 dark:bg-red-900 rounded-lg p-3">
                    <ThemedText className="text-sm text-red-800 dark:text-red-200">
                        Motivo del rechazo: {item.rejection_reason}
                    </ThemedText>
                </View>
            )}
        </View>
    );

    if (!isAdmin) {
        return (
            <ThemedView className="p-4">
                <ThemedText className="text-center text-gray-500">
                    Solo los administradores pueden gestionar inscripciones
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView className="flex-1 p-4">
            <ThemedText className="text-xl font-bold mb-4">
                Gestión de Inscripciones
            </ThemedText>

            {loading ? (
                <ThemedText className="text-center">Cargando inscripciones...</ThemedText>
            ) : (
                <FlatList
                    data={registrations}
                    renderItem={renderRegistrationItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <ThemedText className="text-center text-gray-500 mt-8">
                            No hay inscripciones pendientes
                        </ThemedText>
                    }
                />
            )}
        </ThemedView>
    );
}