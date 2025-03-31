// app/(tabs)/teams.tsx

import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';

import { Colors } from '@/constants/Colors';
import { Team } from '@/lib/types/models';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/lib/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TeamsScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setTeams(data as Team[]);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
      Alert.alert('Error', 'No se pudieron cargar los equipos');
    } finally {
      setLoading(false);
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
              resizeMode="contain"
            />
          ) : (
            <ThemedView style={styles.placeholderLogo}>
              <ThemedText style={styles.placeholderText}>
                {item.name.split(' ').map(word => word[0]).join('').substring(0, 2)}
              </ThemedText>
            </ThemedView>
          )}
          <ThemedView style={styles.teamDetails}>
            <ThemedText type="defaultSemiBold" style={styles.teamName}>
              {item.name}
            </ThemedText>
            {item.coach_name && (
              <ThemedText>Entrenador: {item.coach_name}</ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Equipos</ThemedText>
        {isAdmin() && (
          <TouchableOpacity 
            style={styles.createButton}
            onPress={navigateToCreateTeam}
          >
            <ThemedText style={styles.createButtonText}>+ Nuevo</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color="#4a90e2" style={styles.loader} />
      ) : teams.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>
            No hay equipos disponibles
          </ThemedText>
          {isAdmin() && (
            <TouchableOpacity 
              style={[styles.createButton, styles.emptyStateButton]}
              onPress={navigateToCreateTeam}
            >
              <ThemedText style={styles.createButtonText}>Crear primer equipo</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      ) : (
        <FlatList
          data={teams}
          renderItem={renderTeamItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          onRefresh={fetchTeams}
          refreshing={loading}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  teamCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  placeholderLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeholderText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});