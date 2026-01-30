// Role Selection Screen - First screen of the app

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { useAuthStore } from '../../store';
import { UserRole } from '../../models/types';

type RoleSelectionScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

interface RoleCardProps {
    role: UserRole;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
    role,
    title,
    description,
    icon,
    onPress,
}) => (
    <TouchableOpacity style={styles.roleCard} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.roleIconContainer}>
            <Ionicons name={icon} size={32} color={colors.primary} />
        </View>
        <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>{title}</Text>
            <Text style={styles.roleDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
    </TouchableOpacity>
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.header}
            >
                <View style={styles.logoContainer}>
                    <Ionicons name="water" size={64} color={colors.textOnPrimary} />
                </View>
                <Text style={styles.appName}>AquaCare</Text>
                <Text style={styles.tagline}>Pure Water, Better Life</Text>
            </LinearGradient>

            <View style={styles.content}>
                <Text style={styles.selectTitle}>Continue as</Text>

                <RoleCard
                    role="customer"
                    title="Customer"
                    description="Book services & buy products"
                    icon="person-outline"
                    onPress={() => handleRoleSelect('customer')}
                />

                <RoleCard
                    role="agent"
                    title="Service Agent"
                    description="Accept jobs & earn money"
                    icon="construct-outline"
                    onPress={() => handleRoleSelect('agent')}
                />

                <RoleCard
                    role="dealer"
                    title="Dealer"
                    description="Manage orders & commissions"
                    icon="business-outline"
                    onPress={() => handleRoleSelect('dealer')}
                />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    By continuing, you agree to our{' '}
                    <Text style={styles.link}>Terms of Service</Text> and{' '}
                    <Text style={styles.link}>Privacy Policy</Text>
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
        alignItems: 'center',
        borderBottomLeftRadius: borderRadius.xl,
        borderBottomRightRadius: borderRadius.xl,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    appName: {
        ...typography.h1,
        color: colors.textOnPrimary,
        fontWeight: '700',
    },
    tagline: {
        ...typography.body,
        color: 'rgba(255,255,255,0.8)',
        marginTop: spacing.xs,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    selectTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.lg,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    roleIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    roleTitle: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
    },
    roleDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginTop: 2,
    },
    footer: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    footerText: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    link: {
        color: colors.primary,
        fontWeight: '500',
    },
});
