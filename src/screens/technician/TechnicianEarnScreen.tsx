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
import { TechnicianCampaign, TechnicianProductCommissionPreview, RootStackParamList } from '../../models/types';
import { TechnicianButton, TechnicianCard, TechnicianChip, TechnicianScreen, TechnicianSectionHeader } from '../../components/technician';
import { technicianTheme } from '../../theme/technicianTheme';
import { useTechnicianEarnStore, useTechnicianStore } from '../../store';
import { showTechnicianToast } from '../../utils/technicianToast';

type TechnicianEarnScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'TechnicianEarn'>;
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

const getWhySellText = (item: TechnicianProductCommissionPreview): string => {
    if ((item.commissionAmount || 0) >= 200) return 'High commission potential';
    if ((item.price || 0) <= 4000) return 'Budget-friendly for most customers';
    if (item.commissionType === 'percent') return 'Better earnings on premium sales';
    return 'Popular add-on for service visits';
};

const getCommissionText = (item: TechnicianProductCommissionPreview): string => {
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
    campaigns: TechnicianCampaign[],
    activeCampaignId: number | null
): TechnicianCampaign | null => {
    if (activeCampaignId) {
        const matched = campaigns.find((campaign) => campaign.id === activeCampaignId);
        if (matched) return matched;
    }

    return campaigns[0] || null;
};

export const TechnicianEarnScreen: React.FC<TechnicianEarnScreenProps> = ({ navigation }) => {
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
    } = useTechnicianEarnStore();
    const { isOnline } = useTechnicianStore();

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
        showTechnicianToast(error);
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
            showTechnicianToast('Referral code not available yet.');
            return;
        }

        await Share.share({
            message: `Get IONORA CARE products - use my technician code ${referralCode} at checkout.`,
        });
    };

    const shareProduct = async (item: TechnicianProductCommissionPreview) => {
        if (!referralCode) {
            showTechnicianToast('Referral code not available yet.');
            return;
        }

        await Share.share({
            message: `Recommended: ${item.name}. Use my technician code ${referralCode} to support me.`,
        });
    };

    const copyCode = async () => {
        if (!referralCode) {
            showTechnicianToast('Referral code not available yet.');
            return;
        }

        await Clipboard.setStringAsync(referralCode);
        showTechnicianToast('Referral code copied');
    };

    return (
        <TechnicianScreen>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || loading.refresh}
                        onRefresh={onRefresh}
                        tintColor={technicianTheme.colors.agentPrimary}
                    />
                }
            >
                <TechnicianSectionHeader title="Earn" subtitle="Referral commissions and campaign bonuses" />

                <TechnicianCard>
                    <View style={styles.summaryHeaderRow}>
                        <View>
                            <Text style={styles.summaryTitle}>Your Earnings</Text>
                            <Text style={styles.referralLabel}>Referral code</Text>
                        </View>
                        <TechnicianChip label={referralCode || 'Loading'} tone="default" />
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
                </TechnicianCard>

                <TechnicianCard>
                    <View style={styles.campaignTopRow}>
                        <View style={styles.campaignTextWrap}>
                            <Text style={styles.summaryTitle}>{activeCampaign?.name || 'Campaign'}</Text>
                            <Text style={styles.campaignMeta}>
                                {daysLeft !== null ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : 'No date window available'}
                            </Text>
                        </View>
                        <Ionicons name="gift-outline" size={22} color={technicianTheme.colors.agentPrimaryDark} />
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

                    <TechnicianButton
                        title="View milestones"
                        variant="secondary"
                        onPress={() => {
                            if (!activeCampaign) return;
                            navigation.navigate('TechnicianCampaignMilestones', { campaignId: activeCampaign.id });
                        }}
                    />
                </TechnicianCard>

                <TechnicianSectionHeader title="Top Products to Sell" subtitle={`${productsWithCommissionPreview.length} products`} />

                {productsWithCommissionPreview.map((item) => (
                    <TechnicianCard key={item.id} style={styles.productCard}>
                        <View style={styles.productTop}>
                            <View style={styles.productTextWrap}>
                                <Text style={styles.productName}>{item.name}</Text>
                                <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                            </View>
                            <TechnicianChip
                                label={item.commissionType ? getCommissionText(item) : 'No active rule'}
                                tone={item.commissionType ? 'success' : 'dark'}
                            />
                        </View>

                        <Text style={styles.whySell}>Why sell: {getWhySellText(item)}</Text>

                        <View style={styles.actionsRow}>
                            <TechnicianButton
                                title="Share"
                                variant="secondary"
                                style={styles.actionButton}
                                onPress={() => {
                                    void shareProduct(item);
                                }}
                            />
                            <TechnicianButton
                                title="Copy Code"
                                style={styles.actionButton}
                                onPress={() => {
                                    void copyCode();
                                }}
                            />
                        </View>
                    </TechnicianCard>
                ))}

                {productsWithCommissionPreview.length === 0 ? (
                    <TechnicianCard>
                        <Text style={styles.emptyTitle}>No products available right now</Text>
                        <Text style={styles.emptySubtitle}>Pull to refresh and check the latest commission previews.</Text>
                    </TechnicianCard>
                ) : null}
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
    summaryHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: technicianTheme.spacing.sm,
    },
    summaryTitle: {
        ...technicianTheme.typography.h2,
        color: technicianTheme.colors.textPrimary,
    },
    referralLabel: {
        ...technicianTheme.typography.caption,
        color: technicianTheme.colors.textSecondary,
        marginTop: 4,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: technicianTheme.spacing.sm,
        marginTop: technicianTheme.spacing.md,
    },
    summaryPill: {
        flex: 1,
        borderRadius: technicianTheme.radius.md,
        borderWidth: 1,
        borderColor: '#F0E1B8',
        backgroundColor: '#FFF6E1',
        padding: technicianTheme.spacing.sm,
    },
    pillLabel: {
        ...technicianTheme.typography.caption,
        color: '#7D5A0A',
    },
    pillValue: {
        ...technicianTheme.typography.body,
        color: technicianTheme.colors.textPrimary,
        marginTop: 4,
    },
    bonusRow: {
        marginTop: technicianTheme.spacing.md,
        gap: 4,
    },
    bonusText: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
    },
    inlineActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: technicianTheme.spacing.sm,
    },
    inlineActionText: {
        ...technicianTheme.typography.caption,
        color: technicianTheme.colors.agentPrimaryDark,
    },
    campaignTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: technicianTheme.spacing.md,
    },
    campaignTextWrap: {
        flex: 1,
    },
    campaignMeta: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
        marginTop: 4,
    },
    campaignMessage: {
        ...technicianTheme.typography.body,
        color: technicianTheme.colors.textPrimary,
        marginTop: technicianTheme.spacing.md,
    },
    progressWrap: {
        marginTop: technicianTheme.spacing.md,
        marginBottom: technicianTheme.spacing.md,
    },
    progressTrack: {
        height: 10,
        borderRadius: technicianTheme.radius.full,
        backgroundColor: '#E7EBEF',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: technicianTheme.colors.agentPrimary,
    },
    progressMeta: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressMetaText: {
        ...technicianTheme.typography.caption,
        color: technicianTheme.colors.textSecondary,
    },
    productCard: {
        gap: technicianTheme.spacing.sm,
    },
    productTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: technicianTheme.spacing.sm,
    },
    productTextWrap: {
        flex: 1,
    },
    productName: {
        ...technicianTheme.typography.h2,
        color: technicianTheme.colors.textPrimary,
    },
    productPrice: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
        marginTop: 2,
    },
    whySell: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: technicianTheme.spacing.sm,
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
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
