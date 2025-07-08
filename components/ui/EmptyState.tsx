import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'error' | 'loading';
  size?: 'small' | 'medium' | 'large';
}

export function EmptyState({ 
  icon,
  title, 
  subtitle, 
  actionText, 
  onAction,
  variant = 'default',
  size = 'large'
}: EmptyStateProps) {
  const colorScheme = useColorScheme();

  // 🎨 CONFIGURACIÓN POR VARIANTE
  const getVariantConfig = () => {
    switch (variant) {
      case 'search':
        return {
          defaultIcon: '🔍',
          iconSize: size === 'small' ? 32 : size === 'medium' ? 40 : 48,
          titleSize: size === 'small' ? 16 : size === 'medium' ? 18 : 20,
          subtitleSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16,
        };
      case 'error':
        return {
          defaultIcon: '❌',
          iconSize: size === 'small' ? 32 : size === 'medium' ? 40 : 48,
          titleSize: size === 'small' ? 16 : size === 'medium' ? 18 : 20,
          subtitleSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16,
        };
      case 'loading':
        return {
          defaultIcon: '⏳',
          iconSize: size === 'small' ? 32 : size === 'medium' ? 40 : 48,
          titleSize: size === 'small' ? 16 : size === 'medium' ? 18 : 20,
          subtitleSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16,
        };
      default:
        return {
          defaultIcon: '📭',
          iconSize: size === 'small' ? 36 : size === 'medium' ? 48 : 64,
          titleSize: size === 'small' ? 16 : size === 'medium' ? 18 : 20,
          subtitleSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16,
        };
    }
  };

  const config = getVariantConfig();
  const displayIcon = icon || config.defaultIcon;

  // 🎨 ESTILOS DINÁMICOS
  const containerStyle = {
    ...styles.container,
    ...(size === 'small' && styles.containerSmall),
    ...(size === 'medium' && styles.containerMedium),
  };

  return (
    <ThemedView style={containerStyle}>
      {/* 📦 ICONO */}
      <ThemedText style={[
        styles.icon,
        { fontSize: config.iconSize }
      ]}>
        {displayIcon}
      </ThemedText>

      {/* 📝 TÍTULO */}
      <ThemedText style={[
        styles.title,
        { 
          fontSize: config.titleSize,
          color: Colors[colorScheme ?? 'light'].text 
        }
      ]}>
        {title}
      </ThemedText>

      {/* 📄 SUBTÍTULO */}
      {subtitle && (
        <ThemedText style={[
          styles.subtitle,
          { 
            fontSize: config.subtitleSize,
            color: Colors[colorScheme ?? 'light'].text 
          }
        ]}>
          {subtitle}
        </ThemedText>
      )}

      {/* 🔘 BOTÓN DE ACCIÓN */}
      {actionText && onAction && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint },
            size === 'small' && styles.actionButtonSmall,
          ]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <ThemedText style={[
            styles.actionButtonText,
            size === 'small' && styles.actionButtonTextSmall,
          ]}>
            {actionText}
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

// 🎯 VARIANTES PREDEFINIDAS PARA CASOS COMUNES

export const EmptyTournaments = ({ onCreateTournament }: { onCreateTournament?: () => void }) => (
  <EmptyState
    icon="🏆"
    title="No hay torneos disponibles"
    subtitle="Los torneos aparecerán aquí cuando se creen"
    actionText={onCreateTournament ? "Crear primer torneo" : undefined}
    onAction={onCreateTournament}
  />
);

export const EmptyTeams = ({ onCreateTeam }: { onCreateTeam?: () => void }) => (
  <EmptyState
    icon="👥"
    title="No hay equipos registrados"
    subtitle="Los equipos aparecerán aquí cuando se registren"
    actionText={onCreateTeam ? "Crear primer equipo" : undefined}
    onAction={onCreateTeam}
  />
);

export const EmptyMatches = ({ onCreateMatch }: { onCreateMatch?: () => void }) => (
  <EmptyState
    icon="🏐"
    title="No hay partidos programados"
    subtitle="Los partidos aparecerán aquí cuando se programen"
    actionText={onCreateMatch ? "Crear primer partido" : undefined}
    onAction={onCreateMatch}
  />
);

export const EmptyPlayers = ({ onAddPlayer }: { onAddPlayer?: () => void }) => (
  <EmptyState
    icon="🏃‍♂️"
    title="No hay jugadores registrados"
    subtitle="Los jugadores aparecerán aquí cuando se registren"
    actionText={onAddPlayer ? "Agregar primer jugador" : undefined}
    onAction={onAddPlayer}
  />
);

export const SearchEmpty = ({ query, onClearSearch }: { query: string; onClearSearch?: () => void }) => (
  <EmptyState
    variant="search"
    title={`No se encontraron resultados para "${query}"`}
    subtitle="Intenta con otros términos de búsqueda"
    actionText={onClearSearch ? "Limpiar búsqueda" : undefined}
    onAction={onClearSearch}
    size="medium"
  />
);

export const LoadingEmpty = ({ message = "Cargando..." }: { message?: string }) => (
  <EmptyState
    variant="loading"
    title={message}
    subtitle="Por favor espera un momento"
    size="medium"
  />
);

export const ErrorEmpty = ({ 
  message = "Ocurrió un error", 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void 
}) => (
  <EmptyState
    variant="error"
    title={message}
    subtitle="Verifica tu conexión e intenta nuevamente"
    actionText={onRetry ? "Reintentar" : undefined}
    onAction={onRetry}
    size="medium"
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  containerSmall: {
    padding: 16,
    minHeight: 120,
  },
  containerMedium: {
    padding: 18,
    minHeight: 160,
  },

  // 📦 ICONO
  icon: {
    marginBottom: 16,
    textAlign: 'center',
  },

  // 📝 TEXTO
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  // 🔘 BOTÓN
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionButtonTextSmall: {
    fontSize: 14,
  },
});

