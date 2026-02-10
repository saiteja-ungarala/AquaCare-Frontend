import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { storeTheme, spacing, borderRadius } from '../../theme/theme';
import storeService, { StoreProduct, ProductQueryParams } from '../../services/storeService';
import { useCartStore } from '../../store/cartStore';

// Icon mapping
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
    'water-cans': 'water',
    'dispensers': 'cube',
    'filters': 'filter',
    'accessories': 'construct',
    'pumps': 'hardware-chip',
    'coolers': 'snow',
};

const getIconName = (slug: string): keyof typeof Ionicons.glyphMap => {
    return ICON_MAP[slug] || 'cube';
};

type SortOption = 'popular' | 'new' | 'price_asc' | 'price_desc';

export function ProductListingScreen({ route, navigation }: any) {
    const { category, categoryName, searchQuery: initialSearch, sort: initialSort } = route.params || {};

    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialSearch || '');
    const [currentSort, setCurrentSort] = useState<SortOption>(initialSort || 'popular');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);

    const { addProductToCart, fetchCart, totalItems } = useCartStore();

    const LIMIT = 10;

    useEffect(() => {
        loadProducts(true);
    }, [category, currentSort]);

    // Refresh cart on focus
    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [])
    );

    const loadProducts = async (reset: boolean = false) => {
        if (reset) {
            setIsLoading(true);
            setPage(1);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const params: ProductQueryParams = {
                sort: currentSort,
                page: reset ? 1 : page,
                limit: LIMIT,
            };
            if (category) params.category = category;
            if (searchQuery.trim()) params.q = searchQuery.trim();

            const result = await storeService.getProducts(params);

            if (reset) {
                setProducts(result.items);
            } else {
                setProducts(prev => [...prev, ...result.items]);
            }
            setTotal(result.total);
            setPage(result.page + 1);
        } catch (error: any) {
            console.error('[ProductListing] Error:', error);
            Alert.alert('Error', 'Failed to load products');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleSearch = () => {
        loadProducts(true);
    };

    const handleAddToCart = async (product: StoreProduct) => {
        setAddingToCart(product.id);
        try {
            await addProductToCart(product.id, 1);
            // Optional: show success feedback
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(null);
        }
    };

    const handleSortChange = (sort: SortOption) => {
        setCurrentSort(sort);
    };

    const handleLoadMore = () => {
        if (!isLoadingMore && products.length < total) {
            loadProducts(false);
        }
    };

    const renderProduct = ({ item }: { item: StoreProduct }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
        >
            <View style={styles.productImage}>
                <Ionicons name={getIconName(item.category?.slug || '')} size={50} color={storeTheme.primary} />
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                    {item.mrp > item.price && (
                        <Text style={styles.productMrp}>₹{item.mrp}</Text>
                    )}
                </View>
                {item.stockQty > 0 ? (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddToCart(item)}
                        disabled={addingToCart === item.id}
                    >
                        {addingToCart === item.id ? (
                            <ActivityIndicator size="small" color={storeTheme.textOnPrimary} />
                        ) : (
                            <Text style={styles.addButtonText}>Add to Cart</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.addButton, styles.outOfStock]}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const title = categoryName || (searchQuery ? `"${searchQuery}"` : 'Products');

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={storeTheme.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={storeTheme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Ionicons name="cart-outline" size={22} color={storeTheme.text} />
                    {totalItems > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Search */}
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

            {/* Filters */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={currentSort === 'popular' ? styles.filterChip : styles.filterChipOutline}
                    onPress={() => handleSortChange('popular')}
                >
                    <Text style={currentSort === 'popular' ? styles.filterChipText : styles.filterChipOutlineText}>Popular</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={currentSort === 'new' ? styles.filterChip : styles.filterChipOutline}
                    onPress={() => handleSortChange('new')}
                >
                    <Text style={currentSort === 'new' ? styles.filterChipText : styles.filterChipOutlineText}>New</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={currentSort === 'price_asc' ? styles.filterChip : styles.filterChipOutline}
                    onPress={() => handleSortChange('price_asc')}
                >
                    <Text style={currentSort === 'price_asc' ? styles.filterChipText : styles.filterChipOutlineText}>Price ↑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={currentSort === 'price_desc' ? styles.filterChip : styles.filterChipOutline}
                    onPress={() => handleSortChange('price_desc')}
                >
                    <Text style={currentSort === 'price_desc' ? styles.filterChipText : styles.filterChipOutlineText}>Price ↓</Text>
                </TouchableOpacity>
            </View>

            {products.length === 0 ? (
                <View style={[styles.container, styles.centered]}>
                    <Ionicons name="cube-outline" size={64} color={storeTheme.textSecondary} />
                    <Text style={styles.emptyText}>No products found</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isLoadingMore ? (
                        <ActivityIndicator size="small" color={storeTheme.primary} style={{ marginVertical: spacing.md }} />
                    ) : null}
                />
            )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: storeTheme.background,
        borderBottomWidth: 1,
        borderBottomColor: storeTheme.border,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: storeTheme.text,
        marginLeft: spacing.sm,
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: storeTheme.primary,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    badgeText: {
        color: storeTheme.textOnPrimary,
        fontSize: 9,
        fontWeight: '700',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: storeTheme.surfaceSecondary,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: 16,
        color: storeTheme.text,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: storeTheme.border,
    },
    filterChip: {
        backgroundColor: storeTheme.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
    },
    filterChipText: {
        color: storeTheme.textOnPrimary,
        fontSize: 13,
        fontWeight: '600',
    },
    filterChipOutline: {
        backgroundColor: 'transparent',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: storeTheme.border,
        marginRight: spacing.sm,
    },
    filterChipOutlineText: {
        color: storeTheme.text,
        fontSize: 13,
    },
    listContent: {
        padding: spacing.md,
    },
    productCard: {
        flex: 1,
        backgroundColor: storeTheme.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        margin: spacing.sm,
        borderWidth: 1,
        borderColor: storeTheme.border,
        maxWidth: '47%',
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
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 13,
        fontWeight: '600',
        color: storeTheme.text,
        marginBottom: spacing.xs,
        minHeight: 36,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
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
        marginLeft: spacing.xs,
    },
    addButton: {
        backgroundColor: storeTheme.primary,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        minHeight: 36,
        justifyContent: 'center',
    },
    addButtonText: {
        color: storeTheme.textOnPrimary,
        fontWeight: '600',
        fontSize: 13,
    },
    outOfStock: {
        backgroundColor: storeTheme.surfaceSecondary,
    },
    outOfStockText: {
        color: storeTheme.textSecondary,
        fontSize: 13,
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: 16,
        color: storeTheme.textSecondary,
    },
});
