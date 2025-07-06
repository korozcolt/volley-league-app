import { ITournamentsProvider, TournamentFilters } from '../interfaces/ITournamentsProvider';
import { Team, Tournament, TournamentStatus, TournamentType } from '@/lib/types/models';

import PocketBase from 'pocketbase';

export class PocketBaseTournamentsProvider implements ITournamentsProvider {
  constructor(private pb: PocketBase) {}

  /**
   * Obtener todos los torneos con filtros opcionales
   */
  async getAll(filters?: TournamentFilters): Promise<{ data: Tournament[]; error: string | null }> {
    try {
      // Construir filtros para PocketBase
      const filterConditions: string[] = [];
      
      if (filters?.status && filters.status.length > 0) {
        const statusFilter = filters.status.map(s => `status = "${s}"`).join(' || ');
        filterConditions.push(`(${statusFilter})`);
      }
      
      if (filters?.type && filters.type.length > 0) {
        const typeFilter = filters.type.map(t => `type = "${t}"`).join(' || ');
        filterConditions.push(`(${typeFilter})`);
      }
      
      if (filters?.search) {
        filterConditions.push(`name ~ "${filters.search}"`);
      }
      
      if (filters?.date_from) {
        filterConditions.push(`start_date >= "${filters.date_from}"`);
      }
      
      if (filters?.date_to) {
        filterConditions.push(`start_date <= "${filters.date_to}"`);
      }

      const filterString = filterConditions.length > 0 
        ? filterConditions.join(' && ') 
        : '';

      const records = await this.pb.collection('tournaments').getFullList<any>({
        sort: '-start_date',
        filter: filterString,
        expand: 'created_by',
      });

      // Mapear datos de PocketBase a nuestro modelo Tournament
      const tournaments: Tournament[] = records.map(record => ({
        id: record.id,
        name: record.name,
        start_date: record.start_date || new Date().toISOString(),
        end_date: record.end_date || null,
        location: record.location || null,
        description: record.description || null,
        type: this.mapPocketBaseTournamentType(record.type),
        status: this.mapPocketBaseTournamentStatus(record.status),
        teams_to_qualify: record.teams_to_qualify || null,
        created_at: record.created || new Date().toISOString(),
        updated_at: record.updated || new Date().toISOString(),
      }));

      return { data: tournaments, error: null };
    } catch (error: any) {
      console.error('Error obteniendo torneos:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Obtener torneo por ID
   */
  async getById(id: string): Promise<{ data: Tournament | null; error: string | null }> {
    try {
      const record = await this.pb.collection('tournaments').getOne<any>(id, {
        expand: 'created_by',
      });
      
      const tournament: Tournament = {
        id: record.id,
        name: record.name,
        start_date: record.start_date || new Date().toISOString(),
        end_date: record.end_date || null,
        location: record.location || null,
        description: record.description || null,
        type: this.mapPocketBaseTournamentType(record.type),
        status: this.mapPocketBaseTournamentStatus(record.status),
        teams_to_qualify: record.teams_to_qualify || null,
        created_at: record.created || new Date().toISOString(),
        updated_at: record.updated || new Date().toISOString(),
      };

      return { data: tournament, error: null };
    } catch (error: any) {
      console.error('Error obteniendo torneo:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Crear nuevo torneo
   */
  async create(tournamentData: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Tournament | null; error: string | null }> {
    try {
      // Obtener usuario actual para created_by
      const currentUser = this.pb.authStore.model;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // Mapear datos a formato PocketBase
      const createData: any = {
        name: tournamentData.name,
        start_date: tournamentData.start_date,
        end_date: tournamentData.end_date || '',
        location: tournamentData.location || '',
        description: tournamentData.description || '',
        type: this.mapToSupabaseTournamentType(tournamentData.type),
        status: this.mapToSupabaseTournamentStatus(tournamentData.status),
        teams_to_qualify: tournamentData.teams_to_qualify || 0,
        created_by: currentUser.id,
      };

      const record = await this.pb.collection('tournaments').create<any>(createData);
      
      const tournament: Tournament = {
        id: record.id,
        name: record.name,
        start_date: record.start_date || new Date().toISOString(),
        end_date: record.end_date || null,
        location: record.location || null,
        description: record.description || null,
        type: this.mapPocketBaseTournamentType(record.type),
        status: this.mapPocketBaseTournamentStatus(record.status),
        teams_to_qualify: record.teams_to_qualify || null,
        created_at: record.created || new Date().toISOString(),
        updated_at: record.updated || new Date().toISOString(),
      };

      return { data: tournament, error: null };
    } catch (error: any) {
      console.error('Error creando torneo:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Actualizar torneo
   */
  async update(id: string, tournamentData: Partial<Tournament>): Promise<{ data: Tournament | null; error: string | null }> {
    try {
      // Mapear solo los campos que se pueden actualizar
      const updateData: any = {};
      
      if (tournamentData.name !== undefined) {
        updateData.name = tournamentData.name;
      }
      
      if (tournamentData.start_date !== undefined) {
        updateData.start_date = tournamentData.start_date;
      }
      
      if (tournamentData.end_date !== undefined) {
        updateData.end_date = tournamentData.end_date || '';
      }
      
      if (tournamentData.location !== undefined) {
        updateData.location = tournamentData.location || '';
      }
      
      if (tournamentData.description !== undefined) {
        updateData.description = tournamentData.description || '';
      }
      
      if (tournamentData.type !== undefined) {
        updateData.type = this.mapToSupabaseTournamentType(tournamentData.type);
      }
      
      if (tournamentData.status !== undefined) {
        updateData.status = this.mapToSupabaseTournamentStatus(tournamentData.status);
      }
      
      if (tournamentData.teams_to_qualify !== undefined) {
        updateData.teams_to_qualify = tournamentData.teams_to_qualify || 0;
      }

      const record = await this.pb.collection('tournaments').update<any>(id, updateData);
      
      const tournament: Tournament = {
        id: record.id,
        name: record.name,
        start_date: record.start_date || new Date().toISOString(),
        end_date: record.end_date || null,
        location: record.location || null,
        description: record.description || null,
        type: this.mapPocketBaseTournamentType(record.type),
        status: this.mapPocketBaseTournamentStatus(record.status),
        teams_to_qualify: record.teams_to_qualify || null,
        created_at: record.created || new Date().toISOString(),
        updated_at: record.updated || new Date().toISOString(),
      };

      return { data: tournament, error: null };
    } catch (error: any) {
      console.error('Error actualizando torneo:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Eliminar torneo
   */
  async delete(id: string): Promise<{ error: string | null }> {
    try {
      await this.pb.collection('tournaments').delete(id);
      return { error: null };
    } catch (error: any) {
      console.error('Error eliminando torneo:', error);
      return { 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Buscar torneos por nombre
   */
  async search(query: string): Promise<{ data: Tournament[]; error: string | null }> {
    return this.getAll({ search: query });
  }

  /**
   * Obtener torneos por estado
   */
  async getByStatus(status: string): Promise<{ data: Tournament[]; error: string | null }> {
    return this.getAll({ status: [status] });
  }

  /**
   * Obtener estadísticas del torneo
   */
  async getStats(id: string): Promise<{ data: any | null; error: string | null }> {
    try {
      // Obtener torneo
      const tournament = await this.getById(id);
      if (tournament.error || !tournament.data) {
        return { data: null, error: tournament.error };
      }

      // Obtener equipos del torneo
      const teamsInTournament = await this.pb.collection('tournament_teams').getFullList({
        filter: `tournament = "${id}"`,
        expand: 'team',
      });

      // Obtener partidos del torneo
      const matches = await this.pb.collection('matches').getFullList({
        filter: `tournament = "${id}"`,
        expand: 'home_team,away_team',
      });

      // Calcular estadísticas
      const stats = {
        teams_count: teamsInTournament.length,
        matches_total: matches.length,
        matches_completed: matches.filter(match => match.status === 'completed').length,
        matches_pending: matches.filter(match => match.status === 'scheduled').length,
        matches_in_progress: matches.filter(match => match.status === 'in_progress').length,
        start_date: tournament.data.start_date,
        end_date: tournament.data.end_date,
        duration_days: tournament.data.end_date 
          ? Math.ceil((new Date(tournament.data.end_date).getTime() - new Date(tournament.data.start_date).getTime()) / (1000 * 60 * 60 * 24))
          : null,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      console.error('Error obteniendo estadísticas del torneo:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Agregar equipo al torneo
   */
  async addTeam(tournamentId: string, teamId: string): Promise<{ error: string | null }> {
    try {
      // Verificar si el equipo ya está en el torneo
      const existing = await this.pb.collection('tournament_teams').getFullList({
        filter: `tournament = "${tournamentId}" && team = "${teamId}"`,
      });

      if (existing.length > 0) {
        return { error: 'El equipo ya está inscrito en este torneo' };
      }

      // Agregar equipo al torneo
      await this.pb.collection('tournament_teams').create({
        tournament: tournamentId,
        team: teamId,
        points: 0,
        rank: null,
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error agregando equipo al torneo:', error);
      return { 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Remover equipo del torneo
   */
  async removeTeam(tournamentId: string, teamId: string): Promise<{ error: string | null }> {
    try {
      // Buscar el registro del equipo en el torneo
      const tournamentTeams = await this.pb.collection('tournament_teams').getFullList({
        filter: `tournament = "${tournamentId}" && team = "${teamId}"`,
      });

      if (tournamentTeams.length === 0) {
        return { error: 'El equipo no está inscrito en este torneo' };
      }

      // Eliminar registro
      await this.pb.collection('tournament_teams').delete(tournamentTeams[0].id);

      return { error: null };
    } catch (error: any) {
      console.error('Error removiendo equipo del torneo:', error);
      return { 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Obtener equipos del torneo
   */
  async getTeams(tournamentId: string): Promise<{ data: Team[]; error: string | null }> {
    try {
      const tournamentTeams = await this.pb.collection('tournament_teams').getFullList({
        filter: `tournament = "${tournamentId}"`,
        expand: 'team',
        sort: 'rank,points',
      });

      const teams: Team[] = tournamentTeams.map(tt => {
        const teamRecord = tt.expand?.team;
        return {
          id: teamRecord.id,
          name: teamRecord.name,
          logo_url: teamRecord.logo ? this.pb.files.getUrl(teamRecord, teamRecord.logo) : null,
          coach_name: teamRecord.coach_name || null,
          contact_email: teamRecord.contact_email || null,
          contact_phone: teamRecord.contact_phone || null,
          created_at: teamRecord.created || new Date().toISOString(),
          updated_at: teamRecord.updated || new Date().toISOString(),
        };
      });

      return { data: teams, error: null };
    } catch (error: any) {
      console.error('Error obteniendo equipos del torneo:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  // 🔧 MÉTODOS PRIVADOS DE UTILIDAD

  /**
   * Mapear tipos de torneo de PocketBase a nuestro enum
   */
  private mapPocketBaseTournamentType(pocketbaseType: string): TournamentType {
    switch (pocketbaseType?.toLowerCase()) {
      case 'points':
        return TournamentType.POINTS;
      case 'elimination':
        return TournamentType.ELIMINATION;
      case 'mixed':
        return TournamentType.MIXED;
      default:
        return TournamentType.POINTS;
    }
  }

  /**
   * Mapear estados de torneo de PocketBase a nuestro enum
   */
  private mapPocketBaseTournamentStatus(pocketbaseStatus: string): TournamentStatus {
    switch (pocketbaseStatus?.toLowerCase()) {
      case 'upcoming':
        return TournamentStatus.UPCOMING;
      case 'in_progress':
        return TournamentStatus.IN_PROGRESS;
      case 'completed':
        return TournamentStatus.COMPLETED;
      default:
        return TournamentStatus.UPCOMING;
    }
  }

  /**
   * Mapear nuestros tipos de torneo a formato PocketBase
   */
  private mapToSupabaseTournamentType(type: TournamentType): string {
    switch (type) {
      case TournamentType.POINTS:
        return 'points';
      case TournamentType.ELIMINATION:
        return 'elimination';
      case TournamentType.MIXED:
        return 'mixed';
      default:
        return 'points';
    }
  }

  /**
   * Mapear nuestros estados de torneo a formato PocketBase
   */
  private mapToSupabaseTournamentStatus(status: TournamentStatus): string {
    switch (status) {
      case TournamentStatus.UPCOMING:
        return 'upcoming';
      case TournamentStatus.IN_PROGRESS:
        return 'in_progress';
      case TournamentStatus.COMPLETED:
        return 'completed';
      default:
        return 'upcoming';
    }
  }

  /**
   * Parsear errores de PocketBase a mensajes amigables
   */
  private parsePocketBaseError(error: any): string {
    if (error.response?.data) {
      const data = error.response.data;
      
      // Errores de validación específicos
      if (data.name) {
        return 'El nombre del torneo ya existe o no es válido';
      }
      
      if (data.start_date) {
        return 'La fecha de inicio no es válida';
      }
      
      if (data.end_date) {
        return 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
      
      if (data.message) {
        return data.message;
      }
    }

    // Errores comunes
    if (error.status === 404) {
      return 'Torneo no encontrado';
    }

    if (error.status === 403) {
      return 'No tienes permisos para realizar esta acción';
    }

    if (error.message?.includes('network')) {
      return 'Error de conexión. Verifica tu internet';
    }

    if (error.message?.includes('duplicate')) {
      return 'Ya existe un torneo con este nombre';
    }

    return error.message || 'Error desconocido al procesar torneo';
  }
}