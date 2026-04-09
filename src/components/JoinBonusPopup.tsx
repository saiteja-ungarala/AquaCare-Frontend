import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, shadows } from '../theme/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const PARTICLE_COUNT = 18;
const PARTICLE_COLORS = ['#90E0EF', '#00B4D8', '#ADE8F4', '#CAF0F8', '#48CAE4', '#FFD166'];

interface JoinBonusPopupProps {
    visible: boolean;
    onDismiss: () => void;
}

interface Particle {
    x: number;
    size: number;
    color: string;
    delay: number;
    duration: number;
}

const makeParticles = (): Particle[] =>
    Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
        x: Math.random() * (screenWidth - 20),
        size: Math.random() * 10 + 6,
        color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
        delay: Math.random() * 400,
        duration: Math.random() * 800 + 1200,
    }));

const ParticleLayer: React.FC<{ run: boolean }> = ({ run }) => {
    const particles = useRef(makeParticles()).current;
    const anims = useRef(particles.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        if (!run) {
            return;
        }

        const animations = particles.map((particle, index) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(particle.delay),
                    Animated.timing(anims[index], {
                        toValue: 1,
                        duration: particle.duration,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anims[index], {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            )
        );

        Animated.parallel(animations).start();
        return () => animations.forEach((animation) => animation.stop());
    }, [anims, particles, run]);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map((particle, index) => (
                <Animated.View
                    key={index}
                    style={{
                        position: 'absolute',
                        left: particle.x,
                        bottom: -20,
                        width: particle.size,
                        height: particle.size,
                        borderRadius: particle.size / 2,
                        backgroundColor: particle.color,
                        opacity: anims[index].interpolate({
                            inputRange: [0, 0.1, 0.85, 1],
                            outputRange: [0, 0.9, 0.7, 0],
                        }),
                        transform: [
                            {
                                translateY: anims[index].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -(screenHeight * 0.7)],
                                }),
                            },
                        ],
                    }}
                />
            ))}
        </View>
    );
};

export const JoinBonusPopup: React.FC<JoinBonusPopupProps> = ({ visible, onDismiss }) => {
    const slideAnim = useRef(new Animated.Value(80)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.88)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 60,
                    friction: 10,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 280,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 60,
                    friction: 10,
                    useNativeDriver: true,
                }),
            ]).start();

            const pulseLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.06,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                ])
            );

            pulseLoop.start();
            return () => pulseLoop.stop();
        }

        slideAnim.setValue(80);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.88);
        pulseAnim.setValue(1);
        return undefined;
    }, [fadeAnim, pulseAnim, scaleAnim, slideAnim, visible]);

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <ParticleLayer run={visible} />

                <Animated.View
                    style={[
                        styles.card,
                        { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
                    ]}
                >
                    <LinearGradient
                        colors={['#03045E', '#0077B6', '#00B4D8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                    >
                        <View style={styles.ring} />

                        <View style={styles.iconWrap}>
                            <Ionicons name="gift" size={36} color="#FFFFFF" />
                        </View>

                        <Text style={styles.headline}>🎉 Welcome Bonus Unlocked!</Text>

                        <Animated.View style={[styles.amountWrap, { transform: [{ scale: pulseAnim }] }]}>
                            <Text style={styles.amountCurrency}>₹</Text>
                            <Text style={styles.amountValue}>10,000</Text>
                        </Animated.View>

                        <Text style={styles.subtitle}>
                            Added to your wallet.{'\n'}Use it on Ionizers above ₹4,00,000.
                        </Text>

                        <Text style={styles.note}>This bonus cannot be withdrawn</Text>

                        <View style={styles.divider} />

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

                    <TouchableOpacity style={styles.cta} onPress={onDismiss} activeOpacity={0.88}>
                        <Text style={styles.ctaText}>👉 Explore Ionizers</Text>
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
        width: 280,
        height: 280,
        borderRadius: 140,
        borderWidth: 48,
        borderColor: 'rgba(255,255,255,0.06)',
        top: -100,
        right: -80,
    },
    iconWrap: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    headline: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    amountWrap: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    amountCurrency: {
        fontSize: 28,
        fontWeight: '700',
        color: '#90E0EF',
        marginTop: 8,
    },
    amountValue: {
        fontSize: 56,
        fontWeight: '900',
        color: '#FFFFFF',
        lineHeight: 64,
        letterSpacing: -2,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.sm,
    },
    note: {
        fontSize: 12,
        color: '#90E0EF',
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: spacing.lg,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    cta: {
        backgroundColor: '#FFFFFF',
        paddingVertical: spacing.md + 4,
        alignItems: 'center',
    },
    ctaText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0077B6',
    },
});
