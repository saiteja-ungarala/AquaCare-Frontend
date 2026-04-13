import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JobUpdate, RootStackParamList, TechnicianJob } from '../../models/types';
import { technicianTheme } from '../../theme/technicianTheme';
import { TechnicianButton, TechnicianCard, TechnicianChip, TechnicianScreen, TechnicianSectionHeader } from '../../components/technician';
import { useTechnicianStore } from '../../store';
import { showTechnicianToast } from '../../utils/technicianToast';
import { getTechnicianKycGateRoute, isTechnicianKycApproved } from '../../utils/technicianKyc';

// ── update type display config ────────────────────────────────────────────────
const UPDATE_LABEL: Record<string, string> = {
    arrived: 'Arrived at location',
    diagnosed: 'Diagnosis complete',
    in_progress: 'Work started',
    completed: 'Work completed',
    photo: 'Photo uploaded',
    note: 'Note added',
};
const UPDATE_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
    arrived: 'location',
    diagnosed: 'search',
    in_progress: 'construct',
    completed: 'checkmark-circle',
    photo: 'camera',
    note: 'document-text',
};
const UPDATE_COLOR: Record<string, string> = {
    arrived: '#F97316',
    diagnosed: '#3B82F6',
    in_progress: '#EAB308',
    completed: '#22C55E',
    photo: technicianTheme.colors.agentPrimary,
    note: '#9CA3AF',
};

