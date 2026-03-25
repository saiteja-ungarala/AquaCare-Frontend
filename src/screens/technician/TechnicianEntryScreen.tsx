import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/types';
import { technicianTheme } from '../../theme/technicianTheme';
import { TechnicianScreen } from '../../components/technician';
import { useTechnicianStore } from '../../store';

type TechnicianEntryScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'TechnicianEntry'>;
};

export const TechnicianEntryScreen: React.FC<TechnicianEntryScreenProps> = ({ navigation }) => {
    const { fetchMe } = useTechnicianStore();

    useEffect(() => {
        const bootstrap = async () => {
            const payload = await fetchMe();
            if (!payload) return;

            const status = payload.profile.verification_status;

            if (status === 'approved') {
                navigation.reset({ index: 0, routes: [{ name: 'TechnicianTabs' }] });
                return;
            }

            if (status === 'pending' || status === 'rejected' || status === 'suspended') {
                navigation.reset({ index: 0, routes: [{ name: 'TechnicianKycPending' }] });
                return;
            }

            // 'unverified' or unknown — go to upload
            navigation.reset({ index: 0, routes: [{ name: 'TechnicianKycUpload' }] });
        };

        bootstrap();
    }, [fetchMe, navigation]);

    return (
        <TechnicianScreen dark>
            <View style={styles.container}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>TECHNICIAN</Text>
                </View>
                <Text style={styles.title}>Preparing your field dashboard</Text>
                <Text style={styles.subtitle}>Checking verification and syncing active jobs.</Text>
                <ActivityIndicator color={technicianTheme.colors.agentPrimary} size="large" style={{ marginTop: technicianTheme.spacing.lg }} />
            </View>
        </TechnicianScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: technicianTheme.spacing.xl,
    },
    badge: {
        borderRadius: technicianTheme.radius.full,
        backgroundColor: '#1A2E46',
        borderWidth: 1,
        borderColor: '#2A445F',
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginBottom: technicianTheme.spacing.md,
    },
    badgeText: {
        ...technicianTheme.typography.caption,
        color: technicianTheme.colors.agentPrimary,
        letterSpacing: 1,
    },
    title: {
        ...technicianTheme.typography.h1,
        color: technicianTheme.colors.textOnDark,
        textAlign: 'center',
    },
    subtitle: {
        ...technicianTheme.typography.body,
        color: '#AEB9C4',
        textAlign: 'center',
        marginTop: technicianTheme.spacing.sm,
    },
});
