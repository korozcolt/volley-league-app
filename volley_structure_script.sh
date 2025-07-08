#!/bin/bash

# 🏐 VOLLEY LEAGUE APP - SCRIPT DE ESTRUCTURA
# Basado en auditoría completa - Solo crea archivos/carpetas REALMENTE faltantes
# Fecha: Enero 2025
# Desarrollador: Senior JS/PHP Developer

set -e  # Salir si hay errores

# 🎨 Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 📝 Función de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 🔍 Verificar que estamos en un proyecto React Native/Expo
check_project_structure() {
    log_info "Verificando estructura del proyecto..."
    
    if [[ ! -f "package.json" ]]; then
        log_error "No se encontró package.json. ¿Estás en la raíz del proyecto?"
        exit 1
    fi
    
    if [[ ! -d "app" ]]; then
        log_error "No se encontró el directorio 'app'. ¿Es un proyecto Expo Router?"
        exit 1
    fi
    
    log_success "Estructura del proyecto validada ✅"
}

# 📁 Crear directorios faltantes
create_missing_directories() {
    log_info "Creando directorios faltantes..."
    
    # Directorios de rutas de app
    mkdir -p app/player
    mkdir -p app/match
    mkdir -p app/team/[id]
    mkdir -p app/tournament/[id]
    mkdir -p app/admin
    
    # Directorios de componentes (para extraer lógica embebida)
    mkdir -p components/ui
    mkdir -p components/tournament
    mkdir -p components/team
    mkdir -p components/match
    mkdir -p components/player
    
    # Directorios de providers faltantes
    mkdir -p lib/providers/interfaces
    mkdir -p lib/providers/pocketbase
    
    log_success "Directorios creados ✅"
}

