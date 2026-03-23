import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ImageBackground,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { customerColors } from '../../theme/customerTheme';
import { useAuthStore } from '../../store';
import { OtpChannel, OtpSessionPayload, RootStackParamList } from '../../models/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'OTPVerification'>;
    route: RouteProp<RootStackParamList, 'OTPVerification'>;
};

const OTP_LENGTH = 6;
const RESEND_DELAY = 30;

const blurWebActiveElement = () => {
    if (Platform.OS !== 'web') {
        return;
    }

    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();
};

const getChannelLabel = (channel: OtpChannel): string => {
    switch (channel) {
        case 'email':
            return 'Email';
        case 'sms':
            return 'SMS';
        case 'whatsapp':
            return 'WhatsApp';
        default:
            return 'OTP';
    }
};

const getTargetLabel = (session: OtpSessionPayload): string =>
    session.currentChannel === 'email' ? session.maskedEmail : session.maskedPhone;

const buildTitle = (session: OtpSessionPayload): string => {
    if (session.flow === 'signup' && session.currentChannel === 'email') {
        return 'Verify Your Email';
    }
    if (session.flow === 'signup' && session.currentChannel === 'sms') {
        return 'Verify Your Mobile';
    }
    if (session.flow === 'login' && session.currentChannel === 'sms') {
        return 'Verify SMS OTP';
    }
    if (session.currentChannel === 'whatsapp') {
        return 'Verify WhatsApp OTP';
    }
    return 'Verify Your Login OTP';
};

const buildSubtitle = (session: OtpSessionPayload): string => {
    if (session.flow === 'signup' && session.currentChannel === 'email') {
        return `Enter the 6-digit OTP sent to ${session.maskedEmail}. Email verification is required before mobile verification.`;
    }

    if (session.flow === 'signup' && session.currentChannel === 'sms') {
        return `Email verified. Enter the 6-digit OTP sent by SMS to ${session.maskedPhone}.`;
    }

    if (session.currentChannel === 'whatsapp') {
        return `Enter the 6-digit OTP sent on WhatsApp to ${session.maskedPhone}.`;
    }

    if (session.flow === 'login' && session.currentChannel === 'sms') {
        return `Enter the 6-digit OTP sent by SMS to ${session.maskedPhone}.`;
    }

    return `Enter the 6-digit OTP sent to ${session.maskedEmail}, which is linked to your mobile number ${session.maskedPhone}.`;
};

const buildResendMessage = (session: OtpSessionPayload): string => {
    if (session.currentChannel === 'email') {
        return `A fresh OTP was sent to ${session.maskedEmail}.`;
    }

    if (session.currentChannel === 'sms') {
        return `A fresh OTP was sent by SMS to ${session.maskedPhone}.`;
    }

    return `A fresh OTP was sent on WhatsApp to ${session.maskedPhone}.`;
};

