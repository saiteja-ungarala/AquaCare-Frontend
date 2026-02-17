import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../theme/theme';

interface AuthErrorBannerProps {
    message?: string | null;
    onClose?: () => void;
}

export const AuthErrorBanner: React.FC<AuthErrorBannerProps> = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <View style={styles.banner}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.message}>{message}</Text>
            {onClose ? (
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={18} color={colors.error} />
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.error + '12',
        borderWidth: 1,
        borderColor: colors.error + '35',
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginBottom: spacing.md,
    },
    message: {
        ...typography.bodySmall,
        color: colors.error,
        flex: 1,
        fontWeight: '600',
    },
});

