import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Match, MatchStatus, Tournament, TournamentStatus } from '@/lib/types/models';
import { useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/lib/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Con NativeWind v4, usamos directamente className sin styled

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
  
  // Determinar el color de fondo basado en el tema
  const bgColor = colorScheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgColor = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600';

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

  const getStatusColor = (status: TournamentStatus) => {
    return status === TournamentStatus.UPCOMING ? 'bg-green-600' : 'bg-blue-600';
  };

  const renderMatchItem = ({ item }: { item: MatchWithTeams }) => {
    return (
      <TouchableOpacity 
        className={`${cardBgColor} rounded-lg p-4 mb-4 shadow-sm`}
        onPress={() => navigateToMatchDetails(item.id)}
      >
        <View className="flex-row justify-between mb-3">
          <Text className={`${textColor} font-semibold`}>
            {item.tournament?.name || 'Torneo'}
          </Text>
          <Text className={`${textSecondaryColor} text-sm`}>
            {formatMatchDate(item.match_date || null)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1 items-center">
            {item.home_team?.logo_url ? (
              <Image 
                source={{ uri: item.home_team.logo_url }} 
                className="w-12 h-12 rounded-full mb-2" 
                resizeMode="contain"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mb-2">
                <Text className="text-white text-lg font-bold">
                  {item.home_team?.name.charAt(0) || 'H'}
                </Text>
              </View>
            )}
            <Text className={`${textColor} text-center`} numberOfLines={1}>
              {item.home_team?.name || 'Local'}
            </Text>
          </View>

          <View className="flex-1 items-center">
            <Text className={`${textColor} font-bold text-base`}>VS</Text>
          </View>

          <View className="flex-1 items-center">
            {item.away_team?.logo_url ? (
              <Image 
                source={{ uri: item.away_team.logo_url }} 
                className="w-12 h-12 rounded-full mb-2" 
                resizeMode="contain"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mb-2">
                <Text className="text-white text-lg font-bold">
                  {item.away_team?.name.charAt(0) || 'V'}
                </Text>
              </View>
            )}
            <Text className={`${textColor} text-center`} numberOfLines={1}>
              {item.away_team?.name || 'Visitante'}
            </Text>
          </View>
        </View>

        {item.location && (
          <View className="flex-row items-center">
            <Ionicons 
              name="location-outline" 
              size={16} 
              color={colorScheme === 'dark' ? '#fff' : '#000'} 
            />
            <Text className={`${textSecondaryColor} text-sm ml-1`}>
              {item.location}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTournamentItem = ({ item }: { item: Tournament }) => {
    return (
      <TouchableOpacity
        className={`${cardBgColor} rounded-lg p-4 mb-4 shadow-sm`}
        onPress={() => navigateToTournamentDetails(item.id)}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className={`${textColor} font-semibold flex-1`}>
            {item.name}
          </Text>
          <View
            className={`${getStatusColor(item.status)} px-2 py-1 rounded`}
          >
            <Text className="text-white text-xs font-bold">
              {item.status === TournamentStatus.UPCOMING ? 'Próximo' : 'En curso'}
            </Text>
          </View>
        </View>

        <View className="flex-row mb-3">
          <View className="flex-row mr-4">
            <Text className={`${textColor} font-bold mr-1`}>Inicio:</Text>
            <Text className={textSecondaryColor}>
              {formatTournamentDate(item.start_date)}
            </Text>
          </View>
          {item.end_date && (
            <View className="flex-row">
              <Text className={`${textColor} font-bold mr-1`}>Fin:</Text>
              <Text className={textSecondaryColor}>
                {formatTournamentDate(item.end_date)}
              </Text>
            </View>
          )}
        </View>

        {item.location && (
          <View className="flex-row items-center">
            <Ionicons 
              name="location-outline" 
              size={16} 
              color={colorScheme === 'dark' ? '#fff' : '#000'} 
            />
            <Text className={`${textSecondaryColor} text-sm ml-1`}>
              {item.location}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const StatCard = ({ icon, title, value }: { icon: string, title: string, value: number | string }) => (
    <View className={`${cardBgColor} rounded-lg p-4 mx-1 flex-1 items-center shadow-sm`}>
      <Ionicons name={icon as any} size={24} color="#4a90e2" />
      <Text className={`${textColor} text-lg font-bold my-2`}>{value}</Text>
      <Text className={textSecondaryColor}>{title}</Text>
    </View>
  );

  return (
    <View className={`${bgColor} flex-1`}>
      <FlatList
        data={[]} // Solo usamos FlatList por su capacidad de hacer scroll y refresh
        renderItem={null}
        keyExtractor={() => 'dummy-key'}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <View className="p-4 mb-6">
              <Text className={`${textColor} text-2xl font-bold`}>
                ¡Bienvenido{userDetails?.full_name ? `, ${userDetails.full_name.split(' ')[0]}` : ''}!
              </Text>
              <Text className={textSecondaryColor}>
                {isAdmin() ? 'Panel de administración de la liga de voleibol' : 'Liga de voleibol'}
              </Text>
            </View>

            <View className="flex-row px-4 mb-6">
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
            </View>

            <View className="flex-row justify-between items-center px-4 mb-3 mt-2">
              <Text className={`${textColor} text-lg font-semibold`}>Próximos partidos</Text>
              <TouchableOpacity onPress={() => router.push('/matches')}>
                <Text className="text-blue-500 font-semibold">Ver todos</Text>
              </TouchableOpacity>
            </View>

            <View className="px-4">
              {loading ? (
                <Text className={`${textSecondaryColor} text-center my-5 italic`}>
                  Cargando próximos partidos...
                </Text>
              ) : upcomingMatches.length === 0 ? (
                <Text className={`${textSecondaryColor} text-center my-5 italic`}>
                  No hay próximos partidos programados
                </Text>
              ) : (
                upcomingMatches.map((match, index) => (
                  <View key={match.id || index}>{renderMatchItem({ item: match })}</View>
                ))
              )}
            </View>

            <View className="flex-row justify-between items-center px-4 mb-3 mt-2">
              <Text className={`${textColor} text-lg font-semibold`}>Torneos activos</Text>
              <TouchableOpacity onPress={() => router.push('/tournaments')}>
                <Text className="text-blue-500 font-semibold">Ver todos</Text>
              </TouchableOpacity>
            </View>

            <View className="px-4">
              {loading ? (
                <Text className={`${textSecondaryColor} text-center my-5 italic`}>
                  Cargando torneos activos...
                </Text>
              ) : activeTournaments.length === 0 ? (
                <Text className={`${textSecondaryColor} text-center my-5 italic`}>
                  No hay torneos activos actualmente
                </Text>
              ) : (
                activeTournaments.map((tournament, index) => (
                  <View key={tournament.id || index}>{renderTournamentItem({ item: tournament })}</View>
                ))
              )}
            </View>
          </>
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}