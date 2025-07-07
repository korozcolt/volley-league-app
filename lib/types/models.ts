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
    TBA = 'to_be_announced',
    TBC = 'to_be_confirmed',
    TIEBREAKER = 'tiebreaker',
}

export enum UserRole {
    ADMIN = 'admin',
    REFEREE = 'referee', 
    COACH = 'coach', 
    PLAYER = 'player',
    VIEWER = 'viewer',
}

export enum PlayerPosition {
    SETTER = 'setter',
    OPPOSITE = 'opposite',
    MIDDLE_BLOCKER = 'middle_blocker',
    LIBERO = 'libero',
    OUTSIDE_HITTER = 'outside_hitter',
}

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

export enum CardType {
    YELLOW = 'yellow',
    RED = 'red',
}
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
    active: boolean;
    logo_url?: string | null;
    coach_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Player {
    id: string;
    team_id: string;
    user_id?: string | null;
    full_name: string;
    jersey_number: number;
    position?: PlayerPosition | null;
    birth_date?: string | null;
    height?: number | null;
    photo_url?: string | null;
    active: boolean;
    captain: boolean;
    created_at: string;
    updated_at: string;

    team?: Team;
    user?: User; 
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
    teams_to_qualify?: number | null;
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

    tournament?: Tournament;
    team?: Team;
}

export interface Match {
    id: string;
    tournament_id: string;
    home_team_id?: string | null;
    away_team_id?: string | null;
    home_score: number;
    away_score: number;
    sets_home: number;
    sets_away: number;
    match_date: string;
    location?: string | null;
    status: MatchStatus;
    round?: string | null;
    match_number?: number | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;

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
    details?: any | null;
    recorded_by: string;
    created_at: string;
    updated_at: string;

    match?: Match;
    team?: Team;
    player?: Player;
    recorded_by_user?: User;
}

export interface MatchOfficial {
    id: string;
    match_id: string;
    main_referee?: string | null;
    assistant_referee?: string | null;
    scorer?: string | null;
    created_at: string;
    updated_at: string;

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
    attacks_total: number;      
    attacks_successful: number; 
    receptions_total: number;   
    receptions_perfect: number; 
    sets_played: number;        
    minutes_played: number;     
    created_at: string;
    updated_at: string;

    match?: Match;
    player?: Player;
}

export interface Bracket {
    id: string;
    tournament_id: string;
    stage: string;
    match_id: string;
    next_bracket_id?: string | null;
    position: number;
    created_at: string;
    updated_at: string;

    tournament?: Tournament;
    match?: Match;
    next_bracket?: Bracket;
}

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

    user?: User;
}

export interface SystemConfig {
    id: string;
    key: string;
    value: string;
    description?: string | null;
    category: string;
    created_at: string;
    updated_at: string;
}

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
    point_type?: 'attack' | 'block' | 'serve' | 'opponent_error';
    attack_zone?: string;
    block_type?: 'single' | 'double' | 'triple';
    
    player_in?: string;
    player_out?: string;
    
    card_type?: CardType;
    reason?: string;
    
    timeout_type?: 'technical' | 'team';
    
    notes?: string;
}

export type CreateTeamData = Omit<Team, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTeamData = Partial<CreateTeamData>;

export type CreatePlayerData = Omit<Player, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePlayerData = Partial<CreatePlayerData>;

export type CreateTournamentData = Omit<Tournament, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTournamentData = Partial<CreateTournamentData>;

export type CreateMatchData = Omit<Match, 'id' | 'created_at' | 'updated_at'>;
export type UpdateMatchData = Partial<CreateMatchData>;

export type ProviderResponse<T> = Promise<ApiResponse<T>>;
export type ProviderListResponse<T> = Promise<ApiResponse<T[]>>;

export const validateEnumValue = <T extends Record<string, string>>(
    enumObject: T,
    value: string
): value is T[keyof T] => {
    return Object.values(enumObject).includes(value as T[keyof T]);
};

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