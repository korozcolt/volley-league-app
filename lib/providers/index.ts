import { CONFIG } from '../config/constants';
import { IBackendProvider } from './interfaces/IBackendProvider';
import { PocketBaseProvider } from './pocketbase/PocketBaseProvider';
//import { SupabaseProvider } from './supabase/SupabaseProvider';

class BackendProviderFactory {
    private static instance: IBackendProvider | null = null;
    private static providerType: string | null = null;

    /**
     * Obtener la instancia del provider actual
     * @returns {IBackendProvider}
     */
    static getInstance(): IBackendProvider {
        const currentProvider = CONFIG.BACKEND.PROVIDER;

        // Si ya existe una instancia del mismo tipo, la devolvemos
        if (this.instance && this.providerType === currentProvider) {
            return this.instance;
        }

        // Crear nueva instancia según configuración
        switch (currentProvider) {
            case 'pocketbase':
                if (!CONFIG.POCKETBASE.URL) {
                    throw new Error('PocketBase URL no configurada. Revisa EXPO_PUBLIC_POCKETBASE_URL');
                }

                this.instance = new PocketBaseProvider({
                    url: CONFIG.POCKETBASE.URL
                });
                break;

            case 'supabase':
                // ✅ TEMPORAL: SupabaseProvider no implementado aún
                throw new Error('SupabaseProvider no implementado aún. Usa EXPO_PUBLIC_BACKEND_PROVIDER=pocketbase');
                // TODO: Descomentar cuando SupabaseProvider esté implementado
                // if (!CONFIG.SUPABASE.URL || !CONFIG.SUPABASE.KEY) {
                //     throw new Error('Supabase no configurado. Revisa EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_KEY');
                // }
                // this.instance = new SupabaseProvider({
                //     url: CONFIG.SUPABASE.URL,
                //     key: CONFIG.SUPABASE.KEY
                // });
                // break;

            case 'firebase':
                // TODO: Implementar cuando sea necesario
                throw new Error('Firebase provider no implementado aún');

            default:
                throw new Error(`Provider no soportado: ${currentProvider}. Opciones válidas: pocketbase, supabase`);
        }

        this.providerType = currentProvider;

        // Inicializar provider
        this.instance.initialize().catch(error => {
            console.error(`Error al inicializar ${currentProvider}:`, error);
        });

        return this.instance;
    }

    /**
     * Forzar recreación del provider (útil para testing o cambio de configuración)
     */
    static reset(): void {
        this.instance = null;
        this.providerType = null;
    }

    /**
     * Obtener información del provider actual
     */
    static getProviderInfo(): { name: string; type: string; healthy?: boolean } {
        try {
            const instance = this.getInstance();
            return {
                name: instance.name,
                type: this.providerType || 'unknown'
            };
        } catch (error) {
            return {
                name: 'Error',
                type: 'error'
            };
        }
    }

    /**
     * Verificar salud del provider
     */
    static async checkProviderHealth(): Promise<{ healthy: boolean; error: string | null }> {
        try {
            const instance = this.getInstance();
            return await instance.checkHealth();
        } catch (error: any) {
            return {
                healthy: false,
                error: error.message || 'Error desconocido'
            };
        }
    }
}

// 🎯 EXPORTS PRINCIPALES - Interfaz simplificada para uso en la app
const provider = BackendProviderFactory.getInstance();

export const auth = provider.auth;
export const teams = provider.teams;
export const tournaments = provider.tournaments;
export const matches = provider.matches;
export const players = provider.players;
export const referee = provider.referee;

// 🔧 UTILITIES - Para debugging y testing
export const getProviderInfo = BackendProviderFactory.getProviderInfo;
export const checkProviderHealth = BackendProviderFactory.checkProviderHealth;
export const resetProvider = BackendProviderFactory.reset;

// 🧪 TESTING - Acceso directo al factory para tests
export const BackendFactory = BackendProviderFactory;

// 📊 PROVIDER INSTANCE - Para casos especiales
export const getProvider = () => BackendProviderFactory.getInstance();

// ⚡ CONFIGURACIÓN - Re-export para conveniencia
export { CONFIG } from '../config/constants';

// 🎭 TYPES - Re-export de tipos importantes
export type { IBackendProvider } from './interfaces/IBackendProvider';
export type { IAuthProvider } from './interfaces/IAuthProvider';
export type { ITeamsProvider } from './interfaces/ITeamsProvider';
export type { ITournamentsProvider } from './interfaces/ITournamentsProvider';
export type { IMatchesProvider } from './interfaces/IMatchesProvider';
export type { IPlayersProvider } from './interfaces/IPlayersProvider';
export type { IRefereeProvider } from './interfaces/IRefereeProvider';

// 🎯 EJEMPLO DE USO:
/*
// En cualquier componente o hook:
import { auth, teams, tournaments, matches, players, referee } from '@/lib/providers';

// Usar directamente sin preocuparse del backend:
const { data: userTeams } = await teams.getAll();
const { user } = await auth.login(email, password);
const { data: upcomingMatches } = await matches.getUpcoming();

// Para debugging:
import { getProviderInfo, checkProviderHealth } from '@/lib/providers';
console.log(getProviderInfo()); // { name: 'PocketBase', type: 'pocketbase' }
*/

// 🚀 CONFIGURACIÓN DINÁMICA - Permite cambiar backend en runtime
export const switchBackend = async (newBackend: 'pocketbase' | 'supabase' | 'firebase') => {
    // Reset current provider
    BackendProviderFactory.reset();
    
    // Update config (esto requeriría un restart en una app real)
    console.warn(`Para cambiar a ${newBackend}, actualiza EXPO_PUBLIC_BACKEND_PROVIDER y reinicia la app`);
};

// 🎨 DESARROLLO - Helpers para desarrollo
export const developmentHelpers = {
    getCurrentProvider: () => BackendProviderFactory.getProviderInfo(),
    testConnection: () => BackendProviderFactory.checkProviderHealth(),
    resetConnection: () => BackendProviderFactory.reset(),
    
    // Mock provider para testing
    setMockProvider: (mockProvider: IBackendProvider) => {
        (BackendProviderFactory as any).instance = mockProvider;
        (BackendProviderFactory as any).providerType = 'mock';
    }
};

// 📝 LOGGING - Para debugging en desarrollo
if (__DEV__) {
    console.log('🚀 Backend Provider Factory initialized');
    console.log('📊 Current provider:', BackendProviderFactory.getProviderInfo());
    
    // Verificar salud del provider al inicializar
    BackendProviderFactory.checkProviderHealth().then(health => {
        if (health.healthy) {
            console.log('✅ Backend provider is healthy');
        } else {
            console.warn('⚠️ Backend provider health check failed:', health.error);
        }
    });
}