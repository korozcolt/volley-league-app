// lib/config/constants.ts - Actualizado con Backend Provider
import Constants from 'expo-constants';

// Función helper para obtener variables de entorno
const getEnvVar = (key: string, defaultValue?: any) => {
  return Constants.expoConfig?.extra?.[key] ?? defaultValue;
};

// ⭐ NUEVO: Configuración de Backend Provider
export const BACKEND_CONFIG = {
  PROVIDER: getEnvVar('backendProvider', 'pocketbase') as 'pocketbase' | 'supabase' | 'firebase',
  get IS_POCKETBASE() {
    return this.PROVIDER === 'pocketbase';
  },
  get IS_SUPABASE() {
    return this.PROVIDER === 'supabase';
  },
  get IS_FIREBASE() {
    return this.PROVIDER === 'firebase';
  },
} as const;

// Configuración de PocketBase
export const POCKETBASE_CONFIG = {
  URL: getEnvVar('pocketbaseUrl', 'http://127.0.0.1:8090'),
  HEALTH_ENDPOINT: getEnvVar('pocketbaseHealthEndpoint', '/health'),
  API_ENDPOINT: getEnvVar('pocketbaseApiEndpoint', '/api/'),
  get HEALTH_URL() {
    return `${this.URL}${this.HEALTH_ENDPOINT}`;
  },
  get API_URL() {
    return `${this.URL}${this.API_ENDPOINT}`;
  }
} as const;

// ⭐ NUEVO: Configuración de Supabase (para futuro)
export const SUPABASE_CONFIG = {
  URL: getEnvVar('supabaseUrl', ''),
  KEY: getEnvVar('supabaseKey', ''),
  get IS_CONFIGURED() {
    return Boolean(this.URL && this.KEY);
  }
} as const;

// ⭐ NUEVO: Configuración de Firebase (para futuro)
export const FIREBASE_CONFIG = {
  PROJECT_ID: getEnvVar('firebaseProjectId', ''),
  API_KEY: getEnvVar('firebaseApiKey', ''),
  AUTH_DOMAIN: getEnvVar('firebaseAuthDomain', ''),
  get IS_CONFIGURED() {
    return Boolean(this.PROJECT_ID && this.API_KEY);
  }
} as const;

// Configuración de la App
export const APP_CONFIG = {
  NAME: getEnvVar('appName', 'Volley League App'),
  VERSION: getEnvVar('appVersion', '1.0.0'),
  ENVIRONMENT: getEnvVar('appEnvironment', 'development'),
  get IS_DEVELOPMENT() {
    return this.ENVIRONMENT === 'development';
  },
  get IS_PRODUCTION() {
    return this.ENVIRONMENT === 'production';
  },
  get IS_STAGING() {
    return this.ENVIRONMENT === 'staging';
  },
} as const;

// Configuración de API
export const API_CONFIG = {
  TIMEOUT: getEnvVar('apiTimeout', 10000),
  MAX_RETRIES: getEnvVar('maxRetries', 3),
  RETRY_DELAY: getEnvVar('retryDelay', 1000),
} as const;

// Configuración de Cache
export const CACHE_CONFIG = {
  TTL: getEnvVar('cacheTtl', 300000), // 5 minutos
  AUTH_TOKEN_KEY: getEnvVar('authTokenKey', 'auth_token'),
  USER_CACHE_KEY: getEnvVar('userCacheKey', 'user_cache'),
  TEAMS_CACHE_KEY: getEnvVar('teamsCacheKey', 'teams_cache'),
  TOURNAMENTS_CACHE_KEY: getEnvVar('tournamentsCacheKey', 'tournaments_cache'),
} as const;

// Configuración de Upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: getEnvVar('maxFileSize', 2097152), // 2MB
  ALLOWED_IMAGE_TYPES: getEnvVar('allowedImageTypes', ['image/jpeg', 'image/png', 'image/webp']),
  ALLOWED_DOCUMENT_TYPES: getEnvVar('allowedDocumentTypes', ['application/pdf', 'application/msword']),
  get MAX_FILE_SIZE_MB() {
    return Math.round(this.MAX_FILE_SIZE / 1024 / 1024);
  }
} as const;

// Configuración de Partidos (Reglas de Voleibol)
export const MATCH_CONFIG = {
  DEFAULT_SET_POINTS: getEnvVar('defaultSetPoints', 25),
  DEFAULT_FINAL_SET_POINTS: getEnvVar('defaultFinalSetPoints', 15),
  MIN_POINT_DIFFERENCE: getEnvVar('minPointDifference', 2),
  MAX_SETS_PER_MATCH: getEnvVar('maxSetsPerMatch', 5),
  MAX_TIMEOUTS_PER_SET: getEnvVar('maxTimeoutsPerSet', 2),
  MAX_SUBSTITUTIONS_PER_SET: getEnvVar('maxSubstitutionsPerSet', 6),
  ROTATION_POSITIONS: 6,
  get SETS_TO_WIN() {
    return Math.ceil(this.MAX_SETS_PER_MATCH / 2);
  },
} as const;

