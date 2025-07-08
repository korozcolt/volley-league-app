import PocketBase from 'pocketbase';
import { IMatchGenerationProvider, GenerationOptions } from '../interfaces/IMatchGenerationProvider';

export class PocketBaseMatchGenerationProvider implements IMatchGenerationProvider {
  constructor(private pb: PocketBase) {}

  async generateMatches(tournamentId: string, options: GenerationOptions) {
    try {
      // TODO: Implementar generación de partidos
      // Referencia: TournamentMatchGenerator ya implementado en artifacts - migrar aquí
      
      // 1. Obtener equipos inscritos
      const registrations = await this.pb.collection('tournament_registrations').getList(1, 50, {
        filter: `tournament = "${tournamentId}" && status = "approved"`,
        expand: 'team'
      });
      
      const teams = registrations.items.map(r => r.expand?.team);
      
      if (teams.length < 2) {
        return { data: [], error: 'Se necesitan al menos 2 equipos para generar partidos' };
      }
      
      // 2. Generar partidos según tipo
      let matches: any[] = [];
      
      switch (options.type) {
        case 'round_robin':
          matches = this.generateRoundRobinMatches(teams, tournamentId, options);
          break;
        case 'elimination':
          matches = this.generateEliminationMatches(teams, tournamentId, options);
          break;
        default:
          return { data: [], error: `Tipo de torneo ${options.type} no implementado aún` };
      }
      
      // 3. Crear partidos en la base de datos
      const createdMatches = [];
      for (const match of matches) {
        const created = await this.pb.collection('matches').create(match);
        createdMatches.push(created);
      }
      
      return { data: createdMatches, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  async regenerateMatches(tournamentId: string, options: GenerationOptions) {
    try {
      // TODO: Implementar regeneración de partidos
      // 1. Eliminar partidos existentes que no hayan iniciado
      // 2. Generar nuevos partidos
      
      return await this.generateMatches(tournamentId, options);
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  async canGenerateMatches(tournamentId: string) {
    try {
      // TODO: Implementar validaciones
      // - Torneo en estado correcto
      // - Suficientes equipos inscritos
      // - No hay partidos ya iniciados
      
      return { data: true, error: null };
    } catch (error: any) {
      return { data: false, error: error.message };
    }
  }

  async getGenerationOptions(tournamentId: string) {
    try {
      // TODO: Obtener opciones desde configuración del torneo
      const tournament = await this.pb.collection('tournaments').getOne(tournamentId);
      
      const options: GenerationOptions = {
        type: tournament.type || 'round_robin',
        startDate: tournament.start_date,
        endDate: tournament.end_date,
        randomizeOrder: true
      };
      
      return { data: options, error: null };
    } catch (error: any) {
      return { data: { type: 'round_robin' } as GenerationOptions, error: error.message };
    }
  }

  async updateGenerationOptions(tournamentId: string, options: Partial<GenerationOptions>) {
    try {
      // TODO: Actualizar opciones en la configuración del torneo
      await this.pb.collection('tournaments').update(tournamentId, {
        type: options.type,
        // ... otras opciones
      });
      
      return { data: options, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Métodos auxiliares privados
  private generateRoundRobinMatches(teams: any[], tournamentId: string, options: GenerationOptions): any[] {
    const matches: any[] = [];
    let matchNumber = 1;
    
    // Round Robin: cada equipo juega contra todos los demás
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          tournament: tournamentId,
          home_team: teams[i].id,
          away_team: teams[j].id,
          status: 'scheduled',
          round: 1, // TODO: Calcular rondas apropiadamente
          match_number: matchNumber++,
          match_date: options.startDate || new Date().toISOString(),
        });
      }
    }
    
    return matches;
  }
  
  private generateEliminationMatches(teams: any[], tournamentId: string, options: GenerationOptions): any[] {
    // TODO: Implementar eliminación directa
    // Por ahora retornar Round Robin como fallback
    return this.generateRoundRobinMatches(teams, tournamentId, options);
  }
}
