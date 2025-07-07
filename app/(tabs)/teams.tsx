// app/(tabs)/teams.tsx - Migrado a providers
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
// 🎯 IMPORTS AGNÓSTICOS - No más Supabase directo
import { useTeamSearch, useTeams } from '@/lib/hooks/useTeams';

import { Colors } from '@/constants/Colors';
import React from 'react';
import { Team } from '@/lib/types/models';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TeamsScreen() {
  // 🔄 HOOKS AGNÓSTICOS
  const { 
    teams, 
    loading, 
    error, 
    refreshing, 
    fetchTeams, 
    refresh, 
    clearError 
  } = useTeams({ autoFetch: true });
  
  const { isAdmin } = useAuth();
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const [searchMode, setSearchMode] = useState(false);
  
  // 🔍 BÚSQUEDA EN TIEMPO REAL
  const { 
    query, 
    setQuery, 
    searchResults, 
    searching, 
    clearResults 
  } = useTeamSearch();

  // Determinar qué equipos mostrar
  const displayTeams = searchMode ? searchResults : teams;

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'Reintentar', onPress: () => { clearError(); fetchTeams(); } },
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  const handleSearch = (text: string) => {
    setQuery(text);
    setSearchMode(!!text.trim());
    
    if (!text.trim()) {
      clearResults();
    }
  };

  const navigateToTeamDetails = (teamId: string) => {
    router.push(`/team/${teamId}`);
  };

  const navigateToCreateTeam = () => {
    router.push('/team/create');
  };

  const renderTeamItem = ({ item }: { item: Team }) => {
    return (
      <TouchableOpacity
        style={[
          styles.teamCard,
          { backgroundColor: Colors[colorScheme].card }
        ]}
        onPress={() => navigateToTeamDetails(item.id)}
      >
        <ThemedView style={styles.teamInfo}>
          {item.logo_url ? (
            <Image 
              source={{ uri: item.logo_url }} 
              style={styles.teamLogo}
              onError={() => console.log('Error loading team logo')}
            />
          ) : (
            <ThemedView style={[styles.teamLogo, styles.placeholderLogo]}>
              <ThemedText style={styles.placeholderText}>
                {item.name.charAt(0).toUpperCase()}
              </ThemedText>
            </ThemedView>
          )}
          
          <ThemedView style={styles.teamDetails}>
            <ThemedText style={styles.teamName}>{item.name}</ThemedText>
            
            {item.coach_name && (
              <ThemedText style={styles.coachName}>
                Entrenador: {item.coach_name}
              </ThemedText>
            )}
            
            {item.contact_email && (
              <ThemedText style={styles.contactInfo}>
                📧 {item.contact_email}
              </ThemedText>
            )}
            
            {item.contact_phone && (
              <ThemedText style={styles.contactInfo}>
                📞 {item.contact_phone}
              </ThemedText>
            )}
            
            <ThemedView style={styles.statusContainer}>
              <ThemedView 
                style={[
                  styles.statusBadge, 
                  { backgroundColor: item.active ? '#10B981' : '#EF4444' }
                ]}
              >
                <ThemedText style={styles.statusText}>
                  {item.active ? 'Activo' : 'Inactivo'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    if (loading || searching) {
      return (
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <ThemedText style={styles.loadingText}>
            {searching ? 'Buscando equipos...' : 'Cargando equipos...'}
          </ThemedText>
        </ThemedView>
      );
    }

    if (searchMode && query.trim() && searchResults.length === 0) {
      return (
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={styles.emptyText}>
            No se encontraron equipos que coincidan con "{query}"
          </ThemedText>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              setQuery('');
              setSearchMode(false);
              clearResults();
            }}
          >
            <ThemedText style={styles.clearButtonText}>
              Limpiar búsqueda
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      );
    }

    if (!searchMode && teams.length === 0) {
      return (
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={styles.emptyText}>
            No hay equipos registrados
          </ThemedText>
          {isAdmin && (
            <TouchableOpacity 
              style={styles.createButton}
              onPress={navigateToCreateTeam}
            >
              <ThemedText style={styles.createButtonText}>
                Crear primer equipo
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      );
    }

    return null;
  };

  const renderHeader = () => (
    <ThemedView style={styles.header}>
      <ThemedText style={styles.title}>Equipos</ThemedText>
      
      {/* 🔍 BARRA DE BÚSQUEDA */}
      <ThemedView style={[styles.searchContainer, { borderColor: Colors[colorScheme].border }]}>
        <ThemedText style={styles.searchIcon}>🔍</ThemedText>
        <ThemedText
          style={[styles.searchInput, { color: Colors[colorScheme].text }]}
          placeholder="Buscar equipos..."
          placeholderTextColor={Colors[colorScheme].tabIconDefault}
          value={query}
          onChangeText={handleSearch}
        />
        {query.length > 0 && (
          <TouchableOpacity 
            onPress={() => {
              setQuery('');
              setSearchMode(false);
              clearResults();
            }}
            style={styles.clearIconContainer}
          >
            <ThemedText style={styles.clearIcon}>✕</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* 📊 ESTADÍSTICAS RÁPIDAS */}
      <ThemedView style={styles.statsContainer}>
        <ThemedView style={[styles.statCard, { backgroundColor: Colors[colorScheme].card }]}>
          <ThemedText style={styles.statNumber}>{teams.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Total</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.statCard, { backgroundColor: Colors[colorScheme].card }]}>
          <ThemedText style={styles.statNumber}>
            {teams.filter(team => team.active).length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Activos</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.statCard, { backgroundColor: Colors[colorScheme].card }]}>
          <ThemedText style={styles.statNumber}>
            {teams.filter(team => !team.active).length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Inactivos</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* ➕ BOTÓN CREAR (Solo para admins) */}
      {isAdmin && (
        <TouchableOpacity 
          style={[styles.createTeamButton, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={navigateToCreateTeam}
        >
          <ThemedText style={styles.createTeamButtonText}>
            ➕ Crear Equipo
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={displayTeams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={refreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  clearIconContainer: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 14,
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  createTeamButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createTeamButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  teamCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  placeholderLogo: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  coachName: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  contactInfo: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  clearButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6b7280',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  createButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});