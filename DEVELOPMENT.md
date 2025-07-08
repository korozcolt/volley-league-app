# 🏐 VOLLEY LEAGUE APP - GUÍA DE DESARROLLO

## 📊 Estado Actual del Proyecto

### ✅ Completado
- ✅ Arquitectura backend agnóstica
- ✅ Sistema de autenticación completo
- ✅ Navegación principal funcional
- ✅ Providers de PocketBase implementados
- ✅ Pantallas principales con funcionalidad básica

### 🚧 En Desarrollo
- 🔄 Extracción de componentes UI embebidos
- 🔄 Implementación de pantallas de gestión
- 🔄 Providers adicionales (notificaciones, match generation)

### ❌ Pendiente
- ❌ Sistema de brackets y eliminatorias
- ❌ Scoring en tiempo real
- ❌ Dashboard administrativo avanzado
- ❌ Push notifications

## 🎯 Próximos Pasos Inmediatos

### 1. Extraer Componentes UI (Esta Semana)
Los componentes StatusBadge, TournamentCard, MatchCard, etc. están embebidos en las pantallas principales. Necesitan ser extraídos a componentes reutilizables.

**Archivos afectados:**
- `app/(tabs)/tournaments.tsx` → extraer a `components/tournament/TournamentCard.tsx`
- `app/(tabs)/matches.tsx` → extraer a `components/match/MatchCard.tsx`
- `app/(tabs)/teams.tsx` → extraer a `components/team/TeamCard.tsx`

### 2. Implementar Pantallas de Gestión
Completar las pantallas que están como stubs:

**Prioridad Alta:**
- `app/team/create.tsx` - Formulario de creación de equipos
- `app/match/[id].tsx` - Detalles y scoring de partidos
- `app/tournament/[id]/registrations.tsx` - Gestión de inscripciones

**Prioridad Media:**
- `app/player/[id].tsx` - Perfil de jugadores
- `app/admin/tournaments.tsx` - Panel administrativo

### 3. Completar Providers
Migrar lógica desde artifacts a providers especializados:

- `lib/providers/pocketbase/tournamentRegistration.ts`
- `lib/providers/pocketbase/matchGeneration.ts`
- `lib/providers/pocketbase/notifications.ts`

## 🔧 Comandos de Desarrollo

### Iniciar proyecto
```bash
npx expo start --clear
```

### Linting y formato
```bash
npm run lint
npm run format
```

### Testing (cuando esté configurado)
```bash
npm run test
npm run test:watch
```

## 📁 Estructura del Proyecto

```
app/                          # Rutas de la aplicación (Expo Router)
├── (tabs)/                   # Navegación principal
│   ├── index.tsx            # ✅ Dashboard home
│   ├── tournaments.tsx      # ✅ Lista de torneos
│   ├── teams.tsx           # ✅ Lista de equipos
│   ├── matches.tsx         # ✅ Lista de partidos
│   └── profile.tsx         # ✅ Perfil de usuario
├── tournament/
│   ├── [id].tsx            # ✅ Detalles de torneo
│   ├── create.tsx          # ✅ Crear torneo
│   └── [id]/
│       ├── teams.tsx       # 🚧 Equipos del torneo
│       ├── matches.tsx     # 🚧 Partidos del torneo
│       ├── standings.tsx   # 🚧 Tabla de posiciones
│       └── registrations.tsx # 🚧 Gestión de inscripciones
├── team/
│   ├── [id].tsx           # ✅ Detalles de equipo
│   └── create.tsx         # 🚧 Crear equipo
├── match/
│   ├── [id].tsx          # 🚧 Detalles de partido
│   └── create.tsx        # 🚧 Crear partido
├── player/
│   ├── [id].tsx          # 🚧 Perfil de jugador
│   └── create.tsx        # 🚧 Crear jugador
├── admin/
│   ├── registrations.tsx # ✅ Gestión de inscripciones
│   ├── tournaments.tsx   # 🚧 Gestión de torneos
│   ├── teams.tsx        # 🚧 Gestión de equipos
│   └── users.tsx        # 🚧 Gestión de usuarios
└── auth/
    ├── login.tsx         # ✅ Inicio de sesión
    └── register.tsx      # ✅ Registro

components/                   # Componentes reutilizables
├── ui/                      # Componentes básicos de UI
│   ├── TournamentTypeSelector.tsx # ✅ Selector de tipo
│   ├── DatePicker.tsx            # ✅ Selector de fecha
│   ├── StatusBadge.tsx           # 🚧 Badge de estado
│   ├── LoadingSpinner.tsx        # 🚧 Indicador de carga
│   └── EmptyState.tsx            # 🚧 Estado vacío
├── tournament/              # Componentes de torneos
│   ├── TournamentCard.tsx   # 🚧 Tarjeta de torneo
│   └── RegistrationManagement.tsx # ✅ Gestión de inscripciones
├── team/                    # Componentes de equipos
│   └── TeamCard.tsx        # 🚧 Tarjeta de equipo
└── match/                   # Componentes de partidos
    └── MatchCard.tsx       # 🚧 Tarjeta de partido

lib/                         # Lógica de negocio
├── providers/              # Providers backend agnósticos
│   ├── index.ts           # ✅ Factory de providers
│   ├── interfaces/        # ✅ Contratos de providers
│   └── pocketbase/        # ✅ Implementación PocketBase
└── hooks/                 # Hooks personalizados
    ├── useAuth.ts         # ✅ Hook de autenticación
    ├── useTeams.ts        # ✅ Hook de equipos
    └── useTournaments.ts  # ✅ Hook de torneos
```

## 🎯 Buenas Prácticas

### Componentes
- Usar TypeScript estricto en todos los componentes
- Extraer lógica compleja a hooks personalizados
- Mantener componentes pequeños y enfocados
- Usar props tipadas con interfaces

### Providers
- Mantener la abstracción backend agnóstica
- Manejar errores de forma consistente
- Implementar caching cuando sea apropiado
- Usar el patrón de response `{ data, error }`

### Estilo
- Usar NativeWind para styling
- Mantener consistencia con el theme dark/light
- Extraer colores y tamaños a constantes
- Usar componentes ThemedText y ThemedView

## 🐛 Debugging

### Logs importantes
```typescript
import { getProviderInfo, checkProviderHealth } from '@/lib/providers';

// Ver información del provider actual
console.log(getProviderInfo());

// Verificar salud del backend
const health = await checkProviderHealth();
console.log(health);
```

### Variables de entorno
Verificar que estén configuradas correctamente:
- `EXPO_PUBLIC_BACKEND_PROVIDER=pocketbase`
- `EXPO_PUBLIC_POCKETBASE_URL=https://back-volley.kronnos.dev`

## 📞 Contacto

Si tienes dudas sobre la implementación o encuentras problemas, consulta:
1. La documentación de Expo Router
2. La documentación de PocketBase
3. Los artifacts con implementaciones de referencia

---

**Última actualización:** Enero 2025
**Estado del proyecto:** 65% completo para MVP funcional
