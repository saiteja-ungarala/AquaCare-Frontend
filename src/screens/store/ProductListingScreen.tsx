import React from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, spacing, storeTheme } from '../../theme/theme';
import storeService, { StoreProduct } from '../../services/storeService';
import { useCartStore } from '../../store/cartStore';
import { resolveProductImageSource } from '../../utils/productImage';

const showAddedToCartToast = (): void => {
    if (Platform.OS === 'android') {
        ToastAndroid.show('Added to cart', ToastAndroid.SHORT);
        return;
    }

    Alert.alert('Cart', 'Added to cart');
};

export function ProductListingScreen({ route, navigation }: any) {
    const { categoryId, brandId, categoryName, brandName } = route.params || {};
    const [products, setProducts] = React.useState<StoreProduct[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [appliedSearch, setAppliedSearch] = React.useState('');
    const [addingToCartId, setAddingToCartId] = React.useState<number | null>(null);
    const [failedImages, setFailedImages] = React.useState<Record<number, boolean>>({});
    const { addProductToCart, totalItems, fetchCart } = useCartStore();

    const loadProducts = React.useCallback(async () => {
        if (!categoryId || !brandId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await storeService.getProducts({
                category_id: Number(categoryId),
                brand_id: Number(brandId),
                search: appliedSearch.trim() || undefined,
                page: 1,
                limit: 100,
            });
            setProducts(response.items);
        } catch (err: any) {
            console.error('[StoreProductList] load failed:', err);
            setError(err?.message || 'Failed to load products');
        } finally {
            setIsLoading(false);
        }
    }, [categoryId, brandId, appliedSearch]);

    React.useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    useFocusEffect(
        React.useCallback(() => {
            fetchCart();
        }, [fetchCart])
    );

    const handleAddToCart = async (product: StoreProduct) => {
        setAddingToCartId(product.id);
        try {
            await addProductToCart(product.id, 1);
            showAddedToCartToast();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to add product to cart');
        } finally {
            setAddingToCartId(null);
        }
    };

    const renderProduct = ({ item }: { item: StoreProduct }) => {
        const productImage = item.image_url_full || item.imageUrlFull || item.image_url || item.imageUrl;
        const imageSource = resolveProductImageSource(productImage);
        const shouldShowImage = !!imageSource && !failedImages[item.id];
        const showMrp = item.mrp != null && item.mrp > item.price;
        const isOutOfStock = item.stockQty <= 0;

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            >
                <View style={styles.imageWrap}>
                    {shouldShowImage ? (
                        <Image
                            source={imageSource}
                            style={styles.productImage}
                            resizeMode="cover"
                            onError={() => setFailedImages(prev => ({ ...prev, [item.id]: true }))}
                        />
                    ) : (
                        <View style={styles.imageFallback}>
                            <Ionicons name="image-outline" size={22} color={storeTheme.textSecondary} />
                            <Text style={styles.imageFallbackText}>No image</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productBrand} numberOfLines={1}>{item.brand?.name || 'Brand'}</Text>

                <View style={styles.priceRow}>
                    <Text style={styles.priceText}>Rs {Number(item.price).toFixed(2)}</Text>
                    {showMrp ? (
                        <Text style={styles.mrpText}>Rs {Number(item.mrp).toFixed(2)}</Text>
                    ) : null}
                </View>

                {isOutOfStock ? (
                    <View style={[styles.addButton, styles.outOfStockButton]}>
                        <Text style={styles.outOfStockText}>Out of stock</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddToCart(item)}
                        disabled={addingToCartId === item.id}
                    >
                        {addingToCartId === item.id ? (
                            <ActivityIndicator size="small" color={storeTheme.textOnPrimary} />
                        ) : (
                            <Text style={styles.addButtonText}>Add to Cart</Text>
                        )}
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color={storeTheme.text} />
                </TouchableOpacity>
                <View style={styles.titleWrap}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{brandName || 'Products'}</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{categoryName || 'Category'}</Text>
                </View>
                <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
                    <Ionicons name="cart-outline" size={22} color={storeTheme.text} />
                    {totalItems > 0 ? (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
                        </View>
                    ) : null}
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color={storeTheme.textSecondary} />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search in this brand"
                    placeholderTextColor={storeTheme.textSecondary}
                    style={styles.searchInput}
                    returnKeyType="search"
                    onSubmitEditing={() => setAppliedSearch(search)}
                />
                {search ? (
                    <TouchableOpacity onPress={() => { setSearch(''); setAppliedSearch(''); }}>
                        <Ionicons name="close-circle" size={18} color={storeTheme.textSecondary} />
                    </TouchableOpacity>
                ) : null}
            </View>

            <View style={styles.searchActionRow}>
                <TouchableOpacity style={styles.searchButton} onPress={() => setAppliedSearch(search)}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={storeTheme.primary} />
                </View>
            ) : null}

            {!isLoading && error ? (
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={48} color={storeTheme.error || '#ef4444'} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {!isLoading && !error ? (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderProduct}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrap}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Ionicons name="cube-outline" size={52} color={storeTheme.textSecondary} />
                            <Text style={styles.emptyTitle}>No products found</Text>
                            <Text style={styles.emptySubtitle}>Try a different search term.</Text>
                        </View>
                    }
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: storeTheme.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: storeTheme.border,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleWrap: {
        flex: 1,
        marginHorizontal: spacing.sm,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: storeTheme.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: storeTheme.textSecondary,
        marginTop: 2,
    },
    cartButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 3,
        right: 3,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: storeTheme.primary,
        paddingHorizontal: 4,
    },
    badgeText: {
        color: storeTheme.textOnPrimary,
        fontSize: 9,
        fontWeight: '700',
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        backgroundColor: storeTheme.surfaceSecondary,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    searchInput: {
        flex: 1,
        marginHorizontal: spacing.sm,
        color: storeTheme.text,
        fontSize: 14,
    },
    searchActionRow: {
        alignItems: 'flex-end',
        paddingHorizontal: spacing.md,
        marginTop: spacing.sm,
    },
    searchButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: borderRadius.sm,
        backgroundColor: storeTheme.primary,
    },
    searchButtonText: {
        color: storeTheme.textOnPrimary,
        fontWeight: '600',
        fontSize: 12,
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    columnWrap: {
        justifyContent: 'space-between',
    },
    productCard: {
        width: '48%',
        backgroundColor: storeTheme.surface,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: storeTheme.border,
        marginBottom: spacing.md,
    },
    imageWrap: {
        width: '100%',
        height: 120,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
        backgroundColor: storeTheme.surfaceSecondary,
        marginBottom: spacing.sm,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    imageFallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageFallbackText: {
        marginTop: 4,
        fontSize: 11,
        color: storeTheme.textSecondary,
    },
    productName: {
        fontSize: 13,
        fontWeight: '600',
        color: storeTheme.text,
        minHeight: 34,
    },
    productBrand: {
        marginTop: 2,
        fontSize: 11,
        color: storeTheme.textSecondary,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '700',
        color: storeTheme.primary,
    },
    mrpText: {
        marginLeft: spacing.xs,
        fontSize: 11,
        color: storeTheme.textSecondary,
        textDecorationLine: 'line-through',
    },
    addButton: {
        marginTop: spacing.sm,
        minHeight: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.sm,
        backgroundColor: storeTheme.primary,
    },
    addButtonText: {
        color: storeTheme.textOnPrimary,
        fontSize: 12,
        fontWeight: '700',
    },
    outOfStockButton: {
        backgroundColor: storeTheme.surfaceSecondary,
    },
    outOfStockText: {
        color: storeTheme.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    emptyTitle: {
        marginTop: spacing.sm,
        fontSize: 16,
        fontWeight: '700',
        color: storeTheme.text,
    },
    emptySubtitle: {
        marginTop: spacing.xs,
        fontSize: 13,
        color: storeTheme.textSecondary,
    },
    errorText: {
        marginTop: spacing.sm,
        textAlign: 'center',
        fontSize: 15,
        color: storeTheme.error || '#ef4444',
    },
    retryButton: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        backgroundColor: storeTheme.primary,
    },
    retryText: {
        color: storeTheme.textOnPrimary,
        fontWeight: '700',
    },
});

