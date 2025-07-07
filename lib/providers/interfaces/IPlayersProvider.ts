import { Player, PlayerPosition } from '@/lib/types/models';

// ✅ EXPORTAR PlayerFilters
export interface PlayerFilters {
  team_id?: string;
  active?: boolean;
  position?: PlayerPosition;
  search?: string;
  captain?: boolean;
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
  setCaptain(id: string, captain: boolean): Promise<{ data: Player | null; error: string | null }>;
  getStats(id: string): Promise<{ data: any | null; error: string | null }>;
}