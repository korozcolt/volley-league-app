// lib/providers/pocketbase/matches.ts
import { IMatchesProvider, MatchFilters } from '../interfaces/IMatchesProvider';
import { Match, MatchStatus, Team } from '@/lib/types/models';

import PocketBase from 'pocketbase';

export class PocketBaseMatchesProvider implements IMatchesProvider {
  constructor(private pb: PocketBase) {}

  /**
   * Obtener todos los partidos con filtros opcionales
   */
  async getAll(filters?: MatchFilters): Promise<{ data: Match[]; error: string | null }> {
    try {
      // Construir filtros para PocketBase
      const filterConditions: string[] = [];
      
      if (filters?.tournament_id) {
        filterConditions.push(`tournament = "${filters.tournament_id}"`);
      }
      
      if (filters?.team_id) {
        filterConditions.push(`(home_team = "${filters.team_id}" || away_team = "${filters.team_id}")`);
      }
      
      if (filters?.status && filters.status.length > 0) {
        const statusFilter = filters.status.map(s => `status = "${s}"`).join(' || ');
        filterConditions.push(`(${statusFilter})`);
      }
      
      if (filters?.date_from) {
        filterConditions.push(`match_date >= "${filters.date_from}"`);
      }
      
      if (filters?.date_to) {
        filterConditions.push(`match_date <= "${filters.date_to}"`);
      }
      
      if (filters?.referee_id) {
        // Buscar en match_officials
        const officials = await this.pb.collection('match_officials').getFullList({
          filter: `main_referee = "${filters.referee_id}" || assistant_referee = "${filters.referee_id}"`
        });
        
        if (officials.length > 0) {
          const matchIds = officials.map(o => `"${o.match}"`).join(', ');
          filterConditions.push(`id in (${matchIds})`);
        } else {
          // Si no hay partidos asignados, devolver array vacío
          return { data: [], error: null };
        }
      }

      const filterString = filterConditions.length > 0 
        ? filterConditions.join(' && ') 
        : '';

      const matches = await this.pb.collection('matches').getFullList({
        sort: '-match_date',
        filter: filterString,
        expand: 'tournament,home_team,away_team'
      });

      const mappedMatches = matches.map(match => this.mapPocketBaseMatchToMatch(match));
      return { data: mappedMatches, error: null };
    } catch (error: any) {
      console.error('Error obteniendo partidos:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Obtener partido por ID
   */
  async getById(id: string): Promise<{ data: Match | null; error: string | null }> {
    try {
      const match = await this.pb.collection('matches').getOne(id, {
        expand: 'tournament,home_team,away_team'
      });
      
      const mappedMatch = this.mapPocketBaseMatchToMatch(match);
      return { data: mappedMatch, error: null };
    } catch (error: any) {
      console.error('Error obteniendo partido:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Crear nuevo partido
   */
  async create(matchData: Omit<Match, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Match | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const createData = {
        tournament: matchData.tournament_id,
        home_team: matchData.home_team_id,
        away_team: matchData.away_team_id,
        match_date: matchData.match_date,
        location: matchData.location || null,
        status: matchData.status || MatchStatus.SCHEDULED,
        home_score: matchData.home_score || 0,
        away_score: matchData.away_score || 0,
        sets_home: matchData.sets_home || 0,
        sets_away: matchData.sets_away || 0,
        notes: matchData.notes || null
      };

      const newMatch = await this.pb.collection('matches').create(createData);
      
      // Obtener el partido creado con las relaciones expandidas
      const expandedMatch = await this.pb.collection('matches').getOne(newMatch.id, {
        expand: 'tournament,home_team,away_team'
      });
      
      const mappedMatch = this.mapPocketBaseMatchToMatch(expandedMatch);
      return { data: mappedMatch, error: null };
    } catch (error: any) {
      console.error('Error creando partido:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Actualizar partido existente
   */
  async update(id: string, matchData: Partial<Match>): Promise<{ data: Match | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const updateData: any = {};
      
      if (matchData.tournament_id !== undefined) updateData.tournament = matchData.tournament_id;
      if (matchData.home_team_id !== undefined) updateData.home_team = matchData.home_team_id;
      if (matchData.away_team_id !== undefined) updateData.away_team = matchData.away_team_id;
      if (matchData.match_date !== undefined) updateData.match_date = matchData.match_date;
      if (matchData.location !== undefined) updateData.location = matchData.location;
      if (matchData.status !== undefined) updateData.status = matchData.status;
      if (matchData.home_score !== undefined) updateData.home_score = matchData.home_score;
      if (matchData.away_score !== undefined) updateData.away_score = matchData.away_score;
      if (matchData.sets_home !== undefined) updateData.sets_home = matchData.sets_home;
      if (matchData.sets_away !== undefined) updateData.sets_away = matchData.sets_away;
      if (matchData.notes !== undefined) updateData.notes = matchData.notes;

      const updatedMatch = await this.pb.collection('matches').update(id, updateData);
      
      // Obtener el partido actualizado con las relaciones expandidas
      const expandedMatch = await this.pb.collection('matches').getOne(id, {
        expand: 'tournament,home_team,away_team'
      });
      
      const mappedMatch = this.mapPocketBaseMatchToMatch(expandedMatch);
      return { data: mappedMatch, error: null };
    } catch (error: any) {
      console.error('Error actualizando partido:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Eliminar partido
   */
  async delete(id: string): Promise<{ error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { error: 'Usuario no autenticado' };
      }

      await this.pb.collection('matches').delete(id);
      return { error: null };
    } catch (error: any) {
      console.error('Error eliminando partido:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Obtener partidos por torneo
   */
  async getByTournament(tournamentId: string): Promise<{ data: Match[]; error: string | null }> {
    try {
      const matches = await this.pb.collection('matches').getFullList({
        filter: `tournament = "${tournamentId}"`,
        sort: 'match_date',
        expand: 'home_team,away_team'
      });

      const mappedMatches = matches.map(match => this.mapPocketBaseMatchToMatch(match));
      return { data: mappedMatches, error: null };
    } catch (error: any) {
      console.error('Error obteniendo partidos por torneo:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Obtener partidos por equipo
   */
  async getByTeam(teamId: string): Promise<{ data: Match[]; error: string | null }> {
    try {
      const matches = await this.pb.collection('matches').getFullList({
        filter: `home_team = "${teamId}" || away_team = "${teamId}"`,
        sort: '-match_date',
        expand: 'tournament,home_team,away_team'
      });

      const mappedMatches = matches.map(match => this.mapPocketBaseMatchToMatch(match));
      return { data: mappedMatches, error: null };
    } catch (error: any) {
      console.error('Error obteniendo partidos por equipo:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Obtener partidos por árbitro
   */
  async getByReferee(refereeId: string): Promise<{ data: Match[]; error: string | null }> {
    try {
      // Primero obtener los match_officials donde el usuario es árbitro
      const officials = await this.pb.collection('match_officials').getFullList({
        filter: `main_referee = "${refereeId}" || assistant_referee = "${refereeId}"`,
        expand: 'match,match.tournament,match.home_team,match.away_team'
      });

      const matches = officials
        .map(official => official.expand?.match)
        .filter(Boolean)
        .map(match => this.mapPocketBaseMatchToMatch(match));

      return { data: matches, error: null };
    } catch (error: any) {
      console.error('Error obteniendo partidos por árbitro:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Obtener próximos partidos
   */
  async getUpcoming(limit: number = 10): Promise<{ data: Match[]; error: string | null }> {
    try {
      const now = new Date().toISOString();
      const matches = await this.pb.collection('matches').getFullList({
        filter: `match_date >= "${now}" && (status = "${MatchStatus.SCHEDULED}" || status = "${MatchStatus.IN_PROGRESS}")`,
        sort: 'match_date',
        expand: 'tournament,home_team,away_team'
      });

      // Limitar los resultados
      const limitedMatches = matches.slice(0, limit);
      const mappedMatches = limitedMatches.map(match => this.mapPocketBaseMatchToMatch(match));
      return { data: mappedMatches, error: null };
    } catch (error: any) {
      console.error('Error obteniendo próximos partidos:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Actualizar puntuación del partido
   */
  async updateScore(matchId: string, homeScore: number, awayScore: number): Promise<{ data: Match | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const updateData = {
        home_score: homeScore,
        away_score: awayScore,
        status: homeScore !== awayScore ? MatchStatus.COMPLETED : MatchStatus.IN_PROGRESS
      };

      const updatedMatch = await this.pb.collection('matches').update(matchId, updateData);
      
      // Obtener el partido actualizado con las relaciones expandidas
      const expandedMatch = await this.pb.collection('matches').getOne(matchId, {
        expand: 'tournament,home_team,away_team'
      });
      
      const mappedMatch = this.mapPocketBaseMatchToMatch(expandedMatch);
      return { data: mappedMatch, error: null };
    } catch (error: any) {
      console.error('Error actualizando puntuación:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Actualizar estado del partido
   */
  async updateStatus(matchId: string, status: string): Promise<{ data: Match | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const updatedMatch = await this.pb.collection('matches').update(matchId, { status });
      
      // Obtener el partido actualizado con las relaciones expandidas
      const expandedMatch = await this.pb.collection('matches').getOne(matchId, {
        expand: 'tournament,home_team,away_team'
      });
      
      const mappedMatch = this.mapPocketBaseMatchToMatch(expandedMatch);
      return { data: mappedMatch, error: null };
    } catch (error: any) {
      console.error('Error actualizando estado del partido:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  // 🔧 MÉTODOS PRIVADOS DE UTILIDAD

  /**
   * Mapear partido de PocketBase a nuestro modelo Match
   */
  private mapPocketBaseMatchToMatch(pocketbaseMatch: any): Match {
    return {
      id: pocketbaseMatch.id,
      tournament_id: pocketbaseMatch.tournament,
      home_team_id: pocketbaseMatch.home_team,
      away_team_id: pocketbaseMatch.away_team,
      match_date: pocketbaseMatch.match_date,
      location: pocketbaseMatch.location || null,
      status: this.mapPocketBaseMatchStatus(pocketbaseMatch.status),
      home_score: pocketbaseMatch.home_score || 0,
      away_score: pocketbaseMatch.away_score || 0,
      sets_home: pocketbaseMatch.sets_home || 0,
      sets_away: pocketbaseMatch.sets_away || 0,
      notes: pocketbaseMatch.notes || null,
      created_at: pocketbaseMatch.created || new Date().toISOString(),
      updated_at: pocketbaseMatch.updated || new Date().toISOString(),
      
      // Relaciones expandidas (si están disponibles)
      tournament: pocketbaseMatch.expand?.tournament ? {
        id: pocketbaseMatch.expand.tournament.id,
        name: pocketbaseMatch.expand.tournament.name,
        type: pocketbaseMatch.expand.tournament.type,
        status: pocketbaseMatch.expand.tournament.status,
        start_date: pocketbaseMatch.expand.tournament.start_date,
        end_date: pocketbaseMatch.expand.tournament.end_date,
        description: pocketbaseMatch.expand.tournament.description,
        created_at: pocketbaseMatch.expand.tournament.created,
        updated_at: pocketbaseMatch.expand.tournament.updated
      } : undefined,
      
      home_team: pocketbaseMatch.expand?.home_team ? {
        id: pocketbaseMatch.expand.home_team.id,
        name: pocketbaseMatch.expand.home_team.name,
        logo_url: pocketbaseMatch.expand.home_team.logo || null,
        coach_name: pocketbaseMatch.expand.home_team.coach_name || null,
        contact_email: pocketbaseMatch.expand.home_team.contact_email || null,
        contact_phone: pocketbaseMatch.expand.home_team.contact_phone || null,
        active: pocketbaseMatch.expand.home_team.active ?? true,
        created_at: pocketbaseMatch.expand.home_team.created,
        updated_at: pocketbaseMatch.expand.home_team.updated
      } : undefined,
      
      away_team: pocketbaseMatch.expand?.away_team ? {
        id: pocketbaseMatch.expand.away_team.id,
        name: pocketbaseMatch.expand.away_team.name,
        logo_url: pocketbaseMatch.expand.away_team.logo || null,
        coach_name: pocketbaseMatch.expand.away_team.coach_name || null,
        contact_email: pocketbaseMatch.expand.away_team.contact_email || null,
        contact_phone: pocketbaseMatch.expand.away_team.contact_phone || null,
        active: pocketbaseMatch.expand.away_team.active ?? true,
        created_at: pocketbaseMatch.expand.away_team.created,
        updated_at: pocketbaseMatch.expand.away_team.updated
      } : undefined
    };
  }

  /**
   * Mapear estados de partido de PocketBase a nuestro enum
   */
  private mapPocketBaseMatchStatus(pocketbaseStatus: string): MatchStatus {
    switch (pocketbaseStatus?.toLowerCase()) {
      case 'scheduled':
        return MatchStatus.SCHEDULED;
      case 'in_progress':
        return MatchStatus.IN_PROGRESS;
      case 'completed':
        return MatchStatus.COMPLETED;
      case 'cancelled':
        return MatchStatus.CANCELLED;
      case 'postponed':
        return MatchStatus.POSTPONED;
      default:
        return MatchStatus.SCHEDULED;
    }
  }

  /**
   * Parsear errores de PocketBase a mensajes amigables
   */
  private parsePocketBaseError(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message?.includes('Not found')) {
      return 'Partido no encontrado';
    }
    
    if (error.message?.includes('tournament')) {
      return 'Error relacionado con el torneo';
    }
    
    if (error.message?.includes('team')) {
      return 'Error relacionado con los equipos';
    }
    
    return error.message || 'Error desconocido';
  }
}