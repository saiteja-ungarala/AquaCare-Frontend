import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, spacing, storeTheme } from '../../theme/theme';
import storeService, { StoreBrand } from '../../services/storeService';
import { useCartStore } from '../../store/cartStore';

const toInitials = (name: string): string => {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0]?.toUpperCase() || '')
        .join('');
};

export function StoreBrandsScreen({ route, navigation }: any) {
    const { categoryId, categoryName } = route.params || {};
    const [brands, setBrands] = React.useState<StoreBrand[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [failedLogos, setFailedLogos] = React.useState<Record<number, boolean>>({});
    const { totalItems, fetchCart } = useCartStore();

    const loadBrands = React.useCallback(async () => {
        if (!categoryId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await storeService.getBrandsByCategory(Number(categoryId));
            setBrands(response);
        } catch (err: any) {
            console.error('[StoreBrands] load failed:', err);
            setError(err?.message || 'Failed to load brands');
        } finally {
            setIsLoading(false);
        }
    }, [categoryId]);

    React.useEffect(() => {
        loadBrands();
    }, [loadBrands]);

    useFocusEffect(
        React.useCallback(() => {
            fetchCart();
        }, [fetchCart])
    );

    const renderBrand = ({ item }: { item: StoreBrand }) => {
        const logoUrl = item.logo_url || item.logoUrl;
        const hasLogo = !!logoUrl && !failedLogos[item.id];

        return (
            <TouchableOpacity
                style={styles.brandCard}
                onPress={() => navigation.navigate('ProductListing', {
                    categoryId: Number(categoryId),
                    brandId: item.id,
                    categoryName: categoryName || 'Category',
                    brandName: item.name,
                })}
            >
                <View style={styles.logoWrap}>
                    {hasLogo ? (
                        <Image
                            source={{ uri: logoUrl as string }}
                            style={styles.logo}
                            resizeMode="contain"
                            onError={() => setFailedLogos(prev => ({ ...prev, [item.id]: true }))}
                        />
                    ) : (
                        <Text style={styles.logoFallback}>{toInitials(item.name) || 'BR'}</Text>
                    )}
                </View>
                <Text style={styles.brandName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={storeTheme.textSecondary} />
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
                    <Text style={styles.headerTitle} numberOfLines={1}>{categoryName || 'Brands'}</Text>
                    <Text style={styles.headerSubtitle}>Select a brand</Text>
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

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={storeTheme.primary} />
                </View>
            ) : null}

            {!isLoading && error ? (
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={48} color={storeTheme.error || '#ef4444'} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadBrands}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {!isLoading && !error ? (
                <FlatList
                    data={brands}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderBrand}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Ionicons name="ribbon-outline" size={48} color={storeTheme.textSecondary} />
                            <Text style={styles.emptyText}>No brands available in this category.</Text>
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
    listContent: {
        padding: spacing.md,
    },
    brandCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: storeTheme.surface,
        borderWidth: 1,
        borderColor: storeTheme.border,
    },
    logoWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: storeTheme.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    logoFallback: {
        fontSize: 13,
        fontWeight: '700',
        color: storeTheme.primary,
    },
    brandName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: storeTheme.text,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
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
    emptyText: {
        marginTop: spacing.sm,
        color: storeTheme.textSecondary,
        fontSize: 15,
        textAlign: 'center',
    },
});