export const OTPVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
    const initialSession = route.params.otpSession;
    const [session, setSession] = useState(initialSession);
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [otpError, setOtpError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [resendTimer, setResendTimer] = useState(RESEND_DELAY);
    const [canResend, setCanResend] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const inputRefs = useRef<(TextInput | null)[]>([]);

    const {
        verifySignupOtp,
        resendSignupOtp,
        verifyLoginOtp,
        resendLoginOtp,
        isLoading,
        selectedRole,
        errorMessage,
        clearError,
        setShowLoginCelebration,
    } = useAuthStore();

    const activeThemeColor =
        selectedRole === 'agent'
            ? colors.accent
            : selectedRole === 'dealer'
                ? colors.info
                : customerColors.primary;

    const isTechnician = selectedRole === 'agent';
    const isCustomLogin = selectedRole === 'customer' || selectedRole === 'agent' || selectedRole === 'dealer';
    const isBusy = isLoading || isSubmitting;
    const currentOtp = digits.join('');
    const canSubmit = currentOtp.length === OTP_LENGTH && !digits.some((digit) => !digit);

    const alternateLoginChannel = useMemo<OtpChannel | null>(() => {
        if (session.flow !== 'login') {
            return null;
        }
        const alternateChannels = session.availableChannels.filter((channel) => channel !== session.currentChannel);
        if (alternateChannels.includes('email')) {
            return 'email';
        }
        if (alternateChannels.includes('whatsapp')) {
            return 'whatsapp';
        }
        return null;
    }, [session.availableChannels, session.currentChannel, session.flow]);

    const alternateLoginEnabled = alternateLoginChannel === 'email'
        || (alternateLoginChannel === 'whatsapp' && session.whatsappAvailable);

    const getBackgroundImage = () => {
        if (selectedRole === 'customer') return require('../../../assets/customer-login.png');
        if (selectedRole === 'agent') return require('../../../assets/technicain-login.jpg');
        if (selectedRole === 'dealer') return require('../../../assets/dealer-login.png');
        return undefined;
    };

    const focusFirstInput = () => {
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    };

    const resetOtpState = (message?: string) => {
        setDigits(Array(OTP_LENGTH).fill(''));
        setOtpError('');
        setInfoMessage(message || '');
        setResendTimer(RESEND_DELAY);
        setCanResend(false);
        focusFirstInput();
    };

    useEffect(() => {
        clearError();
        focusFirstInput();
    }, [clearError]);

    useEffect(() => {
        if (resendTimer <= 0) {
            setCanResend(true);
            return;
        }

        const timeout = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
        return () => clearTimeout(timeout);
    }, [resendTimer]);

    const resolveOtpError = () => useAuthStore.getState().errorMessage || errorMessage || 'Invalid OTP. Please try again.';

    const handleVerificationSuccess = (nextSession?: OtpSessionPayload, message?: string) => {
        if (!nextSession) {
            setShowLoginCelebration(true);
            return;
        }

        setSession(nextSession);
        resetOtpState(message);
    };

    const submitOtp = async (otp: string) => {
        if (!selectedRole || isSubmitting || otp.length !== OTP_LENGTH) {
            return;
        }

        setIsSubmitting(true);
        setOtpError('');
        setInfoMessage('');
        clearError();

        if (session.flow === 'signup') {
            const result = await verifySignupOtp(
                session.sessionToken,
                session.currentChannel as Extract<OtpChannel, 'email' | 'sms'>,
                otp,
                selectedRole,
            );
            setIsSubmitting(false);

            if (!result) {
                setOtpError(resolveOtpError());
                setDigits(Array(OTP_LENGTH).fill(''));
                focusFirstInput();
                return;
            }

            if (result.completed) {
                setShowLoginCelebration(true);
                return;
            }

            const movedToSms = session.currentChannel === 'email' && result.session?.currentChannel === 'sms';
            handleVerificationSuccess(
                result.session,
                movedToSms
                    ? `Email verified. Enter the OTP sent by SMS to ${result.session?.maskedPhone || session.maskedPhone}.`
                    : `${getChannelLabel(session.currentChannel)} OTP verified.`,
            );
            setIsSubmitting(false);
            return;
        }

        const success = await verifyLoginOtp(session.sessionToken, session.currentChannel, otp, selectedRole);
        setIsSubmitting(false);

        if (success) {
            setShowLoginCelebration(true);
            return;
        }

        setOtpError(resolveOtpError());
        setDigits(Array(OTP_LENGTH).fill(''));
        focusFirstInput();
    };

    const handleChange = (text: string, index: number) => {
        const cleaned = text.replace(/\D/g, '').slice(-1);
        const updatedDigits = [...digits];
        updatedDigits[index] = cleaned;
        setDigits(updatedDigits);
        setOtpError('');
        setInfoMessage('');

        if (cleaned && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        if (!canResend || isBusy) {
            return;
        }

        clearError();
        setOtpError('');
        setInfoMessage('');

        const nextSession = session.flow === 'signup'
            ? await resendSignupOtp(session.sessionToken, session.currentChannel as Extract<OtpChannel, 'email' | 'sms'>)
            : await resendLoginOtp(session.sessionToken, session.currentChannel);

        if (!nextSession) {
            setOtpError(useAuthStore.getState().errorMessage || 'Unable to resend OTP right now. Please try again.');
            return;
        }

        setSession(nextSession);
        resetOtpState(buildResendMessage(nextSession));
    };

    const handleAlternateChannel = async () => {
        if (!alternateLoginChannel || isBusy) {
            return;
        }

        clearError();
        setOtpError('');
        setInfoMessage('');

        if (alternateLoginChannel === 'whatsapp' && !session.whatsappAvailable) {
            return;
        }

        const nextSession = await resendLoginOtp(session.sessionToken, alternateLoginChannel);
        if (!nextSession) {
            setOtpError(useAuthStore.getState().errorMessage || 'Unable to switch OTP channel right now. Please try again.');
            return;
        }

        setSession(nextSession);
        resetOtpState(buildResendMessage(nextSession));
    };

    const Wrapper = (isCustomLogin ? ImageBackground : View) as React.ComponentType<any>;
    const wrapperProps = isCustomLogin
        ? { source: getBackgroundImage(), style: styles.backgroundImage, resizeMode: 'cover' as const }
        : { style: styles.container };

    return (
        <Wrapper {...wrapperProps}>
            {isCustomLogin && <View style={styles.overlay} />}
            <SafeAreaView style={isCustomLogin ? styles.safeArea : styles.container}>
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={[styles.backButton, isCustomLogin && styles.glassButton]}
                                onPress={() => {
                                    blurWebActiveElement();
                                    navigation.goBack();
                                }}
                            >
                                <Ionicons name="chevron-back" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.content, isCustomLogin && styles.bottomContent]}>
                            <View style={isCustomLogin ? styles.glassContent : undefined}>
                                <Text style={[styles.title, isTechnician ? { color: colors.surface } : null]}>
                                    {buildTitle(session)}
                                </Text>
                                <Text style={[styles.subtitle, isTechnician ? styles.lightSubtitle : null]}>
                                    {buildSubtitle(session)}
                                </Text>

                                <View style={styles.statusRow}>
                                    <View style={[styles.statusChip, session.verifiedChannels.email && styles.statusChipDone]}>
                                        <Text style={[styles.statusChipText, session.verifiedChannels.email && styles.statusChipTextDone]}>
                                            Email {session.verifiedChannels.email ? 'Verified' : 'Pending'}
                                        </Text>
                                    </View>
                                    {session.flow === 'signup' ? (
                                        <View style={[styles.statusChip, session.verifiedChannels.sms && styles.statusChipDone]}>
                                            <Text style={[styles.statusChipText, session.verifiedChannels.sms && styles.statusChipTextDone]}>
                                                SMS {session.verifiedChannels.sms ? 'Verified' : 'Pending'}
                                            </Text>
                                        </View>
                                    ) : (
                                        <View style={styles.statusChip}>
                                            <Text style={styles.statusChipText}>{getChannelLabel(session.currentChannel)} OTP</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.deliveryCard}>
                                    <Ionicons
                                        name={session.currentChannel === 'email' ? 'mail-outline' : session.currentChannel === 'whatsapp' ? 'logo-whatsapp' : 'chatbubble-ellipses-outline'}
                                        size={20}
                                        color={activeThemeColor}
                                    />
                                    <View style={styles.deliveryContent}>
                                        <Text style={styles.deliveryLabel}>{getChannelLabel(session.currentChannel)} destination</Text>
                                        <Text style={styles.deliveryValue}>{getTargetLabel(session)}</Text>
                                    </View>
                                </View>

                                <View style={styles.otpRow}>
                                    {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => {
                                                inputRefs.current[index] = ref;
                                            }}
                                            style={[
                                                styles.otpBox,
                                                digits[index] ? { borderColor: activeThemeColor } : undefined,
                                                otpError ? { borderColor: colors.error } : undefined,
                                                isCustomLogin ? styles.otpBoxGlass : undefined,
                                            ]}
                                            value={digits[index]}
                                            onChangeText={(text) => handleChange(text, index)}
                                            onKeyPress={(e) => handleKeyPress(e, index)}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            textAlign="center"
                                            selectTextOnFocus
                                            editable={!isBusy}
                                        />
                                    ))}
                                </View>

                                {otpError ? (
                                    <Text style={styles.otpError}>{otpError}</Text>
                                ) : null}

                                {infoMessage ? (
                                    <Text style={[styles.infoMessage, { color: activeThemeColor }]}>
                                        {infoMessage}
                                    </Text>
                                ) : null}

                                {isBusy ? (
                                    <ActivityIndicator
                                        style={styles.loader}
                                        color={activeThemeColor}
                                        size="small"
                                    />
                                ) : null}

                                <Button
                                    title={session.flow === 'signup' && session.currentChannel === 'sms' ? 'Complete Signup' : 'Verify OTP'}
                                    onPress={() => void submitOtp(currentOtp)}
                                    disabled={!canSubmit || isBusy}
                                    fullWidth
                                    style={{ backgroundColor: activeThemeColor, shadowColor: activeThemeColor }}
                                />

                                <View style={styles.resendRow}>
                                    <Text style={[styles.resendLabel, isTechnician ? styles.lightSubtitle : null]}>
                                        Didn't receive the code?{' '}
                                    </Text>
                                    <TouchableOpacity onPress={handleResend} disabled={!canResend || isBusy}>
                                        <Text style={[
                                            styles.resendBtn,
                                            { color: canResend ? activeThemeColor : colors.textMuted },
                                        ]}>
                                            {canResend
                                                ? session.currentChannel === 'email'
                                                    ? 'Resend to email'
                                                    : session.currentChannel === 'sms'
                                                        ? 'Resend by SMS'
                                                        : 'Resend on WhatsApp'
                                                : `Resend in ${resendTimer}s`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {session.flow === 'login' && alternateLoginChannel ? (
                                    <View style={styles.altChannelWrap}>
                                        <TouchableOpacity
                                            style={[
                                                styles.altChannelButton,
                                                !alternateLoginEnabled && styles.altChannelButtonDisabled,
                                            ]}
                                            onPress={handleAlternateChannel}
                                            disabled={!alternateLoginEnabled || isBusy}
                                        >
                                            <Ionicons
                                                name={alternateLoginChannel === 'whatsapp' ? 'logo-whatsapp' : 'mail-outline'}
                                                size={18}
                                                color={alternateLoginEnabled ? activeThemeColor : colors.textMuted}
                                            />
                                            <Text
                                                style={[
                                                    styles.altChannelText,
                                                    { color: alternateLoginEnabled ? activeThemeColor : colors.textMuted },
                                                ]}
                                            >
                                                {alternateLoginChannel === 'whatsapp' ? 'Send OTP on WhatsApp' : 'Send OTP to Email'}
                                            </Text>
                                        </TouchableOpacity>
                                        {alternateLoginChannel === 'whatsapp' ? (
                                            <Text style={[styles.altChannelNote, isTechnician ? styles.lightSubtitle : null]}>
                                                Use WhatsApp if you prefer receiving the OTP there instead of email.
                                            </Text>
                                        ) : null}
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    glassButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
    },
    bottomContent: {
        justifyContent: 'flex-end',
        paddingBottom: spacing.xxl,
    },
    glassContent: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginHorizontal: spacing.md,
        ...shadows.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    title: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
    lightSubtitle: {
        color: 'rgba(255,255,255,0.8)',
    },
    statusRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statusChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.65)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.45)',
    },
    statusChipDone: {
        backgroundColor: `${colors.success}20`,
        borderColor: `${colors.success}55`,
    },
    statusChipText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '700',
    },
    statusChipTextDone: {
        color: colors.success,
    },
    deliveryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        marginBottom: spacing.lg,
    },
    deliveryContent: {
        flex: 1,
    },
    deliveryLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    deliveryValue: {
        ...typography.body,
        color: colors.text,
        fontWeight: '700',
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    otpBox: {
        width: 44,
        height: 56,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.surface,
        paddingHorizontal: 0,
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    otpBoxGlass: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderColor: 'rgba(255,255,255,0.5)',
    },
    otpError: {
        ...typography.caption,
        color: colors.error,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    infoMessage: {
        ...typography.caption,
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: spacing.sm,
        lineHeight: 18,
    },
    loader: {
        marginVertical: spacing.md,
    },
    resendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        flexWrap: 'wrap',
    },
    resendLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    resendBtn: {
        ...typography.bodySmall,
        fontWeight: '700',
    },
    altChannelWrap: {
        marginTop: spacing.lg,
    },
    altChannelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: `${colors.primary}55`,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        backgroundColor: 'rgba(255,255,255,0.75)',
    },
    altChannelButtonDisabled: {
        borderColor: colors.border,
        backgroundColor: 'rgba(255,255,255,0.45)',
    },
    altChannelText: {
        ...typography.bodySmall,
        fontWeight: '700',
    },
    altChannelNote: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
        lineHeight: 18,
    },
});
