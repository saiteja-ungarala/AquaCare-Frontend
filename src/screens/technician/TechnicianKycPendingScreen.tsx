import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/types';
import { technicianTheme } from '../../theme/technicianTheme';
import { TechnicianButton, TechnicianCard, TechnicianChip, TechnicianScreen } from '../../components/technician';
import { useTechnicianStore } from '../../store';

type TechnicianKycPendingScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'TechnicianKycPending'>;
};

export const TechnicianKycPendingScreen: React.FC<TechnicianKycPendingScreenProps> = ({ navigation }) => {
    const { fetchMe, me, latestKycDocument, loading } = useTechnicianStore();
    const [refreshing, setRefreshing] = useState(false);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        const payload = await fetchMe();
        setRefreshing(false);

        if (payload?.profile.verification_status === 'approved') {
            navigation.reset({ index: 0, routes: [{ name: 'TechnicianTabs' }] });
        }
    }, [fetchMe, navigation]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const isRejected = me?.verification_status === 'rejected';

    return (
        <TechnicianScreen dark>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing || loading.me} onRefresh={refresh} tintColor={technicianTheme.colors.agentPrimary} />}
            >
                <TechnicianCard style={styles.statusCard}>
                    <TechnicianChip label={isRejected ? 'rejected' : 'pending'} tone={isRejected ? 'danger' : 'warning'} />
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
                        <TechnicianButton title="Re-upload Documents" onPress={() => navigation.navigate('TechnicianKycUpload')} style={{ marginTop: technicianTheme.spacing.lg }} />
                    ) : null}
                </TechnicianCard>
            </ScrollView>
        </TechnicianScreen>
    );
};

const styles = StyleSheet.create({
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: technicianTheme.spacing.lg,
    },
    statusCard: {
        alignItems: 'flex-start',
    },
    title: {
        ...technicianTheme.typography.h1,
        color: technicianTheme.colors.textPrimary,
        marginTop: technicianTheme.spacing.md,
    },
    subtitle: {
        ...technicianTheme.typography.body,
        color: technicianTheme.colors.textSecondary,
        marginTop: technicianTheme.spacing.sm,
    },
    noteBox: {
        marginTop: technicianTheme.spacing.lg,
        borderRadius: technicianTheme.radius.md,
        backgroundColor: '#FFF3DF',
        borderWidth: 1,
        borderColor: '#F7D290',
        padding: technicianTheme.spacing.md,
        width: '100%',
    },
    noteLabel: {
        ...technicianTheme.typography.caption,
        color: '#8A5D00',
        marginBottom: 4,
    },
    noteText: {
        ...technicianTheme.typography.bodySmall,
        color: '#6A4A08',
    },
});
