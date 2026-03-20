import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { TechnicianJob } from '../../models/types';
import { technicianTheme } from '../../theme/technicianTheme';
import { TechnicianButton, TechnicianCard, TechnicianChip, TechnicianScreen, TechnicianSectionHeader } from '../../components/technician';
import { useTechnicianStore } from '../../store';
import { showTechnicianToast } from '../../utils/technicianToast';

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

export const TechnicianActiveJobScreen: React.FC = () => {
    const { jobs, loading, fetchJobs, updateStatus } = useTechnicianStore();
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

    const callCustomer = async (job: TechnicianJob) => {
        if (!job.customer_phone) return;
        const telUrl = `tel:${job.customer_phone}`;
        const canOpen = await Linking.canOpenURL(telUrl);
        if (!canOpen) {
            showTechnicianToast('Calling is not available on this device.');
            return;
        }
        await Linking.openURL(telUrl);
    };

    const openInMaps = async (job: TechnicianJob) => {
        const address = [job.address_line1, job.address_city, job.address_state, job.address_postal_code].filter(Boolean).join(', ');
        if (!address) {
            showTechnicianToast('Address is not available for maps.');
            return;
        }

        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        await Linking.openURL(mapsUrl);
    };

    const handleUpdateStatus = async (status: 'in_progress' | 'completed') => {
        if (!selectedJob) return;

        const ok = await updateStatus(selectedJob.id, status);
        if (!ok) return;

        showTechnicianToast(status === 'in_progress' ? 'Job started' : 'Job completed');
        fetchJobs();
    };

    const renderJob = ({ item }: { item: TechnicianJob }) => {
        const isSelected = item.id === selectedJobId;
        const location = [item.address_city, item.address_line1].filter(Boolean).join(', ');

        return (
            <TouchableOpacity onPress={() => setSelectedJobId(item.id)} activeOpacity={0.85}>
                <TechnicianCard style={[styles.card, isSelected ? styles.cardSelected : null]}>
                    <View style={styles.cardTop}>
                        <Text style={styles.jobTitle}>{item.service_name}</Text>
                        <TechnicianChip label={item.status.replace('_', ' ')} tone="warning" />
                    </View>
                    <Text style={styles.metaLine}>{formatJobTime(item.scheduled_date, item.scheduled_time)}</Text>
                    <Text style={styles.metaLine} numberOfLines={1}>{location || 'Address not available'}</Text>

                    <View style={styles.quickActions}>
                        {item.customer_phone ? (
                            <TechnicianButton title="Call Customer" variant="secondary" onPress={() => callCustomer(item)} style={styles.quickBtn} />
                        ) : null}
                        <TechnicianButton title="Open In Maps" variant="secondary" onPress={() => openInMaps(item)} style={styles.quickBtn} />
                    </View>
                </TechnicianCard>
            </TouchableOpacity>
        );
    };

    return (
        <TechnicianScreen>
            <View style={styles.header}>
                <TechnicianSectionHeader title="Active Job" subtitle="Assigned and in-progress work" />
            </View>

            <FlatList
                data={activeJobs}
                keyExtractor={(item) => item.id}
                renderItem={renderJob}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <TechnicianCard>
                        <Text style={styles.emptyTitle}>No active jobs</Text>
                        <Text style={styles.emptySubtitle}>Accept a job from the Jobs tab to start work.</Text>
                    </TechnicianCard>
                }
            />

            {selectedJob ? (
                <View style={styles.bottomBar}>
                    {selectedJob.status === 'assigned' ? (
                        <TechnicianButton
                            title="Start Job"
                            onPress={() => handleUpdateStatus('in_progress')}
                            loading={loading.action}
                            style={styles.bottomButton}
                        />
                    ) : null}

                    {selectedJob.status === 'in_progress' ? (
                        <TechnicianButton
                            title="Complete Job"
                            onPress={() => handleUpdateStatus('completed')}
                            loading={loading.action}
                            style={styles.bottomButton}
                        />
                    ) : null}

                    <View style={styles.bottomHint}>
                        <Ionicons name="flash" size={14} color={technicianTheme.colors.agentPrimary} />
                        <Text style={styles.bottomHintText}>Selected job #{selectedJob.id}</Text>
                    </View>
                </View>
            ) : null}
        </TechnicianScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: technicianTheme.spacing.lg,
        paddingTop: technicianTheme.spacing.lg,
        paddingBottom: technicianTheme.spacing.sm,
    },
    listContent: {
        paddingHorizontal: technicianTheme.spacing.lg,
        paddingBottom: 130,
        gap: technicianTheme.spacing.md,
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
        gap: technicianTheme.spacing.sm,
    },
    jobTitle: {
        ...technicianTheme.typography.h2,
        color: technicianTheme.colors.textPrimary,
        flex: 1,
    },
    metaLine: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
    },
    quickActions: {
        flexDirection: 'row',
        gap: technicianTheme.spacing.sm,
        marginTop: technicianTheme.spacing.sm,
    },
    quickBtn: {
        flex: 1,
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
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: technicianTheme.colors.agentDark,
        paddingHorizontal: technicianTheme.spacing.lg,
        paddingTop: technicianTheme.spacing.md,
        paddingBottom: technicianTheme.spacing.lg,
        borderTopLeftRadius: technicianTheme.radius.lg,
        borderTopRightRadius: technicianTheme.radius.lg,
        ...technicianTheme.shadows.bar,
    },
    bottomButton: {
        minHeight: 52,
    },
    bottomHint: {
        marginTop: technicianTheme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    bottomHintText: {
        ...technicianTheme.typography.caption,
        color: '#D2D9E1',
    },
});
