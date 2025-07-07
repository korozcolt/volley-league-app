// app/admin/registrations.tsx
import { ActivityIndicator, Alert, FlatList, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { RegistrationStatus, TournamentRegistration } from '@/lib/types/models';

import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AdminRegistrationsScreen() {
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const { isAdmin } = useAuth();
  const colorScheme = useColorScheme() as 'light' | 'dark';

  // Redirect si no es admin
  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
    }
  }, [isAdmin]);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      
      // TODO: Implementar fetch real de inscripciones
      // const { data, error } = await registrations.getAll({ status: selectedFilter === 'all' ? undefined : [selectedFilter] });
      
      // Mock data por ahora
      const mockData: TournamentRegistration[] = [
        {
          id: '1',
          tournament_id: 't1',
          team_id: 'team1',
          registered_by: 'user1',
          registration_date: new Date().toISOString(),
          status: RegistrationStatus.PENDING,
          approval_date: null,
          approved_by: null,
          rejection_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tournament: {
            id: 't1',
            name: 'Copa Verano 2025',
            start_date: '2025-08-01',
            end_date: '2025-08-15',
            location: 'Complejo Deportivo Central',
            description: 'Torneo de verano',
            type: 'points' as any,
            status: 'upcoming' as any,
            min_teams: 4,
            max_teams: 16,
            min_players_per_team: 6,
            max_players_per_team: 12,
            allow_public_registration: true,
            require_approval: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          team: {
            id: 'team1',
            name: 'Águilas FC',
            active: true,
            verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      ];
      
      setRegistrations(mockData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      Alert.alert('Error', 'No se pudieron cargar las inscripciones');
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

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
            try {
              // TODO: Implementar aprobación real
              // await registrations.approveRegistration(registrationId, currentUserId);
              
              setRegistrations(prev => 
                prev.map(reg => 
                  reg.id === registrationId 
                    ? { ...reg, status: RegistrationStatus.APPROVED, approval_date: new Date().toISOString() }
                    : reg
                )
              );
              
              Alert.alert('Éxito', 'Inscripción aprobada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo aprobar la inscripción');
            }
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
              try {
                // TODO: Implementar rechazo real
                // await registrations.rejectRegistration(registrationId, reason, currentUserId);
                
                setRegistrations(prev => 
                  prev.map(reg => 
                    reg.id === registrationId 
                      ? { ...reg, status: RegistrationStatus.REJECTED, rejection_reason: reason }
                      : reg
                  )
                );
                
                Alert.alert('Éxito', 'Inscripción rechazada');
              } catch (error) {
                Alert.alert('Error', 'No se pudo rechazar la inscripción');
              }
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const handleManualRegistration = () => {
    Alert.alert(
      'Inscripción Manual',
      'Selecciona un torneo y equipo para inscribir manualmente',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            router.push('/admin/manual-registration' as any);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: RegistrationStatus) => {
    switch (status) {
      case RegistrationStatus.PENDING:
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' };
      case RegistrationStatus.APPROVED:
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' };
      case RegistrationStatus.REJECTED:
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' };
      case RegistrationStatus.CANCELLED:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Desconocido' };
    }
  };

  const filteredRegistrations = registrations.filter(reg => 
    selectedFilter === 'all' || reg.status === selectedFilter
  );

  const renderRegistrationItem = ({ item }: { item: TournamentRegistration }) => {
    const statusStyle = getStatusColor(item.status);
    
    return (
      <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <ThemedText className="font-semibold text-lg">
              {item.team?.name || 'Equipo desconocido'}
            </ThemedText>
            <ThemedText className="text-sm text-gray-600 dark:text-gray-300">
              {item.tournament?.name || 'Torneo desconocido'}
            </ThemedText>
            <ThemedText className="text-xs text-gray-500 mt-1">
              Inscrito: {new Date(item.registration_date).toLocaleDateString()}
            </ThemedText>
          </View>
          
          <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
            <ThemedText className={`text-xs font-medium ${statusStyle.text}`}>
              {statusStyle.label}
            </ThemedText>
          </View>
        </View>

        {item.rejection_reason && (
          <View className="bg-red-50 dark:bg-red-900 rounded-lg p-3 mb-3">
            <ThemedText className="text-sm text-red-800 dark:text-red-200">
              <ThemedText className="font-medium">Motivo del rechazo:</ThemedText> {item.rejection_reason}
            </ThemedText>
          </View>
        )}

        {item.status === RegistrationStatus.PENDING && (
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => handleApprove(item.id)}
              className="flex-1 bg-green-600 py-3 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <ThemedText className="text-white font-medium ml-2">Aprobar</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleReject(item.id)}
              className="flex-1 bg-red-600 py-3 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons name="close" size={16} color="white" />
              <ThemedText className="text-white font-medium ml-2">Rechazar</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.push(`/tournament/${item.tournament_id}` as any)}
          className="mt-3 border border-blue-600 py-2 rounded-lg flex-row items-center justify-center"
        >
          <Ionicons name="eye-outline" size={16} color="#4a90e2" />
          <ThemedText className="text-blue-600 font-medium ml-2">Ver Torneo</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const FilterButton = ({ 
    filter, 
    label, 
    count 
  }: { 
    filter: typeof selectedFilter; 
    label: string; 
    count: number; 
  }) => (
    <TouchableOpacity
      onPress={() => setSelectedFilter(filter)}
      className={`px-4 py-2 rounded-lg mr-3 ${
        selectedFilter === filter 
          ? 'bg-blue-600' 
          : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <ThemedText className={`font-medium ${
        selectedFilter === filter 
          ? 'text-white' 
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {label} ({count})
      </ThemedText>
    </TouchableOpacity>
  );

  if (!isAdmin) {
    return null; // Ya se redirige arriba
  }

  return (
    <ThemedView className="flex-1 p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <ThemedText className="text-2xl font-bold">
          Gestión de Inscripciones
        </ThemedText>
        <TouchableOpacity
          onPress={handleManualRegistration}
          className="bg-orange-600 px-4 py-2 rounded-lg"
        >
          <ThemedText className="text-white font-medium">+ Manual</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="flex-row mb-4">
        <FilterButton 
          filter="pending" 
          label="Pendientes" 
          count={registrations.filter(r => r.status === 'pending').length} 
        />
        <FilterButton 
          filter="approved" 
          label="Aprobados" 
          count={registrations.filter(r => r.status === 'approved').length} 
        />
        <FilterButton 
          filter="rejected" 
          label="Rechazados" 
          count={registrations.filter(r => r.status === 'rejected').length} 
        />
        <FilterButton 
          filter="all" 
          label="Todos" 
          count={registrations.length} 
        />
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
          <ThemedText className="mt-4">Cargando inscripciones...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredRegistrations}
          renderItem={renderRegistrationItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-8">
              <Ionicons 
                name="document-outline" 
                size={64} 
                color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'} 
              />
              <ThemedText className="text-center text-gray-500 mt-4">
                No hay inscripciones {selectedFilter === 'all' ? '' : selectedFilter === 'pending' ? 'pendientes' : selectedFilter}
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}