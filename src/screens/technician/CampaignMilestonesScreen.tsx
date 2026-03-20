import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackScreenProps } from '../../models/types';
import { TechnicianButton, TechnicianCard, TechnicianChip, TechnicianScreen, TechnicianSectionHeader } from '../../components/technician';
import { technicianTheme } from '../../theme/technicianTheme';
import { useTechnicianEarnStore } from '../../store';
import { showTechnicianToast } from '../../utils/technicianToast';

type CampaignMilestonesScreenProps = RootStackScreenProps<'TechnicianCampaignMilestones'>;

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
    } = useTechnicianEarnStore();

    useFocusEffect(
        useCallback(() => {
            void fetchCampaigns();
            void fetchProgress(campaignId);
        }, [campaignId, fetchCampaigns, fetchProgress])
    );

    useEffect(() => {
        if (!error) return;
        showTechnicianToast(error);
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
        <TechnicianScreen>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || loading.progress || loading.campaigns}
                        onRefresh={onRefresh}
                        tintColor={technicianTheme.colors.agentPrimary}
                    />
                }
            >
                <TechnicianSectionHeader
                    title="Campaign Milestones"
                    subtitle={campaign?.name || 'Current campaign'}
                    actionLabel="Back"
                    onActionPress={() => navigation.goBack()}
                />

                <TechnicianCard>
                    <Text style={styles.metaLine}>Sold quantity: {progress?.soldQty ?? 0}</Text>
                    <Text style={styles.metaLine}>Next threshold: {progress?.nextThreshold ?? '-'}</Text>
                    <Text style={styles.metaLine}>Bonuses earned: {formatCurrency(progress?.bonusesEarned ?? 0)}</Text>
                </TechnicianCard>

                {hasMilestones ? (
                    campaign!.tiers.map((tier) => {
                        const isReached = reachedThresholds.has(tier.thresholdQty);
                        const remaining = Math.max(0, tier.thresholdQty - (progress?.soldQty ?? 0));

                        return (
                            <TechnicianCard key={`${campaignId}-${tier.thresholdQty}`}>
                                <View style={styles.tierRow}>
                                    <View style={styles.tierTextWrap}>
                                        <Text style={styles.tierTitle}>{tier.thresholdQty} sold</Text>
                                        <Text style={styles.tierSubtitle}>Bonus {formatCurrency(tier.bonusAmount)}</Text>
                                    </View>
                                    <TechnicianChip
                                        label={isReached ? 'achieved' : 'upcoming'}
                                        tone={isReached ? 'success' : 'warning'}
                                    />
                                </View>
                                {!isReached ? (
                                    <Text style={styles.remainingText}>
                                        {remaining} more to unlock this bonus
                                    </Text>
                                ) : null}
                            </TechnicianCard>
                        );
                    })
                ) : (
                    <TechnicianCard>
                        <Text style={styles.emptyTitle}>No milestone tiers found</Text>
                        <Text style={styles.emptySubtitle}>Campaign milestone details will appear once available.</Text>
                    </TechnicianCard>
                )}

                <TechnicianButton title="Back to Earn" variant="secondary" onPress={() => navigation.goBack()} />
            </ScrollView>
        </TechnicianScreen>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: technicianTheme.spacing.lg,
        gap: technicianTheme.spacing.md,
        paddingBottom: technicianTheme.spacing.xxl,
    },
    metaLine: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
        marginBottom: 6,
    },
    tierRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: technicianTheme.spacing.sm,
    },
    tierTextWrap: {
        flex: 1,
    },
    tierTitle: {
        ...technicianTheme.typography.h2,
        color: technicianTheme.colors.textPrimary,
    },
    tierSubtitle: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
        marginTop: 4,
    },
    remainingText: {
        ...technicianTheme.typography.caption,
        color: '#7A5B13',
        marginTop: 8,
    },
    emptyTitle: {
        ...technicianTheme.typography.h2,
        color: technicianTheme.colors.textPrimary,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 6,
    },
});
