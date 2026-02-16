import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AgentKycDocType, RootStackParamList } from '../../models/types';
import { agentTheme } from '../../theme/agentTheme';
import { AgentButton, AgentCard, AgentChip, AgentScreen, AgentSectionHeader } from '../../components/agent';
import { useAgentStore } from '../../store';
import { agentService } from '../../services/agentService';
import { showAgentToast } from '../../utils/agentToast';

type AgentKycUploadScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'AgentKycUpload'>;
};

const DOC_LABELS: Record<AgentKycDocType, string> = {
    aadhaar: 'Aadhaar',
    pan: 'PAN',
    driving_license: 'Driving License',
    selfie: 'Selfie',
    other: 'Other',
};

const stepDone = (currentStep: number, step: number) => currentStep > step;

export const AgentKycUploadScreen: React.FC<AgentKycUploadScreenProps> = ({ navigation }) => {
    const [docType, setDocType] = useState<AgentKycDocType>('aadhaar');
    const [documents, setDocuments] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [step, setStep] = useState(1);

    const { uploadKyc, loading, error } = useAgentStore();
    const supportedDocTypes = useMemo(() => agentService.getSupportedDocTypes(), []);

    const pickDocuments = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showAgentToast('Please allow photo access to upload KYC documents.');
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
            showAgentToast('Pick at least one image to continue.');
            return;
        }

        const formData = new FormData();
        formData.append('doc_type', docType);

        documents.forEach((asset, index) => {
            formData.append('documents', {
                uri: asset.uri,
                name: asset.fileName || `agent-kyc-${Date.now()}-${index}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            } as any);
        });

        const success = await uploadKyc(formData);
        if (!success) return;

        showAgentToast('KYC submitted successfully.');
        navigation.reset({ index: 0, routes: [{ name: 'AgentKycPending' }] });
    };

    return (
        <AgentScreen dark>
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

                <AgentCard>
                    <AgentSectionHeader title="Step 1" subtitle="Select document type" />
                    <View style={styles.chipsWrap}>
                        {supportedDocTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => {
                                    setDocType(type);
                                    setStep(2);
                                }}
                            >
                                <AgentChip label={DOC_LABELS[type]} tone={docType === type ? 'dark' : 'default'} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </AgentCard>

                <AgentCard>
                    <AgentSectionHeader title="Step 2" subtitle="Pick clear images" />
                    <Text style={styles.metaText}>Selected: {documents.length} file(s)</Text>
                    <AgentButton title="Choose Images" variant="secondary" onPress={pickDocuments} />

                    {documents.length > 0 ? (
                        <View style={styles.fileList}>
                            {documents.map((file, index) => (
                                <Text key={`${file.uri}-${index}`} style={styles.fileItem} numberOfLines={1}>
                                    {index + 1}. {file.fileName || file.uri.split('/').pop() || 'Document image'}
                                </Text>
                            ))}
                        </View>
                    ) : null}
                </AgentCard>

                <AgentCard>
                    <AgentSectionHeader title="Step 3" subtitle="Submit for review" />
                    <Text style={styles.metaText}>Document type: {DOC_LABELS[docType]}</Text>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <AgentButton title="Submit KYC" onPress={submit} loading={loading.kyc} />
                </AgentCard>
            </ScrollView>
        </AgentScreen>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: agentTheme.spacing.lg,
        gap: agentTheme.spacing.md,
    },
    pageTitle: {
        ...agentTheme.typography.h1,
        color: agentTheme.colors.textOnDark,
    },
    pageSubtitle: {
        ...agentTheme.typography.bodySmall,
        color: '#B4BFCA',
        marginTop: 2,
        marginBottom: agentTheme.spacing.sm,
    },
    stepRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: agentTheme.spacing.sm,
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
        borderColor: agentTheme.colors.agentPrimary,
        backgroundColor: '#3A2B0A',
    },
    stepCircleDone: {
        borderColor: agentTheme.colors.agentPrimary,
        backgroundColor: agentTheme.colors.agentPrimary,
    },
    stepNumber: {
        ...agentTheme.typography.caption,
        color: '#FFF4DE',
    },
    stepText: {
        ...agentTheme.typography.caption,
        color: '#A9B5C1',
        marginTop: 6,
    },
    chipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: agentTheme.spacing.sm,
        marginTop: agentTheme.spacing.sm,
    },
    metaText: {
        ...agentTheme.typography.bodySmall,
        color: agentTheme.colors.textSecondary,
        marginTop: agentTheme.spacing.sm,
        marginBottom: agentTheme.spacing.sm,
    },
    fileList: {
        marginTop: agentTheme.spacing.sm,
        padding: agentTheme.spacing.sm,
        borderRadius: agentTheme.radius.md,
        backgroundColor: agentTheme.colors.agentSurfaceAlt,
    },
    fileItem: {
        ...agentTheme.typography.caption,
        color: agentTheme.colors.textSecondary,
        marginBottom: 4,
    },
    errorText: {
        ...agentTheme.typography.caption,
        color: agentTheme.colors.danger,
        marginBottom: agentTheme.spacing.sm,
    },
});
