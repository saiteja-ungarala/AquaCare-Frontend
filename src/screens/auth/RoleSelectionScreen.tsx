// Role Selection Screen - First screen of the app with animations

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius } from '../../theme/theme';
import { useAuthStore } from '../../store';
import { UserRole } from '../../models/types';
import {
    GradientBackground,
    AnimatedPressable,
    FadeInView,
    PulseIcon
} from '../../components';

type RoleSelectionScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

interface RoleCardProps {
    role: UserRole;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    delay: number;
}

const RoleCard: React.FC<RoleCardProps> = ({
    role,
    title,
    description,
    icon,
    onPress,
    delay,
}) => (
    <FadeInView delay={delay} duration={500} direction="up" distance={30}>
        <AnimatedPressable style={styles.roleCard} onPress={onPress} scaleValue={0.97}>
            <View style={styles.roleIconContainer}>
                <Ionicons name={icon} size={32} color={colors.glassText} />
            </View>
            <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>{title}</Text>
                <Text style={styles.roleDescription}>{description}</Text>
            </View>
            <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={24} color={colors.glassTextSecondary} />
            </View>
        </AnimatedPressable>
    </FadeInView>
);

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
    navigation,
}) => {
    const setSelectedRole = useAuthStore((state) => state.setSelectedRole);

    const handleRoleSelect = (role: UserRole) => {
        console.log('Role selected:', role);
        setSelectedRole(role);
        console.log('Navigating to Login...');
        navigation.navigate('Login');
    };

    return (
        <GradientBackground>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Logo Section with Pulse Animation */}
                <FadeInView delay={100} duration={600} direction="down" distance={20}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <PulseIcon
                                name="water"
                                size={64}
                                color={colors.glassText}
                                pulseColor={colors.glowTeal}
                            />
                        </View>

                        <Text style={styles.appName}>AquaCare</Text>
                        <Text style={styles.tagline}>Pure Water, Better Life</Text>
                    </View>
                </FadeInView>

                {/* Role Selection Cards with Staggered Animation */}
                <View style={styles.content}>
                    <FadeInView delay={300} duration={400}>
                        <Text style={styles.selectTitle}>Continue as</Text>
                    </FadeInView>

                    <RoleCard
                        role="customer"
                        title="Customer"
                        description="Book services & buy products"
                        icon="person-outline"
                        onPress={() => handleRoleSelect('customer')}
                        delay={400}
                    />

                    <RoleCard
                        role="agent"
                        title="Service Agent"
                        description="Accept jobs & earn money"
                        icon="construct-outline"
                        onPress={() => handleRoleSelect('agent')}
                        delay={550}
                    />

                    <RoleCard
                        role="dealer"
                        title="Dealer"
                        description="Manage orders & commissions"
                        icon="business-outline"
                        onPress={() => handleRoleSelect('dealer')}
                        delay={700}
                    />
                </View>

                {/* Footer */}
                <FadeInView delay={900} duration={400}>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By continuing, you agree to our{' '}
                            <Text style={styles.link}>Terms of Service</Text> and{' '}
                            <Text style={styles.link}>Privacy Policy</Text>
                        </Text>
                    </View>
                </FadeInView>
            </View>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: spacing.xxl + 20,
    },
    header: {
        alignItems: 'center',
        paddingBottom: spacing.xl,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.glassSurfaceStrong,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: colors.glassBorder,
    },
    appName: {
        ...typography.h1,
        color: colors.glassText,
        fontWeight: '700',
        letterSpacing: 1,
    },
    tagline: {
        ...typography.body,
        color: colors.glassTextSecondary,
        marginTop: spacing.xs,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    selectTitle: {
        ...typography.h3,
        color: colors.glassText,
        marginBottom: spacing.lg,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glassSurfaceStrong,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1.5,
        borderColor: colors.glassBorder,
    },
    roleIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.glassSurfaceVibrant,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    roleTitle: {
        ...typography.body,
        fontWeight: '700',
        color: colors.glassText,
    },
    roleDescription: {
        ...typography.bodySmall,
        color: colors.glassTextSecondary,
        marginTop: 2,
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.glassSurface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    footerText: {
        ...typography.caption,
        color: colors.glassTextSecondary,
        textAlign: 'center',
    },
    link: {
        color: colors.glassText,
        fontWeight: '600',
    },
});
