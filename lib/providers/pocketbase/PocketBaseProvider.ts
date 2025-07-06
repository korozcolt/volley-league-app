import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAuthProvider } from '../interfaces/IAuthProvider';
import { IBackendProvider } from '../interfaces/IBackendProvider';
import { IMatchesProvider } from '../interfaces/IMatchesProvider';
import { IPlayersProvider } from '../interfaces/IPlayersProvider';
import { IRefereeProvider } from '../interfaces/IRefereeProvider';
import { ITeamsProvider } from '../interfaces/ITeamsProvider';
import { ITournamentsProvider } from '../interfaces/ITournamentsProvider';
// lib/providers/pocketbase/PocketBaseProvider.ts
import PocketBase from 'pocketbase';
// Importar implementaciones específicas de PocketBase
import { PocketBaseAuthProvider } from './auth';
import { PocketBaseMatchesProvider } from './matches';
import { PocketBasePlayersProvider } from './players';
import { PocketBaseRefereeProvider } from './referee';
import { PocketBaseTeamsProvider } from './teams';
import { PocketBaseTournamentsProvider } from './tournaments';

interface PocketBaseConfig {
  url: string;
}

export class PocketBaseProvider implements IBackendProvider {
  public readonly name = 'PocketBase';
  private pb: PocketBase;
  
  // Providers específicos
  public readonly auth: IAuthProvider;
  public readonly teams: ITeamsProvider;
  public readonly tournaments: ITournamentsProvider;
  public readonly matches: IMatchesProvider;
  public readonly players: IPlayersProvider;
  public readonly referee: IRefereeProvider;

  constructor(config: PocketBaseConfig) {
    // Inicializar cliente PocketBase
    this.pb = new PocketBase(config.url);
    
    // Configurar persistencia de sesión
    this.pb.authStore.onChange((token, model) => {
      if (token && model) {
        AsyncStorage.setItem('pocketbase_auth', JSON.stringify({ token, model }));
      } else {
        AsyncStorage.removeItem('pocketbase_auth');
      }
    });

    // Inicializar providers específicos pasando la instancia de PocketBase
    this.auth = new PocketBaseAuthProvider(this.pb);
    this.teams = new PocketBaseTeamsProvider(this.pb);
    this.tournaments = new PocketBaseTournamentsProvider(this.pb);
    this.matches = new PocketBaseMatchesProvider(this.pb);
    this.players = new PocketBasePlayersProvider(this.pb);
    this.referee = new PocketBaseRefereeProvider(this.pb);
  }

  /**
   * Inicializar provider
   */
  async initialize(): Promise<void> {
    try {
      // Restaurar sesión de autenticación
      const authData = await AsyncStorage.getItem('pocketbase_auth');
      if (authData) {
        const { token, model } = JSON.parse(authData);
        this.pb.authStore.save(token, model);
      }
    } catch (error) {
      console.error('Error al inicializar PocketBase:', error);
    }
  }

  /**
   * Verificar salud del servidor
   */
  async checkHealth(): Promise<{ healthy: boolean; error: string | null }> {
    try {
      const response = await fetch(`${this.pb.baseUrl}/health`);
      return { 
        healthy: response.ok, 
        error: response.ok ? null : `Status: ${response.status}` 
      };
    } catch (error: any) {
      return { 
        healthy: false, 
        error: error.message || 'Error de conexión' 
      };
    }
  }

  /**
   * Suscribirse a cambios en tiempo real
   */
  subscribe(collection: string, callback: (data: any) => void): () => void {
    const unsubscribe = this.pb.collection(collection).subscribe('*', callback);
    
    // Retornar función para cancelar suscripción
    return () => {
      this.pb.collection(collection).unsubscribe();
    };
  }

  /**
   * Cancelar suscripción a colección
   */
  unsubscribe(collection: string): void {
    this.pb.collection(collection).unsubscribe();
  }

  /**
   * Obtener instancia de PocketBase (para casos especiales)
   */
  getPocketBaseInstance(): PocketBase {
    return this.pb;
  }

  /**
   * Obtener URL para archivos
   */
  getFileUrl(record: any, filename: string, thumb?: string): string {
    return this.pb.files.getUrl(record, filename, { thumb });
  }

  /**
   * Ejecutar consulta personalizada
   */
  async customQuery(collection: string, options: any = {}): Promise<any> {
    try {
      return await this.pb.collection(collection).getFullList(options);
    } catch (error: any) {
      throw new Error(`Error en consulta personalizada: ${error.message}`);
    }
  }
}