# 📄 Crear archivos de rutas faltantes
create_missing_route_files() {
    log_info "Creando archivos de rutas faltantes..."
    
    # 🏐 RUTAS DE EQUIPOS
    if [[ ! -f "app/team/create.tsx" ]]; then
        cat > app/team/create.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar formulario de creación de equipos
// Referencia: Usar TeamRegistration component cuando esté extraído

export default function CreateTeamScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Crear Equipo</ThemedText>
      <ThemedText>TODO: Implementar formulario de creación</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/team/create.tsx"
    else
        log_warning "app/team/create.tsx ya existe"
    fi

    # 🏐 RUTAS DE PARTIDOS
    if [[ ! -f "app/match/[id].tsx" ]]; then
        cat > app/match/[id].tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar detalles de partido con scoring
// Referencia: Usar MatchScoring component cuando esté extraído

export default function MatchDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Partido #{id}</ThemedText>
      <ThemedText>TODO: Implementar detalles y scoring del partido</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/match/[id].tsx"
    else
        log_warning "app/match/[id].tsx ya existe"
    fi

    if [[ ! -f "app/match/create.tsx" ]]; then
        cat > app/match/create.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar formulario de creación de partidos
// Incluir selección de equipos, fecha, hora, ubicación

export default function CreateMatchScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Crear Partido</ThemedText>
      <ThemedText>TODO: Implementar formulario de creación</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/match/create.tsx"
    else
        log_warning "app/match/create.tsx ya existe"
    fi

    # 🏐 RUTAS DE JUGADORES
    if [[ ! -f "app/player/[id].tsx" ]]; then
        cat > app/player/[id].tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar perfil de jugador con estadísticas
// Referencia: Usar PlayerStats component cuando esté extraído

export default function PlayerDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Jugador #{id}</ThemedText>
      <ThemedText>TODO: Implementar perfil y estadísticas del jugador</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/player/[id].tsx"
    else
        log_warning "app/player/[id].tsx ya existe"
    fi

    if [[ ! -f "app/player/create.tsx" ]]; then
        cat > app/player/create.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar formulario de registro de jugadores
// Incluir campos: nombre, posición, número, equipo

export default function CreatePlayerScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Registrar Jugador</ThemedText>
      <ThemedText>TODO: Implementar formulario de registro</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/player/create.tsx"
    else
        log_warning "app/player/create.tsx ya existe"
    fi

    # 🏐 RUTAS DE TORNEO - SUB PANTALLAS
    if [[ ! -f "app/tournament/[id]/teams.tsx" ]]; then
        cat > app/tournament/[id]/teams.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar lista de equipos del torneo
// Incluir opciones de inscripción/desinscripción para admins

export default function TournamentTeamsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Equipos del Torneo</ThemedText>
      <ThemedText>TODO: Implementar gestión de equipos del torneo #{id}</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/tournament/[id]/teams.tsx"
    else
        log_warning "app/tournament/[id]/teams.tsx ya existe"
    fi

    if [[ ! -f "app/tournament/[id]/matches.tsx" ]]; then
        cat > app/tournament/[id]/matches.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar vista de partidos del torneo
// Incluir calendario, resultados, brackets

export default function TournamentMatchesScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Partidos del Torneo</ThemedText>
      <ThemedText>TODO: Implementar vista de partidos del torneo #{id}</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/tournament/[id]/matches.tsx"
    else
        log_warning "app/tournament/[id]/matches.tsx ya existe"
    fi

    if [[ ! -f "app/tournament/[id]/standings.tsx" ]]; then
        cat > app/tournament/[id]/standings.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar tabla de posiciones del torneo
// Mostrar puntos, victorias, derrotas, sets

export default function TournamentStandingsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Tabla de Posiciones</ThemedText>
      <ThemedText>TODO: Implementar tabla de posiciones del torneo #{id}</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/tournament/[id]/standings.tsx"
    else
        log_warning "app/tournament/[id]/standings.tsx ya existe"
    fi

    if [[ ! -f "app/tournament/[id]/registrations.tsx" ]]; then
        cat > app/tournament/[id]/registrations.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar gestión de inscripciones del torneo
// NOTA: Lógica ya implementada en artifacts - extraer aquí

export default function TournamentRegistrationsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Inscripciones del Torneo</ThemedText>
      <ThemedText>TODO: Extraer RegistrationManagement component aquí</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/tournament/[id]/registrations.tsx"
    else
        log_warning "app/tournament/[id]/registrations.tsx ya existe"
    fi

    # 🏐 RUTAS DE ADMIN
    if [[ ! -f "app/admin/tournaments.tsx" ]]; then
        cat > app/admin/tournaments.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar panel administrativo de torneos
// Crear, editar, eliminar, generar partidos

export default function AdminTournamentsScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Gestión de Torneos</ThemedText>
      <ThemedText>TODO: Implementar panel administrativo de torneos</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/admin/tournaments.tsx"
    else
        log_warning "app/admin/tournaments.tsx ya existe"
    fi

    if [[ ! -f "app/admin/teams.tsx" ]]; then
        cat > app/admin/teams.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar panel administrativo de equipos
// Crear, editar, eliminar, activar/desactivar

export default function AdminTeamsScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Gestión de Equipos</ThemedText>
      <ThemedText>TODO: Implementar panel administrativo de equipos</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/admin/teams.tsx"
    else
        log_warning "app/admin/teams.tsx ya existe"
    fi

    if [[ ! -f "app/admin/users.tsx" ]]; then
        cat > app/admin/users.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// TODO: Implementar panel administrativo de usuarios
// Gestionar roles, permisos, activar/desactivar

export default function AdminUsersScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Gestión de Usuarios</ThemedText>
      <ThemedText>TODO: Implementar panel administrativo de usuarios</ThemedText>
    </ThemedView>
  );
}
EOF
        log_success "Creado app/admin/users.tsx"
    else
        log_warning "app/admin/users.tsx ya existe"
    fi
}

