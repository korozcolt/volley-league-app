// app/(auth)/register.tsx

import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';

import { Colors } from '../../constants/Colors';
import { useAuthContext } from '../../lib/context/AuthContext';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuthContext();
    const router = useRouter();
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const handleRegister = async () => {
        if (!email || !password || !fullName) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        // Validar el email con una expresión regular simple
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Por favor ingresa un email válido');
            return;
        }

        // Validar que la contraseña tenga al menos 6 caracteres
        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            const { error } = await signUp(email, password, fullName);
            if (error) throw error;

            Alert.alert(
                'Registro exitoso',
                'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
                [{ text: 'OK', onPress: () => router.push('/login') }]
            );
        } catch (error) {
            Alert.alert('Error de registro', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            <View style={styles.formContainer}>
                <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Crear cuenta</Text>
                <Text style={[styles.subtitle, { color: Colors[colorScheme].textSecondary || '#757575' }]}>Regístrate para acceder a la aplicación</Text>

                <TextInput
                    style={[styles.input, { backgroundColor: Colors[colorScheme].card || '#fff', color: Colors[colorScheme].text }]}
                    placeholder="Nombre completo"
                    placeholderTextColor={Colors[colorScheme].textSecondary || '#757575'}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                />

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
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Registrarse</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={{ color: Colors[colorScheme].textSecondary || '#757575' }}>¿Ya tienes una cuenta? </Text>
                    <Link href="/login" asChild>
                        <TouchableOpacity>
                            <Text style={styles.loginText}>Inicia sesión</Text>
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
    loginText: {
        color: '#4a90e2',
        fontWeight: 'bold',
    },
});