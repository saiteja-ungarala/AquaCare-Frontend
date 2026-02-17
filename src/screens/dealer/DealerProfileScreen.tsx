import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { dealerTheme } from '../../theme/dealerTheme';
import { useAuthStore, useDealerStore } from '../../store';

const getStatusTone = (status: string): { bg: string; text: string } => {
    if (status === 'approved') return { bg: '#E7F3EC', text: dealerTheme.colors.success };
    if (status === 'rejected') return { bg: '#FDECEC', text: dealerTheme.colors.danger };
    if (status === 'pending') return { bg: '#FFF7E7', text: dealerTheme.colors.warning };
    return { bg: '#EDF3F8', text: dealerTheme.colors.textSecondary };
};

export const DealerProfileScreen: React.FC = () => {
    const { user, logout } = useAuthStore();
    const { me, verificationStatus, fetchMe, updateDealerProfile, loadingMe, error } = useDealerStore();

    const [editing, setEditing] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const [gstNumber, setGstNumber] = useState('');
    const [addressText, setAddressText] = useState('');

    const hydrateForm = useCallback(() => {
        setBusinessName(me?.business_name || '');
        setGstNumber(me?.gst_number || '');
        setAddressText(me?.address_text || '');
    }, [me]);

    useFocusEffect(
        useCallback(() => {
            fetchMe();
        }, [fetchMe])
    );

    useEffect(() => {
        hydrateForm();
    }, [hydrateForm]);

    const save = async () => {
        const ok = await updateDealerProfile({
            business_name: businessName.trim() || undefined,
            gst_number: gstNumber.trim() || undefined,
            address_text: addressText.trim() || undefined,
        });
        if (ok) {
            setEditing(false);
            Alert.alert('Updated', 'Dealer profile updated successfully.');
        }
    };

    const status = String(verificationStatus || me?.verification_status || 'unverified').toLowerCase();
    const tone = getStatusTone(status);

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Dealer Profile</Text>
            <Text style={styles.subtitle}>Business identity and verification details</Text>

            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.name}>{user?.name || me?.full_name || 'Dealer User'}</Text>
                        <Text style={styles.meta}>{user?.email || '-'}</Text>
                        <Text style={styles.meta}>{me?.phone || '-'}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                        <Text style={[styles.badgeText, { color: tone.text }]}>{status.toUpperCase()}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>Business Details</Text>
                    <TouchableOpacity onPress={() => setEditing((v) => !v)}>
                        <Text style={styles.editText}>{editing ? 'Cancel' : 'Edit'}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>Business Name</Text>
                <TextInput
                    style={[styles.input, !editing ? styles.inputReadonly : null]}
                    editable={editing}
                    value={businessName}
                    onChangeText={setBusinessName}
                    placeholder="Enter business name"
                    placeholderTextColor={dealerTheme.colors.dealerMuted}
                />

                <Text style={styles.fieldLabel}>GST Number</Text>
                <TextInput
                    style={[styles.input, !editing ? styles.inputReadonly : null]}
                    editable={editing}
                    value={gstNumber}
                    onChangeText={setGstNumber}
                    placeholder="Enter GST number"
                    placeholderTextColor={dealerTheme.colors.dealerMuted}
                    autoCapitalize="characters"
                />

                <Text style={styles.fieldLabel}>Address</Text>
                <TextInput
                    style={[styles.input, styles.textArea, !editing ? styles.inputReadonly : null]}
                    editable={editing}
                    value={addressText}
                    onChangeText={setAddressText}
                    placeholder="Enter business address"
                    placeholderTextColor={dealerTheme.colors.dealerMuted}
                    multiline
                />

                <Text style={styles.meta}>Base Latitude: {me?.base_lat ?? '-'}</Text>
                <Text style={styles.meta}>Base Longitude: {me?.base_lng ?? '-'}</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {editing ? (
                    <TouchableOpacity style={[styles.primaryButton, loadingMe ? styles.buttonDisabled : null]} onPress={save} disabled={loadingMe}>
                        <Text style={styles.primaryButtonText}>{loadingMe ? 'Saving...' : 'Save Changes'}</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: dealerTheme.spacing.lg,
        backgroundColor: dealerTheme.colors.dealerSurfaceAlt,
        minHeight: '100%',
    },
    title: {
        ...dealerTheme.typography.h1,
        color: dealerTheme.colors.textPrimary,
    },
    subtitle: {
        ...dealerTheme.typography.bodySmall,
        color: dealerTheme.colors.textSecondary,
        marginTop: 4,
        marginBottom: dealerTheme.spacing.md,
    },
    card: {
        backgroundColor: dealerTheme.colors.dealerSurface,
        borderRadius: dealerTheme.radius.lg,
        borderWidth: 1,
        borderColor: dealerTheme.colors.border,
        padding: dealerTheme.spacing.md,
        marginBottom: dealerTheme.spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        ...dealerTheme.typography.h2,
        color: dealerTheme.colors.textPrimary,
    },
    meta: {
        ...dealerTheme.typography.bodySmall,
        color: dealerTheme.colors.textSecondary,
        marginTop: 2,
    },
    badge: {
        borderRadius: dealerTheme.radius.full,
        paddingHorizontal: dealerTheme.spacing.sm,
        paddingVertical: 4,
    },
    badgeText: {
        ...dealerTheme.typography.caption,
    },
    sectionTitle: {
        ...dealerTheme.typography.h2,
        color: dealerTheme.colors.textPrimary,
    },
    editText: {
        ...dealerTheme.typography.bodySmall,
        color: dealerTheme.colors.dealerPrimary,
        fontWeight: '700',
    },
    fieldLabel: {
        ...dealerTheme.typography.caption,
        color: dealerTheme.colors.textSecondary,
        marginTop: dealerTheme.spacing.sm,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: dealerTheme.colors.border,
        borderRadius: dealerTheme.radius.md,
        paddingHorizontal: dealerTheme.spacing.sm,
        paddingVertical: dealerTheme.spacing.sm,
        color: dealerTheme.colors.textPrimary,
        backgroundColor: '#FDFEFF',
        ...dealerTheme.typography.bodySmall,
    },
    inputReadonly: {
        backgroundColor: '#F4F8FB',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        ...dealerTheme.typography.caption,
        color: dealerTheme.colors.danger,
        marginTop: dealerTheme.spacing.sm,
    },
    primaryButton: {
        marginTop: dealerTheme.spacing.md,
        backgroundColor: dealerTheme.colors.dealerPrimary,
        borderRadius: dealerTheme.radius.md,
        paddingVertical: dealerTheme.spacing.sm,
        alignItems: 'center',
    },
    primaryButtonText: {
        ...dealerTheme.typography.button,
        color: dealerTheme.colors.textOnPrimary,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    logoutButton: {
        backgroundColor: '#FDECEC',
        borderRadius: dealerTheme.radius.md,
        borderWidth: 1,
        borderColor: '#F2C5C5',
        paddingVertical: dealerTheme.spacing.sm,
        alignItems: 'center',
    },
    logoutText: {
        ...dealerTheme.typography.button,
        color: dealerTheme.colors.danger,
    },
});

