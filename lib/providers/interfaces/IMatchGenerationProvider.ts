export interface IMatchGenerationProvider {
  // Generación de partidos
  generateMatches(tournamentId: string, options: GenerationOptions): Promise<{ data: any[]; error: string | null }>;
  regenerateMatches(tournamentId: string, options: GenerationOptions): Promise<{ data: any[]; error: string | null }>;
  
  // Validaciones
  canGenerateMatches(tournamentId: string): Promise<{ data: boolean; error: string | null; reason?: string }>;
  
  // Configuración
  getGenerationOptions(tournamentId: string): Promise<{ data: GenerationOptions; error: string | null }>;
  updateGenerationOptions(tournamentId: string, options: Partial<GenerationOptions>): Promise<{ data: any; error: string | null }>;
}

export interface GenerationOptions {
  type: 'round_robin' | 'elimination' | 'double_elimination' | 'swiss';
  startDate?: string;
  endDate?: string;
  venueIds?: string[];
  timeSlots?: string[];
  restDaysBetweenMatches?: number;
  randomizeOrder?: boolean;
}
