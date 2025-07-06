import { MatchEvent } from '@/lib/types/models';

export interface IRefereeProvider {
  // Eventos de partido
  recordEvent(eventData: Omit<MatchEvent, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: MatchEvent | null; error: string | null }>;
  getMatchEvents(matchId: string): Promise<{ data: MatchEvent[]; error: string | null }>;
  updateMatchScore(matchId: string, homeScore: number, awayScore: number): Promise<{ error: string | null }>;
  
  // Gestión de sets
  startSet(matchId: string, setNumber: number): Promise<{ error: string | null }>;
  endSet(matchId: string, setNumber: number): Promise<{ error: string | null }>;
  
  // Timeouts y substituciones
  recordTimeout(matchId: string, teamId: string, setNumber: number): Promise<{ error: string | null }>;
  recordSubstitution(matchId: string, teamId: string, playerOutId: string, playerInId: string, setNumber: number): Promise<{ error: string | null }>;
  
  // Sanciones
  recordCard(matchId: string, playerId: string, cardType: 'yellow' | 'red', reason: string): Promise<{ error: string | null }>;
}