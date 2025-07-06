// lib/providers/index.ts - Factory Principal
import { CONFIG } from '../config/constants';
import { IBackendProvider } from './interfaces/IBackendProvider';
import { PocketBaseProvider } from './pocketbase/PocketBaseProvider';
import { SupabaseProvider } from './supabase/SupabaseProvider';

// ⭐ SINGLETON PATTERN - Una sola instancia del provider activo
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
                if (!CONFIG.SUPABASE.URL || !CONFIG.SUPABASE.KEY) {
                    throw new Error('Supabase no configurado. Revisa EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_KEY');
                }

                this.instance = new SupabaseProvider({
                    url: CONFIG.SUPABASE.URL,
                    key: CONFIG.SUPABASE.KEY
                });
                break;

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
        if (!this.instance) {
            return { name: 'None', type: 'none' };
        }

        return {
            name: this.instance.name,
            type: this.providerType || 'unknown'
        };
    }

    /**
     * Verificar salud del provider actual
     */
    static async checkHealth(): Promise<{ healthy: boolean; error: string | null }> {
        try {
            const provider = this.getInstance();
            return await provider.checkHealth();
        } catch (error: any) {
            return {
                healthy: false,
                error: error.message || 'Error desconocido'
            };
        }
    }
}

// 🎯 EXPORTS PRINCIPALES - Lo que usarán los demás archivos
export const backendProvider = BackendProviderFactory.getInstance();
export const { auth, teams, tournaments, matches, players, referee } = backendProvider;

// 🔧 UTILITIES
export { BackendProviderFactory };
export type { IBackendProvider };

// 📊 HELPERS PARA DEBUGGING Y DESARROLLO
export const getProviderInfo = () => BackendProviderFactory.getProviderInfo();
export const checkProviderHealth = () => BackendProviderFactory.checkHealth();
export const resetProvider = () => BackendProviderFactory.reset();

// 🏗️ DESARROLLO/TESTING - Funciones de utilidad
if (CONFIG.APP.IS_DEVELOPMENT) {
    // Exponer factory globalmente para debugging
    (global as any).__BackendProviderFactory = BackendProviderFactory;

    // Log información del provider al importar
    console.log(`🔧 Backend Provider: ${CONFIG.BACKEND.PROVIDER.toUpperCase()}`);
    console.log(`🌐 Provider Info:`, getProviderInfo());

    // Verificar salud en desarrollo
    checkProviderHealth().then(health => {
        if (health.healthy) {
            console.log('✅ Backend Provider conectado correctamente');
        } else {
            console.warn('⚠️ Backend Provider con problemas:', health.error);
        }
    });
}