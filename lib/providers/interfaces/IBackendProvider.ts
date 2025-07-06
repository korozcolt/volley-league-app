import { IAuthProvider } from "./IAuthProvider";
import { IMatchesProvider } from "./IMatchesProvider";
import { IPlayersProvider } from "./IPlayersProvider";
import { IRefereeProvider } from "./IRefereeProvider";
import { ITeamsProvider } from "./ITeamsProvider";
import { ITournamentsProvider } from "./ITournamentsProvider";

export interface IBackendProvider {
  name: string;
  auth: IAuthProvider;
  teams: ITeamsProvider;
  tournaments: ITournamentsProvider;
  matches: IMatchesProvider;
  players: IPlayersProvider;
  referee: IRefereeProvider;
  
  // Funciones de inicialización y salud
  initialize(): Promise<void>;
  checkHealth(): Promise<{ healthy: boolean; error: string | null }>;
  
  // Subscripciones en tiempo real (opcional)
  subscribe?(collection: string, callback: (data: any) => void): () => void;
  unsubscribe?(collection: string): void;
}