// Configuración de Notificaciones
export const NOTIFICATION_CONFIG = {
  MATCH_REMINDER_HOURS: getEnvVar('matchReminderHours', 2),
  ENABLE_PUSH_NOTIFICATIONS: getEnvVar('enablePushNotifications', true),
  ENABLE_EMAIL_NOTIFICATIONS: getEnvVar('enableEmailNotifications', false),
  RESULT_NOTIFICATION_DELAY: getEnvVar('resultNotificationDelay', 5000), // 5 segundos
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_REAL_TIME: getEnvVar('enableRealTime', true),
  ENABLE_ANALYTICS: getEnvVar('enableAnalytics', false),
  ENABLE_DEBUG_MODE: getEnvVar('enableDebugMode', false),
  ENABLE_OFFLINE_MODE: getEnvVar('enableOfflineMode', false),
  ENABLE_DARK_MODE: getEnvVar('enableDarkMode', true),
  ENABLE_MULTI_LANGUAGE: getEnvVar('enableMultiLanguage', false),
} as const;

// Configuración de Temas
export const THEME_CONFIG = {
  ANIMATION_DURATION: getEnvVar('animationDuration', 300),
  BORDER_RADIUS: getEnvVar('borderRadius', 8),
  SHADOW_OPACITY: getEnvVar('shadowOpacity', 0.1),
  HAPTIC_FEEDBACK: getEnvVar('hapticFeedback', true),
} as const;

// Validaciones
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: getEnvVar('minPasswordLength', 6),
  MAX_PASSWORD_LENGTH: getEnvVar('maxPasswordLength', 128),
  MIN_NAME_LENGTH: getEnvVar('minNameLength', 2),
  MAX_NAME_LENGTH: getEnvVar('maxNameLength', 100),
  MIN_TEAM_NAME_LENGTH: getEnvVar('minTeamNameLength', 2),
  MAX_TEAM_NAME_LENGTH: getEnvVar('maxTeamNameLength', 50),
  MIN_TOURNAMENT_NAME_LENGTH: getEnvVar('minTournamentNameLength', 3),
  MAX_TOURNAMENT_NAME_LENGTH: getEnvVar('maxTournamentNameLength', 100),
  MAX_DESCRIPTION_LENGTH: getEnvVar('maxDescriptionLength', 500),
  MAX_LOCATION_LENGTH: getEnvVar('maxLocationLength', 200),
  MIN_JERSEY_NUMBER: getEnvVar('minJerseyNumber', 1),
  MAX_JERSEY_NUMBER: getEnvVar('maxJerseyNumber', 99),
  MIN_HEIGHT: getEnvVar('minHeight', 150), // cm
  MAX_HEIGHT: getEnvVar('maxHeight', 220), // cm
  MIN_AGE: getEnvVar('minAge', 5),
  MAX_AGE: getEnvVar('maxAge', 80),
} as const;

// ⭐ NUEVO: Configuración por Provider
export const getProviderConfig = () => {
  switch (BACKEND_CONFIG.PROVIDER) {
    case 'pocketbase':
      return {
        type: 'pocketbase' as const,
        config: POCKETBASE_CONFIG,
        features: {
          realTime: true,
          fileUploads: true,
          auth: true,
          relations: true,
        }
      };
    
    case 'supabase':
      return {
        type: 'supabase' as const,
        config: SUPABASE_CONFIG,
        features: {
          realTime: true,
          fileUploads: true,
          auth: true,
          relations: true,
        }
      };
    
    case 'firebase':
      return {
        type: 'firebase' as const,
        config: FIREBASE_CONFIG,
        features: {
          realTime: true,
          fileUploads: true,
          auth: true,
          relations: false,
        }
      };
    
    default:
      throw new Error(`Provider no soportado: ${BACKEND_CONFIG.PROVIDER}`);
  }
};

// Exportar configuración unificada
export const CONFIG = {
  BACKEND: BACKEND_CONFIG,
  POCKETBASE: POCKETBASE_CONFIG,
  SUPABASE: SUPABASE_CONFIG,
  FIREBASE: FIREBASE_CONFIG,
  APP: APP_CONFIG,
  API: API_CONFIG,
  CACHE: CACHE_CONFIG,
  UPLOAD: UPLOAD_CONFIG,
  MATCH: MATCH_CONFIG,
  NOTIFICATION: NOTIFICATION_CONFIG,
  FEATURES: FEATURE_FLAGS,
  THEME: THEME_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
  getProviderConfig,
} as const;

export default CONFIG;