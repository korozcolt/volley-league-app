// app/(auth)/login.tsx (corregido)

import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';

import { Colors } from '../../constants/Colors';
import { useAuthContext } from '../../lib/context/AuthContext';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuthContext();
    const router = useRouter();
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingresa tu email y contraseña');
            return;
        }

        setLoading(true);
        try {
            const { error } = await signIn(email, password);
            if (error) throw error;

            // Si el inicio de sesión es exitoso, redirigir al dashboard
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert('Error de inicio de sesión', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            <View style={styles.formContainer}>
                <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Liga de Voleibol</Text>
                <Text style={[styles.subtitle, { color: Colors[colorScheme].textSecondary || '#757575' }]}>Gestiona tus torneos y equipos</Text>

                <TextInput
                    style={[styles.input, { backgroundColor: Colors[colorScheme].card || '#fff', color: Colors[colorScheme].text }]}
                    placeholder="Email"
                    placeholderTextColor={Colors[colorScheme].textSecondary || '#757575'}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={[styles.input, { backgroundColor: Colors[colorScheme].card || '#fff', color: Colors[colorScheme].text }]}
                    placeholder="Contraseña"
                    placeholderTextColor={Colors[colorScheme].textSecondary || '#757575'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Iniciar Sesión</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={{ color: Colors[colorScheme].textSecondary || '#757575' }}>¿No tienes una cuenta? </Text>
                    <Link href="/register" asChild>
                        <TouchableOpacity>
                            <Text style={styles.registerText}>Regístrate</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
    },
    button: {
        backgroundColor: '#4a90e2',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: '#4a90e2',
        fontWeight: 'bold',
    },
});