import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/types';
import { dealerTheme } from '../../theme/dealerTheme';
import { useDealerStore } from '../../store';

type DealerKycPendingScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'DealerKycPending'>;
};

const routeByStatus = (status: string, navigation: NativeStackNavigationProp<RootStackParamList, 'DealerKycPending'>) => {
    if (status === 'approved') {
        navigation.reset({ index: 0, routes: [{ name: 'DealerTabs' }] });
        return;
    }
    if (status === 'pending') {
        return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'DealerKycUpload' }] });
};

export const DealerKycPendingScreen: React.FC<DealerKycPendingScreenProps> = ({ navigation }) => {
    const { fetchMe, verificationStatus, docsSummary, latestDocument, loadingMe } = useDealerStore();
    const [refreshing, setRefreshing] = useState(false);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        const me = await fetchMe();
        setRefreshing(false);
        if (me) {
            routeByStatus(String(me.verification_status || 'unverified'), navigation);
        }
    }, [fetchMe, navigation]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const isRejected = verificationStatus === 'rejected';

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing || loadingMe} onRefresh={refresh} tintColor={dealerTheme.colors.dealerPrimary} />}
        >
            <View style={styles.card}>
                <Text style={styles.statusBadge}>{isRejected ? 'REJECTED' : 'PENDING REVIEW'}</Text>
                <Text style={styles.title}>{isRejected ? 'Verification Rejected' : 'Verification In Progress'}</Text>
                <Text style={styles.subtitle}>
                    {isRejected
                        ? 'Please check review notes and re-upload corrected documents.'
                        : 'Our team is reviewing your documents. Pull down to refresh your status.'}
                </Text>

                <View style={styles.metricsRow}>
                    <View style={styles.metricBox}>
                        <Text style={styles.metricValue}>{docsSummary?.pendingCount || 0}</Text>
                        <Text style={styles.metricLabel}>Pending</Text>
                    </View>
                    <View style={styles.metricBox}>
                        <Text style={styles.metricValue}>{docsSummary?.approvedCount || 0}</Text>
                        <Text style={styles.metricLabel}>Approved</Text>
                    </View>
                    <View style={styles.metricBox}>
                        <Text style={styles.metricValue}>{docsSummary?.rejectedCount || 0}</Text>
                        <Text style={styles.metricLabel}>Rejected</Text>
                    </View>
                </View>

                {latestDocument?.review_notes ? (
                    <View style={styles.noteBox}>
                        <Text style={styles.noteLabel}>Review Note</Text>
                        <Text style={styles.noteText}>{latestDocument.review_notes}</Text>
                    </View>
                ) : null}

                {isRejected ? (
                    <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('DealerKycUpload')}>
                        <Text style={styles.primaryButtonText}>Re-upload Documents</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: dealerTheme.spacing.lg,
        backgroundColor: dealerTheme.colors.dealerSurfaceAlt,
    },
    card: {
        backgroundColor: dealerTheme.colors.dealerSurface,
        borderRadius: dealerTheme.radius.lg,
        borderWidth: 1,
        borderColor: dealerTheme.colors.border,
        padding: dealerTheme.spacing.lg,
    },
    statusBadge: {
        ...dealerTheme.typography.caption,
        color: dealerTheme.colors.dealerPrimary,
        marginBottom: dealerTheme.spacing.sm,
    },
    title: {
        ...dealerTheme.typography.h1,
        color: dealerTheme.colors.textPrimary,
    },
    subtitle: {
        ...dealerTheme.typography.body,
        color: dealerTheme.colors.textSecondary,
        marginTop: dealerTheme.spacing.sm,
    },
    metricsRow: {
        flexDirection: 'row',
        marginTop: dealerTheme.spacing.lg,
        gap: dealerTheme.spacing.sm,
    },
    metricBox: {
        flex: 1,
        backgroundColor: '#F5FAFE',
        borderRadius: dealerTheme.radius.md,
        borderWidth: 1,
        borderColor: dealerTheme.colors.border,
        paddingVertical: dealerTheme.spacing.sm,
        alignItems: 'center',
    },
    metricValue: {
        ...dealerTheme.typography.h2,
        color: dealerTheme.colors.textPrimary,
    },
    metricLabel: {
        ...dealerTheme.typography.caption,
        color: dealerTheme.colors.textSecondary,
    },
    noteBox: {
        marginTop: dealerTheme.spacing.lg,
        borderRadius: dealerTheme.radius.md,
        backgroundColor: '#FFF7E7',
        borderWidth: 1,
        borderColor: '#F0D49A',
        padding: dealerTheme.spacing.md,
    },
    noteLabel: {
        ...dealerTheme.typography.caption,
        color: '#7A5B1C',
        marginBottom: 4,
    },
    noteText: {
        ...dealerTheme.typography.bodySmall,
        color: '#624D22',
    },
    primaryButton: {
        marginTop: dealerTheme.spacing.lg,
        backgroundColor: dealerTheme.colors.dealerPrimary,
        borderRadius: dealerTheme.radius.md,
        paddingVertical: dealerTheme.spacing.sm,
        alignItems: 'center',
    },
    primaryButtonText: {
        ...dealerTheme.typography.button,
        color: dealerTheme.colors.textOnPrimary,
    },
});

