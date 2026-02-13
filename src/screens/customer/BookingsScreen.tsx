// Bookings Screen — API-driven with cancel support

import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { useBookingsStore } from '../../store';
import { Booking } from '../../models/types';

type BookingsScreenProps = {
    navigation: NativeStackNavigationProp<any>;
    route: RouteProp<any, any>;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return colors.success;
        case 'cancelled': return colors.error;
        case 'in_progress': case 'assigned': return colors.warning;
        default: return colors.primary;
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'pending': return 'Pending';
        case 'confirmed': return 'Confirmed';
        case 'assigned': return 'Assigned';
        case 'in_progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        default: return status;
    }
};

export const BookingsScreen: React.FC<BookingsScreenProps> = ({ navigation, route }) => {
    const { bookings, isLoading, fetchBookings, cancelBooking } = useBookingsStore();
    const [activeTab, setActiveTab] = React.useState<'active' | 'completed' | 'cancelled'>('active');
    const [refreshing, setRefreshing] = React.useState(false);

    const [cancelModalVisible, setCancelModalVisible] = React.useState(false);
    const [bookingToCancel, setBookingToCancel] = React.useState<Booking | null>(null);
    const [cancelSuccess, setCancelSuccess] = React.useState(false);

    const loadBookings = useCallback(() => {
        fetchBookings(activeTab);
    }, [activeTab, fetchBookings]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchBookings(activeTab);
        setRefreshing(false);
    }, [activeTab, fetchBookings]);

    const handleCancel = (booking: Booking) => {
        setBookingToCancel(booking);
        setCancelModalVisible(true);
    };

    const confirmCancel = async () => {
        if (!bookingToCancel) return;

        try {
            await cancelBooking(bookingToCancel.id);
            setCancelModalVisible(false);
            setCancelSuccess(true);

            // Refresh waiting for the animation
            setTimeout(() => {
                setCancelSuccess(false);
                setBookingToCancel(null);
                // Optionally switch to cancelled tab or just refresh current
                fetchBookings(activeTab);
            }, 2000);
        } catch (e: any) {
            setCancelModalVisible(false);
            // Fallback to simple alert for error if modal fails, or could use error state
            console.error(e);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        // Convert HH:MM:SS or HH:MM to 12h format
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    };

    const renderBookingCard = (booking: Booking) => {
        const canCancel = activeTab === 'active' && (booking.status === 'pending' || booking.status === 'confirmed');
        return (
            <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                    <Text style={styles.bookingId}>#{booking.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>{getStatusLabel(booking.status)}</Text>
                    </View>
                </View>

                <Text style={styles.serviceName}>{booking.service?.name || 'Service'}</Text>

                <View style={styles.bookingRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.bookingInfo}>{formatDate(booking.scheduledDate)} at {formatTime(booking.scheduledTime)}</Text>
                </View>

                {booking.address?.city ? (
                    <View style={styles.bookingRow}>
                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.bookingInfo}>{booking.address.line1}, {booking.address.city}</Text>
                    </View>
                ) : null}

                <View style={styles.bookingFooter}>
                    <Text style={styles.bookingPrice}>₹{booking.totalAmount}</Text>
                    {canCancel && (
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(booking)}>
                            <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {route.params?.enableBack && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>My Bookings</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {(['active', 'completed', 'cancelled'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : bookings.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={80} color={colors.textLight} />
                    <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
                    <Text style={styles.emptyDesc}>
                        {activeTab === 'active' ? 'Book a service to get started' : `No ${activeTab} bookings yet`}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                >
                    {bookings.map(renderBookingCard)}
                </ScrollView>
            )}

            {/* Cancel Confirmation Modal */}
            <Modal
                transparent
                visible={cancelModalVisible}
                animationType="fade"
                onRequestClose={() => setCancelModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModal}>
                        <Ionicons name="alert-circle" size={48} color={colors.error} />
                        <Text style={styles.confirmTitle}>Cancel Booking?</Text>
                        <Text style={styles.confirmDesc}>
                            Are you sure you want to cancel "{bookingToCancel?.service?.name}"?
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setCancelModalVisible(false)}
                            >
                                <Text style={styles.modalBtnTextCancel}>Keep it</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnConfirm]}
                                onPress={confirmCancel}
                            >
                                <Text style={styles.modalBtnTextConfirm}>Yes, Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Overlay */}
            {cancelSuccess && (
                <View style={styles.successOverlay}>
                    <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                    <Text style={styles.successTitle}>Cancelled</Text>
                    <Text style={styles.successDesc}>Booking has been cancelled successfully.</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, ...shadows.sm },
    backButton: { marginRight: spacing.md },
    headerTitle: { ...typography.h3, color: colors.text },
    tabContainer: { flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.surface, marginBottom: 1 },
    tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: colors.primary },
    tabText: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
    activeTabText: { color: colors.primary },
    scrollView: { flex: 1, padding: spacing.md },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    bookingCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    bookingId: { ...typography.caption, color: colors.textSecondary },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
    statusText: { ...typography.caption, fontWeight: '600' },
    serviceName: { ...typography.body, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
    bookingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 },
    bookingInfo: { ...typography.bodySmall, color: colors.textSecondary },
    bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
    bookingPrice: { ...typography.body, fontWeight: '700', color: colors.primary },
    cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cancelText: { ...typography.bodySmall, color: colors.error, fontWeight: '600' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    emptyTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg },
    emptyDesc: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
    confirmModal: { backgroundColor: colors.surface, width: '100%', maxWidth: 320, borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', ...shadows.md },
    confirmTitle: { ...typography.h3, color: colors.text, marginTop: spacing.md, textAlign: 'center' },
    confirmDesc: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center', marginBottom: spacing.xl },
    modalActions: { flexDirection: 'row', gap: spacing.md, width: '100%' },
    modalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
    modalBtnCancel: { backgroundColor: colors.surfaceSecondary },
    modalBtnConfirm: { backgroundColor: colors.error },
    modalBtnTextCancel: { ...typography.body, fontWeight: '600', color: colors.text },
    modalBtnTextConfirm: { ...typography.body, fontWeight: '600', color: colors.textOnPrimary },
    // Success Overlay
    successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', zIndex: 10, padding: spacing.xl },
    successTitle: { ...typography.h2, color: colors.success, marginTop: spacing.md, textAlign: 'center' },
    successDesc: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
});

