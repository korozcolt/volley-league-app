// app.config.js - Con soporte para múltiples backends
const getBackendProvider = () => process.env.EXPO_PUBLIC_BACKEND_PROVIDER || 'pocketbase';
const IS_DEV = process.env.EXPO_PUBLIC_APP_ENVIRONMENT === 'development';

module.exports = ({ config }) => ({
  expo: {
    name: process.env.EXPO_PUBLIC_APP_NAME || "Volley League App",
    slug: "volley-league-app",
    version: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "volley-league",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.volleyleague.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.volleyleague.app",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "c0c709b7-9547-4512-82f9-585b6a8b4697"
      },
      
      // ⭐ Backend Provider Config
      backendProvider: getBackendProvider(),
      
      // PocketBase Config
      pocketbaseUrl: process.env.EXPO_PUBLIC_POCKETBASE_URL,
      pocketbaseHealthEndpoint: process.env.EXPO_PUBLIC_POCKETBASE_HEALTH_ENDPOINT,
      pocketbaseApiEndpoint: process.env.EXPO_PUBLIC_POCKETBASE_API_ENDPOINT,
      
      // Supabase Config
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
      
      // Firebase Config
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      
      // App Config
      appName: process.env.EXPO_PUBLIC_APP_NAME,
      appVersion: process.env.EXPO_PUBLIC_APP_VERSION,
      appEnvironment: process.env.EXPO_PUBLIC_APP_ENVIRONMENT,
      
      // API Config
      apiTimeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000'),
      maxRetries: parseInt(process.env.EXPO_PUBLIC_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.EXPO_PUBLIC_RETRY_DELAY || '1000'),
      
      // Cache Config
      cacheTtl: parseInt(process.env.EXPO_PUBLIC_CACHE_TTL || '300000'),
      authTokenKey: process.env.EXPO_PUBLIC_AUTH_TOKEN_KEY,
      userCacheKey: process.env.EXPO_PUBLIC_USER_CACHE_KEY,
      teamsCacheKey: process.env.EXPO_PUBLIC_TEAMS_CACHE_KEY,
      tournamentsCacheKey: process.env.EXPO_PUBLIC_TOURNAMENTS_CACHE_KEY,
      
      // Upload Config
      maxFileSize: parseInt(process.env.EXPO_PUBLIC_MAX_FILE_SIZE || '2097152'),
      allowedImageTypes: process.env.EXPO_PUBLIC_ALLOWED_IMAGE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/webp'],
      allowedDocumentTypes: process.env.EXPO_PUBLIC_ALLOWED_DOCUMENT_TYPES?.split(',') || ['application/pdf'],
      
      // Match Config
      defaultSetPoints: parseInt(process.env.EXPO_PUBLIC_DEFAULT_SET_POINTS || '25'),
      defaultFinalSetPoints: parseInt(process.env.EXPO_PUBLIC_DEFAULT_FINAL_SET_POINTS || '15'),
      minPointDifference: parseInt(process.env.EXPO_PUBLIC_MIN_POINT_DIFFERENCE || '2'),
      maxSetsPerMatch: parseInt(process.env.EXPO_PUBLIC_MAX_SETS_PER_MATCH || '5'),
      maxTimeoutsPerSet: parseInt(process.env.EXPO_PUBLIC_MAX_TIMEOUTS_PER_SET || '2'),
      maxSubstitutionsPerSet: parseInt(process.env.EXPO_PUBLIC_MAX_SUBSTITUTIONS_PER_SET || '6'),
      
      // Notification Config
      matchReminderHours: parseInt(process.env.EXPO_PUBLIC_MATCH_REMINDER_HOURS || '2'),
      enablePushNotifications: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
      enableEmailNotifications: process.env.EXPO_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS === 'true',
      resultNotificationDelay: parseInt(process.env.EXPO_PUBLIC_RESULT_NOTIFICATION_DELAY || '5000'),
      
      // Feature Flags
      enableRealTime: process.env.EXPO_PUBLIC_ENABLE_REAL_TIME !== 'false',
      enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
      enableDebugMode: IS_DEV || process.env.EXPO_PUBLIC_ENABLE_DEBUG_MODE === 'true',
      enableOfflineMode: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
      enableDarkMode: process.env.EXPO_PUBLIC_ENABLE_DARK_MODE !== 'false',
      enableMultiLanguage: process.env.EXPO_PUBLIC_ENABLE_MULTI_LANGUAGE === 'true',
      
      // Theme Config
      animationDuration: parseInt(process.env.EXPO_PUBLIC_ANIMATION_DURATION || '300'),
      borderRadius: parseInt(process.env.EXPO_PUBLIC_BORDER_RADIUS || '8'),
      shadowOpacity: parseFloat(process.env.EXPO_PUBLIC_SHADOW_OPACITY || '0.1'),
      hapticFeedback: process.env.EXPO_PUBLIC_HAPTIC_FEEDBACK !== 'false',
      
      // Validation Config
      minPasswordLength: parseInt(process.env.EXPO_PUBLIC_MIN_PASSWORD_LENGTH || '6'),
      maxPasswordLength: parseInt(process.env.EXPO_PUBLIC_MAX_PASSWORD_LENGTH || '128'),
      minNameLength: parseInt(process.env.EXPO_PUBLIC_MIN_NAME_LENGTH || '2'),
      maxNameLength: parseInt(process.env.EXPO_PUBLIC_MAX_NAME_LENGTH || '100'),
      minTeamNameLength: parseInt(process.env.EXPO_PUBLIC_MIN_TEAM_NAME_LENGTH || '2'),
      maxTeamNameLength: parseInt(process.env.EXPO_PUBLIC_MAX_TEAM_NAME_LENGTH || '50'),
      minTournamentNameLength: parseInt(process.env.EXPO_PUBLIC_MIN_TOURNAMENT_NAME_LENGTH || '3'),
      maxTournamentNameLength: parseInt(process.env.EXPO_PUBLIC_MAX_TOURNAMENT_NAME_LENGTH || '100'),
      maxDescriptionLength: parseInt(process.env.EXPO_PUBLIC_MAX_DESCRIPTION_LENGTH || '500'),
      maxLocationLength: parseInt(process.env.EXPO_PUBLIC_MAX_LOCATION_LENGTH || '200'),
      minJerseyNumber: parseInt(process.env.EXPO_PUBLIC_MIN_JERSEY_NUMBER || '1'),
      maxJerseyNumber: parseInt(process.env.EXPO_PUBLIC_MAX_JERSEY_NUMBER || '99'),
      minHeight: parseInt(process.env.EXPO_PUBLIC_MIN_HEIGHT || '150'),
      maxHeight: parseInt(process.env.EXPO_PUBLIC_MAX_HEIGHT || '220'),
      minAge: parseInt(process.env.EXPO_PUBLIC_MIN_AGE || '5'),
      maxAge: parseInt(process.env.EXPO_PUBLIC_MAX_AGE || '80'),
    }
  }
});