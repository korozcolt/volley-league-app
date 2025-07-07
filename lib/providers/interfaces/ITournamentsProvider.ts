import { RegistrationStatus, Team, Tournament, TournamentRegistration } from '@/lib/types/models';

export interface TournamentRegistrationFilters {
  tournament_id?: string;
  team_id?: string;
  status?: RegistrationStatus[];
  registered_by?: string;
  date_from?: string;
  date_to?: string;
}

export interface ITournamentRegistrationProvider {
  // CRUD básico
  getAll(filters?: TournamentRegistrationFilters): Promise<{ data: TournamentRegistration[]; error: string | null }>;
  getById(id: string): Promise<{ data: TournamentRegistration | null; error: string | null }>;
  create(registrationData: Omit<TournamentRegistration, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: TournamentRegistration | null; error: string | null }>;
  update(id: string, registrationData: Partial<TournamentRegistration>): Promise<{ data: TournamentRegistration | null; error: string | null }>;
  delete(id: string): Promise<{ error: string | null }>;
  
  // Funciones específicas de inscripciones
  registerTeam(tournamentId: string, teamId: string, registeredBy: string): Promise<{ data: TournamentRegistration | null; error: string | null }>;
  approveRegistration(registrationId: string, approvedBy: string): Promise<{ data: TournamentRegistration | null; error: string | null }>;
  rejectRegistration(registrationId: string, reason: string, rejectedBy: string): Promise<{ data: TournamentRegistration | null; error: string | null }>;
  cancelRegistration(registrationId: string): Promise<{ error: string | null }>;
  
  // Consultas específicas
  getPendingRegistrations(tournamentId?: string): Promise<{ data: TournamentRegistration[]; error: string | null }>;
  getTeamRegistrations(teamId: string): Promise<{ data: TournamentRegistration[]; error: string | null }>;
  getTournamentRegistrations(tournamentId: string): Promise<{ data: TournamentRegistration[]; error: string | null }>;
  
  // Validaciones
  canTeamRegister(tournamentId: string, teamId: string): Promise<{ canRegister: boolean; reason?: string; error: string | null }>;
  isTeamRegistered(tournamentId: string, teamId: string): Promise<{ isRegistered: boolean; registration?: TournamentRegistration; error: string | null }>;
}