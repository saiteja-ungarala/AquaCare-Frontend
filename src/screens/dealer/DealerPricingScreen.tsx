import React, { useCallback, useMemo, useState } from 'react';
import {
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/types';
import { dealerTheme } from '../../theme/dealerTheme';
import { useDealerStore } from '../../store';

const formatRupees = (value: number): string => `Rs ${Math.round(value || 0).toLocaleString('en-IN')}`;

const routeByStatus = (status: string, navigation: NativeStackNavigationProp<RootStackParamList>) => {
    if (status === 'approved') return;
    if (status === 'pending') {
        navigation.reset({ index: 0, routes: [{ name: 'DealerKycPending' }] });
        return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'DealerKycUpload' }] });
};

export const DealerPricingScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const {
        pricingProducts,
        loadingPricing,
        error,
        fetchPricingProducts,
        fetchMe,
    } = useDealerStore();
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const ensurePricingAccess = useCallback(async () => {
        const ok = await fetchPricingProducts();
        const pricingErrorStatus = useDealerStore.getState().pricingErrorStatus;
        if (!ok && pricingErrorStatus === 403) {
            const me = await fetchMe();
            if (me) {
                routeByStatus(String(me.verification_status || 'unverified'), navigation);
            }
        }
    }, [fetchPricingProducts, fetchMe, navigation]);

    useFocusEffect(
        useCallback(() => {
            ensurePricingAccess();
        }, [ensurePricingAccess])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await ensurePricingAccess();
        setRefreshing(false);
    }, [ensurePricingAccess]);

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return pricingProducts;
        return pricingProducts.filter((p) => p.name.toLowerCase().includes(query));
    }, [pricingProducts, search]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Dealer Pricing</Text>
                <Text style={styles.headerSubtitle}>Approved dealer-only product rates</Text>
            </View>

            <View style={styles.searchWrap}>
                <Ionicons name="search-outline" size={18} color={dealerTheme.colors.textSecondary} />
                <TextInput
                    placeholder="Search by product name"
                    placeholderTextColor={dealerTheme.colors.textSecondary}
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing || loadingPricing} onRefresh={onRefresh} />}
            >
                {error && !loadingPricing ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {filteredProducts.map((product) => (
                    <View key={String(product.product_id)} style={styles.card}>
                        <View style={styles.cardTop}>
                            <View style={styles.thumbWrap}>
                                {product.image_url ? (
                                    <Image source={{ uri: product.image_url }} style={styles.thumbImage} />
                                ) : (
                                    <Ionicons name="cube-outline" size={22} color={dealerTheme.colors.dealerPrimary} />
                                )}
                            </View>
                            <View style={styles.meta}>
                                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                                <View style={styles.marginBadge}>
                                    <Text style={styles.marginBadgeText}>{product.margin_display}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.priceRow}>
                            <View>
                                <Text style={styles.label}>MRP</Text>
                                <Text style={styles.value}>{formatRupees(product.mrp_price)}</Text>
                            </View>
                            <View>
                                <Text style={styles.label}>Dealer Price</Text>
                                <Text style={styles.valueStrong}>{formatRupees(product.dealer_price)}</Text>
                            </View>
                            <View>
                                <Text style={styles.label}>Earning / Sale</Text>
                                <Text style={styles.valueEarn}>
                                    {product.earning_preview !== null ? formatRupees(product.earning_preview) : '-'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}

                {!loadingPricing && filteredProducts.length === 0 ? (
                    <View style={styles.emptyWrap}>
                        <Ionicons name="pricetag-outline" size={56} color={dealerTheme.colors.dealerMuted} />
                        <Text style={styles.emptyText}>No pricing products found</Text>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: dealerTheme.colors.dealerSurfaceAlt,
    },
    header: {
        paddingHorizontal: dealerTheme.spacing.md,
        paddingTop: dealerTheme.spacing.md,
        paddingBottom: dealerTheme.spacing.sm,
    },
    headerTitle: {
        ...dealerTheme.typography.h1,
        color: dealerTheme.colors.textPrimary,
    },
    headerSubtitle: {
        ...dealerTheme.typography.bodySmall,
        color: dealerTheme.colors.textSecondary,
        marginTop: 2,
    },
    searchWrap: {
        marginHorizontal: dealerTheme.spacing.md,
        marginBottom: dealerTheme.spacing.sm,
        backgroundColor: dealerTheme.colors.dealerSurface,
        borderRadius: dealerTheme.radius.md,
        borderWidth: 1,
        borderColor: dealerTheme.colors.border,
        paddingHorizontal: dealerTheme.spacing.sm,
        paddingVertical: dealerTheme.spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: dealerTheme.colors.textPrimary,
        ...dealerTheme.typography.bodySmall,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: dealerTheme.spacing.md,
        gap: dealerTheme.spacing.sm,
    },
    errorBox: {
        padding: dealerTheme.spacing.sm,
        borderRadius: dealerTheme.radius.md,
        backgroundColor: '#FDECEC',
        borderWidth: 1,
        borderColor: '#F4C3C3',
    },
    errorText: {
        ...dealerTheme.typography.caption,
        color: dealerTheme.colors.danger,
    },
    card: {
        backgroundColor: dealerTheme.colors.dealerSurface,
        borderRadius: dealerTheme.radius.lg,
        borderWidth: 1,
        borderColor: dealerTheme.colors.border,
        padding: dealerTheme.spacing.md,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbWrap: {
        width: 46,
        height: 46,
        borderRadius: dealerTheme.radius.md,
        backgroundColor: '#EDF5FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: dealerTheme.spacing.sm,
        overflow: 'hidden',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    meta: {
        flex: 1,
    },
    productName: {
        ...dealerTheme.typography.body,
        color: dealerTheme.colors.textPrimary,
    },
    marginBadge: {
        alignSelf: 'flex-start',
        marginTop: dealerTheme.spacing.xs,
        backgroundColor: '#E7F3EC',
        borderRadius: dealerTheme.radius.full,
        paddingHorizontal: dealerTheme.spacing.sm,
        paddingVertical: 3,
    },
    marginBadgeText: {
        ...dealerTheme.typography.caption,
        color: dealerTheme.colors.success,
    },
    priceRow: {
        marginTop: dealerTheme.spacing.md,
        paddingTop: dealerTheme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: dealerTheme.colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        ...dealerTheme.typography.caption,
        color: dealerTheme.colors.textSecondary,
    },
    value: {
        ...dealerTheme.typography.bodySmall,
        color: dealerTheme.colors.textPrimary,
    },
    valueStrong: {
        ...dealerTheme.typography.bodySmall,
        color: dealerTheme.colors.dealerPrimary,
        fontWeight: '700',
    },
    valueEarn: {
        ...dealerTheme.typography.bodySmall,
        color: dealerTheme.colors.success,
        fontWeight: '700',
    },
    emptyWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: dealerTheme.spacing.xxl,
    },
    emptyText: {
        marginTop: dealerTheme.spacing.sm,
        ...dealerTheme.typography.bodySmall,
        color: dealerTheme.colors.textSecondary,
    },
});

