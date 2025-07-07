// components/ui/TournamentTypeSelector.tsx
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { TournamentType } from '@/lib/types/models';
import { useColorScheme } from '@/hooks/useColorScheme';

interface TournamentTypeSelectorProps {
  label: string;
  value: TournamentType;
  onChange: (type: TournamentType) => void;
  required?: boolean;
  disabled?: boolean;
}

const tournamentTypeOptions = [
  {
    value: TournamentType.POINTS,
    label: 'Por Puntos',
    description: 'Todos juegan contra todos, se acumulan puntos por victoria',
    icon: 'trophy-outline' as const,
    color: '#4CAF50',
  },
  {
    value: TournamentType.ELIMINATION,
    label: 'Eliminación',
    description: 'Eliminación directa, el perdedor sale del torneo',
    icon: 'git-branch-outline' as const,
    color: '#FF5722',
  },
  {
    value: TournamentType.MIXED,
    label: 'Mixto',
    description: 'Combinación de fase de grupos y eliminación',
    icon: 'layers-outline' as const,
    color: '#9C27B0',
  },
];

export function TournamentTypeSelector({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: TournamentTypeSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const colorScheme = useColorScheme() as 'light' | 'dark';

  const selectedOption = tournamentTypeOptions.find(option => option.value === value);

  return (
    <View className="mb-4">
      {/* Label */}
      <ThemedText className="text-sm font-medium mb-2">
        {label} {required && <ThemedText className="text-red-500">*</ThemedText>}
      </ThemedText>

      {/* Selector Button */}
      <TouchableOpacity
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
        className={`
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600 
          rounded-lg p-3 
          flex-row items-center justify-between
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <View className="flex-row items-center flex-1">
          {selectedOption && (
            <View 
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: selectedOption.color + '20' }}
            >
              <Ionicons 
                name={selectedOption.icon} 
                size={18} 
                color={selectedOption.color} 
              />
            </View>
          )}
          <View className="flex-1">
            <ThemedText className="font-medium text-gray-900 dark:text-white">
              {selectedOption?.label || 'Seleccionar tipo'}
            </ThemedText>
            {selectedOption && (
              <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {selectedOption.description}
              </ThemedText>
            )}
          </View>
        </View>
        
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} 
        />
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <ThemedText className="font-semibold text-lg">
                Seleccionar Tipo de Torneo
              </ThemedText>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={colorScheme === 'dark' ? '#FFF' : '#000'} 
                />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <View className="space-y-3">
              {tournamentTypeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setShowModal(false);
                  }}
                  className={`
                    p-4 rounded-lg border-2 flex-row items-center
                    ${value === option.value 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                    }
                  `}
                >
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: option.color + '20' }}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={option.color} 
                    />
                  </View>
                  
                  <View className="flex-1">
                    <ThemedText className="font-semibold text-base mb-1">
                      {option.label}
                    </ThemedText>
                    <ThemedText className="text-sm text-gray-600 dark:text-gray-300">
                      {option.description}
                    </ThemedText>
                  </View>

                  {value === option.value && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color="#4CAF50" 
                    />
                  )}
                </Pressable>
              ))}
            </View>

            {/* Info Footer */}
            <View className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
              <ThemedText className="text-xs text-blue-800 dark:text-blue-200 text-center">
                💡 Puedes cambiar el tipo después de crear el torneo si aún no hay equipos inscritos
              </ThemedText>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}