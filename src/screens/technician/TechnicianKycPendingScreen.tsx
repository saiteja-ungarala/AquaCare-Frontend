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

        if (!payload) return;
        const status = payload.profile.verification_status;
        if (status === 'approved') {
            navigation.reset({ index: 0, routes: [{ name: 'TechnicianTabs' }] });
        } else if (status === 'unverified') {
            navigation.reset({ index: 0, routes: [{ name: 'TechnicianKycUpload' }] });
        }
    }, [fetchMe, navigation]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const status = me?.verification_status;
    const isRejected = status === 'rejected';
    const isSuspended = status === 'suspended';

    const chipLabel = isSuspended ? 'suspended' : isRejected ? 'rejected' : 'pending';
    const chipTone: 'danger' | 'warning' = (isRejected || isSuspended) ? 'danger' : 'warning';

    const titleText = isSuspended
        ? 'Account Suspended'
        : isRejected
            ? 'Verification Rejected'
            : 'Verification In Progress';

    const subtitleText = isSuspended
        ? 'Your account has been suspended. Please contact support for assistance.'
        : isRejected
            ? 'Please review the note below and upload corrected documents.'
            : 'Your application has been submitted successfully. Our admin team will review it within 24 hours.';

    const noteText = isSuspended
        ? (me?.suspension_reason ?? latestKycDocument?.review_notes ?? null)
        : isRejected
            ? (me?.rejection_reason ?? latestKycDocument?.review_notes ?? null)
            : null;

    return (
        <TechnicianScreen dark>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing || loading.me} onRefresh={refresh} tintColor={technicianTheme.colors.agentPrimary} />}
            >
                <TechnicianCard style={styles.statusCard}>
                    <TechnicianChip label={chipLabel} tone={chipTone} />
                    <Text style={styles.title}>{titleText}</Text>
                    <Text style={styles.subtitle}>{subtitleText}</Text>

                    {!isRejected && !isSuspended ? (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>What happens next</Text>
                            <Text style={styles.infoText}>
                                Your documents are in the review queue. You will get access to technician jobs as soon as our admin approves your account.
                            </Text>
                            <Text style={styles.infoText}>Pull down anytime to refresh your approval status.</Text>
                        </View>
                    ) : null}

                    {noteText ? (
                        <View style={[styles.noteBox, isSuspended && styles.noteBoxDanger]}>
                            <Text style={[styles.noteLabel, isSuspended && styles.noteLabelDanger]}>
                                {isSuspended ? 'Suspension Reason' : 'Review Note'}
                            </Text>
                            <Text style={[styles.noteText, isSuspended && styles.noteTextDanger]}>{noteText}</Text>
                        </View>
                    ) : null}

                    {isRejected && !isSuspended ? (
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
    infoBox: {
        marginTop: technicianTheme.spacing.lg,
        borderRadius: technicianTheme.radius.md,
        backgroundColor: '#FFF7E7',
        borderWidth: 1,
        borderColor: '#F4D28C',
        padding: technicianTheme.spacing.md,
        width: '100%',
    },
    infoLabel: {
        ...technicianTheme.typography.caption,
        color: '#8A5D00',
        marginBottom: 6,
    },
    infoText: {
        ...technicianTheme.typography.bodySmall,
        color: '#6A4A08',
        marginBottom: 4,
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
    noteBoxDanger: {
        backgroundColor: '#FFF0F0',
        borderColor: '#FFAAAA',
    },
    noteLabel: {
        ...technicianTheme.typography.caption,
        color: '#8A5D00',
        marginBottom: 4,
    },
    noteLabelDanger: {
        color: '#8A0000',
    },
    noteText: {
        ...technicianTheme.typography.bodySmall,
        color: '#6A4A08',
    },
    noteTextDanger: {
        color: '#6A0808',
    },
});
