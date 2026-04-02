import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { customerColors } from '../../theme/customerTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable, FadeInView } from '../../components';
import { useAuthStore } from '../../store';
import { UserRole } from '../../models/types';

type RoleSelectionScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

type RoleOption = {
    role: UserRole;
    title: string;
    subtitle: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    accent: string;
    panel: [string, string];
    points: string[];
};

const ROLE_OPTIONS: RoleOption[] = [
    {
        role: 'customer',
        title: 'Customer',
        subtitle: 'Home care and shopping',
        description: 'Book purifier services, shop products, track orders, and manage your family water-care account in one place.',
        icon: 'sparkles',
        accent: customerColors.primary,
        panel: ['rgba(0, 194, 179, 0.94)', 'rgba(0, 126, 116, 0.96)'],
        points: ['Book service visits', 'Shop RO essentials', 'Track orders and wallet'],
    },
    {
        role: 'technician',
        title: 'Technician',
        subtitle: 'Field operations workspace',
        description: 'Accept jobs, upload updates, monitor payouts, and run your on-ground workflow from a focused technician dashboard.',
        icon: 'construct',
        accent: colors.accent,
        panel: ['rgba(255, 176, 0, 0.96)', 'rgba(232, 154, 0, 0.98)'],
        points: ['Manage active jobs', 'Update visit progress', 'Track earnings and campaigns'],
    },
];

interface RoleCardProps {
    option: RoleOption;
    delay: number;
    onPress: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ option, delay, onPress }) => (
    <FadeInView delay={delay} duration={520} direction="up" distance={24}>
        <AnimatedPressable style={styles.roleCardShell} onPress={onPress}>
            <LinearGradient colors={option.panel} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.roleCard}>
                <View style={styles.roleCardTop}>
                    <View style={styles.roleBadge}>
                        <Ionicons name={option.icon} size={22} color="#FFFFFF" />
                    </View>
                    <View style={styles.roleArrow}>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </View>
                </View>

                <Text style={styles.roleTitle}>{option.title}</Text>
                <Text style={styles.roleSubtitle}>{option.subtitle}</Text>
                <Text style={styles.roleDescription}>{option.description}</Text>

                <View style={styles.pointsWrap}>
                    {option.points.map((point) => (
                        <View key={point} style={styles.pointChip}>
                            <Ionicons name="checkmark-circle" size={14} color={option.accent} />
                            <Text style={styles.pointText}>{point}</Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>
        </AnimatedPressable>
    </FadeInView>
);

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ navigation }) => {
    const setSelectedRole = useAuthStore((state) => state.setSelectedRole);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        navigation.navigate('Login');
    };

    return (
        <ImageBackground
            source={require('../../../assets/purifier5.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <LinearGradient
                colors={['rgba(4, 13, 20, 0.84)', 'rgba(3, 37, 44, 0.48)', 'rgba(3, 20, 25, 0.88)']}
                locations={[0, 0.42, 1]}
                style={styles.overlay}
            />

            <SafeAreaView style={styles.container}>
                <FadeInView delay={120} duration={520} direction="down" distance={18} style={styles.hero}>
                    <View style={styles.brandRow}>
                        <View style={styles.logoHalo}>
                            <Image source={require('../../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
                        </View>
                        <View style={styles.brandCopy}>
                            <Text style={styles.heroEyebrow}>Choose your workspace</Text>
                            <Text style={styles.heroTitle}>IONORA CARE</Text>
                            <Text style={styles.heroSubtitle}>
                                Pick the experience built for your day. The mobile app now focuses on customer and technician journeys only.
                            </Text>
                        </View>
                    </View>
                </FadeInView>

                <View style={styles.selectionPanel}>
                    {ROLE_OPTIONS.map((option, index) => (
                        <RoleCard
                            key={option.role}
                            option={option}
                            delay={260 + (index * 120)}
                            onPress={() => handleRoleSelect(option.role)}
                        />
                    ))}
                </View>

                <FadeInView delay={620} duration={360} style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our <Text style={styles.footerLink}>Terms</Text> and <Text style={styles.footerLink}>Privacy Policy</Text>.
                    </Text>
                </FadeInView>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    hero: {
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    brandRow: {
        backgroundColor: 'rgba(7, 23, 30, 0.48)',
        borderRadius: 28,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        ...shadows.md,
    },
    logoHalo: {
        width: 84,
        height: 84,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    logoImage: {
        width: 70,
        height: 70,
    },
    brandCopy: {
        gap: spacing.xs,
    },
    heroEyebrow: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.72)',
    },
    heroTitle: {
        ...typography.title,
        color: '#FFFFFF',
    },
    heroSubtitle: {
        ...typography.body,
        color: 'rgba(255,255,255,0.84)',
        lineHeight: 22,
        maxWidth: '95%',
    },
    selectionPanel: {
        flex: 1,
        justifyContent: 'flex-end',
        gap: spacing.md,
        paddingBottom: spacing.xl,
    },
    roleCardShell: {
        borderRadius: 28,
    },
    roleCard: {
        borderRadius: 28,
        padding: spacing.lg,
        minHeight: 208,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    roleCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    roleBadge: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleArrow: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleTitle: {
        ...typography.title,
        color: '#FFFFFF',
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
    },
    roleSubtitle: {
        ...typography.h2,
        color: 'rgba(255,255,255,0.88)',
        marginBottom: spacing.sm,
    },
    roleDescription: {
        ...typography.body,
        color: 'rgba(255,255,255,0.84)',
        lineHeight: 21,
    },
    pointsWrap: {
        gap: spacing.sm,
        marginTop: spacing.lg,
    },
    pointChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    pointText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.text,
        flexShrink: 1,
    },
    footer: {
        paddingBottom: spacing.lg,
    },
    footerText: {
        ...typography.caption,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.72)',
        lineHeight: 18,
    },
    footerLink: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});
