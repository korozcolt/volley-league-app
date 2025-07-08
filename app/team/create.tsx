import * as ImagePicker from 'expo-image-picker';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { Stack, router } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { teams } from '@/lib/providers';
import { useAuth } from '@/lib/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

interface TeamFormData {
  name: string;
  description: string;
  coach: string;
  contact_email: string;
  contact_phone: string;
  founded_year: string;
  home_venue: string;
  logo?: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateTeamScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  
  // 📋 ESTADO DEL FORMULARIO
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    coach: '',
    contact_email: user?.email || '',
    contact_phone: '',
    founded_year: new Date().getFullYear().toString(),
    home_venue: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);

  // 🎨 ESTILOS DINÁMICOS
  const inputStyle = {
    backgroundColor: Colors[colorScheme ?? 'light'].card,
    borderColor: Colors[colorScheme ?? 'light'].border,
    color: Colors[colorScheme ?? 'light'].text,
  };

  // ✅ VALIDACIÓN
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del equipo es obligatorio';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.coach.trim()) {
      newErrors.coach = 'El nombre del entrenador es obligatorio';
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'El email de contacto es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Email inválido';
    }

    if (formData.contact_phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Formato de teléfono inválido';
    }

    if (formData.founded_year) {
      const year = parseInt(formData.founded_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.founded_year = `Año debe estar entre 1900 y ${currentYear}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 📸 SELECCIÓN DE LOGO
  const pickLogo = async () => {
    try {
      setLogoLoading(true);
      
      // Pedir permisos
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu galería para seleccionar un logo'
        );
        return;
      }

      // Seleccionar imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Logo cuadrado
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setLogoUri(result.assets[0].uri);
        setFormData(prev => ({ ...prev, logo: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error seleccionando logo:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    } finally {
      setLogoLoading(false);
    }
  };

  // 💾 GUARDAR EQUIPO
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Errores en el formulario', 'Por favor corrige los errores marcados');
      return;
    }

    setLoading(true);
    try {
      // Crear equipo
      const { data: newTeam, error } = await teams.create({
        ...formData,
        is_active: true,
        created_by: user?.id || '',
        // Si hay logo, se subirá en el provider
        logo: logoUri || undefined,
      });

      if (error) {
        throw new Error(error);
      }

      Alert.alert(
        'Equipo creado',
        `El equipo "${formData.name}" ha sido creado exitosamente`,
        [
          {
            text: 'Ver equipo',
            onPress: () => router.replace(`/team/${newTeam.id}`),
          },
          {
            text: 'Crear otro',
            onPress: () => {
              // Resetear formulario
              setFormData({
                name: '',
                description: '',
                coach: '',
                contact_email: user?.email || '',
                contact_phone: '',
                founded_year: new Date().getFullYear().toString(),
                home_venue: '',
              });
              setLogoUri(null);
              setErrors({});
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creando equipo:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo crear el equipo. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 🎨 RENDERIZADO DE CAMPO
  const renderField = (
    key: keyof TeamFormData,
    label: string,
    placeholder: string,
    options: {
      multiline?: boolean;
      keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
      required?: boolean;
    } = {}
  ) => (
    <View style={styles.fieldContainer}>
      <ThemedText style={styles.label}>
        {label} {options.required && <ThemedText style={styles.required}>*</ThemedText>}
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          inputStyle,
          options.multiline && styles.multilineInput,
          errors[key] && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
        value={formData[key]}
        onChangeText={(text) => {
          setFormData(prev => ({ ...prev, [key]: text }));
          if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
          }
        }}
        multiline={options.multiline}
        numberOfLines={options.multiline ? 4 : 1}
        keyboardType={options.keyboardType || 'default'}
        autoCapitalize={key === 'contact_email' ? 'none' : 'sentences'}
        autoCorrect={key !== 'contact_email'}
      />
      {errors[key] && (
        <ThemedText style={styles.errorText}>{errors[key]}</ThemedText>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Crear Equipo',
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
        }} 
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 📸 SECCIÓN DE LOGO */}
          <View style={styles.logoSection}>
            <ThemedText style={styles.sectionTitle}>Logo del Equipo</ThemedText>
            <TouchableOpacity
              style={[styles.logoContainer, { borderColor: Colors[colorScheme ?? 'light'].border }]}
              onPress={pickLogo}
              disabled={logoLoading}
            >
              {logoLoading ? (
                <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
              ) : logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <ThemedText style={styles.logoPlaceholderText}>📸</ThemedText>
                  <ThemedText style={styles.logoPlaceholderSubtext}>Tocar para agregar logo</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 📋 INFORMACIÓN BÁSICA */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Información Básica</ThemedText>
            
            {renderField('name', 'Nombre del Equipo', 'Ej: Volleyball Club', { required: true })}
            {renderField('description', 'Descripción', 'Descripción breve del equipo...', { multiline: true })}
            {renderField('coach', 'Entrenador Principal', 'Nombre del entrenador', { required: true })}
          </View>

          {/* 📞 INFORMACIÓN DE CONTACTO */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Contacto</ThemedText>
            
            {renderField('contact_email', 'Email de Contacto', 'equipo@example.com', { 
              keyboardType: 'email-address', 
              required: true 
            })}
            {renderField('contact_phone', 'Teléfono', '+1 234 567 8900', { keyboardType: 'phone-pad' })}
          </View>

          {/* 🏟️ INFORMACIÓN ADICIONAL */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Información Adicional</ThemedText>
            
            {renderField('founded_year', 'Año de Fundación', '2024', { keyboardType: 'numeric' })}
            {renderField('home_venue', 'Sede/Estadio Local', 'Ej: Gimnasio Municipal')}
          </View>

          {/* 💾 BOTONES DE ACCIÓN */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].tint },
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Crear Equipo</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
              onPress={() => router.back()}
              disabled={loading}
            >
              <ThemedText style={[styles.cancelButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Cancelar
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // 📸 LOGO
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  logoImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 32,
    marginBottom: 8,
  },
  logoPlaceholderSubtext: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },

  // 📋 SECCIONES
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  // 🔤 CAMPOS
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },

  // 💾 ACCIONES
  actionsSection: {
    marginTop: 32,
    gap: 16,
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 52,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});