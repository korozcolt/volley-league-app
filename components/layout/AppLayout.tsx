import {
    Appbar,
    FAB,
    Portal,
    Snackbar,
    Surface,
    useTheme
} from 'react-native-paper';
import { Platform, ScrollView, StatusBar, Text, View } from 'react-native'; // ✅ AGREGADO Text
// components/layout/AppLayout.tsx
import React, { ReactNode } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppLayoutProps {
    children: ReactNode;

    // Header configuración
    title?: string;
    subtitle?: string;
    showBackButton?: boolean;
    headerActions?: ReactNode;

    // Layout configuración
    scrollable?: boolean;
    padding?: boolean;
    backgroundColor?: string;

    // FAB configuración
    fabIcon?: string;
    fabLabel?: string;
    fabOnPress?: () => void;
    showFab?: boolean;

    // Estado
    loading?: boolean;
    error?: string;
    onErrorDismiss?: () => void;

    // Personalización
    className?: string;
}

/**
 * Layout base reutilizable para toda la aplicación
 * 
 * Ubicación: components/layout/AppLayout.tsx
 * 
 * Características:
 * - Header consistente con Paper Appbar
 * - Scroll opcional
 * - FAB opcional
 * - Manejo de errores con Snackbar
 * - Safe Area automática
 * - Soporte para modo oscuro
 * - Integración con NativeWind
 */
export function AppLayout({
    children,
    title,
    subtitle,
    showBackButton = false,
    headerActions,
    scrollable = true,
    padding = true,
    backgroundColor,
    fabIcon,
    fabLabel,
    fabOnPress,
    showFab = false,
    loading = false,
    error,
    onErrorDismiss,
    className = '',
}: AppLayoutProps) {
    const theme = useTheme();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();

    // 🎨 CONFIGURACIÓN DE COLORES
    const isDark = colorScheme === 'dark';
    const statusBarStyle = isDark ? 'light-content' : 'dark-content';
    const statusBarBackgroundColor = theme.colors.surface;

    const containerBgColor = backgroundColor || theme.colors.background;

    // 📱 COMPONENTE HEADER
    const renderHeader = () => {
        if (!title) return null;

        return (
            <Appbar.Header
                elevated={true}
                style={{
                    backgroundColor: theme.colors.surface,
                }}
            >
                {showBackButton && (
                    <Appbar.BackAction
                        onPress={() => router.back()}
                    />
                )}

                <Appbar.Content
                    title={title}
                    // ✅ CORREGIDO: Eliminar subtitle deprecated
                    titleStyle={{
                        fontSize: 18,
                        fontWeight: '600',
                    }}
                />

                {/* ✅ MOSTRAR SUBTITLE COMO TEXTO SEPARADO SI EXISTE */}
                {subtitle && (
                    <View style={{ flex: 1, marginLeft: -200 }}>
                        <Text
                            style={{
                                fontSize: 14,
                                color: theme.colors.onSurface,
                                opacity: 0.7
                            }}
                        >
                            {subtitle}
                        </Text>
                    </View>
                )}

                {headerActions}
            </Appbar.Header>
        );
    };

    // 📜 COMPONENTE CONTENIDO
    const renderContent = () => {
        const contentClassName = `
      flex-1 
      ${padding ? 'p-4' : ''} 
      ${className}
    `.trim();

        if (scrollable) {
            return (
                <ScrollView
                    className={contentClassName}
                    style={{ backgroundColor: containerBgColor }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: showFab ? 80 : 16, // Espacio para FAB
                    }}
                >
                    {children}
                </ScrollView>
            );
        }

        return (
            <View
                className={contentClassName}
                style={{ backgroundColor: containerBgColor }}
            >
                {children}
            </View>
        );
    };

    // 🎈 COMPONENTE FAB
    const renderFab = () => {
        if (!showFab || !fabOnPress) return null;

        return (
            <FAB
                icon={fabIcon || 'plus'}
                label={fabLabel}
                onPress={fabOnPress}
                style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                }}
                mode="elevated"
            />
        );
    };

    return (
        <Surface style={{ flex: 1 }} className="bg-background">
            {/* 📱 STATUS BAR */}
            <StatusBar
                barStyle={statusBarStyle}
                backgroundColor={statusBarBackgroundColor}
                translucent={Platform.OS === 'android'}
            />

            {/* 🔝 SAFE AREA TOP */}
            <View style={{ height: insets.top, backgroundColor: statusBarBackgroundColor }} />

            {/* 📋 HEADER */}
            {renderHeader()}

            {/* 📄 CONTENIDO PRINCIPAL */}
            {renderContent()}

            {/* 🎈 FAB */}
            <Portal>
                {renderFab()}
            </Portal>

            {/* 🔔 SNACKBAR PARA ERRORES */}
            <Portal>
                <Snackbar
                    visible={!!error}
                    onDismiss={onErrorDismiss || (() => { })} // ✅ CORREGIDO: Función por defecto
                    action={{
                        label: 'Cerrar',
                        onPress: onErrorDismiss || (() => { }), // ✅ CORREGIDO: Función por defecto
                    }}
                    style={{
                        backgroundColor: theme.colors.error,
                    }}
                >
                    {error}
                </Snackbar>
            </Portal>
        </Surface>
    );
}

// 🎯 VARIANTES PREDEFINIDAS DEL LAYOUT

export const DashboardLayout = ({ children, ...props }: Omit<AppLayoutProps, 'title'>) => (
    <AppLayout
        title="Liga de Voleibol"
        scrollable={true}
        padding={true}
        {...props}
    >
        {children}
    </AppLayout>
);

export const ListLayout = ({
    children,
    title,
    onCreatePress,
    createLabel = "Crear",
    ...props
}: Omit<AppLayoutProps, 'showFab' | 'fabOnPress' | 'fabLabel'> & {
    onCreatePress?: () => void;
    createLabel?: string;
}) => (
    <AppLayout
        title={title}
        scrollable={false} // Las listas manejan su propio scroll
        padding={false}    // Las listas manejan su propio padding
        showFab={!!onCreatePress}
        fabIcon="plus"
        fabLabel={createLabel}
        fabOnPress={onCreatePress}
        {...props}
    >
        {children}
    </AppLayout>
);

export const FormLayout = ({
    children,
    title,
    showBackButton = true,
    ...props
}: AppLayoutProps) => (
    <AppLayout
        title={title}
        showBackButton={showBackButton}
        scrollable={true}
        padding={true}
        {...props}
    >
        {children}
    </AppLayout>
);

export const DetailsLayout = ({
    children,
    title,
    showBackButton = true,
    headerActions,
    ...props
}: AppLayoutProps) => (
    <AppLayout
        title={title}
        showBackButton={showBackButton}
        headerActions={headerActions}
        scrollable={true}
        padding={true}
        {...props}
    >
        {children}
    </AppLayout>
);

export const AuthLayout = ({ children, ...props }: Omit<AppLayoutProps, 'title' | 'showBackButton'>) => (
    <AppLayout
        scrollable={true}
        padding={true}
        className="justify-center items-center"
        {...props}
    >
        {children}
    </AppLayout>
);

