// lib/providers/pocketbase/teams.ts
import { ITeamsProvider, TeamFilters } from '../interfaces/ITeamsProvider';

import PocketBase from 'pocketbase';
import { Team } from '@/lib/types/models';

export class PocketBaseTeamsProvider implements ITeamsProvider {
  constructor(private pb: PocketBase) {}

  /**
   * Obtener todos los equipos con filtros opcionales
   */
  async getAll(filters?: TeamFilters): Promise<{ data: Team[]; error: string | null }> {
    try {
      // Construir filtros para PocketBase
      const filterConditions: string[] = [];
      
      if (filters?.active !== undefined) {
        filterConditions.push(`active = ${filters.active}`);
      }
      
      if (filters?.search) {
        filterConditions.push(`name ~ "${filters.search}"`);
      }
      
      if (filters?.coach) {
        filterConditions.push(`coach_name ~ "${filters.coach}"`);
      }

      const filterString = filterConditions.length > 0 
        ? filterConditions.join(' && ') 
        : '';

      const teams = await this.pb.collection('teams').getFullList({
        sort: 'name',
        filter: filterString
      });

      const mappedTeams = teams.map(team => this.mapPocketBaseTeamToTeam(team));
      return { data: mappedTeams, error: null };
    } catch (error: any) {
      console.error('Error obteniendo equipos:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Obtener equipo por ID
   */
  async getById(id: string): Promise<{ data: Team | null; error: string | null }> {
    try {
      const team = await this.pb.collection('teams').getOne(id);
      const mappedTeam = this.mapPocketBaseTeamToTeam(team);
      return { data: mappedTeam, error: null };
    } catch (error: any) {
      console.error('Error obteniendo equipo:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Crear nuevo equipo
   */
  async create(teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Team | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const createData = {
        name: teamData.name,
        logo_url: teamData.logo_url || null,
        coach_name: teamData.coach_name || null,
        contact_email: teamData.contact_email || null,
        contact_phone: teamData.contact_phone || null,
        active: teamData.active ?? true
      };

      const newTeam = await this.pb.collection('teams').create(createData);
      const mappedTeam = this.mapPocketBaseTeamToTeam(newTeam);
      return { data: mappedTeam, error: null };
    } catch (error: any) {
      console.error('Error creando equipo:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Actualizar equipo existente
   */
  async update(id: string, teamData: Partial<Team>): Promise<{ data: Team | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const updateData: any = {};
      
      if (teamData.name !== undefined) updateData.name = teamData.name;
      if (teamData.logo_url !== undefined) updateData.logo_url = teamData.logo_url;
      if (teamData.coach_name !== undefined) updateData.coach_name = teamData.coach_name;
      if (teamData.contact_email !== undefined) updateData.contact_email = teamData.contact_email;
      if (teamData.contact_phone !== undefined) updateData.contact_phone = teamData.contact_phone;
      if (teamData.active !== undefined) updateData.active = teamData.active;

      const updatedTeam = await this.pb.collection('teams').update(id, updateData);
      const mappedTeam = this.mapPocketBaseTeamToTeam(updatedTeam);
      return { data: mappedTeam, error: null };
    } catch (error: any) {
      console.error('Error actualizando equipo:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Eliminar equipo
   */
  async delete(id: string): Promise<{ error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { error: 'Usuario no autenticado' };
      }

      await this.pb.collection('teams').delete(id);
      return { error: null };
    } catch (error: any) {
      console.error('Error eliminando equipo:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Buscar equipos por texto
   */
  async search(query: string): Promise<{ data: Team[]; error: string | null }> {
    try {
      const teams = await this.pb.collection('teams').getFullList({
        sort: 'name',
        filter: `name ~ "${query}" || coach_name ~ "${query}"`
      });

      const mappedTeams = teams.map(team => this.mapPocketBaseTeamToTeam(team));
      return { data: mappedTeams, error: null };
    } catch (error: any) {
      console.error('Error buscando equipos:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Activar/desactivar equipo
   */
  async toggleActive(id: string, active: boolean): Promise<{ data: Team | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const updatedTeam = await this.pb.collection('teams').update(id, { active });
      const mappedTeam = this.mapPocketBaseTeamToTeam(updatedTeam);
      return { data: mappedTeam, error: null };
    } catch (error: any) {
      console.error('Error cambiando estado del equipo:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Subir logo del equipo
   */
  async uploadLogo(id: string, logoFile: File | Blob): Promise<{ data: Team | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      // Crear FormData para el archivo
      const formData = new FormData();
      formData.append('logo', logoFile);

      const updatedTeam = await this.pb.collection('teams').update(id, formData);
      const mappedTeam = this.mapPocketBaseTeamToTeam(updatedTeam);
      return { data: mappedTeam, error: null };
    } catch (error: any) {
      console.error('Error subiendo logo:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Obtener URL del logo del equipo
   */
  getLogoUrl(team: Team): string | null {
    if (!team.logo_url) return null;
    
    try {
      // Si ya es una URL completa, devolverla tal como está
      if (team.logo_url.startsWith('http')) {
        return team.logo_url;
      }
      
      // Si es un archivo de PocketBase, construir la URL
      return this.pb.files.getUrl({ id: team.id, collectionName: 'teams' } as any, team.logo_url);
    } catch (error) {
      console.error('Error obteniendo URL del logo:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas del equipo
   */
  async getStats(id: string): Promise<{ data: any | null; error: string | null }> {
    try {
      // Obtener partidos del equipo
      const matches = await this.pb.collection('matches').getFullList({
        filter: `home_team = "${id}" || away_team = "${id}"`,
        expand: 'home_team,away_team'
      });

      // Calcular estadísticas básicas
      const stats = {
        total_matches: matches.length,
        wins: 0,
        losses: 0,
        draws: 0,
        goals_for: 0,
        goals_against: 0
      };

      matches.forEach(match => {
        if (match.status === 'completed') {
          const isHome = match.home_team === id;
          const teamScore = isHome ? match.home_score : match.away_score;
          const opponentScore = isHome ? match.away_score : match.home_score;

          stats.goals_for += teamScore || 0;
          stats.goals_against += opponentScore || 0;

          if (teamScore > opponentScore) {
            stats.wins++;
          } else if (teamScore < opponentScore) {
            stats.losses++;
          } else {
            stats.draws++;
          }
        }
      });

      return { data: stats, error: null };
    } catch (error: any) {
      console.error('Error obteniendo estadísticas del equipo:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  // 🔧 MÉTODOS PRIVADOS DE UTILIDAD

  /**
   * Mapear equipo de PocketBase a nuestro modelo Team
   */
  private mapPocketBaseTeamToTeam(pocketbaseTeam: any): Team {
    return {
      id: pocketbaseTeam.id,
      name: pocketbaseTeam.name,
      logo_url: pocketbaseTeam.logo || null,
      coach_name: pocketbaseTeam.coach_name || null,
      contact_email: pocketbaseTeam.contact_email || null,
      contact_phone: pocketbaseTeam.contact_phone || null,
      active: pocketbaseTeam.active ?? true,
      created_at: pocketbaseTeam.created || new Date().toISOString(),
      updated_at: pocketbaseTeam.updated || new Date().toISOString(),
    };
  }

  /**
   * Parsear errores de PocketBase a mensajes amigables
   */
  private parsePocketBaseError(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message?.includes('name')) {
      return 'El nombre del equipo ya está en uso';
    }
    
    if (error.message?.includes('Not found')) {
      return 'Equipo no encontrado';
    }
    
    return error.message || 'Error desconocido';
  }
}