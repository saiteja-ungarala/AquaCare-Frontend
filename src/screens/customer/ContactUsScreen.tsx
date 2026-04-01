import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { customerColors } from '../../theme/customerTheme';
import { SUPPORT_CONFIG } from '../../config/constants';

const SUPPORT = {
    phone: SUPPORT_CONFIG.phone || '9381938445',
    email: SUPPORT_CONFIG.email || 'support@ionoracare.com',
    whatsapp: SUPPORT_CONFIG.whatsapp || SUPPORT_CONFIG.phone || '9381938445',
    hours: SUPPORT_CONFIG.hours || 'Mon-Sat, 9 AM – 6 PM',
};

type Props = { navigation: NativeStackNavigationProp<any> };

export const ContactUsScreen: React.FC<Props> = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[customerColors.primary, customerColors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + spacing.md }]}
            >
                <Ionicons name="chatbubble-ellipses" size={120} color="rgba(255,255,255,0.1)" style={styles.headerIconBg} />
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.textOnPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Contact Us</Text>
                        <Text style={styles.headerSubtitle}>We are here to help you</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Info card */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.iconWrap}>
                            <Ionicons name="call-outline" size={22} color={customerColors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rowLabel}>Phone</Text>
                            <Text style={styles.rowValue}>{SUPPORT.phone}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.iconWrap}>
                            <Ionicons name="mail-outline" size={22} color={customerColors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rowLabel}>Email</Text>
                            <Text style={styles.rowValue}>{SUPPORT.email}</Text>
                        </View>
                    </View>

                    <View style={[styles.row, styles.rowLast]}>
                        <View style={styles.iconWrap}>
                            <Ionicons name="time-outline" size={22} color={customerColors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rowLabel}>Support Hours</Text>
                            <Text style={styles.rowValue}>{SUPPORT.hours}</Text>
                        </View>
                    </View>
                </View>

                {/* CTA buttons */}
                <TouchableOpacity
                    style={[styles.ctaBtn, styles.ctaBtnPrimary]}
                    onPress={() => Linking.openURL(`tel:${SUPPORT.phone}`)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="call" size={20} color="#FFFFFF" />
                    <Text style={styles.ctaBtnTextPrimary}>Call Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.ctaBtn, styles.ctaBtnOutline]}
                    onPress={() => Linking.openURL(`mailto:${SUPPORT.email}`)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="mail" size={20} color={customerColors.primary} />
                    <Text style={styles.ctaBtnTextOutline}>Email Us</Text>
                </TouchableOpacity>

                {SUPPORT.whatsapp ? (
                    <TouchableOpacity
                        style={[styles.ctaBtn, styles.ctaBtnWhatsApp]}
                        onPress={() => Linking.openURL(`https://wa.me/${SUPPORT.whatsapp}`)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                        <Text style={styles.ctaBtnTextPrimary}>WhatsApp</Text>
                    </TouchableOpacity>
                ) : null}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    headerIconBg: {
        position: 'absolute',
        right: -20,
        bottom: -20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 32,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.xs,
        marginLeft: -spacing.sm,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        ...typography.h2,
        color: colors.textOnPrimary,
        fontWeight: '800',
    },
    headerSubtitle: {
        ...typography.caption,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginTop: 2,
    },
    scroll: {
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        overflow: 'hidden',
        marginBottom: spacing.xl,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: customerColors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        flexShrink: 0,
    },
    rowLabel: { ...typography.bodySmall, fontWeight: '700', color: colors.text, marginBottom: 2 },
    rowValue: { ...typography.body, color: colors.textSecondary },
    ctaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md + 2,
        marginBottom: spacing.md,
    },
    ctaBtnPrimary: {
        backgroundColor: customerColors.primary,
        ...shadows.sm,
    },
    ctaBtnOutline: {
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: customerColors.primary,
        ...shadows.sm,
    },
    ctaBtnWhatsApp: {
        backgroundColor: '#25D366',
        ...shadows.sm,
    },
    ctaBtnTextPrimary: {
        ...typography.body,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    ctaBtnTextOutline: {
        ...typography.body,
        color: customerColors.primary,
        fontWeight: '700',
    },
});
