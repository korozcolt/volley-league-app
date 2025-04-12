# 🏐 Volley League App

![Banner](https://i.imgur.com/Jcvt1ER.png)

Una aplicación móvil completa para la gestión de ligas y torneos de voleibol desarrollada con React Native, Expo y Supabase.

## 📱 Características Principales

- **Gestión de Torneos**: Crea, edita y administra múltiples torneos.
- **Gestión de Equipos**: Administra equipos, jugadores y estadísticas.
- **Seguimiento de Partidos**: Programa partidos, actualiza resultados y estadísticas en tiempo real.
- **Autenticación de Usuarios**: Sistema de registro y login con roles diferenciados (admin/viewer).
- **Diseño Adaptativo**: Interfaz de usuario limpia que se adapta a los temas claro y oscuro.
- **Base de Datos en la Nube**: Toda la información se sincroniza y almacena en Supabase.

## 🚀 Estado del Proyecto

### ✅ Componentes Implementados

- **Autenticación**:
  - Sistema completo de registro e inicio de sesión
  - Gestión de roles (administrador/espectador)
  - Protección de rutas basada en autenticación

- **Navegación**:
  - Sistema de pestañas principales (Inicio, Torneos, Equipos, Partidos, Perfil)
  - Navegación entre pantallas con Expo Router

- **Pantallas Principales**:
  - Dashboard con resumen de actividad reciente
  - Listado de torneos con filtrado por estado
  - Listado de equipos con detalles básicos
  - Listado de partidos con estados y resultados
  - Perfil de usuario con opciones de configuración

- **Temas y Estilos**:
  - Soporte para temas claro y oscuro
  - Componentes estilizados con NativeWind (Tailwind para React Native)
  - Diseño responsivo para diferentes tamaños de pantalla

### 🛠️ En Desarrollo / Próximas Características

- **Detalles de Torneo**:
  - Vista detallada de torneo individual
  - Gestión de brackets para torneos de eliminación
  - Tabla de posiciones para torneos de puntos

- **Detalles de Equipos**:
  - Página detallada de equipo con lista de jugadores
  - Estadísticas de equipo por torneo
  - Historial de partidos

- **Gestión de Partidos**:
  - Formulario de creación/edición de partidos
  - Registro de sets y puntuaciones detalladas
  - Sistema de actualización de resultados en tiempo real

- **Estadísticas de Jugadores**:
  - Perfil de jugador con estadísticas acumuladas
  - Registro de estadísticas individuales por partido
  - Visualización de rendimiento por temporada/torneo

- **Notificaciones**:
  - Alertas para próximos partidos
  - Notificaciones de resultados
  - Recordatorios para administradores

## 🔧 Stack Tecnológico

- **Frontend**:
  - React Native
  - Expo SDK 52
  - TypeScript
  - NativeWind (Tailwind CSS para React Native)
  - Expo Router para navegación
  - React Native Reanimated para animaciones

- **Backend**:
  - Supabase para autenticación y base de datos
  - PostgreSQL (a través de Supabase)
  - Row Level Security (RLS) para protección de datos

## 📋 Estructura del Proyecto

```
app/
├── (auth)/             # Rutas relacionadas con autenticación
│   ├── login.tsx       # Pantalla de inicio de sesión
│   └── register.tsx    # Pantalla de registro
├── (tabs)/             # Pestañas principales de la aplicación
│   ├── index.tsx       # Dashboard principal
│   ├── tournaments.tsx # Listado de torneos
│   ├── teams.tsx       # Listado de equipos
│   ├── matches.tsx     # Listado de partidos
│   └── profile.tsx     # Perfil de usuario
├── _layout.tsx         # Layout principal
└── global.css          # Estilos globales

components/             # Componentes reutilizables
├── ThemedText.tsx
├── ThemedView.tsx
└── ...

lib/
├── context/            # Contextos de React
│   └── AuthContext.tsx # Contexto de autenticación
├── hooks/              # Hooks personalizados
│   └── useAuth.ts      # Hook para manejo de autenticación
├── supabase/           # Configuración de Supabase
│   └── index.ts        # Cliente de Supabase
└── types/              # Definición de tipos
    └── models.ts       # Interfaces y tipos de datos
```

## 🏁 Instrucciones de Inicio

1. Clona el repositorio:

   ```bash
   git clone https://github.com/yourusername/volley-league-app.git
   cd volley-league-app
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura Supabase:
   - Crea un archivo `.env` con tus credenciales de Supabase:

   ```
   EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   EXPO_PUBLIC_SUPABASE_KEY=tu_clave_de_supabase
   ```

4. Inicia el servidor de desarrollo:

   ```bash
   npx expo start
   ```

5. Abre la aplicación en tu dispositivo o emulador:
   - Escanea el código QR con la app Expo Go (Android)
   - Presiona `i` para abrir en el simulador de iOS
   - Presiona `a` para abrir en el emulador de Android
   - Presiona `w` para abrir en el navegador web

## 📊 Modelos de Datos

La aplicación utiliza los siguientes modelos principales:

- **User**: Información del usuario y roles de acceso
- **Team**: Equipos participantes con información de contacto
- **Player**: Información de jugadores y estadísticas
- **Tournament**: Torneos con diferentes tipos y estados
- **Match**: Partidos programados, resultados y estadísticas

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir:

1. Haz fork del repositorio
2. Crea una rama para tu característica: `git checkout -b feature/nueva-caracteristica`
3. Haz commit de tus cambios: `git commit -m 'Agrega nueva característica'`
4. Envía tus cambios: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

## 📝 Tareas Pendientes

- [ ] Implementar CRUD completo para torneos
- [ ] Implementar CRUD completo para equipos
- [ ] Implementar CRUD completo para partidos
- [ ] Diseñar y desarrollar pantallas de detalles (torneo, equipo, partido)
- [ ] Implementar sistema de estadísticas de jugadores
- [ ] Añadir soporte para notificaciones push
- [ ] Optimizar rendimiento para grandes conjuntos de datos
- [ ] Implementar pruebas unitarias y de integración
- [ ] Preparar versión de producción para App Store y Google Play

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo LICENSE para más detalles.

## 📱 Screenshots

![Screenshot Dashboard](https://i.imgur.com/KTIZhdm.png)
![Screenshot Tournaments](https://i.imgur.com/xCQ4dqH.png)

---

**© 2025 Volley League App**
