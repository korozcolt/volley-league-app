// lib/services/TournamentMatchGenerator.ts
import { Match, MatchStatus, Team, Tournament, TournamentType } from '@/lib/types/models';

export interface TournamentGroup {
    id: string;
    name: string;
    teams: Team[];
}

export interface GeneratedMatch {
    tournament_id: string;
    home_team_id: string;
    away_team_id: string;
    match_date: string;
    location?: string;
    status: MatchStatus;
    round?: string;
    match_number?: number;
    group_id?: string; // Para torneos con grupos
    stage: 'group' | 'quarter' | 'semi' | 'final' | 'third_place';
}

export class TournamentMatchGenerator {

    /**
     * Generar todos los partidos para un torneo
     */
    static generateMatches(
        tournament: Tournament,
        teams: Team[],
        startDate: Date
    ): { matches: GeneratedMatch[]; groups?: TournamentGroup[] } {

        switch (tournament.type) {
            case TournamentType.POINTS:
                return this.generateRoundRobinMatches(tournament, teams, startDate);

            case TournamentType.ELIMINATION:
                return this.generateEliminationMatches(tournament, teams, startDate);

            case TournamentType.MIXED:
                return this.generateMixedMatches(tournament, teams, startDate);

            default:
                throw new Error(`Tipo de torneo no soportado: ${tournament.type}`);
        }
    }

