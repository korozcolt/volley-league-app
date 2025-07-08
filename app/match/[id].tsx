import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { matches } from '@/lib/providers';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Match {
  id: string;
  tournament: any;
  home_team: any;
  away_team: any;
  match_date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  round?: number;
  match_number?: number;
  home_score?: number;
  away_score?: number;
  sets?: Set[];
  referee?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Set {
  set_number: number;
  home_points: number;
  away_points: number;
  status: 'in_progress' | 'completed';
}

export default function MatchDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const { user, hasRole } = useAuth();
  
  // 📊 ESTADO
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoringMode, setScoringMode] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);

  // 🔐 PERMISOS
  const canScore = hasRole(['admin', 'referee']) || match?.referee?.id === user?.id;
  const canManage = hasRole(['admin']);

  // 📱 CARGAR DATOS
  const fetchMatch = async () => {
    if (!id) return;
    
    try {
      setError(null);
      const { data, error: fetchError } = await matches.getById(id);
      
      if (fetchError) {
        throw new Error(fetchError);
      }
      
      setMatch(data);
    } catch (err: any) {
      console.error('Error cargando partido:', err);
      setError(err.message || 'Error cargando el partido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [id]);

  // 🔄 REFRESH
  const handleRefresh = () => {
    setRefreshing(true);
    fetchMatch();
  };

  // 🎯 ACTUALIZAR PUNTUACIÓN
  const updateScore = async (homePoints: number, awayPoints: number, setNumber: number) => {
    if (!match || !canScore) return;

    try {
      const { error } = await matches.updateScore(match.id, {
        set_number: setNumber,
        home_points: homePoints,
        away_points: awayPoints,
      });

      if (error) {
        throw new Error(error);
      }

      // Actualizar estado local
      await fetchMatch();
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo actualizar la puntuación');
      console.error('Error actualizando puntuación:', err);
    }
  };

  // 🏁 CAMBIAR ESTADO DEL PARTIDO
  const changeMatchStatus = async (newStatus: Match['status']) => {
    if (!match || !canManage) return;

    try {
      const { error } = await matches.update(match.id, { status: newStatus });
      
      if (error) {
        throw new Error(error);
      }

      setMatch(prev => prev ? { ...prev, status: newStatus } : null);
      
      Alert.alert(
        'Estado actualizado',
        `El partido ha sido marcado como ${getStatusText(newStatus)}`
      );
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo cambiar el estado del partido');
      console.error('Error cambiando estado:', err);
    }
  };

  // 🎨 HELPERS
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#FF9800';
      case 'in_progress': return '#4CAF50';
      case 'completed': return '#9E9E9E';
      case 'cancelled': return '#f44336';
      default: return '#2196F3';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programado';
      case 'in_progress': return 'En curso';
      case 'completed': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // 🎨 COMPONENTE DE PUNTUACIÓN POR SET
  const SetScore = ({ set, index }: { set: Set; index: number }) => (
    <View style={[styles.setContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
      <View style={styles.setHeader}>
        <ThemedText style={styles.setTitle}>Set {set.set_number}</ThemedText>
        <View style={[
          styles.setStatus,
          { backgroundColor: set.status === 'completed' ? '#4CAF50' : '#FF9800' }
        ]}>
          <ThemedText style={styles.setStatusText}>
            {set.status === 'completed' ? 'Finalizado' : 'En curso'}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.setScoreContainer}>
        <View style={styles.teamScore}>
          <ThemedText style={styles.teamName}>{match?.home_team?.name || 'Local'}</ThemedText>
          <ThemedText style={styles.scoreNumber}>{set.home_points}</ThemedText>
        </View>
        
        <ThemedText style={styles.scoreSeparator}>-</ThemedText>
        
        <View style={styles.teamScore}>
          <ThemedText style={styles.teamName}>{match?.away_team?.name || 'Visitante'}</ThemedText>
          <ThemedText style={styles.scoreNumber}>{set.away_points}</ThemedText>
        </View>
      </View>

      {/* 🎯 CONTROLES DE PUNTUACIÓN */}
      {canScore && scoringMode && set.status === 'in_progress' && (
        <View style={styles.scoringControls}>
          <View style={styles.scoringTeam}>
            <TouchableOpacity
              style={[styles.scoreButton, styles.scoreButtonMinus]}
              onPress={() => updateScore(Math.max(0, set.home_points - 1), set.away_points, set.set_number)}
            >
              <ThemedText style={styles.scoreButtonText}>-</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scoreButton, styles.scoreButtonPlus]}
              onPress={() => updateScore(set.home_points + 1, set.away_points, set.set_number)}
            >
              <ThemedText style={styles.scoreButtonText}>+</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.scoringTeam}>
            <TouchableOpacity
              style={[styles.scoreButton, styles.scoreButtonMinus]}
              onPress={() => updateScore(set.home_points, Math.max(0, set.away_points - 1), set.set_number)}
            >
              <ThemedText style={styles.scoreButtonText}>-</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scoreButton, styles.scoreButtonPlus]}
              onPress={() => updateScore(set.home_points, set.away_points + 1, set.set_number)}
            >
              <ThemedText style={styles.scoreButtonText}>+</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText style={styles.loadingText}>Cargando partido...</ThemedText>
      </ThemedView>
    );
  }

  // ❌ ERROR STATE
  if (error || !match) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>
          {error || 'Partido no encontrado'}
        </ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMatch}>
          <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const dateTime = formatDateTime(match.match_date);

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Partido #${match.match_number || match.id.slice(-4)}`,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
        }} 
      />
      
      <ScrollView
        style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* 🏆 HEADER DEL PARTIDO */}
        <View style={[styles.matchHeader, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <View style={styles.matchTitle}>
            <ThemedText style={styles.matchTournament}>
              {match.tournament?.name || 'Torneo'}
            </ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
              <ThemedText style={styles.statusText}>{getStatusText(match.status)}</ThemedText>
            </View>
          </View>
          
          <View style={styles.teamsContainer}>
            <View style={styles.team}>
              <ThemedText style={styles.teamNameLarge}>{match.home_team?.name || 'Equipo Local'}</ThemedText>
              <ThemedText style={styles.finalScore}>{match.home_score || 0}</ThemedText>
            </View>
            
            <ThemedText style={styles.vsText}>VS</ThemedText>
            
            <View style={styles.team}>
              <ThemedText style={styles.teamNameLarge}>{match.away_team?.name || 'Equipo Visitante'}</ThemedText>
              <ThemedText style={styles.finalScore}>{match.away_score || 0}</ThemedText>
            </View>
          </View>
        </View>

        {/* 📅 INFORMACIÓN DEL PARTIDO */}
        <View style={[styles.infoSection, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <ThemedText style={styles.sectionTitle}>Información del Partido</ThemedText>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>📅 Fecha:</ThemedText>
            <ThemedText style={styles.infoValue}>{dateTime.date}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>🕐 Hora:</ThemedText>
            <ThemedText style={styles.infoValue}>{dateTime.time}</ThemedText>
          </View>
          
          {match.location && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>📍 Ubicación:</ThemedText>
              <ThemedText style={styles.infoValue}>{match.location}</ThemedText>
            </View>
          )}
          
          {match.referee && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>👤 Árbitro:</ThemedText>
              <ThemedText style={styles.infoValue}>{match.referee.name}</ThemedText>
            </View>
          )}
          
          {match.round && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>🔄 Ronda:</ThemedText>
              <ThemedText style={styles.infoValue}>Ronda {match.round}</ThemedText>
            </View>
          )}
        </View>

        {/* 🎯 PUNTUACIÓN POR SETS */}
        {match.sets && match.sets.length > 0 && (
          <View style={[styles.setsSection, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.setsHeader}>
              <ThemedText style={styles.sectionTitle}>Puntuación por Sets</ThemedText>
              {canScore && (
                <TouchableOpacity
                  style={[
                    styles.scoringToggle,
                    { backgroundColor: scoringMode ? '#4CAF50' : Colors[colorScheme ?? 'light'].tint }
                  ]}
                  onPress={() => setScoringMode(!scoringMode)}
                >
                  <ThemedText style={styles.scoringToggleText}>
                    {scoringMode ? '✓ Scoring' : '📝 Scoring'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
            
            {match.sets.map((set, index) => (
              <SetScore key={`set-${set.set_number}`} set={set} index={index} />
            ))}
          </View>
        )}

        {/* 📝 NOTAS */}
        {match.notes && (
          <View style={[styles.notesSection, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <ThemedText style={styles.sectionTitle}>Notas</ThemedText>
            <ThemedText style={styles.notesText}>{match.notes}</ThemedText>
          </View>
        )}

        {/* ⚙️ ACCIONES DE ADMINISTRACIÓN */}
        {canManage && (
          <View style={[styles.actionsSection, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <ThemedText style={styles.sectionTitle}>Acciones</ThemedText>
            
            <View style={styles.actionButtons}>
              {match.status === 'scheduled' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.startButton]}
                  onPress={() => changeMatchStatus('in_progress')}
                >
                  <ThemedText style={styles.actionButtonText}>▶️ Iniciar Partido</ThemedText>
                </TouchableOpacity>
              )}
              
              {match.status === 'in_progress' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.finishButton]}
                  onPress={() => changeMatchStatus('completed')}
                >
                  <ThemedText style={styles.actionButtonText}>🏁 Finalizar Partido</ThemedText>
                </TouchableOpacity>
              )}
              
              {match.status !== 'cancelled' && match.status !== 'completed' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    Alert.alert(
                      'Cancelar Partido',
                      '¿Estás seguro que quieres cancelar este partido?',
                      [
                        { text: 'No', style: 'cancel' },
                        { text: 'Sí, cancelar', onPress: () => changeMatchStatus('cancelled') },
                      ]
                    );
                  }}
                >
                  <ThemedText style={styles.actionButtonText}>❌ Cancelar Partido</ThemedText>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => router.push(`/match/${match.id}/edit`)}
              >
                <ThemedText style={styles.actionButtonText}>✏️ Editar Partido</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 🔗 NAVEGACIÓN RÁPIDA */}
        <View style={[styles.navigationSection, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <ThemedText style={styles.sectionTitle}>Navegación</ThemedText>
          
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.navButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
              onPress={() => router.push(`/tournament/${match.tournament?.id}`)}
            >
              <ThemedText style={styles.navButtonText}>🏆 Ver Torneo</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
              onPress={() => router.push(`/team/${match.home_team?.id}`)}
            >
              <ThemedText style={styles.navButtonText}>🏠 {match.home_team?.name}</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
              onPress={() => router.push(`/team/${match.away_team?.id}`)}
            >
              <ThemedText style={styles.navButtonText}>🚗 {match.away_team?.name}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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

  // 🏆 HEADER DEL PARTIDO
  matchHeader: {
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  matchTournament: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamNameLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    opacity: 0.6,
  },

  // 📅 SECCIONES
  infoSection: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setsSection: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesSection: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsSection: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navigationSection: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  // 📋 INFO ROWS
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },

  // 🎯 SETS Y SCORING
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoringToggle: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  scoringToggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  setContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  setStatus: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  setStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  setScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  scoreSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    opacity: 0.5,
  },
  scoringControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoringTeam: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  scoreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreButtonMinus: {
    backgroundColor: '#f44336',
  },
  scoreButtonPlus: {
    backgroundColor: '#4CAF50',
  },
  scoreButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // 📝 NOTAS
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },

  // ⚙️ ACCIONES
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  finishButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 🔗 NAVEGACIÓN
  navigationButtons: {
    gap: 12,
  },
  navButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});