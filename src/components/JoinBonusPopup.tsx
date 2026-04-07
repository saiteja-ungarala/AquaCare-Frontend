// JoinBonusPopup — Celebration modal for ₹10,000 welcome bonus
// Glassmorphism overlay + animated entrance + confetti bubbles

import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    Animated, Easing, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, shadows } from '../theme/theme';

const { width: W, height: H } = Dimensions.get('window');
const PARTICLE_COUNT = 18;

interface JoinBonusPopupProps {
    visible: boolean;
    onDismiss: () => void;
}

// ── Particle ──────────────────────────────────────────────────────────────────
const PARTICLE_COLORS = ['#90E0EF', '#00B4D8', '#ADE8F4', '#CAF0F8', '#48CAE4', '#FFD166'];

interface Particle { x: number; size: number; color: string; delay: number; duration: number }
const makeParticles = (): Particle[] =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        x: Math.random() * (W - 20),
        size: Math.random() * 10 + 6,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        delay: Math.random() * 400,
        duration: Math.random() * 800 + 1200,
    }));

const ParticleLayer: React.FC<{ run: boolean }> = ({ run }) => {
    const particles = useRef(makeParticles()).current;
    const anims = useRef(particles.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        if (!run) return;
        const animations = particles.map((p, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(p.delay),
                    Animated.timing(anims[i], { toValue: 1, duration: p.duration, easing: Easing.linear, useNativeDriver: true }),
                    Animated.timing(anims[i], { toValue: 0, duration: 0, useNativeDriver: true }),
                ])
            )
        );
        Animated.parallel(animations).start();
        return () => animations.forEach((a) => a.stop());
    }, [run]);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map((p, i) => (
                <Animated.View
                    key={i}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        bottom: -20,
                        width: p.size,
                        height: p.size,
                        borderRadius: p.size / 2,
                        backgroundColor: p.color,
                        opacity: anims[i].interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 0.9, 0.7, 0] }),
                        transform: [{
                            translateY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -(H * 0.7)] }),
                        }],
                    }}
                />
            ))}
        </View>
    );
};

// ── Main popup ────────────────────────────────────────────────────────────────
export const JoinBonusPopup: React.FC<JoinBonusPopupProps> = ({ visible, onDismiss }) => {
    const slideAnim = useRef(new Animated.Value(80)).current;
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.88)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
                Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
            ]).start();

            // Pulse the amount
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
                ])
            ).start();
        } else {
            slideAnim.setValue(80);
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.88);
            pulseAnim.setValue(1);
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <ParticleLayer run={visible} />

                <Animated.View style={[
                    styles.card,
                    { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
                ]}>
                    <LinearGradient
                        colors={['#03045E', '#0077B6', '#00B4D8']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                    >
                        {/* Decorative ring */}
                        <View style={styles.ring} />

                        {/* Icon */}
                        <View style={styles.iconWrap}>
                            <Ionicons name="gift" size={36} color="#fff" />
                        </View>

                        <Text style={styles.headline}>🎉 Welcome Bonus Unlocked!</Text>

                        {/* Amount */}
                        <Animated.View style={[styles.amountWrap, { transform: [{ scale: pulseAnim }] }]}>
                            <Text style={styles.amountCurrency}>₹</Text>
                            <Text style={styles.amountValue}>10,000</Text>
                        </Animated.View>

                        <Text style={styles.subtitle}>
                            Added to your wallet.{'\n'}Use it on Ionizers above ₹4,00,000.
                        </Text>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Info row */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Ionicons name="flash" size={16} color="#90E0EF" />
                                <Text style={styles.infoText}>Instant credit</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Ionicons name="shield-checkmark" size={16} color="#90E0EF" />
                                <Text style={styles.infoText}>Secure wallet</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Ionicons name="water" size={16} color="#90E0EF" />
                                <Text style={styles.infoText}>Ionizers only</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* CTA */}
                    <TouchableOpacity style={styles.cta} onPress={onDismiss} activeOpacity={0.88}>
                        <Text style={styles.ctaText}>Awesome, let's go!</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(3, 4, 94, 0.72)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 28,
        overflow: 'hidden',
        ...shadows.lg,
    },
    cardGradient: {
        padding: spacing.xl,
        alignItems: 'center',
        overflow: 'hidden',
    },
    ring: {
        position: 'absolute',
        width: 280, height: 280, borderRadius: 140,
        borderWidth: 48, borderColor: 'rgba(255,255,255,0.06)',
        top: -100, right: -80,
    },
    iconWrap: {
        width: 72, height: 72, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.md,
    },
    headline: {
        fontSize: 20, fontWeight: '800', color: '#fff',
        textAlign: 'center', marginBottom: spacing.md,
    },
    amountWrap: {
        flexDirection: 'row', alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    amountCurrency: { fontSize: 28, fontWeight: '700', color: '#90E0EF', marginTop: 8 },
    amountValue: { fontSize: 56, fontWeight: '900', color: '#fff', lineHeight: 64, letterSpacing: -2 },
    subtitle: {
        fontSize: 14, color: 'rgba(255,255,255,0.8)',
        textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg,
    },
    divider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: spacing.md },
    infoRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    cta: {
        backgroundColor: '#fff',
        paddingVertical: spacing.md + 4,
        alignItems: 'center',
    },
    ctaText: { fontSize: 16, fontWeight: '800', color: '#0077B6' },
});
