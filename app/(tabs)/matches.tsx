import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Match, MatchStatus } from '@/lib/types/models';
// app/(tabs)/matches.tsx - CORREGIDO COMPLETO
import React, { useEffect, useState } from 'react';
// 🎯 IMPORTS AGNÓSTICOS - Limpios y específicos (sin imports no utilizados)
import { useLiveMatches, useMatches } from '@/lib/hooks/useMatches';

import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
// Componentes y tipos necesarios
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
  
  // 🚨 CORREGIDO - isAdmin puede ser boolean o función
  const authContext = useAuth();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  
  // Estados locales
  const [selectedFilter, setSelectedFilter] = useState<MatchFilter>('all');

  // ✅ DETERMINAR SI ES ADMIN - Manejando ambos casos
  const isAdmin = typeof authContext.isAdmin === 'function' 
    ? authContext.isAdmin() 
    : Boolean(authContext.isAdmin);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'Reintentar', onPress: () => { clearError(); fetchMatches(); } },
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError, fetchMatches]);

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
        return 'En vivo';
      case MatchStatus.COMPLETED:
        return 'Finalizado';
      case MatchStatus.CANCELLED:
        return 'Cancelado';
      case MatchStatus.POSTPONED:
        return 'Pospuesto';
      case MatchStatus.TBA:
        return 'Por anunciar';
      case MatchStatus.TBC:
        return 'Por confirmar';
      case MatchStatus.TIEBREAKER:
        return 'Desempate';
      default:
        return 'Desconocido';
    }
  };

  const formatMatchDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFilterButton = (filter: MatchFilter, label: string) => {
    const isSelected = selectedFilter === filter;
    
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: isSelected 
              ? Colors[colorScheme].tint 
              : Colors[colorScheme].card,
            borderColor: Colors[colorScheme].tint
          }
        ]}
        onPress={() => setSelectedFilter(filter)}
      >
        <ThemedText 
          style={[
            styles.filterButtonText,
            { color: isSelected ? '#FFFFFF' : Colors[colorScheme].text }
          ]}
        >
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const renderMatchItem = ({ item }: { item: Match }) => {
    return (
      <TouchableOpacity
        style={[
          styles.matchCard,
          { backgroundColor: Colors[colorScheme].card }
        ]}
        onPress={() => navigateToMatchDetails(item.id)}
      >
        <View style={styles.matchHeader}>
          <View style={styles.teamsContainer}>
            <ThemedText style={styles.teamName}>
              {item.home_team?.name || 'Equipo Local'}
            </ThemedText>
            <ThemedText style={styles.vsText}>VS</ThemedText>
            <ThemedText style={styles.teamName}>
              {item.away_team?.name || 'Equipo Visitante'}
            </ThemedText>
          </View>
          
          <View 
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}
          >
            <ThemedText style={styles.statusText}>
              {getStatusText(item.status)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.matchDetails}>
          <View style={styles.scoreContainer}>
            <ThemedText style={styles.scoreText}>
              {item.home_score} - {item.away_score}
            </ThemedText>
            {item.sets_home > 0 || item.sets_away > 0 ? (
              <ThemedText style={styles.setsText}>
                Sets: {item.sets_home} - {item.sets_away}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.matchInfo}>
            <ThemedText style={styles.dateText}>
              {formatMatchDate(item.match_date)}
            </ThemedText>
            {item.location && (
              <ThemedText style={styles.locationText}>
                📍 {item.location}
              </ThemedText>
            )}
          </View>
        </View>

        {item.status === MatchStatus.IN_PROGRESS && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveText}>EN VIVO</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <ThemedText style={styles.loadingText}>
            Cargando partidos...
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons
          name="basketball-outline"
          size={64}
          color={Colors[colorScheme].tabIconDefault}
        />
        <ThemedText style={styles.emptyTitle}>
          No hay partidos
        </ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          {selectedFilter === 'all' 
            ? 'No se encontraron partidos programados'
            : `No hay partidos ${
                selectedFilter === 'upcoming' ? 'próximos' :
                selectedFilter === 'live' ? 'en vivo' : 'completados'
              }`
          }
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header con filtros */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>Partidos</ThemedText>
        
        {/* ✅ CORREGIDO - Condición simplificada y correcta */}
        {isAdmin && (
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: Colors[colorScheme].tint }
            ]}
            onPress={navigateToCreateMatch}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        {renderFilterButton('all', 'Todos')}
        {renderFilterButton('upcoming', 'Próximos')}
        {renderFilterButton('live', 'En vivo')}
        {renderFilterButton('completed', 'Finalizados')}
      </View>

      {/* Lista de partidos */}
      <FlatList
        data={filteredMatches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={refresh}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  matchCard: {
    padding: 16,
    borderRadius: 12,
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
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  matchDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  setsText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  matchInfo: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    opacity: 0.8,
  },
  locationText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  liveIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});