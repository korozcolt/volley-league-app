import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Surface,
  Text,
  useTheme
} from 'react-native-paper';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';

// ✅ USAR LAYOUT BASE
import { DashboardLayout } from '@/components/layout/AppLayout';
import { UserRole } from '@/lib/types/models';
import { router } from 'expo-router';
import { useActiveTeams } from '@/lib/hooks/useTeams';
import { useActiveTournaments } from '@/lib/hooks/useTournaments';
// ✅ IMPORTS EXISTENTES
import { useAuth } from '@/lib/hooks/useAuth';
import { useUpcomingMatches } from '@/lib/hooks/useMatches';

// 🏐 INTERFACES PARA TIPADO ESTRICTO
interface Match {
  id: string;
  match_date: string;
  location?: string;
  home_team?: {
    id: string;
    name: string;
  };
  away_team?: {
    id: string;
    name: string;
  };
}

interface Tournament {
  id: string;
  name: string;
  location?: string;
  start_date: string;
  end_date?: string;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  onPress?: () => void;
}

interface UpcomingMatchCardProps {
  match: Match;
}

interface ActiveTournamentCardProps {
  tournament: Tournament;
}

interface QuickStats {
  activeTournaments: number;
  activeTeams: number;
  upcomingMatches: number;
  completedMatches: number;
}

