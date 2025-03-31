import { Alert, FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Match, MatchStatus, Tournament, TournamentStatus } from '@/lib/types/models';
import { useEffect, useState } from 'react';

import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/lib/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

type MatchWithTeams = Match & {
  home_team: {
    id: string;
    name: string;
    logo_url?: string | null;
  };
  away_team: {
    id: string;
    name: string;
    logo_url?: string | null;
  };
  tournament: {
    id: string;
    name: string;
  };
};

export default function HomeScreen() {
  const [upcomingMatches, setUpcomingMatches] = useState<MatchWithTeams[]>([]);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [teamsCount, setTeamsCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const { userDetails, isAdmin } = useAuthContext();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUpcomingMatches(),
        fetchActiveTournaments(),
        fetchTeamsCount(),
        fetchMatchesCount()
      ]);
    } catch (error) {
      console.error('Error al cargar los datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const fetchUpcomingMatches = async () => {
    try {
      const today = new Date();
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:home_team_id(id, name, logo_url),
          away_team:away_team_id(id, name, logo_url),
          tournament:tournament_id(id, name)
        `)
        .or(`status.eq.${MatchStatus.SCHEDULED},status.eq.${MatchStatus.IN_PROGRESS}`)
        .gte('match_date', today.toISOString())
        .order('match_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      setUpcomingMatches(data as unknown as MatchWithTeams[]);
    } catch (error) {
      console.error('Error al cargar los próximos partidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los próximos partidos');
    }
  };

  const fetchActiveTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .or(`status.eq.${TournamentStatus.UPCOMING},status.eq.${TournamentStatus.IN_PROGRESS}`)
        .order('start_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      setActiveTournaments(data as Tournament[]);
    } catch (error) {
      console.error('Error al cargar los torneos activos:', error);
      Alert.alert('Error', 'No se pudieron cargar los torneos activos');
    }
  };

  const fetchTeamsCount = async () => {
    try {
      const { count, error } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTeamsCount(count || 0);
    } catch (error) {
      console.error('Error al cargar el conteo de equipos:', error);
    }
  };

  const fetchMatchesCount = async () => {
    try {
      const { count, error } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setMatchesCount(count || 0);
    } catch (error) {
      console.error('Error al cargar el conteo de partidos:', error);
    }
  };

  const navigateToMatchDetails = (matchId: string) => {
    router.push(`/match/${matchId}`);
  };

  const navigateToTournamentDetails = (tournamentId: string) => {
    router.push(`/tournament/${tournamentId}`);
  };

  const formatMatchDate = (dateString: string | null) => {
    if (!dateString) return 'Fecha por confirmar';
    
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatTournamentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderMatchItem = ({ item }: { item: MatchWithTeams }) => {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: Colors[colorScheme].card }]}
        onPress={() => navigateToMatchDetails(item.id)}
      >
        <ThemedView style={styles.matchHeader}>
          <ThemedText style={styles.matchTournament}>
            {item.tournament?.name || 'Torneo'}
          </ThemedText>
          <ThemedText style={styles.matchDate}>
            {formatMatchDate(item.match_date || null)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.matchTeams}>
          <ThemedView style={styles.teamInfo}>
            {item.home_team?.logo_url ? (
              <Image 
                source={{ uri: item.home_team.logo_url }} 
                style={styles.teamLogo} 
                resizeMode="contain"
              />
            ) : (
              <ThemedView style={styles.placeholderLogo}>
                <ThemedText style={styles.placeholderText}>
                  {item.home_team?.name.charAt(0) || 'H'}
                </ThemedText>
              </ThemedView>
            )}
            <ThemedText style={styles.teamName} numberOfLines={1}>
              {item.home_team?.name || 'Local'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.vsContainer}>
            <ThemedText style={styles.vsText}>VS</ThemedText>
          </ThemedView>

          <ThemedView style={styles.teamInfo}>
            {item.away_team?.logo_url ? (
              <Image 
                source={{ uri: item.away_team.logo_url }} 
                style={styles.teamLogo} 
                resizeMode="contain"
              />
            ) : (
              <ThemedView style={styles.placeholderLogo}>
                <ThemedText style={styles.placeholderText}>
                  {item.away_team?.name.charAt(0) || 'V'}
                </ThemedText>
              </ThemedView>
            )}
            <ThemedText style={styles.teamName} numberOfLines={1}>
              {item.away_team?.name || 'Visitante'}
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

  const renderTournamentItem = ({ item }: { item: Tournament }) => {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: Colors[colorScheme].card }]}
        onPress={() => navigateToTournamentDetails(item.id)}
      >
        <ThemedView style={styles.tournamentHeader}>
          <ThemedText type="defaultSemiBold" style={styles.tournamentName}>
            {item.name}
          </ThemedText>
          <ThemedView
            style={[
              styles.statusBadge,
              { 
                backgroundColor: item.status === TournamentStatus.UPCOMING 
                  ? '#4CAF50' 
                  : '#2196F3' 
              }
            ]}
          >
            <ThemedText style={styles.statusText}>
              {item.status === TournamentStatus.UPCOMING ? 'Próximo' : 'En curso'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.tournamentDates}>
          <ThemedView style={styles.dateItem}>
            <ThemedText style={styles.dateLabel}>Inicio:</ThemedText>
            <ThemedText style={styles.dateValue}>
              {formatTournamentDate(item.start_date)}
            </ThemedText>
          </ThemedView>
          {item.end_date && (
            <ThemedView style={styles.dateItem}>
              <ThemedText style={styles.dateLabel}>Fin:</ThemedText>
              <ThemedText style={styles.dateValue}>
                {formatTournamentDate(item.end_date)}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {item.location && (
          <ThemedView style={styles.tournamentFooter}>
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

  const StatCard = ({ icon, title, value }: { icon: string, title: string, value: number | string }) => (
    <ThemedView style={[styles.statCard, { backgroundColor: Colors[colorScheme].card }]}>
      <Ionicons name={icon as any} size={24} color="#4a90e2" />
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statTitle}>{title}</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={[]} // Solo usamos FlatList por su capacidad de hacer scroll y refresh
        renderItem={null}
        keyExtractor={() => 'dummy-key'}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <ThemedView style={styles.welcomeSection}>
              <ThemedText type="title">
                ¡Bienvenido{userDetails?.full_name ? `, ${userDetails.full_name.split(' ')[0]}` : ''}!
              </ThemedText>
              <ThemedText>
                {isAdmin() ? 'Panel de administración de la liga de voleibol' : 'Liga de voleibol'}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.statsContainer}>
              <StatCard 
                icon="people-outline" 
                title="Equipos" 
                value={teamsCount} 
              />
              <StatCard 
                icon="calendar-outline" 
                title="Partidos" 
                value={matchesCount} 
              />
              <StatCard 
                icon="trophy-outline" 
                title="Torneos activos" 
                value={activeTournaments.length} 
              />
            </ThemedView>

            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="subtitle">Próximos partidos</ThemedText>
              <TouchableOpacity onPress={() => router.push('/matches')}>
                <ThemedText style={styles.viewAllText}>Ver todos</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {loading ? (
              <ThemedText style={styles.loadingText}>Cargando próximos partidos...</ThemedText>
            ) : upcomingMatches.length === 0 ? (
              <ThemedText style={styles.emptyText}>No hay próximos partidos programados</ThemedText>
            ) : (
              upcomingMatches.map(match => renderMatchItem({ item: match }))
            )}

            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="subtitle">Torneos activos</ThemedText>
              <TouchableOpacity onPress={() => router.push('/tournaments')}>
                <ThemedText style={styles.viewAllText}>Ver todos</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {loading ? (
              <ThemedText style={styles.loadingText}>Cargando torneos activos...</ThemedText>
            ) : activeTournaments.length === 0 ? (
              <ThemedText style={styles.emptyText}>No hay torneos activos actualmente</ThemedText>
            ) : (
              activeTournaments.map(tournament => renderTournamentItem({ item: tournament }))
            )}
          </>
        }
        contentContainerStyle={styles.scrollContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  viewAllText: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchTournament: {
    fontWeight: 'bold',
  },
  matchDate: {
    fontSize: 14,
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamInfo: {
    flex: 2,
    alignItems: 'center',
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  placeholderLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamName: {
    textAlign: 'center',
    width: '100%',
  },
  vsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  vsText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  matchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 16,
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
  tournamentDates: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateItem: {
    flexDirection: 'row',
    marginRight: 16,
  },
  dateLabel: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  dateValue: {
    // por defecto
  },
  tournamentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
});