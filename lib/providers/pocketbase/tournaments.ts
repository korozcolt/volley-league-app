// lib/providers/pocketbase/tournaments.ts - CORREGIDO COMPLETO
import {
  ITournamentsProvider,
  TournamentFilters
} from '../interfaces/ITournamentsProvider';
import {
  Team,
  Tournament,
  TournamentStatus,
  TournamentType
} from '../../types/models';

import PocketBase from 'pocketbase';

export class PocketBaseTournamentsProvider implements ITournamentsProvider {
  constructor(private pb: PocketBase) { }

  /**
   * Buscar torneos por query
   */
  async search(query: string): Promise<{ data: Tournament[]; error: string | null }> {
    return this.getAll({ search: query });
  }

  /**
   * Obtener torneos por estado específico
   */
  async getByStatus(status: string): Promise<{ data: Tournament[]; error: string | null }> {
    const validStatuses = Object.values(TournamentStatus);
    if (!validStatuses.includes(status as TournamentStatus)) {
      return { data: [], error: `Estado de torneo inválido: ${status}` };
    }

    return this.getAll({ status: [status as TournamentStatus] });
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
        matches_completed: matches.filter((match: any) => match.status === 'completed').length,
        matches_pending: matches.filter((match: any) => match.status === 'scheduled').length,
        matches_in_progress: matches.filter((match: any) => match.status === 'in_progress').length,
        start_date: tournament.data.start_date,
        end_date: tournament.data.end_date,
        duration_days: tournament.data.end_date
          ? Math.ceil((new Date(tournament.data.end_date).getTime() - new Date(tournament.data.start_date).getTime()) / (1000 * 60 * 60 * 24))
          : null,
        completion_percentage: matches.length > 0
          ? Math.round((matches.filter((match: any) => match.status === 'completed').length / matches.length) * 100)
          : 0
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
   * Obtener todos los torneos con filtros opcionales
   */
  async getAll(filters?: TournamentFilters): Promise<{ data: Tournament[]; error: string | null }> {
    try {
      let filter = '';
      const filterConditions: string[] = [];

      // ✅ FILTROS CORRECTOS - Solo los que existen en TournamentFilters
      if (filters?.status && filters.status.length > 0) {
        const statusFilters = filters.status.map(s => `status="${s}"`).join(' || ');
        filterConditions.push(`(${statusFilters})`);
      }

      if (filters?.type && filters.type.length > 0) {
        const typeFilters = filters.type.map(t => `type="${t}"`).join(' || ');
        filterConditions.push(`(${typeFilters})`);
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

      filter = filterConditions.join(' && ');

      // ✅ ORDENAMIENTO CORRECTO - No usar sort_by que no existe
      const sortField = '-created'; // Por defecto más recientes primero

      const pocketbaseTournaments = await this.pb.collection('tournaments').getList(1, 50, {
        filter,
        sort: sortField,
        expand: 'created_by'
      });

      const tournaments: Tournament[] = pocketbaseTournaments.items.map((item: any) => {
        return {
          id: item.id,
          name: item.name,
          description: item.description || null,
          start_date: item.start_date,
          end_date: item.end_date || null,
          location: item.location || null,
          type: this.mapPocketBaseTournamentType(item.type),
          status: this.mapPocketBaseTournamentStatus(item.status),
          teams_to_qualify: item.teams_to_qualify || null,
          created_at: item.created || new Date().toISOString(),
          updated_at: item.updated || new Date().toISOString()
        };
      });

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
      const pocketbaseTournament = await this.pb.collection('tournaments').getOne(id, {
        expand: 'created_by'
      });

      const tournament: Tournament = {
        id: pocketbaseTournament.id,
        name: pocketbaseTournament.name,
        description: pocketbaseTournament.description || null,
        start_date: pocketbaseTournament.start_date,
        end_date: pocketbaseTournament.end_date || null,
        location: pocketbaseTournament.location || null,
        type: this.mapPocketBaseTournamentType(pocketbaseTournament.type),
        status: this.mapPocketBaseTournamentStatus(pocketbaseTournament.status),
        teams_to_qualify: pocketbaseTournament.teams_to_qualify || null,
        created_at: pocketbaseTournament.created || new Date().toISOString(),
        updated_at: pocketbaseTournament.updated || new Date().toISOString()
      };

      return { data: tournament, error: null };
    } catch (error: any) {
      console.error('Error obteniendo torneo por ID:', error);
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
      const pocketbaseData = {
        name: tournamentData.name,
        description: tournamentData.description,
        start_date: tournamentData.start_date,
        end_date: tournamentData.end_date,
        location: tournamentData.location,
        type: this.mapTournamentTypeToString(tournamentData.type),
        status: this.mapTournamentStatusToString(tournamentData.status),
        teams_to_qualify: tournamentData.teams_to_qualify,
        created_by: this.pb.authStore.model?.id
      };

      const pocketbaseTournament = await this.pb.collection('tournaments').create(pocketbaseData);

      const tournament: Tournament = {
        id: pocketbaseTournament.id,
        name: pocketbaseTournament.name,
        description: pocketbaseTournament.description || null,
        start_date: pocketbaseTournament.start_date,
        end_date: pocketbaseTournament.end_date || null,
        location: pocketbaseTournament.location || null,
        type: this.mapPocketBaseTournamentType(pocketbaseTournament.type),
        status: this.mapPocketBaseTournamentStatus(pocketbaseTournament.status),
        teams_to_qualify: pocketbaseTournament.teams_to_qualify || null,
        created_at: pocketbaseTournament.created || new Date().toISOString(),
        updated_at: pocketbaseTournament.updated || new Date().toISOString()
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
      const pocketbaseData: any = {};

      if (tournamentData.name !== undefined) pocketbaseData.name = tournamentData.name;
      if (tournamentData.description !== undefined) pocketbaseData.description = tournamentData.description;
      if (tournamentData.start_date !== undefined) pocketbaseData.start_date = tournamentData.start_date;
      if (tournamentData.end_date !== undefined) pocketbaseData.end_date = tournamentData.end_date;
      if (tournamentData.location !== undefined) pocketbaseData.location = tournamentData.location;
      if (tournamentData.type !== undefined) pocketbaseData.type = this.mapTournamentTypeToString(tournamentData.type);
      if (tournamentData.status !== undefined) pocketbaseData.status = this.mapTournamentStatusToString(tournamentData.status);
      if (tournamentData.teams_to_qualify !== undefined) pocketbaseData.teams_to_qualify = tournamentData.teams_to_qualify;

      const pocketbaseTournament = await this.pb.collection('tournaments').update(id, pocketbaseData);

      const tournament: Tournament = {
        id: pocketbaseTournament.id,
        name: pocketbaseTournament.name,
        description: pocketbaseTournament.description || null,
        start_date: pocketbaseTournament.start_date,
        end_date: pocketbaseTournament.end_date || null,
        location: pocketbaseTournament.location || null,
        type: this.mapPocketBaseTournamentType(pocketbaseTournament.type),
        status: this.mapPocketBaseTournamentStatus(pocketbaseTournament.status),
        teams_to_qualify: pocketbaseTournament.teams_to_qualify || null,
        created_at: pocketbaseTournament.created || new Date().toISOString(),
        updated_at: pocketbaseTournament.updated || new Date().toISOString()
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
      return { error: this.parsePocketBaseError(error) };
    }
  }

  // ✅ GESTIÓN DE EQUIPOS EN TORNEO - Según ITournamentsProvider

  /**
   * Agregar equipo al torneo
   */
  async addTeam(tournamentId: string, teamId: string): Promise<{ error: string | null }> {
    try {
      await this.pb.collection('tournament_teams').create({
        tournament: tournamentId,
        team: teamId,
        points: 0,
        rank: null
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error agregando equipo al torneo:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Remover equipo del torneo
   */
  async removeTeam(tournamentId: string, teamId: string): Promise<{ error: string | null }> {
    try {
      const records = await this.pb.collection('tournament_teams').getFullList({
        filter: `tournament="${tournamentId}" && team="${teamId}"`
      });

      if (records.length > 0) {
        await this.pb.collection('tournament_teams').delete(records[0].id);
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error removiendo equipo del torneo:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Obtener equipos del torneo
   * ✅ CORREGIDO - Incluye TODAS las propiedades requeridas por Team
   */
  async getTeams(tournamentId: string): Promise<{ data: Team[]; error: string | null }> {
    try {
      const tournamentTeams = await this.pb.collection('tournament_teams').getFullList({
        filter: `tournament="${tournamentId}"`,
        expand: 'team',
        sort: '-points'
      });

      const teams: Team[] = tournamentTeams.map((item: any) => {
        const teamRecord = item.expand?.team;
        if (!teamRecord) {
          throw new Error(`Team data not found for tournament team ${item.id}`);
        }

        return {
          id: teamRecord.id,
          name: teamRecord.name,
          active: teamRecord.active ?? true, // ✅ PROPIEDAD AGREGADA
          logo_url: teamRecord.logo ?
            this.pb.files.getUrl(teamRecord, teamRecord.logo) : null,
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
  private mapTournamentTypeToString(type: TournamentType): string {
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
  private mapTournamentStatusToString(status: TournamentStatus): string {
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