export default function DashboardScreen() {
  const theme = useTheme();
  const { user, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ✅ USAR HOOKS EXISTENTES CON TIPADO CORRECTO
  const { 
    teams: activeTeams, 
    loading: teamsLoading, 
    refresh: refreshTeams 
  } = useActiveTeams();
  
  const { 
    tournaments: activeTournaments, 
    loading: tournamentsLoading, 
    refresh: refreshTournaments 
  } = useActiveTournaments();
  
  // 🔧 CORREGIR: usar la propiedad correcta del hook
  const { 
    upcomingMatches, // ✅ CORRECCIÓN: usar upcomingMatches en lugar de matches
    loading: matchesLoading, 
    refresh: refreshMatches 
  } = useUpcomingMatches();

  // 🔄 REFRESH GLOBAL CON useCallback PARA OPTIMIZACIÓN
  const onRefresh = useCallback(async (): Promise<void> => {
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
  }, [refreshMatches, refreshTournaments, refreshTeams]);

  // 📊 ESTADÍSTICAS RÁPIDAS CON useMemo PARA PERFORMANCE
  const quickStats: QuickStats = useMemo(() => ({
    activeTournaments: activeTournaments?.length ?? 0,
    activeTeams: activeTeams?.length ?? 0,
    upcomingMatches: upcomingMatches?.length ?? 0,
    completedMatches: 0, // Se puede agregar con un hook específico
  }), [activeTournaments, activeTeams, upcomingMatches]);

  // 🎨 COMPONENTE TARJETA DE ESTADÍSTICAS CON TIPADO ESTRICTO
  const StatsCard: React.FC<StatsCardProps> = ({ 
    title, 
    value, 
    icon, 
    color, 
    onPress 
  }) => (
    <Card 
      className="flex-1 mx-1" 
      onPress={onPress}
      mode="elevated"
    >
      <Card.Content className="items-center p-4">
        <Text 
          variant="displaySmall" 
          style={{ color, fontWeight: 'bold' }}
        >
          {value}
        </Text>
        <Text 
          variant="bodySmall" 
          className="text-center mt-1"
          style={{ color: theme.colors.onSurface }}
        >
          {title}
        </Text>
      </Card.Content>
    </Card>
  );

  // 🏐 COMPONENTE PRÓXIMO PARTIDO CON TIPADO ESTRICTO
  const UpcomingMatchCard: React.FC<UpcomingMatchCardProps> = ({ match }) => {
    const matchDate = new Date(match.match_date);
    const isToday = matchDate.toDateString() === new Date().toDateString();
    
    return (
      <Card className="mb-3" mode="outlined">
        <Card.Content className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text variant="titleMedium" className="flex-1">
              {match.home_team?.name || 'Equipo Local'} vs {match.away_team?.name || 'Equipo Visitante'}
            </Text>
            <Chip 
              mode="outlined"
              style={{ 
                backgroundColor: isToday ? theme.colors.primary : theme.colors.surface 
              }}
            >
              {isToday ? 'Hoy' : 'Próximo'}
            </Chip>
          </View>
          
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            📅 {matchDate.toLocaleDateString()} - {matchDate.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
          
          {match.location && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              📍 {match.location}
            </Text>
          )}
        </Card.Content>
        
        <Card.Actions>
          <Button 
            mode="text" 
            onPress={() => router.push(`/match/${match.id}` as any)} // ✅ CORRECCIÓN: cast temporal para rutas
          >
            Ver detalles
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // 🏆 COMPONENTE TORNEO ACTIVO CON TIPADO ESTRICTO
  const ActiveTournamentCard: React.FC<ActiveTournamentCardProps> = ({ tournament }) => (
    <Card className="mb-3" mode="elevated">
      <Card.Content>
        <View className="flex-row items-center justify-between mb-2">
          <Text variant="titleMedium" className="flex-1">
            {tournament.name}
          </Text>
          <Chip 
            mode="flat"
            style={{ backgroundColor: theme.colors.primaryContainer }}
          >
            En curso
          </Chip>
        </View>
        
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {tournament.location || 'Ubicación por confirmar'}
        </Text>
        
        <Text variant="bodySmall" className="mt-2" style={{ color: theme.colors.onSurfaceVariant }}>
          📅 {new Date(tournament.start_date).toLocaleDateString()} - 
          {tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : 'Por confirmar'}
        </Text>
      </Card.Content>
      
      <Card.Actions>
        <Button 
          mode="text"
          onPress={() => router.push(`/tournament/${tournament.id}` as any)} // ✅ CORRECCIÓN: cast temporal para rutas
        >
          Ver torneo
        </Button>
      </Card.Actions>
    </Card>
  );

  // 🔄 LOADING STATE
  if (teamsLoading || tournamentsLoading || matchesLoading) {
    return (
      <DashboardLayout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" className="mt-4">
            Cargando dashboard...
          </Text>
        </View>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={ // ✅ CORRECCIÓN: usar RefreshControl en lugar de refreshing/onRefresh directas
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* 👋 SALUDO PERSONALIZADO */}
        <Surface className="p-4 mb-4 rounded-lg" mode="elevated">
          <Text variant="headlineSmall" className="mb-1">
            ¡Hola, {user?.name || user?.email?.split('@')[0] || 'Usuario'}! 👋 {/* ✅ CORRECCIÓN: usar propiedades existentes */}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Bienvenido a la Liga de Voleibol
          </Text>
        </Surface>

        {/* 📊 ESTADÍSTICAS RÁPIDAS */}
        <Text variant="titleLarge" className="mb-4">
          Resumen
        </Text>
        
        <View className="flex-row mb-6">
          <StatsCard
            title="Torneos Activos"
            value={quickStats.activeTournaments}
            icon="🏆"
            color={theme.colors.primary}
            onPress={() => router.push('/tournaments' as any)}
          />
          <StatsCard
            title="Equipos Activos"
            value={quickStats.activeTeams}
            icon="👥"
            color={theme.colors.secondary}
            onPress={() => router.push('/teams' as any)}
          />
          <StatsCard
            title="Próximos Partidos"
            value={quickStats.upcomingMatches}
            icon="🏐"
            color={theme.colors.tertiary}
            onPress={() => router.push('/matches' as any)}
          />
        </View>

        {/* 🏐 PRÓXIMOS PARTIDOS */}
        {quickStats.upcomingMatches > 0 && (
          <>
            <View className="flex-row justify-between items-center mb-4">
              <Text variant="titleLarge">
                Próximos Partidos
              </Text>
              <Button 
                mode="text" 
                onPress={() => router.push('/matches' as any)}
              >
                Ver todos
              </Button>
            </View>
            
            {upcomingMatches?.slice(0, 3).map((match) => (
              <UpcomingMatchCard key={match.id} match={match} />
            ))}
          </>
        )}

        {/* 🏆 TORNEOS ACTIVOS */}
        {quickStats.activeTournaments > 0 && (
          <>
            <View className="flex-row justify-between items-center mb-4 mt-2">
              <Text variant="titleLarge">
                Torneos en Curso
              </Text>
              <Button 
                mode="text" 
                onPress={() => router.push('/tournaments' as any)}
              >
                Ver todos
              </Button>
            </View>
            
            {activeTournaments?.slice(0, 2).map((tournament) => (
              <ActiveTournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </>
        )}

        {/* ⚡ ACCIONES RÁPIDAS (Solo para admins) */}
        {hasRole && hasRole(UserRole.ADMIN) && (
          <>
            <Text variant="titleLarge" className="mb-4 mt-2">
              Acciones Rápidas
            </Text>
            
            <Card className="mb-4" mode="outlined">
              <Card.Content>
                <Text variant="titleMedium" className="mb-3">
                  Panel de Administración
                </Text>
                
                <View className="flex-row flex-wrap gap-2">
                  <Button 
                    mode="contained-tonal" 
                    icon="trophy-variant"
                    onPress={() => router.push('/tournament/create' as any)}
                    className="mb-2"
                  >
                    Nuevo Torneo
                  </Button>
                  
                  <Button 
                    mode="contained-tonal" 
                    icon="account-group"
                    onPress={() => router.push('/team/create' as any)}
                    className="mb-2"
                  >
                    Nuevo Equipo
                  </Button>
                  
                  <Button 
                    mode="contained-tonal" 
                    icon="volleyball"
                    onPress={() => router.push('/match/create' as any)}
                    className="mb-2"
                  >
                    Nuevo Partido
                  </Button>
                  
                  <Button 
                    mode="contained-tonal" 
                    icon="cog"
                    onPress={() => router.push('/admin/settings' as any)} // ✅ CORRECCIÓN: ruta más específica
                    className="mb-2"
                  >
                    Configuración
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </>
        )}

        {/* 📭 ESTADO VACÍO */}
        {quickStats.activeTournaments === 0 && quickStats.upcomingMatches === 0 && (
          <Card className="mt-4" mode="outlined">
            <Card.Content className="items-center p-8">
              <Text variant="displaySmall" className="mb-2">
                🏐
              </Text>
              <Text variant="titleMedium" className="mb-2 text-center">
                ¡Bienvenido a la Liga de Voleibol!
              </Text>
              <Text 
                variant="bodyMedium" 
                className="text-center mb-4"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                No hay actividad reciente. Los torneos y partidos aparecerán aquí cuando se creen.
              </Text>
              
              {hasRole && hasRole(UserRole.ADMIN) && (
                <Button 
                  mode="contained" 
                  icon="plus"
                  onPress={() => router.push('/tournament/create' as any)}
                >
                  Crear primer torneo
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </DashboardLayout>
  );
}