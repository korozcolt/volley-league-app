import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

// Valores de configuración de Supabase
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://bsxvbhervddjgddgyjkd.supabase.co';
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey || 'tu_supabase_key_fallback';

// Definimos la interfaz para nuestra base de datos
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string;
                    role: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    full_name: string;
                    role?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string;
                    role?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            teams: {
                Row: {
                    id: string;
                    name: string;
                    logo_url?: string | null;
                    coach_name?: string | null;
                    contact_email?: string | null;
                    contact_phone?: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    logo_url?: string | null;
                    coach_name?: string | null;
                    contact_email?: string | null;
                    contact_phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    logo_url?: string | null;
                    coach_name?: string | null;
                    contact_email?: string | null;
                    contact_phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            // Añadiremos más tablas según vayamos avanzando
        };
    };
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
);