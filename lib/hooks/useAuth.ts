// lib/hooks/useAuth.ts - Actualizado para usar Provider Pattern
import { useEffect, useState } from 'react';

import { User } from '../types/models';
import { auth } from '../providers'; // 🎯 Ahora usa el provider factory

type AuthUser = {
    id: string;
    email: string;
};

type AuthResponse = {
    user: AuthUser | null;
    userDetails: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<{ error: Error | null }>;
    isAdmin: () => boolean;
    updateProfile: (data: Partial<User>) => Promise<{ error: Error | null }>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
    refreshAuth: () => Promise<void>;
};

export function useAuth(): AuthResponse {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔄 INICIALIZAR AUTH AL CARGAR
    useEffect(() => {
        initializeAuth();
    }, []);

    /**
     * Inicializar autenticación
     */
    const initializeAuth = async () => {
        try {
            setLoading(true);
            
            // Inicializar provider auth
            await auth.initializeAuth();
            
            // Obtener usuario actual si existe
            const currentUser = auth.getCurrentUser();
            
            if (currentUser) {
                setUser({
                    id: currentUser.id,
                    email: currentUser.email,
                });
                setUserDetails(currentUser);
            }
        } catch (error) {
            console.error('Error al inicializar autenticación:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Iniciar sesión
     */
    const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
        try {
            const { user: loggedUser, error } = await auth.login(email, password);
            
            if (error) {
                throw new Error(error);
            }
            
            if (loggedUser) {
                setUser({
                    id: loggedUser.id,
                    email: loggedUser.email,
                });
                setUserDetails(loggedUser);
            }
            
            return { error: null };
        } catch (error) {
            console.error('Error en signIn:', error);
            return { error: error as Error };
        }
    };

    /**
     * Registrar usuario
     */
    const signUp = async (
        email: string, 
        password: string, 
        fullName: string
    ): Promise<{ error: Error | null }> => {
        try {
            const { user: newUser, error } = await auth.register(email, password, fullName);
            
            if (error) {
                throw new Error(error);
            }
            
            // No setear usuario automáticamente después del registro
            // Algunos providers requieren verificación de email
            
            return { error: null };
        } catch (error) {
            console.error('Error en signUp:', error);
            return { error: error as Error };
        }
    };

    /**
     * Cerrar sesión
     */
    const signOut = async (): Promise<{ error: Error | null }> => {
        try {
            const { error } = await auth.logout();
            
            if (error) {
                throw new Error(error);
            }
            
            // Limpiar estado local
            setUser(null);
            setUserDetails(null);
            
            return { error: null };
        } catch (error) {
            console.error('Error en signOut:', error);
            return { error: error as Error };
        }
    };

    /**
     * Verificar si el usuario es administrador
     */
    const isAdmin = (): boolean => {
        return auth.isAdmin();
    };

    /**
     * Actualizar perfil de usuario
     */
    const updateProfile = async (data: Partial<User>): Promise<{ error: Error | null }> => {
        try {
            if (!userDetails) {
                throw new Error('Usuario no autenticado');
            }

            const { user: updatedUser, error } = await auth.updateProfile(userDetails.id, data);
            
            if (error) {
                throw new Error(error);
            }
            
            if (updatedUser) {
                setUser({
                    id: updatedUser.id,
                    email: updatedUser.email,
                });
                setUserDetails(updatedUser);
            }
            
            return { error: null };
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            return { error: error as Error };
        }
    };

    /**
     * Cambiar contraseña
     */
    const changePassword = async (
        oldPassword: string, 
        newPassword: string
    ): Promise<{ error: Error | null }> => {
        try {
            const { error } = await auth.changePassword(oldPassword, newPassword);
            
            if (error) {
                throw new Error(error);
            }
            
            return { error: null };
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            return { error: error as Error };
        }
    };

    /**
     * Refrescar datos de autenticación
     */
    const refreshAuth = async (): Promise<void> => {
        try {
            const { user: refreshedUser, error } = await auth.refreshAuth();
            
            if (error) {
                console.warn('Error refrescando auth:', error);
                return;
            }
            
            if (refreshedUser) {
                setUser({
                    id: refreshedUser.id,
                    email: refreshedUser.email,
                });
                setUserDetails(refreshedUser);
            } else {
                // Si no hay usuario, limpiar estado
                setUser(null);
                setUserDetails(null);
            }
        } catch (error) {
            console.error('Error en refreshAuth:', error);
        }
    };

    // 🎯 RETORNO DEL HOOK - Mantiene la misma interfaz
    return { 
        user, 
        userDetails, 
        loading, 
        signIn, 
        signUp, 
        signOut, 
        isAdmin,
        updateProfile,
        changePassword,
        refreshAuth
    };
}

// 🔧 HOOKS ADICIONALES PARA FUNCIONALIDADES ESPECÍFICAS

/**
 * Hook para verificar roles específicos
 */
export function useRole() {
    return {
        isAdmin: () => auth.isAdmin(),
        isReferee: () => auth.isReferee(),
        isCoach: () => auth.isCoach(),
        isPlayer: () => auth.isPlayer(),
        isViewer: () => auth.isViewer(),
        hasRole: (role: string) => auth.hasRole(role),
    };
}

/**
 * Hook para obtener solo el estado de autenticación
 */
export function useAuthState() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        const checkAuth = () => {
            const authenticated = auth.isAuthenticated();
            const currentUser = auth.getCurrentUser();
            
            setIsAuthenticated(authenticated);
            setUser(currentUser);
        };
        
        checkAuth();
        
        // Polling cada 30 segundos para verificar estado
        const interval = setInterval(checkAuth, 30000);
        
        return () => clearInterval(interval);
    }, []);
    
    return { isAuthenticated, user };
}

/**
 * Hook para verificar si el usuario está cargando
 */
export function useAuthLoading() {
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const checkLoading = async () => {
            try {
                await auth.initializeAuth();
            } finally {
                setLoading(false);
            }
        };
        
        checkLoading();
    }, []);
    
    return loading;
}