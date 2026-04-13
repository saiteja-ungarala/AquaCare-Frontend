// WalletScreen — Wallet + Referral unified screen
// All earnings, referral tracking, and wallet balance in one place

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
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
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { customerColors } from '../../theme/customerTheme';
import { useWalletStore, useAuthStore } from '../../store';

const { width: W } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'wallet' | 'referral';
type ReferralStatus = 'pending' | 'credited';

interface ReferralItem {
    userName: string;
    status: ReferralStatus;
    rewardAmount: number;
}

interface ReferralSummary {
    totalReferrals: number;
    totalEarned: number;
    pendingReferrals: number;
    referrals: ReferralItem[];
}

// ── Source label map ──────────────────────────────────────────────────────────
const SOURCE_META: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
    referral_bonus:   { label: 'Referral Reward',  icon: 'people',         color: '#7C3AED' },
    join_bonus:       { label: 'Welcome Bonus',     icon: 'gift',           color: '#059669' },
    join_bonus_usage: { label: 'Bonus Used',        icon: 'cart',           color: '#D97706' },
    refund:           { label: 'Refund',            icon: 'refresh-circle', color: '#0284C7' },
    order_payment:    { label: 'Order Payment',     icon: 'bag-handle',     color: '#DC2626' },
    welcome_bonus:    { label: 'Welcome Bonus',     icon: 'star',           color: '#059669' },
    commission:       { label: 'Commission',        icon: 'trending-up',    color: '#7C3AED' },
    bonus:            { label: 'Bonus',             icon: 'gift',           color: '#059669' },
};

const getSourceMeta = (source: string, type: string) => {
    const meta = SOURCE_META[source];
    if (meta) return meta;
    return type === 'credit'
        ? { label: 'Credit', icon: 'arrow-down-circle' as const, color: '#059669' }
        : { label: 'Debit',  icon: 'arrow-up-circle'  as const, color: '#DC2626' };
};

