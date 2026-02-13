// Cart Screen - Backend-aware, handles both product and service items

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { Button } from '../../components';
import { useCartStore } from '../../store';
import { BackendCartItem } from '../../store/cartStore';
import ordersService from '../../services/ordersService';

type CartScreenProps = { navigation: NativeStackNavigationProp<any> };

// Normalized cart item for safe rendering
interface NormalizedCartItem {
    cartItemId: number;
    itemType: 'product' | 'service';
    qty: number;
    unitPrice: number;
    title: string;
    productId?: number;
    serviceId?: number;
    bookingDate?: string;
    bookingTime?: string;
}

// Normalize backend cart item to UI-safe shape with safe defaults
const normalizeCartItem = (item: BackendCartItem): NormalizedCartItem => ({
    cartItemId: item.id ?? 0,
    itemType: item.itemType ?? 'product',
    qty: item.qty ?? 1,
    unitPrice: item.unitPrice ?? 0,
    title: item.itemType === 'product'
        ? (item.productName || 'Product')
        : (item.serviceName || 'Service'),
    productId: item.productId,
    serviceId: item.serviceId,
    bookingDate: item.bookingDate,
    bookingTime: item.bookingTime,
});

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
    const { items, totalAmount, isLoading, fetchCart, updateCartItemQty, removeCartItem, clearLocalCart } = useCartStore();

    // Local State for Checkout
    const [checkoutModalVisible, setCheckoutModalVisible] = React.useState(false);
    const [isCheckingOut, setIsCheckingOut] = React.useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = React.useState(false);
    const [checkoutError, setCheckoutError] = React.useState<string | null>(null);
    const [orderId, setOrderId] = React.useState<string | null>(null);

    const deliveryFee = totalAmount > 0 ? 99 : 0;
    const finalTotal = totalAmount + deliveryFee;

    // Fetch cart on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [])
    );

    // Normalize items safely
    const cartItemsRaw = items ?? [];
    const cartItems: NormalizedCartItem[] = cartItemsRaw
        .filter(Boolean)
        .map(normalizeCartItem);

    const getIcon = (itemType: 'product' | 'service'): keyof typeof Ionicons.glyphMap => {
        return itemType === 'service' ? 'construct' : 'cube';
    };

    const handleUpdateQty = async (cartItemId: number, newQty: number) => {
        try {
            await updateCartItemQty(cartItemId, newQty);
        } catch (error: any) {
            setCheckoutError(error.response?.data?.message || 'Failed to update quantity');
            setTimeout(() => setCheckoutError(null), 3000);
        }
    };

    const handleRemoveItem = async (cartItemId: number) => {
        try {
            await removeCartItem(cartItemId);
        } catch (error: any) {
            setCheckoutError(error.response?.data?.message || 'Failed to remove item');
            setTimeout(() => setCheckoutError(null), 3000);
        }
    };

    const handleCheckoutButton = () => {
        if (cartItems.length === 0) return;
        setCheckoutModalVisible(true);
    };

    const confirmCheckout = async () => {
        setIsCheckingOut(true);
        setCheckoutError(null);
        try {
            // Placeholder address ID 1
            const result = await ordersService.checkout({
                addressId: 1,
                paymentMethod: 'cod',
            });
            setOrderId(String(result.orderId));
            setCheckoutModalVisible(false);
            setCheckoutSuccess(true);

            // Clear cart and navigate after delay
            setTimeout(() => {
                clearLocalCart();
                fetchCart();
                setCheckoutSuccess(false);
                // Navigate to Bookings tab or Home
                navigation.navigate('CustomerTabs', { screen: 'Bookings' } as any);
            }, 2500);
        } catch (error: any) {
            console.error(error);
            setCheckoutError(error.response?.data?.message || 'Checkout failed');
            setTimeout(() => setCheckoutError(null), 3000);
            setCheckoutModalVisible(false);
        } finally {
            setIsCheckingOut(false);
        }
    };

    // Loading state
    if (isLoading && cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cart</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading cart...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Empty cart
    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cart</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color={colors.textLight} />
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Button title="Browse Products" onPress={() => navigation.navigate('ProductListing', {})} style={{ marginTop: 16 }} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cart ({cartItems.length})</Text>
                </View>
                <TouchableOpacity onPress={() => { clearLocalCart(); fetchCart(); }}>
                    <Text style={styles.clearText}>Refresh</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                {cartItems.map((item) => (
                    <View key={String(item.cartItemId)} style={styles.cartItem}>
                        <View style={styles.itemImage}>
                            <Ionicons name={getIcon(item.itemType)} size={40} color={colors.primary} />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemName} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.itemPrice}>₹{item.unitPrice.toLocaleString()}</Text>
                            {item.itemType === 'service' && item.bookingDate && (
                                <View style={styles.bookingInfo}>
                                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                                    <Text style={styles.bookingText}>{item.bookingDate} at {item.bookingTime}</Text>
                                </View>
                            )}
                            <View style={styles.quantityRow}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => handleUpdateQty(item.cartItemId, item.qty - 1)}
                                >
                                    <Ionicons name="remove" size={18} color={colors.primary} />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{item.qty}</Text>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => handleUpdateQty(item.cartItemId, item.qty + 1)}
                                >
                                    <Ionicons name="add" size={18} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveItem(item.cartItemId)}>
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Price Details</Text>
                    <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text>₹{totalAmount.toLocaleString()}</Text></View>
                    <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery Fee</Text><Text>₹{deliveryFee}</Text></View>
                    <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>₹{finalTotal.toLocaleString()}</Text></View>
                </View>
            </ScrollView>

            {/* Error Banner in Cart */}
            {checkoutError && (
                <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={20} color={colors.error} />
                    <Text style={styles.errorBannerText}>{checkoutError}</Text>
                </View>
            )}

            <View style={styles.bottomBar}>
                <View><Text style={styles.bottomLabel}>Total</Text><Text style={styles.bottomPrice}>₹{finalTotal.toLocaleString()}</Text></View>
                <Button title="Checkout" onPress={handleCheckoutButton} style={{ paddingHorizontal: 32 }} />
            </View>

            {/* Checkout Confirmation Modal */}
            <Modal
                transparent
                visible={checkoutModalVisible}
                animationType="fade"
                onRequestClose={() => setCheckoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModal}>
                        <Ionicons name="cart-outline" size={48} color={colors.primary} />
                        <Text style={styles.confirmTitle}>Confirm Order</Text>
                        <Text style={styles.confirmDesc}>
                            Total Amount: ₹{finalTotal.toLocaleString()}
                        </Text>
                        <View style={styles.paymentMethod}>
                            <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.paymentText}>Cash on Delivery</Text>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setCheckoutModalVisible(false)}
                            >
                                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnConfirm]}
                                onPress={confirmCheckout}
                                disabled={isCheckingOut}
                            >
                                {isCheckingOut ? (
                                    <ActivityIndicator size="small" color={colors.textOnPrimary} />
                                ) : (
                                    <Text style={styles.modalBtnTextConfirm}>Place Order</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Overlay */}
            {
                checkoutSuccess && (
                    <View style={styles.successOverlay}>
                        <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                        <Text style={styles.successTitle}>Order Placed! 🎉</Text>
                        <Text style={styles.successDesc}>Order #{orderId} has been placed successfully.</Text>
                    </View>
                )
            }
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, ...shadows.sm },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    backButton: { marginRight: spacing.sm },
    headerTitle: { ...typography.h3, color: colors.text },
    clearText: { ...typography.bodySmall, color: colors.primary },
    scrollView: { flex: 1, padding: spacing.md },
    cartItem: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm, alignItems: 'center' },
    itemImage: { width: 70, height: 70, borderRadius: borderRadius.md, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
    itemContent: { flex: 1, marginLeft: spacing.md },
    itemName: { ...typography.body, fontWeight: '600', color: colors.text },
    itemPrice: { ...typography.body, color: colors.primary, fontWeight: '700' },
    bookingInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    bookingText: { ...typography.caption, color: colors.textSecondary },
    quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
    quantityButton: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    quantityText: { ...typography.body, fontWeight: '600', minWidth: 24, textAlign: 'center' },
    summaryCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.xl, ...shadows.sm },
    summaryTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    summaryLabel: { color: colors.textSecondary },
    totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.sm },
    totalLabel: { fontWeight: '600' },
    totalValue: { ...typography.h3, color: colors.primary, fontWeight: '700' },
    bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
    bottomLabel: { ...typography.caption, color: colors.textSecondary },
    bottomPrice: { ...typography.h3, fontWeight: '700' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    emptyTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg },
    loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
    confirmModal: { backgroundColor: colors.surface, width: '100%', maxWidth: 320, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', ...shadows.md },
    confirmTitle: { ...typography.h3, color: colors.text, marginTop: spacing.md, textAlign: 'center' },
    confirmDesc: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center', marginBottom: spacing.sm },
    paymentMethod: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceSecondary, padding: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.xl },
    paymentText: { ...typography.body, color: colors.text },
    modalActions: { flexDirection: 'row', gap: spacing.md, width: '100%' },
    modalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
    modalBtnCancel: { backgroundColor: colors.surfaceSecondary },
    modalBtnConfirm: { backgroundColor: colors.primary },
    modalBtnTextCancel: { ...typography.body, fontWeight: '600', color: colors.text },
    modalBtnTextConfirm: { ...typography.body, fontWeight: '600', color: colors.textOnPrimary },
    // Success Overlay
    successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', zIndex: 10, padding: spacing.xl },
    successTitle: { ...typography.h2, color: colors.success, marginTop: spacing.md, textAlign: 'center' },
    successDesc: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
    // Error Banner
    errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.error + '15', padding: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.error + '30', position: 'absolute', bottom: 80, left: spacing.md, right: spacing.md, borderRadius: borderRadius.md },
    errorBannerText: { ...typography.bodySmall, color: colors.error, flex: 1, fontWeight: '600' },
});
