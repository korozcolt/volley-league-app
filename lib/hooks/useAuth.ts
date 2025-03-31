// lib/hooks/useAuth.ts

import { useEffect, useState } from 'react';

import { User } from '../types/models';
import { supabase } from '../supabase';

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
};

export function useAuth(): AuthResponse {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Cargar la sesión al iniciar
    useEffect(() => {
        const getSession = async () => {
            try {
                setLoading(true);

                // Obtener la sesión actual
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                    });
                    await loadUserDetails(session.user.id);
                }
            } catch (error) {
                console.error('Error al cargar la sesión:', error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        // Suscribirse a los cambios en la autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                    });
                    await loadUserDetails(session.user.id);
                } else {
                    setUser(null);
                    setUserDetails(null);
                }
            }
        );

        // Limpiar la suscripción al desmontar
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Cargar detalles del usuario
    const loadUserDetails = async (userId: string) => {
        try {
            // Verificar primero si el usuario existe en la tabla users
            const { data, error, count } = await supabase
                .from('users')
                .select('*', { count: 'exact' })
                .eq('id', userId);

            if (error) throw error;

            // Si no se encontró el usuario, crear un registro en la tabla users
            if (count === 0 || !data || data.length === 0) {
                // Obtener información del usuario de auth
                const { data: userData, error: userError } = await supabase.auth.getUser();
                
                if (userError) throw userError;
                
                if (userData && userData.user) {
                    // Crear un nuevo registro en la tabla users
                    const { data: newUser, error: insertError } = await supabase
                        .from('users')
                        .insert([
                            {
                                id: userId,
                                email: userData.user.email || '',
                                full_name: userData.user.email?.split('@')[0] || 'Usuario',
                                role: 'viewer', // Por defecto, los nuevos usuarios son viewers
                            }
                        ])
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    
                    setUserDetails(newUser as User);
                }
            } else {
                // Si se encontró el usuario, establecer los detalles
                setUserDetails(data[0] as User);
            }
        } catch (error) {
            console.error('Error al cargar detalles del usuario:', error);
            // No establecer el userDetails como null aquí para mantener la sesión activa
        }
    };

    // Iniciar sesión
    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    // Registrarse
    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Si el registro es exitoso, crear el perfil en la tabla users
            if (data?.user) {
                const { error: profileError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: data.user.id,
                            email,
                            full_name: fullName,
                            role: 'viewer', // Por defecto, los nuevos usuarios son viewers
                        }
                    ]);

                if (profileError) {
                    console.error('Error al crear el perfil:', profileError);
                    // No lanzar el error aquí para permitir que el registro continúe
                }
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    // Cerrar sesión
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    // Verificar si el usuario es administrador
    const isAdmin = () => {
        return userDetails?.role === 'admin';
    };

    return { user, userDetails, loading, signIn, signUp, signOut, isAdmin };
}