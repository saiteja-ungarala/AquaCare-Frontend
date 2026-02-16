import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { agentTheme } from '../../theme/agentTheme';
import { AgentButton, AgentCard, AgentChip, AgentScreen, AgentSectionHeader } from '../../components/agent';
import { useAgentStore, useAuthStore } from '../../store';

export const AgentProfileScreen: React.FC = () => {
    const { me, isOnline, fetchMe, reset } = useAgentStore();
    const { logout, isLoading } = useAuthStore();

    useFocusEffect(
        React.useCallback(() => {
            fetchMe();
        }, [fetchMe])
    );

    const doLogout = async () => {
        reset();
        await logout();
    };

    const logoutUser = () => {
        if (Platform.OS === 'web') {
            const confirmed = typeof window !== 'undefined'
                ? window.confirm('Do you want to logout from technician app?')
                : true;

            if (confirmed) {
                void doLogout();
            }
            return;
        }

        Alert.alert('Logout', 'Do you want to logout from technician app?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    void doLogout();
                },
            },
        ]);
    };

    const hasBaseLocation = me?.base_lat !== null && me?.base_lng !== null;

    return (
        <AgentScreen>
            <ScrollView contentContainerStyle={styles.content}>
                <AgentSectionHeader title="Profile" subtitle="Technician account settings" />

                <AgentCard>
                    <Text style={styles.name}>{me?.full_name || 'Agent User'}</Text>
                    <Text style={styles.phone}>{me?.phone || 'Phone not available'}</Text>
                    <View style={styles.metaChips}>
                        <AgentChip label={me?.verification_status || 'pending'} tone={me?.verification_status === 'approved' ? 'success' : 'warning'} />
                        <AgentChip label={isOnline ? 'Online' : 'Offline'} tone={isOnline ? 'default' : 'dark'} />
                    </View>
                </AgentCard>

                <AgentCard>
                    <View style={styles.row}>
                        <Text style={styles.label}>Service Radius</Text>
                        <Text style={styles.value}>{me?.service_radius_km ?? 0} km</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Base Location</Text>
                        <Text style={styles.value}>{hasBaseLocation ? 'Configured' : 'Missing'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Last Online</Text>
                        <Text style={styles.value}>{me?.last_online_at ? new Date(me.last_online_at).toLocaleString('en-IN') : 'Not available'}</Text>
                    </View>
                </AgentCard>

                <AgentButton
                    title="Logout"
                    variant="secondary"
                    onPress={logoutUser}
                    loading={isLoading}
                    disabled={isLoading}
                />
            </ScrollView>
        </AgentScreen>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: agentTheme.spacing.lg,
        gap: agentTheme.spacing.md,
        paddingBottom: agentTheme.spacing.xxl,
    },
    name: {
        ...agentTheme.typography.h1,
        color: agentTheme.colors.textPrimary,
    },
    phone: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        marginTop: 4,
    },
    metaChips: {
        flexDirection: 'row',
        gap: agentTheme.spacing.sm,
        marginTop: agentTheme.spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: agentTheme.spacing.sm,
        gap: agentTheme.spacing.md,
    },
    label: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        flex: 1,
    },
    value: {
        ...agentTheme.typography.caption,
        color: agentTheme.colors.textPrimary,
        textAlign: 'right',
        flex: 1,
    },
});
