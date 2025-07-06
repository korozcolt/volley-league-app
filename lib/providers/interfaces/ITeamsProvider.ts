import { Team } from '@/lib/types/models';

export interface TeamFilters {
  active?: boolean;
  search?: string;
  coach?: string;
}

export interface ITeamsProvider {
  // CRUD básico
  getAll(filters?: TeamFilters): Promise<{ data: Team[]; error: string | null }>;
  getById(id: string): Promise<{ data: Team | null; error: string | null }>;
  create(teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Team | null; error: string | null }>;
  update(id: string, teamData: Partial<Team>): Promise<{ data: Team | null; error: string | null }>;
  delete(id: string): Promise<{ error: string | null }>;
  
  // Funciones específicas
  search(query: string): Promise<{ data: Team[]; error: string | null }>;
  toggleActive(id: string, active: boolean): Promise<{ data: Team | null; error: string | null }>;
  uploadLogo(id: string, logoFile: File | Blob): Promise<{ data: Team | null; error: string | null }>;
  getLogoUrl(team: Team): string | null;
  getStats(id: string): Promise<{ data: any | null; error: string | null }>;
}