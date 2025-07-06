import { Tournament } from '@/lib/types/models';

export interface TournamentFilters {
  status?: string[];
  type?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface ITournamentsProvider {
  // CRUD básico
  getAll(filters?: TournamentFilters): Promise<{ data: Tournament[]; error: string | null }>;
  getById(id: string): Promise<{ data: Tournament | null; error: string | null }>;
  create(tournamentData: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Tournament | null; error: string | null }>;
  update(id: string, tournamentData: Partial<Tournament>): Promise<{ data: Tournament | null; error: string | null }>;
  delete(id: string): Promise<{ error: string | null }>;
  
  // Funciones específicas
  search(query: string): Promise<{ data: Tournament[]; error: string | null }>;
  getByStatus(status: string): Promise<{ data: Tournament[]; error: string | null }>;
  getStats(id: string): Promise<{ data: any | null; error: string | null }>;
  
  // Gestión de equipos en torneo
  addTeam(tournamentId: string, teamId: string): Promise<{ error: string | null }>;
  removeTeam(tournamentId: string, teamId: string): Promise<{ error: string | null }>;
  getTeams(tournamentId: string): Promise<{ data: Team[]; error: string | null }>;
}