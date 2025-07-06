import { ITeamsProvider, TeamFilters } from '../interfaces/ITeamsProvider';

import PocketBase from 'pocketbase';
import { Team } from '@/lib/types/models';

export class PocketBaseTeamsProvider implements ITeamsProvider {
    constructor(private pb: PocketBase) { }

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

            const records = await this.pb.collection('teams').getFullList<any>({
                sort: 'name',
                filter: filterString,
            });

            // Mapear datos de PocketBase a nuestro modelo Team
            const teams: Team[] = records.map(record => ({
                id: record.id,
                name: record.name,
                logo_url: record.logo ? this.pb.files.getUrl(record, record.logo) : null,
                coach_name: record.coach_name || null,
                contact_email: record.contact_email || null,
                contact_phone: record.contact_phone || null,
                created_at: record.created || new Date().toISOString(),
                updated_at: record.updated || new Date().toISOString(),
            }));

            return { data: teams, error: null };
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
            const record = await this.pb.collection('teams').getOne<any>(id);

            const team: Team = {
                id: record.id,
                name: record.name,
                logo_url: record.logo ? this.pb.files.getUrl(record, record.logo) : null,
                coach_name: record.coach_name || null,
                contact_email: record.contact_email || null,
                contact_phone: record.contact_phone || null,
                created_at: record.created || new Date().toISOString(),
                updated_at: record.updated || new Date().toISOString(),
            };

            return { data: team, error: null };
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
            // Mapear datos a formato PocketBase
            const createData: any = {
                name: teamData.name,
                coach_name: teamData.coach_name || '',
                contact_email: teamData.contact_email || '',
                contact_phone: teamData.contact_phone || '',
                active: true, // Por defecto activo
            };

            const record = await this.pb.collection('teams').create<any>(createData);

            const team: Team = {
                id: record.id,
                name: record.name,
                logo_url: record.logo ? this.pb.files.getUrl(record, record.logo) : null,
                coach_name: record.coach_name || null,
                contact_email: record.contact_email || null,
                contact_phone: record.contact_phone || null,
                created_at: record.created || new Date().toISOString(),
                updated_at: record.updated || new Date().toISOString(),
            };

