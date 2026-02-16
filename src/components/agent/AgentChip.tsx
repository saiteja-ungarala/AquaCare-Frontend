import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { agentTheme } from '../../theme/agentTheme';

type AgentChipTone = 'default' | 'success' | 'warning' | 'danger' | 'dark';

type AgentChipProps = {
    label: string;
    tone?: AgentChipTone;
    style?: StyleProp<ViewStyle>;
};

const toneStyles: Record<AgentChipTone, { backgroundColor: string; color: string; borderColor: string }> = {
    default: { backgroundColor: '#FFF4D8', color: '#7B5400', borderColor: '#FFD98A' },
    success: { backgroundColor: '#E8F9EF', color: '#1B8C4D', borderColor: '#BFECCE' },
    warning: { backgroundColor: '#FFF3DD', color: '#A66D00', borderColor: '#FFD188' },
    danger: { backgroundColor: '#FDECEC', color: '#B53737', borderColor: '#F3BFBF' },
    dark: { backgroundColor: '#0A2745', color: '#F3F6F9', borderColor: '#1A3B5F' },
};

export const AgentChip: React.FC<AgentChipProps> = ({ label, tone = 'default', style }) => {
    const toneStyle = toneStyles[tone];

    return (
        <View style={[styles.base, { backgroundColor: toneStyle.backgroundColor, borderColor: toneStyle.borderColor }, style]}>
            <Text style={[styles.label, { color: toneStyle.color }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: agentTheme.radius.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    label: {
        ...agentTheme.typography.caption,
        textTransform: 'capitalize',
    },
});
