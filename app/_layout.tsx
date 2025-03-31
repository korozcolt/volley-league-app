import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from '../lib/context/AuthContext';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

// Mantener la pantalla de splash visible mientras cargamos recursos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Ocultar la pantalla de splash cuando hayamos terminado de cargar recursos
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}