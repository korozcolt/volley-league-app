import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyState, SearchEmpty } from '@/components/ui/EmptyState';
import React, { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { teams, tournaments } from '@/lib/providers';

import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/lib/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Tournament {
  id: string;
  name: string;
  status: string;
  max_teams?: number;
  registration_open: boolean;
}

interface Team {
  id: string;
  name: string;
  coach?: string;
  logo?: string;
  is_active: boolean;
}

interface Registration {
  id: string;
  tournament: string;
  team: Team;
  status: 'pending' | 'approved' | 'rejected';
  registered_at: string;
  notes?: string;
}

/**
 * Pantalla de Gestión de Inscripciones de Torneo
 * 
 * Ubicación: app/tournament/[id]/registrations.tsx
 * 
 * Funcionalidades:
 * - Ver equipos inscritos y pendientes
 * - Aprobar/rechazar inscripciones
 * - Buscar y agregar nuevos equipos
 * - Gestión completa de inscripciones para administradores
 */
export default function TournamentRegistrationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const { hasRole } = useAuth();
  
  // 📊 ESTADO
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTeams, setShowAddTeams] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // 🔐 PERMISOS
  const canManage = hasRole(['admin']);
  const canView = hasRole(['admin', 'team_manager', 'referee']);

  // 📱 CARGAR DATOS
  const fetchData = async () => {
    if (!id) return;
    
    try {
      // Cargar torneo
      const { data: tournamentData, error: tournamentError } = await tournaments.getById(id);
      if (tournamentError) throw new Error(tournamentError);
      setTournament(tournamentData);

      // Cargar inscripciones
      const { data: registrationsData, error: registrationsError } = await tournaments.getRegistrations(id);
      if (registrationsError) throw new Error(registrationsError);
      setRegistrations(registrationsData || []);

      // Cargar equipos disponibles (solo si puede gestionar)
      if (canManage) {
        const { data: teamsData, error: teamsError } = await teams.getAll({ active_only: true });
        if (teamsError) throw new Error(teamsError);
        
        // Filtrar equipos que no estén ya inscritos
        const registeredTeamIds = new Set(registrationsData?.map(r => r.team.id) || []);
        const available = teamsData?.filter(team => !registeredTeamIds.has(team.id)) || [];
        setAvailableTeams(available);
      }
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar las inscripciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 🔄 REFRESH
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ✅ APROBAR INSCRIPCIÓN
  const approveRegistration = async (registrationId: string) => {
    setProcessingIds(prev => new Set(prev).add(registrationId));
    
    try {
      const { error } = await tournaments.updateRegistrationStatus(registrationId, 'approved');
      if (error) throw new Error(error);
      
      // Actualizar estado local
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status: 'approved' as const }
            : reg
        )
      );
      
      Alert.alert('Inscripción aprobada', 'El equipo ha sido aprobado exitosamente');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo aprobar la inscripción');
      console.error('Error aprobando inscripción:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(registrationId);
        return newSet;
      });
    }
  };

  // ❌ RECHAZAR INSCRIPCIÓN
  const rejectRegistration = async (registrationId: string) => {
    Alert.alert(
      'Rechazar Inscripción',
      '¿Estás seguro que quieres rechazar esta inscripción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            setProcessingIds(prev => new Set(prev).add(registrationId));
            
            try {
              const { error } = await tournaments.updateRegistrationStatus(registrationId, 'rejected');
              if (error) throw new Error(error);
              
              // Actualizar estado local
              setRegistrations(prev => 
                prev.map(reg => 
                  reg.id === registrationId 
                    ? { ...reg, status: 'rejected' as const }
                    : reg
                )
              );
              
              Alert.alert('Inscripción rechazada', 'El equipo ha sido rechazado');
            } catch (error: any) {
              Alert.alert('Error', 'No se pudo rechazar la inscripción');
              console.error('Error rechazando inscripción:', error);
            } finally {
              setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(registrationId);
                return newSet;
              });
            }
          }
        }
      ]
    );
  };

  // ➕ INSCRIBIR EQUIPO
  const registerTeam = async (teamId: string) => {
    setProcessingIds(prev => new Set(prev).add(teamId));
    
    try {
      const { error } = await tournaments.registerTeam(id!, teamId);
      if (error) throw new Error(error);
      
      // Refrescar datos
      await fetchData();
      
      Alert.alert('Equipo inscrito', 'El equipo ha sido inscrito exitosamente');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo inscribir el equipo');
      console.error('Error inscribiendo equipo:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(teamId);
        return newSet;
      });
    }
  };

  // 🔍 FILTRAR EQUIPOS DISPONIBLES
  const filteredAvailableTeams = availableTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.coach?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🎨 RENDERIZAR INSCRIPCIÓN
  const renderRegistration = ({ item }: { item: Registration }) => {
    const isProcessing = processingIds.has(item.id);
    
    return (
      <View style={[styles.registrationCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <View style={styles.registrationHeader}>
          <View style={styles.teamInfo}>
            {item.team.logo && (
              <View style={styles.logoContainer}>
                <ThemedText style={styles.logoPlaceholder}>🏐</ThemedText>
              </View>
            )}
            <View style={styles.teamDetails}>
              <ThemedText style={styles.teamName}>{item.team.name}</ThemedText>
              {item.team.coach && (
                <ThemedText style={styles.teamCoach}>DT: {item.team.coach}</ThemedText>
              )}
            </View>
          </View>
          
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) }
          ]}>
            <ThemedText style={styles.statusText}>
              {getStatusText(item.status)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.registrationMeta}>
          <ThemedText style={styles.registrationDate}>
            📅 Inscrito: {new Date(item.registered_at).toLocaleDateString()}
          </ThemedText>
        </View>

        {item.notes && (
          <View style={styles.notesContainer}>
            <ThemedText style={styles.notesText}>📝 {item.notes}</ThemedText>
          </View>
        )}

        {/* 🎛️ CONTROLES DE ADMINISTRACIÓN */}
        {canManage && item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => approveRegistration(item.id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <ThemedText style={styles.actionButtonText}>✅ Aprobar</ThemedText>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => rejectRegistration(item.id)}
              disabled={isProcessing}
            >
              <ThemedText style={styles.actionButtonText}>❌ Rechazar</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // 🎨 RENDERIZAR EQUIPO DISPONIBLE
  const renderAvailableTeam = ({ item }: { item: Team }) => {
    const isProcessing = processingIds.has(item.id);
    
    return (
      <View style={[styles.availableTeamCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <View style={styles.teamInfo}>
          <View style={styles.logoContainer}>
            <ThemedText style={styles.logoPlaceholder}>🏐</ThemedText>
          </View>
          <View style={styles.teamDetails}>
            <ThemedText style={styles.teamName}>{item.name}</ThemedText>
            {item.coach && (
              <ThemedText style={styles.teamCoach}>DT: {item.coach}</ThemedText>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={() => registerTeam(item.id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <ThemedText style={styles.addButtonText}>+ Inscribir</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // 🎨 HELPERS
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#f44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  // 📊 ESTADÍSTICAS
  const stats = {
    total: registrations.length,
    approved: registrations.filter(r => r.status === 'approved').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText style={styles.loadingText}>Cargando inscripciones...</ThemedText>
      </ThemedView>
    );
  }

  if (!canView) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>
          No tienes permisos para ver las inscripciones
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Inscripciones - ${tournament?.name || 'Torneo'}`,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
        }} 
      />
      
      <ThemedView style={styles.container}>
        {/* 📊 ESTADÍSTICAS */}
        <View style={[styles.statsContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{stats.total}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.approved}</ThemedText>
            <ThemedText style={styles.statLabel}>Aprobados</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: '#FF9800' }]}>{stats.pending}</ThemedText>
            <ThemedText style={styles.statLabel}>Pendientes</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: '#f44336' }]}>{stats.rejected}</ThemedText>
            <ThemedText style={styles.statLabel}>Rechazados</ThemedText>
          </View>
        </View>

        {/* 🎛️ CONTROLES DE ADMINISTRACIÓN */}
        {canManage && (
          <View style={styles.adminControls}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { 
                  backgroundColor: showAddTeams 
                    ? '#4CAF50' 
                    : Colors[colorScheme ?? 'light'].tint 
                }
              ]}
              onPress={() => setShowAddTeams(!showAddTeams)}
            >
              <ThemedText style={styles.toggleButtonText}>
                {showAddTeams ? '📋 Ver Inscritos' : '➕ Agregar Equipos'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* 🔍 MODO AGREGAR EQUIPOS */}
        {showAddTeams && canManage ? (
          <>
            <View style={[styles.searchContainer, { borderColor: Colors[colorScheme ?? 'light'].border }]}>
              <ThemedText style={styles.searchIcon}>🔍</ThemedText>
              <TextInput
                style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
                placeholder="Buscar equipos disponibles..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {filteredAvailableTeams.length === 0 ? (
              searchQuery.trim() ? (
                <SearchEmpty 
                  query={searchQuery} 
                  onClearSearch={() => setSearchQuery('')} 
                />
              ) : (
                <EmptyState
                  icon="✅"
                  title="Todos los equipos están inscritos"
                  subtitle="No hay equipos disponibles para inscribir"
                />
              )
            ) : (
              <FlatList
                data={filteredAvailableTeams}
                renderItem={renderAvailableTeam}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        ) : (
          /* 📋 LISTA DE INSCRIPCIONES */
          registrations.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No hay inscripciones"
              subtitle="Las inscripciones aparecerán aquí cuando los equipos se registren"
            />
          ) : (
            <FlatList
              data={registrations}
              renderItem={renderRegistration}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={handleRefresh}
                  colors={[Colors[colorScheme ?? 'light'].tint]}
                />
              }
            />
          )
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#f44336',
  },

  // 📊 ESTADÍSTICAS
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },

  // 🎛️ CONTROLES
  adminControls: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  toggleButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 🔍 BÚSQUEDA
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginTop: 0,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },

  // 📋 LISTAS
  list: {
    padding: 16,
    paddingTop: 0,
  },

  // 🎨 TARJETAS DE INSCRIPCIÓN
  registrationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoPlaceholder: {
    fontSize: 20,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  teamCoach: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  registrationMeta: {
    marginBottom: 8,
  },
  registrationDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    opacity: 0.8,
    fontStyle: 'italic',
  },

  // 🎛️ BOTONES DE ACCIÓN
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // 🎨 EQUIPOS DISPONIBLES
  availableTeamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});