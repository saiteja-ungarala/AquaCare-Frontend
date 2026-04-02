// Profile Screen — Premium design with enhanced visuals

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    Modal,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, typography, borderRadius } from '../../theme/theme';
import { customerColors } from '../../theme/customerTheme';
import { useAuthStore } from '../../store';
import { profileService, AccountDeletionOtpSession } from '../../services/profileService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProfileScreenProps = { navigation: NativeStackNavigationProp<any> };

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress, danger }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.menuIcon, danger && { backgroundColor: colors.error + '12' }]}>
            <Ionicons name={icon} size={20} color={danger ? colors.error : customerColors.primary} />
        </View>
        <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, danger && { color: colors.error }]} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={styles.menuSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        <View style={styles.menuArrow}>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
    </TouchableOpacity>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuthStore();
    const [referralCode, setReferralCode] = useState(user?.referralCode || '');
    const [profileName, setProfileName] = useState(user?.name || 'User');
    const [profilePhone, setProfilePhone] = useState(user?.phone || '');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteSession, setDeleteSession] = useState<AccountDeletionOtpSession | null>(null);
    const [deleteOtp, setDeleteOtp] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteStep, setDeleteStep] = useState<'intro' | 'otp' | 'success'>('intro');
    const [deleteError, setDeleteError] = useState('');
    const [deleteInfo, setDeleteInfo] = useState('');
    const [deleteResendTimer, setDeleteResendTimer] = useState(30);

    useFocusEffect(useCallback(() => {
        let isActive = true;

        profileService.getProfile()
            .then((p) => {
                if (!isActive || !p) return;

                setReferralCode(p.referral_code || '');
                setProfileName(p.full_name || 'User');
                setProfilePhone(p.phone || '');
                useAuthStore.setState((s) => ({
                    user: s.user ? {
                        ...s.user,
                        name: p.full_name,
                        phone: p.phone,
                        referralCode: p.referral_code,
                    } : s.user,
                }));
            })
            .catch((error) => {
                console.error('[ProfileScreen] Failed to load profile on focus:', error);
            });

        return () => {
            isActive = false;
        };
    }, []));

    useEffect(() => {
        if (!deleteModalVisible || deleteStep !== 'otp' || deleteResendTimer <= 0) {
            return;
        }

        const timeout = setTimeout(() => setDeleteResendTimer((prev) => prev - 1), 1000);
        return () => clearTimeout(timeout);
    }, [deleteModalVisible, deleteStep, deleteResendTimer]);

    const handleCopyReferral = async () => {
        if (!referralCode) return;
        await Clipboard.setStringAsync(referralCode);
        Alert.alert('Copied!', 'Referral code copied to clipboard');
    };

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('Are you sure you want to logout?');
            if (confirmed) {
                void logout();
            }
        } else {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => void logout() },
            ]);
        }
    };

    const resetDeleteFlow = () => {
        setDeleteSession(null);
        setDeleteOtp('');
        setDeleteStep('intro');
        setDeleteError('');
        setDeleteInfo('');
        setDeleteResendTimer(30);
    };

    const openDeleteModal = () => {
        resetDeleteFlow();
        setDeleteModalVisible(true);
    };

    const closeDeleteModal = () => {
        if (deleteLoading) return;
        setDeleteModalVisible(false);
        resetDeleteFlow();
    };

    const handleStartDeleteFlow = async () => {
        setDeleteLoading(true);
        setDeleteError('');
        setDeleteInfo('');

        try {
            const session = await profileService.initiateAccountDeletion();
            setDeleteSession(session);
            setDeleteStep('otp');
            setDeleteInfo(`We sent a 6-digit OTP to ${session.maskedEmail}.`);
            setDeleteResendTimer(30);
        } catch (error: any) {
            setDeleteError(error?.message || 'Unable to start account deletion right now.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleResendDeleteOtp = async () => {
        if (!deleteSession || deleteLoading || deleteResendTimer > 0) return;

        setDeleteLoading(true);
        setDeleteError('');
        setDeleteInfo('');

        try {
            const session = await profileService.resendAccountDeletionOtp(deleteSession.sessionToken);
            setDeleteSession(session);
            setDeleteInfo(`A fresh OTP was sent to ${session.maskedEmail}.`);
            setDeleteResendTimer(30);
        } catch (error: any) {
            setDeleteError(error?.message || 'Unable to resend OTP right now.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteSession || deleteLoading) return;
        if (deleteOtp.trim().length !== 6) {
            setDeleteError('Enter the 6-digit OTP from your email.');
            return;
        }

        setDeleteLoading(true);
        setDeleteError('');
        setDeleteInfo('');

        try {
            await profileService.confirmAccountDeletion(deleteSession.sessionToken, deleteOtp.trim());
            setDeleteStep('success');
            setDeleteInfo('Your account has been deleted. Signing you out...');
            setTimeout(() => {
                void logout();
            }, 900);
        } catch (error: any) {
            setDeleteError(error?.message || 'Unable to delete account right now.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[customerColors.primary, customerColors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + spacing.md }]}
            >
                <Ionicons name="person" size={120} color="rgba(255,255,255,0.1)" style={styles.headerIconBg} />
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={colors.textOnPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>My Profile</Text>
                        <Text style={styles.headerSubtitle}>Manage your account & settings</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.profileCard}>
                    <LinearGradient
                        colors={[customerColors.primaryLight, '#FFFFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.profileGradient}
                    >
                        <View style={styles.profileRow}>
                            <View style={styles.avatar}>
                                <LinearGradient
                                    colors={[customerColors.primary, customerColors.primaryDark]}
                                    style={styles.avatarGradient}
                                >
                                    <Text style={styles.avatarLetter}>
                                        {profileName.charAt(0).toUpperCase()}
                                    </Text>
                                </LinearGradient>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName} numberOfLines={1}>{profileName}</Text>
                                <Text style={styles.profileEmail} numberOfLines={1}>{user?.email}</Text>
                                <Text style={styles.profilePhone} numberOfLines={1}>{profilePhone}</Text>
                            </View>
                            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
                                <Ionicons name="pencil" size={16} color={customerColors.primary} />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>

                <TouchableOpacity style={styles.referralCard} onPress={handleCopyReferral} activeOpacity={0.7}>
                    <View style={styles.referralAccent} />
                    <View style={styles.referralInner}>
                        <View>
                            <Text style={styles.referralTitle}>Refer & Earn</Text>
                            <Text style={styles.referralSubtitle}>Share your code</Text>
                        </View>
                        <View style={styles.codeContainer}>
                            <Text style={styles.referralCode}>{referralCode || '...'}</Text>
                            <View style={styles.copyIcon}>
                                <Ionicons name="copy-outline" size={16} color="#7FA650" />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="wallet-outline"
                            title="My Wallet"
                            subtitle="Balance, Earnings, History"
                            onPress={() => navigation.navigate('Wallet')}
                        />
                        <MenuItem
                            icon="receipt-outline"
                            title="Order History"
                            subtitle="Purchased products & delivery status"
                            onPress={() => navigation.navigate('OrderHistory', { enableBack: true })}
                        />
                        <MenuItem icon="location-outline" title="Addresses" subtitle="Manage delivery addresses" onPress={() => navigation.navigate('Addresses')} />
                        <MenuItem icon="card-outline" title="Payment Methods" subtitle="Cash on Delivery & upcoming options" onPress={() => navigation.navigate('PaymentMethods')} />
                        <MenuItem icon="notifications-outline" title="Notifications" subtitle="Manage preferences" onPress={() => navigation.navigate('Notifications')} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SUPPORT</Text>
                    <View style={styles.menuCard}>
                        <MenuItem icon="help-circle-outline" title="Help & FAQ" onPress={() => navigation.navigate('HelpFAQ')} />
                        <MenuItem icon="chatbubble-outline" title="Contact Us" onPress={() => navigation.navigate('ContactUs')} />
                        <MenuItem icon="document-text-outline" title="Terms & Conditions" onPress={() => navigation.navigate('Terms')} />
                        <MenuItem icon="shield-outline" title="Privacy Policy" onPress={() => navigation.navigate('Privacy')} />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="trash-outline"
                            title="Delete Account"
                            subtitle="Permanently remove your profile with email OTP confirmation"
                            onPress={openDeleteModal}
                            danger
                        />
                        <MenuItem icon="log-out-outline" title="Logout" onPress={handleLogout} danger />
                    </View>
                </View>

                <Text style={styles.version}>Version 1.0.0</Text>
            </ScrollView>

            <Modal visible={deleteModalVisible} transparent animationType="slide" onRequestClose={closeDeleteModal}>
                <View style={styles.deleteModalOverlay}>
                    <View style={styles.deleteModalCard}>
                        <View style={styles.deleteHandle} />
                        <View style={styles.deleteHeader}>
                            <View style={styles.deleteHeaderIcon}>
                                <Ionicons
                                    name={deleteStep === 'success' ? 'checkmark-circle' : 'warning-outline'}
                                    size={26}
                                    color={deleteStep === 'success' ? customerColors.success : colors.error}
                                />
                            </View>
                            <View style={styles.deleteHeaderContent}>
                                <Text style={styles.deleteTitle}>
                                    {deleteStep === 'success' ? 'Account Deleted' : 'Delete Account'}
                                </Text>
                                <Text style={styles.deleteSubtitle}>
                                    {deleteStep === 'intro'
                                        ? 'This permanently removes your profile access from the app.'
                                        : deleteStep === 'otp'
                                            ? `Enter the OTP sent to ${deleteSession?.maskedEmail || user?.email || 'your email'}.`
                                            : 'Your profile has been removed successfully.'}
                                </Text>
                            </View>
                            {deleteStep !== 'success' ? (
                                <TouchableOpacity onPress={closeDeleteModal} disabled={deleteLoading}>
                                    <Ionicons name="close" size={24} color={colors.textMuted} />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {deleteStep === 'intro' ? (
                            <View>
                                <View style={styles.deleteWarningBox}>
                                    <Text style={styles.deleteWarningTitle}>Before you continue</Text>
                                    <Text style={styles.deleteWarningText}>You will lose access to your profile, saved addresses, order history view, and future app access with this account.</Text>
                                    <Text style={styles.deleteWarningText}>For security, we will send a verification OTP to your registered email before deletion.</Text>
                                </View>

                                {deleteError ? <Text style={styles.deleteErrorText}>{deleteError}</Text> : null}

                                <TouchableOpacity
                                    style={[styles.deletePrimaryButton, deleteLoading && styles.deletePrimaryButtonDisabled]}
                                    onPress={handleStartDeleteFlow}
                                    disabled={deleteLoading}
                                    activeOpacity={0.85}
                                >
                                    {deleteLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
                                            <Text style={styles.deletePrimaryButtonText}>Send Email OTP</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : deleteStep === 'otp' ? (
                            <View>
                                <View style={styles.deleteOtpBox}>
                                    <Text style={styles.deleteOtpLabel}>Email OTP</Text>
                                    <TextInput
                                        style={styles.deleteOtpInput}
                                        value={deleteOtp}
                                        onChangeText={(text) => {
                                            setDeleteOtp(text.replace(/\D/g, '').slice(0, 6));
                                            if (deleteError) {
                                                setDeleteError('');
                                            }
                                        }}
                                        placeholder="Enter 6-digit OTP"
                                        placeholderTextColor={colors.textMuted}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        editable={!deleteLoading}
                                    />
                                </View>

                                {deleteInfo ? <Text style={styles.deleteInfoText}>{deleteInfo}</Text> : null}
                                {deleteError ? <Text style={styles.deleteErrorText}>{deleteError}</Text> : null}

                                <TouchableOpacity
                                    style={[styles.deletePrimaryButton, deleteLoading && styles.deletePrimaryButtonDisabled]}
                                    onPress={handleConfirmDelete}
                                    disabled={deleteLoading}
                                    activeOpacity={0.85}
                                >
                                    {deleteLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                                            <Text style={styles.deletePrimaryButtonText}>Verify & Delete</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.deleteSecondaryButton}
                                    onPress={handleResendDeleteOtp}
                                    disabled={deleteLoading || deleteResendTimer > 0}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.deleteSecondaryButtonText}>
                                        {deleteResendTimer > 0 ? `Resend OTP in ${deleteResendTimer}s` : 'Resend OTP'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.deleteSuccessBox}>
                                <Ionicons name="checkmark-circle" size={56} color={customerColors.success} />
                                <Text style={styles.deleteSuccessText}>{deleteInfo}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F8FA' },
    header: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxxl,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    headerIconBg: {
        position: 'absolute',
        right: -20,
        bottom: -20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 32,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.xs,
        marginLeft: -spacing.sm,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        ...typography.headerTitle,
        color: colors.textOnPrimary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginTop: 2,
    },
    scrollView: { flex: 1, padding: spacing.md },
    profileCard: {
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: spacing.md,
        shadowColor: 'rgba(0, 184, 217, 0.12)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 3,
        backgroundColor: '#FFFFFF',
    },
    profileGradient: {
        padding: spacing.lg,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
        marginRight: spacing.md,
    },
    avatarGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLetter: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    profileInfo: {
        flex: 1,
        flexShrink: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 2,
        fontWeight: '500',
    },
    profilePhone: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    editButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 124, 145, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    referralCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: spacing.md,
        overflow: 'hidden',
        shadowColor: 'rgba(127, 166, 80, 0.15)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 3,
    },
    referralAccent: {
        height: 3,
        backgroundColor: customerColors.primaryDark,
    },
    referralInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
    },
    referralTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: customerColors.primaryDark,
        marginBottom: 2,
    },
    referralSubtitle: {
        fontSize: 12,
        color: customerColors.textSecondary,
        fontWeight: '500',
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: 'rgba(0, 124, 145, 0.05)',
        paddingVertical: spacing.xs + 2,
        paddingHorizontal: spacing.sm + 2,
        borderRadius: 10,
    },
    referralCode: {
        fontSize: 14,
        fontWeight: '700',
        color: customerColors.primaryDark,
    },
    copyIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 124, 145, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: { marginTop: spacing.md },
    sectionTitle: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.xs,
        textTransform: 'uppercase',
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    menuCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        paddingVertical: spacing.md + 2,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F7F9',
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 124, 145, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    menuContent: {
        flex: 1,
        flexShrink: 1,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    menuArrow: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#F5F7F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.xs,
    },
    version: {
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
        marginVertical: spacing.xl,
        fontWeight: '500',
    },
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.42)',
        justifyContent: 'flex-end',
    },
    deleteModalCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    deleteHandle: {
        alignSelf: 'center',
        width: 44,
        height: 5,
        borderRadius: 999,
        backgroundColor: colors.border,
        marginBottom: spacing.md,
    },
    deleteHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    deleteHeaderIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.error + '12',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    deleteHeaderContent: {
        flex: 1,
    },
    deleteTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: 4,
    },
    deleteSubtitle: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    deleteWarningBox: {
        backgroundColor: '#FFF5F5',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.error + '20',
        marginBottom: spacing.lg,
    },
    deleteWarningTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    deleteWarningText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: spacing.xs,
    },
    deletePrimaryButton: {
        backgroundColor: colors.error,
        borderRadius: borderRadius.lg,
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    deletePrimaryButtonDisabled: {
        opacity: 0.75,
    },
    deletePrimaryButtonText: {
        ...typography.body,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    deleteOtpBox: {
        marginBottom: spacing.md,
    },
    deleteOtpLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    deleteOtpInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 6,
    },
    deleteInfoText: {
        ...typography.bodySmall,
        color: customerColors.primary,
        marginBottom: spacing.sm,
    },
    deleteErrorText: {
        ...typography.bodySmall,
        color: colors.error,
        marginBottom: spacing.sm,
    },
    deleteSecondaryButton: {
        alignSelf: 'center',
        marginTop: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    deleteSecondaryButtonText: {
        ...typography.bodySmall,
        color: customerColors.primary,
        fontWeight: '700',
    },
    deleteSuccessBox: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        gap: spacing.md,
    },
    deleteSuccessText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
