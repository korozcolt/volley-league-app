// lib/types/models.ts - Modelos actualizados con coherencia completa

// 🎯 ENUMS PRINCIPALES
export enum TournamentType {
    POINTS = 'points',
    ELIMINATION = 'elimination', 
    MIXED = 'mixed',
}

export enum TournamentStatus {
    UPCOMING = 'upcoming',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
}

export enum MatchStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    POSTPONED = 'postponed',
    TBA = 'to_be_announced', // Para partidos que aún no tienen fecha definida
    TBC = 'to_be_confirmed', // Para partidos que necesitan confirmación de equipos
    TIEBREAKER = 'tiebreaker', // Para partidos de desempate
}

export enum UserRole {
    ADMIN = 'admin',
    REFEREE = 'referee',     // ✅ AGREGADO - Para árbitros
    COACH = 'coach',         // ✅ AGREGADO - Para entrenadores
    PLAYER = 'player',       // ✅ AGREGADO - Para jugadores
    VIEWER = 'viewer',
}

// ✅ ACTUALIZADO - PlayerPosition como enum para mayor consistencia
export enum PlayerPosition {
    SETTER = 'setter',              // Colocador
    OPPOSITE = 'opposite',          // Opuesto
    MIDDLE_BLOCKER = 'middle_blocker', // Central
    LIBERO = 'libero',             // Líbero
    OUTSIDE_HITTER = 'outside_hitter', // Receptor/Punta
}

// ✅ NUEVO - Enum para tipos de eventos en partidos
export enum MatchEventType {
    POINT = 'point',
    TIMEOUT = 'timeout',
    SUBSTITUTION = 'substitution',
    CARD = 'card',
    ROTATION = 'rotation',
    SET_END = 'set_end',
    MATCH_START = 'match_start',
    MATCH_END = 'match_end',
}

// ✅ NUEVO - Enum para tipos de tarjetas
export enum CardType {
    YELLOW = 'yellow',
    RED = 'red',
}

// 📊 INTERFACES PRINCIPALES

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface Team {
    id: string;
    name: string;
    active: boolean;                    // ✅ AGREGADO - Propiedad faltante crítica
    logo_url?: string | null;
    coach_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    created_at: string;
    updated_at: string;
}

// ✅ ACTUALIZADO - Player con nombres corregidos y campos adicionales
export interface Player {
    id: string;
    team_id: string;
    user_id?: string | null;        // ✅ AGREGADO - Relación con usuario
    full_name: string;              // ✅ CORREGIDO - Era first_name + last_name
    jersey_number: number;          // ✅ CORREGIDO - Ya no es opcional
    position?: PlayerPosition | null;
    birth_date?: string | null;     // ✅ CORREGIDO - Era date_of_birth
    height?: number | null;         // en centímetros
    photo_url?: string | null;
    active: boolean;
    captain: boolean;               // ✅ AGREGADO - Para capitanes
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    team?: Team;
    user?: User;                    // ✅ AGREGADO
}

export interface Tournament {
    id: string;
    name: string;
    start_date: string;
    end_date?: string | null;
    location?: string | null;
    description?: string | null;
    type: TournamentType;
    status: TournamentStatus;
    teams_to_qualify?: number | null; // Solo para torneos mixtos
    created_at: string;
    updated_at: string;
}

export interface TournamentTeam {
    id: string;
    tournament_id: string;
    team_id: string;
    points: number;
    rank?: number | null;
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    tournament?: Tournament;
    team?: Team;
}

// ✅ ACTUALIZADO - Match con campos corregidos
export interface Match {
    id: string;
    tournament_id: string;
    home_team_id?: string | null;
    away_team_id?: string | null;
    home_score: number;             // ✅ CORREGIDO - Era home_team_score
    away_score: number;             // ✅ CORREGIDO - Era away_team_score
    sets_home: number;
    sets_away: number;
    match_date: string;             // ✅ CORREGIDO - Ya no es opcional en la práctica
    location?: string | null;
    status: MatchStatus;
    round?: string | null;
    match_number?: number | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    tournament?: Tournament;
    home_team?: Team;
    away_team?: Team;
    match_sets?: MatchSet[];
    match_events?: MatchEvent[];   
}