const formatDate = (raw: string) => {
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmt = (v: number) =>
    `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const extractInitials = (name: string) =>
    name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || 'NA';

const normalizeStatus = (s: string): ReferralStatus =>
    String(s).trim().toLowerCase() === 'credited' ? 'credited' : 'pending';

const mapReferralResponse = (payload: any): ReferralSummary => {
    const list: ReferralItem[] = Array.isArray(payload?.referrals)
        ? payload.referrals.map((r: any) => ({
            userName: r.user_name || 'Unnamed User',
            status: normalizeStatus(r.status),
            rewardAmount: Number(r.reward_amount || 0),
        }))
        : [];
    return {
        totalReferrals: Number(payload?.total_referrals || list.length),
        totalEarned: Number(payload?.total_earned || 0),
        pendingReferrals: list.filter((r) => r.status === 'pending').length,
        referrals: list,
    };
};

const REWARD_TIERS = [
    { level: 'Direct Referral', reward: '₹5,000', icon: 'person-add' as const, color: '#0077B6', desc: 'When your friend places a paid order' },
    { level: 'Second Level',    reward: '₹2,000', icon: 'people'     as const, color: '#7C3AED', desc: "When your friend's friend places a paid order" },
];

const HOW_IT_WORKS = [
    { step: '1', text: 'Share your unique referral code', icon: 'share-social' as const },
    { step: '2', text: 'Friend signs up using your code', icon: 'person-add'   as const },
    { step: '3', text: 'Friend places a paid order',      icon: 'bag-check'    as const },
    { step: '4', text: 'You earn ₹5,000 in your wallet',  icon: 'wallet'       as const },
];

const GLASS_BG     = 'rgba(255,255,255,0.14)';
const GLASS_BORDER = 'rgba(255,255,255,0.28)';

// ── Component ─────────────────────────────────────────────────────────────────
export const WalletScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { balance, transactions, isLoading, error, fetchWallet, fetchTransactions } = useWalletStore();
    const user = useAuthStore((s) => s.user);
    const referralCode = user?.referralCode?.trim() || '';

    const [activeTab, setActiveTab] = useState<Tab>('wallet');
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [referralSummary, setReferralSummary] = useState<ReferralSummary>({
        totalReferrals: 0, totalEarned: 0, pendingReferrals: 0, referrals: [],
    });
    const [referralLoading, setReferralLoading] = useState(false);
    const [referralError, setReferralError] = useState('');
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // ── Data loading ──────────────────────────────────────────────────────────
    const loadWallet = useCallback(async () => {
        await Promise.all([fetchWallet(), fetchTransactions()]);
    }, [fetchWallet, fetchTransactions]);

    const loadReferral = useCallback(async () => {
        setReferralLoading(true);
        setReferralError('');
        try {
            const res = await api.get('/user/referrals');
            setReferralSummary(mapReferralResponse(res?.data?.data ?? res?.data));
        } catch {
            setReferralError('Unable to load referral activity right now.');
        } finally {
            setReferralLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        void loadWallet();
        void loadReferral();
    }, [loadWallet, loadReferral]));

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([loadWallet(), loadReferral()]);
        setRefreshing(false);
    }, [loadWallet, loadReferral]);

    // Load referral data when switching to referral tab
    useEffect(() => {
        if (activeTab === 'referral' && referralSummary.totalReferrals === 0 && !referralLoading) {
            void loadReferral();
        }
    }, [activeTab]);

    // ── Referral actions ──────────────────────────────────────────────────────
    const handleCopy = async () => {
        if (!referralCode) return;
        await Clipboard.setStringAsync(referralCode);
        setCopied(true);
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.06, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1,    duration: 150, useNativeDriver: true }),
        ]).start();
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (!referralCode) return;
        await Share.share({
            message: `Join IonoraCare and get ₹10,000 welcome bonus! Use my referral code: ${referralCode}\nDownload now: https://ionoracare.com`,
            title: 'Join IonoraCare',
        });
    };

    // ── Render helpers ────────────────────────────────────────────────────────
    const renderTabBar = () => (
        <View style={styles.tabBar}>
            <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'wallet' && styles.tabBtnActive]}
                onPress={() => setActiveTab('wallet')}
                activeOpacity={0.8}
            >
                <Ionicons name="wallet" size={16} color={activeTab === 'wallet' ? '#fff' : 'rgba(255,255,255,0.6)'} />
                <Text style={[styles.tabBtnText, activeTab === 'wallet' && styles.tabBtnTextActive]}>Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'referral' && styles.tabBtnActive]}
                onPress={() => setActiveTab('referral')}
                activeOpacity={0.8}
            >
                <Ionicons name="people" size={16} color={activeTab === 'referral' ? '#fff' : 'rgba(255,255,255,0.6)'} />
                <Text style={[styles.tabBtnText, activeTab === 'referral' && styles.tabBtnTextActive]}>Referral</Text>
            </TouchableOpacity>
        </View>
    );

    const renderWalletTab = () => (
        <>
            {error ? (
                <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {/* Welcome bonus banner */}
            <View style={styles.bonusBanner}>
                <LinearGradient colors={['#D8F3DC', '#B7E4C7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bonusGradient}>
                    <Ionicons name="gift" size={26} color="#1B4332" />
                    <View style={styles.bonusTextWrap}>
                        <Text style={styles.bonusTitle}>₹10,000 Welcome Bonus</Text>
                        <Text style={styles.bonusSub}>Use on Ionizers above ₹4,00,000</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#1B4332" />
                </LinearGradient>
            </View>

            {/* Transaction history */}
            <Text style={styles.sectionTitle}>Transaction History</Text>
            {isLoading && !refreshing ? (
                <View style={styles.centerState}>
                    <ActivityIndicator color={customerColors.primary} />
                </View>
            ) : transactions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
                    <Text style={styles.emptyText}>No transactions yet</Text>
                </View>
            ) : (
                transactions.map((txn) => {
                    const meta = getSourceMeta(txn.source, txn.type);
                    const isCredit = txn.type === 'credit';
                    return (
                        <View key={txn.id} style={styles.txnCard}>
                            <View style={[styles.txnIconWrap, { backgroundColor: meta.color + '18' }]}>
                                <Ionicons name={meta.icon} size={20} color={meta.color} />
                            </View>
                            <View style={styles.txnBody}>
                                <Text style={styles.txnLabel}>{meta.label}</Text>
                                <Text style={styles.txnDesc} numberOfLines={1}>{txn.description || meta.label}</Text>
                                <Text style={styles.txnDate}>{formatDate(txn.date)}</Text>
                            </View>
                            <Text style={[styles.txnAmount, { color: isCredit ? '#059669' : '#DC2626' }]}>
                                {isCredit ? '+' : '−'}{fmt(txn.amount)}
                            </Text>
                        </View>
                    );
                })
            )}
        </>
    );

    const renderReferralTab = () => (
        <>
            {/* Code card */}
            <Animated.View style={[styles.codeCard, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
                <Text style={styles.codeValue}>{referralCode || '—'}</Text>
                <View style={styles.codeActions}>
                    <TouchableOpacity style={styles.codeBtn} onPress={handleCopy} activeOpacity={0.8}>
                        <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={copied ? '#059669' : '#0077B6'} />
                        <Text style={[styles.codeBtnText, copied && { color: '#059669' }]}>{copied ? 'Copied!' : 'Copy'}</Text>
                    </TouchableOpacity>
                    <View style={styles.codeDivider} />
                    <TouchableOpacity style={styles.codeBtn} onPress={handleShare} activeOpacity={0.8}>
                        <Ionicons name="share-social-outline" size={18} color="#0077B6" />
                        <Text style={styles.codeBtnText}>Share</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Summary stats */}
            <Text style={styles.sectionTitle}>Referral Summary</Text>
            <View style={styles.summaryGrid}>
                {[
                    { icon: 'people'       as const, color: '#0077B6', value: String(referralSummary.totalReferrals), label: 'Total referrals' },
                    { icon: 'wallet'       as const, color: '#059669', value: fmt(referralSummary.totalEarned),        label: 'Total earned',    highlight: true },
                    { icon: 'time-outline' as const, color: '#F59E0B', value: String(referralSummary.pendingReferrals), label: 'Pending' },
                ].map((s) => (
                    <View key={s.label} style={[styles.summaryCard, s.highlight && styles.summaryCardHighlight]}>
                        <View style={[styles.summaryIconWrap, { backgroundColor: s.color + '18' }]}>
                            <Ionicons name={s.icon} size={18} color={s.color} />
                        </View>
                        <Text style={[styles.summaryValue, s.highlight && { color: '#059669' }]}>{s.value}</Text>
                        <Text style={styles.summaryLabel}>{s.label}</Text>
                    </View>
                ))}
            </View>

            {/* Activity */}
            <Text style={styles.sectionTitle}>Referral Activity</Text>
            {referralLoading ? (
                <View style={styles.stateCard}>
                    <ActivityIndicator color="#0077B6" />
                    <Text style={styles.stateText}>Loading activity...</Text>
                </View>
            ) : referralError ? (
                <View style={styles.stateCard}>
                    <Ionicons name="alert-circle-outline" size={22} color="#DC2626" />
                    <Text style={[styles.stateText, { color: '#DC2626' }]}>{referralError}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => void loadReferral()}>
                        <Text style={styles.retryBtnText}>Try again</Text>
                    </TouchableOpacity>
                </View>
            ) : referralSummary.referrals.length === 0 ? (
                <View style={styles.stateCard}>
                    <Ionicons name="people-outline" size={24} color={colors.textSecondary} />
                    <Text style={styles.stateText}>No referrals yet. Share your code to get started.</Text>
                </View>
            ) : (
                <View style={styles.referralList}>
                    {referralSummary.referrals.map((item, i) => {
                        const credited = item.status === 'credited';
                        return (
                            <View key={`${item.userName}-${i}`} style={styles.referralCard}>
                                <View style={styles.avatarWrap}>
                                    <Text style={styles.avatarText}>{extractInitials(item.userName)}</Text>
                                </View>
                                <View style={styles.referralMeta}>
                                    <Text style={styles.referralName}>{item.userName}</Text>
                                    <Text style={styles.referralReward}>Reward: {fmt(item.rewardAmount)}</Text>
                                </View>
                                <View style={[styles.statusPill, credited ? styles.statusCredited : styles.statusPending]}>
                                    <Text style={[styles.statusText, credited ? styles.statusTextCredited : styles.statusTextPending]}>
                                        {credited ? 'Credited' : 'Pending'}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Reward tiers */}
            <Text style={styles.sectionTitle}>Reward Tiers</Text>
            <View style={styles.tiersRow}>
                {REWARD_TIERS.map((tier) => (
                    <View key={tier.level} style={[styles.tierCard, { borderTopColor: tier.color }]}>
                        <View style={[styles.tierIconWrap, { backgroundColor: tier.color + '18' }]}>
                            <Ionicons name={tier.icon} size={22} color={tier.color} />
                        </View>
                        <Text style={[styles.tierReward, { color: tier.color }]}>{tier.reward}</Text>
                        <Text style={styles.tierLevel}>{tier.level}</Text>
                        <Text style={styles.tierDesc}>{tier.desc}</Text>
                    </View>
                ))}
            </View>

            {/* How it works */}
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.stepsCard}>
                {HOW_IT_WORKS.map((item, i) => (
                    <View key={item.step} style={styles.stepRow}>
                        <View style={styles.stepLeft}>
                            <View style={styles.stepCircle}>
                                <Text style={styles.stepNum}>{item.step}</Text>
                            </View>
                            {i < HOW_IT_WORKS.length - 1 && <View style={styles.stepLine} />}
                        </View>
                        <View style={styles.stepContent}>
                            <View style={styles.stepIconWrap}>
                                <Ionicons name={item.icon} size={18} color="#0077B6" />
                            </View>
                            <Text style={styles.stepText}>{item.text}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Share CTA */}
            <TouchableOpacity
                style={[styles.shareCta, !referralCode && { opacity: 0.7 }]}
                onPress={handleShare}
                activeOpacity={0.88}
                disabled={!referralCode}
            >
                <LinearGradient colors={['#0077B6', '#00B4D8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shareCtaGradient}>
                    <Ionicons name="share-social" size={20} color="#fff" />
                    <Text style={styles.shareCtaText}>Share with Friends</Text>
                </LinearGradient>
            </TouchableOpacity>
        </>
    );

    return (
        <View style={styles.root}>
            {/* Hero */}
            <LinearGradient
                colors={['#0077B6', '#00B4D8', '#48CAE4']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}
            >
                <View style={styles.ring1} />
                <View style={styles.ring2} />

                <View style={styles.heroNav}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.heroTitle}>
                        {activeTab === 'wallet' ? 'My Wallet' : 'Refer & Earn'}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Balance card — always visible */}
                <View style={styles.balanceGlass}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceAmount}>
                        {fmt(Number(balance))}
                    </Text>
                    <View style={styles.balanceDivider} />
                    <View style={styles.balanceRow}>
                        <View style={styles.balanceStat}>
                            <Ionicons name="arrow-down-circle" size={14} color="#90E0EF" />
                            <Text style={styles.balanceStatLabel}>Credits</Text>
                        </View>
                        <View style={styles.balanceStat}>
                            <Ionicons name="arrow-up-circle" size={14} color="#FFB4A2" />
                            <Text style={styles.balanceStatLabel}>Debits</Text>
                        </View>
                        <View style={styles.balanceStat}>
                            <Ionicons name="gift" size={14} color="#B5EAD7" />
                            <Text style={styles.balanceStatLabel}>Bonuses</Text>
                        </View>
                    </View>
                </View>

                {/* Tab bar inside hero */}
                {renderTabBar()}
            </LinearGradient>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                        colors={[customerColors.primary]} tintColor={customerColors.primary} />
                }
            >
                {activeTab === 'wallet' ? renderWalletTab() : renderReferralTab()}
                <View style={{ height: spacing.xxxl }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0F7FF' },

    // Hero
    hero: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
    },
    ring1: {
        position: 'absolute', width: 260, height: 260, borderRadius: 130,
        borderWidth: 40, borderColor: 'rgba(255,255,255,0.06)', top: -80, right: -80,
    },
    ring2: {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        borderWidth: 28, borderColor: 'rgba(255,255,255,0.05)', bottom: 20, left: -50,
    },
    heroNav: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: spacing.md,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: GLASS_BG, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: GLASS_BORDER,
    },
    heroTitle: { ...typography.h2, color: '#fff', fontWeight: '700' },

    // Balance
    balanceGlass: {
        backgroundColor: GLASS_BG, borderRadius: 20,
        borderWidth: 1, borderColor: GLASS_BORDER, padding: spacing.md,
        marginBottom: spacing.md,
    },
    balanceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 2 },
    balanceAmount: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -1 },
    balanceDivider: { height: 1, backgroundColor: GLASS_BORDER, marginVertical: spacing.sm },
    balanceRow: { flexDirection: 'row', justifyContent: 'space-around' },
    balanceStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    balanceStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

    // Tab bar
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 14,
        padding: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    tabBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: spacing.sm, borderRadius: 11,
    },
    tabBtnActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
    tabBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
    tabBtnTextActive: { color: '#fff' },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: { padding: spacing.lg },

    // Error
    errorBanner: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        backgroundColor: colors.error + '12', borderRadius: borderRadius.md,
        padding: spacing.sm, marginBottom: spacing.md,
    },
    errorText: { ...typography.caption, color: colors.error, flex: 1 },

    // Bonus banner
    bonusBanner: { borderRadius: 16, overflow: 'hidden', marginBottom: spacing.lg, ...shadows.sm },
    bonusGradient: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
    bonusTextWrap: { flex: 1 },
    bonusTitle: { fontSize: 14, fontWeight: '700', color: '#1B4332' },
    bonusSub: { fontSize: 12, color: '#2D6A4F', marginTop: 2 },

    // Section
    sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md, marginTop: spacing.lg },

    // States
    centerState: { alignItems: 'center', paddingVertical: spacing.xl },
    emptyState: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
    emptyText: { ...typography.body, color: colors.textMuted },
    stateCard: {
        backgroundColor: '#fff', borderRadius: 18, padding: spacing.lg,
        alignItems: 'center', gap: spacing.sm, ...shadows.sm,
    },
    stateText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', fontWeight: '600' },
    retryBtn: {
        marginTop: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        borderRadius: 12, backgroundColor: '#E0F2FE',
    },
    retryBtnText: { fontSize: 13, fontWeight: '700', color: '#0369A1' },

    // Transaction
    txnCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 16, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm,
    },
    txnIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    txnBody: { flex: 1 },
    txnLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
    txnDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
    txnDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    txnAmount: { fontSize: 15, fontWeight: '800' },

    // Referral code card
    codeCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: spacing.lg,
        alignItems: 'center', ...shadows.lg, marginBottom: spacing.xs,
    },
    codeLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.sm },
    codeValue: { fontSize: 30, fontWeight: '900', color: '#03045E', letterSpacing: 4, marginBottom: spacing.md },
    codeActions: { flexDirection: 'row', alignItems: 'center', width: '100%' },
    codeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
    codeBtnText: { fontSize: 14, fontWeight: '700', color: '#0077B6' },
    codeDivider: { width: 1, height: 24, backgroundColor: colors.border },

    // Summary
    summaryGrid: { flexDirection: 'row', gap: spacing.sm },
    summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: spacing.sm, ...shadows.sm },
    summaryCardHighlight: { backgroundColor: '#ECFDF5' },
    summaryIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
    summaryValue: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 2 },
    summaryLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', lineHeight: 16 },

    // Referral list
    referralList: { gap: spacing.sm },
    referralCard: { backgroundColor: '#fff', borderRadius: 16, padding: spacing.md, flexDirection: 'row', alignItems: 'center', ...shadows.sm },
    avatarWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    avatarText: { fontSize: 13, fontWeight: '800', color: '#0369A1' },
    referralMeta: { flex: 1, paddingRight: spacing.sm },
    referralName: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
    referralReward: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
    statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: 999 },
    statusPending: { backgroundColor: '#FEF3C7' },
    statusCredited: { backgroundColor: '#DCFCE7' },
    statusText: { fontSize: 11, fontWeight: '800' },
    statusTextPending: { color: '#B45309' },
    statusTextCredited: { color: '#15803D' },

    // Tiers
    tiersRow: { flexDirection: 'row', gap: spacing.md },
    tierCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: spacing.md, borderTopWidth: 3, ...shadows.sm },
    tierIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
    tierReward: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
    tierLevel: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 },
    tierDesc: { fontSize: 11, color: colors.textSecondary, lineHeight: 16 },

    // Steps
    stepsCard: { backgroundColor: '#fff', borderRadius: 20, padding: spacing.lg, ...shadows.sm },
    stepRow: { flexDirection: 'row' },
    stepLeft: { alignItems: 'center', marginRight: spacing.md, width: 32 },
    stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0077B6', alignItems: 'center', justifyContent: 'center' },
    stepNum: { fontSize: 14, fontWeight: '800', color: '#fff' },
    stepLine: { width: 2, flex: 1, backgroundColor: '#E0F0FF', marginVertical: 4, minHeight: 24 },
    stepContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.lg },
    stepIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E0F0FF', alignItems: 'center', justifyContent: 'center' },
    stepText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text, lineHeight: 20 },

    // Share CTA
    shareCta: { borderRadius: 16, overflow: 'hidden', marginTop: spacing.lg, ...shadows.md },
    shareCtaGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md + 4 },
    shareCtaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
