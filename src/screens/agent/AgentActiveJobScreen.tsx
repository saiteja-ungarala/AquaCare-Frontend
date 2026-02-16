import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AgentJob } from '../../models/types';
import { agentTheme } from '../../theme/agentTheme';
import { AgentButton, AgentCard, AgentChip, AgentScreen, AgentSectionHeader } from '../../components/agent';
import { useAgentStore } from '../../store';
import { showAgentToast } from '../../utils/agentToast';

const formatJobTime = (date: string, time: string) => {
    const parsed = new Date(`${date}T${time || '00:00:00'}`);
    if (Number.isNaN(parsed.getTime())) return `${date} ${time}`;
    return parsed.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
    });
};

export const AgentActiveJobScreen: React.FC = () => {
    const { jobs, loading, fetchJobs, updateStatus } = useAgentStore();
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            fetchJobs();
        }, [fetchJobs])
    );

    const activeJobs = useMemo(
        () => jobs.filter((job) => job.status === 'assigned' || job.status === 'in_progress'),
        [jobs]
    );

    useEffect(() => {
        if (activeJobs.length === 0) {
            setSelectedJobId(null);
            return;
        }

        if (!selectedJobId || !activeJobs.some((job) => job.id === selectedJobId)) {
            setSelectedJobId(activeJobs[0].id);
        }
    }, [activeJobs, selectedJobId]);

    const selectedJob = activeJobs.find((job) => job.id === selectedJobId) || null;

    const callCustomer = async (job: AgentJob) => {
        if (!job.customer_phone) return;
        const telUrl = `tel:${job.customer_phone}`;
        const canOpen = await Linking.canOpenURL(telUrl);
        if (!canOpen) {
            showAgentToast('Calling is not available on this device.');
            return;
        }
        await Linking.openURL(telUrl);
    };

    const openInMaps = async (job: AgentJob) => {
        const address = [job.address_line1, job.address_city, job.address_state, job.address_postal_code].filter(Boolean).join(', ');
        if (!address) {
            showAgentToast('Address is not available for maps.');
            return;
        }

        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        await Linking.openURL(mapsUrl);
    };

    const handleUpdateStatus = async (status: 'in_progress' | 'completed') => {
        if (!selectedJob) return;

        const ok = await updateStatus(selectedJob.id, status);
        if (!ok) return;

        showAgentToast(status === 'in_progress' ? 'Job started' : 'Job completed');
        fetchJobs();
    };

    const renderJob = ({ item }: { item: AgentJob }) => {
        const isSelected = item.id === selectedJobId;
        const location = [item.address_city, item.address_line1].filter(Boolean).join(', ');

        return (
            <TouchableOpacity onPress={() => setSelectedJobId(item.id)} activeOpacity={0.85}>
                <AgentCard style={[styles.card, isSelected ? styles.cardSelected : null]}>
                    <View style={styles.cardTop}>
                        <Text style={styles.jobTitle}>{item.service_name}</Text>
                        <AgentChip label={item.status.replace('_', ' ')} tone="warning" />
                    </View>
                    <Text style={styles.metaLine}>{formatJobTime(item.scheduled_date, item.scheduled_time)}</Text>
                    <Text style={styles.metaLine} numberOfLines={1}>{location || 'Address not available'}</Text>

                    <View style={styles.quickActions}>
                        {item.customer_phone ? (
                            <AgentButton title="Call Customer" variant="secondary" onPress={() => callCustomer(item)} style={styles.quickBtn} />
                        ) : null}
                        <AgentButton title="Open In Maps" variant="secondary" onPress={() => openInMaps(item)} style={styles.quickBtn} />
                    </View>
                </AgentCard>
            </TouchableOpacity>
        );
    };

    return (
        <AgentScreen>
            <View style={styles.header}>
                <AgentSectionHeader title="Active Job" subtitle="Assigned and in-progress work" />
            </View>

            <FlatList
                data={activeJobs}
                keyExtractor={(item) => item.id}
                renderItem={renderJob}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <AgentCard>
                        <Text style={styles.emptyTitle}>No active jobs</Text>
                        <Text style={styles.emptySubtitle}>Accept a job from the Jobs tab to start work.</Text>
                    </AgentCard>
                }
            />

            {selectedJob ? (
                <View style={styles.bottomBar}>
                    {selectedJob.status === 'assigned' ? (
                        <AgentButton
                            title="Start Job"
                            onPress={() => handleUpdateStatus('in_progress')}
                            loading={loading.action}
                            style={styles.bottomButton}
                        />
                    ) : null}

                    {selectedJob.status === 'in_progress' ? (
                        <AgentButton
                            title="Complete Job"
                            onPress={() => handleUpdateStatus('completed')}
                            loading={loading.action}
                            style={styles.bottomButton}
                        />
                    ) : null}

                    <View style={styles.bottomHint}>
                        <Ionicons name="flash" size={14} color={agentTheme.colors.agentPrimary} />
                        <Text style={styles.bottomHintText}>Selected job #{selectedJob.id}</Text>
                    </View>
                </View>
            ) : null}
        </AgentScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: agentTheme.spacing.lg,
        paddingTop: agentTheme.spacing.lg,
        paddingBottom: agentTheme.spacing.sm,
    },
    listContent: {
        paddingHorizontal: agentTheme.spacing.lg,
        paddingBottom: 130,
        gap: agentTheme.spacing.md,
    },
    card: {
        gap: 6,
    },
    cardSelected: {
        borderColor: '#F5C04A',
        backgroundColor: '#FFF7E4',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: agentTheme.spacing.sm,
    },
    jobTitle: {
        ...agentTheme.typography.h2,
        color: agentTheme.colors.textPrimary,
        flex: 1,
    },
    metaLine: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
    },
    quickActions: {
        flexDirection: 'row',
        gap: agentTheme.spacing.sm,
        marginTop: agentTheme.spacing.sm,
    },
    quickBtn: {
        flex: 1,
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
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: agentTheme.colors.agentDark,
        paddingHorizontal: agentTheme.spacing.lg,
        paddingTop: agentTheme.spacing.md,
        paddingBottom: agentTheme.spacing.lg,
        borderTopLeftRadius: agentTheme.radius.lg,
        borderTopRightRadius: agentTheme.radius.lg,
        ...agentTheme.shadows.bar,
    },
    bottomButton: {
        minHeight: 52,
    },
    bottomHint: {
        marginTop: agentTheme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    bottomHintText: {
        ...agentTheme.typography.caption,
        color: '#D2D9E1',
    },
});
