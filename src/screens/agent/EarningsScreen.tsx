// Agent Earnings Screen

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';

type EarningsScreenProps = { navigation: NativeStackNavigationProp<any> };

const earningsData = [
    { id: '1', service: 'RO Service', customer: 'Amit Sharma', amount: 350, date: '30 Jan 2026' },
    { id: '2', service: 'Water Purifier Service', customer: 'Priya Patel', amount: 299, date: '30 Jan 2026' },
    { id: '3', service: 'Ionizer Service', customer: 'Raj Kumar', amount: 450, date: '29 Jan 2026' },
    { id: '4', service: 'Water Softener', customer: 'Neha Singh', amount: 380, date: '29 Jan 2026' },
];

export const EarningsScreen: React.FC<EarningsScreenProps> = ({ navigation }) => {
    const totalEarnings = earningsData.reduce((sum, e) => sum + e.amount, 0);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={styles.headerTitle}>My Earnings</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.earningsCard}>
                    <Text style={styles.earningsLabel}>Total Earnings</Text>
                    <Text style={styles.earningsAmount}>₹{totalEarnings.toLocaleString()}</Text>
                    <View style={styles.periodTabs}>
                        <TouchableOpacity style={[styles.periodTab, styles.periodTabActive]}><Text style={styles.periodTabTextActive}>Today</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.periodTab}><Text style={styles.periodTabText}>Week</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.periodTab}><Text style={styles.periodTabText}>Month</Text></TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Recent Earnings</Text>
                    {earningsData.map((item) => (
                        <View key={item.id} style={styles.earningItem}>
                            <View style={styles.earningIcon}><Ionicons name="water" size={24} color={colors.primary} /></View>
                            <View style={styles.earningInfo}>
                                <Text style={styles.earningService}>{item.service}</Text>
                                <Text style={styles.earningCustomer}>{item.customer}</Text>
                                <Text style={styles.earningDate}>{item.date}</Text>
                            </View>
                            <Text style={styles.earningAmount}>+₹{item.amount}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, ...shadows.sm },
    headerTitle: { ...typography.h3, color: colors.text },
    earningsCard: { margin: spacing.md, borderRadius: borderRadius.xl, padding: spacing.lg, alignItems: 'center' },
    earningsLabel: { ...typography.body, color: 'rgba(255,255,255,0.8)' },
    earningsAmount: { ...typography.h1, color: colors.textOnPrimary, fontWeight: '700', fontSize: 40, marginVertical: spacing.sm },
    periodTabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: borderRadius.md, padding: 4 },
    periodTab: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.sm },
    periodTabActive: { backgroundColor: colors.surface },
    periodTabText: { ...typography.bodySmall, color: 'rgba(255,255,255,0.8)' },
    periodTabTextActive: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
    content: { padding: spacing.md },
    sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
    earningItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
    earningIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
    earningInfo: { flex: 1, marginLeft: spacing.md },
    earningService: { ...typography.body, fontWeight: '600', color: colors.text },
    earningCustomer: { ...typography.bodySmall, color: colors.textSecondary },
    earningDate: { ...typography.caption, color: colors.textLight },
    earningAmount: { ...typography.body, fontWeight: '700', color: colors.success },
});
