import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { RootStackScreenProps } from '../../models/types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { customerColors } from '../../theme/customerTheme';
import { useAuthStore } from '../../store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { paymentService } from '../../services/paymentService';

type PaymentScreenProps = RootStackScreenProps<'PaymentScreen'>;
const TEAL = customerColors.primary;

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { amount, entityType, entityId, description } = route.params;
    const user = useAuthStore((s) => s.user);

    const [errorMsg, setErrorMsg] = useState('');
    const [showRetryModal, setShowRetryModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const navigateAfterSuccess = () => {
        if (entityType === 'order') {
            navigation.replace('OrderDetails', { orderId: entityId });
            return;
        }
        navigation.replace('BookingDetail', { bookingId: entityId });
    };

    const getPaymentErrorMessage = (error: any): string => {
        return (
            error?.response?.data?.message ||
            error?.error?.description ||
            error?.description ||
            error?.message ||
            'Payment could not be completed. Please try again.'
        );
    };

    const openRazorpay = async (options: Record<string, unknown>): Promise<any> => {
        let RazorpayModule: any;
        try {
            RazorpayModule = require('react-native-razorpay');
        } catch {
            throw new Error('Razorpay SDK is not available in this app build. Please install a fresh dev/production build and try again.');
        }

        const RazorpayCheckout = RazorpayModule?.default ?? RazorpayModule;
        if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
            const appOwnership = (Constants as any)?.appOwnership;
            if (appOwnership === 'expo') {
                throw new Error('Razorpay is not supported in Expo Go. Please use a development or production app build.');
            }
            throw new Error('Razorpay native module is missing in this installed app. Rebuild and reinstall the app, then retry.');
        }

        return RazorpayCheckout.open(options);
    };

    const handlePayNow = async () => {
        if (isProcessing) return;

        if (Platform.OS === 'web') {
            setErrorMsg('Online payment is currently supported on mobile app builds.');
            setShowRetryModal(true);
            return;
        }

        setIsProcessing(true);
        setErrorMsg('');

        try {
            const razorpayOrder = await paymentService.createOrder(amount, entityType, entityId);

            const checkoutResponse = await openRazorpay({
                key: razorpayOrder.key,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'IONORA CARE',
                description,
                order_id: razorpayOrder.razorpay_order_id,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || '',
                },
                theme: { color: customerColors.primary },
            });

            await paymentService.verifyPayment(
                checkoutResponse?.razorpay_order_id || razorpayOrder.razorpay_order_id,
                checkoutResponse?.razorpay_payment_id,
                checkoutResponse?.razorpay_signature
            );

            Alert.alert('Payment Successful', 'Your payment was verified successfully.', [
                { text: 'Continue', onPress: navigateAfterSuccess },
            ]);
        } catch (error: any) {
            setErrorMsg(getPaymentErrorMessage(error));
            setShowRetryModal(true);
        } finally {
            setIsProcessing(false);
        }
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
                        disabled={isProcessing}
                    >
                        <Ionicons name="chevron-back" size={28} color={colors.textOnPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Online Payments</Text>
                        <Text style={styles.headerSubtitle}>Pay securely with Razorpay</Text>
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
                        <Text style={styles.amountHeroValue}>Rs {amount.toLocaleString('en-IN')}</Text>
                        <View style={styles.amountHeroBadge}>
                            <Ionicons name="shield-checkmark-outline" size={14} color={customerColors.primaryDark} />
                            <Text style={styles.amountHeroBadgeText}>Secure Razorpay checkout</Text>
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
                            <Text style={styles.detailValue}>Rs {amount.toLocaleString('en-IN')}</Text>
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
                            <Ionicons name="card-outline" size={20} color="#16A34A" />
                        </View>
                        <View style={styles.methodTextWrap}>
                            <Text style={styles.methodAvailLabel}>Online Payment</Text>
                            <Text style={styles.methodAvailSub}>UPI - Cards - Net Banking</Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                    </View>
                </View>

                <View style={styles.securityRow}>
                    <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.securityText}>Payments are processed securely via Razorpay.</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
                    onPress={handlePayNow}
                    disabled={isProcessing}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[customerColors.primary, customerColors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.payButtonGradient}
                    >
                        <View style={styles.payButtonInner}>
                            {isProcessing ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                                    <Text style={styles.payButtonText}>Pay Now</Text>
                                </>
                            )}
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <Modal visible={showRetryModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={[styles.modalIconWrap, { backgroundColor: TEAL + '15' }]}>
                            <Ionicons name="alert-circle-outline" size={56} color={TEAL} />
                        </View>
                        <Text style={styles.modalTitle}>Payment Incomplete</Text>
                        <Text style={styles.modalMessage}>
                            {errorMsg || 'Payment could not be completed.'}
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: TEAL }]}
                                onPress={() => {
                                    setShowRetryModal(false);
                                    handlePayNow();
                                }}
                            >
                                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Retry</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setShowRetryModal(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Close</Text>
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
    methodAvailSub: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
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
    payButtonDisabled: {
        opacity: 0.7,
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
    modalBtnCancel: {
        backgroundColor: '#F3F4F6',
    },
    modalBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
});