export interface MatchSet {
    id: string;
    match_id: string;
    set_number: number;
    home_team_score: number;
    away_team_score: number;
    duration_minutes?: number | null; 
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    match?: Match;
}

export interface MatchEvent {
    id: string;
    match_id: string;
    set_number: number;
    event_type: MatchEventType;
    team_id?: string | null;
    player_id?: string | null;
    points_home: number;
    points_away: number;
    timestamp: string;
    details?: any | null;           // JSON para detalles específicos del evento
    recorded_by: string;            // ID del usuario que registró el evento
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    match?: Match;
    team?: Team;
    player?: Player;
    recorded_by_user?: User;
}

export interface MatchOfficial {
    id: string;
    match_id: string;
    main_referee?: string | null;       // ID del árbitro principal
    assistant_referee?: string | null;  // ID del árbitro asistente
    scorer?: string | null;             // ID del anotador
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    match?: Match;
    main_referee_user?: User;
    assistant_referee_user?: User;
    scorer_user?: User;
}

export interface TeamLineup {
    id: string;
    match_id: string;
    team_id: string;
    set_number: number;
    position_1: string;  // ID del jugador en posición 1
    position_2: string;  // ID del jugador en posición 2
    position_3: string;  // ID del jugador en posición 3
    position_4: string;  // ID del jugador en posición 4
    position_5: string;  // ID del jugador en posición 5
    position_6: string;  // ID del jugador en posición 6
    libero?: string | null; // ID del líbero
    created_by: string;  // ID del usuario que creó la formación
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    match?: Match;
    team?: Team;
    player_1?: Player;
    player_2?: Player;
    player_3?: Player;
    player_4?: Player;
    player_5?: Player;
    player_6?: Player;
    libero_player?: Player;
    created_by_user?: User;
}

export interface PlayerMatchStats {
    id: string;
    match_id: string;
    player_id: string;
    points_scored: number;
    blocks: number;
    digs: number;
    assists: number;
    aces: number;
    service_errors: number;
    attack_errors: number;
    attacks_total: number;          // ✅ AGREGADO
    attacks_successful: number;     // ✅ AGREGADO
    receptions_total: number;       // ✅ AGREGADO
    receptions_perfect: number;     // ✅ AGREGADO
    sets_played: number;            // ✅ AGREGADO
    minutes_played: number;         // ✅ AGREGADO
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    match?: Match;
    player?: Player;
}

export interface Bracket {
    id: string;
    tournament_id: string;
    stage: string; // octavos, cuartos, semifinal, final
    match_id: string;
    next_bracket_id?: string | null;
    position: number;               // ✅ AGREGADO - Posición en el bracket
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    tournament?: Tournament;
    match?: Match;
    next_bracket?: Bracket;
}

// ✅ NUEVO - Para notificaciones del sistema
export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    action_url?: string | null;
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    user?: User;
}

// ✅ NUEVO - Para configuración del sistema
export interface SystemConfig {
    id: string;
    key: string;
    value: string;
    description?: string | null;
    category: string;
    created_at: string;
    updated_at: string;
}

// 🎯 TIPOS AUXILIARES

// Para filtros en las consultas
export interface BaseFilters {
    search?: string;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface TeamFilters {
    active?: boolean;
    coach?: string;
    search?: string;
}

export interface TournamentFilters {
    status?: TournamentStatus[];
    type?: TournamentType[];
    date_from?: string;
    date_to?: string;
    search?: string;
}

export interface MatchFilters {
    tournament_id?: string;
    team_id?: string;
    status?: MatchStatus[];
    date_from?: string;
    date_to?: string;
    referee_id?: string;
    search?: string;
}

export interface PlayerFilters {
    team_id?: string;
    active?: boolean;
    position?: PlayerPosition;
    captain?: boolean;
    search?: string;
}

// Para respuestas de la API
export interface ApiResponse<T> {
    data: T;
    error: string | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    error: string | null;
}

// Para estadísticas
export interface TeamStats {
    total_matches: number;
    wins: number;
    losses: number;
    draws: number;
    sets_won: number;
    sets_lost: number;
    points_scored: number;
    points_conceded: number;
    win_percentage: number;
    current_streak: number;
    streak_type: 'wins' | 'losses' | 'draws';
}

export interface PlayerStats {
    total_matches: number;
    total_sets: number;
    total_points: number;
    total_attacks: number;
    successful_attacks: number;
    attack_percentage: number;
    total_blocks: number;
    total_aces: number;
    total_digs: number;
    total_assists: number;
    service_errors: number;
    attack_errors: number;
    minutes_played: number;
    points_per_set: number;
}

export interface TournamentStats {
    total_teams: number;
    total_matches: number;
    completed_matches: number;
    remaining_matches: number;
    total_sets: number;
    total_points: number;
    average_match_duration: number;
    top_scorer?: Player;
    most_blocks?: Player;
    most_aces?: Player;
}

export interface MatchEventDetails {
    // Para eventos de punto
    point_type?: 'attack' | 'block' | 'serve' | 'opponent_error';
    attack_zone?: string;
    block_type?: 'single' | 'double' | 'triple';
    
