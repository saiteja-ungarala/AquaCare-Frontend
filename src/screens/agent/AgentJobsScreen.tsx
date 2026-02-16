import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentJob, RootStackParamList } from '../../models/types';
import { agentTheme } from '../../theme/agentTheme';
import { AgentButton, AgentCard, AgentChip, AgentScreen, AgentSectionHeader } from '../../components/agent';
import { useAgentEarnStore, useAgentStore } from '../../store';
import { showAgentToast } from '../../utils/agentToast';

type AgentJobsScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'AgentJobs'>;
};

type FilterType = 'all' | 'nearby' | 'today' | 'urgent';

const FILTERS: Array<{ id: FilterType; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'nearby', label: 'Nearby' },
    { id: 'today', label: 'Today' },
    { id: 'urgent', label: 'Urgent' },
];

const toDateTimeValue = (date: string, time: string) => {
    const parsed = new Date(`${date}T${time || '00:00:00'}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatSlot = (date: string, time: string) => {
    const parsed = toDateTimeValue(date, time);
    if (!parsed) return `${date} ${time}`.trim();
    return parsed.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const isTodayDate = (date: string, time: string): boolean => {
    const parsed = toDateTimeValue(date, time);
    if (!parsed) return false;
    const now = new Date();
    return parsed.getDate() === now.getDate() && parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear();
};

const statusTone = (status: string): 'default' | 'success' | 'warning' | 'danger' => {
    if (status === 'completed') return 'success';
    if (status === 'in_progress' || status === 'assigned') return 'warning';
    if (status === 'cancelled') return 'danger';
    return 'default';
};

export const AgentJobsScreen: React.FC<AgentJobsScreenProps> = ({ navigation }) => {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [refreshing, setRefreshing] = useState(false);

    const {
        me,
        isOnline,
        jobs,
        loading,
        error,
        fetchMe,
        fetchJobs,
        toggleOnline,
        accept,
        reject,
        clearError,
    } = useAgentStore();
    const {
        campaigns,
        activeCampaignId,
        progress,
        fetchSummary,
        fetchCampaigns,
    } = useAgentEarnStore();

    const loadData = useCallback(async () => {
        const profile = await fetchMe();
        if (!profile) return;

        if (profile.profile.verification_status !== 'approved') {
            navigation.reset({ index: 0, routes: [{ name: 'AgentEntry' }] });
            return;
        }

        await fetchJobs();
        await Promise.all([fetchSummary(), fetchCampaigns()]);
    }, [fetchCampaigns, fetchJobs, fetchMe, fetchSummary, navigation]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    useFocusEffect(
        useCallback(() => {
            if (!isOnline) return;

            const interval = setInterval(() => {
                fetchJobs();
            }, 50000);

            return () => clearInterval(interval);
        }, [isOnline, fetchJobs])
    );

    useEffect(() => {
        if (!error) return;
        showAgentToast(error);
        clearError();
    }, [clearError, error]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const filteredJobs = useMemo(() => {
        const availableJobs = jobs.filter((job) => job.status === 'pending' || job.status === 'confirmed');

        return availableJobs.filter((job) => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'nearby') return job.distance_km !== null;
            if (activeFilter === 'today') return isTodayDate(job.scheduled_date, job.scheduled_time);
            if (activeFilter === 'urgent') {
                const slot = toDateTimeValue(job.scheduled_date, job.scheduled_time);
                if (!slot) return true;
                return slot.getTime() - Date.now() <= 6 * 60 * 60 * 1000;
            }
            return true;
        });
    }, [activeFilter, jobs]);

    const activeCampaign = useMemo(() => {
        if (activeCampaignId) {
            const campaign = campaigns.find((item) => item.id === activeCampaignId);
            if (campaign) return campaign;
        }
        return campaigns[0] || null;
    }, [activeCampaignId, campaigns]);

    const nextTier = useMemo(() => {
        if (!activeCampaign || !progress || progress.nextThreshold === null) return null;
        return activeCampaign.tiers.find((tier) => tier.thresholdQty === progress.nextThreshold) || null;
    }, [activeCampaign, progress]);

    const earnBannerMessage = useMemo(() => {
        if (activeCampaign && progress && nextTier) {
            return `Sell ${progress.remainingToNextThreshold} more to earn Rs ${nextTier.bonusAmount.toLocaleString('en-IN')} bonus`;
        }
        if (activeCampaign && progress) {
            return `Campaign progress: ${progress.soldQty} sold so far`;
        }
        return 'Track referral earnings and campaign bonuses';
    }, [activeCampaign, progress, nextTier]);

    const handleAccept = async (bookingId: string) => {
        const ok = await accept(bookingId);
        if (!ok) return;
        showAgentToast('Job accepted');
        await fetchJobs();
        navigation.navigate('AgentActiveJob');
    };

    const handleReject = async (bookingId: string) => {
        const ok = await reject(bookingId);
        if (!ok) return;
        showAgentToast('Job rejected');
        await fetchJobs();
    };

    const handleOnlineToggle = (nextValue: boolean) => {
        void toggleOnline(nextValue);
    };

    const renderJob = ({ item }: { item: AgentJob }) => {
        const location = [item.address_city, item.address_line1].filter(Boolean).join(', ');

        return (
            <AgentCard style={styles.jobCard}>
                <View style={styles.topRow}>
                    <Text style={styles.serviceName}>{item.service_name || 'Service job'}</Text>
                    <AgentChip label={item.status.replace('_', ' ')} tone={statusTone(item.status)} />
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={14} color={agentTheme.colors.textSecondary} />
                    <Text style={styles.infoText}>{formatSlot(item.scheduled_date, item.scheduled_time)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color={agentTheme.colors.textSecondary} />
                    <Text style={styles.infoText} numberOfLines={1}>{location || 'Address not available'}</Text>
                </View>

                <View style={styles.actions}>
                    <AgentButton
                        title="Reject"
                        variant="secondary"
                        onPress={() => handleReject(item.id)}
                        disabled={loading.action}
                        style={styles.actionBtn}
                    />
                    <AgentButton
                        title="Accept"
                        onPress={() => handleAccept(item.id)}
                        disabled={loading.action}
                        style={styles.actionBtn}
                    />
                </View>
            </AgentCard>
        );
    };

    return (
        <AgentScreen>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Jobs</Text>
                    <Text style={styles.headerSubtitle}>Find and accept nearby service requests</Text>
                </View>
                <View style={styles.onlineWrap}>
                    <Text style={styles.onlineText}>{isOnline ? 'Online' : 'Offline'}</Text>
                    <Switch
                        value={isOnline}
                        onValueChange={handleOnlineToggle}
                        trackColor={{ false: '#D1D7DE', true: agentTheme.colors.agentPrimary }}
                        thumbColor={isOnline ? '#3D2A00' : '#6B7885'}
                        disabled={loading.online}
                    />
                </View>
            </View>

            <View style={styles.filterRow}>
                {FILTERS.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        style={[styles.filterPill, activeFilter === filter.id ? styles.filterPillActive : null]}
                        onPress={() => setActiveFilter(filter.id)}
                    >
                        <Text style={[styles.filterText, activeFilter === filter.id ? styles.filterTextActive : null]}>{filter.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.earnBanner}
                onPress={() => navigation.navigate('AgentEarn')}
            >
                <View style={styles.earnBannerLeft}>
                    <Text style={styles.earnBannerTitle}>{activeCampaign?.name || 'Earn More'}</Text>
                    <Text style={styles.earnBannerText}>{earnBannerMessage}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={agentTheme.colors.agentPrimary} />
            </TouchableOpacity>

            <FlatList
                data={filteredJobs}
                keyExtractor={(item) => item.id}
                renderItem={renderJob}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing || loading.jobs} onRefresh={onRefresh} tintColor={agentTheme.colors.agentPrimary} />}
                ListHeaderComponent={<AgentSectionHeader title="Available Jobs" subtitle={`${filteredJobs.length} jobs`} />}
                ListEmptyComponent={
                    <AgentCard style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>No jobs right now</Text>
                        <Text style={styles.emptySubtitle}>Keep online mode enabled and pull to refresh.</Text>
                    </AgentCard>
                }
            />
        </AgentScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: agentTheme.colors.agentDark,
        paddingHorizontal: agentTheme.spacing.lg,
        paddingTop: agentTheme.spacing.md,
        paddingBottom: agentTheme.spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        ...agentTheme.typography.h1,
        color: agentTheme.colors.textOnDark,
    },
    headerSubtitle: {
        ...agentTheme.typography.bodySmall,
        color: '#AAB6C2',
        marginTop: 2,
    },
    onlineWrap: {
        alignItems: 'center',
        gap: 6,
    },
    onlineText: {
        ...agentTheme.typography.caption,
        color: agentTheme.colors.agentPrimary,
    },
    filterRow: {
        flexDirection: 'row',
        gap: agentTheme.spacing.sm,
        paddingHorizontal: agentTheme.spacing.lg,
        marginTop: -14,
    },
    earnBanner: {
        marginTop: agentTheme.spacing.md,
        marginHorizontal: agentTheme.spacing.lg,
        borderRadius: agentTheme.radius.md,
        borderWidth: 1,
        borderColor: '#F6D485',
        backgroundColor: '#FFF4D6',
        paddingHorizontal: agentTheme.spacing.md,
        paddingVertical: agentTheme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: agentTheme.spacing.sm,
    },
    earnBannerLeft: {
        flex: 1,
    },
    earnBannerTitle: {
        ...agentTheme.typography.caption,
        color: '#6E4C00',
    },
    earnBannerText: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textPrimary,
        marginTop: 2,
    },
    filterPill: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: agentTheme.radius.full,
        backgroundColor: agentTheme.colors.agentSurface,
        borderWidth: 1,
        borderColor: agentTheme.colors.border,
    },
    filterPillActive: {
        borderColor: agentTheme.colors.agentPrimary,
        backgroundColor: '#FFEBC1',
    },
    filterText: {
        ...agentTheme.typography.caption,
        color: agentTheme.colors.textSecondary,
    },
    filterTextActive: {
        color: '#815900',
    },
    listContent: {
        paddingHorizontal: agentTheme.spacing.lg,
        paddingTop: agentTheme.spacing.md,
        paddingBottom: agentTheme.spacing.xxl,
        gap: agentTheme.spacing.md,
    },
    jobCard: {
        gap: 8,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: agentTheme.spacing.sm,
    },
    serviceName: {
        ...agentTheme.typography.h2,
        color: agentTheme.colors.textPrimary,
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: agentTheme.spacing.sm,
        marginTop: agentTheme.spacing.sm,
    },
    actionBtn: {
        flex: 1,
    },
    emptyCard: {
        marginTop: agentTheme.spacing.md,
    },
    emptyTitle: {
        ...agentTheme.typography.h2,
        color: agentTheme.colors.textPrimary,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 6,
    },
});
