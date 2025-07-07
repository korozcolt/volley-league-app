// app/(tabs)/matches.tsx - Migrado a providers
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Match, MatchStatus } from '@/lib/types/models';
import { useEffect, useState } from 'react';
// 🎯 IMPORTS AGNÓSTICOS - No más Supabase directo
import { useLiveMatches, useMatches } from '@/lib/hooks/useMatches';

import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

type MatchFilter = 'all' | 'upcoming' | 'live' | 'completed';

export default function MatchesScreen() {
  // 🔄 HOOKS AGNÓSTICOS
  const { 
    matches, 
    loading, 
    error, 
    refreshing, 
    fetchMatches, 
    refresh, 
    clearError 
  } = useMatches({ autoFetch: true });
  
  const { matches: liveMatches } = useLiveMatches();
  const { isAdmin } = useAuth();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  
  // Estados locales
  const [selectedFilter, setSelectedFilter] = useState<MatchFilter>('all');

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'Reintentar', onPress: () => { clearError(); fetchMatches(); } },
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  // 🔍 FILTRAR PARTIDOS
  const getFilteredMatches = (): Match[] => {
    const now = new Date();
    
    switch (selectedFilter) {
      case 'upcoming':
        return matches.filter(match => 
          match.status === MatchStatus.SCHEDULED && 
          new Date(match.match_date) > now
        );
      case 'live':
        return matches.filter(match => match.status === MatchStatus.IN_PROGRESS);
      case 'completed':
        return matches.filter(match => match.status === MatchStatus.COMPLETED);
      default:
        return matches;
    }
  };

  const filteredMatches = getFilteredMatches();

  const navigateToMatchDetails = (matchId: string) => {
    router.push(`/match/${matchId}`);
  };

  const navigateToCreateMatch = () => {
    router.push('/match/create');
  };

  const getStatusColor = (status: MatchStatus): string => {
    switch (status) {
      case MatchStatus.SCHEDULED:
        return '#3B82F6';
      case MatchStatus.IN_PROGRESS:
        return '#10B981';
      case MatchStatus.COMPLETED:
        return '#6B7280';
      case MatchStatus.CANCELLED:
        return '#EF4444';
      case MatchStatus.POSTPONED:
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: MatchStatus): string => {
    switch (status) {
      case MatchStatus.SCHEDULED:
        return 'Programado';
      case MatchStatus.IN_PROGRESS:
        return 'En Vivo';
      case MatchStatus.COMPLETED:
        return 'Finalizado';
      case MatchStatus.CANCELLED:
        return 'Cancelado';
      case MatchStatus.POSTPONED:
        return 'Pospuesto';
      default:
        return 'Desconocido';
    }
  };

  const renderMatchItem = ({ item: match }: { item: Match }) => {
    const matchDate = new Date(match.match_date);
    const isToday = matchDate.toDateString() === new Date().toDateString();
    const isLive = match.status === MatchStatus.IN_PROGRESS;
    
    return (
      <TouchableOpacity
        style={[
          styles.matchCard,
          { backgroundColor: Colors[colorScheme].card },
          isLive && styles.liveMatchCard
        ]}
        onPress={() => navigateToMatchDetails(match.id)}
      >
        <ThemedView style={styles.matchHeader}>
          <ThemedView style={styles.matchInfo}>
            <ThemedText style={styles.tournamentName}>
              {match.tournament?.name || 'Sin torneo'}
            </ThemedText>
            <ThemedView style={styles.dateTimeContainer}>
              <Ionicons 
                name="calendar-outline" 
                size={14} 
                color={Colors[colorScheme].tabIconDefault} 
              />
              <ThemedText style={styles.dateText}>
                {isToday ? 'HOY' : matchDate.toLocaleDateString()}
              </ThemedText>
              <Ionicons 
                name="time-outline" 
                size={14} 
                color={Colors[colorScheme].tabIconDefault} 
                style={styles.timeIcon}
              />
              <ThemedText style={styles.timeText}>
                {matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(match.status) }
            ]}
          >
            <ThemedText style={styles.statusText}>
              {getStatusText(match.status)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.teamsContainer}>
          <ThemedView style={styles.teamContainer}>
            <ThemedText style={styles.teamName}>
              {match.home_team?.name || 'Equipo Local'}
            </ThemedText>
            {match.status === MatchStatus.COMPLETED && (
              <ThemedText style={styles.teamScore}>
                {match.home_score || 0}
              </ThemedText>
            )}
          </ThemedView>
          
          <ThemedView style={styles.vsContainer}>
            <ThemedText style={styles.vsText}>VS</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.teamContainer}>
            <ThemedText style={styles.teamName}>
              {match.away_team?.name || 'Equipo Visitante'}
            </ThemedText>
            {match.status === MatchStatus.COMPLETED && (
              <ThemedText style={styles.teamScore}>
                {match.away_score || 0}
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>

        {match.location && (
          <ThemedView style={styles.locationContainer}>
            <Ionicons 
              name="location-outline" 
              size={14} 
              color={Colors[colorScheme].tabIconDefault} 
            />
            <ThemedText style={styles.locationText}>
              {match.location}
            </ThemedText>
          </ThemedView>
        )}

        {isLive && (
          <ThemedView style={styles.liveIndicator}>
            <ThemedView style={styles.liveDot} />
            <ThemedText style={styles.liveText}>EN VIVO</ThemedText>
          </ThemedView>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filter: MatchFilter, label: string, count: number) => {
    const isSelected = selectedFilter === filter;
    
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isSelected && { backgroundColor: Colors[colorScheme].tint },
          !isSelected && { backgroundColor: Colors[colorScheme].card }
        ]}
        onPress={() => setSelectedFilter(filter)}
      >
        <ThemedText 
          style={[
            styles.filterButtonText,
            isSelected && styles.filterButtonTextSelected
          ]}
        >
          {label}
        </ThemedText>
        <ThemedText 
          style={[
            styles.filterCount,
            isSelected && styles.filterCountSelected
          ]}
        >
          {count}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <ThemedText style={styles.loadingText}>Cargando partidos...</ThemedText>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={styles.centerContainer}>
        <Ionicons 
          name="calendar-outline" 
          size={64} 
          color={Colors[colorScheme].tabIconDefault} 
        />
        <ThemedText style={styles.emptyText}>
          {selectedFilter === 'all' 
            ? 'No hay partidos registrados'
            : `No hay partidos ${selectedFilter === 'upcoming' ? 'próximos' : 
                                selectedFilter === 'live' ? 'en vivo' : 'completados'}`
          }
        </ThemedText>
        {isAdmin && selectedFilter === 'all' && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={navigateToCreateMatch}
          >
            <ThemedText style={styles.createButtonText}>
              Crear primer partido
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    );
  };

  const renderHeader = () => (
    <ThemedView style={styles.header}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={styles.title}>Partidos</ThemedText>
        {liveMatches.length > 0 && (
          <ThemedView style={styles.liveIndicatorHeader}>
            <ThemedView style={styles.liveDotHeader} />
            <ThemedText style={styles.liveTextHeader}>
              {liveMatches.length} en vivo
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* 🔄 FILTROS */}
      <ThemedView style={styles.filtersContainer}>
        {renderFilterButton('all', 'Todos', matches.length)}
        {renderFilterButton(
          'upcoming', 
          'Próximos', 
          matches.filter(m => m.status === MatchStatus.SCHEDULED && new Date(m.match_date) > new Date()).length
        )}
        {renderFilterButton(
          'live', 
          'En Vivo', 
          matches.filter(m => m.status === MatchStatus.IN_PROGRESS).length
        )}
        {renderFilterButton(
          'completed', 
          'Finalizados', 
          matches.filter(m => m.status === MatchStatus.COMPLETED).length
        )}
      </ThemedView>

      {/* ➕ BOTÓN CREAR (Solo para admins) */}
      {isAdmin && (
        <TouchableOpacity 
          style={[styles.createMatchButton, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={navigateToCreateMatch}
        >
          <ThemedText style={styles.createMatchButtonText}>
            ➕ Programar Partido
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filteredMatches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={refreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  liveIndicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDotHeader: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveTextHeader: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextSelected: {
    color: 'white',
  },
  filterCount: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  filterCountSelected: {
    color: 'white',
  },
  createMatchButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createMatchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  matchCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  liveMatchCard: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  timeIcon: {
    marginLeft: 12,
  },
  timeText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  teamScore: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    marginRight: 3,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  createButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});