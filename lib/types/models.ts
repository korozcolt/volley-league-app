// Enums para los tipos de datos de la aplicación
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
}

export enum UserRole {
    ADMIN = 'admin',
    VIEWER = 'viewer',
}

export type PlayerPosition =
    | 'setter'        // Colocador
    | 'opposite'      // Opuesto
    | 'middle_blocker' // Central
    | 'libero'        // Líbero
    | 'outside_hitter'; // Receptor/Punta

// Interfaces para los modelos de datos
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
    first_name: string;
    last_name: string;
    jersey_number?: number | null;
    position?: PlayerPosition | null;
    date_of_birth?: string | null;
    height?: number | null; // en centímetros
    photo_url?: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    team?: Team;
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

export interface Match {
    id: string;
    tournament_id: string;
    home_team_id?: string | null;
    away_team_id?: string | null;
    home_team_score: number;
    away_team_score: number;
    match_date?: string | null;
    location?: string | null;
    status: MatchStatus;
    round?: string | null;
    match_number?: number | null;
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    tournament?: Tournament;
    home_team?: Team;
    away_team?: Team;
    match_sets?: MatchSet[];
}

export interface MatchSet {
    id: string;
    match_id: string;
    set_number: number;
    home_team_score: number;
    away_team_score: number;
    created_at: string;
    updated_at: string;
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
    created_at: string;
    updated_at: string;

    // Propiedades para relaciones
    tournament?: Tournament;
    match?: Match;
    next_bracket?: Bracket;
}