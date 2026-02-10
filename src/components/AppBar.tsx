// AppBar Component - Top navigation bar with location and actions
// Modern Viral India Aesthetic

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';

interface AppBarProps {
    location?: string;
    onLocationPress?: () => void;
    onNotificationPress?: () => void;
    onCartPress?: () => void;
    notificationCount?: number;
    cartCount?: number;
}

export const AppBar: React.FC<AppBarProps> = ({
    location = 'Select Location',
    onLocationPress,
    onNotificationPress,
    onCartPress,
    notificationCount = 0,
    cartCount = 0,
}) => {
    return (
        <View style={styles.container}>
            {/* Location Selector */}
            <TouchableOpacity style={styles.locationButton} onPress={onLocationPress}>
                <Ionicons name="location" size={18} color={colors.primary} />
                <View style={styles.locationTextContainer}>
                    <Text style={styles.locationLabel}>Deliver to</Text>
                    <Text style={styles.locationText} numberOfLines={1}>
                        {location}
                    </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.actions}>
                {/* Notifications */}
                <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
                    <Ionicons name="notifications-outline" size={22} color={colors.text} />
                    {notificationCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Cart */}
                {onCartPress && (
                    <TouchableOpacity style={styles.iconButton} onPress={onCartPress}>
                        <Ionicons name="cart-outline" size={22} color={colors.text} />
                        {cartCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {cartCount > 9 ? '9+' : cartCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.md,
        paddingVertical: spacing.xs,
    },
    locationTextContainer: {
        marginLeft: spacing.xs,
        flex: 1,
    },
    locationLabel: {
        ...typography.caption,
        color: colors.textMuted,
        fontSize: 10,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    locationText: {
        ...typography.bodySmall,
        color: colors.text,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: colors.error,
        borderRadius: borderRadius.full,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        ...typography.caption,
        color: colors.textOnPrimary,
        fontSize: 10,
        fontWeight: '700',
    },
});
