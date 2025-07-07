// app/(tabs)/index.tsx - CORREGIDO
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Match, MatchStatus, Team, Tournament, TournamentStatus } from '@/lib/types/models';
import { useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { router } from 'expo-router';
import { useActiveTeams } from '@/lib/hooks/useTeams';
import { useActiveTournaments } from '@/lib/hooks/useTournaments';
// ✅ IMPORTS CORREGIDOS - Backend agnóstico
import { useAuth } from '@/lib/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUpcomingMatches } from '@/lib/hooks/useMatches';

export default function HomeScreen() {
  // 🔄 HOOKS AGNÓSTICOS
  const { userDetails, isAdmin } = useAuth();
  const { upcomingMatches, loading: matchesLoading, refresh: refreshMatches } = useUpcomingMatches(5);
  const { tournaments: activeTournaments, loading: tournamentsLoading, refresh: refreshTournaments } = useActiveTournaments();
  const { teams: activeTeams, loading: teamsLoading, refresh: refreshTeams } = useActiveTeams();
  
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const [refreshing, setRefreshing] = useState(false);
  
  // Determinar colores basado en el tema
  const bgColor = colorScheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgColor = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  // 🔄 REFRESH GLOBAL
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshMatches(),
        refreshTournaments(),
        refreshTeams()
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      Alert.alert('Error', 'Error actualizando datos');
    } finally {
      setRefreshing(false);
    }
  };

  // 📊 ESTADÍSTICAS RÁPIDAS
  const quickStats = {
    activeTournaments: activeTournaments.length,
    activeTeams: activeTeams.length,
    upcomingMatches: upcomingMatches.length,
    completedMatches: 0 // Se puede agregar con un hook específico
  };

  const renderQuickStats = () => (
    <View className="mb-6">
      <Text className={`text-xl font-bold mb-4 ${textColor}`}>
        Resumen
      </Text>
      <View className="flex-row justify-between">
        <View className={`${cardBgColor} rounded-lg p-4 flex-1 mr-2 shadow-sm`}>
          <Text className={`text-2xl font-bold ${textColor}`}>
            {quickStats.activeTournaments}
          </Text>
          <Text className={`text-sm ${textSecondaryColor}`}>
            Torneos Activos
          </Text>
        </View>
        <View className={`${cardBgColor} rounded-lg p-4 flex-1 mx-1 shadow-sm`}>
          <Text className={`text-2xl font-bold ${textColor}`}>
            {quickStats.activeTeams}
          </Text>
          <Text className={`text-sm ${textSecondaryColor}`}>
            Equipos Activos
          </Text>
        </View>
        <View className={`${cardBgColor} rounded-lg p-4 flex-1 ml-2 shadow-sm`}>
          <Text className={`text-2xl font-bold ${textColor}`}>
            {quickStats.upcomingMatches}
          </Text>
          <Text className={`text-sm ${textSecondaryColor}`}>
            Próximos Partidos
          </Text>
        </View>
      </View>
    </View>
  );

  const renderUpcomingMatch = ({ item: match }: { item: Match }) => {
    const matchDate = new Date(match.match_date);
    const isToday = matchDate.toDateString() === new Date().toDateString();
    
    return (
      <TouchableOpacity
        className={`${cardBgColor} rounded-lg p-4 mb-3 shadow-sm`}
        onPress={() => router.push(`/match/${match.id}`)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-2">
              <Text className={`font-semibold ${textColor}`}>
                {match.home_team?.name || 'Equipo Local'} vs {match.away_team?.name || 'Equipo Visitante'}
              </Text>
              <View className={`px-2 py-1 rounded ${isToday ? 'bg-red-100' : 'bg-blue-100'}`}>
                <Text className={`text-xs font-medium ${isToday ? 'text-red-800' : 'text-blue-800'}`}>
                  {isToday ? 'HOY' : matchDate.toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons 
                name="time-outline" 
                size={14} 
                color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} 
              />
              <Text className={`text-sm ml-1 ${textSecondaryColor}`}>
                {matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {match.location && (
                <>
                  <Ionicons 
                    name="location-outline" 
                    size={14} 
                    color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} 
                    className="ml-4"
                  />
                  <Text className={`text-sm ml-1 ${textSecondaryColor}`}>
                    {match.location}
                  </Text>
                </>
              )}
            </View>
            
            {match.tournament && (
              <Text className={`text-xs mt-1 ${textSecondaryColor}`}>
                {match.tournament.name}
              </Text>
            )}
          </View>
          
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderActiveTournament = ({ item: tournament }: { item: Tournament }) => (
    <TouchableOpacity
      className={`${cardBgColor} rounded-lg p-4 mb-3 shadow-sm`}
      onPress={() => router.push(`/tournament/${tournament.id}`)}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className={`font-semibold ${textColor} mb-1`}>
            {tournament.name}
          </Text>
          <Text className={`text-sm ${textSecondaryColor} mb-2`}>
            {tournament.description || 'Sin descripción'}
          </Text>
          <View className="flex-row items-center">
            <View className={`px-2 py-1 rounded ${
              tournament.status === TournamentStatus.IN_PROGRESS ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <Text className={`text-xs font-medium ${
                tournament.status === TournamentStatus.IN_PROGRESS ? 'text-green-800' : 'text-blue-800'
              }`}>
                {tournament.status === TournamentStatus.IN_PROGRESS ? 'En Progreso' : 'Próximamente'}
              </Text>
            </View>
            <Text className={`text-xs ml-2 ${textSecondaryColor}`}>
              {tournament.type === 'elimination' ? 'Eliminación' : 'Por Puntos'}
            </Text>
          </View>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className={`flex-1 ${bgColor}`}>
      <FlatList
        className="px-4 pt-4"
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={() => (
          <>
            {/* 👋 SALUDO PERSONALIZADO */}
            <View className="mb-6">
              <Text className={`text-2xl font-bold ${textColor}`}>
                ¡Hola, {userDetails?.full_name || 'Usuario'}!
              </Text>
              <Text className={`text-base ${textSecondaryColor}`}>
                Bienvenido a Volley League
              </Text>
            </View>

            {/* 📊 ESTADÍSTICAS RÁPIDAS */}
            {renderQuickStats()}

            {/* 🏐 PRÓXIMOS PARTIDOS */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className={`text-xl font-bold ${textColor}`}>
                  Próximos Partidos
                </Text>
                <TouchableOpacity onPress={() => router.push('/matches')}>
                  <Text className="text-blue-600 font-medium">Ver todos</Text>
                </TouchableOpacity>
              </View>
              
              {matchesLoading ? (
                <View className={`${cardBgColor} rounded-lg p-6 items-center shadow-sm`}>
                  <Text className={textSecondaryColor}>Cargando partidos...</Text>
                </View>
              ) : upcomingMatches.length > 0 ? (
                upcomingMatches.slice(0, 3).map((match) => (
                  <View key={match.id}>
                    {renderUpcomingMatch({ item: match })}
                  </View>
                ))
              ) : (
                <View className={`${cardBgColor} rounded-lg p-6 items-center shadow-sm`}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={48} 
                    color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'} 
                  />
                  <Text className={`mt-2 ${textSecondaryColor}`}>
                    No hay partidos programados
                  </Text>
                </View>
              )}
            </View>

            {/* 🏆 TORNEOS ACTIVOS */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className={`text-xl font-bold ${textColor}`}>
                  Torneos Activos
                </Text>
                <TouchableOpacity onPress={() => router.push('/tournaments')}>
                  <Text className="text-blue-600 font-medium">Ver todos</Text>
                </TouchableOpacity>
              </View>
              
              {tournamentsLoading ? (
                <View className={`${cardBgColor} rounded-lg p-6 items-center shadow-sm`}>
                  <Text className={textSecondaryColor}>Cargando torneos...</Text>
                </View>
              ) : activeTournaments.length > 0 ? (
                activeTournaments.slice(0, 2).map((tournament) => (
                  <View key={tournament.id}>
                    {renderActiveTournament({ item: tournament })}
                  </View>
                ))
              ) : (
                <View className={`${cardBgColor} rounded-lg p-6 items-center shadow-sm`}>
                  <Ionicons 
                    name="trophy-outline" 
                    size={48} 
                    color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'} 
                  />
                  <Text className={`mt-2 ${textSecondaryColor}`}>
                    No hay torneos activos
                  </Text>
                </View>
              )}
            </View>

            {isAdmin() && (
              <View className="mb-6">
                <Text className={`text-xl font-bold mb-4 ${textColor}`}>
                  Acciones Rápidas
                </Text>
                <View className="flex-row justify-between">
                  <TouchableOpacity 
                    className="bg-blue-600 rounded-lg p-4 flex-1 mr-2 items-center"
                    onPress={() => router.push('/tournament/create')}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text className="text-white font-medium mt-1">Crear Torneo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="bg-green-600 rounded-lg p-4 flex-1 mx-1 items-center"
                    onPress={() => router.push('/team/create')}
                  >
                    <Ionicons name="people-outline" size={24} color="white" />
                    <Text className="text-white font-medium mt-1">Crear Equipo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="bg-purple-600 rounded-lg p-4 flex-1 ml-2 items-center"
                    onPress={() => router.push('/match/create')}
                  >
                    <Ionicons name="calendar-outline" size={24} color="white" />
                    <Text className="text-white font-medium mt-1">Crear Partido</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}