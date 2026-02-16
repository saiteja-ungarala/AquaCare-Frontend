import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { agentTheme } from '../../theme/agentTheme';

type AgentSectionHeaderProps = {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onActionPress?: () => void;
};

export const AgentSectionHeader: React.FC<AgentSectionHeaderProps> = ({
    title,
    subtitle,
    actionLabel,
    onActionPress,
}) => {
    return (
        <View style={styles.row}>
            <View style={styles.textWrap}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {actionLabel && onActionPress ? (
                <TouchableOpacity onPress={onActionPress}>
                    <Text style={styles.action}>{actionLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: agentTheme.spacing.sm,
    },
    textWrap: {
        flex: 1,
    },
    title: {
        ...agentTheme.typography.h2,
        color: agentTheme.colors.textPrimary,
    },
    subtitle: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        marginTop: 2,
    },
    action: {
        ...agentTheme.typography.caption,
        color: agentTheme.colors.agentPrimaryDark,
    },
});
