import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackScreenProps } from '../../models/types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { customerColors } from '../../theme/customerTheme';
import { useAuthStore } from '../../store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PaymentScreenProps = RootStackScreenProps<'PaymentScreen'>;
const TEAL = customerColors.primary;

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { amount, entityType, description } = route.params;
    const user = useAuthStore((s) => s.user);

    const [errorMsg, setErrorMsg] = useState('');
    const [showRetryModal, setShowRetryModal] = useState(false);

    const handlePayNow = () => {
        setErrorMsg('Online payments are coming soon. For now, please use Cash on Delivery or wallet-supported checkout paths.');
        setShowRetryModal(true);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[customerColors.primary, customerColors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + spacing.md }]}
            >
                <Ionicons name="card" size={120} color="rgba(255,255,255,0.1)" style={styles.headerIconBg} />
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={28} color={colors.textOnPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Online Payments</Text>
                        <Text style={styles.headerSubtitle}>Online checkout is rolling out soon</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.amountHeroCard}>
                    <LinearGradient
                        colors={[customerColors.primary, customerColors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.amountHeroGradient}
                    >
                        <Text style={styles.amountHeroLabel}>Total Amount</Text>
                        <Text style={styles.amountHeroValue}>₹{amount.toLocaleString('en-IN')}</Text>
                        <View style={styles.amountHeroBadge}>
                            <Ionicons name="time-outline" size={14} color={customerColors.primaryDark} />
                            <Text style={styles.amountHeroBadgeText}>Online payments launching shortly</Text>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.detailsCard}>
                    <Text style={styles.detailsCardTitle}>Order Details</Text>

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: TEAL + '15' }]}>
                            <Ionicons
                                name={entityType === 'booking' ? 'construct' : 'cube'}
                                size={22}
                                color={TEAL}
                            />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>
                                {entityType === 'booking' ? 'Service Booking' : 'Product Order'}
                            </Text>
                            <Text style={styles.detailValue} numberOfLines={2}>{description}</Text>
                        </View>
                    </View>

                    <View style={styles.detailDivider} />

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: '#F59E0B15' }]}>
                            <Ionicons name="receipt-outline" size={22} color="#F59E0B" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Amount</Text>
                            <Text style={styles.detailValue}>₹{amount.toLocaleString('en-IN')}</Text>
                        </View>
                    </View>

                    <View style={styles.detailDivider} />

                    <View style={styles.detailRow}>
                        <View style={[styles.detailIcon, { backgroundColor: '#6366F115' }]}>
                            <Ionicons name="person-outline" size={22} color="#6366F1" />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Customer</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>{user?.name || 'You'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.methodsCard}>
                    <Text style={styles.methodsTitle}>Payment Methods</Text>
                    <View style={styles.methodRow}>
                        <View style={[styles.methodIconWrap, { backgroundColor: '#DCFCE7' }]}>
                            <Ionicons name="cash-outline" size={20} color="#16A34A" />
                        </View>
                        <View style={styles.methodTextWrap}>
                            <Text style={styles.methodAvailLabel}>Cash on Delivery</Text>
                            <Text style={styles.methodAvailSub}>Pay when your order arrives</Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                    </View>

                    <View style={[styles.methodRow, { marginTop: spacing.sm }]}>
                        <View style={[styles.methodIconWrap, { backgroundColor: '#F3F4F6' }]}>
                            <Ionicons name="card-outline" size={20} color="#9CA3AF" />
                        </View>
                        <View style={styles.methodTextWrap}>
                            <Text style={styles.methodUnavailLabel}>Online Payments</Text>
                            <Text style={styles.methodAvailSub}>UPI · Cards · Net Banking</Text>
                        </View>
                        <View style={styles.comingSoonBadge}>
                            <Text style={styles.comingSoonText}>Soon</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.securityRow}>
                    <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.securityText}>Tap below to see the rollout status for online checkout.</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.payButton}
                    onPress={handlePayNow}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[customerColors.primary, customerColors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.payButtonGradient}
                    >
                        <View style={styles.payButtonInner}>
                            <Ionicons name="time-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.payButtonText}>Payment Coming Soon</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <Modal visible={showRetryModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={[styles.modalIconWrap, { backgroundColor: TEAL + '15' }]}>
                            <Ionicons name="time-outline" size={56} color={TEAL} />
                        </View>
                        <Text style={styles.modalTitle}>Coming Soon</Text>
                        <Text style={styles.modalMessage}>
                            {errorMsg || 'Online payment checkout is coming soon.'}
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: TEAL }]}
                                onPress={() => {
                                    setShowRetryModal(false);
                                    navigation.goBack();
                                }}
                            >
                                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Got it</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F8FA' },
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
        ...typography.headerTitle,
        color: colors.textOnPrimary,
    },
    headerSubtitle: {
        ...typography.caption,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginTop: 2,
    },
    scrollView: { flex: 1 },
    scrollContent: { padding: spacing.lg },
    amountHeroCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: spacing.md,
        shadowColor: TEAL,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
    },
    amountHeroGradient: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    amountHeroLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    amountHeroValue: {
        fontSize: 42,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1,
        marginBottom: spacing.md,
    },
    amountHeroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: 20,
    },
    amountHeroBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: customerColors.primaryDark,
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: spacing.lg,
        marginBottom: spacing.md,
        shadowColor: 'rgba(0,0,0,0.06)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 3,
    },
    detailsCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.lg,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    detailIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    detailDivider: {
        height: 1,
        backgroundColor: '#F0F3F5',
        marginVertical: spacing.md,
    },
    methodsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: spacing.lg,
        marginBottom: spacing.md,
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
    },
    methodsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
    },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    methodIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    methodTextWrap: {
        flex: 1,
    },
    methodAvailLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    methodUnavailLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 2,
    },
    methodAvailSub: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    comingSoonBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    comingSoonText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
    },
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    securityText: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '500',
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'android' ? spacing.lg : spacing.xl,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F3F5',
    },
    payButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: TEAL,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    payButtonGradient: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    payButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    payButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    modalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: spacing.xl,
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        ...shadows.lg,
    },
    modalIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    modalMessage: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
});
