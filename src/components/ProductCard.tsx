// ProductCard component for displaying products

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/theme';
import { Product } from '../models/types';

interface ProductCardProps {
    product: Product;
    onPress: () => void;
    onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onPress,
    onAddToCart,
}) => {
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

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {discount > 0 && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{discount}% OFF</Text>
                </View>
            )}

            <View style={styles.imageContainer}>
                <Ionicons name={getIcon()} size={48} color={colors.primary} />
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>

                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={styles.rating}>{product.rating}</Text>
                    <Text style={styles.reviewCount}>({product.reviewCount})</Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
                    {product.originalPrice && (
                        <Text style={styles.originalPrice}>
                            ₹{product.originalPrice.toLocaleString()}
                        </Text>
                    )}
                </View>

                {onAddToCart && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onAddToCart();
                        }}
                    >
                        <Ionicons name="add" size={20} color={colors.textOnPrimary} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.sm,
        marginBottom: spacing.md,
    },
    discountBadge: {
        position: 'absolute',
        top: spacing.sm,
        left: spacing.sm,
        backgroundColor: colors.error,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        zIndex: 1,
    },
    discountText: {
        ...typography.caption,
        fontWeight: '700',
        color: colors.textOnPrimary,
    },
    imageContainer: {
        height: 120,
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: spacing.md,
    },
    name: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    rating: {
        ...typography.caption,
        fontWeight: '600',
        color: colors.text,
        marginLeft: 4,
    },
    reviewCount: {
        ...typography.caption,
        color: colors.textSecondary,
        marginLeft: 2,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    price: {
        ...typography.body,
        fontWeight: '700',
        color: colors.primary,
    },
    originalPrice: {
        ...typography.caption,
        color: colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    addButton: {
        position: 'absolute',
        right: spacing.sm,
        bottom: spacing.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
