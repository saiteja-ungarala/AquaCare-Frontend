// Role Selection Screen - First screen of the app
// Modern 'Viral India' Aesthetic: Clean, Accessible, High Contrast

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { useAuthStore } from '../../store';
import { UserRole } from '../../models/types';
import {
    GradientBackground,
    AnimatedPressable,
    FadeInView,
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
    color: string;
}

const RoleCard: React.FC<RoleCardProps> = ({
    role,
    title,
    description,
    icon,
    onPress,
    delay,
    color,
}) => (
    <FadeInView delay={delay} duration={500} direction="up" distance={30}>
        <AnimatedPressable style={styles.roleCard} onPress={onPress}>
            <View style={[styles.roleIconContainer, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
            <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>{title}</Text>
                <Text style={styles.roleDescription}>{description}</Text>
            </View>
            <View style={styles.arrowContainer}>
                <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
            </View>
        </AnimatedPressable>
    </FadeInView>
);

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
    navigation,
}) => {
    const setSelectedRole = useAuthStore((state) => state.setSelectedRole);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        navigation.navigate('Login');
    };

    return (
        <GradientBackground lightStatusBar={true}>
            <SafeAreaView style={styles.container}>
                {/* Header Section */}
                <FadeInView delay={100} duration={600} direction="down" distance={20} style={styles.header}>
                    <View style={styles.logoBadge}>
                        <Ionicons name="water" size={32} color={colors.primary} />
                    </View>
                    <Text style={styles.appName}>AquaCare</Text>
                    <Text style={styles.tagline}>Select your role to continue</Text>
                </FadeInView>

                {/* Role Selection Cards */}
                <View style={styles.content}>
                    <RoleCard
                        role="customer"
                        title="Customer"
                        description="Book services & buy products"
                        icon="person"
                        color={colors.primary}
                        onPress={() => handleRoleSelect('customer')}
                        delay={300}
                    />

                    <RoleCard
                        role="agent"
                        title="Service Agent"
                        description="Accept jobs & manage earnings"
                        icon="construct"
                        color={colors.accent}
                        onPress={() => handleRoleSelect('agent')}
                        delay={400}
                    />

                    <RoleCard
                        role="dealer"
                        title="Dealer"
                        description="Manage inventory & orders"
                        icon="business"
                        color={colors.info}
                        onPress={() => handleRoleSelect('dealer')}
                        delay={500}
                    />
                </View>

                {/* Footer */}
                <FadeInView delay={700} duration={400} style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.link}>Terms</Text> & <Text style={styles.link}>Privacy Policy</Text>
                    </Text>
                </FadeInView>
            </SafeAreaView>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        marginTop: spacing.xl,
    },
    logoBadge: {
        width: 64,
        height: 64,
        borderRadius: 24,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    appName: {
        ...typography.h1,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    tagline: {
        ...typography.body,
        color: colors.textSecondary,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
        gap: spacing.md,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.sm,
    },
    roleIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    roleTitle: {
        ...typography.h2,
        fontSize: 18,
        color: colors.text,
        marginBottom: 2,
    },
    roleDescription: {
        ...typography.caption,
        color: colors.textSecondary,
        fontSize: 13,
    },
    arrowContainer: {
        padding: spacing.xs,
    },
    footer: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    footerText: {
        ...typography.caption,
        color: colors.textMuted,
        textAlign: 'center',
    },
    link: {
        color: colors.primary,
        fontWeight: '600',
    },
});
