// lib/hooks/useTeams.ts - Hook para gestión de equipos
import { useCallback, useEffect, useState } from 'react';

import { Team } from '../types/models';
import { TeamFilters } from '../providers/interfaces/ITeamsProvider';
import { teams } from '../providers';

interface UseTeamsOptions {
    autoFetch?: boolean;
    filters?: TeamFilters;
    refreshInterval?: number;
}

interface UseTeamsReturn {
    teams: Team[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;

    // CRUD Operations
    fetchTeams: (filters?: TeamFilters) => Promise<void>;
    createTeam: (teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
    updateTeam: (id: string, teamData: Partial<Team>) => Promise<{ success: boolean; error?: string }>;
    deleteTeam: (id: string) => Promise<{ success: boolean; error?: string }>;

    // Specific Operations
    searchTeams: (query: string) => Promise<void>;
    toggleTeamActive: (id: string, active: boolean) => Promise<{ success: boolean; error?: string }>;
    uploadTeamLogo: (id: string, logoFile: File | Blob) => Promise<{ success: boolean; error?: string }>;

    // Utilities
    getTeamById: (id: string) => Team | undefined;
    refresh: () => Promise<void>;
    clearError: () => void;
}

export function useTeams(options: UseTeamsOptions = {}): UseTeamsReturn {
    const {
        autoFetch = true,
        filters,
        refreshInterval
    } = options;

    // Estados principales
    const [teamsList, setTeamsList] = useState<Team[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // 🔄 AUTO FETCH al montar el componente
    useEffect(() => {
        if (autoFetch) {
            fetchTeams(filters);
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
     * Obtener equipos con filtros
     */
    const fetchTeams = useCallback(async (fetchFilters?: TeamFilters) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await teams.getAll(fetchFilters || filters);

            if (fetchError) {
                throw new Error(fetchError);
            }

            setTeamsList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            console.error('Error fetching teams:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    /**
     * Crear nuevo equipo
     */
    const createTeam = useCallback(async (
        teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: createError } = await teams.create(teamData);

            if (createError) {
                throw new Error(createError);
            }

            if (data) {
                // Agregar el nuevo equipo a la lista local
                setTeamsList(prev => [data, ...prev]);
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error creando equipo';
            console.error('Error creating team:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Actualizar equipo existente
     */
    const updateTeam = useCallback(async (
        id: string,
        teamData: Partial<Team>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: updateError } = await teams.update(id, teamData);

            if (updateError) {
                throw new Error(updateError);
            }

            if (data) {
                // Actualizar el equipo en la lista local
                setTeamsList(prev =>
                    prev.map(team => team.id === id ? data : team)
                );
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error actualizando equipo';
            console.error('Error updating team:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Eliminar equipo (soft delete)
     */
    const deleteTeam = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { error: deleteError } = await teams.delete(id);

            if (deleteError) {
                throw new Error(deleteError);
            }

            // Remover el equipo de la lista local
            setTeamsList(prev => prev.filter(team => team.id !== id));

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error eliminando equipo';
            console.error('Error deleting team:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Buscar equipos por nombre
     */
    const searchTeams = useCallback(async (query: string) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: searchError } = await teams.search(query);

            if (searchError) {
                throw new Error(searchError);
            }

            setTeamsList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error buscando equipos';
            console.error('Error searching teams:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Activar/desactivar equipo
     */
    const toggleTeamActive = useCallback(async (
        id: string,
        active: boolean
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: toggleError } = await teams.toggleActive(id, active);

            if (toggleError) {
                throw new Error(toggleError);
            }

            if (data) {
                // Actualizar el equipo en la lista local
                setTeamsList(prev =>
                    prev.map(team => team.id === id ? data : team)
                );
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error cambiando estado del equipo';
            console.error('Error toggling team active:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Subir logo del equipo
     */
    const uploadTeamLogo = useCallback(async (
        id: string,
        logoFile: File | Blob
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setError(null);

            const { data, error: uploadError } = await teams.uploadLogo(id, logoFile);

            if (uploadError) {
                throw new Error(uploadError);
            }

            if (data) {
                // Actualizar el equipo con el nuevo logo en la lista local
                setTeamsList(prev =>
                    prev.map(team => team.id === id ? data : team)
                );
            }

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error subiendo logo';
            console.error('Error uploading team logo:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    /**
     * Obtener equipo por ID
     */
    const getTeamById = useCallback((id: string): Team | undefined => {
        return teamsList.find(team => team.id === id);
    }, [teamsList]);

    /**
     * Refrescar datos (para pull-to-refresh)
     */
    const refresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await fetchTeams(filters);
        } finally {
            setRefreshing(false);
        }
    }, [fetchTeams, filters]);

    /**
     * Limpiar error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        teams: teamsList,
        loading,
        error,
        refreshing,

        // CRUD Operations
        fetchTeams,
        createTeam,
        updateTeam,
        deleteTeam,

        // Specific Operations
        searchTeams,
        toggleTeamActive,
        uploadTeamLogo,

        // Utilities
        getTeamById,
        refresh,
        clearError,
    };
}

// 🎯 HOOKS ESPECIALIZADOS

/**
 * Hook para obtener solo equipos activos
 */
export function useActiveTeams() {
    return useTeams({
        filters: { active: true },
        autoFetch: true,
    });
}

/**
 * Hook para búsqueda de equipos en tiempo real
 */
export function useTeamSearch(initialQuery: string = '') {
    const [query, setQuery] = useState(initialQuery);
    const [searchResults, setSearchResults] = useState<Team[]>([]);
    const [searching, setSearching] = useState(false);

    const searchTeams = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const { data, error } = await teams.search(searchQuery);

            if (error) {
                console.error('Error searching teams:', error);
                return;
            }

            setSearchResults(data);
        } catch (error) {
            console.error('Error searching teams:', error);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            searchTeams(query);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query, searchTeams]);

    return {
        query,
        setQuery,
        searchResults,
        searching,
        clearResults: () => setSearchResults([]),
    };
}

/**
 * Hook para estadísticas de equipo
 */
export function useTeamStats(teamId: string | null) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!teamId) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error: statsError } = await teams.getStats(teamId);

            if (statsError) {
                throw new Error(statsError);
            }

            setStats(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error obteniendo estadísticas';
            console.error('Error fetching team stats:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refresh: fetchStats };
}