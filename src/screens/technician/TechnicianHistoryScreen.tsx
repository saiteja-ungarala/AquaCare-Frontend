import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TechnicianJob } from '../../models/types';
import { Ionicons } from '@expo/vector-icons';
import { technicianTheme } from '../../theme/technicianTheme';
import { TechnicianButton, TechnicianCard, TechnicianChip, TechnicianScreen, TechnicianSectionHeader } from '../../components/technician';
import { useTechnicianStore } from '../../store';
import { getTechnicianKycGateRoute, isTechnicianKycApproved } from '../../utils/technicianKyc';

type HistoryTab = 'completed' | 'in_progress' | 'assigned';

const TABS: Array<{ key: HistoryTab; label: string }> = [
    { key: 'completed', label: 'Completed' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'assigned', label: 'Assigned' },
];

const chipTone = (status: HistoryTab): 'success' | 'warning' => (status === 'completed' ? 'success' : 'warning');

const formatSlot = (date: string, time: string) => `${date} ${time}`.trim();

export const TechnicianHistoryScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [activeTab, setActiveTab] = useState<HistoryTab>('completed');
    const { jobs, fetchJobs, fetchMe, kycStatus } = useTechnicianStore();
    const isKycApproved = isTechnicianKycApproved(kycStatus);
    const kycGateRoute = getTechnicianKycGateRoute(kycStatus);

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                const profile = await fetchMe();
                if (!profile) return;

                if (!isTechnicianKycApproved(profile.profile.verification_status)) {
                    const nextRoute = getTechnicianKycGateRoute(profile.profile.verification_status);
                    navigation.reset({ index: 0, routes: [{ name: nextRoute }] });
                    return;
                }

                await fetchJobs();
            };

            void loadData();
        }, [fetchJobs, fetchMe, navigation])
    );

    const historyJobs = useMemo(() => jobs.filter((job) => job.status === activeTab), [activeTab, jobs]);

    const renderJob = ({ item }: { item: TechnicianJob }) => (
        <TechnicianCard>
            <View style={styles.topRow}>
                <Text style={styles.service}>{item.service_name}</Text>
                <TechnicianChip label={item.status.replace('_', ' ')} tone={chipTone(activeTab)} />
            </View>
            <Text style={styles.line}>{formatSlot(item.scheduled_date, item.scheduled_time)}</Text>
            <Text style={styles.line} numberOfLines={1}>{[item.address_city, item.address_line1].filter(Boolean).join(', ') || 'Address unavailable'}</Text>
        </TechnicianCard>
    );

    if (!isKycApproved) {
        return (
            <TechnicianScreen>
                <View style={styles.lockWrap}>
                    <TechnicianCard style={styles.lockCard}>
                        <Ionicons name="lock-closed" size={26} color={technicianTheme.colors.agentPrimary} />
                        <Text style={styles.lockTitle}>KYC approval required</Text>
                        <Text style={styles.lockSubtitle}>
                            Job history is available only after your KYC is approved.
                        </Text>
                        <TechnicianButton
                            title="Complete KYC"
                            onPress={() => navigation.navigate(kycGateRoute)}
                            style={styles.lockBtn}
                        />
                    </TechnicianCard>
                </View>
            </TechnicianScreen>
        );
    }

    return (
        <TechnicianScreen>
            <View style={styles.headerWrap}>
                <TechnicianSectionHeader title="History" subtitle="Track assigned and completed work" />
            </View>

            <View style={styles.tabsRow}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key ? styles.tabActive : null]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key ? styles.tabTextActive : null]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={historyJobs}
                keyExtractor={(item) => item.id}
                renderItem={renderJob}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <TechnicianCard>
                        <Text style={styles.emptyTitle}>No records in this section</Text>
                        <Text style={styles.emptySubtitle}>Completed and active assignments will appear here.</Text>
                    </TechnicianCard>
                }
            />
        </TechnicianScreen>
    );
};

const styles = StyleSheet.create({
    lockWrap: {
        flex: 1,
        justifyContent: 'center',
        padding: technicianTheme.spacing.lg,
    },
    lockCard: {
        alignItems: 'center',
    },
    lockTitle: {
        ...technicianTheme.typography.h2,
        color: technicianTheme.colors.textPrimary,
        marginTop: technicianTheme.spacing.sm,
    },
    lockSubtitle: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
        marginTop: technicianTheme.spacing.xs,
        textAlign: 'center',
    },
    lockBtn: {
        marginTop: technicianTheme.spacing.md,
        width: '100%',
    },
    headerWrap: {
        paddingHorizontal: technicianTheme.spacing.lg,
        paddingTop: technicianTheme.spacing.lg,
    },
    tabsRow: {
        flexDirection: 'row',
        marginHorizontal: technicianTheme.spacing.lg,
        marginTop: technicianTheme.spacing.md,
        borderRadius: technicianTheme.radius.full,
        backgroundColor: '#ECEFF3',
        padding: 4,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: technicianTheme.radius.full,
    },
    tabActive: {
        backgroundColor: technicianTheme.colors.agentDark,
    },
    tabText: {
        ...technicianTheme.typography.caption,
        color: technicianTheme.colors.textSecondary,
    },
    tabTextActive: {
        color: '#F6F8FB',
    },
    listContent: {
        padding: technicianTheme.spacing.lg,
        gap: technicianTheme.spacing.md,
        paddingBottom: technicianTheme.spacing.xxl,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
    },
    service: {
        ...technicianTheme.typography.h2,
        color: technicianTheme.colors.textPrimary,
        flex: 1,
    },
    line: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
        marginTop: 6,
    },
    emptyTitle: {
        ...technicianTheme.typography.h2,
        color: technicianTheme.colors.textPrimary,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 6,
    },
});
