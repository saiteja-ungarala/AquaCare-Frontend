import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { agentTheme } from '../../theme/agentTheme';

type AgentCardProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

export const AgentCard: React.FC<AgentCardProps> = ({ children, style }) => {
    return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: agentTheme.colors.agentSurface,
        borderRadius: agentTheme.radius.lg,
        padding: agentTheme.spacing.md,
        borderWidth: 1,
        borderColor: agentTheme.colors.border,
        ...agentTheme.shadows.card,
    },
});
