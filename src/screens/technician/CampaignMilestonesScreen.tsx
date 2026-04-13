import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackScreenProps } from '../../models/types';
import { TechnicianButton, TechnicianCard, TechnicianChip, TechnicianScreen, TechnicianSectionHeader } from '../../components/technician';
import { technicianTheme } from '../../theme/technicianTheme';
import { useTechnicianEarnStore, useTechnicianStore } from '../../store';
import { showTechnicianToast } from '../../utils/technicianToast';
import { getTechnicianKycGateRoute, isTechnicianKycApproved } from '../../utils/technicianKyc';

type CampaignMilestonesScreenProps = RootStackScreenProps<'TechnicianCampaignMilestones'>;

const formatCurrency = (amount: number): string => {
    return `Rs ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

export const CampaignMilestonesScreen: React.FC<CampaignMilestonesScreenProps> = ({ route, navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const { campaignId } = route.params;

    const { fetchMe, kycStatus } = useTechnicianStore();
    const {
        campaigns,
        progress,
        loading,
        error,
        fetchCampaigns,
        fetchProgress,
        clearError,
    } = useTechnicianEarnStore();
    const isKycApproved = isTechnicianKycApproved(kycStatus);
    const kycGateRoute = getTechnicianKycGateRoute(kycStatus);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                const profile = await fetchMe();
                if (!profile) return;

                if (!isTechnicianKycApproved(profile.profile.verification_status)) {
                    const nextRoute = getTechnicianKycGateRoute(profile.profile.verification_status);
                    navigation.reset({ index: 0, routes: [{ name: nextRoute }] });
                    return;
                }

                await Promise.all([fetchCampaigns(), fetchProgress(campaignId)]);
            };

            void loadData();
        }, [campaignId, fetchCampaigns, fetchMe, fetchProgress, navigation])
    );

    useEffect(() => {
        if (!error) return;
        showTechnicianToast(error);
        clearError();
    }, [clearError, error]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        const profile = await fetchMe();
        if (profile && isTechnicianKycApproved(profile.profile.verification_status)) {
            await Promise.all([fetchCampaigns(), fetchProgress(campaignId)]);
        } else if (profile) {
            const nextRoute = getTechnicianKycGateRoute(profile.profile.verification_status);
            navigation.reset({ index: 0, routes: [{ name: nextRoute }] });
        }
        setRefreshing(false);
    }, [campaignId, fetchCampaigns, fetchMe, fetchProgress, navigation]);

    const campaign = useMemo(
        () => campaigns.find((item) => item.id === campaignId) || null,
        [campaignId, campaigns]
    );

    const reachedThresholds = useMemo(() => {
        return new Set((progress?.tiersReached || []).map((tier) => tier.thresholdQty));
    }, [progress]);

    const hasMilestones = (campaign?.tiers || []).length > 0;

    if (!isKycApproved) {
        return (
            <TechnicianScreen>
                <View style={styles.lockWrap}>
                    <TechnicianCard style={styles.lockCard}>
                        <Ionicons name="lock-closed" size={26} color={technicianTheme.colors.agentPrimary} />
                        <Text style={styles.lockTitle}>KYC approval required</Text>
                        <Text style={styles.lockSubtitle}>
                            Campaign bonuses are visible only after KYC approval.
                        </Text>
                        <TechnicianButton
                            title="Complete KYC"
                            onPress={() => navigation.navigate(kycGateRoute)}
                            style={styles.lockBtn}
                        />
                    </TechnicianCard>
                </View>
            </TechnicianScreen>
        );
    }

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
    lockWrap: {
        flex: 1,
        justifyContent: 'center',
        padding: technicianTheme.spacing.lg,
    },
    lockCard: {
        alignItems: 'center',
    },
    lockTitle: {
        ...technicianTheme.typography.h2,
        color: technicianTheme.colors.textPrimary,
        marginTop: technicianTheme.spacing.sm,
    },
    lockSubtitle: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
        marginTop: technicianTheme.spacing.xs,
        textAlign: 'center',
    },
    lockBtn: {
        marginTop: technicianTheme.spacing.md,
        width: '100%',
    },
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
