// Cart Screen

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { Button } from '../../components';
import { useCartStore, useWalletStore, useBookingsStore } from '../../store';

type CartScreenProps = { navigation: NativeStackNavigationProp<any> };

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
    const { items, totalAmount, updateQuantity, removeFromCart, clearCart } = useCartStore();
    const walletBalance = useWalletStore((state) => state.balance);
    const deliveryFee = totalAmount > 0 ? 99 : 0;
    const finalTotal = totalAmount + deliveryFee;

    const getIcon = (category: string): keyof typeof Ionicons.glyphMap => {
        switch (category) {
            case 'water_purifier': return 'water';
            case 'water_softener': return 'beaker';
            case 'water_ionizer': return 'flash';
            case 'ro_plant': return 'construct';
            case 'ionizer': return 'flash';
            default: return 'cube';
        }
    };

    const { createBooking } = useBookingsStore();

    const handleCheckout = async () => {
        // Process services
        const serviceItems = items.filter(i => i.type === 'service');

        for (const item of serviceItems) {
            if (item.service && item.bookingDate && item.bookingTime) {
                await createBooking(
                    item.service,
                    item.bookingDate,
                    item.bookingTime,
                    {
                        id: 'default',
                        street: '123 Main Street',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        pincode: '400001',
                        isDefault: true,
                    }
                );
            }
        }

        Alert.alert('Order Placed! 🎉', 'Your order and service bookings have been placed successfully.', [{ text: 'OK', onPress: () => { clearCart(); navigation.navigate('Home'); } }]);
    };

    if (items.length === 0) {
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
                    <Button title="Browse Products" onPress={() => navigation.navigate('Home')} style={{ marginTop: 16 }} />
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
                    <Text style={styles.headerTitle}>Cart ({items.length})</Text>
                </View>
                <TouchableOpacity onPress={clearCart}><Text style={styles.clearText}>Clear All</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollView}>
                {items.map((item) => {
                    const isService = item.type === 'service';
                    const data = isService ? item.service! : item.product!;
                    const itemId = data.id;

                    return (
                        <View key={item.id} style={styles.cartItem}>
                            <View style={styles.itemImage}>
                                <Ionicons name={getIcon(data.category)} size={40} color={colors.primary} />
                            </View>
                            <View style={styles.itemContent}>
                                <Text style={styles.itemName} numberOfLines={2}>{data.name}</Text>
                                <Text style={styles.itemPrice}>₹{data.price.toLocaleString()}</Text>
                                {isService && item.bookingDate && (
                                    <View style={styles.bookingInfo}>
                                        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                                        <Text style={styles.bookingText}>{item.bookingDate} at {item.bookingTime}</Text>
                                    </View>
                                )}
                                <View style={styles.quantityRow}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => updateQuantity(itemId, item.quantity - 1)}
                                    >
                                        <Ionicons name="remove" size={18} color={colors.primary} />
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => updateQuantity(itemId, item.quantity + 1)}
                                    >
                                        <Ionicons name="add" size={18} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => removeFromCart(itemId)}>
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    );
                })}
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
    clearText: { ...typography.bodySmall, color: colors.error },
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
});
