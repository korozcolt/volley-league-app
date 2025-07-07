// lib/hooks/useMatches.ts - Hook agnóstico para gestión de partidos
import { useCallback, useEffect, useState } from 'react';

import { Match } from '../types/models';
import { MatchFilters } from '../providers/interfaces/IMatchesProvider';
import { matches } from '../providers';

interface UseMatchesOptions {
    autoFetch?: boolean;
    filters?: MatchFilters;
    refreshInterval?: number;
}

interface UseMatchesReturn {
    matches: Match[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;

    // CRUD Operations
    fetchMatches: (filters?: MatchFilters) => Promise<void>;
    createMatch: (matchData: Omit<Match, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
    updateMatch: (id: string, matchData: Partial<Match>) => Promise<{ success: boolean; error?: string }>;
    deleteMatch: (id: string) => Promise<{ success: boolean; error?: string }>;

    // Specific Operations
    getMatchesByTournament: (tournamentId: string) => Promise<void>;
    getMatchesByTeam: (teamId: string) => Promise<void>;
    getMatchesByReferee: (refereeId: string) => Promise<void>;
    getUpcomingMatches: (limit?: number) => Promise<void>;

    // Score Management
    updateMatchScore: (matchId: string, homeScore: number, awayScore: number) => Promise<{ success: boolean; error?: string }>;
    updateMatchStatus: (matchId: string, status: string) => Promise<{ success: boolean; error?: string }>;

    // Utilities
    getMatchById: (id: string) => Match | undefined;
    refresh: () => Promise<void>;
    clearError: () => void;
}

export function useMatches(options: UseMatchesOptions = {}): UseMatchesReturn {
    const {
        autoFetch = true,
        filters,
        refreshInterval
    } = options;

    // Estados principales
    const [matchesList, setMatchesList] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // 🔄 AUTO FETCH al montar el componente
    useEffect(() => {
        if (autoFetch) {
            fetchMatches(filters);
        }
    }, [autoFetch, JSON.stringify(filters)]);

    // ⏰ REFRESH INTERVAL automático
    useEffect(() => {
        if (!refreshInterval || refreshInterval <= 0) return;

        const interval = setInterval(() => {
            refresh();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [refreshInterval]);

    /**
     * Obtener partidos con filtros
     */
    const fetchMatches = useCallback(async (fetchFilters?: MatchFilters) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await matches.getAll(fetchFilters || filters);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setMatchesList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo partidos';
            console.error('Error fetching matches:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    /**
     * Crear nuevo partido
     */
    const createMatch = useCallback(async (
        matchData: Omit<Match, 'id' | 'created_at' | 'updated_at'>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: createError } = await matches.create(matchData);

            if (createError) {
                throw new Error(createError);
            }

            if (data) {
                // Agregar el nuevo partido a la lista local
                setMatchesList(prev => [data, ...prev]);
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error creando partido';
            console.error('Error creating match:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Actualizar partido existente
     */
    const updateMatch = useCallback(async (
        id: string,
        matchData: Partial<Match>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: updateError } = await matches.update(id, matchData);

            if (updateError) {
                throw new Error(updateError);
            }

            if (data) {
                // Actualizar el partido en la lista local
                setMatchesList(prev =>
                    prev.map(match => match.id === id ? data : match)
                );
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error actualizando partido';
            console.error('Error updating match:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Eliminar partido
     */
    const deleteMatch = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { error: deleteError } = await matches.delete(id);

            if (deleteError) {
                throw new Error(deleteError);
            }

            // Remover el partido de la lista local
            setMatchesList(prev => prev.filter(match => match.id !== id));

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error eliminando partido';
            console.error('Error deleting match:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Obtener partidos por torneo
     */
    const getMatchesByTournament = useCallback(async (tournamentId: string) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await matches.getByTournament(tournamentId);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setMatchesList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo partidos por torneo';
            console.error('Error getting matches by tournament:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener partidos por equipo
     */
    const getMatchesByTeam = useCallback(async (teamId: string) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await matches.getByTeam(teamId);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setMatchesList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo partidos por equipo';
            console.error('Error getting matches by team:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener partidos por árbitro
     */
    const getMatchesByReferee = useCallback(async (refereeId: string) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await matches.getByReferee(refereeId);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setMatchesList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo partidos por árbitro';
            console.error('Error getting matches by referee:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener próximos partidos
     */
    const getUpcomingMatches = useCallback(async (limit: number = 10) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await matches.getUpcoming(limit);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setMatchesList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo próximos partidos';
            console.error('Error getting upcoming matches:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Actualizar puntuación del partido
     */
    const updateMatchScore = useCallback(async (
        matchId: string,
        homeScore: number,
        awayScore: number
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: updateError } = await matches.updateScore(matchId, homeScore, awayScore);

            if (updateError) {
                throw new Error(updateError);
            }

            if (data) {
                // Actualizar el partido en la lista local
                setMatchesList(prev =>
                    prev.map(match => match.id === matchId ? data : match)
                );
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error actualizando puntuación';
            console.error('Error updating match score:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Actualizar estado del partido
     */
    const updateMatchStatus = useCallback(async (
        matchId: string,
        status: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: updateError } = await matches.updateStatus(matchId, status);

            if (updateError) {
                throw new Error(updateError);
            }

            if (data) {
                // Actualizar el partido en la lista local
                setMatchesList(prev =>
                    prev.map(match => match.id === matchId ? data : match)
                );
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error actualizando estado del partido';
            console.error('Error updating match status:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Obtener partido por ID
     */
    const getMatchById = useCallback((id: string): Match | undefined => {
        return matchesList.find(match => match.id === id);
    }, [matchesList]);

    /**
     * Refrescar datos (para pull-to-refresh)
     */
    const refresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await fetchMatches(filters);
        } finally {
            setRefreshing(false);
        }
    }, [fetchMatches, filters]);

    /**
     * Limpiar error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        matches: matchesList,
        loading,
        error,
        refreshing,

        // CRUD Operations
        fetchMatches,
        createMatch,
        updateMatch,
        deleteMatch,

        // Specific Operations
        getMatchesByTournament,
        getMatchesByTeam,
        getMatchesByReferee,
        getUpcomingMatches,

        // Score Management
        updateMatchScore,
        updateMatchStatus,

        // Utilities
        getMatchById,
        refresh,
        clearError,
    };
}

// 🎯 HOOKS ESPECIALIZADOS

/**
 * Hook para obtener solo próximos partidos
 */
export function useUpcomingMatches(limit: number = 5) {
    const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUpcoming = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await matches.getUpcoming(limit);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setUpcomingMatches(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo próximos partidos';
            console.error('Error fetching upcoming matches:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchUpcoming();
    }, [fetchUpcoming]);

    return {
        upcomingMatches,
        loading,
        error,
        refresh: fetchUpcoming
    };
}

/**
 * Hook para partidos en vivo (actualización en tiempo real)
 */
export function useLiveMatches() {
    return useMatches({
        filters: { status: ['in_progress'] },
        autoFetch: true,
        refreshInterval: 30000, // Actualizar cada 30 segundos
    });
}

/**
 * Hook para partidos de un equipo específico
 */
export function useTeamMatches(teamId: string | null) {
    const [teamMatches, setTeamMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTeamMatches = useCallback(async () => {
        if (!teamId) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await matches.getByTeam(teamId);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setTeamMatches(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo partidos del equipo';
            console.error('Error fetching team matches:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchTeamMatches();
    }, [fetchTeamMatches]);

    return {
        teamMatches,
        loading,
        error,
        refresh: fetchTeamMatches
    };
}