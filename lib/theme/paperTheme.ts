// lib/theme/paperTheme.ts
import {
  MD3DarkTheme,
  MD3LightTheme,
  MD3Theme,
  configureFonts,
} from 'react-native-paper';

import { Platform } from 'react-native'; // ✅ AGREGADO IMPORT FALTANTE

// 🎨 COLORES PERSONALIZADOS PARA VOLLEY LEAGUE
const lightColors = {
  primary: '#4a90e2',           // Azul principal (mismo que usas ahora)
  primaryContainer: '#e3f2fd',  // Azul claro para contenedores
  secondary: '#26a69a',         // Verde para acciones secundarias
  secondaryContainer: '#e0f2f1', // Verde claro
  tertiary: '#ff7043',          // Naranja para warnings/destacados
  tertiaryContainer: '#fff3e0', // Naranja claro
  error: '#f44336',             // Rojo para errores
  errorContainer: '#ffebee',    // Rojo claro
  background: '#f8f9fa',        // Fondo general
  surface: '#ffffff',           // Superficie de tarjetas
  surfaceVariant: '#f5f5f5',    // Superficie alternativa
  onPrimary: '#ffffff',         // Texto sobre primario
  onSecondary: '#ffffff',       // Texto sobre secundario
  onBackground: '#1a1a1a',      // Texto sobre fondo
  onSurface: '#1a1a1a',         // Texto sobre superficie
  outline: '#e0e0e0',           // Bordes
  surfaceDisabled: '#f5f5f5',   // Superficie deshabilitada
  onSurfaceDisabled: '#9e9e9e', // Texto deshabilitado
};

const darkColors = {
  primary: '#64b5f6',           // Azul más claro para modo oscuro
  primaryContainer: '#1565c0',  // Azul oscuro para contenedores
  secondary: '#4db6ac',         // Verde más claro
  secondaryContainer: '#00695c', // Verde oscuro
  tertiary: '#ffab91',          // Naranja más claro
  tertiaryContainer: '#d84315', // Naranja oscuro
  error: '#ef5350',             // Rojo más claro
  errorContainer: '#c62828',    // Rojo oscuro
  background: '#121212',        // Fondo oscuro
  surface: '#1e1e1e',           // Superficie oscura
  surfaceVariant: '#2c2c2c',    // Superficie alternativa oscura
  onPrimary: '#000000',         // Texto sobre primario
  onSecondary: '#000000',       // Texto sobre secundario
  onBackground: '#ffffff',      // Texto sobre fondo oscuro
  onSurface: '#ffffff',         // Texto sobre superficie oscura
  outline: '#444444',           // Bordes oscuros
  surfaceDisabled: '#2c2c2c',   // Superficie deshabilitada
  onSurfaceDisabled: '#666666', // Texto deshabilitado
};

// 🔤 CONFIGURACIÓN DE FUENTES - ✅ CORREGIDA
const fontConfig = {
  displayLarge: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 32,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
};

const fonts = configureFonts({ config: fontConfig });

// 🌅 TEMA CLARO
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  fonts,
  roundness: 12, // Bordes redondeados más pronunciados
};

// 🌙 TEMA OSCURO
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  fonts,
  roundness: 12,
};

// 🎯 EXTENSIONES PERSONALIZADAS DEL TEMA
export const customTheme = {
  // 📐 ESPACIADO CONSISTENTE
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // 📱 DIMENSIONES COMUNES
  dimensions: {
    // Headers
    headerHeight: 56,
    tabBarHeight: 70,
    
    // Botones
    buttonHeight: 48,
    buttonHeightSmall: 36,
    buttonHeightLarge: 56,
    
    // Cards
    cardMinHeight: 120,
    cardBorderRadius: 12,
    
    // Input
    inputHeight: 48,
    
    // Icons
    iconSize: 24,
    iconSizeSmall: 18,
    iconSizeLarge: 32,
    
    // FAB
    fabSize: 56,
  },
  
  // 🎨 COLORES ADICIONALES (para casos específicos de volley)
  volleyball: {
    // Estados de partido
    scheduled: '#FF9800',
    inProgress: '#4CAF50',
    completed: '#9E9E9E',
    cancelled: '#f44336',
    
    // Estados de torneo
    upcoming: '#2196F3',
    active: '#4CAF50',
    finished: '#9E9E9E',
    
    // Estados de equipo
    teamActive: '#4CAF50',
    teamInactive: '#9E9E9E',
    
    // Estadísticas
    wins: '#4CAF50',
    losses: '#f44336',
    ties: '#FF9800',
  },
  
  // 🎭 ANIMACIONES
  animations: {
    timing: {
      short: 150,
      medium: 300,
      long: 500,
    },
    easing: {
      standard: 'ease-in-out',
      accelerate: 'ease-in',
      decelerate: 'ease-out',
    },
  },
  
  // 📊 SOMBRAS PERSONALIZADAS
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

// 🔧 UTILIDADES DEL TEMA
export const useVolleyTheme = (isDark: boolean) => {
  const paperTheme = isDark ? darkTheme : lightTheme;
  
  return {
    ...paperTheme,
    custom: customTheme,
    
    // Helpers para acceso rápido a colores
    colors: {
      ...paperTheme.colors,
      volleyball: customTheme.volleyball,
    },
    
    // Helper para obtener color por estado
    getStatusColor: (status: string) => {
      switch (status) {
        case 'scheduled':
        case 'upcoming':
          return customTheme.volleyball.scheduled;
        case 'in_progress':
        case 'active':
          return customTheme.volleyball.inProgress;
        case 'completed':
        case 'finished':
          return customTheme.volleyball.completed;
        case 'cancelled':
          return customTheme.volleyball.cancelled;
        default:
          return paperTheme.colors.primary;
      }
    },
    
    // Helper para spacing con NativeWind
    tw: {
      spacing: {
        xs: 'p-1',      // 4px
        sm: 'p-2',      // 8px
        md: 'p-4',      // 16px
        lg: 'p-6',      // 24px
        xl: 'p-8',      // 32px
        xxl: 'p-12',    // 48px
      },
      margin: {
        xs: 'm-1',      // 4px
        sm: 'm-2',      // 8px
        md: 'm-4',      // 16px
        lg: 'm-6',      // 24px
        xl: 'm-8',      // 32px
        xxl: 'm-12',    // 48px
      },
    },
  };
};

// 📱 BREAKPOINTS RESPONSIVE (para tablets)
export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

// 🎯 TIPOS PARA TYPESCRIPT
export type VolleyTheme = ReturnType<typeof useVolleyTheme>;
export type VolleyColors = typeof customTheme.volleyball;