import { User } from '@/lib/types/models';

export interface IAuthProvider {
  // Autenticación básica
  login(email: string, password: string): Promise<{ user: User | null; error: string | null }>;
  register(email: string, password: string, fullName: string, role?: string): Promise<{ user: User | null; error: string | null }>;
  logout(): Promise<{ error: string | null }>;
  
  // Estado de autenticación
  getCurrentUser(): User | null;
  isAuthenticated(): boolean;
  
  // Verificación de roles
  hasRole(role: string): boolean;
  isAdmin(): boolean;
  isReferee(): boolean;
  isCoach(): boolean;
  isPlayer(): boolean;
  isViewer(): boolean;
  
  // Gestión de perfil
  updateProfile(userId: string, data: Partial<User>): Promise<{ user: User | null; error: string | null }>;
  changePassword(oldPassword: string, newPassword: string): Promise<{ error: string | null }>;
  
  // Sesión
  initializeAuth(): Promise<void>;
  refreshAuth(): Promise<{ user: User | null; error: string | null }>;
}