// Agent Dashboard Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { useAuthStore, useBookingsStore } from '../../store';
import { Booking } from '../../models/types';

type AgentDashboardScreenProps = { navigation: NativeStackNavigationProp<any> };

export const AgentDashboardScreen: React.FC<AgentDashboardScreenProps> = ({ navigation }) => {
    const [isOnline, setIsOnline] = useState(true);
    const { user, logout } = useAuthStore();
    const { bookings, updateBookingStatus } = useBookingsStore();

    const pendingRequests = bookings.filter(b => b.status === 'pending');
    const myJobs = bookings.filter(b => ['confirmed', 'agent_assigned', 'on_the_way', 'in_progress'].includes(b.status));

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

    const handleAcceptJob = (id: string) => {
        Alert.alert('Accept Job', 'Confirm taking this job?', [
            { text: 'Cancel' },
            { text: 'Accept', onPress: () => updateBookingStatus(id, 'confirmed') }
        ]);
    };

    const handleUpdateStatus = (id: string, currentStatus: Booking['status']) => {
        let nextStatus: Booking['status'] | null = null;
        let actionLabel = '';

        if (currentStatus === 'confirmed') {
            nextStatus = 'on_the_way';
            actionLabel = 'Start Journey';
        } else if (currentStatus === 'on_the_way') {
            nextStatus = 'in_progress';
            actionLabel = 'Start Job';
        } else if (currentStatus === 'in_progress') {
            nextStatus = 'completed';
            actionLabel = 'Complete Job';
        }

        if (nextStatus) {
            updateBookingStatus(id, nextStatus);
        }
    };

    const getActionLabel = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed': return 'Start Journey';
            case 'on_the_way': return 'Start Job';
            case 'in_progress': return 'Complete Job';
            default: return 'View Details';
        }
    };

    const stats = { todayEarnings: 1250, totalJobs: myJobs.length, rating: 4.8 };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Agent'}!</Text>
                            <Text style={styles.subGreeting}>Ready to serve</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <View style={styles.onlineToggle}>
                                <Text style={styles.onlineLabel}>{isOnline ? 'Online' : 'Offline'}</Text>
                                <Switch trackColor={{ false: '#767577', true: colors.success }} thumbColor='#FFF' onValueChange={setIsOnline} value={isOnline} />
                            </View>
                            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                                <Ionicons name="log-out-outline" size={24} color={colors.textOnPrimary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}><Text style={styles.statValue}>₹{stats.todayEarnings}</Text><Text style={styles.statLabel}>Today's Earnings</Text></View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}><Text style={styles.statValue}>{stats.totalJobs}</Text><Text style={styles.statLabel}>Active Jobs</Text></View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}><Text style={styles.statValue}>⭐ {stats.rating}</Text><Text style={styles.statLabel}>Rating</Text></View>
                    </View>
                </View>

                <View style={styles.content}>

                    {/* Active Jobs Section */}
                    {myJobs.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>My Active Jobs</Text>
                                <Text style={styles.requestCount}>{myJobs.length} active</Text>
                            </View>
                            {myJobs.map((job) => (
                                <View key={job.id} style={styles.jobCard}>
                                    <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                                        <Text style={styles.statusText}>{job.status.replace(/_/g, ' ').toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.requestHeader}>
                                        <Text style={styles.serviceName}>{job.service.name}</Text>
                                        <Text style={styles.earning}>₹{job.totalAmount}</Text>
                                    </View>
                                    <View style={styles.requestInfo}>
                                        <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                                        <Text style={styles.infoText}>Customer #{job.id.slice(-4)}</Text>
                                    </View>
                                    <View style={styles.requestInfo}>
                                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                                        <Text style={styles.infoText}>{job.address.street}, {job.address.city}</Text>
                                    </View>
                                    <View style={styles.requestInfo}>
                                        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                                        <Text style={styles.infoText}>{job.scheduledDate} at {job.scheduledTime}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleUpdateStatus(job.id, job.status)}
                                    >
                                        <Text style={styles.actionButtonText}>{getActionLabel(job.status)}</Text>
                                        <Ionicons name="arrow-forward" size={18} color={colors.textOnPrimary} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* New Requests Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>New Requests</Text>
                            <Text style={styles.requestCount}>{pendingRequests.length} available</Text>
                        </View>
                        {pendingRequests.length === 0 ? (
                            <Text style={styles.emptyText}>No new requests at the moment.</Text>
                        ) : (
                            pendingRequests.map((request) => (
                                <View key={request.id} style={styles.requestCard}>
                                    <View style={styles.requestHeader}>
                                        <Text style={styles.serviceName}>{request.service.name}</Text>
                                        <Text style={styles.earning}>₹{request.totalAmount}</Text>
                                    </View>
                                    <View style={styles.requestInfo}>
                                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                                        <Text style={styles.infoText}>{request.address.city}</Text>
                                    </View>
                                    <View style={styles.requestInfo}>
                                        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                                        <Text style={styles.infoText}>{request.scheduledTime}</Text>
                                    </View>
                                    <View style={styles.requestActions}>
                                        <TouchableOpacity style={styles.rejectButton}><Text style={styles.rejectText}>Reject</Text></TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.acceptButton}
                                            onPress={() => handleAcceptJob(request.id)}
                                        >
                                            <Text style={styles.acceptText}>Accept</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: spacing.lg, paddingBottom: spacing.lg, paddingHorizontal: spacing.md },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    greeting: { ...typography.h2, color: colors.textOnPrimary },
    subGreeting: { ...typography.body, color: colors.textOnPrimary },
    onlineToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    logoutButton: { padding: spacing.xs },
    onlineLabel: { ...typography.bodySmall, color: colors.textOnPrimary },
    statsRow: { flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: borderRadius.lg, padding: spacing.md },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { ...typography.h2, fontSize: 22, color: colors.text, fontWeight: '700' },
    statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    statDivider: { width: 1, backgroundColor: colors.border },
    content: { padding: spacing.md },
    section: { marginBottom: spacing.xl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    sectionTitle: { ...typography.h2, fontSize: 18, color: colors.text },
    requestCount: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
    requestCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
    jobCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm, borderWidth: 1, borderColor: colors.primary },
    requestHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    serviceName: { ...typography.body, fontWeight: '600', color: colors.text },
    earning: { ...typography.body, fontWeight: '700', color: colors.success },
    requestInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 },
    infoText: { ...typography.bodySmall, color: colors.textSecondary },
    requestActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    rejectButton: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.error, alignItems: 'center' },
    rejectText: { ...typography.bodySmall, fontWeight: '600', color: colors.error },
    acceptButton: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.success, alignItems: 'center' },
    acceptText: { ...typography.bodySmall, fontWeight: '600', color: colors.textOnPrimary },
    actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.md },
    actionButtonText: { ...typography.body, fontWeight: '600', color: colors.textOnPrimary },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm, marginBottom: spacing.sm },
    statusText: { ...typography.caption, fontWeight: '700', color: colors.primary },
    emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg },
});
