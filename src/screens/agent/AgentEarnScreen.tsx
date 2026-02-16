import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentCampaign, AgentProductCommissionPreview, RootStackParamList } from '../../models/types';
import { AgentButton, AgentCard, AgentChip, AgentScreen, AgentSectionHeader } from '../../components/agent';
import { agentTheme } from '../../theme/agentTheme';
import { useAgentEarnStore, useAgentStore } from '../../store';
import { showAgentToast } from '../../utils/agentToast';

type AgentEarnScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'AgentEarn'>;
};

const formatCurrency = (amount: number): string => {
    return `Rs ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const getDaysLeft = (endAt?: string): number | null => {
    if (!endAt) return null;
    const endDate = new Date(endAt);
    if (Number.isNaN(endDate.getTime())) return null;
    const diffMs = endDate.getTime() - Date.now();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
};

const getWhySellText = (item: AgentProductCommissionPreview): string => {
    if ((item.commissionAmount || 0) >= 200) return 'High commission potential';
    if ((item.price || 0) <= 4000) return 'Budget-friendly for most customers';
    if (item.commissionType === 'percent') return 'Better earnings on premium sales';
    return 'Popular add-on for service visits';
};

const getCommissionText = (item: AgentProductCommissionPreview): string => {
    if (!item.commissionType || item.commissionValue === null) {
        return 'Commission details available soon';
    }

    if (item.commissionType === 'flat') {
        return `${formatCurrency(item.commissionValue)} per unit`;
    }

    const amountHint = item.commissionAmount !== null ? ` (~${formatCurrency(item.commissionAmount)})` : '';
    return `${item.commissionValue}%${amountHint}`;
};

const getActiveCampaign = (
    campaigns: AgentCampaign[],
    activeCampaignId: number | null
): AgentCampaign | null => {
    if (activeCampaignId) {
        const matched = campaigns.find((campaign) => campaign.id === activeCampaignId);
        if (matched) return matched;
    }

    return campaigns[0] || null;
};

export const AgentEarnScreen: React.FC<AgentEarnScreenProps> = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);

    const {
        referralCode,
        summary,
        campaigns,
        activeCampaignId,
        progress,
        productsWithCommissionPreview,
        loading,
        error,
        refreshAll,
        fetchSummary,
        clearError,
    } = useAgentEarnStore();
    const { isOnline } = useAgentStore();

    const activeCampaign = useMemo(
        () => getActiveCampaign(campaigns, activeCampaignId),
        [campaigns, activeCampaignId]
    );

    useFocusEffect(
        useCallback(() => {
            void refreshAll();
        }, [refreshAll])
    );

    useFocusEffect(
        useCallback(() => {
            if (!isOnline) return;

            const interval = setInterval(() => {
                void fetchSummary();
            }, 60000);

            return () => clearInterval(interval);
        }, [isOnline, fetchSummary])
    );

    useEffect(() => {
        if (!error) return;
        showAgentToast(error);
        clearError();
    }, [clearError, error]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshAll();
        setRefreshing(false);
    }, [refreshAll]);

    const daysLeft = getDaysLeft(activeCampaign?.endAt);

    const nextTier = useMemo(() => {
        if (!activeCampaign || !progress || progress.nextThreshold === null) {
            return null;
        }

        return activeCampaign.tiers.find((tier) => tier.thresholdQty === progress.nextThreshold) || null;
    }, [activeCampaign, progress]);

    const campaignMessage = useMemo(() => {
        if (!activeCampaign || !progress) {
            return 'No active campaign right now. Keep sharing your referral code.';
        }

        if (progress.nextThreshold !== null && nextTier) {
            return `Sell ${progress.remainingToNextThreshold} more products to unlock ${formatCurrency(nextTier.bonusAmount)} bonus`;
        }

        return `Campaign milestone unlocked. Total bonuses earned: ${formatCurrency(progress.bonusesEarned)}`;
    }, [activeCampaign, progress, nextTier]);

    const shareReferral = async () => {
        if (!referralCode) {
            showAgentToast('Referral code not available yet.');
            return;
        }

        await Share.share({
            message: `Get AquaCare products - use my agent code ${referralCode} at checkout.`,
        });
    };

    const shareProduct = async (item: AgentProductCommissionPreview) => {
        if (!referralCode) {
            showAgentToast('Referral code not available yet.');
            return;
        }

        await Share.share({
            message: `Recommended: ${item.name}. Use my agent code ${referralCode} to support me.`,
        });
    };

    const copyCode = async () => {
        if (!referralCode) {
            showAgentToast('Referral code not available yet.');
            return;
        }

        await Clipboard.setStringAsync(referralCode);
        showAgentToast('Referral code copied');
    };

    return (
        <AgentScreen>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || loading.refresh}
                        onRefresh={onRefresh}
                        tintColor={agentTheme.colors.agentPrimary}
                    />
                }
            >
                <AgentSectionHeader title="Earn" subtitle="Referral commissions and campaign bonuses" />

                <AgentCard>
                    <View style={styles.summaryHeaderRow}>
                        <View>
                            <Text style={styles.summaryTitle}>Your Earnings</Text>
                            <Text style={styles.referralLabel}>Referral code</Text>
                        </View>
                        <AgentChip label={referralCode || 'Loading'} tone="default" />
                    </View>

                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryPill}>
                            <Text style={styles.pillLabel}>Pending</Text>
                            <Text style={styles.pillValue}>{formatCurrency(summary.totalsPending)}</Text>
                        </View>
                        <View style={styles.summaryPill}>
                            <Text style={styles.pillLabel}>Approved</Text>
                            <Text style={styles.pillValue}>{formatCurrency(summary.totalsApproved)}</Text>
                        </View>
                        <View style={styles.summaryPill}>
                            <Text style={styles.pillLabel}>Paid</Text>
                            <Text style={styles.pillValue}>{formatCurrency(summary.totalsPaid)}</Text>
                        </View>
                    </View>

                    <View style={styles.bonusRow}>
                        <Text style={styles.bonusText}>Bonuses pending: {formatCurrency(summary.bonusPending)}</Text>
                        <Text style={styles.bonusText}>Bonuses paid: {formatCurrency(summary.bonusPaid)}</Text>
                    </View>

                    <View style={styles.inlineActions}>
                        <TouchableOpacity onPress={copyCode}>
                            <Text style={styles.inlineActionText}>Copy code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={shareReferral}>
                            <Text style={styles.inlineActionText}>Share code</Text>
                        </TouchableOpacity>
                    </View>
                </AgentCard>

                <AgentCard>
                    <View style={styles.campaignTopRow}>
                        <View style={styles.campaignTextWrap}>
                            <Text style={styles.summaryTitle}>{activeCampaign?.name || 'Campaign'}</Text>
                            <Text style={styles.campaignMeta}>
                                {daysLeft !== null ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : 'No date window available'}
                            </Text>
                        </View>
                        <Ionicons name="gift-outline" size={22} color={agentTheme.colors.agentPrimaryDark} />
                    </View>

                    <Text style={styles.campaignMessage}>{campaignMessage}</Text>

                    <View style={styles.progressWrap}>
                        <View style={styles.progressTrack}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width:
                                            progress?.nextThreshold && progress.nextThreshold > 0
                                                ? `${Math.min(100, (progress.soldQty / progress.nextThreshold) * 100)}%`
                                                : '100%',
                                    },
                                ]}
                            />
                        </View>
                        <View style={styles.progressMeta}>
                            <Text style={styles.progressMetaText}>Sold: {progress?.soldQty ?? 0}</Text>
                            <Text style={styles.progressMetaText}>Next: {progress?.nextThreshold ?? '-'}</Text>
                        </View>
                    </View>

                    <AgentButton
                        title="View milestones"
                        variant="secondary"
                        onPress={() => {
                            if (!activeCampaign) return;
                            navigation.navigate('AgentCampaignMilestones', { campaignId: activeCampaign.id });
                        }}
                    />
                </AgentCard>

                <AgentSectionHeader title="Top Products to Sell" subtitle={`${productsWithCommissionPreview.length} products`} />

                {productsWithCommissionPreview.map((item) => (
                    <AgentCard key={item.id} style={styles.productCard}>
                        <View style={styles.productTop}>
                            <View style={styles.productTextWrap}>
                                <Text style={styles.productName}>{item.name}</Text>
                                <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                            </View>
                            <AgentChip
                                label={item.commissionType ? getCommissionText(item) : 'No active rule'}
                                tone={item.commissionType ? 'success' : 'dark'}
                            />
                        </View>

                        <Text style={styles.whySell}>Why sell: {getWhySellText(item)}</Text>

                        <View style={styles.actionsRow}>
                            <AgentButton
                                title="Share"
                                variant="secondary"
                                style={styles.actionButton}
                                onPress={() => {
                                    void shareProduct(item);
                                }}
                            />
                            <AgentButton
                                title="Copy Code"
                                style={styles.actionButton}
                                onPress={() => {
                                    void copyCode();
                                }}
                            />
                        </View>
                    </AgentCard>
                ))}

                {productsWithCommissionPreview.length === 0 ? (
                    <AgentCard>
                        <Text style={styles.emptyTitle}>No products available right now</Text>
                        <Text style={styles.emptySubtitle}>Pull to refresh and check the latest commission previews.</Text>
                    </AgentCard>
                ) : null}
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
    summaryHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: agentTheme.spacing.sm,
    },
    summaryTitle: {
        ...agentTheme.typography.h2,
        color: agentTheme.colors.textPrimary,
    },
    referralLabel: {
        ...agentTheme.typography.caption,
        color: agentTheme.colors.textSecondary,
        marginTop: 4,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: agentTheme.spacing.sm,
        marginTop: agentTheme.spacing.md,
    },
    summaryPill: {
        flex: 1,
        borderRadius: agentTheme.radius.md,
        borderWidth: 1,
        borderColor: '#F0E1B8',
        backgroundColor: '#FFF6E1',
        padding: agentTheme.spacing.sm,
    },
    pillLabel: {
        ...agentTheme.typography.caption,
        color: '#7D5A0A',
    },
    pillValue: {
        ...agentTheme.typography.body,
        color: agentTheme.colors.textPrimary,
        marginTop: 4,
    },
    bonusRow: {
        marginTop: agentTheme.spacing.md,
        gap: 4,
    },
    bonusText: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
    },
    inlineActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: agentTheme.spacing.sm,
    },
    inlineActionText: {
        ...agentTheme.typography.caption,
        color: agentTheme.colors.agentPrimaryDark,
    },
    campaignTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: agentTheme.spacing.md,
    },
    campaignTextWrap: {
        flex: 1,
    },
    campaignMeta: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        marginTop: 4,
    },
    campaignMessage: {
        ...agentTheme.typography.body,
        color: agentTheme.colors.textPrimary,
        marginTop: agentTheme.spacing.md,
    },
    progressWrap: {
        marginTop: agentTheme.spacing.md,
        marginBottom: agentTheme.spacing.md,
    },
    progressTrack: {
        height: 10,
        borderRadius: agentTheme.radius.full,
        backgroundColor: '#E7EBEF',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: agentTheme.colors.agentPrimary,
    },
    progressMeta: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressMetaText: {
        ...agentTheme.typography.caption,
        color: agentTheme.colors.textSecondary,
    },
    productCard: {
        gap: agentTheme.spacing.sm,
    },
    productTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: agentTheme.spacing.sm,
    },
    productTextWrap: {
        flex: 1,
    },
    productName: {
        ...agentTheme.typography.h2,
        color: agentTheme.colors.textPrimary,
    },
    productPrice: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        marginTop: 2,
    },
    whySell: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: agentTheme.spacing.sm,
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
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
