import AsyncStorage from '@react-native-async-storage/async-storage';
// lib/pocketbase/index.ts - Cliente PocketBase actualizado para producción
import PocketBase from 'pocketbase';

// URL de producción de tu PocketBase
const POCKETBASE_URL = 'https://back-volley.kronnos.dev';

// Configuración del cliente PocketBase
export const pb = new PocketBase(POCKETBASE_URL);

// Configurar AsyncStorage para persistir la sesión
pb.authStore.onChange((token, model) => {
    if (token && model) {
        AsyncStorage.setItem('pb_auth', JSON.stringify({ token, model }));
    } else {
        AsyncStorage.removeItem('pb_auth');
    }
});

// Restaurar sesión al iniciar la app
export const initializePocketBase = async () => {
    try {
        const authData = await AsyncStorage.getItem('pb_auth');
        if (authData) {
            const { token, model } = JSON.parse(authData);
            pb.authStore.save(token, model);
        }
    } catch (error) {
        console.error('Error al restaurar sesión:', error);
    }
};

// Tipos TypeScript actualizados según tu configuración
export interface User {
    id: string;
    email: string;
    name?: string;
    full_name: string;
    role: 'admin' | 'viewer' | 'coach' | 'player' | 'referee';
    phone?: string;
    avatar?: string;
    team_id?: string;
    created: string;
    updated: string;
}

export interface Team {
    id: string;
    name: string;
    logo?: string;
    coach_name?: string;
    contact_email?: string;
    contact_phone?: string;
    active: boolean;
    created: string;
    updated: string;
}

export interface Tournament {
    id: string;
    name: string;
    description?: string;
    start_date: string;
    end_date?: string;
    location?: string;
    type: 'points' | 'elimination' | 'mixed';
    status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
    max_teams?: number;
    created_by: string;
    created: string;
    updated: string;
}

export interface Match {
    id: string;
    tournament: string;
    home_team?: string;
    away_team?: string;
    home_score: number;
    away_score: number;
    match_date?: string;
    location?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
    created: string;
    updated: string;
}

export interface Player {
    id: string;
    team: string;
    user?: string;
    full_name: string;
    jersey_number: number;
    position?: 'setter' | 'opposite' | 'middle_blocker' | 'libero' | 'outside_hitter';
    birth_date?: string;
    height?: number;
    active: boolean;
    captain: boolean;
    created: string;
    updated: string;
}

export interface MatchEvent {
    id: string;
    match: string;
    set_number: number;
    event_type: 'point' | 'timeout' | 'substitution' | 'card' | 'rotation' | 'set_end';
    team?: string;
    player?: string;
    points_home: number;
    points_away: number;
    timestamp: string;
    details?: any;
    recorded_by: string;
    created: string;
    updated: string;
}

export interface MatchOfficial {
    id: string;
    match: string;
    main_referee: string;
    assistant_referee?: string;
    scorer?: string;
    created: string;
    updated: string;
}

export interface TeamLineup {
    id: string;
    match: string;
    team: string;
    set_number: number;
    position_1: string;
    position_2: string;
    position_3: string;
    position_4: string;
    position_5: string;
    position_6: string;
    libero?: string;
    created_by: string;
    created: string;
    updated: string;
}

// Funciones de autenticación actualizadas
export const authService = {
    // Login
    async login(email: string, password: string) {
        try {
            const authData = await pb.collection('users').authWithPassword(email, password);
            return { user: authData.record as User, error: null };
        } catch (error: any) {
            return { user: null, error: error.message };
        }
    },

    // Registro
    async register(email: string, password: string, full_name: string, role: string = 'viewer') {
        try {
            const userData = {
                email,
                password,
                passwordConfirm: password,
                full_name,
                role,
            };

            const user = await pb.collection('users').create(userData);
            return { user: user as User, error: null };
        } catch (error: any) {
            return { user: null, error: error.message };
        }
    },

    // Logout
    logout() {
        pb.authStore.clear();
    },

    // Obtener usuario actual
    getCurrentUser(): User | null {
        return pb.authStore.model as User | null;
    },

    // Verificar si está autenticado
    isAuthenticated(): boolean {
        return pb.authStore.isValid;
    },

    // Verificar rol específico
    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    },

    // Verificadores de rol
    isAdmin(): boolean {
        return this.hasRole('admin');
    },

    isReferee(): boolean {
        return this.hasRole('referee');
    },

    isCoach(): boolean {
        return this.hasRole('coach');
    },

    isPlayer(): boolean {
        return this.hasRole('player');
    }
};