# 🔧 Crear interfaces de providers faltantes
create_missing_provider_interfaces() {
    log_info "Creando interfaces de providers faltantes..."
    
    # Interface de Tournament Registration Provider
    if [[ ! -f "lib/providers/interfaces/ITournamentRegistrationProvider.ts" ]]; then
        cat > lib/providers/interfaces/ITournamentRegistrationProvider.ts << 'EOF'
export interface ITournamentRegistrationProvider {
  // Gestión de inscripciones
  registerTeam(tournamentId: string, teamId: string): Promise<{ data: any; error: string | null }>;
  unregisterTeam(tournamentId: string, teamId: string): Promise<{ data: any; error: string | null }>;
  
  // Consultas
  getRegistrations(tournamentId: string): Promise<{ data: any[]; error: string | null }>;
  isTeamRegistered(tournamentId: string, teamId: string): Promise<{ data: boolean; error: string | null }>;
  
  // Validaciones
  canRegisterTeam(tournamentId: string, teamId: string): Promise<{ data: boolean; error: string | null; reason?: string }>;
  
  // Estadísticas
  getRegistrationStats(tournamentId: string): Promise<{ 
    data: { 
      total: number; 
      pending: number; 
      approved: number; 
      rejected: number; 
    }; 
    error: string | null; 
  }>;
}
EOF
        log_success "Creado ITournamentRegistrationProvider.ts"
    else
        log_warning "ITournamentRegistrationProvider.ts ya existe"
    fi

    # Interface de Match Generation Provider
    if [[ ! -f "lib/providers/interfaces/IMatchGenerationProvider.ts" ]]; then
        cat > lib/providers/interfaces/IMatchGenerationProvider.ts << 'EOF'
export interface IMatchGenerationProvider {
  // Generación de partidos
  generateMatches(tournamentId: string, options: GenerationOptions): Promise<{ data: any[]; error: string | null }>;
  regenerateMatches(tournamentId: string, options: GenerationOptions): Promise<{ data: any[]; error: string | null }>;
  
  // Validaciones
  canGenerateMatches(tournamentId: string): Promise<{ data: boolean; error: string | null; reason?: string }>;
  
  // Configuración
  getGenerationOptions(tournamentId: string): Promise<{ data: GenerationOptions; error: string | null }>;
  updateGenerationOptions(tournamentId: string, options: Partial<GenerationOptions>): Promise<{ data: any; error: string | null }>;
}

export interface GenerationOptions {
  type: 'round_robin' | 'elimination' | 'double_elimination' | 'swiss';
  startDate?: string;
  endDate?: string;
  venueIds?: string[];
  timeSlots?: string[];
  restDaysBetweenMatches?: number;
  randomizeOrder?: boolean;
}
EOF
        log_success "Creado IMatchGenerationProvider.ts"
    else
        log_warning "IMatchGenerationProvider.ts ya existe"
    fi

    # Interface de Notification Provider
    if [[ ! -f "lib/providers/interfaces/INotificationProvider.ts" ]]; then
        cat > lib/providers/interfaces/INotificationProvider.ts << 'EOF'
export interface INotificationProvider {
  // Envío de notificaciones
  sendNotification(notification: NotificationData): Promise<{ data: any; error: string | null }>;
  sendBulkNotifications(notifications: NotificationData[]): Promise<{ data: any[]; error: string | null }>;
  
  // Gestión de usuarios
  subscribeUser(userId: string, topics: string[]): Promise<{ data: any; error: string | null }>;
  unsubscribeUser(userId: string, topics: string[]): Promise<{ data: any; error: string | null }>;
  
  // Plantillas
  createTemplate(template: NotificationTemplate): Promise<{ data: any; error: string | null }>;
  getTemplates(): Promise<{ data: NotificationTemplate[]; error: string | null }>;
  
  // Historial
  getNotificationHistory(userId: string, limit?: number): Promise<{ data: any[]; error: string | null }>;
}

export interface NotificationData {
  title: string;
  body: string;
  recipients: string[];
  type: 'match_reminder' | 'tournament_update' | 'team_invitation' | 'general';
  data?: Record<string, any>;
  scheduledFor?: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  variables: string[];
}
EOF
        log_success "Creado INotificationProvider.ts"
    else
        log_warning "INotificationProvider.ts ya existe"
    fi
}

