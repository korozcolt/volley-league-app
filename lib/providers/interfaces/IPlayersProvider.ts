import { Player } from '@/lib/types/models';

export interface PlayerFilters {
  team_id?: string;
  position?: string[];
  active?: boolean;
  search?: string;
}

export interface IPlayersProvider {
  // CRUD básico
  getAll(filters?: PlayerFilters): Promise<{ data: Player[]; error: string | null }>;
  getById(id: string): Promise<{ data: Player | null; error: string | null }>;
  create(playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Player | null; error: string | null }>;
  update(id: string, playerData: Partial<Player>): Promise<{ data: Player | null; error: string | null }>;
  delete(id: string): Promise<{ error: string | null }>;
  
  // Funciones específicas
  getByTeam(teamId: string): Promise<{ data: Player[]; error: string | null }>;
  search(query: string): Promise<{ data: Player[]; error: string | null }>;
  toggleActive(id: string, active: boolean): Promise<{ data: Player | null; error: string | null }>;
  setCaptain(playerId: string, teamId: string): Promise<{ error: string | null }>;
  validateJerseyNumber(teamId: string, jerseyNumber: number, excludePlayerId?: string): Promise<{ valid: boolean; error: string | null }>;
}