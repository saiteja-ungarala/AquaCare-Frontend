// Product Details Screen

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../models/types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { Button } from '../../components';
import { Product } from '../../models/types';
import { useCartStore } from '../../store';

type ProductDetailsScreenProps = RootStackScreenProps<'ProductDetails'>;

export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
    navigation,
    route,
}) => {
    const { product } = route.params;
    const addToCart = useCartStore((state) => state.addToCart);

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    // Get icon based on category
    const getIcon = (): keyof typeof Ionicons.glyphMap => {
        switch (product.category) {
            case 'water_purifier':
                return 'water';
            case 'water_softener':
                return 'beaker';
            case 'water_ionizer':
                return 'flash';
            default:
                return 'cube';
        }
    };

    const handleAddToCart = () => {
        addToCart(product, 'product');
        Alert.alert(
            'Added to Cart! 🛒',
            `${product.name} has been added to your cart`,
            [
                { text: 'Continue Shopping', style: 'cancel' },
                { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
            ]
        );
    };

    const handleBuyNow = () => {
        addToCart(product, 'product');
        navigation.navigate('Cart');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton}>
                        <Ionicons name="share-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Product Image */}
                <View style={styles.imageContainer}>
                    {discount > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{discount}% OFF</Text>
                        </View>
                    )}
                    <Ionicons name={getIcon()} size={120} color={colors.primary} />
                </View>

                {/* Product Info */}
                <View style={styles.content}>
                    <Text style={styles.productName}>{product.name}</Text>

                    <View style={styles.ratingRow}>
                        <View style={styles.rating}>
                            <Ionicons name="star" size={18} color="#FFB800" />
                            <Text style={styles.ratingText}>{product.rating}</Text>
                            <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
                        </View>
                        {product.inStock ? (
                            <View style={styles.stockBadge}>
                                <Text style={styles.stockText}>In Stock</Text>
                            </View>
                        ) : (
                            <View style={[styles.stockBadge, styles.outOfStock]}>
                                <Text style={[styles.stockText, styles.outOfStockText]}>Out of Stock</Text>
                            </View>
                        )}
                    </View>

                    {/* Price */}
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
                        {product.originalPrice && (
                            <Text style={styles.originalPrice}>
                                ₹{product.originalPrice.toLocaleString()}
                            </Text>
                        )}
                        {discount > 0 && (
                            <Text style={styles.saveText}>You save ₹{(product.originalPrice! - product.price).toLocaleString()}</Text>
                        )}
                    </View>

                    {/* Free Installation Banner */}
                    <View style={styles.offerBanner}>
                        <Ionicons name="gift" size={24} color={colors.success} />
                        <View style={styles.offerContent}>
                            <Text style={styles.offerTitle}>Free Installation</Text>
                            <Text style={styles.offerDesc}>Professional installation by our experts</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{product.description}</Text>
                    </View>

                    {/* Features */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Key Features</Text>
                        {product.features.map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                <Text style={styles.featureText}>{feature}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Delivery Info */}
                    <View style={styles.deliveryCard}>
                        <View style={styles.deliveryRow}>
                            <Ionicons name="location" size={20} color={colors.primary} />
                            <Text style={styles.deliveryText}>Delivery available to your location</Text>
                        </View>
                        <View style={styles.deliveryRow}>
                            <Ionicons name="time" size={20} color={colors.primary} />
                            <Text style={styles.deliveryText}>Estimated delivery in 3-5 days</Text>
                        </View>
                        <View style={styles.deliveryRow}>
                            <Ionicons name="reload" size={20} color={colors.primary} />
                            <Text style={styles.deliveryText}>7-day return policy</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <Button
                    title="Add to Cart"
                    onPress={handleAddToCart}
                    variant="outline"
                    style={styles.addToCartButton}
                />
                <Button
                    title="Buy Now"
                    onPress={handleBuyNow}
                    style={styles.buyNowButton}
                />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    imageContainer: {
        height: 250,
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    discountBadge: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        backgroundColor: colors.error,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    discountText: {
        ...typography.bodySmall,
        fontWeight: '700',
        color: colors.textOnPrimary,
    },
    content: {
        padding: spacing.md,
    },
    productName: {
        ...typography.h2,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
        marginLeft: 4,
    },
    reviewCount: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    stockBadge: {
        backgroundColor: colors.success + '20',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    stockText: {
        ...typography.caption,
        fontWeight: '600',
        color: colors.success,
    },
    outOfStock: {
        backgroundColor: colors.error + '20',
    },
    outOfStockText: {
        color: colors.error,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    price: {
        ...typography.h1,
        color: colors.primary,
        fontWeight: '700',
    },
    originalPrice: {
        ...typography.h3,
        color: colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    saveText: {
        ...typography.bodySmall,
        color: colors.success,
        fontWeight: '600',
    },
    offerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success + '15',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    offerContent: {
        flex: 1,
    },
    offerTitle: {
        ...typography.body,
        fontWeight: '600',
        color: colors.success,
    },
    offerDesc: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.md,
    },
    description: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    featureText: {
        ...typography.body,
        color: colors.text,
    },
    deliveryCard: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        gap: spacing.md,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    deliveryText: {
        ...typography.bodySmall,
        color: colors.text,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.md,
    },
    addToCartButton: {
        flex: 1,
    },
    buyNowButton: {
        flex: 1,
    },
});
