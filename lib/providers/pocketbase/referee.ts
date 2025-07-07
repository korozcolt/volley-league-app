import { Match, MatchEvent, Player } from '@/lib/types/models';

// lib/providers/pocketbase/referee.ts
import { IRefereeProvider } from '../interfaces/IRefereeProvider';
import PocketBase from 'pocketbase';

export class PocketBaseRefereeProvider implements IRefereeProvider {
  constructor(private pb: PocketBase) { }

  /**
   * Asignar árbitro principal a un partido
   */
  async assignMainReferee(matchId: string, refereeId: string): Promise<{ error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { error: 'Usuario no autenticado' };
      }

      // Verificar si ya existe un match_official para este partido
      const existingOfficial = await this.pb.collection('match_officials').getFirstListItem(
        `match = "${matchId}"`,
        { requestKey: null }
      ).catch(() => null);

      if (existingOfficial) {
        // Actualizar el árbitro principal existente
        await this.pb.collection('match_officials').update(existingOfficial.id, {
          main_referee: refereeId
        });
      } else {
        // Crear nuevo match_official
        await this.pb.collection('match_officials').create({
          match: matchId,
          main_referee: refereeId
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error asignando árbitro principal:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Asignar árbitro asistente a un partido
   */
  async assignAssistantReferee(matchId: string, refereeId: string): Promise<{ error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { error: 'Usuario no autenticado' };
      }

      // Verificar si ya existe un match_official para este partido
      const existingOfficial = await this.pb.collection('match_officials').getFirstListItem(
        `match = "${matchId}"`,
        { requestKey: null }
      ).catch(() => null);

      if (existingOfficial) {
        // Actualizar el árbitro asistente existente
        await this.pb.collection('match_officials').update(existingOfficial.id, {
          assistant_referee: refereeId
        });
      } else {
        // Crear nuevo match_official
        await this.pb.collection('match_officials').create({
          match: matchId,
          assistant_referee: refereeId
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error asignando árbitro asistente:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Registrar evento en el partido (función crítica para árbitros)
   */
  async recordEvent(eventData: Omit<MatchEvent, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: MatchEvent | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const currentUser = this.pb.authStore.model;
      if (!currentUser) {
        return { data: null, error: 'Usuario no encontrado' };
      }

      const createData = {
        match: eventData.match_id,
        set_number: eventData.set_number,
        event_type: eventData.event_type,
        team: eventData.team_id || null,
        player: eventData.player_id || null,
        points_home: eventData.points_home,
        points_away: eventData.points_away,
        timestamp: eventData.timestamp || new Date().toISOString(),
        details: eventData.details || null,
        recorded_by: currentUser.id
      };

      const newEvent = await this.pb.collection('match_events').create(createData);
      const mappedEvent = this.mapPocketBaseEventToMatchEvent(newEvent);
      return { data: mappedEvent, error: null };
    } catch (error: any) {
      console.error('Error registrando evento:', error);
      return {
        data: null,
        error: this.parsePocketBaseError(error)
      };
    }
  }

  /**
   * Actualizar puntuación del set actual
   */
  async updateSetScore(matchId: string, setNumber: number, homePoints: number, awayPoints: number): Promise<{ error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { error: 'Usuario no autenticado' };
      }

      const currentUser = this.pb.authStore.model;
      if (!currentUser) {
        return { error: 'Usuario no encontrado' };
      }

      // Registrar evento de actualización de puntuación
      await this.pb.collection('match_events').create({
        match: matchId,
        set_number: setNumber,
        event_type: 'point',
        points_home: homePoints,
        points_away: awayPoints,
        timestamp: new Date().toISOString(),
        recorded_by: currentUser.id
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error actualizando puntuación del set:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Finalizar set y registrar resultado
   */
  async finishSet(matchId: string, setNumber: number, homePoints: number, awayPoints: number): Promise<{ error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { error: 'Usuario no autenticado' };
      }

      const currentUser = this.pb.authStore.model;
      if (!currentUser) {
        return { error: 'Usuario no encontrado' };
      }

      // Registrar evento de finalización de set
      await this.pb.collection('match_events').create({
        match: matchId,
        set_number: setNumber,
        event_type: 'set_end',
        points_home: homePoints,
        points_away: awayPoints,
        timestamp: new Date().toISOString(),
        details: {
          set_winner: homePoints > awayPoints ? 'home' : 'away',
          final_score: `${homePoints}-${awayPoints}`
        },
        recorded_by: currentUser.id
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error finalizando set:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Registrar timeout
   */
  async recordTimeout(matchId: string, setNumber: number, teamId: string): Promise<{ error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { error: 'Usuario no autenticado' };
      }

      const currentUser = this.pb.authStore.model;
      if (!currentUser) {
        return { error: 'Usuario no encontrado' };
      }

      await this.pb.collection('match_events').create({
        match: matchId,
        set_number: setNumber,
        event_type: 'timeout',
        team: teamId,
        points_home: 0, // Se puede actualizar con la puntuación actual
        points_away: 0, // Se puede actualizar con la puntuación actual
        timestamp: new Date().toISOString(),
        recorded_by: currentUser.id
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error registrando timeout:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Registrar sustitución
   */
  async recordSubstitution(
    matchId: string,
    setNumber: number,
    teamId: string,
    playerInId: string,
    playerOutId: string
  ): Promise<{ error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { error: 'Usuario no autenticado' };
      }

      const currentUser = this.pb.authStore.model;
      if (!currentUser) {
        return { error: 'Usuario no encontrado' };
      }

      await this.pb.collection('match_events').create({
        match: matchId,
        set_number: setNumber,
        event_type: 'substitution',
        team: teamId,
        player: playerInId, // Jugador que entra
        points_home: 0, // Se puede actualizar con la puntuación actual
        points_away: 0, // Se puede actualizar con la puntuación actual
        timestamp: new Date().toISOString(),
        details: {
          player_in: playerInId,
          player_out: playerOutId
        },
        recorded_by: currentUser.id
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error registrando sustitución:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Registrar tarjeta (amonestación)
   */
  async recordCard(
    matchId: string,
    setNumber: number,
    teamId: string,
    playerId: string | null,
    cardType: 'yellow' | 'red',
    reason?: string
  ): Promise<{ error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { error: 'Usuario no autenticado' };
      }

      const currentUser = this.pb.authStore.model;
      if (!currentUser) {
        return { error: 'Usuario no encontrado' };
      }

      await this.pb.collection('match_events').create({
        match: matchId,
        set_number: setNumber,
        event_type: 'card',
        team: teamId,
        player: playerId,
        points_home: 0, // Se puede actualizar con la puntuación actual
        points_away: 0, // Se puede actualizar con la puntuación actual
        timestamp: new Date().toISOString(),
        details: {
          card_type: cardType,
          reason: reason || 'Conducta antideportiva'
        },
        recorded_by: currentUser.id
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error registrando tarjeta:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Obtener eventos del partido (para revisión)
   */
  async getMatchEvents(matchId: string): Promise<{ data: MatchEvent[]; error: string | null }> {
    try {
      const events = await this.pb.collection('match_events').getFullList({
        filter: `match = "${matchId}"`,
        sort: 'timestamp',
        expand: 'team,player,recorded_by'
      });

      const mappedEvents = events.map(event => this.mapPocketBaseEventToMatchEvent(event));
      return { data: mappedEvents, error: null };
    } catch (error: any) {
      console.error('Error obteniendo eventos del partido:', error);
      return {
        data: [],
        error: this.parsePocketBaseError(error)
      };
    }
  }

  /**
   * Obtener partidos asignados al árbitro actual
   */
  async getAssignedMatches(): Promise<{ data: Match[]; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: [], error: 'Usuario no autenticado' };
      }

      const currentUser = this.pb.authStore.model;
      if (!currentUser) {
        return { data: [], error: 'Usuario no encontrado' };
      }

      // Obtener match_officials donde el usuario es árbitro
      const officials = await this.pb.collection('match_officials').getFullList({
        filter: `main_referee = "${currentUser.id}" || assistant_referee = "${currentUser.id}"`,
        expand: 'match,match.tournament,match.home_team,match.away_team'
      });

      const matches = officials
        .map(official => official.expand?.match)
        .filter(Boolean)
        .map(match => this.mapPocketBaseMatchToMatch(match));

      return { data: matches, error: null };
    } catch (error: any) {
      console.error('Error obteniendo partidos asignados:', error);
      return {
        data: [],
        error: this.parsePocketBaseError(error)
      };
    }
  }

  /**
   * Validar si el usuario actual puede arbitrar un partido
   */
  async canRefereeMatch(matchId: string): Promise<{ canReferee: boolean; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { canReferee: false, error: 'Usuario no autenticado' };
      }

      const currentUser = this.pb.authStore.model;
      if (!currentUser) {
        return { canReferee: false, error: 'Usuario no encontrado' };
      }

      // Verificar si el usuario tiene rol de árbitro
      if (currentUser.role !== 'referee' && currentUser.role !== 'admin') {
        return { canReferee: false, error: 'Usuario no tiene permisos de árbitro' };
      }

      // Verificar si está asignado al partido
      const official = await this.pb.collection('match_officials').getFirstListItem(
        `match = "${matchId}" && (main_referee = "${currentUser.id}" || assistant_referee = "${currentUser.id}")`,
        { requestKey: null }
      ).catch(() => null);

      if (!official) {
        return { canReferee: false, error: 'Usuario no asignado a este partido' };
      }

      return { canReferee: true, error: null };
    } catch (error: any) {
      console.error('Error validando permisos de arbitraje:', error);
      return {
        canReferee: false,
        error: this.parsePocketBaseError(error)
      };
    }
  }

  // 🔧 MÉTODOS PRIVADOS DE UTILIDAD

  /**
   * Mapear evento de PocketBase a nuestro modelo MatchEvent
   */
  private mapPocketBaseEventToMatchEvent(pocketbaseEvent: any): MatchEvent {
    return {
      id: pocketbaseEvent.id,
      match_id: pocketbaseEvent.match,
      set_number: pocketbaseEvent.set_number,
      event_type: pocketbaseEvent.event_type,
      team_id: pocketbaseEvent.team || null,
      player_id: pocketbaseEvent.player || null,
      points_home: pocketbaseEvent.points_home || 0,
      points_away: pocketbaseEvent.points_away || 0,
      timestamp: pocketbaseEvent.timestamp,
      details: pocketbaseEvent.details || null,
      recorded_by: pocketbaseEvent.recorded_by,
      created_at: pocketbaseEvent.created || new Date().toISOString(),
      updated_at: pocketbaseEvent.updated || new Date().toISOString()
    };
  }

  /**
   * Mapear partido de PocketBase a nuestro modelo Match (simplificado)
   */
  private mapPocketBaseMatchToMatch(pocketbaseMatch: any): Match {
    return {
      id: pocketbaseMatch.id,
      tournament_id: pocketbaseMatch.tournament,
      home_team_id: pocketbaseMatch.home_team,
      away_team_id: pocketbaseMatch.away_team,
      match_date: pocketbaseMatch.match_date,
      location: pocketbaseMatch.location || null,
      status: pocketbaseMatch.status,
      home_score: pocketbaseMatch.home_score || 0,
      away_score: pocketbaseMatch.away_score || 0,
      sets_home: pocketbaseMatch.sets_home || 0,
      sets_away: pocketbaseMatch.sets_away || 0,
      notes: pocketbaseMatch.notes || null,
      created_at: pocketbaseMatch.created || new Date().toISOString(),
      updated_at: pocketbaseMatch.updated || new Date().toISOString()
    };
  }


  /**
   * Parsear errores de PocketBase (método faltante)
   */
  private parsePocketBaseError(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.status === 404) {
      return 'Partido no encontrado';
    }

    if (error.status === 403) {
      return 'No tienes permisos para esta operación';
    }

    return error.message || 'Error en el servidor';
  }
}