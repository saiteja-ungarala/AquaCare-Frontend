// ReferralScreen — Premium referral hub
// Glass cards, animated code reveal, share flow

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Share, Dimensions, Animated,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { useAuthStore } from '../../store';

const { width: W } = Dimensions.get('window');

const TIERS = [
    { level: 'Direct Referral', reward: '₹5,000', icon: 'person-add' as const, color: '#0077B6', desc: 'When your friend places a paid order' },
    { level: 'Second Level',    reward: '₹2,000', icon: 'people'     as const, color: '#7C3AED', desc: 'When your friend\'s friend places a paid order' },
];

const HOW_IT_WORKS = [
    { step: '1', text: 'Share your unique referral code',   icon: 'share-social'   as const },
    { step: '2', text: 'Friend signs up using your code',   icon: 'person-add'     as const },
    { step: '3', text: 'Friend places a paid order',        icon: 'bag-check'      as const },
    { step: '4', text: 'You earn ₹5,000 in your wallet',   icon: 'wallet'         as const },
];

export const ReferralScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((s) => s.user);
    const code = user?.referralCode || '—';
    const [copied, setCopied] = useState(false);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handleCopy = async () => {
        await Clipboard.setStringAsync(code);
        setCopied(true);
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.08, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1,    duration: 150, useNativeDriver: true }),
        ]).start();
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        await Share.share({
            message: `Join IonoraCare and get ₹10,000 welcome bonus! Use my referral code: ${code}\nDownload now: https://ionoracare.com`,
            title: 'Join IonoraCare',
        });
    };

    return (
        <View style={styles.root}>
            {/* Hero */}
            <LinearGradient
                colors={['#03045E', '#0077B6', '#00B4D8']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}
            >
                {/* Decorative rings */}
                <View style={styles.ring1} /><View style={styles.ring2} />

                <View style={styles.heroNav}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.heroTitle}>Refer & Earn</Text>
                    <View style={{ width: 40 }} />
                </View>

                <Text style={styles.heroHeadline}>Earn up to{'\n'}₹5,000 per referral</Text>
                <Text style={styles.heroSub}>Share your code. Earn when friends order.</Text>

                {/* Code card */}
                <Animated.View style={[styles.codeCard, { transform: [{ scale: scaleAnim }] }]}>
                    <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
                    <Text style={styles.codeValue}>{code}</Text>
                    <View style={styles.codeActions}>
                        <TouchableOpacity style={styles.codeBtn} onPress={handleCopy} activeOpacity={0.8}>
                            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={copied ? '#059669' : '#0077B6'} />
                            <Text style={[styles.codeBtnText, copied && { color: '#059669' }]}>
                                {copied ? 'Copied!' : 'Copy'}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.codeDivider} />
                        <TouchableOpacity style={styles.codeBtn} onPress={handleShare} activeOpacity={0.8}>
                            <Ionicons name="share-social-outline" size={18} color="#0077B6" />
                            <Text style={styles.codeBtnText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </LinearGradient>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Reward tiers */}
                <Text style={styles.sectionTitle}>Reward Tiers</Text>
                <View style={styles.tiersRow}>
                    {TIERS.map((tier) => (
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

                {/* CTA */}
                <TouchableOpacity style={styles.shareCta} onPress={handleShare} activeOpacity={0.88}>
                    <LinearGradient
                        colors={['#0077B6', '#00B4D8']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.shareCtaGradient}
                    >
                        <Ionicons name="share-social" size={20} color="#fff" />
                        <Text style={styles.shareCtaText}>Share with Friends</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: spacing.xl }} />
            </ScrollView>
        </View>
    );
};

const GLASS_BG = 'rgba(255,255,255,0.13)';
const GLASS_BORDER = 'rgba(255,255,255,0.26)';

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0F7FF' },

    hero: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl + 16,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
    },
    ring1: {
        position: 'absolute', width: 280, height: 280, borderRadius: 140,
        borderWidth: 44, borderColor: 'rgba(255,255,255,0.05)', top: -100, right: -80,
    },
    ring2: {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        borderWidth: 28, borderColor: 'rgba(255,255,255,0.05)', bottom: 0, left: -40,
    },
    heroNav: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: spacing.lg,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: GLASS_BG, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: GLASS_BORDER,
    },
    heroTitle: { ...typography.h2, color: '#fff', fontWeight: '700' },
    heroHeadline: { fontSize: 28, fontWeight: '800', color: '#fff', lineHeight: 36, marginBottom: spacing.xs },
    heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: spacing.lg },

    // Code card
    codeCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: spacing.lg,
        alignItems: 'center',
        ...shadows.lg,
    },
    codeLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.sm },
    codeValue: { fontSize: 32, fontWeight: '900', color: '#03045E', letterSpacing: 4, marginBottom: spacing.md },
    codeActions: { flexDirection: 'row', alignItems: 'center', width: '100%' },
    codeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
    codeBtnText: { fontSize: 14, fontWeight: '700', color: '#0077B6' },
    codeDivider: { width: 1, height: 24, backgroundColor: colors.border },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: { padding: spacing.lg },
    sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md, marginTop: spacing.lg },

    // Tiers
    tiersRow: { flexDirection: 'row', gap: spacing.md },
    tierCard: {
        flex: 1, backgroundColor: '#fff', borderRadius: 16,
        padding: spacing.md, borderTopWidth: 3, ...shadows.sm,
    },
    tierIconWrap: {
        width: 44, height: 44, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
    },
    tierReward: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
    tierLevel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 },
    tierDesc: { fontSize: 11, color: colors.textSecondary, lineHeight: 16 },

    // Steps
    stepsCard: { backgroundColor: '#fff', borderRadius: 20, padding: spacing.lg, ...shadows.sm },
    stepRow: { flexDirection: 'row', marginBottom: 0 },
    stepLeft: { alignItems: 'center', marginRight: spacing.md, width: 32 },
    stepCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#0077B6', alignItems: 'center', justifyContent: 'center',
    },
    stepNum: { fontSize: 14, fontWeight: '800', color: '#fff' },
    stepLine: { width: 2, flex: 1, backgroundColor: '#E0F0FF', marginVertical: 4, minHeight: 24 },
    stepContent: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        gap: spacing.sm, paddingBottom: spacing.lg,
    },
    stepIconWrap: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#E0F0FF', alignItems: 'center', justifyContent: 'center',
    },
    stepText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text, lineHeight: 20 },

    // CTA
    shareCta: { borderRadius: 16, overflow: 'hidden', marginTop: spacing.lg, ...shadows.md },
    shareCtaGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: spacing.sm, paddingVertical: spacing.md + 4,
    },
    shareCtaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
