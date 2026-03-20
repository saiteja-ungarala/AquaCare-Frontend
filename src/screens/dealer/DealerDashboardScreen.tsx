// Dealer Dashboard Screen

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { useAuthStore } from '../../store';
import { dealerService, DealerOrder, DealerCommission } from '../../services/dealerService';
import { DealerScreen } from '../../components/dealer/DealerScreen';

type DealerDashboardScreenProps = { navigation: NativeStackNavigationProp<any> };

const ACTIVE_BUCKETS = new Set(['active']);

export const DealerDashboardScreen: React.FC<DealerDashboardScreenProps> = ({ navigation }) => {
    const { user, logout } = useAuthStore();
    const [orders, setOrders] = useState<DealerOrder[]>([]);
    const [commissions, setCommissions] = useState<DealerCommission[]>([]);
    const [totalCommission, setTotalCommission] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [ordersResult, commissionsResult] = await Promise.all([
                dealerService.getOrders(),
                dealerService.getCommissions(),
            ]);
            setOrders(ordersResult.orders);
            setCommissions(commissionsResult.commissions);
            setTotalCommission(commissionsResult.total_amount);
        } catch (err: any) {
            setError(dealerService.getApiErrorMessage(err, 'Failed to load dashboard data'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('Are you sure you want to logout?');
            if (confirmed) {
                logout();
            }
        } else {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
            ]);
        }
    };

    const pendingOrders = orders.filter(o => o.status_bucket === 'active').length;
    const referralCount = commissions.filter(c => c.type === 'service_referral').length;

    if (loading) {
        return (
            <DealerScreen>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </DealerScreen>
        );
    }

    if (error) {
        return (
            <DealerScreen>
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </DealerScreen>
        );
    }

    return (
        <DealerScreen>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View><Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Dealer'}!</Text><Text style={styles.subGreeting}>Dealer Dashboard</Text></View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.notifButton}><Ionicons name="notifications-outline" size={24} color={colors.textOnPrimary} /></TouchableOpacity>
                            <TouchableOpacity onPress={handleLogout} style={styles.notifButton}>
                                <Ionicons name="log-out-outline" size={24} color={colors.textOnPrimary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Ionicons name="cart" size={28} color={colors.primary} />
                        <Text style={styles.statValue}>{orders.length}</Text>
                        <Text style={styles.statLabel}>Total Orders</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="time" size={28} color={colors.warning} />
                        <Text style={styles.statValue}>{pendingOrders}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="cash" size={28} color={colors.success} />
                        <Text style={styles.statValue}>₹{totalCommission.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Commission</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="people" size={28} color={colors.accent} />
                        <Text style={styles.statValue}>{referralCount}</Text>
                        <Text style={styles.statLabel}>Referrals</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Orders</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ProductOrders')}><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
                    </View>
                    {orders.slice(0, 3).map((order) => (
                        <View key={order.id} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderId}>#{order.id}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: order.status_bucket === 'delivered' ? colors.success + '20' : colors.warning + '20' }]}>
                                    <Text style={[styles.statusText, { color: order.status_bucket === 'delivered' ? colors.success : colors.warning }]}>{order.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.orderItems}>{order.item_count} item(s)</Text>
                            <View style={styles.orderFooter}>
                                <Text style={styles.orderAmount}>₹{order.total_amount.toLocaleString()}</Text>
                                <Text style={styles.orderDate}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</Text>
                            </View>
                        </View>
                    ))}

                    <View style={styles.menuSection}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Commission')}>
                            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
                            <Text style={styles.menuText}>Commission & Earnings</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="cube-outline" size={24} color={colors.primary} />
                            <Text style={styles.menuText}>Inventory</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="map-outline" size={24} color={colors.primary} />
                            <Text style={styles.menuText}>Service Area</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </DealerScreen>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    errorText: { ...typography.body, color: colors.error, textAlign: 'center', marginBottom: spacing.md },
    retryButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.primary, borderRadius: borderRadius.md },
    retryButtonText: { ...typography.body, color: colors.textOnPrimary, fontWeight: '600' },
    header: { paddingTop: spacing.lg, paddingBottom: spacing.xl, paddingHorizontal: spacing.md, backgroundColor: colors.primary },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerActions: { flexDirection: 'row', gap: spacing.sm },
    greeting: { ...typography.h2, color: colors.textOnPrimary },
    subGreeting: { ...typography.body, color: colors.textOnPrimary },
    notifButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, marginTop: -spacing.lg },
    statCard: { width: '48%', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm, marginRight: '2%', ...shadows.sm },
    statValue: { ...typography.h2, color: colors.text, fontWeight: '700', marginTop: spacing.sm },
    statLabel: { ...typography.caption, color: colors.textSecondary },
    content: { padding: spacing.md },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    sectionTitle: { ...typography.h2, fontSize: 18, color: colors.text },
    viewAll: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
    orderCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderId: { ...typography.body, fontWeight: '600', color: colors.text },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
    statusText: { ...typography.caption, fontWeight: '600' },
    orderItems: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
    orderAmount: { ...typography.body, fontWeight: '700', color: colors.primary },
    orderDate: { ...typography.caption, color: colors.textSecondary },
    menuSection: { marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, ...shadows.sm },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    menuText: { ...typography.body, color: colors.text, flex: 1, marginLeft: spacing.md },
});
