// ServiceCard component for displaying service options

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/theme';
import { Service } from '../models/types';

interface ServiceCardProps {
    service: Service;
    onPress: () => void;
    compact?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
    service,
    onPress,
    compact = false,
}) => {
    // Get icon based on category
    const getIcon = (): keyof typeof Ionicons.glyphMap => {
        switch (service.category) {
            case 'water_purifier':
                return 'water-outline';
            case 'ro_plant':
                return 'filter-outline';
            case 'water_softener':
                return 'beaker-outline';
            case 'ionizer':
                return 'flash-outline';
            default:
                return 'construct-outline';
        }
    };

    if (compact) {
        return (
            <TouchableOpacity
                style={styles.compactContainer}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.compactIconContainer}>
                    <Ionicons name={getIcon()} size={28} color={colors.primary} />
                </View>
                <Text style={styles.compactTitle} numberOfLines={2}>
                    {service.name}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={getIcon()} size={32} color={colors.accent} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{service.name}</Text>
                <Text style={styles.duration}>{service.duration}</Text>
                <Text style={styles.price}>₹{service.price}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        ...shadows.sm,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        marginLeft: spacing.md,
    },
    title: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
    },
    duration: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    price: {
        ...typography.body,
        fontWeight: '700',
        color: colors.primary,
        marginTop: 4,
    },
    // Compact styles for grid layout
    compactContainer: {
        width: '48%',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
        ...shadows.sm,
        marginBottom: spacing.md,
    },
    compactIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    compactTitle: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
});
