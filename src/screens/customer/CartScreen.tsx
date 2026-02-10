// Cart Screen - Backend-aware, handles both product and service items

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
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
            Alert.alert('Error', error.response?.data?.message || 'Failed to update quantity');
        }
    };

    const handleRemoveItem = async (cartItemId: number) => {
        try {
            await removeCartItem(cartItemId);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to remove item');
        }
    };

    const handleCheckout = async () => {
        // For now, use COD with a placeholder address
        // In production, user should select address first
        Alert.alert(
            'Checkout',
            'Select payment method:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Cash on Delivery',
                    onPress: async () => {
                        try {
                            // TODO: Replace with actual address selection
                            const result = await ordersService.checkout({
                                addressId: 1, // Placeholder address
                                paymentMethod: 'cod',
                            });
                            Alert.alert(
                                'Order Placed! 🎉',
                                `Order #${result.orderId} placed successfully.`,
                                [{ text: 'OK', onPress: () => { clearLocalCart(); fetchCart(); navigation.navigate('Home'); } }]
                            );
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Checkout failed');
                        }
                    },
                },
            ]
        );
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

            <View style={styles.bottomBar}>
                <View><Text style={styles.bottomLabel}>Total</Text><Text style={styles.bottomPrice}>₹{finalTotal.toLocaleString()}</Text></View>
                <Button title="Checkout" onPress={handleCheckout} style={{ paddingHorizontal: 32 }} />
            </View>
        </SafeAreaView>
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
});
