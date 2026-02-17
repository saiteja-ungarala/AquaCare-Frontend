import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dealerTheme } from '../../theme/dealerTheme';

export const DealerOrdersPlaceholderScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Ionicons name="receipt-outline" size={58} color={dealerTheme.colors.dealerMuted} />
            <Text style={styles.title}>Dealer Orders</Text>
            <Text style={styles.subtitle}>Coming soon in the next release.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: dealerTheme.colors.dealerSurfaceAlt,
        paddingHorizontal: dealerTheme.spacing.xl,
    },
    title: {
        ...dealerTheme.typography.h1,
        color: dealerTheme.colors.textPrimary,
        marginTop: dealerTheme.spacing.md,
    },
    subtitle: {
        ...dealerTheme.typography.body,
        color: dealerTheme.colors.textSecondary,
        marginTop: dealerTheme.spacing.xs,
    },
});

