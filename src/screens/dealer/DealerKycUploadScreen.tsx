import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DealerKycDocType, RootStackParamList } from '../../models/types';
import { dealerTheme } from '../../theme/dealerTheme';
import { useDealerStore } from '../../store';

type DealerKycUploadScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'DealerKycUpload'>;
};

const DOC_OPTIONS: Array<{ key: DealerKycDocType; label: string }> = [
    { key: 'gst_certificate', label: 'GST Certificate' },
    { key: 'shop_license', label: 'Shop License' },
    { key: 'pan', label: 'PAN' },
    { key: 'aadhaar', label: 'Aadhaar' },
    { key: 'bank_proof', label: 'Bank Proof' },
    { key: 'selfie', label: 'Selfie' },
    { key: 'other', label: 'Other' },
];

export const DealerKycUploadScreen: React.FC<DealerKycUploadScreenProps> = ({ navigation }) => {
    const [docType, setDocType] = useState<DealerKycDocType>('gst_certificate');
    const [documents, setDocuments] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const { uploadKyc, uploadingKyc, error } = useDealerStore();

    const pickDocuments = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow photo access to upload KYC documents.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 8,
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            setDocuments(result.assets);
        }
    };

    const submitKyc = async () => {
        if (documents.length === 0) {
            Alert.alert('Upload Required', 'Please choose at least one document.');
            return;
        }

        const success = await uploadKyc({
            doc_type: docType,
            files: documents.map((asset) => ({
                uri: asset.uri,
                fileName: asset.fileName,
                mimeType: asset.mimeType || 'image/jpeg',
            })),
        });

        if (!success) return;

        Alert.alert('Submitted', 'KYC submitted successfully. Verification is now in progress.');
        navigation.reset({ index: 0, routes: [{ name: 'DealerKycPending' }] });
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Dealer KYC Verification</Text>
            <Text style={styles.subtitle}>Upload your business documents to unlock dealer pricing.</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Select Document Type</Text>
                <View style={styles.optionsWrap}>
                    {DOC_OPTIONS.map((option) => {
                        const selected = option.key === docType;
                        return (
                            <TouchableOpacity
                                key={option.key}
                                style={[styles.optionChip, selected ? styles.optionChipActive : null]}
                                onPress={() => setDocType(option.key)}
                            >
                                <Text style={[styles.optionChipText, selected ? styles.optionChipTextActive : null]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Upload Documents</Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={pickDocuments}>
                    <Text style={styles.secondaryButtonText}>Choose Images</Text>
                </TouchableOpacity>
                <Text style={styles.metaText}>Selected files: {documents.length}</Text>
                {documents.map((file, index) => (
                    <Text key={`${file.uri}-${index}`} style={styles.fileItem} numberOfLines={1}>
                        {index + 1}. {file.fileName || file.uri.split('/').pop() || 'Document'}
                    </Text>
                ))}
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Submit</Text>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TouchableOpacity
                    style={[styles.primaryButton, uploadingKyc ? styles.buttonDisabled : null]}
                    onPress={submitKyc}
                    disabled={uploadingKyc}
                >
                    <Text style={styles.primaryButtonText}>{uploadingKyc ? 'Submitting...' : 'Submit KYC'}</Text>
                </TouchableOpacity>
            </View>
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
    cardTitle: {
        ...dealerTheme.typography.h2,
        color: dealerTheme.colors.textPrimary,
        marginBottom: dealerTheme.spacing.sm,
    },
    optionsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: dealerTheme.spacing.sm,
    },
    optionChip: {
        borderWidth: 1,
        borderColor: dealerTheme.colors.border,
        borderRadius: dealerTheme.radius.full,
        paddingHorizontal: dealerTheme.spacing.md,
        paddingVertical: dealerTheme.spacing.xs,
        backgroundColor: '#F7FBFE',
    },
    optionChipActive: {
        borderColor: dealerTheme.colors.dealerPrimary,
        backgroundColor: '#EAF4FB',
    },
    optionChipText: {
        ...dealerTheme.typography.caption,
        color: dealerTheme.colors.textSecondary,
    },
    optionChipTextActive: {
        color: dealerTheme.colors.dealerPrimary,
    },
    secondaryButton: {
        backgroundColor: '#E9F2F8',
        borderRadius: dealerTheme.radius.md,
        paddingVertical: dealerTheme.spacing.sm,
        alignItems: 'center',
    },
    secondaryButtonText: {
        ...dealerTheme.typography.button,
        color: dealerTheme.colors.dealerPrimary,
    },
    metaText: {
        ...dealerTheme.typography.bodySmall,
        color: dealerTheme.colors.textSecondary,
        marginTop: dealerTheme.spacing.sm,
        marginBottom: dealerTheme.spacing.xs,
    },
    fileItem: {
        ...dealerTheme.typography.caption,
        color: dealerTheme.colors.textSecondary,
        marginTop: 2,
    },
    primaryButton: {
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
    errorText: {
        ...dealerTheme.typography.caption,
        color: dealerTheme.colors.danger,
        marginBottom: dealerTheme.spacing.sm,
    },
});

