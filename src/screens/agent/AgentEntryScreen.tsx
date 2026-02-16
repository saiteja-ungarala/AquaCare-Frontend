import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/types';
import { agentTheme } from '../../theme/agentTheme';
import { AgentScreen } from '../../components/agent';
import { useAgentStore } from '../../store';

type AgentEntryScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'AgentEntry'>;
};

export const AgentEntryScreen: React.FC<AgentEntryScreenProps> = ({ navigation }) => {
    const { fetchMe } = useAgentStore();

    useEffect(() => {
        const bootstrap = async () => {
            const payload = await fetchMe();
            if (!payload) return;

            const status = payload.profile.verification_status;
            if (status === 'approved') {
                navigation.reset({ index: 0, routes: [{ name: 'AgentTabs' }] });
                return;
            }

            if (status === 'pending') {
                navigation.reset({ index: 0, routes: [{ name: 'AgentKycPending' }] });
                return;
            }

            navigation.reset({ index: 0, routes: [{ name: 'AgentKycUpload' }] });
        };

        bootstrap();
    }, [fetchMe, navigation]);

    return (
        <AgentScreen dark>
            <View style={styles.container}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>AGENT</Text>
                </View>
                <Text style={styles.title}>Preparing your field dashboard</Text>
                <Text style={styles.subtitle}>Checking verification and syncing active jobs.</Text>
                <ActivityIndicator color={agentTheme.colors.agentPrimary} size="large" style={{ marginTop: agentTheme.spacing.lg }} />
            </View>
        </AgentScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: agentTheme.spacing.xl,
    },
    badge: {
        borderRadius: agentTheme.radius.full,
        backgroundColor: '#1A2E46',
        borderWidth: 1,
        borderColor: '#2A445F',
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginBottom: agentTheme.spacing.md,
    },
    badgeText: {
        ...agentTheme.typography.caption,
        color: agentTheme.colors.agentPrimary,
        letterSpacing: 1,
    },
    title: {
        ...agentTheme.typography.h1,
        color: agentTheme.colors.textOnDark,
        textAlign: 'center',
    },
    subtitle: {
        ...agentTheme.typography.body,
        color: '#AEB9C4',
        textAlign: 'center',
        marginTop: agentTheme.spacing.sm,
    },
});
