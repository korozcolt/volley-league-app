// app/(tabs)/tournaments.tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';
import { Tournament, TournamentStatus } from '@/lib/types/models';
import { useAuthContext } from '@/lib/context/AuthContext';

export default function TournamentsScreen() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        throw error;
      }

      setTournaments(data as Tournament[]);
    } catch (error) {
      console.error('Error al cargar torneos:', error);
      Alert.alert('Error', 'No se pudieron cargar los torneos');
    } finally {
      setLoading(false);
    }
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
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
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

      {loading ? (
        <ActivityIndicator size="large" color="#4a90e2" style={styles.loader} />
      ) : tournaments.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>
            No hay torneos disponibles
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
      ) : (
        <FlatList
          data={tournaments}
          renderItem={renderTournamentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          onRefresh={fetchTournaments}
          refreshing={loading}
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  tournamentCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tournamentName: {
    fontSize: 18,
    flex: 1,
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
    gap: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});