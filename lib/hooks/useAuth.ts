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
            // Utilizar la función RPC (Remote Procedure Call) para obtener o crear usuario
            // (asumiendo que tienes esta función en Supabase)
            const { data, error } = await supabase
                .rpc('get_or_create_user_profile', {
                    user_id: userId,
                    user_email: user?.email || ''
                });

            if (error) {
                // Si la función RPC no existe, intentamos el enfoque directo con manejador de errores
                console.log('Fallback: obteniendo usuario directamente:', error);
                
                // Intentar obtener el usuario primero
                const { data: userData, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle();

                if (fetchError) {
                    console.error('Error al obtener usuario:', fetchError);
                    return;
                }

                if (userData) {
                    setUserDetails(userData as User);
                } else {
                    // Si la consulta no falla pero no devuelve datos,
                    // el usuario posiblemente no exista, pero no podemos crearlo debido a RLS
                    console.log('Usuario no encontrado y no se puede crear debido a RLS');
                    
                    // Podríamos establecer un userDetails temporal hasta que se resuelva el problema
                    setUserDetails({
                        id: userId,
                        email: user?.email || '',
                        full_name: 'Usuario Temporal',
                        role: 'viewer',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    } as User);
                }
            } else {
                // Si la función RPC existe y se ejecuta correctamente
                setUserDetails(data as User);
            }
        } catch (error) {
            console.error('Error al cargar detalles del usuario:', error);
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
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            // Nota: Ya no intentamos insertar directamente en la tabla users
            // Este paso debe ser manejado por un trigger de Supabase o una función RPC

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