    /**
     * Torneo por puntos - Todos contra todos
     */
    private static generateRoundRobinMatches(
        tournament: Tournament,
        teams: Team[],
        startDate: Date
    ): { matches: GeneratedMatch[]; groups?: TournamentGroup[] } {

        const matches: GeneratedMatch[] = [];
        let matchNumber = 1;
        const currentDate = new Date(startDate);

        // Si hay muchos equipos (más de 8), dividir en grupos
        if (teams.length > 8) {
            return this.generateGroupStageMatches(tournament, teams, startDate);
        }

        // Todos contra todos en una sola liga
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                matches.push({
                    tournament_id: tournament.id,
                    home_team_id: teams[i].id,
                    away_team_id: teams[j].id,
                    match_date: new Date(currentDate).toISOString(),
                    location: tournament.location || undefined,
                    status: MatchStatus.SCHEDULED,
                    round: 'Liga',
                    match_number: matchNumber++,
                    stage: 'group',
                });

                // Avanzar fecha (un partido cada 2 días)
                currentDate.setDate(currentDate.getDate() + 2);
            }
        }

        return { matches };
    }

    /**
     * Dividir equipos en grupos para torneos grandes
     */
    private static generateGroupStageMatches(
        tournament: Tournament,
        teams: Team[],
        startDate: Date
    ): { matches: GeneratedMatch[]; groups: TournamentGroup[] } {

        const { groups, groupSize } = this.distributeTeamsIntoGroups(teams);
        const matches: GeneratedMatch[] = [];
        let matchNumber = 1;
        const currentDate = new Date(startDate);

        // Generar partidos dentro de cada grupo
        groups.forEach((group, groupIndex) => {
            // Round robin dentro del grupo
            for (let i = 0; i < group.teams.length; i++) {
                for (let j = i + 1; j < group.teams.length; j++) {
                    matches.push({
                        tournament_id: tournament.id,
                        home_team_id: group.teams[i].id,
                        away_team_id: group.teams[j].id,
                        match_date: new Date(currentDate).toISOString(),
                        location: tournament.location || undefined,
                        status: MatchStatus.SCHEDULED,
                        round: `Grupo ${group.name}`,
                        match_number: matchNumber++,
                        group_id: group.id,
                        stage: 'group',
                    });

                    // Programar partidos de diferentes grupos en paralelo
                    if (matchNumber % groups.length === 0) {
                        currentDate.setDate(currentDate.getDate() + 2);
                    }
                }
            }
        });

        return { matches, groups };
    }

    /**
     * Distribuir equipos en grupos de manera equilibrada
     */
    private static distributeTeamsIntoGroups(teams: Team[]): { groups: TournamentGroup[]; groupSize: number } {
        const teamCount = teams.length;
        let groupCount: number;
        let groupSize: number;

        // Algoritmo para determinar número óptimo de grupos
        if (teamCount <= 8) {
            groupCount = 2;
        } else if (teamCount <= 16) {
            groupCount = 4;
        } else if (teamCount <= 24) {
            groupCount = 6;
        } else {
            groupCount = 8;
        }

        // Ajustar si el número de equipos es impar en algunos grupos
        groupSize = Math.ceil(teamCount / groupCount);

        const groups: TournamentGroup[] = [];
        const shuffledTeams = [...teams].sort(() => Math.random() - 0.5); // Mezclar equipos

        for (let i = 0; i < groupCount; i++) {
            const groupTeams = shuffledTeams.slice(i * groupSize, (i + 1) * groupSize);

            if (groupTeams.length > 0) {
                groups.push({
                    id: `group_${i + 1}`,
                    name: String.fromCharCode(65 + i), // A, B, C, D...
                    teams: groupTeams,
                });
            }
        }

        return { groups, groupSize };
    }

    /**
     * Torneo de eliminación directa
     */
    private static generateEliminationMatches(
        tournament: Tournament,
        teams: Team[],
        startDate: Date
    ): { matches: GeneratedMatch[] } {

        const matches: GeneratedMatch[] = [];
        let currentTeams = [...teams];
        let matchNumber = 1;
        const currentDate = new Date(startDate);

        // Asegurar que el número de equipos sea potencia de 2
        const roundedTeamCount = this.nextPowerOfTwo(currentTeams.length);

        // Si faltan equipos para completar la potencia de 2, algunos equipos pasan automáticamente
        const byes = roundedTeamCount - currentTeams.length;

        let round = 1;
        const totalRounds = Math.log2(roundedTeamCount);

        while (currentTeams.length > 1) {
            const nextRoundTeams: Team[] = [];
            const roundMatches: GeneratedMatch[] = [];

            // Generar partidos para esta ronda
            for (let i = 0; i < currentTeams.length; i += 2) {
                if (i + 1 < currentTeams.length) {
                    // Hay dos equipos para enfrentar
                    roundMatches.push({
                        tournament_id: tournament.id,
                        home_team_id: currentTeams[i].id,
                        away_team_id: currentTeams[i + 1].id,
                        match_date: new Date(currentDate).toISOString(),
                        location: tournament.location || undefined,
                        status: MatchStatus.SCHEDULED,
                        round: this.getEliminationRoundName(round, totalRounds),
                        match_number: matchNumber++,
                        stage: this.getEliminationStage(round, totalRounds),
                    });

                    // Para simulación, el primer equipo "gana" (en la realidad se decide en el partido)
                    nextRoundTeams.push(currentTeams[i]);
                } else {
                    // Equipo con bye pasa automáticamente
                    nextRoundTeams.push(currentTeams[i]);
                }
            }

            matches.push(...roundMatches);
            currentTeams = nextRoundTeams;
            round++;

            // Avanzar fecha para la siguiente ronda
            currentDate.setDate(currentDate.getDate() + 7); // Una semana entre rondas
        }

        return { matches };
    }

    /**
     * Torneo mixto - Grupos + eliminación
     */
    private static generateMixedMatches(
        tournament: Tournament,
        teams: Team[],
        startDate: Date
    ): { matches: GeneratedMatch[]; groups: TournamentGroup[] } {

        const currentDate = new Date(startDate);

        // Fase de grupos
        const groupStage = this.generateGroupStageMatches(tournament, teams, currentDate);

        // Calcular fecha para fase eliminatoria (después de fase de grupos)
        const eliminationStartDate = new Date(currentDate);
        eliminationStartDate.setDate(eliminationStartDate.getDate() + (groupStage.matches.length * 2));

        // Simular equipos clasificados (los mejores de cada grupo)
        const qualifiedTeams: Team[] = [];
        if (groupStage.groups) {
            groupStage.groups.forEach(group => {
                // Los primeros 2 de cada grupo clasifican
                qualifiedTeams.push(...group.teams.slice(0, 2));
            });
        }

        // Fase eliminatoria
        const eliminationStage = this.generateEliminationMatches(
            tournament,
            qualifiedTeams,
            eliminationStartDate
        );

        return {
            matches: [...groupStage.matches, ...eliminationStage.matches],
            groups: groupStage.groups || [],
        };
    }

    /**
     * Utilidades
     */
    private static nextPowerOfTwo(n: number): number {
        return Math.pow(2, Math.ceil(Math.log2(n)));
    }

    private static getEliminationRoundName(round: number, totalRounds: number): string {
        const remainingRounds = totalRounds - round + 1;

        switch (remainingRounds) {
            case 1: return 'Final';
            case 2: return 'Semifinal';
            case 3: return 'Cuartos de Final';
            case 4: return 'Octavos de Final';
            default: return `Ronda ${round}`;
        }
    }

    private static getEliminationStage(round: number, totalRounds: number): 'group' | 'quarter' | 'semi' | 'final' | 'third_place' {
        const remainingRounds = totalRounds - round + 1;

        switch (remainingRounds) {
            case 1: return 'final';
            case 2: return 'semi';
            case 3: return 'quarter';
            default: return 'group';
        }
    }

    /**
     * Calcular estadísticas del torneo generado
     */
    static calculateTournamentStats(matches: GeneratedMatch[], teams: Team[]) {
        return {
            total_matches: matches.length,
            total_teams: teams.length,
            estimated_duration_days: Math.ceil(matches.length / 2), // Asumiendo 2 partidos por día
            group_stage_matches: matches.filter(m => m.stage === 'group').length,
            elimination_matches: matches.filter(m => m.stage !== 'group').length,
        };
    }
}