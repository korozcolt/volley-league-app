// lib/hooks/usePlayers.ts - Hook agnóstico para gestión de jugadores
import { useCallback, useEffect, useState } from 'react';

import { Player } from '../types/models';
import { PlayerFilters } from '../providers/interfaces/IPlayersProvider';
import { players } from '../providers';

interface UsePlayersOptions {
    autoFetch?: boolean;
    filters?: PlayerFilters;
    refreshInterval?: number;
}

interface UsePlayersReturn {
    players: Player[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;

    // CRUD Operations
    fetchPlayers: (filters?: PlayerFilters) => Promise<void>;
    createPlayer: (playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
    updatePlayer: (id: string, playerData: Partial<Player>) => Promise<{ success: boolean; error?: string }>;
    deletePlayer: (id: string) => Promise<{ success: boolean; error?: string }>;

    // Specific Operations
    getPlayersByTeam: (teamId: string) => Promise<void>;
    searchPlayers: (query: string) => Promise<void>;
    togglePlayerActive: (id: string, active: boolean) => Promise<{ success: boolean; error?: string }>;
    setPlayerCaptain: (id: string, captain: boolean) => Promise<{ success: boolean; error?: string }>;
    getPlayerStats: (id: string) => Promise<{ success: boolean; stats?: any; error?: string }>;

    // Utilities
    getPlayerById: (id: string) => Player | undefined;
    refresh: () => Promise<void>;
    clearError: () => void;
}

export function usePlayers(options: UsePlayersOptions = {}): UsePlayersReturn {
    const {
        autoFetch = true,
        filters,
        refreshInterval
    } = options;

    // Estados principales
    const [playersList, setPlayersList] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // 🔄 AUTO FETCH al montar el componente
    useEffect(() => {
        if (autoFetch) {
            fetchPlayers(filters);
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
     * Obtener jugadores con filtros
     */
    const fetchPlayers = useCallback(async (fetchFilters?: PlayerFilters) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await players.getAll(fetchFilters || filters);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setPlayersList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo jugadores';
            console.error('Error fetching players:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    /**
     * Crear nuevo jugador
     */
    const createPlayer = useCallback(async (
        playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: createError } = await players.create(playerData);

            if (createError) {
                throw new Error(createError);
            }

            if (data) {
                // Agregar el nuevo jugador a la lista local
                setPlayersList(prev => [data, ...prev]);
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error creando jugador';
            console.error('Error creating player:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Actualizar jugador existente
     */
    const updatePlayer = useCallback(async (
        id: string,
        playerData: Partial<Player>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: updateError } = await players.update(id, playerData);

            if (updateError) {
                throw new Error(updateError);
            }

            if (data) {
                // Actualizar el jugador en la lista local
                setPlayersList(prev =>
                    prev.map(player => player.id === id ? data : player)
                );
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error actualizando jugador';
            console.error('Error updating player:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Eliminar jugador
     */
    const deletePlayer = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { error: deleteError } = await players.delete(id);

            if (deleteError) {
                throw new Error(deleteError);
            }

            // Remover el jugador de la lista local
            setPlayersList(prev => prev.filter(player => player.id !== id));

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error eliminando jugador';
            console.error('Error deleting player:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Obtener jugadores por equipo
     */
    const getPlayersByTeam = useCallback(async (teamId: string) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await players.getByTeam(teamId);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setPlayersList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo jugadores por equipo';
            console.error('Error getting players by team:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Buscar jugadores por texto
     */
    const searchPlayers = useCallback(async (query: string) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: searchError } = await players.search(query);

            if (searchError) {
                throw new Error(searchError);
            }

            setPlayersList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error buscando jugadores';
            console.error('Error searching players:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Activar/desactivar jugador
     */
    const togglePlayerActive = useCallback(async (
        id: string,
        active: boolean
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: toggleError } = await players.toggleActive(id, active);

            if (toggleError) {
                throw new Error(toggleError);
            }

            if (data) {
                // Actualizar el jugador en la lista local
                setPlayersList(prev =>
                    prev.map(player => player.id === id ? data : player)
                );
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error cambiando estado del jugador';
            console.error('Error toggling player active:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Establecer/quitar capitán
     */
    const setPlayerCaptain = useCallback(async (
        id: string,
        captain: boolean
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: captainError } = await players.setCaptain(id, captain);

            if (captainError) {
                throw new Error(captainError);
            }

            if (data) {
                // Actualizar el jugador en la lista local
                setPlayersList(prev =>
                    prev.map(player => {
                        // Si se establece un nuevo capitán, quitar el anterior del mismo equipo
                        if (captain && player.team_id === data.team_id && player.id !== id) {
                            return { ...player, captain: false };
                        }
                        return player.id === id ? data : player;
                    })
                );
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error estableciendo capitán';
            console.error('Error setting player captain:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Obtener estadísticas del jugador
     */
    const getPlayerStats = useCallback(async (id: string): Promise<{ success: boolean; stats?: any; error?: string }> => {
        try {
            setError(null);

            const { data, error: statsError } = await players.getStats(id);

            if (statsError) {
                throw new Error(statsError);
            }

            return { success: true, stats: data };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo estadísticas del jugador';
            console.error('Error getting player stats:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Obtener jugador por ID
     */
    const getPlayerById = useCallback((id: string): Player | undefined => {
        return playersList.find(player => player.id === id);
    }, [playersList]);

    /**
     * Refrescar datos (para pull-to-refresh)
     */
    const refresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await fetchPlayers(filters);
        } finally {
            setRefreshing(false);
        }
    }, [fetchPlayers, filters]);

    /**
     * Limpiar error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        players: playersList,
        loading,
        error,
        refreshing,

        // CRUD Operations
        fetchPlayers,
        createPlayer,
        updatePlayer,
        deletePlayer,

        // Specific Operations
        getPlayersByTeam,
        searchPlayers,
        togglePlayerActive,
        setPlayerCaptain,
        getPlayerStats,

        // Utilities
        getPlayerById,
        refresh,
        clearError,
    };
}

// 🎯 HOOKS ESPECIALIZADOS

/**
 * Hook para obtener solo jugadores activos
 */
export function useActivePlayers(teamId?: string) {
    return usePlayers({
        filters: { 
            active: true,
            team_id: teamId 
        },
        autoFetch: true,
    });
}

/**
 * Hook para búsqueda de jugadores en tiempo real
 */
export function usePlayerSearch(initialQuery: string = '') {
    const [query, setQuery] = useState(initialQuery);
    const [searchResults, setSearchResults] = useState<Player[]>([]);
    const [searching, setSearching] = useState(false);

    const searchPlayers = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const { data, error } = await players.search(searchQuery);

            if (error) {
                console.error('Error searching players:', error);
                return;
            }

            setSearchResults(data);
        } catch (error) {
            console.error('Error searching players:', error);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            searchPlayers(query);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query, searchPlayers]);

    return {
        query,
        setQuery,
        searchResults,
        searching,
        clearResults: () => setSearchResults([]),
    };
}

/**
 * Hook para estadísticas de jugador
 */
export function usePlayerStats(playerId: string | null) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!playerId) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error: statsError } = await players.getStats(playerId);

            if (statsError) {
                throw new Error(statsError);
            }

            setStats(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo estadísticas';
            console.error('Error fetching player stats:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [playerId]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refresh: fetchStats };
}

/**
 * Hook para jugadores de un equipo específico
 */
export function useTeamPlayers(teamId: string | null) {
    const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTeamPlayers = useCallback(async () => {
        if (!teamId) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await players.getByTeam(teamId);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setTeamPlayers(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo jugadores del equipo';
            console.error('Error fetching team players:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchTeamPlayers();
    }, [fetchTeamPlayers]);

    return {
        teamPlayers,
        loading,
        error,
        refresh: fetchTeamPlayers
    };
}

/**
 * Hook para obtener capitanes de equipos
 */
export function useTeamCaptains() {
    return usePlayers({
        filters: { captain: true },
        autoFetch: true,
    });
}