    // Para sustituciones
    player_in?: string;
    player_out?: string;
    
    // Para tarjetas
    card_type?: CardType;
    reason?: string;
    
    // Para timeouts
    timeout_type?: 'technical' | 'team';
    
    // Información adicional
    notes?: string;
}

// 🎨 TIPOS DE UTILIDAD

// Para formularios
export type CreateTeamData = Omit<Team, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTeamData = Partial<CreateTeamData>;

export type CreatePlayerData = Omit<Player, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePlayerData = Partial<CreatePlayerData>;

export type CreateTournamentData = Omit<Tournament, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTournamentData = Partial<CreateTournamentData>;

export type CreateMatchData = Omit<Match, 'id' | 'created_at' | 'updated_at'>;
export type UpdateMatchData = Partial<CreateMatchData>;

// Para providers
export type ProviderResponse<T> = Promise<ApiResponse<T>>;
export type ProviderListResponse<T> = Promise<ApiResponse<T[]>>;

// ✅ VALIDACIONES DE CONSISTENCIA

// Función para validar que los enums coincidan con strings
export const validateEnumValue = <T extends Record<string, string>>(
    enumObject: T,
    value: string
): value is T[keyof T] => {
    return Object.values(enumObject).includes(value as T[keyof T]);
};

// Mappers para conversión entre formatos
export const mapStringToTournamentType = (value: string): TournamentType | null => {
    return validateEnumValue(TournamentType, value) ? value as TournamentType : null;
};

export const mapStringToTournamentStatus = (value: string): TournamentStatus | null => {
    return validateEnumValue(TournamentStatus, value) ? value as TournamentStatus : null;
};

export const mapStringToMatchStatus = (value: string): MatchStatus | null => {
    return validateEnumValue(MatchStatus, value) ? value as MatchStatus : null;
};

export const mapStringToPlayerPosition = (value: string): PlayerPosition | null => {
    return validateEnumValue(PlayerPosition, value) ? value as PlayerPosition : null;
};

export const mapStringToUserRole = (value: string): UserRole | null => {
    return validateEnumValue(UserRole, value) ? value as UserRole : null;
};

// 🔍 HELPERS DE TIPOS

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidJerseyNumber = (number: number): boolean => {
    return number >= 1 && number <= 99;
};

export const isValidHeight = (height: number): boolean => {
    return height >= 140 && height <= 250; // Rango realista en cm
};

export const isMatchInProgress = (match: Match): boolean => {
    return match.status === MatchStatus.IN_PROGRESS;
};

export const isMatchCompleted = (match: Match): boolean => {
    return match.status === MatchStatus.COMPLETED;
};

export const isTournamentActive = (tournament: Tournament): boolean => {
    return tournament.status === TournamentStatus.IN_PROGRESS || 
           tournament.status === TournamentStatus.UPCOMING;
};

// 📊 CONSTANTES RELACIONADAS CON VOLEIBOL

export const VOLLEYBALL_CONSTANTS = {
    MAX_SETS: 5,
    POINTS_TO_WIN_SET: 25,
    POINTS_TO_WIN_FIFTH_SET: 15,
    MIN_POINT_DIFFERENCE: 2,
    PLAYERS_ON_COURT: 6,
    MAX_SUBSTITUTIONS_PER_SET: 6,
    MAX_TIMEOUTS_PER_SET: 2,
    TIMEOUT_DURATION_SECONDS: 30,
    TECHNICAL_TIMEOUT_POINTS: [8, 16], // En sets de 25 puntos
} as const;