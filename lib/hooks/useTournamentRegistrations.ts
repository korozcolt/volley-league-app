import { teams, tournaments } from '@/lib/providers';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from './useAuth';

interface Registration {
  id: string;
  tournament: string;
  team: any;
  status: 'pending' | 'approved' | 'rejected';
  registered_at: string;
  notes?: string;
}

interface Team {
  id: string;
  name: string;
  coach?: string;
  logo?: string;
  is_active: boolean;
}

interface RegistrationStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

/**
 * Hook para gestión completa de inscripciones de torneo
 * 
 * Ubicación: lib/hooks/useTournamentRegistrations.ts
 * 
 * Funcionalidades:
 * - Cargar y gestionar inscripciones
 * - Aprobar/rechazar inscripciones
 * - Buscar y agregar equipos disponibles
 * - Estadísticas en tiempo real
 * - Validaciones de permisos
 */
export function useTournamentRegistrations(tournamentId: string) {
  const { hasRole } = useAuth();
  
  // 📊 ESTADO
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // 🔐 PERMISOS
  const canManage = hasRole(['admin']);
  const canView = hasRole(['admin', 'team_manager', 'referee']);

  // 📱 CARGAR INSCRIPCIONES
  const fetchRegistrations = useCallback(async () => {
    if (!tournamentId || !canView) return;
    
    try {
      setError(null);
      const { data, error: fetchError } = await tournaments.getRegistrations(tournamentId);
      
      if (fetchError) {
        throw new Error(fetchError);
      }
      
      setRegistrations(data || []);
    } catch (err: any) {
      console.error('Error cargando inscripciones:', err);
      setError(err.message || 'Error cargando inscripciones');
    }
  }, [tournamentId, canView]);

  // 👥 CARGAR EQUIPOS DISPONIBLES
  const fetchAvailableTeams = useCallback(async () => {
    if (!tournamentId || !canManage) return;
    
    try {
      const { data: teamsData, error: teamsError } = await teams.getAll({ active_only: true });
      
      if (teamsError) {
        throw new Error(teamsError);
      }
      
      // Filtrar equipos que no estén ya inscritos
      const registeredTeamIds = new Set(registrations.map(r => r.team.id));
      const available = teamsData?.filter(team => !registeredTeamIds.has(team.id)) || [];
      
      setAvailableTeams(available);
    } catch (err: any) {
      console.error('Error cargando equipos disponibles:', err);
    }
  }, [tournamentId, canManage, registrations]);

  // 🔄 CARGAR TODOS LOS DATOS
  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchRegistrations(),
      canManage ? fetchAvailableTeams() : Promise.resolve(),
    ]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchRegistrations, fetchAvailableTeams, canManage]);

  // ♻️ REFRESH
  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // ✅ APROBAR INSCRIPCIÓN
  const approveRegistration = useCallback(async (registrationId: string) => {
    if (!canManage) {
      throw new Error('No tienes permisos para aprobar inscripciones');
    }

    setProcessingIds(prev => new Set(prev).add(registrationId));
    
    try {
      const { error } = await tournaments.updateRegistrationStatus(registrationId, 'approved');
      
      if (error) {
        throw new Error(error);
      }
      
      // Actualizar estado local
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status: 'approved' as const }
            : reg
        )
      );
      
      return { success: true, error: null };
    } catch (err: any) {
      console.error('Error aprobando inscripción:', err);
      return { success: false, error: err.message };
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(registrationId);
        return newSet;
      });
    }
  }, [canManage]);

  // ❌ RECHAZAR INSCRIPCIÓN
  const rejectRegistration = useCallback(async (registrationId: string, notes?: string) => {
    if (!canManage) {
      throw new Error('No tienes permisos para rechazar inscripciones');
    }

    setProcessingIds(prev => new Set(prev).add(registrationId));
    
    try {
      const { error } = await tournaments.updateRegistrationStatus(registrationId, 'rejected', notes);
      
      if (error) {
        throw new Error(error);
      }
      
      // Actualizar estado local
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status: 'rejected' as const, notes }
            : reg
        )
      );
      
      return { success: true, error: null };
    } catch (err: any) {
      console.error('Error rechazando inscripción:', err);
      return { success: false, error: err.message };
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(registrationId);
        return newSet;
      });
    }
  }, [canManage]);

  // ➕ INSCRIBIR EQUIPO
  const registerTeam = useCallback(async (teamId: string) => {
    if (!canManage) {
      throw new Error('No tienes permisos para inscribir equipos');
    }

    setProcessingIds(prev => new Set(prev).add(teamId));
    
    try {
      const { error } = await tournaments.registerTeam(tournamentId, teamId);
      
      if (error) {
        throw new Error(error);
      }
      
      // Refrescar datos para mostrar la nueva inscripción
      await fetchData();
      
      return { success: true, error: null };
    } catch (err: any) {
      console.error('Error inscribiendo equipo:', err);
      return { success: false, error: err.message };
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(teamId);
        return newSet;
      });
    }
  }, [canManage, tournamentId, fetchData]);

  // 🗑️ ELIMINAR INSCRIPCIÓN
  const removeRegistration = useCallback(async (registrationId: string) => {
    if (!canManage) {
      throw new Error('No tienes permisos para eliminar inscripciones');
    }

    setProcessingIds(prev => new Set(prev).add(registrationId));
    
    try {
      const { error } = await tournaments.removeRegistration(registrationId);
      
      if (error) {
        throw new Error(error);
      }
      
      // Actualizar estado local
      setRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
      
      // Refrescar equipos disponibles
      await fetchAvailableTeams();
      
      return { success: true, error: null };
    } catch (err: any) {
      console.error('Error eliminando inscripción:', err);
      return { success: false, error: err.message };
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(registrationId);
        return newSet;
      });
    }
  }, [canManage, fetchAvailableTeams]);

  // 🔍 BUSCAR EQUIPOS DISPONIBLES
  const searchAvailableTeams = useCallback((query: string): Team[] => {
    if (!query.trim()) return availableTeams;
    
    const lowercaseQuery = query.toLowerCase();
    return availableTeams.filter(team =>
      team.name.toLowerCase().includes(lowercaseQuery) ||
      team.coach?.toLowerCase().includes(lowercaseQuery)
    );
  }, [availableTeams]);

  // 📊 CALCULAR ESTADÍSTICAS
  const stats: RegistrationStats = {
    total: registrations.length,
    approved: registrations.filter(r => r.status === 'approved').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  // ✅ VALIDACIONES
  const canRegisterMoreTeams = useCallback(async (maxTeams?: number): Promise<boolean> => {
    if (!maxTeams) return true;
    
    const approvedCount = stats.approved;
    return approvedCount < maxTeams;
  }, [stats.approved]);

  const isTeamRegistered = useCallback((teamId: string): boolean => {
    return registrations.some(reg => reg.team.id === teamId);
  }, [registrations]);

  const getRegistrationByTeam = useCallback((teamId: string): Registration | null => {
    return registrations.find(reg => reg.team.id === teamId) || null;
  }, [registrations]);

  // 🎯 HELPERS DE ESTADO
  const isProcessing = useCallback((id: string): boolean => {
    return processingIds.has(id);
  }, [processingIds]);

  const hasError = !!error;
  const isEmpty = registrations.length === 0;
  const hasPendingRegistrations = stats.pending > 0;

  // 🔄 EFECTOS
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refrescar equipos disponibles cuando cambien las inscripciones
  useEffect(() => {
    if (canManage) {
      fetchAvailableTeams();
    }
  }, [registrations, canManage, fetchAvailableTeams]);

  return {
    // 📊 DATOS
    registrations,
    availableTeams,
    stats,
    
    // 🎛️ ESTADO
    loading,
    refreshing,
    error,
    hasError,
    isEmpty,
    hasPendingRegistrations,
    
    // 🔐 PERMISOS
    canManage,
    canView,
    
    // 🔄 ACCIONES
    refresh,
    approveRegistration,
    rejectRegistration,
    registerTeam,
    removeRegistration,
    
    // 🔍 UTILIDADES
    searchAvailableTeams,
    isProcessing,
    canRegisterMoreTeams,
    isTeamRegistered,
    getRegistrationByTeam,
    
    // 📱 MÉTODOS ADICIONALES
    fetchData,
    fetchRegistrations,
    fetchAvailableTeams,
  };
}

/**
 * 🎯 Hook simplificado para verificar inscripción de un equipo específico
 */
export function useTeamRegistrationStatus(tournamentId: string, teamId: string) {
  const [status, setStatus] = useState<'not_registered' | 'pending' | 'approved' | 'rejected'>('not_registered');
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (!tournamentId || !teamId) return;
      
      try {
        const { data, error } = await tournaments.getTeamRegistrationStatus(tournamentId, teamId);
        
        if (error) {
          console.error('Error verificando estado de inscripción:', error);
          return;
        }
        
        if (data) {
          setStatus(data.status);
          setRegistration(data);
        } else {
          setStatus('not_registered');
          setRegistration(null);
        }
      } catch (err) {
        console.error('Error verificando inscripción:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [tournamentId, teamId]);

  return {
    status,
    loading,
    registration,
    isRegistered: status !== 'not_registered',
    isApproved: status === 'approved',
    isPending: status === 'pending',
    isRejected: status === 'rejected',
  };
}
