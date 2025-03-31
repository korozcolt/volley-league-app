// app/(tabs)/profile.tsx

import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useAuthContext } from '@/lib/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfileScreen() {
  const { user, userDetails, loading, signOut, isAdmin } = useAuthContext();
  const colorScheme = useColorScheme() as 'light' | 'dark';

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    // Implementar cambio de contraseña
    router.push('/change-password');
  };

  const handleEditProfile = () => {
    // Implementar edición de perfil
    router.push('/edit-profile');
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Perfil</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.profileCard, { backgroundColor: Colors[colorScheme].card }]}>
        <ThemedView style={styles.avatarContainer}>
          <ThemedView style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {userDetails?.full_name.charAt(0).toUpperCase() || 'U'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.userInfo}>
          <ThemedText type="defaultSemiBold" style={styles.userName}>
            {userDetails?.full_name || 'Usuario'}
          </ThemedText>
          <ThemedText>{user?.email || 'Sin correo'}</ThemedText>
          <ThemedView
            style={[
              styles.roleBadge,
              { backgroundColor: isAdmin() ? '#4a90e2' : '#757575' }
            ]}
          >
            <ThemedText style={styles.roleText}>
              {isAdmin() ? 'Administrador' : 'Espectador'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.actionsSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Ajustes de cuenta
        </ThemedText>

        <TouchableOpacity
          style={[styles.actionItem, { backgroundColor: Colors[colorScheme].card }]}
          onPress={handleEditProfile}
        >
          <Ionicons name="person-outline" size={24} color={Colors[colorScheme].text} />
          <ThemedText style={styles.actionText}>Editar perfil</ThemedText>
          <Ionicons name="chevron-forward" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionItem, { backgroundColor: Colors[colorScheme].card }]}
          onPress={handleChangePassword}
        >
          <Ionicons name="key-outline" size={24} color={Colors[colorScheme].text} />
          <ThemedText style={styles.actionText}>Cambiar contraseña</ThemedText>
          <Ionicons name="chevron-forward" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: Colors[colorScheme].border }]}
          onPress={handleSignOut}
        >
          <ThemedText style={{ color: '#f44336' }}>Cerrar sesión</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Liga de Voleibol v1.0.0
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  profileCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    marginBottom: 4,
  },
  roleBadge: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  roleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
  },
  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
  },
});