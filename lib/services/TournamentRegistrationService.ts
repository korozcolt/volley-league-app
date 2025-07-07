import { RegistrationStatus, Team, Tournament, canTeamRegister, isTournamentRegistrationOpen } from '@/lib/types/models';

export class TournamentRegistrationService {

    /**
     * Validar si un equipo puede inscribirse
     */
    static async validateTeamRegistration(
        tournament: Tournament,
        team: Team,
        teamPlayersCount: number,
        currentRegistrations: number
    ): Promise<{ canRegister: boolean; reason?: string }> {

        // 1. Verificar si el torneo acepta inscripciones públicas
        if (!tournament.allow_public_registration) {
            return {
                canRegister: false,
                reason: 'Este torneo no permite inscripciones públicas'
            };
        }

        // 2. Verificar ventana de inscripción
        if (!isTournamentRegistrationOpen(tournament)) {
            return {
                canRegister: false,
                reason: 'El período de inscripciones está cerrado'
            };
        }

        // 3. Verificar cupos disponibles
        if (currentRegistrations >= tournament.max_teams) {
            return {
                canRegister: false,
                reason: 'No hay cupos disponibles en el torneo'
            };
        }

        // 4. Verificar cantidad de jugadores del equipo
        const teamValidation = canTeamRegister(tournament, currentRegistrations, teamPlayersCount);
        if (!teamValidation.canRegister) {
            return teamValidation;
        }

        // 5. Verificar que el equipo esté verificado
        if (!team.verified) {
            return {
                canRegister: false,
                reason: 'El equipo debe estar verificado por un administrador'
            };
        }

        // 6. Verificar que el equipo esté activo
        if (!team.active) {
            return {
                canRegister: false,
                reason: 'El equipo debe estar activo para inscribirse'
            };
        }

        return { canRegister: true };
    }

    /**
     * Procesar inscripción de equipo
     */
    static async processTeamRegistration(
        tournament: Tournament,
        team: Team,
        registeredBy: string
    ): Promise<{ requiresApproval: boolean; status: RegistrationStatus }> {

        if (tournament.require_approval) {
            return {
                requiresApproval: true,
                status: RegistrationStatus.PENDING
            };
        } else {
            return {
                requiresApproval: false,
                status: RegistrationStatus.APPROVED
            };
        }
    }

    /**
     * Habilitar inscripción manual por administrador
     */
    static async enableManualRegistration(
        tournament: Tournament,
        team: Team,
        adminId: string
    ): Promise<{ data: any; error: string | null }> {

        try {
            // Crear inscripción directa aprobada por admin
            const registration = {
                tournament_id: tournament.id,
                team_id: team.id,
                registered_by: adminId,
                registration_date: new Date().toISOString(),
                status: RegistrationStatus.APPROVED,
                approval_date: new Date().toISOString(),
                approved_by: adminId,
            };

            return { data: registration, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: error.message || 'Error habilitando inscripción manual'
            };
        }
    }
}
