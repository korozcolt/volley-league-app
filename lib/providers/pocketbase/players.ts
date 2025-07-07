// lib/providers/pocketbase/players.ts
import { IPlayersProvider, PlayerFilters } from '../interfaces/IPlayersProvider';
import { Player, PlayerPosition } from '@/lib/types/models';

import PocketBase from 'pocketbase';

export class PocketBasePlayersProvider implements IPlayersProvider {
  constructor(private pb: PocketBase) {}

  /**
   * Obtener todos los jugadores con filtros opcionales
   */
  async getAll(filters?: PlayerFilters): Promise<{ data: Player[]; error: string | null }> {
    try {
      // Construir filtros para PocketBase
      const filterConditions: string[] = [];
      
      if (filters?.team_id) {
        filterConditions.push(`team = "${filters.team_id}"`);
      }
      
      if (filters?.active !== undefined) {
        filterConditions.push(`active = ${filters.active}`);
      }
      
      if (filters?.position) {
        filterConditions.push(`position = "${filters.position}"`);
      }
      
      if (filters?.search) {
        filterConditions.push(`(full_name ~ "${filters.search}" || jersey_number ~ "${filters.search}")`);
      }
      
      if (filters?.captain !== undefined) {
        filterConditions.push(`captain = ${filters.captain}`);
      }

      const filterString = filterConditions.length > 0 
        ? filterConditions.join(' && ') 
        : '';

      const players = await this.pb.collection('players').getFullList({
        sort: 'jersey_number',
        filter: filterString,
        expand: 'team,user'
      });

      const mappedPlayers = players.map(player => this.mapPocketBasePlayerToPlayer(player));
      return { data: mappedPlayers, error: null };
    } catch (error: any) {
      console.error('Error obteniendo jugadores:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Obtener jugador por ID
   */
  async getById(id: string): Promise<{ data: Player | null; error: string | null }> {
    try {
      const player = await this.pb.collection('players').getOne(id, {
        expand: 'team,user'
      });
      
      const mappedPlayer = this.mapPocketBasePlayerToPlayer(player);
      return { data: mappedPlayer, error: null };
    } catch (error: any) {
      console.error('Error obteniendo jugador:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Crear nuevo jugador
   */
  async create(playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Player | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const createData = {
        team: playerData.team_id,
        user: playerData.user_id || null,
        full_name: playerData.full_name,
        jersey_number: playerData.jersey_number,
        position: playerData.position || null,
        birth_date: playerData.birth_date || null,
        height: playerData.height || null,
        active: playerData.active ?? true,
        captain: playerData.captain ?? false
      };

      const newPlayer = await this.pb.collection('players').create(createData);
      
      // Obtener el jugador creado con las relaciones expandidas
      const expandedPlayer = await this.pb.collection('players').getOne(newPlayer.id, {
        expand: 'team,user'
      });
      
      const mappedPlayer = this.mapPocketBasePlayerToPlayer(expandedPlayer);
      return { data: mappedPlayer, error: null };
    } catch (error: any) {
      console.error('Error creando jugador:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Actualizar jugador existente
   */
  async update(id: string, playerData: Partial<Player>): Promise<{ data: Player | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const updateData: any = {};
      
      if (playerData.team_id !== undefined) updateData.team = playerData.team_id;
      if (playerData.user_id !== undefined) updateData.user = playerData.user_id;
      if (playerData.full_name !== undefined) updateData.full_name = playerData.full_name;
      if (playerData.jersey_number !== undefined) updateData.jersey_number = playerData.jersey_number;
      if (playerData.position !== undefined) updateData.position = playerData.position;
      if (playerData.birth_date !== undefined) updateData.birth_date = playerData.birth_date;
      if (playerData.height !== undefined) updateData.height = playerData.height;
      if (playerData.active !== undefined) updateData.active = playerData.active;
      if (playerData.captain !== undefined) updateData.captain = playerData.captain;

      const updatedPlayer = await this.pb.collection('players').update(id, updateData);
      
      // Obtener el jugador actualizado con las relaciones expandidas
      const expandedPlayer = await this.pb.collection('players').getOne(id, {
        expand: 'team,user'
      });
      
      const mappedPlayer = this.mapPocketBasePlayerToPlayer(expandedPlayer);
      return { data: mappedPlayer, error: null };
    } catch (error: any) {
      console.error('Error actualizando jugador:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Eliminar jugador
   */
  async delete(id: string): Promise<{ error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { error: 'Usuario no autenticado' };
      }

      await this.pb.collection('players').delete(id);
      return { error: null };
    } catch (error: any) {
      console.error('Error eliminando jugador:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Obtener jugadores por equipo
   */
  async getByTeam(teamId: string): Promise<{ data: Player[]; error: string | null }> {
    try {
      const players = await this.pb.collection('players').getFullList({
        filter: `team = "${teamId}" && active = true`,
        sort: 'jersey_number',
        expand: 'user'
      });

      const mappedPlayers = players.map(player => this.mapPocketBasePlayerToPlayer(player));
      return { data: mappedPlayers, error: null };
    } catch (error: any) {
      console.error('Error obteniendo jugadores por equipo:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Buscar jugadores por texto
   */
  async search(query: string): Promise<{ data: Player[]; error: string | null }> {
    try {
      const players = await this.pb.collection('players').getFullList({
        filter: `full_name ~ "${query}" || jersey_number ~ "${query}"`,
        sort: 'full_name',
        expand: 'team,user'
      });

      const mappedPlayers = players.map(player => this.mapPocketBasePlayerToPlayer(player));
      return { data: mappedPlayers, error: null };
    } catch (error: any) {
      console.error('Error buscando jugadores:', error);
      return { 
        data: [], 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Activar/desactivar jugador
   */
  async toggleActive(id: string, active: boolean): Promise<{ data: Player | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const updatedPlayer = await this.pb.collection('players').update(id, { active });
      
      // Obtener el jugador actualizado con las relaciones expandidas
      const expandedPlayer = await this.pb.collection('players').getOne(id, {
        expand: 'team,user'
      });
      
      const mappedPlayer = this.mapPocketBasePlayerToPlayer(expandedPlayer);
      return { data: mappedPlayer, error: null };
    } catch (error: any) {
      console.error('Error cambiando estado del jugador:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Establecer/quitar capitán
   */
  async setCaptain(id: string, captain: boolean): Promise<{ data: Player | null; error: string | null }> {
    try {
      if (!this.pb.authStore.isValid) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      // Si se está estableciendo como capitán, primero quitar el capitán actual del equipo
      if (captain) {
        const player = await this.pb.collection('players').getOne(id);
        
        // Quitar capitán actual del mismo equipo
        await this.pb.collection('players').getFullList({
          filter: `team = "${player.team}" && captain = true`
        }).then(currentCaptains => {
          currentCaptains.forEach(async (currentCaptain) => {
            if (currentCaptain.id !== id) {
              await this.pb.collection('players').update(currentCaptain.id, { captain: false });
            }
          });
        });
      }

      const updatedPlayer = await this.pb.collection('players').update(id, { captain });
      
      // Obtener el jugador actualizado con las relaciones expandidas
      const expandedPlayer = await this.pb.collection('players').getOne(id, {
        expand: 'team,user'
      });
      
      const mappedPlayer = this.mapPocketBasePlayerToPlayer(expandedPlayer);
      return { data: mappedPlayer, error: null };
    } catch (error: any) {
      console.error('Error estableciendo capitán:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  /**
   * Obtener estadísticas del jugador
   */
  async getStats(id: string): Promise<{ data: any | null; error: string | null }> {
    try {
      // Obtener eventos de partido del jugador
      const events = await this.pb.collection('match_events').getFullList({
        filter: `player = "${id}"`,
        expand: 'match'
      });

      // Calcular estadísticas básicas
      const stats = {
        total_matches: 0,
        total_points: 0,
        total_events: events.length,
        points_breakdown: {
          attack: 0,
          block: 0,
          serve: 0,
          other: 0
        },
        sets_played: new Set()
      };

      const matchIds = new Set();
      
      events.forEach(event => {
        if (event.match) matchIds.add(event.match);
        if (event.set_number) stats.sets_played.add(`${event.match}-${event.set_number}`);
        
        if (event.event_type === 'point') {
          stats.total_points++;
          
          // Clasificar puntos por tipo (basado en detalles del evento)
          const details = event.details || {};
          switch (details.point_type) {
            case 'attack':
              stats.points_breakdown.attack++;
              break;
            case 'block':
              stats.points_breakdown.block++;
              break;
            case 'serve':
              stats.points_breakdown.serve++;
              break;
            default:
              stats.points_breakdown.other++;
          }
        }
      });

      stats.total_matches = matchIds.size;

      return { data: stats, error: null };
    } catch (error: any) {
      console.error('Error obteniendo estadísticas del jugador:', error);
      return { 
        data: null, 
        error: this.parsePocketBaseError(error) 
      };
    }
  }

  // 🔧 MÉTODOS PRIVADOS DE UTILIDAD

  /**
   * Mapear jugador de PocketBase a nuestro modelo Player
   */
  private mapPocketBasePlayerToPlayer(pocketbasePlayer: any): Player {
    return {
      id: pocketbasePlayer.id,
      team_id: pocketbasePlayer.team,
      user_id: pocketbasePlayer.user || null,
      full_name: pocketbasePlayer.full_name,
      jersey_number: pocketbasePlayer.jersey_number,
      position: this.mapPocketBasePlayerPosition(pocketbasePlayer.position),
      birth_date: pocketbasePlayer.birth_date || null,
      height: pocketbasePlayer.height || null,
      active: pocketbasePlayer.active ?? true,
      captain: pocketbasePlayer.captain ?? false,
      created_at: pocketbasePlayer.created || new Date().toISOString(),
      updated_at: pocketbasePlayer.updated || new Date().toISOString(),
      
      // Relaciones expandidas (si están disponibles)
      team: pocketbasePlayer.expand?.team ? {
        id: pocketbasePlayer.expand.team.id,
        name: pocketbasePlayer.expand.team.name,
        logo_url: pocketbasePlayer.expand.team.logo || null,
        coach_name: pocketbasePlayer.expand.team.coach_name || null,
        contact_email: pocketbasePlayer.expand.team.contact_email || null,
        contact_phone: pocketbasePlayer.expand.team.contact_phone || null,
        active: pocketbasePlayer.expand.team.active ?? true,
        created_at: pocketbasePlayer.expand.team.created,
        updated_at: pocketbasePlayer.expand.team.updated
      } : undefined,
      
      user: pocketbasePlayer.expand?.user ? {
        id: pocketbasePlayer.expand.user.id,
        email: pocketbasePlayer.expand.user.email,
        full_name: pocketbasePlayer.expand.user.full_name,
        role: pocketbasePlayer.expand.user.role,
        created_at: pocketbasePlayer.expand.user.created,
        updated_at: pocketbasePlayer.expand.user.updated
      } : undefined
    };
  }

  /**
   * Mapear posiciones de jugador de PocketBase a nuestro enum
   */
  private mapPocketBasePlayerPosition(pocketbasePosition: string | null): PlayerPosition | null {
    if (!pocketbasePosition) return null;
    
    switch (pocketbasePosition.toLowerCase()) {
      case 'setter':
        return PlayerPosition.SETTER;
      case 'opposite':
        return PlayerPosition.OPPOSITE;
      case 'middle_blocker':
        return PlayerPosition.MIDDLE_BLOCKER;
      case 'libero':
        return PlayerPosition.LIBERO;
      case 'outside_hitter':
        return PlayerPosition.OUTSIDE_HITTER;
      default:
        return null;
    }
  }

  /**
   * Parsear errores de PocketBase a mensajes amigables
   */
  private parsePocketBaseError(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message?.includes('jersey_number')) {
      return 'El número de camiseta ya está en uso en este equipo';
    }
    
    if (error.message?.includes('full_name')) {
      return 'El nombre del jugador es requerido';
    }
    
    if (error.message?.includes('Not found')) {
      return 'Jugador no encontrado';
    }
    
    return error.message || 'Error desconocido';
  }
}