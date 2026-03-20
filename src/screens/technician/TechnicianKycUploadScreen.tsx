import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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

const stepDone = (currentStep: number, step: number) => currentStep > step;

export const TechnicianKycUploadScreen: React.FC<TechnicianKycUploadScreenProps> = ({ navigation }) => {
    const [docType, setDocType] = useState<TechnicianKycDocType>('aadhaar');
    const [documents, setDocuments] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [step, setStep] = useState(1);

    const { uploadKyc, loading, error } = useTechnicianStore();
    const supportedDocTypes = useMemo(() => technicianService.getSupportedDocTypes(), []);

    const pickDocuments = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showTechnicianToast('Please allow photo access to upload KYC documents.');
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
            setStep(3);
        }
    };

    const submit = async () => {
        if (documents.length === 0) {
            showTechnicianToast('Pick at least one image to continue.');
            return;
        }

        const formData = new FormData();
        formData.append('doc_type', docType);

        documents.forEach((asset, index) => {
            formData.append('documents', {
                uri: asset.uri,
                name: asset.fileName || `technician-kyc-${Date.now()}-${index}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            } as any);
        });

        const success = await uploadKyc(formData);
        if (!success) return;

        showTechnicianToast('KYC submitted successfully.');
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
                    <TechnicianSectionHeader title="Step 1" subtitle="Select document type" />
                    <View style={styles.chipsWrap}>
                        {supportedDocTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => {
                                    setDocType(type);
                                    setStep(2);
                                }}
                            >
                                <TechnicianChip label={DOC_LABELS[type]} tone={docType === type ? 'dark' : 'default'} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </TechnicianCard>

                <TechnicianCard>
                    <TechnicianSectionHeader title="Step 2" subtitle="Pick clear images" />
                    <Text style={styles.metaText}>Selected: {documents.length} file(s)</Text>
                    <TechnicianButton title="Choose Images" variant="secondary" onPress={pickDocuments} />

                    {documents.length > 0 ? (
                        <View style={styles.fileList}>
                            {documents.map((file, index) => (
                                <Text key={`${file.uri}-${index}`} style={styles.fileItem} numberOfLines={1}>
                                    {index + 1}. {file.fileName || file.uri.split('/').pop() || 'Document image'}
                                </Text>
                            ))}
                        </View>
                    ) : null}
                </TechnicianCard>

                <TechnicianCard>
                    <TechnicianSectionHeader title="Step 3" subtitle="Submit for review" />
                    <Text style={styles.metaText}>Document type: {DOC_LABELS[docType]}</Text>
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
        marginBottom: technicianTheme.spacing.sm,
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
