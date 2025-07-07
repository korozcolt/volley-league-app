import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Tournament, TournamentStatus } from '@/lib/types/models';
import { useEffect, useState } from 'react';

import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { tournaments } from '@/lib/providers'; // 🎯 Ahora usa el provider factory
import { useAuthContext } from '@/lib/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TournamentsScreen() {
  const [tournamentsList, setTournamentsList] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🎯 Usar provider agnóstico - funciona con cualquier backend
      const { data, error: fetchError } = await tournaments.getAll({
        // Opcional: filtros específicos
        // status: ['upcoming', 'in_progress'],
        // search: ''
      });

      if (fetchError) {
        throw new Error(fetchError);
      }

      setTournamentsList(data);
    } catch (error) {
      console.error('Error al cargar torneos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      Alert.alert('Error', `No se pudieron cargar los torneos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchTournaments();
  };

  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.UPCOMING:
        return '#4CAF50'; // Verde
      case TournamentStatus.IN_PROGRESS:
        return '#2196F3'; // Azul
      case TournamentStatus.COMPLETED:
        return '#9E9E9E'; // Gris
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.UPCOMING:
        return 'Próximo';
      case TournamentStatus.IN_PROGRESS:
        return 'En curso';
      case TournamentStatus.COMPLETED:
        return 'Completado';
      default:
        return 'Desconocido';
    }
  };

  const navigateToTournamentDetails = (tournamentId: string) => {
    router.push(`/tournament/${tournamentId}`);
  };

  const navigateToCreateTournament = () => {
    router.push('/tournament/create');
  };

  const renderTournamentItem = ({ item }: { item: Tournament }) => {
    const startDate = new Date(item.start_date).toLocaleDateString();
    const endDate = item.end_date 
      ? new Date(item.end_date).toLocaleDateString() 
      : 'Por determinar';

    return (
      <TouchableOpacity
        style={[
          styles.tournamentCard,
          { backgroundColor: Colors[colorScheme].card }
        ]}
        onPress={() => navigateToTournamentDetails(item.id)}
      >
        <ThemedView style={styles.cardHeader}>
          <ThemedText type="defaultSemiBold" style={styles.tournamentName}>
            {item.name}
          </ThemedText>
          <ThemedView
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}
          >
            <ThemedText style={styles.statusText}>
              {getStatusText(item.status)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.tournamentDetails}>
          <ThemedText>
            Fechas: {startDate} - {endDate}
          </ThemedText>
          {item.location && (
            <ThemedText>Ubicación: {item.location}</ThemedText>
          )}
          {item.description && (
            <ThemedText numberOfLines={2} style={styles.description}>
              {item.description}
            </ThemedText>
          )}
        </ThemedView>
      </TouchableOpacity>
    );
  };

  // 🎯 COMPONENTE DE ERROR REUTILIZABLE
  const ErrorComponent = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <ThemedView style={styles.errorContainer}>
      <ThemedText style={styles.errorText}>❌ {error}</ThemedText>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  // 🎯 COMPONENTE DE ESTADO VACÍO
  const EmptyStateComponent = () => (
    <ThemedView style={styles.emptyState}>
      <ThemedText style={styles.emptyStateIcon}>🏆</ThemedText>
      <ThemedText style={styles.emptyStateText}>
        No hay torneos disponibles
      </ThemedText>
      <ThemedText style={styles.emptyStateSubtext}>
        Los torneos aparecerán aquí cuando se creen
      </ThemedText>
      {isAdmin() && (
        <TouchableOpacity 
          style={[styles.createButton, styles.emptyStateButton]}
          onPress={navigateToCreateTournament}
        >
          <ThemedText style={styles.createButtonText}>Crear primer torneo</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {/* 🎯 HEADER CON TÍTULO Y BOTÓN DE CREAR */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Torneos</ThemedText>
        {isAdmin() && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={navigateToCreateTournament}
          >
            <ThemedText style={styles.createButtonText}>+ Nuevo</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* 🎯 ESTADÍSTICAS RÁPIDAS */}
      {!loading && !error && tournamentsList.length > 0 && (
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {tournamentsList.filter(t => t.status === TournamentStatus.UPCOMING).length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Próximos</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {tournamentsList.filter(t => t.status === TournamentStatus.IN_PROGRESS).length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>En curso</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {tournamentsList.filter(t => t.status === TournamentStatus.COMPLETED).length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Completados</ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {/* 🎯 CONTENIDO PRINCIPAL */}
      {loading ? (
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <ThemedText style={styles.loadingText}>Cargando torneos...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ErrorComponent error={error} onRetry={handleRefresh} />
      ) : tournamentsList.length === 0 ? (
        <EmptyStateComponent />
      ) : (
        <FlatList
          data={tournamentsList}
          renderItem={renderTournamentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          onRefresh={handleRefresh}
          refreshing={loading}
          // 🎯 PULL TO REFRESH personalizado
          refreshControl={
            <ThemedView style={{ paddingTop: 10 }}>
              {loading && <ActivityIndicator color="#4a90e2" />}
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // 🎯 ESTADÍSTICAS
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },

  // 🎯 LOADING Y CENTRADO
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },

  // 🎯 ERROR
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#f44336',
  },
  retryButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  // 🎯 LISTA
  list: {
    paddingBottom: 20,
  },
  tournamentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tournamentDetails: {
    gap: 6,
  },
  description: {
    opacity: 0.7,
    marginTop: 8,
    fontStyle: 'italic',
  },

  // 🎯 ESTADO VACÍO
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});