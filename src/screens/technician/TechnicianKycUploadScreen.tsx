import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TechnicianKycDocType, RootStackParamList } from '../../models/types';
import { technicianTheme } from '../../theme/technicianTheme';
import { TechnicianButton, TechnicianCard, TechnicianChip, TechnicianScreen, TechnicianSectionHeader } from '../../components/technician';
import { useTechnicianStore } from '../../store';
import { technicianService } from '../../services/technicianService';
import { showTechnicianToast } from '../../utils/technicianToast';

type TechnicianKycUploadScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'TechnicianKycUpload'>;
};

const DOC_LABELS: Record<TechnicianKycDocType, string> = {
    aadhaar: 'Aadhaar',
    pan: 'PAN',
    driving_license: 'Driving License',
    selfie: 'Selfie',
    other: 'Other',
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENTS = 5;
const SUPPORTED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const SUPPORTED_FILE_HINT = 'PDF, JPG, or PNG up to 5MB each';

const stepDone = (currentStep: number, step: number) => currentStep > step;

const formatFileSize = (size?: number): string => {
    if (!size || size <= 0) return '';
    return `${(size / (1024 * 1024)).toFixed(size >= 1024 * 1024 ? 1 : 2)} MB`;
};

const isSupportedAsset = (asset: DocumentPicker.DocumentPickerAsset): boolean => {
    if (!asset.mimeType) return true;
    return SUPPORTED_MIME_TYPES.has(asset.mimeType);
};

const toUploadName = (asset: DocumentPicker.DocumentPickerAsset, index: number): string => {
    if (asset.name?.trim()) return asset.name.trim();
    if (asset.mimeType === 'application/pdf') return `technician-kyc-${Date.now()}-${index}.pdf`;
    if (asset.mimeType === 'image/png') return `technician-kyc-${Date.now()}-${index}.png`;
    return `technician-kyc-${Date.now()}-${index}.jpg`;
};

const appendDocumentToFormData = async (
    formData: FormData,
    asset: DocumentPicker.DocumentPickerAsset,
    index: number
) => {
    if (Platform.OS === 'web') {
        if (asset.file) {
            formData.append('documents', asset.file);
            return;
        }

        const response = await fetch(asset.uri);
        const blob = await response.blob();
        formData.append('documents', blob as any, toUploadName(asset, index));
        return;
    }

    formData.append('documents', {
        uri: asset.uri,
        name: toUploadName(asset, index),
        type: asset.mimeType || 'application/octet-stream',
    } as any);
};

export const TechnicianKycUploadScreen: React.FC<TechnicianKycUploadScreenProps> = ({ navigation }) => {
    const [docType, setDocType] = useState<TechnicianKycDocType | null>(null);
    const [documents, setDocuments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);

    const { uploadKyc, loading, error } = useTechnicianStore();
    const supportedDocTypes = useMemo(() => technicianService.getSupportedDocTypes(), []);
    const step = documents.length > 0 ? 3 : docType ? 2 : 1;

    const pickDocuments = async () => {
        if (!docType) {
            showTechnicianToast('Select a document type first.');
            return;
        }

        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*'],
            copyToCacheDirectory: true,
            multiple: true,
            base64: false,
        });

        if (result.canceled || !result.assets?.length) {
            return;
        }

        if (result.assets.length > MAX_DOCUMENTS) {
            showTechnicianToast(`Please upload up to ${MAX_DOCUMENTS} files only.`);
            return;
        }

        const oversizedFile = result.assets.find((asset) => (asset.size || 0) > MAX_FILE_SIZE_BYTES);
        if (oversizedFile) {
            showTechnicianToast(`"${oversizedFile.name}" is larger than 5MB. Please choose a smaller file.`);
            return;
        }

        const unsupportedFile = result.assets.find((asset) => !isSupportedAsset(asset));
        if (unsupportedFile) {
            showTechnicianToast(`"${unsupportedFile.name}" is not supported. Upload ${SUPPORTED_FILE_HINT}.`);
            return;
        }

        setDocuments(result.assets);
    };

    const submit = async () => {
        if (!docType) {
            showTechnicianToast('Select a document type to continue.');
            return;
        }

        if (documents.length === 0) {
            showTechnicianToast('Upload at least one document to continue.');
            return;
        }

        const formData = new FormData();
        formData.append('doc_type', docType);

        try {
            for (const [index, asset] of documents.entries()) {
                await appendDocumentToFormData(formData, asset, index);
            }
        } catch {
            showTechnicianToast('We could not prepare those files for upload. Please choose them again.');
            return;
        }

        const success = await uploadKyc(formData);
        if (!success) return;

        showTechnicianToast('Application submitted. Our team will review it within 24 hours.');
        navigation.reset({ index: 0, routes: [{ name: 'TechnicianKycPending' }] });
    };

    return (
        <TechnicianScreen dark>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.pageTitle}>KYC Verification</Text>
                <Text style={styles.pageSubtitle}>Complete all 3 steps to activate your technician account.</Text>

                <View style={styles.stepRow}>
                    {[1, 2, 3].map((item) => (
                        <View key={item} style={styles.stepItem}>
                            <View
                                style={[
                                    styles.stepCircle,
                                    step === item ? styles.stepCircleActive : null,
                                    stepDone(step, item) ? styles.stepCircleDone : null,
                                ]}
                            >
                                <Text style={styles.stepNumber}>{item}</Text>
                            </View>
                            <Text style={styles.stepText}>Step {item}</Text>
                        </View>
                    ))}
                </View>

                <TechnicianCard>
                    <TechnicianSectionHeader title="Step 1" subtitle="Select the document you are submitting" />
                    <View style={styles.chipsWrap}>
                        {supportedDocTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => {
                                    setDocType(type);
                                }}
                            >
                                <TechnicianChip label={DOC_LABELS[type]} tone={docType === type ? 'dark' : 'default'} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.helperText}>You can change the document type anytime before final submission.</Text>
                </TechnicianCard>

                <TechnicianCard>
                    <TechnicianSectionHeader title="Step 2" subtitle="Upload PDF or clear document images" />
                    <Text style={styles.metaText}>Selected: {documents.length} file(s)</Text>
                    <Text style={styles.helperText}>Supported files: {SUPPORTED_FILE_HINT}.</Text>
                    <TechnicianButton
                        title={documents.length > 0 ? 'Replace Documents' : 'Choose Documents'}
                        variant="secondary"
                        onPress={pickDocuments}
                    />

                    {documents.length > 0 ? (
                        <View style={styles.fileList}>
                            {documents.map((file, index) => (
                                <Text key={`${file.uri}-${index}`} style={styles.fileItem} numberOfLines={1}>
                                    {index + 1}. {file.name || file.uri.split('/').pop() || 'Document file'}
                                    {file.size ? ` - ${formatFileSize(file.size)}` : ''}
                                </Text>
                            ))}
                        </View>
                    ) : null}
                </TechnicianCard>

                <TechnicianCard>
                    <TechnicianSectionHeader title="Step 3" subtitle="Submit for review" />
                    <Text style={styles.metaText}>Document type: {docType ? DOC_LABELS[docType] : 'Not selected yet'}</Text>
                    <Text style={styles.helperText}>After submission, our admin team will review your application within 24 hours.</Text>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <TechnicianButton title="Submit KYC" onPress={submit} loading={loading.kyc} />
                </TechnicianCard>
            </ScrollView>
        </TechnicianScreen>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: technicianTheme.spacing.lg,
        gap: technicianTheme.spacing.md,
    },
    pageTitle: {
        ...technicianTheme.typography.h1,
        color: technicianTheme.colors.textOnDark,
    },
    pageSubtitle: {
        ...technicianTheme.typography.bodySmall,
        color: '#B4BFCA',
        marginTop: 2,
        marginBottom: technicianTheme.spacing.sm,
    },
    stepRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: technicianTheme.spacing.sm,
    },
    stepItem: {
        alignItems: 'center',
        flex: 1,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#3C5068',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#11273F',
    },
    stepCircleActive: {
        borderColor: technicianTheme.colors.agentPrimary,
        backgroundColor: '#3A2B0A',
    },
    stepCircleDone: {
        borderColor: technicianTheme.colors.agentPrimary,
        backgroundColor: technicianTheme.colors.agentPrimary,
    },
    stepNumber: {
        ...technicianTheme.typography.caption,
        color: '#FFF4DE',
    },
    stepText: {
        ...technicianTheme.typography.caption,
        color: '#A9B5C1',
        marginTop: 6,
    },
    chipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: technicianTheme.spacing.sm,
        marginTop: technicianTheme.spacing.sm,
    },
    metaText: {
        ...technicianTheme.typography.bodySmall,
        color: technicianTheme.colors.textSecondary,
        marginTop: technicianTheme.spacing.sm,
        marginBottom: technicianTheme.spacing.xs,
    },
    helperText: {
        ...technicianTheme.typography.caption,
        color: technicianTheme.colors.textSecondary,
        marginTop: technicianTheme.spacing.xs,
    },
    fileList: {
        marginTop: technicianTheme.spacing.sm,
        padding: technicianTheme.spacing.sm,
        borderRadius: technicianTheme.radius.md,
        backgroundColor: technicianTheme.colors.agentSurfaceAlt,
    },
    fileItem: {
        ...technicianTheme.typography.caption,
        color: technicianTheme.colors.textSecondary,
        marginBottom: 4,
    },
    errorText: {
        ...technicianTheme.typography.caption,
        color: technicianTheme.colors.danger,
        marginBottom: technicianTheme.spacing.sm,
    },
});
