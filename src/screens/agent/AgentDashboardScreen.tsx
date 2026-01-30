// Agent Dashboard Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { useAuthStore } from '../../store';
import { mockServiceRequests } from '../../services/mockData';

type AgentDashboardScreenProps = { navigation: NativeStackNavigationProp<any> };

export const AgentDashboardScreen: React.FC<AgentDashboardScreenProps> = ({ navigation }) => {
    const [isOnline, setIsOnline] = useState(true);
    const { user, logout } = useAuthStore();

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

    const stats = { todayEarnings: 1250, totalJobs: 5, rating: 4.8 };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Agent'}!</Text>
                            <Text style={styles.subGreeting}>Ready to serve</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <View style={styles.onlineToggle}>
                                <Text style={styles.onlineLabel}>{isOnline ? 'Online' : 'Offline'}</Text>
                                <Switch trackColor={{ false: '#767577', true: colors.success }} thumbColor="white" onValueChange={setIsOnline} value={isOnline} />
                            </View>
                            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                                <Ionicons name="log-out-outline" size={24} color={colors.textOnPrimary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}><Text style={styles.statValue}>₹{stats.todayEarnings}</Text><Text style={styles.statLabel}>Today's Earnings</Text></View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}><Text style={styles.statValue}>{stats.totalJobs}</Text><Text style={styles.statLabel}>Jobs Today</Text></View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}><Text style={styles.statValue}>⭐ {stats.rating}</Text><Text style={styles.statLabel}>Rating</Text></View>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>New Requests</Text>
                        <Text style={styles.requestCount}>{mockServiceRequests.length} available</Text>
                    </View>
                    {mockServiceRequests.map((request) => (
                        <View key={request.id} style={styles.requestCard}>
                            <View style={styles.requestHeader}>
                                <Text style={styles.serviceName}>{request.booking.service.name}</Text>
                                <Text style={styles.earning}>₹{request.estimatedEarning}</Text>
                            </View>
                            <View style={styles.requestInfo}>
                                <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.infoText}>{request.customerName}</Text>
                            </View>
                            <View style={styles.requestInfo}>
                                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.infoText}>{request.distance} away</Text>
                            </View>
                            <View style={styles.requestInfo}>
                                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.infoText}>{request.booking.scheduledTime}</Text>
                            </View>
                            <View style={styles.requestActions}>
                                <TouchableOpacity style={styles.rejectButton}><Text style={styles.rejectText}>Reject</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.acceptButton}><Text style={styles.acceptText}>Accept</Text></TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <View style={styles.menuSection}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Earnings')}>
                            <Ionicons name="cash-outline" size={24} color={colors.primary} />
                            <Text style={styles.menuText}>My Earnings</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                            <Text style={styles.menuText}>Job History</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </TouchableOpacity>
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
    subGreeting: { ...typography.body, color: 'rgba(255,255,255,0.8)' },
    onlineToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    logoutButton: { padding: spacing.xs },
    onlineLabel: { ...typography.bodySmall, color: colors.textOnPrimary },
    statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: borderRadius.lg, padding: spacing.md },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { ...typography.h3, color: colors.textOnPrimary, fontWeight: '700' },
    statLabel: { ...typography.caption, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
    content: { padding: spacing.md },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    sectionTitle: { ...typography.h3, color: colors.text },
    requestCount: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
    requestCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
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
    menuSection: { marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: borderRadius.lg, ...shadows.sm },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    menuText: { ...typography.body, color: colors.text, flex: 1, marginLeft: spacing.md },
});
