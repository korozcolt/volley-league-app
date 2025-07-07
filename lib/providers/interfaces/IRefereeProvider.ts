import { CardType, Match, MatchEvent, MatchEventType } from '@/lib/types/models';

export interface IRefereeProvider {
  // Asignación de árbitros
  assignMainReferee(matchId: string, refereeId: string): Promise<{ error: string | null }>;
  assignAssistantReferee(matchId: string, refereeId: string): Promise<{ error: string | null }>;
  
  // Registro de eventos durante el partido
  recordEvent(eventData: Omit<MatchEvent, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: MatchEvent | null; error: string | null }>;
  updateSetScore(matchId: string, setNumber: number, homePoints: number, awayPoints: number): Promise<{ error: string | null }>;
  finishSet(matchId: string, setNumber: number, homePoints: number, awayPoints: number): Promise<{ error: string | null }>;
  
  // Eventos específicos
  recordTimeout(matchId: string, setNumber: number, teamId: string): Promise<{ error: string | null }>;
  recordSubstitution(matchId: string, setNumber: number, teamId: string, playerInId: string, playerOutId: string): Promise<{ error: string | null }>;
  recordCard(matchId: string, setNumber: number, teamId: string, playerId: string | null, cardType: CardType, reason?: string): Promise<{ error: string | null }>;
  
  // Consultas
  getMatchEvents(matchId: string): Promise<{ data: MatchEvent[]; error: string | null }>;
  getAssignedMatches(): Promise<{ data: Match[]; error: string | null }>;
  canRefereeMatch(matchId: string): Promise<{ canReferee: boolean; error: string | null }>;
}
