import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackScreenProps } from '../../models/types';
import { AgentButton, AgentCard, AgentChip, AgentScreen, AgentSectionHeader } from '../../components/agent';
import { agentTheme } from '../../theme/agentTheme';
import { useAgentEarnStore } from '../../store';
import { showAgentToast } from '../../utils/agentToast';

type CampaignMilestonesScreenProps = RootStackScreenProps<'AgentCampaignMilestones'>;

const formatCurrency = (amount: number): string => {
    return `Rs ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

export const CampaignMilestonesScreen: React.FC<CampaignMilestonesScreenProps> = ({ route, navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const { campaignId } = route.params;

    const {
        campaigns,
        progress,
        loading,
        error,
        fetchCampaigns,
        fetchProgress,
        clearError,
    } = useAgentEarnStore();

    useFocusEffect(
        useCallback(() => {
            void fetchCampaigns();
            void fetchProgress(campaignId);
        }, [campaignId, fetchCampaigns, fetchProgress])
    );

    useEffect(() => {
        if (!error) return;
        showAgentToast(error);
        clearError();
    }, [clearError, error]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchCampaigns(), fetchProgress(campaignId)]);
        setRefreshing(false);
    }, [campaignId, fetchCampaigns, fetchProgress]);

    const campaign = useMemo(
        () => campaigns.find((item) => item.id === campaignId) || null,
        [campaignId, campaigns]
    );

    const reachedThresholds = useMemo(() => {
        return new Set((progress?.tiersReached || []).map((tier) => tier.thresholdQty));
    }, [progress]);

    const hasMilestones = (campaign?.tiers || []).length > 0;

    return (
        <AgentScreen>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || loading.progress || loading.campaigns}
                        onRefresh={onRefresh}
                        tintColor={agentTheme.colors.agentPrimary}
                    />
                }
            >
                <AgentSectionHeader
                    title="Campaign Milestones"
                    subtitle={campaign?.name || 'Current campaign'}
                    actionLabel="Back"
                    onActionPress={() => navigation.goBack()}
                />

                <AgentCard>
                    <Text style={styles.metaLine}>Sold quantity: {progress?.soldQty ?? 0}</Text>
                    <Text style={styles.metaLine}>Next threshold: {progress?.nextThreshold ?? '-'}</Text>
                    <Text style={styles.metaLine}>Bonuses earned: {formatCurrency(progress?.bonusesEarned ?? 0)}</Text>
                </AgentCard>

                {hasMilestones ? (
                    campaign!.tiers.map((tier) => {
                        const isReached = reachedThresholds.has(tier.thresholdQty);
                        const remaining = Math.max(0, tier.thresholdQty - (progress?.soldQty ?? 0));

                        return (
                            <AgentCard key={`${campaignId}-${tier.thresholdQty}`}>
                                <View style={styles.tierRow}>
                                    <View style={styles.tierTextWrap}>
                                        <Text style={styles.tierTitle}>{tier.thresholdQty} sold</Text>
                                        <Text style={styles.tierSubtitle}>Bonus {formatCurrency(tier.bonusAmount)}</Text>
                                    </View>
                                    <AgentChip
                                        label={isReached ? 'achieved' : 'upcoming'}
                                        tone={isReached ? 'success' : 'warning'}
                                    />
                                </View>
                                {!isReached ? (
                                    <Text style={styles.remainingText}>
                                        {remaining} more to unlock this bonus
                                    </Text>
                                ) : null}
                            </AgentCard>
                        );
                    })
                ) : (
                    <AgentCard>
                        <Text style={styles.emptyTitle}>No milestone tiers found</Text>
                        <Text style={styles.emptySubtitle}>Campaign milestone details will appear once available.</Text>
                    </AgentCard>
                )}

                <AgentButton title="Back to Earn" variant="secondary" onPress={() => navigation.goBack()} />
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
    metaLine: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        marginBottom: 6,
    },
    tierRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: agentTheme.spacing.sm,
    },
    tierTextWrap: {
        flex: 1,
    },
    tierTitle: {
        ...agentTheme.typography.h2,
        color: agentTheme.colors.textPrimary,
    },
    tierSubtitle: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        marginTop: 4,
    },
    remainingText: {
        ...agentTheme.typography.caption,
        color: '#7A5B13',
        marginTop: 8,
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
