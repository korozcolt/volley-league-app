import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAuthProvider } from '../interfaces/IAuthProvider';
// ✅ IMPORTS DE INTERFACES
import { IBackendProvider } from '../interfaces/IBackendProvider';
import { IMatchesProvider } from '../interfaces/IMatchesProvider';
import { IPlayersProvider } from '../interfaces/IPlayersProvider';
import { IRefereeProvider } from '../interfaces/IRefereeProvider';
import { ITeamsProvider } from '../interfaces/ITeamsProvider';
import { ITournamentsProvider } from '../interfaces/ITournamentsProvider';
import PocketBase from 'pocketbase';
// ✅ IMPORTS DE IMPLEMENTACIONES CORREGIDOS
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
  
  // ✅ PROVIDERS ESPECÍFICOS - Todos definidos correctamente
  public readonly auth: IAuthProvider;
  public readonly teams: ITeamsProvider;
  public readonly tournaments: ITournamentsProvider;
  public readonly matches: IMatchesProvider;
  public readonly players: IPlayersProvider;
  public readonly referee: IRefereeProvider;

  constructor(config: PocketBaseConfig) {
    // ✅ INICIALIZAR CLIENTE POCKETBASE PRIMERO
    this.pb = new PocketBase(config.url);
    
    // ✅ CONFIGURAR PERSISTENCIA DE SESIÓN
    this.pb.authStore.onChange((token, model) => {
      if (token && model) {
        AsyncStorage.setItem('pocketbase_auth', JSON.stringify({ token, model }));
      } else {
        AsyncStorage.removeItem('pocketbase_auth');
      }
    });

    // ✅ INICIALIZAR PROVIDERS - PASANDO INSTANCIA DE POCKETBASE CORRECTAMENTE
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
      // Restaurar sesión de autenticación desde AsyncStorage
      const authData = await AsyncStorage.getItem('pocketbase_auth');
      if (authData) {
        const { token, model } = JSON.parse(authData);
        this.pb.authStore.save(token, model);
      }
      
      console.log('PocketBase provider initialized successfully');
    } catch (error) {
      console.error('Error al inicializar PocketBase provider:', error);
      throw error;
    }
  }

  /**
   * Verificar salud del servidor
   */
  async checkHealth(): Promise<{ healthy: boolean; error: string | null }> {
    try {
      // Verificar conectividad haciendo una consulta simple
      await this.pb.collection('users').getList(1, 1);
      return { 
        healthy: true, 
        error: null 
      };
    } catch (error: any) {
      console.error('Health check failed:', error);
      return { 
        healthy: false, 
        error: error.message || 'Error de conexión con PocketBase' 
      };
    }
  }

  /**
   * Suscribirse a cambios en tiempo real (opcional)
   */
  subscribe?(collection: string, callback: (data: any) => void): () => void {
    try {
      // Suscribirse a cambios en la colección
      this.pb.collection(collection).subscribe('*', callback);
      
      // Retornar función para cancelar suscripción
      return () => {
        this.pb.collection(collection).unsubscribe();
      };
    } catch (error) {
      console.error(`Error suscribiéndose a ${collection}:`, error);
      return () => {}; // Función vacía como fallback
    }
  }

  /**
   * Cancelar suscripción a colección (opcional)
   */
  unsubscribe?(collection: string): void {
    try {
      this.pb.collection(collection).unsubscribe();
    } catch (error) {
      console.error(`Error cancelando suscripción de ${collection}:`, error);
    }
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

  /**
   * Obtener información del servidor
   */
  getServerInfo(): { url: string; version?: string } {
    return {
      url: this.pb.baseUrl,
      // PocketBase no expone versión fácilmente, pero podríamos agregarlo
    };
  }

  /**
   * Verificar autenticación actual
   */
  isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  /**
   * Obtener token de autenticación actual
   */
  getAuthToken(): string | null {
    return this.pb.authStore.token;
  }

  /**
   * Limpiar toda la autenticación
   */
  clearAuth(): void {
    this.pb.authStore.clear();
  }
}