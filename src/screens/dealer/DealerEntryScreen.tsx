import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/types';
import { dealerTheme } from '../../theme/dealerTheme';
import { useAuthStore, useDealerStore } from '../../store';

type DealerEntryScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'DealerEntry'>;
};

const routeByVerification = (status: string, navigation: NativeStackNavigationProp<RootStackParamList, 'DealerEntry'>) => {
    if (status === 'approved') {
        navigation.reset({ index: 0, routes: [{ name: 'DealerTabs' }] });
        return;
    }
    if (status === 'pending') {
        navigation.reset({ index: 0, routes: [{ name: 'DealerKycPending' }] });
        return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'DealerKycUpload' }] });
};

export const DealerEntryScreen: React.FC<DealerEntryScreenProps> = ({ navigation }) => {
    const { fetchMe, error } = useDealerStore();
    const { logout } = useAuthStore();
    const [bootstrapping, setBootstrapping] = React.useState(true);

    const bootstrap = React.useCallback(async () => {
        setBootstrapping(true);
        const me = await fetchMe();
        if (!me) {
            setBootstrapping(false);
            return;
        }
        routeByVerification(String(me.verification_status || 'unverified'), navigation);
    }, [fetchMe, navigation]);

    useEffect(() => {
        bootstrap();
    }, [bootstrap]);

    if (bootstrapping) {
        return (
            <View style={styles.container}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>DEALER PORTAL</Text>
                </View>
                <Text style={styles.title}>Setting up your dealer workspace</Text>
                <Text style={styles.subtitle}>Checking KYC status and syncing pricing access.</Text>
                <ActivityIndicator color={dealerTheme.colors.dealerAccent} size="large" style={{ marginTop: dealerTheme.spacing.lg }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>DEALER PORTAL</Text>
            </View>
            <Text style={styles.title}>Unable to load dealer profile</Text>
            <Text style={styles.subtitle}>{error || 'Please check your connection and try again.'}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={bootstrap}>
                <Text style={styles.primaryBtnText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={logout}>
                <Text style={styles.secondaryBtnText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: dealerTheme.spacing.xl,
        backgroundColor: dealerTheme.colors.dealerDark,
    },
    badge: {
        borderRadius: dealerTheme.radius.full,
        backgroundColor: '#17344A',
        borderWidth: 1,
        borderColor: '#2A4E69',
        paddingHorizontal: 14,
        paddingVertical: 5,
        marginBottom: dealerTheme.spacing.md,
    },
    badgeText: {
        ...dealerTheme.typography.caption,
        color: dealerTheme.colors.dealerAccent,
        letterSpacing: 1,
    },
    title: {
        ...dealerTheme.typography.h1,
        color: dealerTheme.colors.textOnDark,
        textAlign: 'center',
    },
    subtitle: {
        ...dealerTheme.typography.body,
        color: '#B6C6D3',
        textAlign: 'center',
        marginTop: dealerTheme.spacing.sm,
    },
    primaryBtn: {
        marginTop: dealerTheme.spacing.lg,
        backgroundColor: dealerTheme.colors.dealerPrimary,
        borderRadius: dealerTheme.radius.md,
        paddingVertical: dealerTheme.spacing.sm,
        paddingHorizontal: dealerTheme.spacing.xl,
    },
    primaryBtnText: {
        ...dealerTheme.typography.button,
        color: dealerTheme.colors.textOnPrimary,
    },
    secondaryBtn: {
        marginTop: dealerTheme.spacing.sm,
        borderWidth: 1,
        borderColor: '#2A4E69',
        borderRadius: dealerTheme.radius.md,
        paddingVertical: dealerTheme.spacing.sm,
        paddingHorizontal: dealerTheme.spacing.xl,
    },
    secondaryBtnText: {
        ...dealerTheme.typography.button,
        color: dealerTheme.colors.textOnDark,
    },
});
