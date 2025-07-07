import { Tournament, TournamentStatus } from '../types/models';
// lib/hooks/useTournaments.ts - Hook agnóstico para gestión de torneos
import { useCallback, useEffect, useState } from 'react';

import { TournamentFilters } from '../providers/interfaces/ITournamentsProvider';
import { tournaments } from '../providers';

interface UseTournamentsOptions {
    autoFetch?: boolean;
    filters?: TournamentFilters;
    refreshInterval?: number;
}

interface UseTournamentsReturn {
    tournaments: Tournament[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;

    // CRUD Operations
    fetchTournaments: (filters?: TournamentFilters) => Promise<void>;
    createTournament: (tournamentData: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
    updateTournament: (id: string, tournamentData: Partial<Tournament>) => Promise<{ success: boolean; error?: string }>;
    deleteTournament: (id: string) => Promise<{ success: boolean; error?: string }>;

    // Specific Operations
    searchTournaments: (query: string) => Promise<void>;
    getTournamentsByStatus: (status: string) => Promise<void>;
    getTournamentStats: (id: string) => Promise<{ success: boolean; stats?: any; error?: string }>;

    // Team Management
    addTeamToTournament: (tournamentId: string, teamId: string) => Promise<{ success: boolean; error?: string }>;
    removeTeamFromTournament: (tournamentId: string, teamId: string) => Promise<{ success: boolean; error?: string }>;
    getTournamentTeams: (tournamentId: string) => Promise<{ success: boolean; teams?: any[]; error?: string }>;

    // Utilities
    getTournamentById: (id: string) => Tournament | undefined;
    refresh: () => Promise<void>;
    clearError: () => void;
}

export function useTournaments(options: UseTournamentsOptions = {}): UseTournamentsReturn {
    const {
        autoFetch = true,
        filters,
        refreshInterval
    } = options;

    // Estados principales
    const [tournamentsList, setTournamentsList] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // 🔄 AUTO FETCH al montar el componente
    useEffect(() => {
        if (autoFetch) {
            fetchTournaments(filters);
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
     * Obtener torneos con filtros
     */
    const fetchTournaments = useCallback(async (fetchFilters?: TournamentFilters) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await tournaments.getAll(fetchFilters || filters);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setTournamentsList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo torneos';
            console.error('Error fetching tournaments:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    /**
     * Crear nuevo torneo
     */
    const createTournament = useCallback(async (
        tournamentData: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: createError } = await tournaments.create(tournamentData);

            if (createError) {
                throw new Error(createError);
            }

            if (data) {
                // Agregar el nuevo torneo a la lista local
                setTournamentsList(prev => [data, ...prev]);
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error creando torneo';
            console.error('Error creating tournament:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Actualizar torneo existente
     */
    const updateTournament = useCallback(async (
        id: string,
        tournamentData: Partial<Tournament>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: updateError } = await tournaments.update(id, tournamentData);

            if (updateError) {
                throw new Error(updateError);
            }

            if (data) {
                // Actualizar el torneo en la lista local
                setTournamentsList(prev =>
                    prev.map(tournament => tournament.id === id ? data : tournament)
                );
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error actualizando torneo';
            console.error('Error updating tournament:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Eliminar torneo
     */
    const deleteTournament = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { error: deleteError } = await tournaments.delete(id);

            if (deleteError) {
                throw new Error(deleteError);
            }

            // Remover el torneo de la lista local
            setTournamentsList(prev => prev.filter(tournament => tournament.id !== id));

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error eliminando torneo';
            console.error('Error deleting tournament:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Buscar torneos por texto
     */
    const searchTournaments = useCallback(async (query: string) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: searchError } = await tournaments.search(query);

            if (searchError) {
                throw new Error(searchError);
            }

            setTournamentsList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error buscando torneos';
            console.error('Error searching tournaments:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener torneos por estado
     */
    const getTournamentsByStatus = useCallback(async (status: string) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: statusError } = await tournaments.getByStatus(status);

            if (statusError) {
                throw new Error(statusError);
            }

            setTournamentsList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo torneos por estado';
            console.error('Error getting tournaments by status:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Obtener estadísticas del torneo
     */
    const getTournamentStats = useCallback(async (id: string): Promise<{ success: boolean; stats?: any; error?: string }> => {
        try {
            setError(null);

            const { data, error: statsError } = await tournaments.getStats(id);

            if (statsError) {
                throw new Error(statsError);
            }

            return { success: true, stats: data };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo estadísticas';
            console.error('Error getting tournament stats:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Agregar equipo al torneo
     */
    const addTeamToTournament = useCallback(async (
        tournamentId: string,
        teamId: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { error: addError } = await tournaments.addTeam(tournamentId, teamId);

            if (addError) {
                throw new Error(addError);
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error agregando equipo al torneo';
            console.error('Error adding team to tournament:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Remover equipo del torneo
     */
    const removeTeamFromTournament = useCallback(async (
        tournamentId: string,
        teamId: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { error: removeError } = await tournaments.removeTeam(tournamentId, teamId);

            if (removeError) {
                throw new Error(removeError);
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error removiendo equipo del torneo';
            console.error('Error removing team from tournament:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Obtener equipos del torneo
     */
    const getTournamentTeams = useCallback(async (tournamentId: string): Promise<{ success: boolean; teams?: any[]; error?: string }> => {
        try {
            setError(null);

            const { data, error: teamsError } = await tournaments.getTeams(tournamentId);

            if (teamsError) {
                throw new Error(teamsError);
            }

            return { success: true, teams: data };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo equipos del torneo';
            console.error('Error getting tournament teams:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    const getTournamentById = useCallback((id: string): Tournament | undefined => {
        return tournamentsList.find(tournament => tournament.id === id);
    }, [tournamentsList]);

    /**
     * Refrescar datos (para pull-to-refresh)
     */
    const refresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await fetchTournaments(filters);
        } finally {
            setRefreshing(false);
        }
    }, [fetchTournaments, filters]);

    /**
     * Limpiar error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        tournaments: tournamentsList,
        loading,
        error,
        refreshing,

        // CRUD Operations
        fetchTournaments,
        createTournament,
        updateTournament,
        deleteTournament,

        // Specific Operations
        searchTournaments,
        getTournamentsByStatus,
        getTournamentStats,

        // Team Management
        addTeamToTournament,
        removeTeamFromTournament,
        getTournamentTeams,

        // Utilities
        getTournamentById,  // ✅ AGREGADO
        refresh,
        clearError,
    };
}

// 🎯 HOOKS ESPECIALIZADOS

/**
 * Hook para obtener solo torneos activos
 */
export function useActiveTournaments() {
    return useTournaments({
        filters: { 
            status: [TournamentStatus.IN_PROGRESS, TournamentStatus.UPCOMING]
        },
        autoFetch: true,
    });
}


/**
 * Hook para búsqueda de torneos en tiempo real
 */
export function useTournamentSearch(initialQuery: string = '') {
    const [query, setQuery] = useState(initialQuery);
    const [searchResults, setSearchResults] = useState<Tournament[]>([]);
    const [searching, setSearching] = useState(false);

    const searchTournaments = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const { data, error } = await tournaments.search(searchQuery);

            if (error) {
                console.error('Error searching tournaments:', error);
                return;
            }

            setSearchResults(data);
        } catch (error) {
            console.error('Error searching tournaments:', error);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            searchTournaments(query);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query, searchTournaments]);

    return {
        query,
        setQuery,
        searchResults,
        searching,
        clearResults: () => setSearchResults([]),
    };
}

/**
 * Hook para estadísticas de torneo
 */
export function useTournamentStats(tournamentId: string | null) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!tournamentId) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error: statsError } = await tournaments.getStats(tournamentId);

            if (statsError) {
                throw new Error(statsError);
            }

            setStats(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo estadísticas';
            console.error('Error fetching tournament stats:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [tournamentId]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refresh: fetchStats };
}