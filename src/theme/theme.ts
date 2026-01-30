// Theme configuration for Water Services App
// Blue + Aqua water-themed colors

export const colors = {
    // Primary colors
    primary: '#0066CC',
    primaryLight: '#3399FF',
    primaryDark: '#004C99',

    // Secondary/Accent colors (aqua)
    secondary: '#00BCD4',
    secondaryLight: '#4DD0E1',
    secondaryDark: '#0097A7',

    // Background colors
    background: '#F8FBFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F0F8FF',

    // Text colors
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    textOnPrimary: '#FFFFFF',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Border colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Gradient colors
    gradientStart: '#0066CC',
    gradientEnd: '#00BCD4',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        lineHeight: 36,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 24,
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
};

export default {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
};
