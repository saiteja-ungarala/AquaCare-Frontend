// Button component

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    style,
    textStyle,
}) => {
    const getButtonStyle = (): ViewStyle[] => {
        const baseStyle: ViewStyle[] = [styles.base];

        // Size styles
        switch (size) {
            case 'small':
                baseStyle.push(styles.small);
                break;
            case 'large':
                baseStyle.push(styles.large);
                break;
            default:
                baseStyle.push(styles.medium);
        }

        // Variant styles
        switch (variant) {
            case 'secondary':
                baseStyle.push(styles.secondary);
                break;
            case 'outline':
                baseStyle.push(styles.outline);
                break;
            case 'ghost':
                baseStyle.push(styles.ghost);
                break;
            default:
                baseStyle.push(styles.primary);
        }

        if (fullWidth) {
            baseStyle.push(styles.fullWidth);
        }

        if (disabled) {
            baseStyle.push(styles.disabled);
        }

        return baseStyle;
    };

    const getTextStyle = (): TextStyle[] => {
        const baseTextStyle: TextStyle[] = [styles.text];

        switch (size) {
            case 'small':
                baseTextStyle.push(styles.textSmall);
                break;
            case 'large':
                baseTextStyle.push(styles.textLarge);
                break;
        }

        switch (variant) {
            case 'outline':
            case 'ghost':
                baseTextStyle.push(styles.textOutline);
                break;
            case 'secondary':
                baseTextStyle.push(styles.textSecondary);
                break;
        }

        if (disabled) {
            baseTextStyle.push(styles.textDisabled);
        }

        return baseTextStyle;
    };

    return (
        <TouchableOpacity
            style={[...getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textOnPrimary}
                    size="small"
                />
            ) : (
                <>
                    {icon}
                    <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    medium: {
        paddingVertical: spacing.md - 2,
        paddingHorizontal: spacing.lg,
    },
    large: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        ...typography.button,
        color: colors.textOnPrimary,
    },
    textSmall: {
        fontSize: 14,
    },
    textLarge: {
        fontSize: 18,
    },
    textOutline: {
        color: colors.primary,
    },
    textSecondary: {
        color: colors.textOnPrimary,
    },
    textDisabled: {
        color: colors.textLight,
    },
});
