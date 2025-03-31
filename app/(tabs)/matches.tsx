// app/(tabs)/matches.tsx

import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Match, MatchStatus, Team } from '@/lib/types/models';
import { useEffect, useState } from 'react';

import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/lib/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

type MatchWithTeams = Match & {
  home_team: Team;
  away_team: Team;
};

export default function MatchesScreen() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      // Obtener partidos con información de equipos
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:home_team_id(id, name, logo_url),
          away_team:away_team_id(id, name, logo_url)
        `)
        .order('match_date', { ascending: false });

      if (error) {
        throw error;
      }

      setMatches(data as unknown as MatchWithTeams[]);
    } catch (error) {
      console.error('Error al cargar partidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los partidos');
    } finally {
      setLoading(false);
    }
  };

  const navigateToMatchDetails = (matchId: string) => {
    router.push(`/match/${matchId}`);
  };

  const navigateToCreateMatch = () => {
    router.push('/match/create');
  };

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.SCHEDULED:
        return '#FFC107'; // Amarillo
      case MatchStatus.IN_PROGRESS:
        return '#4CAF50'; // Verde
      case MatchStatus.COMPLETED:
        return '#2196F3'; // Azul
      case MatchStatus.CANCELLED:
        return '#F44336'; // Rojo
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.SCHEDULED:
        return 'Programado';
      case MatchStatus.IN_PROGRESS:
        return 'En juego';
      case MatchStatus.COMPLETED:
        return 'Finalizado';
      case MatchStatus.CANCELLED:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const formatMatchDate = (dateString: string | null) => {
    if (!dateString) return 'Fecha por confirmar';
    
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const renderMatchItem = ({ item }: { item: MatchWithTeams }) => {
    return (
      <TouchableOpacity
        style={[
          styles.matchCard,
          { backgroundColor: Colors[colorScheme].card }
        ]}
        onPress={() => navigateToMatchDetails(item.id)}
      >
        <ThemedView style={styles.matchHeader}>
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
          <ThemedText style={styles.matchDate}>
            {formatMatchDate(item.match_date || null)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.matchTeams}>
          <ThemedView style={styles.team}>
            <ThemedText type="defaultSemiBold" style={styles.teamName}>
              {item.home_team?.name || 'Por definir'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.score}>
            <ThemedText style={styles.scoreText}>
              {item.home_team_score}
            </ThemedText>
            <ThemedText style={styles.scoreSeparator}>-</ThemedText>
            <ThemedText style={styles.scoreText}>
              {item.away_team_score}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.team}>
            <ThemedText type="defaultSemiBold" style={styles.teamName}>
              {item.away_team?.name || 'Por definir'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {item.location && (
          <ThemedView style={styles.matchFooter}>
            <Ionicons 
              name="location-outline" 
              size={16} 
              color={Colors[colorScheme].text} 
            />
            <ThemedText style={styles.locationText}>
              {item.location}
            </ThemedText>
          </ThemedView>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Partidos</ThemedText>
        {isAdmin() && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={navigateToCreateMatch}
          >
            <ThemedText style={styles.createButtonText}>+ Nuevo</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color="#4a90e2" style={styles.loader} />
      ) : matches.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>
            No hay partidos disponibles
          </ThemedText>
          {isAdmin() && (
            <TouchableOpacity 
              style={[styles.createButton, styles.emptyStateButton]}
              onPress={navigateToCreateMatch}
            >
              <ThemedText style={styles.createButtonText}>Crear primer partido</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          onRefresh={fetchMatches}
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
  matchCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  matchDate: {
    fontSize: 14,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  team: {
    flex: 2,
    padding: 4,
  },
  teamName: {
    textAlign: 'center',
  },
  score: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  matchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
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