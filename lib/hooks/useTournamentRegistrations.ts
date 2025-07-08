import { Team, TournamentRegistration, UserRole } from '@/lib/types/models';
// lib/hooks/useTournamentRegistrations.ts
import { useCallback, useEffect, useState } from 'react';

import { teams } from '@/lib/providers';
import { useAuth } from './useAuth';

interface Registration {
  id: string;
  tournament: string;
  team: any;
  status: 'pending' | 'approved' | 'rejected';
  registered_at: string;
  notes?: string;
}

interface RegistrationStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export function useTournamentRegistrations(tournamentId: string) {
  const { hasRole } = useAuth();
  
  // 📊 ESTADO - ✅ USANDO TIPO Team REAL DEL REPOSITORIO
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // 🔐 PERMISOS - ✅ CORREGIDO: Usar valores del enum UserRole
  const canManage = hasRole(UserRole.ADMIN);
  const canView = hasRole(UserRole.ADMIN) || hasRole(UserRole.TEAM_MANAGER) || hasRole(UserRole.REFEREE);

  // 📱 CARGAR EQUIPOS DISPONIBLES - ✅ CORREGIDO: Usar propiedad 'active'
  const fetchAvailableTeams = useCallback(async () => {
    if (!tournamentId || !canManage) return;
    
    try {
      // ✅ USAR FILTRO CORRECTO: { active: true }
      const { data: teamsData, error: teamsError } = await teams.getAll({ active: true });
      
      if (teamsError) {
        throw new Error(teamsError);
      }
      
      // ✅ CORRECCIÓN: teamsData ya viene filtrado por active: true
      setAvailableTeams(teamsData || []);
    } catch (err: any) {
      console.error('Error cargando equipos disponibles:', err);
    }
  }, [tournamentId, canManage]);

  // 🔄 CARGAR DATOS - ✅ SIMPLIFICADO: Solo equipos por ahora
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (canManage) {
        await fetchAvailableTeams();
      }
      
      // TODO: Cuando se implemente ITournamentRegistrationProvider, agregar:
      // await fetchRegistrations();
      
    } catch (err: any) {
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchAvailableTeams, canManage]);

  // ♻️ REFRESH
  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // 🔍 BUSCAR EQUIPOS DISPONIBLES - ✅ CORREGIDO: Usar propiedades correctas
  const searchAvailableTeams = useCallback((query: string): Team[] => {
    if (!query.trim()) return availableTeams;
    
    const lowercaseQuery = query.toLowerCase();
    return availableTeams.filter(team =>
      team.name.toLowerCase().includes(lowercaseQuery) ||
      team.coach_name?.toLowerCase().includes(lowercaseQuery) // ✅ CORREGIDO: coach_name
    );
  }, [availableTeams]);

  // 📊 CALCULAR ESTADÍSTICAS - ✅ VALORES POR DEFECTO
  const stats: RegistrationStats = {
    total: registrations.length,
    approved: registrations.filter(r => r.status === 'approved').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

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

  // ✅ MÉTODOS PLACEHOLDER - Para cuando se implementen los providers
  const approveRegistration = useCallback(async (registrationId: string) => {
    // TODO: Implementar cuando exista tournaments.updateRegistrationStatus
    console.warn('approveRegistration no implementado aún - falta ITournamentRegistrationProvider');
    return { success: false, error: 'Funcionalidad no implementada aún' };
  }, []);

  const rejectRegistration = useCallback(async (registrationId: string, notes?: string) => {
    // TODO: Implementar cuando exista tournaments.updateRegistrationStatus
    console.warn('rejectRegistration no implementado aún - falta ITournamentRegistrationProvider');
    return { success: false, error: 'Funcionalidad no implementada aún' };
  }, []);

  const registerTeam = useCallback(async (teamId: string) => {
    // TODO: Implementar cuando exista tournaments.registerTeam
    console.warn('registerTeam no implementado aún - falta ITournamentRegistrationProvider');
    return { success: false, error: 'Funcionalidad no implementada aún' };
  }, []);

  const removeRegistration = useCallback(async (registrationId: string) => {
    // TODO: Implementar cuando exista tournaments.removeRegistration
    console.warn('removeRegistration no implementado aún - falta ITournamentRegistrationProvider');
    return { success: false, error: 'Funcionalidad no implementada aún' };
  }, []);

  const isTeamRegistered = useCallback((teamId: string): boolean => {
    return registrations.some(reg => reg.team.id === teamId);
  }, [registrations]);

  const getRegistrationByTeam = useCallback((teamId: string): Registration | null => {
    return registrations.find(reg => reg.team.id === teamId) || null;
  }, [registrations]);

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
    
    // 🔄 ACCIONES - ✅ PLACEHOLDER hasta implementar providers
    refresh,
    approveRegistration,
    rejectRegistration,
    registerTeam,
    removeRegistration,
    
    // 🔍 UTILIDADES
    searchAvailableTeams,
    isProcessing,
    isTeamRegistered,
    getRegistrationByTeam,
    
    // 📱 MÉTODOS ADICIONALES
    fetchData,
    fetchAvailableTeams,
  };
}

/**
 * 🎯 Hook simplificado para verificar inscripción de un equipo específico
 * ✅ PLACEHOLDER - Implementar cuando existan los métodos necesarios
 */
export function useTeamRegistrationStatus(tournamentId: string, teamId: string) {
  const [status, setStatus] = useState<'not_registered' | 'pending' | 'approved' | 'rejected'>('not_registered');
  const [loading, setLoading] = useState(false); // ✅ CAMBIO: false por defecto ya que no hace requests
  const [registration, setRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    // TODO: Implementar cuando exista tournaments.getTeamRegistrationStatus
    console.warn('useTeamRegistrationStatus no implementado aún - falta ITournamentRegistrationProvider');
    setLoading(false);
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
