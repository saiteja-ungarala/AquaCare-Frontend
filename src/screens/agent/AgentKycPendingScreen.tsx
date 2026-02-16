import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/types';
import { agentTheme } from '../../theme/agentTheme';
import { AgentButton, AgentCard, AgentChip, AgentScreen } from '../../components/agent';
import { useAgentStore } from '../../store';

type AgentKycPendingScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'AgentKycPending'>;
};

export const AgentKycPendingScreen: React.FC<AgentKycPendingScreenProps> = ({ navigation }) => {
    const { fetchMe, me, latestKycDocument, loading } = useAgentStore();
    const [refreshing, setRefreshing] = useState(false);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        const payload = await fetchMe();
        setRefreshing(false);

        if (payload?.profile.verification_status === 'approved') {
            navigation.reset({ index: 0, routes: [{ name: 'AgentTabs' }] });
        }
    }, [fetchMe, navigation]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const isRejected = me?.verification_status === 'rejected';

    return (
        <AgentScreen dark>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing || loading.me} onRefresh={refresh} tintColor={agentTheme.colors.agentPrimary} />}
            >
                <AgentCard style={styles.statusCard}>
                    <AgentChip label={isRejected ? 'rejected' : 'pending'} tone={isRejected ? 'danger' : 'warning'} />
                    <Text style={styles.title}>{isRejected ? 'Verification Rejected' : 'Verification In Progress'}</Text>
                    <Text style={styles.subtitle}>
                        {isRejected
                            ? 'Please review the note and upload corrected documents.'
                            : 'Your documents are under review. Pull down to refresh status.'}
                    </Text>

                    {latestKycDocument?.review_notes ? (
                        <View style={styles.noteBox}>
                            <Text style={styles.noteLabel}>Review Note</Text>
                            <Text style={styles.noteText}>{latestKycDocument.review_notes}</Text>
                        </View>
                    ) : null}

                    {isRejected ? (
                        <AgentButton title="Re-upload Documents" onPress={() => navigation.navigate('AgentKycUpload')} style={{ marginTop: agentTheme.spacing.lg }} />
                    ) : null}
                </AgentCard>
            </ScrollView>
        </AgentScreen>
    );
};

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: agentTheme.spacing.lg,
    },
    statusCard: {
        alignItems: 'flex-start',
    },
    title: {
        ...agentTheme.typography.h1,
        color: agentTheme.colors.textPrimary,
        marginTop: agentTheme.spacing.md,
    },
    subtitle: {
        ...agentTheme.typography.body,
        color: agentTheme.colors.textSecondary,
        marginTop: agentTheme.spacing.sm,
    },
    noteBox: {
        marginTop: agentTheme.spacing.lg,
        borderRadius: agentTheme.radius.md,
        backgroundColor: '#FFF3DF',
        borderWidth: 1,
        borderColor: '#F7D290',
        padding: agentTheme.spacing.md,
        width: '100%',
    },
    noteLabel: {
        ...agentTheme.typography.caption,
        color: '#8A5D00',
        marginBottom: 4,
    },
    noteText: {
        ...agentTheme.typography.bodySmall,
        color: '#6A4A08',
    },
});
