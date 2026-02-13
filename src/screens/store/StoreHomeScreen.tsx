import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { storeTheme, spacing, borderRadius } from '../../theme/theme';
import storeService, { StoreCategory, StoreProduct } from '../../services/storeService';
import { useCartStore } from '../../store/cartStore';

// Icon mapping from backend iconKey to Ionicons
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
    water_drop: 'water',
    droplet: 'water',
    box: 'cube',
    filter: 'filter',
    tools: 'construct',
    pump: 'hardware-chip',
    snow: 'snow',
};

const getIconName = (iconKey: string): keyof typeof Ionicons.glyphMap => {
    return ICON_MAP[iconKey] || 'cube';
};

export function StoreHomeScreen({ navigation }: any) {
    const [categories, setCategories] = useState<StoreCategory[]>([]);
    const [newArrivals, setNewArrivals] = useState<StoreProduct[]>([]);
    const [popularProducts, setPopularProducts] = useState<StoreProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { totalItems, fetchCart } = useCartStore();

    // Fetch data on mount
    useEffect(() => {
        loadStoreData();
    }, []);

    // Refresh cart on screen focus for badge update
    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [])
    );

    const loadStoreData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [cats, newProds, popularProds] = await Promise.all([
                storeService.getCategories(),
                storeService.getProducts({ sort: 'new', limit: 4 }),
                storeService.getProducts({ sort: 'popular', limit: 4 }),
            ]);
            setCategories(cats);
            setNewArrivals(newProds.items);
            setPopularProducts(popularProds.items);
        } catch (err: any) {
            console.error('[StoreHome] Error loading data:', err);
            setError(err.message || 'Failed to load store data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigation.navigate('ProductListing', { searchQuery: searchQuery.trim() });
        }
    };

    const handleCategoryPress = (category: StoreCategory) => {
        navigation.navigate('ProductListing', { category: category.slug, categoryName: category.name });
    };

    const handleProductPress = (product: StoreProduct) => {
        navigation.navigate('ProductDetails', { productId: product.id });
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={storeTheme.primary} />
                <Text style={styles.loadingText}>Loading store...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Ionicons name="alert-circle" size={48} color={storeTheme.error || '#ff6b6b'} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadStoreData}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>

                <Text style={styles.headerTitle}>Store</Text>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Ionicons name="cart-outline" size={24} color={storeTheme.text} />
                    {totalItems > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={storeTheme.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        placeholderTextColor={storeTheme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <View style={styles.categoriesGrid}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={styles.categoryItem}
                                onPress={() => handleCategoryPress(category)}
                            >
                                <View style={styles.categoryIcon}>
                                    <Ionicons name={getIconName(category.iconKey)} size={28} color={storeTheme.primary} />
                                </View>
                                <Text style={styles.categoryName}>{category.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Featured Banner */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.banner} onPress={() => navigation.navigate('ProductListing', { sort: 'new' })}>
                        <View style={styles.bannerContent}>
                            <Text style={styles.bannerTitle}>New Arrivals</Text>
                            <Text style={styles.bannerSubtitle}>Premium Water Products</Text>
                            <View style={styles.bannerButton}>
                                <Text style={styles.bannerButtonText}>Shop Now</Text>
                            </View>
                        </View>
                        <View style={styles.bannerImage}>
                            <Ionicons name="water" size={60} color={storeTheme.primary} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* New Arrivals */}
                {newArrivals.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>New Arrivals</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('ProductListing', { sort: 'new' })}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                            {newArrivals.map((product) => (
                                <TouchableOpacity
                                    key={product.id}
                                    style={styles.productCard}
                                    onPress={() => handleProductPress(product)}
                                >
                                    <View style={styles.productImage}>
                                        <Ionicons name={getIconName(product.category?.slug || '')} size={40} color={storeTheme.primary} />
                                    </View>
                                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                                    <Text style={styles.productPrice}>₹{product.price}</Text>
                                    {product.mrp > product.price && (
                                        <Text style={styles.productMrp}>₹{product.mrp}</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Popular Products */}
                {popularProducts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Popular Products</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('ProductListing', { sort: 'popular' })}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                            {popularProducts.map((product) => (
                                <TouchableOpacity
                                    key={product.id}
                                    style={styles.productCard}
                                    onPress={() => handleProductPress(product)}
                                >
                                    <View style={styles.productImage}>
                                        <Ionicons name={getIconName(product.category?.slug || '')} size={40} color={storeTheme.primary} />
                                    </View>
                                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                                    <Text style={styles.productPrice}>₹{product.price}</Text>
                                    {product.mrp > product.price && (
                                        <Text style={styles.productMrp}>₹{product.mrp}</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Special Offer */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.offerBanner}>
                        <Ionicons name="pricetag" size={24} color={storeTheme.primary} />
                        <View style={styles.offerContent}>
                            <Text style={styles.offerTitle}>Special Offer</Text>
                            <Text style={styles.offerSubtitle}>Get 20% off on first order</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={storeTheme.textSecondary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: storeTheme.background,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 16,
        color: storeTheme.textSecondary,
    },
    errorText: {
        marginTop: spacing.md,
        fontSize: 16,
        color: storeTheme.error || '#ff6b6b',
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
    },
    retryButton: {
        marginTop: spacing.md,
        backgroundColor: storeTheme.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    retryButtonText: {
        color: storeTheme.textOnPrimary,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: storeTheme.background,
        borderBottomWidth: 1,
        borderBottomColor: storeTheme.border,
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: storeTheme.text,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: storeTheme.primary,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: storeTheme.textOnPrimary,
        fontSize: 10,
        fontWeight: '700',
    },
    scrollView: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: storeTheme.surfaceSecondary,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 4,
        margin: spacing.md,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: 16,
        color: storeTheme.text,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: storeTheme.text,
        paddingHorizontal: spacing.md,
    },
    seeAllText: {
        fontSize: 14,
        color: storeTheme.primary,
        fontWeight: '600',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.md,
        marginTop: spacing.md,
    },
    categoryItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: spacing.md,
        marginRight: '3.33%',
    },
    categoryIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: storeTheme.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    categoryName: {
        fontSize: 12,
        color: storeTheme.text,
        textAlign: 'center',
        fontWeight: '500',
    },
    banner: {
        flexDirection: 'row',
        backgroundColor: storeTheme.surfaceSecondary,
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.md,
        padding: spacing.lg,
        overflow: 'hidden',
    },
    bannerContent: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: storeTheme.text,
        marginBottom: spacing.xs,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: storeTheme.textSecondary,
        marginBottom: spacing.md,
    },
    bannerButton: {
        backgroundColor: storeTheme.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
    },
    bannerButtonText: {
        color: storeTheme.textOnPrimary,
        fontWeight: '600',
        fontSize: 14,
    },
    bannerImage: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productsScroll: {
        paddingLeft: spacing.md,
    },
    productCard: {
        width: 140,
        backgroundColor: storeTheme.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginRight: spacing.md,
        borderWidth: 1,
        borderColor: storeTheme.border,
    },
    productImage: {
        width: '100%',
        height: 100,
        backgroundColor: storeTheme.surfaceSecondary,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: storeTheme.text,
        marginBottom: spacing.xs,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: storeTheme.primary,
    },
    productMrp: {
        fontSize: 12,
        color: storeTheme.textSecondary,
        textDecorationLine: 'line-through',
    },
    offerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: storeTheme.surfaceSecondary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginHorizontal: spacing.md,
    },
    offerContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: storeTheme.text,
    },
    offerSubtitle: {
        fontSize: 13,
        color: storeTheme.textSecondary,
        marginTop: spacing.xs / 2,
    },
});
