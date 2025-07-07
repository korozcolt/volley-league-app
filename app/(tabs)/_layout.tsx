import { ActivityIndicator, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';

import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../lib/context/AuthContext';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }
  
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        // ✅ COLORES MEJORADOS CON MEJOR CONTRASTE
        tabBarActiveTintColor: '#FFFFFF', // Blanco para activo - MÁS VISIBLE
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280', // Gris para inactivo
        
        // ✅ FONDO DE TAB BAR con mejor contraste
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#4a90e2', // ✅ FONDO AZUL para mejor contraste
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#3B82F6',
          borderTopWidth: 0, // Sin borde superior
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70, // Altura aumentada
        },
        
        // ✅ HEADER mejorado
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#4a90e2', // Mismo color que tab bar
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        headerTintColor: '#FFFFFF', // Texto blanco en header
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: '#FFFFFF',
        },
        
        // ✅ LABEL DE TAB personalizado
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600', // Más bold para mejor visibilidad
          marginTop: 4,
        },
        
        // ✅ COMPORTAMIENTO mejorado
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerTitle: 'Liga de Voleibol',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={26} // Tamaño aumentado
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{
          title: 'Torneos',
          headerTitle: 'Torneos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "trophy" : "trophy-outline"} 
              size={26}
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Equipos',
          headerTitle: 'Equipos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              size={26}
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Partidos',
          headerTitle: 'Partidos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "football" : "football-outline"} 
              size={26}
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={26}
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}