const formatJobTime = (date: string, time: string) => {
    const parsed = new Date(`${date}T${time || '00:00:00'}`);
    if (Number.isNaN(parsed.getTime())) return `${date} ${time}`;
    return parsed.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

const formatUpdateTime = (raw: string) => {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' });
};

export const TechnicianActiveJobScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { jobs, jobUpdates, loading, fetchJobs, fetchJobUpdates, postArrived, updateStatus, fetchMe, kycStatus } = useTechnicianStore();
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
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

    const activeJobs = useMemo(
        () => jobs.filter((job) => job.status === 'assigned' || job.status === 'in_progress'),
        [jobs]
    );

    useEffect(() => {
        if (activeJobs.length === 0) { setSelectedJobId(null); return; }
        if (!selectedJobId || !activeJobs.some((j) => j.id === selectedJobId)) {
            setSelectedJobId(activeJobs[0].id);
        }
    }, [activeJobs, selectedJobId]);

    // Fetch updates whenever selected job changes
    useEffect(() => {
        if (selectedJobId) fetchJobUpdates(selectedJobId);
    }, [selectedJobId, fetchJobUpdates]);

    const selectedJob = activeJobs.find((j) => j.id === selectedJobId) || null;
    const selectedUpdates: JobUpdate[] = selectedJob ? (jobUpdates[selectedJob.id] ?? []) : [];
    const arrivedForSelected = selectedUpdates.some((u) => u.update_type === 'arrived');

    const callCustomer = async (job: TechnicianJob) => {
        if (!job.customer_phone) return;
        const url = `tel:${job.customer_phone}`;
        if (await Linking.canOpenURL(url)) await Linking.openURL(url);
        else showTechnicianToast('Calling is not available on this device.');
    };

    const openInMaps = async (job: TechnicianJob) => {
        const address = [job.address_line1, job.address_city, job.address_state, job.address_postal_code].filter(Boolean).join(', ');
        if (!address) { showTechnicianToast('Address unavailable.'); return; }
        await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
    };

    const handleUpdateStatus = async (status: 'in_progress' | 'completed') => {
        if (!selectedJob) return;
        const ok = await updateStatus(selectedJob.id, status);
        if (!ok) return;
        showTechnicianToast(status === 'in_progress' ? 'Job started' : 'Job completed');
        fetchJobs();
    };

    const handleArrived = async () => {
        if (!selectedJob) return;
        const ok = await postArrived(selectedJob.id);
        if (ok) showTechnicianToast('Arrival recorded — customer notified');
    };

    const renderJob = ({ item }: { item: TechnicianJob }) => {
        const isSelected = item.id === selectedJobId;
        const location = [item.address_city, item.address_line1].filter(Boolean).join(', ');
        const updates: JobUpdate[] = jobUpdates[item.id] ?? [];

        const chipTone = item.status === 'in_progress' ? 'warning' : 'default';

        return (
            <TouchableOpacity onPress={() => setSelectedJobId(item.id)} activeOpacity={0.85}>
                <TechnicianCard style={[styles.card, isSelected ? styles.cardSelected : null]}>
                    <View style={styles.cardTop}>
                        <Text style={styles.jobTitle}>{item.service_name}</Text>
                        <TechnicianChip label={item.status.replace('_', ' ')} tone={chipTone} />
                    </View>
                    <Text style={styles.metaLine}>{formatJobTime(item.scheduled_date, item.scheduled_time)}</Text>
                    <Text style={styles.metaLine} numberOfLines={1}>{location || 'Address not available'}</Text>
                    {item.customer_name ? (
                        <Text style={styles.metaLine}>Customer: {item.customer_name}</Text>
                    ) : null}

                    <View style={styles.quickActions}>
                        {item.customer_phone ? (
                            <TechnicianButton title="Call Customer" variant="secondary" onPress={() => callCustomer(item)} style={styles.quickBtn} />
                        ) : null}
                        <TechnicianButton title="Open Maps" variant="secondary" onPress={() => openInMaps(item)} style={styles.quickBtn} />
                    </View>

                    {/* Timeline */}
                    {updates.length > 0 && (
                        <View style={styles.timeline}>
                            <Text style={styles.timelineHeading}>Timeline</Text>
                            {updates.map((u) => (
                                <View key={u.id} style={styles.timelineRow}>
                                    <View style={[styles.timelineDot, { backgroundColor: UPDATE_COLOR[u.update_type] ?? '#9CA3AF' }]}>
                                        <Ionicons name={UPDATE_ICON[u.update_type] ?? 'ellipse'} size={10} color="#fff" />
                                    </View>
                                    <View style={styles.timelineBody}>
                                        <Text style={styles.timelineLabel}>{UPDATE_LABEL[u.update_type] ?? u.update_type}</Text>
                                        {u.note ? <Text style={styles.timelineNote}>{u.note}</Text> : null}
                                        <Text style={styles.timelineTime}>{formatUpdateTime(u.created_at)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </TechnicianCard>
            </TouchableOpacity>
        );
    };

    if (!isKycApproved) {
        return (
            <TechnicianScreen>
                <View style={styles.lockWrap}>
                    <TechnicianCard style={styles.lockCard}>
                        <Ionicons name="lock-closed" size={26} color={technicianTheme.colors.agentPrimary} />
                        <Text style={styles.lockTitle}>KYC approval required</Text>
                        <Text style={styles.lockSubtitle}>
                            Active job controls are available only after verification approval.
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
                        <View style={styles.assignedRow}>
                            <TechnicianButton
                                title={arrivedForSelected ? '✓ Arrived' : 'Mark Arrived'}
                                variant="secondary"
                                onPress={handleArrived}
                                loading={loading.action}
                                disabled={arrivedForSelected || loading.action}
                                style={styles.arrivedBtn}
                            />
                            <TechnicianButton
                                title="Start Job"
                                onPress={() => handleUpdateStatus('in_progress')}
                                loading={loading.action}
                                style={styles.startBtn}
                            />
                        </View>
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
                        <Text style={styles.bottomHintText}>Job #{selectedJob.id}</Text>
                    </View>
                </View>
            ) : null}
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
    header: {
        paddingHorizontal: technicianTheme.spacing.lg,
        paddingTop: technicianTheme.spacing.lg,
        paddingBottom: technicianTheme.spacing.sm,
    },
    listContent: {
        paddingHorizontal: technicianTheme.spacing.lg,
        paddingBottom: 140,
        gap: technicianTheme.spacing.md,
    },
    card: { gap: 6 },
    cardSelected: { borderColor: '#F5C04A', backgroundColor: '#FFF7E4' },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: technicianTheme.spacing.sm },
    jobTitle: { ...technicianTheme.typography.h2, color: technicianTheme.colors.textPrimary, flex: 1 },
    metaLine: { ...technicianTheme.typography.bodySmall, color: technicianTheme.colors.textSecondary },
    quickActions: { flexDirection: 'row', gap: technicianTheme.spacing.sm, marginTop: technicianTheme.spacing.sm },
    quickBtn: { flex: 1 },

    // Timeline
    timeline: {
        marginTop: technicianTheme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: technicianTheme.colors.border ?? '#E5E7EB',
        paddingTop: technicianTheme.spacing.sm,
    },
    timelineHeading: {
        ...technicianTheme.typography.caption,
        color: technicianTheme.colors.textSecondary,
        marginBottom: technicianTheme.spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    timelineRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: technicianTheme.spacing.sm, gap: 10 },
    timelineDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 1,
    },
    timelineBody: { flex: 1 },
    timelineLabel: { ...technicianTheme.typography.bodySmall, color: technicianTheme.colors.textPrimary, fontWeight: '600' },
    timelineNote: { ...technicianTheme.typography.caption, color: technicianTheme.colors.textSecondary, marginTop: 2 },
    timelineTime: { ...technicianTheme.typography.caption, color: technicianTheme.colors.textSecondary, marginTop: 2 },

    emptyTitle: { ...technicianTheme.typography.h2, color: technicianTheme.colors.textPrimary, textAlign: 'center' },
    emptySubtitle: { ...technicianTheme.typography.bodySmall, color: technicianTheme.colors.textSecondary, textAlign: 'center', marginTop: 6 },

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
    assignedRow: { flexDirection: 'row', gap: technicianTheme.spacing.sm },
    arrivedBtn: { flex: 1 },
    startBtn: { flex: 1 },
    bottomButton: { minHeight: 52 },
    bottomHint: { marginTop: technicianTheme.spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    bottomHintText: { ...technicianTheme.typography.caption, color: '#D2D9E1' },
});
