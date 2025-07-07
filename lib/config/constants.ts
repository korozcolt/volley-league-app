import Constants from 'expo-constants';

const getEnvVar = (key: string, defaultValue?: any) => {
  return Constants.expoConfig?.extra?.[key] ?? defaultValue;
};

const BACKEND_CONFIG = {
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

const POCKETBASE_CONFIG = {
  URL: getEnvVar('pocketbaseUrl', 'https://back-volley.kronnos.dev'),
  HEALTH_ENDPOINT: getEnvVar('pocketbaseHealthEndpoint', '/health'),
  API_ENDPOINT: getEnvVar('pocketbaseApiEndpoint', '/api/'),
  get HEALTH_URL() {
    return `${this.URL}${this.HEALTH_ENDPOINT}`;
  },
  get API_URL() {
    return `${this.URL}${this.API_ENDPOINT}`;
  },
  get IS_CONFIGURED() {
    return Boolean(this.URL);
  }
} as const;

// 📊 CONFIGURACIÓN DE SUPABASE - Sin cambios
const SUPABASE_CONFIG = {
  URL: getEnvVar('supabaseUrl', ''),
  KEY: getEnvVar('supabaseKey', ''),
  get IS_CONFIGURED() {
    return Boolean(this.URL && this.KEY);
  }
} as const;

// 🔥 CONFIGURACIÓN DE FIREBASE - Sin cambios
const FIREBASE_CONFIG = {
  PROJECT_ID: getEnvVar('firebaseProjectId', ''),
  API_KEY: getEnvVar('firebaseApiKey', ''),
  AUTH_DOMAIN: getEnvVar('firebaseAuthDomain', ''),
  get IS_CONFIGURED() {
    return Boolean(this.PROJECT_ID && this.API_KEY);
  }
} as const;

// 📱 CONFIGURACIÓN DE LA APP - Sin cambios
const APP_CONFIG = {
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

const API_CONFIG = {
  TIMEOUT: getEnvVar('apiTimeout', 10000),
  MAX_RETRIES: getEnvVar('maxRetries', 3),
  RETRY_DELAY: getEnvVar('retryDelay', 1000),
  REQUEST_DELAY: getEnvVar('requestDelay', 100),
  get TIMEOUT_SECONDS() {
    return Math.round(this.TIMEOUT / 1000);
  }
} as const;

const CACHE_CONFIG = {
  TTL: getEnvVar('cacheTtl', 300000), // 5 minutos
  AUTH_TOKEN_KEY: getEnvVar('authTokenKey', 'auth_token'),
  USER_CACHE_KEY: getEnvVar('userCacheKey', 'user_cache'),
  TEAMS_CACHE_KEY: getEnvVar('teamsCacheKey', 'teams_cache'),
  TOURNAMENTS_CACHE_KEY: getEnvVar('tournamentsCacheKey', 'tournaments_cache'),
  MATCHES_CACHE_KEY: getEnvVar('matchesCacheKey', 'matches_cache'),
  PLAYERS_CACHE_KEY: getEnvVar('playersCacheKey', 'players_cache'),
  get TTL_MINUTES() {
    return Math.round(this.TTL / 60000);
  }
} as const;

const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: getEnvVar('maxFileSize', 2097152), // 2MB
  ALLOWED_IMAGE_TYPES: getEnvVar('allowedImageTypes', ['image/jpeg', 'image/png', 'image/webp']),
  ALLOWED_DOCUMENT_TYPES: getEnvVar('allowedDocumentTypes', ['application/pdf', 'application/msword']),
  LOGO_MAX_SIZE: getEnvVar('logoMaxSize', 1048576), // 1MB
  get MAX_FILE_SIZE_MB() {
    return Math.round(this.MAX_FILE_SIZE / 1024 / 1024);
  },
  get LOGO_MAX_SIZE_MB() {
    return Math.round(this.LOGO_MAX_SIZE / 1024 / 1024);
  }
} as const;

// 🏐 CONFIGURACIÓN DE VOLEIBOL - Sin cambios
const VOLLEYBALL_CONFIG = {
  DEFAULT_SET_POINTS: getEnvVar('defaultSetPoints', 25),
  DEFAULT_FINAL_SET_POINTS: getEnvVar('defaultFinalSetPoints', 15),
  MIN_POINT_DIFFERENCE: getEnvVar('minPointDifference', 2),
  MAX_SETS_PER_MATCH: getEnvVar('maxSetsPerMatch', 5),
  MAX_TIMEOUTS_PER_SET: getEnvVar('maxTimeoutsPerSet', 2),
  MAX_SUBSTITUTIONS_PER_SET: getEnvVar('maxSubstitutionsPerSet', 6),
  ROTATION_POSITIONS: 6,
  PLAYERS_ON_COURT: 6,
  MAX_PLAYERS_PER_TEAM: getEnvVar('maxPlayersPerTeam', 14),
  get SETS_TO_WIN() {
    return Math.ceil(this.MAX_SETS_PER_MATCH / 2);
  },
  get MIN_PLAYERS_PER_TEAM() {
    return this.PLAYERS_ON_COURT;
  }
} as const;

const NOTIFICATION_CONFIG = {
  ENABLED: getEnvVar('notificationsEnabled', true),
  MATCH_REMINDER_HOURS: getEnvVar('matchReminderHours', 2),
  SCORE_UPDATE_ENABLED: getEnvVar('scoreUpdateEnabled', true),
  TOURNAMENT_UPDATES_ENABLED: getEnvVar('tournamentUpdatesEnabled', true),
} as const;

const UI_CONFIG = {
  ANIMATION_DURATION: getEnvVar('animationDuration', 300),
  REFRESH_THRESHOLD: getEnvVar('refreshThreshold', 80),
  DEBOUNCE_DELAY: getEnvVar('debounceDelay', 300),
  PAGINATION_SIZE: getEnvVar('paginationSize', 20),
  MAX_SEARCH_RESULTS: getEnvVar('maxSearchResults', 50),
} as const;

// 🔐 CONFIGURACIÓN DE SEGURIDAD - Sin cambios
const SECURITY_CONFIG = {
  SESSION_TIMEOUT: getEnvVar('sessionTimeout', 86400000), // 24 horas
  PASSWORD_MIN_LENGTH: getEnvVar('passwordMinLength', 8),
  MAX_LOGIN_ATTEMPTS: getEnvVar('maxLoginAttempts', 5),
  LOCKOUT_DURATION: getEnvVar('lockoutDuration', 900000), // 15 minutos
  get SESSION_TIMEOUT_HOURS() {
    return Math.round(this.SESSION_TIMEOUT / 3600000);
  },
  get LOCKOUT_DURATION_MINUTES() {
    return Math.round(this.LOCKOUT_DURATION / 60000);
  }
} as const;

export const CONFIG = {
  BACKEND: BACKEND_CONFIG,        // ✅ Ahora CONFIG.BACKEND.PROVIDER funciona
  POCKETBASE: POCKETBASE_CONFIG,
  SUPABASE: SUPABASE_CONFIG,
  FIREBASE: FIREBASE_CONFIG,
  APP: APP_CONFIG,
  API: API_CONFIG,
  CACHE: CACHE_CONFIG,
  UPLOAD: UPLOAD_CONFIG,
  VOLLEYBALL: VOLLEYBALL_CONFIG,
  NOTIFICATION: NOTIFICATION_CONFIG,
  UI: UI_CONFIG,
  SECURITY: SECURITY_CONFIG,
} as const;

export { BACKEND_CONFIG, POCKETBASE_CONFIG, SUPABASE_CONFIG, FIREBASE_CONFIG, APP_CONFIG, API_CONFIG, CACHE_CONFIG, UPLOAD_CONFIG, VOLLEYBALL_CONFIG, NOTIFICATION_CONFIG, UI_CONFIG, SECURITY_CONFIG };

export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!CONFIG.BACKEND.PROVIDER) {
    errors.push('BACKEND_PROVIDER no está configurado');
  }

  switch (CONFIG.BACKEND.PROVIDER) {
    case 'pocketbase':
      if (!CONFIG.POCKETBASE.IS_CONFIGURED) {
        errors.push('PocketBase URL no está configurada');
      }
      break;
    case 'supabase':
      if (!CONFIG.SUPABASE.IS_CONFIGURED) {
        errors.push('Supabase URL o KEY no están configuradas');
      }
      break;
    case 'firebase':
      if (!CONFIG.FIREBASE.IS_CONFIGURED) {
        errors.push('Firebase PROJECT_ID o API_KEY no están configuradas');
      }
      break;
  }

  if (CONFIG.API.TIMEOUT < 1000) {
    errors.push('API timeout debe ser al menos 1000ms');
  }

  if (CONFIG.UPLOAD.MAX_FILE_SIZE < 100000) {
    errors.push('Max file size debe ser al menos 100KB');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const getBackendConfig = () => {
  switch (CONFIG.BACKEND.PROVIDER) {
    case 'pocketbase':
      return CONFIG.POCKETBASE;
    case 'supabase':
      return CONFIG.SUPABASE;
    case 'firebase':
      return CONFIG.FIREBASE;
    default:
      throw new Error(`Backend no soportado: ${CONFIG.BACKEND.PROVIDER}`);
  }
};

export const isBackendConfigured = (): boolean => {
  const backendConfig = getBackendConfig();
  return (backendConfig as any).IS_CONFIGURED ?? false;
};

export const getConfigInfo = () => {
  const validation = validateConfig();
  
  return {
    app: {
      name: CONFIG.APP.NAME,
      version: CONFIG.APP.VERSION,
      environment: CONFIG.APP.ENVIRONMENT
    },
    backend: {
      provider: CONFIG.BACKEND.PROVIDER,
      configured: isBackendConfigured()
    },
    validation,
    isDevelopment: CONFIG.APP.IS_DEVELOPMENT,
    isProduction: CONFIG.APP.IS_PRODUCTION
  };
};

if (__DEV__) {
  const configInfo = getConfigInfo();
  console.log('🔧 App Configuration:', configInfo);
  
  if (!configInfo.validation.valid) {
    console.warn('⚠️ Configuration errors:', configInfo.validation.errors);
  }
}