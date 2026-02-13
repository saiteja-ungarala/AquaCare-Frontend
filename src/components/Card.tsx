// Card component

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../theme/theme';

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card: React.FC<CardProps> = ({
    children,
    onPress,
    style,
    variant = 'elevated',
}) => {
    const getVariantStyle = (): ViewStyle => {
        switch (variant) {
            case 'outlined':
                return styles.outlined;
            case 'filled':
                return styles.filled;
            default:
                return styles.elevated;
        }
    };

    const CardWrapper = onPress ? TouchableOpacity : View;

    return (
        <CardWrapper
            style={[styles.base, getVariantStyle(), style]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {children}
        </CardWrapper>
    );
};

const styles = StyleSheet.create({
    base: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    elevated: {
        ...shadows.md,
    },
    outlined: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    filled: {
        backgroundColor: colors.primary,
    },
});
