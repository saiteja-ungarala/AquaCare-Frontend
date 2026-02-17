export const dealerTheme = {
    colors: {
        dealerPrimary: '#0D5D8C',
        dealerPrimaryDark: '#094B71',
        dealerAccent: '#CC8A1E',
        dealerDark: '#0C1A26',
        dealerSurface: '#FFFFFF',
        dealerSurfaceAlt: '#EEF4F8',
        dealerMuted: '#8CA1B3',
        textPrimary: '#102233',
        textSecondary: '#55697A',
        textOnDark: '#F4F8FB',
        textOnPrimary: '#FFFFFF',
        success: '#1C8A4A',
        warning: '#C48212',
        danger: '#C23D3D',
        border: '#D7E1E8',
    },
    spacing: {
        xs: 6,
        sm: 10,
        md: 14,
        lg: 18,
        xl: 24,
        xxl: 32,
    },
    radius: {
        sm: 10,
        md: 14,
        lg: 20,
        full: 999,
    },
    typography: {
        title: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34 },
        h1: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
        h2: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
        body: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
        bodySmall: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
        caption: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
        button: { fontSize: 15, fontWeight: '700' as const, lineHeight: 20 },
    },
    shadows: {
        card: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 4,
        },
        bar: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 8,
        },
    },
} as const;

export type DealerTheme = typeof dealerTheme;

