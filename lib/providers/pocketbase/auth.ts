import { User, UserRole } from '@/lib/types/models';

import { IAuthProvider } from '../interfaces/IAuthProvider';
import PocketBase from 'pocketbase';

export class PocketBaseAuthProvider implements IAuthProvider {
    constructor(private pb: PocketBase) { }

    /**
     * Iniciar sesión con email y contraseña
     */
    async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
        try {
            const authData = await this.pb.collection('users').authWithPassword(email, password);

            // Mapear datos de PocketBase a nuestro modelo User
            const user: User = {
                id: authData.record.id,
                email: authData.record.email,
                full_name: authData.record.full_name || authData.record.name || '',
                role: this.mapPocketBaseRole(authData.record.role),
                created_at: authData.record.created || new Date().toISOString(),
                updated_at: authData.record.updated || new Date().toISOString(),
            };

            return { user, error: null };
        } catch (error: any) {
            console.error('Error en login PocketBase:', error);
            return {
                user: null,
                error: error.message || 'Error al iniciar sesión'
            };
        }
    }

    /**
     * Registrar nuevo usuario
     */
    async register(
        email: string,
        password: string,
        fullName: string,
        role: string = 'viewer'
    ): Promise<{ user: User | null; error: string | null }> {
        try {
            const userData = {
                email,
                password,
                passwordConfirm: password,
                full_name: fullName,
                name: fullName, // PocketBase usa 'name' por defecto
                role: this.mapToSupabaseRole(role as UserRole), // Convertir a formato PocketBase
            };

            const createdUser = await this.pb.collection('users').create(userData);

            // Mapear respuesta a nuestro modelo
            const user: User = {
                id: createdUser.id,
                email: createdUser.email,
                full_name: createdUser.full_name || createdUser.name || '',
                role: this.mapPocketBaseRole(createdUser.role),
                created_at: createdUser.created || new Date().toISOString(),
                updated_at: createdUser.updated || new Date().toISOString(),
            };

            return { user, error: null };
        } catch (error: any) {
            console.error('Error en registro PocketBase:', error);
            return {
                user: null,
                error: this.parsePocketBaseError(error)
            };
        }
    }

    /**
     * Cerrar sesión
     */
    async logout(): Promise<{ error: string | null }> {
        try {
            this.pb.authStore.clear();
            return { error: null };
        } catch (error: any) {
            console.error('Error en logout PocketBase:', error);
            return {
                error: error.message || 'Error al cerrar sesión'
            };
        }
    }

    /**
     * Obtener usuario actual
     */
    getCurrentUser(): User | null {
        try {
            const authModel = this.pb.authStore.model;

            if (!authModel || !this.pb.authStore.isValid) {
                return null;
            }

            return {
                id: authModel.id,
                email: authModel.email,
                full_name: authModel.full_name || authModel.name || '',
                role: this.mapPocketBaseRole(authModel.role),
                created_at: authModel.created || new Date().toISOString(),
                updated_at: authModel.updated || new Date().toISOString(),
            };
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            return null;
        }
    }

    /**
     * Verificar si está autenticado
     */
    isAuthenticated(): boolean {
        return this.pb.authStore.isValid && !!this.pb.authStore.model;
    }

    /**
     * Verificar si tiene un rol específico
     */
    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    }

    /**
     * Verificar si es administrador
     */
    isAdmin(): boolean {
        return this.hasRole(UserRole.ADMIN);
    }

    /**
     * Verificar si es árbitro
     */
    isReferee(): boolean {
        // En PocketBase podríamos tener 'referee' como rol
        return this.hasRole('referee');
    }

    /**
     * Verificar si es entrenador
     */
    isCoach(): boolean {
        // En PocketBase podríamos tener 'coach' como rol
        return this.hasRole('coach');
    }

    /**
     * Verificar si es jugador
     */
    isPlayer(): boolean {
        // En PocketBase podríamos tener 'player' como rol
        return this.hasRole('player');
    }

    /**
     * Verificar si es espectador
     */
    isViewer(): boolean {
        return this.hasRole(UserRole.VIEWER);
    }

    /**
     * Actualizar perfil de usuario
     */
    async updateProfile(userId: string, data: Partial<User>): Promise<{ user: User | null; error: string | null }> {
        try {
            // Mapear datos a formato PocketBase
            const updateData: any = {};

            if (data.full_name) {
                updateData.full_name = data.full_name;
                updateData.name = data.full_name; // PocketBase compatibility
            }

            if (data.email) {
                updateData.email = data.email;
            }

            if (data.role) {
                updateData.role = this.mapToSupabaseRole(data.role);
            }

            const updatedRecord = await this.pb.collection('users').update(userId, updateData);

            const user: User = {
                id: updatedRecord.id,
                email: updatedRecord.email,
                full_name: updatedRecord.full_name || updatedRecord.name || '',
                role: this.mapPocketBaseRole(updatedRecord.role),
                created_at: updatedRecord.created || new Date().toISOString(),
                updated_at: updatedRecord.updated || new Date().toISOString(),
            };

            return { user, error: null };
        } catch (error: any) {
            console.error('Error actualizando perfil:', error);
            return {
                user: null,
                error: this.parsePocketBaseError(error)
            };
        }
    }

    /**
     * Cambiar contraseña
     */
    async changePassword(oldPassword: string, newPassword: string): Promise<{ error: string | null }> {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                return { error: 'Usuario no autenticado' };
            }

            // En PocketBase necesitamos verificar la contraseña actual y cambiarla
            await this.pb.collection('users').update(user.id, {
                oldPassword,
                password: newPassword,
                passwordConfirm: newPassword,
            });

            return { error: null };
        } catch (error: any) {
            console.error('Error cambiando contraseña:', error);
            return {
                error: this.parsePocketBaseError(error)
            };
        }
    }

    /**
     * Inicializar autenticación (cargar sesión guardada)
     */
    async initializeAuth(): Promise<void> {
        // La inicialización se maneja en el constructor del PocketBaseProvider
        // que configura la persistencia con AsyncStorage
    }

    /**
     * Refrescar autenticación
     */
    async refreshAuth(): Promise<{ user: User | null; error: string | null }> {
        try {
            if (!this.pb.authStore.isValid) {
                return { user: null, error: 'Sesión no válida' };
            }

            // En PocketBase, el token se refresca automáticamente
            // Solo necesitamos obtener el usuario actual
            const user = this.getCurrentUser();
            return { user, error: null };
        } catch (error: any) {
            console.error('Error refrescando auth:', error);
            return {
                user: null,
                error: error.message || 'Error al refrescar sesión'
            };
        }
    }

    // 🔧 MÉTODOS PRIVADOS DE UTILIDAD

    /**
     * Mapear roles de PocketBase a nuestro enum UserRole
     */
    private mapPocketBaseRole(pocketbaseRole: string): UserRole {
        switch (pocketbaseRole?.toLowerCase()) {
            case 'admin':
                return UserRole.ADMIN;
            case 'viewer':
            case 'user':
            default:
                return UserRole.VIEWER;
        }
    }

    /**
     * Mapear nuestros roles a formato PocketBase
     */
    private mapToSupabaseRole(role: UserRole): string {
        switch (role) {
            case UserRole.ADMIN:
                return 'admin';
            case UserRole.VIEWER:
            default:
                return 'viewer';
        }
    }

    /**
     * Parsear errores de PocketBase a mensajes amigables
     */
    private parsePocketBaseError(error: any): string {
        if (error.response?.data) {
            const data = error.response.data;

            // Errores de validación
            if (data.email) {
                return 'El email ya está en uso o no es válido';
            }

            if (data.password) {
                return 'La contraseña no cumple con los requisitos';
            }

            if (data.message) {
                return data.message;
            }
        }

        // Errores comunes
        if (error.message?.includes('email')) {
            return 'Credenciales incorrectas';
        }

        if (error.message?.includes('password')) {
            return 'Contraseña incorrecta';
        }

        return error.message || 'Error desconocido';
    }
}