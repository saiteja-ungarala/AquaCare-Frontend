import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { technicianTheme } from '../../theme/technicianTheme';

type TechnicianSectionHeaderProps = {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onActionPress?: () => void;
};

export const TechnicianSectionHeader: React.FC<TechnicianSectionHeaderProps> = ({
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
        gap: technicianTheme.spacing.sm,
    },
    textWrap: {
        flex: 1,
    },
    title: {
        ...technicianTheme.typography.h2,
        color: technicianTheme.colors.textPrimary,
    },
    subtitle: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
        marginTop: 2,
    },
    action: {
        ...technicianTheme.typography.caption,
        color: technicianTheme.colors.agentPrimaryDark,
    },
});
