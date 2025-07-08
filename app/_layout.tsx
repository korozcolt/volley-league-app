// app/_layout.tsx
import "./global.css";

import * as SplashScreen from 'expo-splash-screen';

import React, { useEffect } from 'react';
import { darkTheme, lightTheme } from '../lib/theme/paperTheme';

// ✅ IMPORTS CORREGIDOS
import { AuthProvider } from '../lib/context/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useColorScheme } from '../hooks/useColorScheme';

// Mantener la pantalla de splash visible mientras cargamos recursos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // ✅ SELECCIONAR TEMA SEGÚN COLOR SCHEME
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    // Ocultar la pantalla de splash cuando hayamos terminado de cargar recursos
    SplashScreen.hideAsync();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* ✅ AGREGAR OTRAS RUTAS SI ES NECESARIO */}
          <Stack.Screen name="tournament" options={{ headerShown: false }} />
          <Stack.Screen name="team" options={{ headerShown: false }} />
          <Stack.Screen name="match" options={{ headerShown: false }} />
          <Stack.Screen name="player" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}