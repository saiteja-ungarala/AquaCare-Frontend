import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../models/types';
import { technicianTheme } from '../../theme/technicianTheme';
import {
    TechnicianButton,
    TechnicianCard,
    TechnicianChip,
    TechnicianScreen,
} from '../../components/technician';
import { useAuthStore, useTechnicianStore } from '../../store';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'TechnicianKycPending'>;
};

export const TechnicianKycPendingScreen: React.FC<Props> = ({ navigation }) => {
    const { fetchMe, me, kycStatus, latestKycDocument, loading, reset } = useTechnicianStore();
    const { logout, isLoading: authLoading } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);

    const handleLogout = useCallback(async () => {
        reset();
        await logout();
    }, [logout, reset]);

    const checkAndNavigate = useCallback(async () => {
        const payload = await fetchMe();
        if (!payload) return;

        const status = payload.profile.verification_status;
        console.log('[KycPending] verification_status from API:', status);

        if (status === 'approved') {
            navigation.reset({ index: 0, routes: [{ name: 'TechnicianTabs' }] });
        } else if (status === 'unverified') {
            navigation.reset({ index: 0, routes: [{ name: 'TechnicianKycUpload' }] });
        }
        // 'pending' | 'rejected' | 'suspended' → stay on this screen, UI updates from kycStatus
    }, [fetchMe, navigation]);

    useFocusEffect(
        useCallback(() => {
            void checkAndNavigate();
        }, [checkAndNavigate])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await checkAndNavigate();
        setRefreshing(false);
    }, [checkAndNavigate]);

    const status = kycStatus;
    const isRejected = status === 'rejected';
    const isSuspended = status === 'suspended';
    const isPending = !status || status === 'pending';

    const chipLabel = isSuspended ? 'Suspended' : isRejected ? 'Rejected' : 'Pending';
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
            : 'Our team is reviewing your KYC. You will be able to accept jobs once approved.';

    const noteText = isSuspended
        ? (me?.suspension_reason ?? latestKycDocument?.review_notes ?? null)
        : isRejected
            ? (me?.rejection_reason ?? latestKycDocument?.review_notes ?? null)
            : null;

    if (loading.me && !me) {
        return (
            <TechnicianScreen dark>
                <View style={styles.loaderWrap}>
                    <ActivityIndicator size="large" color={technicianTheme.colors.agentPrimary} />
                    <Text style={styles.loaderText}>Checking verification status...</Text>
                </View>
            </TechnicianScreen>
        );
    }

    return (
        <TechnicianScreen dark>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || loading.me}
                        onRefresh={onRefresh}
                        tintColor={technicianTheme.colors.agentPrimary}
                    />
                }
            >
                <View style={styles.navRow}>
                    {navigation.canGoBack() ? (
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={20} color={technicianTheme.colors.agentPrimary} />
                            <Text style={styles.backBtnText}>Back</Text>
                        </TouchableOpacity>
                    ) : (
                        <TechnicianButton
                            title="Logout"
                            variant="secondary"
                            onPress={() => void handleLogout()}
                            loading={authLoading}
                            disabled={authLoading}
                            style={styles.exitBtn}
                        />
                    )}
                </View>
                <TechnicianCard style={styles.statusCard}>
                    <TechnicianChip label={chipLabel} tone={chipTone} />

                    <Text style={styles.title}>{titleText}</Text>
                    <Text style={styles.subtitle}>{subtitleText}</Text>

                    {isPending && !isRejected && !isSuspended && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>What happens next</Text>
                            <Text style={styles.infoText}>
                                Your documents are in the review queue. You will get access to
                                technician jobs as soon as our admin approves your account.
                            </Text>
                            <Text style={styles.infoText}>
                                Pull down or tap the button below to refresh your status.
                            </Text>
                        </View>
                    )}

                    {noteText ? (
                        <View style={[styles.noteBox, isSuspended && styles.noteBoxDanger]}>
                            <Text style={[styles.noteLabel, isSuspended && styles.noteLabelDanger]}>
                                {isSuspended ? 'Suspension Reason' : 'Review Note'}
                            </Text>
                            <Text style={[styles.noteText, isSuspended && styles.noteTextDanger]}>
                                {noteText}
                            </Text>
                        </View>
                    ) : null}

                    {isPending && !isRejected && !isSuspended && (
                        <TechnicianButton
                            title={loading.me ? 'Checking...' : 'Refresh Status'}
                            onPress={onRefresh}
                            loading={loading.me}
                            style={styles.refreshBtn}
                        />
                    )}

                    {isRejected && !isSuspended && (
                        <TechnicianButton
                            title="Re-upload Documents"
                            onPress={() => navigation.navigate('TechnicianKycUpload')}
                            style={styles.refreshBtn}
                        />
                    )}

                    <TechnicianButton
                        title="Logout"
                        variant="secondary"
                        onPress={() => void handleLogout()}
                        loading={authLoading}
                        disabled={authLoading}
                        style={styles.logoutBtn}
                    />
                </TechnicianCard>
            </ScrollView>
        </TechnicianScreen>
    );
};

const styles = StyleSheet.create({
    loaderWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: technicianTheme.spacing.md,
    },
    loaderText: {
        ...technicianTheme.typography.bodySmall,
        color: '#B4BFCA',
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: technicianTheme.spacing.lg,
    },
    navRow: {
        marginBottom: technicianTheme.spacing.md,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
    },
    backBtnText: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.agentPrimary,
        fontWeight: '600',
    },
    exitBtn: {
        alignSelf: 'flex-start',
        minWidth: 112,
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
        lineHeight: 22,
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
        lineHeight: 18,
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
        lineHeight: 18,
    },
    noteTextDanger: {
        color: '#6A0808',
    },
    refreshBtn: {
        marginTop: technicianTheme.spacing.lg,
        width: '100%',
    },
    logoutBtn: {
        marginTop: technicianTheme.spacing.md,
        width: '100%',
    },
});