// Servicios para cada colección
export const teamsService = {
    // Obtener todos los equipos activos
    async getAll() {
        try {
            const teams = await pb.collection('teams').getFullList<Team>({
                sort: 'name',
                filter: 'active = true'
            });
            return { data: teams, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    },

    // Obtener equipo por ID
    async getById(id: string) {
        try {
            const team = await pb.collection('teams').getOne<Team>(id);
            return { data: team, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },

    // Crear equipo (solo admins)
    async create(teamData: Partial<Team>) {
        try {
            const team = await pb.collection('teams').create<Team>(teamData);
            return { data: team, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },

    // Actualizar equipo
    async update(id: string, teamData: Partial<Team>) {
        try {
            const team = await pb.collection('teams').update<Team>(id, teamData);
            return { data: team, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }
};

export const tournamentsService = {
    // Obtener todos los torneos
    async getAll() {
        try {
            const tournaments = await pb.collection('tournaments').getFullList<Tournament>({
                sort: '-start_date',
                expand: 'created_by'
            });
            return { data: tournaments, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    },

    // Crear torneo
    async create(tournamentData: Partial<Tournament>) {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const dataWithUser = {
                ...tournamentData,
                created_by: currentUser.id
            };

            const tournament = await pb.collection('tournaments').create<Tournament>(dataWithUser);
            return { data: tournament, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }
};

export const matchesService = {
    // Obtener todos los partidos con relaciones
    async getAll() {
        try {
            const matches = await pb.collection('matches').getFullList<Match>({
                sort: '-match_date',
                expand: 'tournament,home_team,away_team'
            });
            return { data: matches, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    },

    // Obtener partidos por torneo
    async getByTournament(tournamentId: string) {
        try {
            const matches = await pb.collection('matches').getFullList<Match>({
                filter: `tournament = "${tournamentId}"`,
                sort: 'match_date',
                expand: 'home_team,away_team'
            });
            return { data: matches, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    },

    // Obtener partidos asignados a un árbitro
    async getByReferee(refereeId: string) {
        try {
            // Primero obtener los match_officials donde el usuario es árbitro
            const officials = await pb.collection('match_officials').getFullList({
                filter: `main_referee = "${refereeId}" || assistant_referee = "${refereeId}"`,
                expand: 'match,match.tournament,match.home_team,match.away_team'
            });

            const matches = officials.map(official => official.expand?.match).filter(Boolean);
            return { data: matches, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    }
};

export const playersService = {
    // Obtener jugadores por equipo
    async getByTeam(teamId: string) {
        try {
            const players = await pb.collection('players').getFullList<Player>({
                filter: `team = "${teamId}" && active = true`,
                sort: 'jersey_number',
                expand: 'user'
            });
            return { data: players, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    },

    // Crear jugador
    async create(playerData: Partial<Player>) {
        try {
            const player = await pb.collection('players').create<Player>(playerData);
            return { data: player, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }
};

// Servicios especiales para árbitros
export const refereeService = {
    // Registrar evento en partido (CRÍTICO para árbitros)
    async recordEvent(eventData: Partial<MatchEvent>) {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const dataWithUser = {
                ...eventData,
                recorded_by: currentUser.id,
                timestamp: new Date().toISOString()
            };

            const event = await pb.collection('match_events').create<MatchEvent>(dataWithUser);
            return { data: event, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    },

    // Obtener eventos de un partido
    async getMatchEvents(matchId: string) {
        try {
            const events = await pb.collection('match_events').getFullList<MatchEvent>({
                filter: `match = "${matchId}"`,
                sort: 'timestamp',
                expand: 'team,player,recorded_by'
            });
            return { data: events, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    },

    // Actualizar marcador del partido
    async updateMatchScore(matchId: string, homeScore: number, awayScore: number) {
        try {
            const match = await pb.collection('matches').update(matchId, {
                home_score: homeScore,
                away_score: awayScore
            });
            return { data: match, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }
};

// Funciones para tiempo real
export const subscribeToCollection = (collection: string, callback: (data: any) => void) => {
    return pb.collection(collection).subscribe('*', callback);
};

export const unsubscribeFromCollection = (collection: string) => {
    pb.collection(collection).unsubscribe();
};

// Función de salud del servidor
export const checkServerHealth = async () => {
    try {
        const response = await fetch(`${POCKETBASE_URL}/health`);
        return { healthy: response.ok, error: null };
    } catch (error: any) {
        return { healthy: false, error: error.message };
    }
};

export default pb;