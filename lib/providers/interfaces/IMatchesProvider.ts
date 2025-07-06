import { Match, MatchEvent, Player, Team } from '@/lib/types/models';

export interface MatchFilters {
  tournament_id?: string;
  team_id?: string;
  status?: string[];
  date_from?: string;
  date_to?: string;
  referee_id?: string;
}

export interface IMatchesProvider {
  // CRUD básico
  getAll(filters?: MatchFilters): Promise<{ data: Match[]; error: string | null }>;
  getById(id: string): Promise<{ data: Match | null; error: string | null }>;
  create(matchData: Omit<Match, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Match | null; error: string | null }>;
  update(id: string, matchData: Partial<Match>): Promise<{ data: Match | null; error: string | null }>;
  delete(id: string): Promise<{ error: string | null }>;
  
  // Funciones específicas
  getByTournament(tournamentId: string): Promise<{ data: Match[]; error: string | null }>;
  getByTeam(teamId: string): Promise<{ data: Match[]; error: string | null }>;
  getByReferee(refereeId: string): Promise<{ data: Match[]; error: string | null }>;
  getUpcoming(limit?: number): Promise<{ data: Match[]; error: string | null }>;
  
  // Gestión de resultados
  updateScore(matchId: string, homeScore: number, awayScore: number): Promise<{ data: Match | null; error: string | null }>;
  updateStatus(matchId: string, status: string): Promise<{ data: Match | null; error: string | null }>;
}