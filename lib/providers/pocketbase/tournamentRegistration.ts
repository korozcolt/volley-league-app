import PocketBase from 'pocketbase';
import { ITournamentRegistrationProvider } from '../interfaces/ITournamentRegistrationProvider';

export class PocketBaseTournamentRegistrationProvider implements ITournamentRegistrationProvider {
  constructor(private pb: PocketBase) {}

  async registerTeam(tournamentId: string, teamId: string) {
    try {
      // TODO: Implementar lógica de inscripción
      // Referencia: Ya hay lógica en artifacts - migrar aquí
      const data = await this.pb.collection('tournament_registrations').create({
        tournament: tournamentId,
        team: teamId,
        status: 'pending',
        registered_at: new Date().toISOString()
      });
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async unregisterTeam(tournamentId: string, teamId: string) {
    try {
      // TODO: Implementar lógica de desinscripción
      const records = await this.pb.collection('tournament_registrations').getList(1, 1, {
        filter: `tournament = "${tournamentId}" && team = "${teamId}"`
      });
      
      if (records.items.length > 0) {
        await this.pb.collection('tournament_registrations').delete(records.items[0].id);
      }
      
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async getRegistrations(tournamentId: string) {
    try {
      const records = await this.pb.collection('tournament_registrations').getList(1, 50, {
        filter: `tournament = "${tournamentId}"`,
        expand: 'team'
      });
      
      return { data: records.items, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  async isTeamRegistered(tournamentId: string, teamId: string) {
    try {
      const records = await this.pb.collection('tournament_registrations').getList(1, 1, {
        filter: `tournament = "${tournamentId}" && team = "${teamId}"`
      });
      
      return { data: records.items.length > 0, error: null };
    } catch (error: any) {
      return { data: false, error: error.message };
    }
  }

  async canRegisterTeam(tournamentId: string, teamId: string) {
    try {
      // TODO: Implementar validaciones de inscripción
      // - Torneo abierto para inscripciones
      // - Equipo no ya inscrito
      // - Límite de equipos no alcanzado
      
      return { data: true, error: null };
    } catch (error: any) {
      return { data: false, error: error.message };
    }
  }

  async getRegistrationStats(tournamentId: string) {
    try {
      const records = await this.pb.collection('tournament_registrations').getList(1, 200, {
        filter: `tournament = "${tournamentId}"`
      });
      
      const stats = {
        total: records.items.length,
        pending: records.items.filter(r => r.status === 'pending').length,
        approved: records.items.filter(r => r.status === 'approved').length,
        rejected: records.items.filter(r => r.status === 'rejected').length,
      };
      
      return { data: stats, error: null };
    } catch (error: any) {
      return { data: { total: 0, pending: 0, approved: 0, rejected: 0 }, error: error.message };
    }
  }
}