            return { data: team, error: null };
        } catch (error: any) {
            console.error('Error creando equipo:', error);
            return {
                data: null,
                error: this.parsePocketBaseError(error)
            };
        }
    }

    /**
     * Actualizar equipo
     */
    async update(id: string, teamData: Partial<Team>): Promise<{ data: Team | null; error: string | null }> {
        try {
            // Mapear solo los campos que se pueden actualizar
            const updateData: any = {};

            if (teamData.name !== undefined) {
                updateData.name = teamData.name;
            }

            if (teamData.coach_name !== undefined) {
                updateData.coach_name = teamData.coach_name || '';
            }

            if (teamData.contact_email !== undefined) {
                updateData.contact_email = teamData.contact_email || '';
            }

            if (teamData.contact_phone !== undefined) {
                updateData.contact_phone = teamData.contact_phone || '';
            }

            const record = await this.pb.collection('teams').update<any>(id, updateData);

            const team: Team = {
                id: record.id,
                name: record.name,
                logo_url: record.logo ? this.pb.files.getUrl(record, record.logo) : null,
                coach_name: record.coach_name || null,
                contact_email: record.contact_email || null,
                contact_phone: record.contact_phone || null,
                created_at: record.created || new Date().toISOString(),
                updated_at: record.updated || new Date().toISOString(),
            };

            return { data: team, error: null };
        } catch (error: any) {
            console.error('Error actualizando equipo:', error);
            return {
                data: null,
                error: this.parsePocketBaseError(error)
            };
        }
    }

    /**
     * Eliminar equipo (soft delete)
     */
    async delete(id: string): Promise<{ error: string | null }> {
        try {
            // En lugar de eliminar, marcar como inactivo
            await this.pb.collection('teams').update(id, { active: false });
            return { error: null };
        } catch (error: any) {
            console.error('Error eliminando equipo:', error);
            return {
                error: this.parsePocketBaseError(error)
            };
        }
    }

    /**
     * Buscar equipos por nombre
     */
    async search(query: string): Promise<{ data: Team[]; error: string | null }> {
        return this.getAll({ search: query, active: true });
    }

    /**
     * Activar/desactivar equipo
     */
    async toggleActive(id: string, active: boolean): Promise<{ data: Team | null; error: string | null }> {
        try {
            const record = await this.pb.collection('teams').update<any>(id, { active });

            const team: Team = {
                id: record.id,
                name: record.name,
                logo_url: record.logo ? this.pb.files.getUrl(record, record.logo) : null,
                coach_name: record.coach_name || null,
                contact_email: record.contact_email || null,
                contact_phone: record.contact_phone || null,
                created_at: record.created || new Date().toISOString(),
                updated_at: record.updated || new Date().toISOString(),
            };

            return { data: team, error: null };
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
            // Crear FormData para upload
            const formData = new FormData();
            formData.append('logo', logoFile);

            const record = await this.pb.collection('teams').update<any>(id, formData);

            const team: Team = {
                id: record.id,
                name: record.name,
                logo_url: record.logo ? this.pb.files.getUrl(record, record.logo) : null,
                coach_name: record.coach_name || null,
                contact_email: record.contact_email || null,
                contact_phone: record.contact_phone || null,
                created_at: record.created || new Date().toISOString(),
                updated_at: record.updated || new Date().toISOString(),
            };

            return { data: team, error: null };
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
        return team.logo_url;
    }

    /**
     * Obtener estadísticas del equipo
     */
    async getStats(id: string): Promise<{ data: any | null; error: string | null }> {
        try {
            // Obtener estadísticas básicas del equipo
            const team = await this.getById(id);
            if (team.error || !team.data) {
                return { data: null, error: team.error };
            }

            // Obtener jugadores del equipo
            const players = await this.pb.collection('players').getFullList({
                filter: `team = "${id}" && active = true`,
            });

            // Obtener partidos del equipo
            const matches = await this.pb.collection('matches').getFullList({
                filter: `home_team = "${id}" || away_team = "${id}"`,
                expand: 'tournament',
            });

            // Calcular estadísticas
            const stats = {
                players_count: players.length,
                matches_played: matches.length,
                matches_won: matches.filter(match => {
                    if (match.home_team === id) {
                        return match.home_score > match.away_score;
                    } else {
                        return match.away_score > match.home_score;
                    }
                }).length,
                matches_lost: matches.filter(match => {
                    if (match.home_team === id) {
                        return match.home_score < match.away_score;
                    } else {
                        return match.away_score < match.home_score;
                    }
                }).length,
                tournaments: [...new Set(matches.map(match => match.expand?.tournament?.id))].length,
            };

            return { data: stats, error: null };
        } catch (error: any) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                data: null,
                error: this.parsePocketBaseError(error)
            };
        }
    }

    // 🔧 MÉTODOS PRIVADOS DE UTILIDAD

    /**
     * Parsear errores de PocketBase a mensajes amigables
     */
    private parsePocketBaseError(error: any): string {
        if (error.response?.data) {
            const data = error.response.data;

            // Errores de validación específicos
            if (data.name) {
                return 'El nombre del equipo ya existe o no es válido';
            }

            if (data.contact_email) {
                return 'El email de contacto no es válido';
            }

            if (data.message) {
                return data.message;
            }
        }

        // Errores comunes
        if (error.status === 404) {
            return 'Equipo no encontrado';
        }

        if (error.status === 403) {
            return 'No tienes permisos para realizar esta acción';
        }

        if (error.message?.includes('network')) {
            return 'Error de conexión. Verifica tu internet';
        }

        return error.message || 'Error desconocido al procesar equipo';
    }
}