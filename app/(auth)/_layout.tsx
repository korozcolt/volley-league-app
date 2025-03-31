// app/(auth)/_layout.tsx

import { Colors } from '../../constants/Colors';
import { Stack } from 'expo-router';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function AuthLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
      }}
    />
  );
}