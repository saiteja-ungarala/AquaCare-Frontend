import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { technicianTheme } from '../../theme/technicianTheme';

type TechnicianCardProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

export const TechnicianCard: React.FC<TechnicianCardProps> = ({ children, style }) => {
    return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: technicianTheme.colors.agentSurface,
        borderRadius: technicianTheme.radius.lg,
        padding: technicianTheme.spacing.md,
        borderWidth: 1,
        borderColor: technicianTheme.colors.border,
        ...technicianTheme.shadows.card,
    },
});