# 🏗️ Crear implementaciones base de providers faltantes
create_missing_provider_implementations() {
    log_info "Creando implementaciones base de providers faltantes..."
    
    # Tournament Registration Provider para PocketBase
    if [[ ! -f "lib/providers/pocketbase/tournamentRegistration.ts" ]]; then
        cat > lib/providers/pocketbase/tournamentRegistration.ts << 'EOF'
import PocketBase from 'pocketbase';
import { ITournamentRegistrationProvider } from '../interfaces/ITournamentRegistrationProvider';

export class PocketBaseTournamentRegistrationProvider implements ITournamentRegistrationProvider {
  constructor(private pb: PocketBase) {}

  async registerTeam(tournamentId: string, teamId: string) {
    try {
      // TODO: Implementar lógica de inscripción
      // Referencia: Ya hay lógica en artifacts - migrar aquí
      const data = await this.pb.collection('tournament_registrations').create({
        tournament: tournamentId,
        team: teamId,
        status: 'pending',
        registered_at: new Date().toISOString()
      });
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async unregisterTeam(tournamentId: string, teamId: string) {
    try {
      // TODO: Implementar lógica de desinscripción
      const records = await this.pb.collection('tournament_registrations').getList(1, 1, {
        filter: `tournament = "${tournamentId}" && team = "${teamId}"`
      });
      
      if (records.items.length > 0) {
        await this.pb.collection('tournament_registrations').delete(records.items[0].id);
      }
      
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async getRegistrations(tournamentId: string) {
    try {
      const records = await this.pb.collection('tournament_registrations').getList(1, 50, {
        filter: `tournament = "${tournamentId}"`,
        expand: 'team'
      });
      
      return { data: records.items, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  async isTeamRegistered(tournamentId: string, teamId: string) {
    try {
      const records = await this.pb.collection('tournament_registrations').getList(1, 1, {
        filter: `tournament = "${tournamentId}" && team = "${teamId}"`
      });
      
      return { data: records.items.length > 0, error: null };
    } catch (error: any) {
      return { data: false, error: error.message };
    }
  }

  async canRegisterTeam(tournamentId: string, teamId: string) {
    try {
      // TODO: Implementar validaciones de inscripción
      // - Torneo abierto para inscripciones
      // - Equipo no ya inscrito
      // - Límite de equipos no alcanzado
      
      return { data: true, error: null };
    } catch (error: any) {
      return { data: false, error: error.message };
    }
  }

  async getRegistrationStats(tournamentId: string) {
    try {
      const records = await this.pb.collection('tournament_registrations').getList(1, 200, {
        filter: `tournament = "${tournamentId}"`
      });
      
      const stats = {
        total: records.items.length,
        pending: records.items.filter(r => r.status === 'pending').length,
        approved: records.items.filter(r => r.status === 'approved').length,
        rejected: records.items.filter(r => r.status === 'rejected').length,
      };
      
      return { data: stats, error: null };
    } catch (error: any) {
      return { data: { total: 0, pending: 0, approved: 0, rejected: 0 }, error: error.message };
    }
  }
}
EOF
        log_success "Creado tournamentRegistration.ts"
    else
        log_warning "tournamentRegistration.ts ya existe"
    fi

    # Match Generation Provider para PocketBase  
    if [[ ! -f "lib/providers/pocketbase/matchGeneration.ts" ]]; then
        cat > lib/providers/pocketbase/matchGeneration.ts << 'EOF'
import PocketBase from 'pocketbase';
import { IMatchGenerationProvider, GenerationOptions } from '../interfaces/IMatchGenerationProvider';

export class PocketBaseMatchGenerationProvider implements IMatchGenerationProvider {
  constructor(private pb: PocketBase) {}

  async generateMatches(tournamentId: string, options: GenerationOptions) {
    try {
      // TODO: Implementar generación de partidos
      // Referencia: TournamentMatchGenerator ya implementado en artifacts - migrar aquí
      
      // 1. Obtener equipos inscritos
      const registrations = await this.pb.collection('tournament_registrations').getList(1, 50, {
        filter: `tournament = "${tournamentId}" && status = "approved"`,
        expand: 'team'
      });
      
      const teams = registrations.items.map(r => r.expand?.team);
      
      if (teams.length < 2) {
        return { data: [], error: 'Se necesitan al menos 2 equipos para generar partidos' };
      }
      
      // 2. Generar partidos según tipo
      let matches: any[] = [];
      
      switch (options.type) {
        case 'round_robin':
          matches = this.generateRoundRobinMatches(teams, tournamentId, options);
          break;
        case 'elimination':
          matches = this.generateEliminationMatches(teams, tournamentId, options);
          break;
        default:
          return { data: [], error: `Tipo de torneo ${options.type} no implementado aún` };
      }
      
      // 3. Crear partidos en la base de datos
      const createdMatches = [];
      for (const match of matches) {
        const created = await this.pb.collection('matches').create(match);
        createdMatches.push(created);
      }
      
      return { data: createdMatches, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  async regenerateMatches(tournamentId: string, options: GenerationOptions) {
    try {
      // TODO: Implementar regeneración de partidos
      // 1. Eliminar partidos existentes que no hayan iniciado
      // 2. Generar nuevos partidos
      
      return await this.generateMatches(tournamentId, options);
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  async canGenerateMatches(tournamentId: string) {
    try {
      // TODO: Implementar validaciones
      // - Torneo en estado correcto
      // - Suficientes equipos inscritos
      // - No hay partidos ya iniciados
      
      return { data: true, error: null };
    } catch (error: any) {
      return { data: false, error: error.message };
    }
  }

  async getGenerationOptions(tournamentId: string) {
    try {
      // TODO: Obtener opciones desde configuración del torneo
      const tournament = await this.pb.collection('tournaments').getOne(tournamentId);
      
      const options: GenerationOptions = {
        type: tournament.type || 'round_robin',
        startDate: tournament.start_date,
        endDate: tournament.end_date,
        randomizeOrder: true
      };
      
      return { data: options, error: null };
    } catch (error: any) {
      return { data: { type: 'round_robin' } as GenerationOptions, error: error.message };
    }
  }

  async updateGenerationOptions(tournamentId: string, options: Partial<GenerationOptions>) {
    try {
      // TODO: Actualizar opciones en la configuración del torneo
      await this.pb.collection('tournaments').update(tournamentId, {
        type: options.type,
        // ... otras opciones
      });
      
      return { data: options, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Métodos auxiliares privados
  private generateRoundRobinMatches(teams: any[], tournamentId: string, options: GenerationOptions): any[] {
    const matches: any[] = [];
    let matchNumber = 1;
    
    // Round Robin: cada equipo juega contra todos los demás
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          tournament: tournamentId,
          home_team: teams[i].id,
          away_team: teams[j].id,
          status: 'scheduled',
          round: 1, // TODO: Calcular rondas apropiadamente
          match_number: matchNumber++,
          match_date: options.startDate || new Date().toISOString(),
        });
      }
    }
    
    return matches;
  }
  
  private generateEliminationMatches(teams: any[], tournamentId: string, options: GenerationOptions): any[] {
    // TODO: Implementar eliminación directa
    // Por ahora retornar Round Robin como fallback
    return this.generateRoundRobinMatches(teams, tournamentId, options);
  }
}
EOF
        log_success "Creado matchGeneration.ts"
    else
        log_warning "matchGeneration.ts ya existe"
    fi

    # Notification Provider para PocketBase (básico)
    if [[ ! -f "lib/providers/pocketbase/notifications.ts" ]]; then
        cat > lib/providers/pocketbase/notifications.ts << 'EOF'
import PocketBase from 'pocketbase';
import { INotificationProvider, NotificationData, NotificationTemplate } from '../interfaces/INotificationProvider';

export class PocketBaseNotificationProvider implements INotificationProvider {
  constructor(private pb: PocketBase) {}

  async sendNotification(notification: NotificationData) {
    try {
      // TODO: Implementar envío de notificaciones
      // Por ahora solo guardar en base de datos como log
      const data = await this.pb.collection('notifications').create({
        title: notification.title,
        body: notification.body,
        recipients: notification.recipients,
        type: notification.type,
        data: notification.data || {},
        sent_at: new Date().toISOString(),
        status: 'sent'
      });
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async sendBulkNotifications(notifications: NotificationData[]) {
    try {
      const results = [];
      for (const notification of notifications) {
        const result = await this.sendNotification(notification);
        results.push(result.data);
      }
      
      return { data: results, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  async subscribeUser(userId: string, topics: string[]) {
    try {
      // TODO: Implementar suscripciones
      const data = await this.pb.collection('user_subscriptions').create({
        user: userId,
        topics: topics,
        subscribed_at: new Date().toISOString()
      });
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async unsubscribeUser(userId: string, topics: string[]) {
    try {
      // TODO: Implementar desuscripciones
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async createTemplate(template: NotificationTemplate) {
    try {
      const data = await this.pb.collection('notification_templates').create(template);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  async getTemplates() {
    try {
      const records = await this.pb.collection('notification_templates').getList(1, 50);
      return { data: records.items, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  async getNotificationHistory(userId: string, limit = 20) {
    try {
      const records = await this.pb.collection('notifications').getList(1, limit, {
        filter: `recipients ~ "${userId}"`,
        sort: '-sent_at'
      });
      
      return { data: records.items, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }
}
EOF
        log_success "Creado notifications.ts"
    else
        log_warning "notifications.ts ya existe"
    fi
}

# 🎨 Crear stubs de componentes UI para extraer lógica embebida
create_ui_component_stubs() {
    log_info "Creando stubs de componentes UI para extraer lógica embebida..."
    
    # StatusBadge Component (extraído de tournaments.tsx)
    if [[ ! -f "components/ui/StatusBadge.tsx" ]]; then
        cat > components/ui/StatusBadge.tsx << 'EOF'
import React from 'react';
import { View, Text } from 'react-native';

interface StatusBadgeProps {
  status: string;
  variant?: 'tournament' | 'match' | 'team' | 'default';
}

// TODO: Extraer lógica de StatusBadge desde tournaments.tsx y matches.tsx
// Unificar estilos y colores de status en un componente reutilizable

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const getStatusColor = (status: string, variant: string) => {
    // TODO: Implementar lógica de colores por status y variant
    switch (status) {
      case 'active':
      case 'in_progress':
        return '#4CAF50';
      case 'upcoming':
      case 'scheduled':
        return '#FF9800';
      case 'completed':
      case 'finished':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  };

  const getStatusText = (status: string) => {
    // TODO: Extraer mapeo de status desde pantallas existentes
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View 
      style={{
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: getStatusColor(status, variant)
      }}
    >
      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
        {getStatusText(status)}
      </Text>
    </View>
  );
}
EOF
        log_success "Creado StatusBadge.tsx stub"
    else
        log_warning "StatusBadge.tsx ya existe"
    fi

    # LoadingSpinner Component
    if [[ ! -f "components/ui/LoadingSpinner.tsx" ]]; then
        cat > components/ui/LoadingSpinner.tsx << 'EOF'
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  centered?: boolean;
}

// TODO: Extraer lógica de loading desde pantallas existentes
// Unificar estilos de loading en toda la app

export function LoadingSpinner({ 
  size = 'large', 
  text = 'Cargando...', 
  centered = true 
}: LoadingSpinnerProps) {
  const colorScheme = useColorScheme();

  const containerStyle = centered ? {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  } : {};

  return (
    <View style={containerStyle}>
      <ActivityIndicator 
        size={size} 
        color={Colors[colorScheme ?? 'light'].tint} 
      />
      {text && (
        <Text style={{ 
          marginTop: 16, 
          opacity: 0.7,
          color: Colors[colorScheme ?? 'light'].text 
        }}>
          {text}
        </Text>
      )}
    </View>
  );
}
EOF
        log_success "Creado LoadingSpinner.tsx stub"
    else
        log_warning "LoadingSpinner.tsx ya existe"
    fi

    # EmptyState Component
    if [[ ! -f "components/ui/EmptyState.tsx" ]]; then
        cat > components/ui/EmptyState.tsx << 'EOF'
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}

// TODO: Extraer lógica de empty states desde pantallas existentes
// Unificar estilos de estados vacíos en toda la app

export function EmptyState({ 
  icon = '📭', 
  title, 
  subtitle, 
  actionText, 
  onAction 
}: EmptyStateProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>
        {icon}
      </Text>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: Colors[colorScheme ?? 'light'].text
      }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{
          fontSize: 14,
          opacity: 0.7,
          marginBottom: 24,
          textAlign: 'center',
          color: Colors[colorScheme ?? 'light'].text
        }}>
          {subtitle}
        </Text>
      )}
      {actionText && onAction && (
        <TouchableOpacity
          style={{
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
          }}
          onPress={onAction}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
EOF
        log_success "Creado EmptyState.tsx stub"
    else
        log_warning "EmptyState.tsx ya existe"
    fi

    # TournamentCard Component (extraer de tournaments.tsx)
    if [[ ! -f "components/tournament/TournamentCard.tsx" ]]; then
        cat > components/tournament/TournamentCard.tsx << 'EOF'
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface TournamentCardProps {
  tournament: any; // TODO: Tipar apropiadamente
  onPress: () => void;
}

// TODO: Extraer lógica completa de renderTournamentItem desde tournaments.tsx
// Incluir todos los estilos y funcionalidad

export function TournamentCard({ tournament, onPress }: TournamentCardProps) {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: Colors[colorScheme ?? 'light'].card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={onPress}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          flex: 1,
          marginRight: 8,
          color: Colors[colorScheme ?? 'light'].text
        }}>
          {tournament.name}
        </Text>
        <StatusBadge status={tournament.status} variant="tournament" />
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>
          Fechas: {tournament.start_date} - {tournament.end_date}
        </Text>
        {tournament.location && (
          <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>
            Ubicación: {tournament.location}
          </Text>
        )}
        {tournament.description && (
          <Text 
            numberOfLines={2} 
            style={{ 
              opacity: 0.7, 
              marginTop: 8, 
              fontStyle: 'italic',
              color: Colors[colorScheme ?? 'light'].text
            }}
          >
            {tournament.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
EOF
        log_success "Creado TournamentCard.tsx stub"
    else
        log_warning "TournamentCard.tsx ya existe"
    fi

    # MatchCard Component (extraer de matches.tsx)
    if [[ ! -f "components/match/MatchCard.tsx" ]]; then
        cat > components/match/MatchCard.tsx << 'EOF'
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface MatchCardProps {
  match: any; // TODO: Tipar apropiadamente
  onPress: () => void;
}

// TODO: Extraer lógica completa de renderMatchItem desde matches.tsx
// Incluir todos los estilos y funcionalidad de scoring

export function MatchCard({ match, onPress }: MatchCardProps) {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: Colors[colorScheme ?? 'light'].card,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
      onPress={onPress}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: Colors[colorScheme ?? 'light'].text
        }}>
          {match.home_team?.name || 'Equipo Local'} vs {match.away_team?.name || 'Equipo Visitante'}
        </Text>
        <StatusBadge status={match.status} variant="match" />
      </View>

      <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>
        Fecha: {new Date(match.match_date).toLocaleDateString()}
      </Text>
      
      {match.location && (
        <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>
          Ubicación: {match.location}
        </Text>
      )}

      {/* TODO: Agregar scoring info cuando esté disponible */}
    </TouchableOpacity>
  );
}
EOF
        log_success "Creado MatchCard.tsx stub"
    else
        log_warning "MatchCard.tsx ya existe"
    fi

    # TeamCard Component (extraer de teams.tsx)
    if [[ ! -f "components/team/TeamCard.tsx" ]]; then
        cat > components/team/TeamCard.tsx << 'EOF'
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface TeamCardProps {
  team: any; // TODO: Tipar apropiadamente
  onPress: () => void;
}

// TODO: Extraer lógica completa de renderTeamItem desde teams.tsx
// Incluir logo, estadísticas, etc.

export function TeamCard({ team, onPress }: TeamCardProps) {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: Colors[colorScheme ?? 'light'].card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={onPress}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        {team.logo && (
          <Image 
            source={{ uri: team.logo }} 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 20, 
              marginRight: 12 
            }} 
          />
        )}
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: Colors[colorScheme ?? 'light'].text
          }}>
            {team.name}
          </Text>
          {team.coach && (
            <Text style={{ 
              opacity: 0.7,
              color: Colors[colorScheme ?? 'light'].text
            }}>
              DT: {team.coach}
            </Text>
          )}
        </View>
        <StatusBadge 
          status={team.is_active ? 'active' : 'inactive'} 
          variant="team" 
        />
      </View>

      {team.description && (
        <Text 
          numberOfLines={2}
          style={{ 
            opacity: 0.7,
            color: Colors[colorScheme ?? 'light'].text
          }}
        >
          {team.description}
        </Text>
      )}
    </TouchableOpacity>
  );
}
EOF
        log_success "Creado TeamCard.tsx stub"
    else
        log_warning "TeamCard.tsx ya existe"
    fi
}

# 📋 Crear README con instrucciones de desarrollo
create_development_readme() {
    log_info "Creando README de desarrollo..."
    
    if [[ ! -f "DEVELOPMENT.md" ]]; then
        cat > DEVELOPMENT.md << 'EOF'
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
EOF
        log_success "Creado DEVELOPMENT.md"
    else
        log_warning "DEVELOPMENT.md ya existe"
    fi
}

# 🚀 Función principal
main() {
    echo -e "${BLUE}"
    echo "🏐 VOLLEY LEAGUE APP - SCRIPT DE ESTRUCTURA"
    echo "=========================================="
    echo -e "${NC}"
    echo "Este script crea SOLO los archivos y carpetas faltantes"
    echo "basándose en la auditoría completa del proyecto."
    echo ""
    
    # Verificaciones previas
    check_project_structure
    
    # Creación de estructura
    create_missing_directories
    create_missing_route_files
    create_missing_provider_interfaces
    create_missing_provider_implementations
    create_ui_component_stubs
    create_development_readme
    
    # Resumen final
    echo ""
    echo -e "${GREEN}✅ ESTRUCTURA COMPLETADA EXITOSAMENTE${NC}"
    echo ""
    echo -e "${BLUE}📋 RESUMEN DE LO CREADO:${NC}"
    echo "• Archivos de rutas faltantes (team, match, player, admin)"
    echo "• Interfaces de providers adicionales"
    echo "• Implementaciones base de providers"
    echo "• Stubs de componentes UI para extraer lógica"
    echo "• DEVELOPMENT.md con guía de próximos pasos"
    echo ""
    echo -e "${YELLOW}🎯 PRÓXIMOS PASOS:${NC}"
    echo "1. Revisar los archivos creados y completar TODOs"
    echo "2. Extraer componentes embebidos en las pantallas principales"
    echo "3. Migrar lógica desde artifacts a los nuevos providers"
    echo "4. Implementar formularios de creación/edición"
    echo ""
    echo -e "${BLUE}📖 Para más información, lee: DEVELOPMENT.md${NC}"
    echo ""
    echo -e "${GREEN}🚀 ¡El proyecto está listo para continuar el desarrollo!${NC}"
}

# Ejecutar script
main "$@"