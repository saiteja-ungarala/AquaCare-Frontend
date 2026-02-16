import React from 'react';
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { agentTheme } from '../../theme/agentTheme';

type AgentButtonVariant = 'primary' | 'secondary';

type AgentButtonProps = {
    title: string;
    onPress: () => void;
    variant?: AgentButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export const AgentButton: React.FC<AgentButtonProps> = ({
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
                <ActivityIndicator size="small" color={variant === 'primary' ? agentTheme.colors.textOnPrimary : agentTheme.colors.agentPrimary} />
            ) : (
                <Text style={[styles.text, variant === 'primary' ? styles.textPrimary : styles.textSecondary]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        minHeight: 46,
        borderRadius: agentTheme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: agentTheme.spacing.md,
        borderWidth: 1,
    },
    primary: {
        backgroundColor: agentTheme.colors.agentPrimary,
        borderColor: agentTheme.colors.agentPrimary,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderColor: agentTheme.colors.agentMuted,
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        ...agentTheme.typography.button,
    },
    textPrimary: {
        color: agentTheme.colors.textOnPrimary,
    },
    textSecondary: {
        color: agentTheme.colors.textPrimary,
    },
});
