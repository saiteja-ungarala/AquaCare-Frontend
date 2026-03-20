import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { customerColors } from '../../theme/customerTheme';
import { SUPPORT_CONFIG } from '../../config/constants';

const SUPPORT = {
    phone: SUPPORT_CONFIG.phone,
    email: SUPPORT_CONFIG.email,
    whatsapp: SUPPORT_CONFIG.whatsapp,
    hours: SUPPORT_CONFIG.hours || 'Support timings will be listed here once configured.',
};

type Props = { navigation: NativeStackNavigationProp<any> };

const ContactRow = ({ icon, label, value, onPress }: { icon: any; label: string; value: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.iconWrap}>
            <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
);

export const ContactUsScreen: React.FC<Props> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const supportItems = [
        SUPPORT.phone
            ? { icon: 'call-outline', label: 'Call Us', value: SUPPORT.phone, onPress: () => Linking.openURL(`tel:${SUPPORT.phone}`) }
            : null,
        SUPPORT.email
            ? { icon: 'mail-outline', label: 'Email', value: SUPPORT.email, onPress: () => Linking.openURL(`mailto:${SUPPORT.email}`) }
            : null,
        SUPPORT.whatsapp
            ? { icon: 'logo-whatsapp', label: 'WhatsApp', value: SUPPORT.whatsapp, onPress: () => Linking.openURL(`https://wa.me/${SUPPORT.whatsapp}`) }
            : null,
    ].filter(Boolean) as Array<{ icon: any; label: string; value: string; onPress: () => void }>;

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
            <ScrollView style={styles.scroll}>
                <Text style={styles.intro}>Reach out through any available support channel below.</Text>
                {supportItems.length > 0 ? (
                    <View style={styles.card}>
                        {supportItems.map((item) => (
                            <ContactRow key={item.label} icon={item.icon} label={item.label} value={item.value} onPress={item.onPress} />
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyCard}>
                        <Ionicons name="information-circle-outline" size={28} color={customerColors.primary} />
                        <Text style={styles.emptyTitle}>Support contact details are not available right now.</Text>
                        <Text style={styles.emptySubtitle}>Please update the app support configuration before release.</Text>
                    </View>
                )}
                <Text style={styles.hours}>Support Hours: {SUPPORT.hours}</Text>
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
    scroll: { flex: 1, padding: spacing.md },
    intro: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 22 },
    card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, ...shadows.sm, overflow: 'hidden' },
    emptyCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        padding: spacing.lg,
        alignItems: 'center',
    },
    emptyTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    emptySubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: spacing.xs,
    },
    row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    rowLabel: { ...typography.body, fontWeight: '600', color: colors.text, marginBottom: 2 },
    rowValue: { ...typography.caption, color: colors.textSecondary },
    hours: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
