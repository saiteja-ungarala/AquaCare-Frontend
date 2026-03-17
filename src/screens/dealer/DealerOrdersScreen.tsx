// Dealer Orders Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dealerService, DealerOrder } from '../../services/dealerService';
import { dealerTheme } from '../../theme/dealerTheme';

const { colors, spacing, radius, typography, shadows } = dealerTheme;

const STATUS_BUCKET_STYLE: Record<string, { bg: string; fg: string }> = {
    active:    { bg: colors.warning + '20', fg: colors.warning },
    delivered: { bg: colors.success + '20', fg: colors.success },
    cancelled: { bg: colors.danger  + '20', fg: colors.danger  },
};

const capitalize = (s: string) =>
    s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (iso: string): string => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return iso;
    }
};

function OrderCard({ order }: { order: DealerOrder }) {
    const bucket = order.status_bucket || 'active';
    const badgeStyle = STATUS_BUCKET_STYLE[bucket] ?? STATUS_BUCKET_STYLE.active;

    return (
        <View style={styles.card}>
            <View style={styles.cardRow}>
                <View style={styles.cardLeft}>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                    <Text style={styles.orderItems}>
                        {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                    </Text>
                </View>
                <View style={styles.cardRight}>
                    <Text style={styles.orderAmount}>
                        ₹{order.total_amount.toLocaleString('en-IN')}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                        <Text style={[styles.statusText, { color: badgeStyle.fg }]}>
                            {capitalize(order.status)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export const DealerOrdersScreen: React.FC = () => {
    const [orders, setOrders]       = useState<DealerOrder[]>([]);
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError]         = useState<string | null>(null);

    const loadOrders = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);
            const result = await dealerService.getOrders();
            setOrders(result.orders);
        } catch (err: any) {
            setError(dealerService.getApiErrorMessage(err, 'Failed to load orders'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.dealerPrimary} />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadOrders()}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <FlatList
                data={orders}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => <OrderCard order={item} />}
                contentContainerStyle={[
                    styles.listContent,
                    orders.length === 0 && styles.listContentEmpty,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadOrders(true)}
                        colors={[colors.dealerPrimary]}
                        tintColor={colors.dealerPrimary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Ionicons name="receipt-outline" size={56} color={colors.dealerMuted} />
                        <Text style={styles.emptyTitle}>No orders yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Your product orders will appear here once customers place them.
                        </Text>
                    </View>
                }
            />
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
                {!loading && !error && orders.length > 0 && (
                    <View style={styles.orderCountBadge}>
                        <Text style={styles.orderCountText}>{orders.length}</Text>
                    </View>
                )}
            </View>
            {renderContent()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dealerSurfaceAlt,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        backgroundColor: colors.dealerSurface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...shadows.bar,
    },
    headerTitle: {
        ...typography.h1,
        color: colors.textPrimary,
        flex: 1,
    },
    orderCountBadge: {
        backgroundColor: colors.dealerPrimary + '18',
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.full,
    },
    orderCountText: {
        ...typography.caption,
        color: colors.dealerPrimary,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xxl,
    },
    errorText: {
        ...typography.body,
        color: colors.danger,
        textAlign: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.lg,
    },
    retryButton: {
        backgroundColor: colors.dealerPrimary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
    },
    retryButtonText: {
        ...typography.button,
        color: colors.textOnPrimary,
    },
    emptyTitle: {
        ...typography.h2,
        color: colors.textPrimary,
        marginTop: spacing.md,
    },
    emptySubtitle: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    listContent: {
        padding: spacing.lg,
        gap: spacing.sm,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    card: {
        backgroundColor: colors.dealerSurface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        ...shadows.card,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardLeft: {
        flex: 1,
        marginRight: spacing.md,
    },
    orderId: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    orderDate: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    orderItems: {
        ...typography.caption,
        color: colors.dealerMuted,
        marginTop: spacing.xs,
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    orderAmount: {
        ...typography.h2,
        color: colors.dealerPrimary,
    },
    statusBadge: {
        marginTop: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: radius.full,
    },
    statusText: {
        ...typography.caption,
    },
});
