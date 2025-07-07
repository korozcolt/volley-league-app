// components/ui/DatePicker.tsx
import { Modal, Platform, Pressable, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  required = false,
  minimumDate,
  maximumDate,
  disabled = false,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );
  
  const colorScheme = useColorScheme() as 'light' | 'dark';

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (date) {
      setSelectedDate(date);
      // Formatear a YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      onChange(formattedDate);
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const openPicker = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  return (
    <View className="mb-4">
      {/* Label */}
      <ThemedText className="text-sm font-medium mb-2">
        {label} {required && <ThemedText className="text-red-500">*</ThemedText>}
      </ThemedText>

      {/* Input Touch Area */}
      <TouchableOpacity
        onPress={openPicker}
        disabled={disabled}
        className={`
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600 
          rounded-lg p-3 
          flex-row items-center justify-between
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <ThemedText 
          className={`flex-1 ${
            value 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {value ? formatDisplayDate(value) : placeholder}
        </ThemedText>
        
        <Ionicons 
          name="calendar-outline" 
          size={20} 
          color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} 
        />
      </TouchableOpacity>

      {/* Date Picker */}
      {showPicker && (
        <>
          {Platform.OS === 'ios' ? (
            // iOS Modal
            <Modal
              transparent={true}
              visible={showPicker}
              animationType="slide"
            >
              <View className="flex-1 justify-end bg-black bg-opacity-50">
                <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-4">
                  {/* Header */}
                  <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <ThemedText className="text-blue-600 font-medium">
                        Cancelar
                      </ThemedText>
                    </TouchableOpacity>
                    <ThemedText className="font-semibold">
                      Seleccionar Fecha
                    </ThemedText>
                    <TouchableOpacity 
                      onPress={() => {
                        const formattedDate = selectedDate.toISOString().split('T')[0];
                        onChange(formattedDate);
                        setShowPicker(false);
                      }}
                    >
                      <ThemedText className="text-blue-600 font-medium">
                        Confirmar
                      </ThemedText>
                    </TouchableOpacity>
                  </View>

                  {/* Date Picker */}
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    themeVariant={colorScheme}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            // Android Native Picker
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
        </>
      )}
    </View>
  );
}

// 🎯 VARIANTE SIMPLE PARA CASOS BÁSICOS
export function SimpleDatePicker({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  className = '',
}: {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const colorScheme = useColorScheme() as 'light' | 'dark';

  return (
    <>
      <Pressable
        onPress={() => setShowPicker(true)}
        className={`
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600 
          rounded-lg p-3 
          flex-row items-center justify-between
          ${className}
        `}
      >
        <ThemedText 
          className={
            value 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-500 dark:text-gray-400'
          }
        >
          {value || placeholder}
        </ThemedText>
        <Ionicons 
          name="calendar-outline" 
          size={20} 
          color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} 
        />
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (date) {
              onChange(date.toISOString().split('T')[0]);
            }
          }}
          themeVariant={colorScheme}
        />
      )}
    </>
  );
}