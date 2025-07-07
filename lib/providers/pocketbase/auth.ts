// lib/providers/pocketbase/auth.ts
import { IAuthProvider } from '../interfaces/IAuthProvider';
import PocketBase from 'pocketbase';
import { User } from '@/lib/types/models';

export class PocketBaseAuthProvider implements IAuthProvider {
  constructor(private pb: PocketBase) { }

  /**
   * Inicializar autenticación
   */
  async initializeAuth(): Promise<void> {
    try {
      // La autenticación se restaura automáticamente desde AsyncStorage
      // en el constructor del PocketBaseProvider
      console.log('PocketBase auth initialized');
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
    }
  }

  /**
   * Login con email y password
   */
  async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const authData = await this.pb.collection('users').authWithPassword(email, password);

      if (!authData.record) {
        return { user: null, error: 'Error de autenticación' };
      }

      const user: User = this.mapPocketBaseUserToUser(authData.record);
      return { user, error: null };
    } catch (error: any) {
      console.error('Error en login:', error);
      return {
        user: null,
        error: this.parsePocketBaseError(error)
      };
    }
  }

  /**
   * Registro de nuevo usuario
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
        role,
        emailVisibility: true
      };

      const newUser = await this.pb.collection('users').create(userData);

      // Hacer login automático después del registro
      const loginResult = await this.login(email, password);
      return loginResult;
    } catch (error: any) {
      console.error('Error en registro:', error);
      return {
        user: null,
        error: this.parsePocketBaseError(error)
      };
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<{ error: string | null }> {
    try {
      this.pb.authStore.clear();
      return { error: null };
    } catch (error: any) {
      console.error('Error en logout:', error);
      return { error: 'Error cerrando sesión' };
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    try {
      const model = this.pb.authStore.model;
      if (!model) return null;

      return this.mapPocketBaseUserToUser(model);
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  /**
   * Verificar si tiene rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Verificar si es administrador
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Verificar si es árbitro
   */
  isReferee(): boolean {
    return this.hasRole('referee');
  }

  /**
   * Verificar si es entrenador
   */
  isCoach(): boolean {
    return this.hasRole('coach');
  }

  /**
   * Verificar si es jugador
   */
  isPlayer(): boolean {
    return this.hasRole('player');
  }

  /**
   * Verificar si es espectador
   */
  isViewer(): boolean {
    return this.hasRole('viewer');
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<{ user: User | null; error: string | null }> {
    try {
      if (!this.isAuthenticated()) {
        return { user: null, error: 'Usuario no autenticado' };
      }

      const updateData: any = {};

      if (data.full_name) updateData.full_name = data.full_name;
      if (data.email) updateData.email = data.email;
      if (data.role && this.isAdmin()) updateData.role = data.role; // Solo admin puede cambiar roles

      const updatedUser = await this.pb.collection('users').update(userId, updateData);

      const user = this.mapPocketBaseUserToUser(updatedUser);
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
      if (!this.isAuthenticated()) {
        return { error: 'Usuario no autenticado' };
      }

      const user = this.getCurrentUser();
      if (!user) {
        return { error: 'Usuario no encontrado' };
      }

      // Verificar contraseña actual primero
      try {
        await this.pb.collection('users').authWithPassword(user.email, oldPassword);
      } catch {
        return { error: 'Contraseña actual incorrecta' };
      }

      // Cambiar contraseña
      await this.pb.collection('users').update(user.id, {
        password: newPassword,
        passwordConfirm: newPassword,
        oldPassword: oldPassword
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      return { error: this.parsePocketBaseError(error) };
    }
  }

  /**
   * Refrescar autenticación
   */
  async refreshAuth(): Promise<{ user: User | null; error: string | null }> {
    try {
      if (!this.isAuthenticated()) {
        return { user: null, error: 'No hay sesión activa' };
      }

      // Refrescar token si es necesario
      await this.pb.collection('users').authRefresh();

      const user = this.getCurrentUser();
      return { user, error: null };
    } catch (error: any) {
      console.error('Error refrescando autenticación:', error);
      // Si falla el refresh, limpiar la sesión
      this.pb.authStore.clear();
      return {
        user: null,
        error: 'Sesión expirada, por favor inicia sesión nuevamente'
      };
    }
  }

  // 🔧 MÉTODOS PRIVADOS DE UTILIDAD

  /**
   * Mapear usuario de PocketBase a nuestro modelo User
   */
  private mapPocketBaseUserToUser(pocketbaseUser: any): User {
    return {
      id: pocketbaseUser.id,
      email: pocketbaseUser.email,
      full_name: pocketbaseUser.full_name || '',
      role: pocketbaseUser.role || 'viewer',
      created_at: pocketbaseUser.created || new Date().toISOString(),
      updated_at: pocketbaseUser.updated || new Date().toISOString(),
    };
  }

  /**
   * Parsear errores de PocketBase a mensajes amigables
   */
  private parsePocketBaseError(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.message?.includes('Failed to authenticate')) {
      return 'Email o contraseña incorrectos';
    }

    if (error.message?.includes('email')) {
      return 'Email ya está en uso o es inválido';
    }

    if (error.message?.includes('password')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }

    return error.message || 'Error desconocido';
  }
}