import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AgentJob } from '../../models/types';
import { agentTheme } from '../../theme/agentTheme';
import { AgentCard, AgentChip, AgentScreen, AgentSectionHeader } from '../../components/agent';
import { useAgentStore } from '../../store';

type HistoryTab = 'completed' | 'in_progress' | 'assigned';

const TABS: Array<{ key: HistoryTab; label: string }> = [
    { key: 'completed', label: 'Completed' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'assigned', label: 'Assigned' },
];

const chipTone = (status: HistoryTab): 'success' | 'warning' => (status === 'completed' ? 'success' : 'warning');

const formatSlot = (date: string, time: string) => `${date} ${time}`.trim();

export const AgentHistoryScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<HistoryTab>('completed');
    const { jobs, fetchJobs } = useAgentStore();

    useFocusEffect(
        React.useCallback(() => {
            fetchJobs();
        }, [fetchJobs])
    );

    const historyJobs = useMemo(() => jobs.filter((job) => job.status === activeTab), [activeTab, jobs]);

    const renderJob = ({ item }: { item: AgentJob }) => (
        <AgentCard>
            <View style={styles.topRow}>
                <Text style={styles.service}>{item.service_name}</Text>
                <AgentChip label={item.status.replace('_', ' ')} tone={chipTone(activeTab)} />
            </View>
            <Text style={styles.line}>{formatSlot(item.scheduled_date, item.scheduled_time)}</Text>
            <Text style={styles.line} numberOfLines={1}>{[item.address_city, item.address_line1].filter(Boolean).join(', ') || 'Address unavailable'}</Text>
        </AgentCard>
    );

    return (
        <AgentScreen>
            <View style={styles.headerWrap}>
                <AgentSectionHeader title="History" subtitle="Track assigned and completed work" />
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
                    <AgentCard>
                        <Text style={styles.emptyTitle}>No records in this section</Text>
                        <Text style={styles.emptySubtitle}>Completed and active assignments will appear here.</Text>
                    </AgentCard>
                }
            />
        </AgentScreen>
    );
};

const styles = StyleSheet.create({
    headerWrap: {
        paddingHorizontal: agentTheme.spacing.lg,
        paddingTop: agentTheme.spacing.lg,
    },
    tabsRow: {
        flexDirection: 'row',
        marginHorizontal: agentTheme.spacing.lg,
        marginTop: agentTheme.spacing.md,
        borderRadius: agentTheme.radius.full,
        backgroundColor: '#ECEFF3',
        padding: 4,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: agentTheme.radius.full,
    },
    tabActive: {
        backgroundColor: agentTheme.colors.agentDark,
    },
    tabText: {
        ...agentTheme.typography.caption,
        color: agentTheme.colors.textSecondary,
    },
    tabTextActive: {
        color: '#F6F8FB',
    },
    listContent: {
        padding: agentTheme.spacing.lg,
        gap: agentTheme.spacing.md,
        paddingBottom: agentTheme.spacing.xxl,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
    },
    service: {
        ...agentTheme.typography.h2,
        color: agentTheme.colors.textPrimary,
        flex: 1,
    },
    line: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        marginTop: 6,
    },
    emptyTitle: {
        ...agentTheme.typography.h2,
        color: agentTheme.colors.textPrimary,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 6,
    },
});
