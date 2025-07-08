export interface ITournamentRegistrationProvider {
  // Gestión de inscripciones
  registerTeam(tournamentId: string, teamId: string): Promise<{ data: any; error: string | null }>;
  unregisterTeam(tournamentId: string, teamId: string): Promise<{ data: any; error: string | null }>;
  
  // Consultas
  getRegistrations(tournamentId: string): Promise<{ data: any[]; error: string | null }>;
  isTeamRegistered(tournamentId: string, teamId: string): Promise<{ data: boolean; error: string | null }>;
  
  // Validaciones
  canRegisterTeam(tournamentId: string, teamId: string): Promise<{ data: boolean; error: string | null; reason?: string }>;
  
  // Estadísticas
  getRegistrationStats(tournamentId: string): Promise<{ 
    data: { 
      total: number; 
      pending: number; 
      approved: number; 
      rejected: number; 
    }; 
    error: string | null; 
  }>;
}
