// Bookings Screen

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { useBookingsStore } from '../../store';
import { BookingStatus } from '../../models/types';

type BookingsScreenProps = { navigation: NativeStackNavigationProp<any> };

const getStatusColor = (status: BookingStatus) => {
    switch (status) {
        case 'completed': return colors.success;
        case 'cancelled': return colors.error;
        case 'in_progress': case 'on_the_way': return colors.warning;
        default: return colors.primary;
    }
};

const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
        case 'pending': return 'Pending';
        case 'confirmed': return 'Confirmed';
        case 'agent_assigned': return 'Agent Assigned';
        case 'on_the_way': return 'On the Way';
        case 'in_progress': return 'In Progress';
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        default: return status;
    }
};

const renderTimeline = (status: BookingStatus) => {
    if (status === 'cancelled') return null;

    const steps = ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed'];
    const currentStepIndex = steps.indexOf(status);
    const normalizedIndex = status === 'agent_assigned' ? 1 : currentStepIndex;

    return (
        <View style={styles.timelineContainer}>
            {['Booked', 'Confirmed', 'On Way', 'Progress', 'Done'].map((step, index) => {
                const isActive = index <= normalizedIndex && normalizedIndex !== -1;
                return (
                    <View key={step} style={styles.timelineStep}>
                        <View style={[styles.timelineDot, isActive && styles.timelineDotActive]} />
                        {index < 4 && <View style={[styles.timelineLine, index < normalizedIndex && normalizedIndex !== -1 && styles.timelineLineActive]} />}
                        <Text style={[styles.timelineLabel, isActive && styles.timelineLabelActive]}>{step}</Text>
                    </View>
                );
            })}
        </View>
    );
};

export const BookingsScreen: React.FC<BookingsScreenProps> = ({ navigation }) => {
    const { bookings } = useBookingsStore();
    const [activeTab, setActiveTab] = React.useState<'active' | 'completed' | 'cancelled'>('active');

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'active') return ['pending', 'confirmed', 'agent_assigned', 'on_the_way', 'in_progress'].includes(b.status);
        if (activeTab === 'completed') return b.status === 'completed';
        if (activeTab === 'cancelled') return b.status === 'cancelled';
        return true;
    });

    if (bookings.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}><Text style={styles.headerTitle}>My Bookings</Text></View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={80} color={colors.textLight} />
                    <Text style={styles.emptyTitle}>No bookings yet</Text>
                    <Text style={styles.emptyDesc}>Book a service to get started</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}><Text style={styles.headerTitle}>My Bookings</Text></View>

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

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {filteredBookings.map((booking) => (
                    <TouchableOpacity key={booking.id} style={styles.bookingCard}>
                        <View style={styles.bookingHeader}>
                            <Text style={styles.bookingId}>#{booking.id}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>{getStatusLabel(booking.status)}</Text>
                            </View>
                        </View>

                        {renderTimeline(booking.status)}

                        <Text style={styles.serviceName}>{booking.service.name}</Text>
                        <View style={styles.bookingRow}>
                            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                            <Text style={styles.bookingInfo}>{booking.scheduledDate} at {booking.scheduledTime}</Text>
                        </View>
                        <View style={styles.bookingRow}>
                            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                            <Text style={styles.bookingInfo}>{booking.address.city}</Text>
                        </View>
                        <View style={styles.bookingFooter}>
                            <Text style={styles.bookingPrice}>₹{booking.totalAmount}</Text>
                            {booking.agent && <Text style={styles.agentName}>Agent: {booking.agent.name}</Text>}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: spacing.md, backgroundColor: colors.surface, ...shadows.sm },
    headerTitle: { ...typography.h3, color: colors.text },
    tabContainer: { flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.surface, marginBottom: 1 },
    tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: colors.primary },
    tabText: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
    activeTabText: { color: colors.primary },
    scrollView: { flex: 1, padding: spacing.md },
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
    agentName: { ...typography.caption, color: colors.textSecondary },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    emptyTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg },
    emptyDesc: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
    timelineContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: spacing.md, paddingHorizontal: spacing.sm },
    timelineStep: { alignItems: 'center', width: '20%' },
    timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border, marginBottom: 4, zIndex: 1 },
    timelineDotActive: { backgroundColor: colors.success },
    timelineLine: { position: 'absolute', top: 4, left: '50%', width: '100%', height: 2, backgroundColor: colors.border, zIndex: 0 },
    timelineLineActive: { backgroundColor: colors.success },
    timelineLabel: { ...typography.caption, fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
    timelineLabelActive: { color: colors.success, fontWeight: '700' },
});
