import React from 'react';
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { technicianTheme } from '../../theme/technicianTheme';

type TechnicianButtonVariant = 'primary' | 'secondary';

type TechnicianButtonProps = {
    title: string;
    onPress: () => void;
    variant?: TechnicianButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export const TechnicianButton: React.FC<TechnicianButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
}) => {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            disabled={isDisabled}
            style={[
                styles.base,
                variant === 'primary' ? styles.primary : styles.secondary,
                isDisabled ? styles.disabled : null,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={variant === 'primary' ? technicianTheme.colors.textOnPrimary : technicianTheme.colors.agentPrimary} />
            ) : (
                <Text style={[styles.text, variant === 'primary' ? styles.textPrimary : styles.textSecondary]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        minHeight: 46,
        borderRadius: technicianTheme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: technicianTheme.spacing.md,
        borderWidth: 1,
    },
    primary: {
        backgroundColor: technicianTheme.colors.agentPrimary,
        borderColor: technicianTheme.colors.agentPrimary,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderColor: technicianTheme.colors.agentMuted,
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        ...technicianTheme.typography.button,
    },
    textPrimary: {
        color: technicianTheme.colors.textOnPrimary,
    },
    textSecondary: {
        color: technicianTheme.colors.textPrimary,
    },
});
