// Signup Screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { customerColors } from '../../theme/customerTheme';
import { useAuthStore } from '../../store';
import { AuthErrorBanner, Button, Input } from '../../components';
import { isValidEmail } from '../../utils/errorMapper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isValidIndianMobile, normalizePhoneInput } from '../../utils/phoneValidator';

type SignupScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [clientFieldErrors, setClientFieldErrors] = useState<Record<string, string>>({});
    const { signup, isLoading, errorMessage, fieldErrors, clearError, clearFieldError, selectedRole } = useAuthStore();

    const clearFieldState = (field: string) => {
        if (errorMessage) {
            clearError();
        }
        if (fieldErrors[field]) {
            clearFieldError(field);
        }
        if (clientFieldErrors[field]) {
            setClientFieldErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validateForm = (): boolean => {
        const nextFieldErrors: Record<string, string> = {};

        if (!fullName.trim()) {
            nextFieldErrors.fullName = 'Full name is required';
        } else if (fullName.trim().length < 2) {
            nextFieldErrors.fullName = 'Full name must be at least 2 characters';
        } else if (fullName.trim().length > 100) {
            nextFieldErrors.fullName = 'Full name must be 100 characters or fewer';
        }

        if (!email.trim()) {
            nextFieldErrors.email = 'Email is required';
        } else if (!isValidEmail(email.trim())) {
            nextFieldErrors.email = 'Enter a valid email address';
        }

        if (!phone.trim()) {
            nextFieldErrors.phone = 'Phone number is required';
        } else if (!isValidIndianMobile(phone)) {
            nextFieldErrors.phone = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9';
        }

        if (!password) {
            nextFieldErrors.password = 'Password is required';
        } else if (password.length < 8) {
            nextFieldErrors.password = 'Password must be at least 8 characters';
        } else if (password.length > 72) {
            nextFieldErrors.password = 'Password must be 72 characters or fewer';
        } else if (!/[A-Z]/.test(password)) {
            nextFieldErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(password)) {
            nextFieldErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/\d/.test(password)) {
            nextFieldErrors.password = 'Password must contain at least one number';
        } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
            nextFieldErrors.password = 'Password must contain at least one special character';
        }

        setClientFieldErrors(nextFieldErrors);
        return Object.keys(nextFieldErrors).length === 0;
    };

    const shouldHideBannerForInlineErrors = Boolean(
        clientFieldErrors.fullName ||
        clientFieldErrors.email ||
        clientFieldErrors.phone ||
        clientFieldErrors.password ||
        fieldErrors.name ||
        fieldErrors.email ||
        fieldErrors.phone ||
        fieldErrors.password,
    );

    const handleSignup = async () => {
        clearError();
        if (!validateForm()) {
            return;
        }

        if (!selectedRole) {
            // Should theoretically never happen if navigating from role selection
            return;
        }

        const success = await signup({
            name: fullName.trim(),
            email: email.trim(),
            password,
            phone: phone.trim(),
            role: selectedRole
        });

        if (success) {
            // Success logic is handled by store (sets user, navigates)
        }
    };

    const isCustomSignup = selectedRole === 'customer' || selectedRole === 'agent' || selectedRole === 'dealer';
    const isAgent = selectedRole === 'agent';
    const Wrapper = (isCustomSignup ? ImageBackground : View) as React.ComponentType<any>;

    const getBackgroundImage = () => {
        if (selectedRole === 'customer') return require('../../../assets/customer-login.png');
        if (selectedRole === 'agent') return require('../../../assets/technicain-login.jpg');
        if (selectedRole === 'dealer') return require('../../../assets/dealer-login.png');
        return undefined;
    };

    const activeThemeColor = selectedRole === 'agent' ? colors.accent : (selectedRole === 'dealer' ? colors.info : customerColors.primary);

    const wrapperProps = isCustomSignup
        ? { source: getBackgroundImage(), style: styles.backgroundImage, resizeMode: 'cover' as const }
        : { style: styles.container };

    return (
        <Wrapper {...wrapperProps}>
            {isCustomSignup && (
                <View style={styles.overlay} />
            )}
            <SafeAreaView style={isCustomSignup ? styles.safeArea : styles.container}>
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
                                style={[styles.backButton, isCustomSignup && styles.glassButton]}
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="chevron-back" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={[
                            styles.content,
                            isCustomSignup && styles.bottomContent,
                        ]}>
                            <View style={isCustomSignup ? styles.glassContent : undefined}>
                                <Text style={[styles.title, isAgent ? { color: colors.surface } : null]}>Create Account</Text>
                                <Text style={[styles.subtitle, isAgent ? { color: 'rgba(255, 255, 255, 0.8)' } : null]}>Join IonCare today</Text>

                                <View style={styles.form}>
                                    <AuthErrorBanner
                                        message={shouldHideBannerForInlineErrors ? null : errorMessage}
                                        onClose={clearError}
                                    />

                                    <Input
                                        label="Full Name"
                                        placeholder="Enter your full name"
                                        value={fullName}
                                        onChangeText={(value) => {
                                            setFullName(value);
                                            clearFieldState('fullName');
                                        }}
                                        leftIcon="person-outline"
                                        inputContainerStyle={isCustomSignup ? styles.transparentInput : undefined}
                                        labelStyle={isAgent ? { color: colors.surface } : undefined}
                                        placeholderTextColor={isAgent ? 'rgba(255, 255, 255, 0.6)' : undefined}
                                        error={clientFieldErrors.fullName || fieldErrors.name}
                                    />

                                    <Input
                                        label="Email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChangeText={(value) => {
                                            setEmail(value);
                                            clearFieldState('email');
                                        }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        leftIcon="mail-outline"
                                        inputContainerStyle={isCustomSignup ? styles.transparentInput : undefined}
                                        labelStyle={isAgent ? { color: colors.surface } : undefined}
                                        placeholderTextColor={isAgent ? 'rgba(255, 255, 255, 0.6)' : undefined}
                                        error={clientFieldErrors.email || fieldErrors.email}
                                    />

                                    <Input
                                        label="Phone Number"
                                        placeholder="Enter 10-digit mobile number"
                                        value={phone}
                                        onChangeText={(value) => {
                                            setPhone(normalizePhoneInput(value));
                                            clearFieldState('phone');
                                        }}
                                        keyboardType="numeric"
                                        maxLength={10}
                                        leftIcon="call-outline"
                                        inputContainerStyle={isCustomSignup ? styles.transparentInput : undefined}
                                        labelStyle={isAgent ? { color: colors.surface } : undefined}
                                        placeholderTextColor={isAgent ? 'rgba(255, 255, 255, 0.6)' : undefined}
                                        error={clientFieldErrors.phone || fieldErrors.phone}
                                    />

                                    <Input
                                        label="Password"
                                        placeholder="Create a password (min. 8 characters)"
                                        value={password}
                                        onChangeText={(value) => {
                                            setPassword(value);
                                            clearFieldState('password');
                                        }}
                                        secureTextEntry
                                        leftIcon="lock-closed-outline"
                                        inputContainerStyle={isCustomSignup ? styles.transparentInput : undefined}
                                        labelStyle={isAgent ? { color: colors.surface } : undefined}
                                        placeholderTextColor={isAgent ? 'rgba(255, 255, 255, 0.6)' : undefined}
                                        error={clientFieldErrors.password || fieldErrors.password}
                                    />

                                    <Button
                                        title="Sign Up"
                                        onPress={handleSignup}
                                        loading={isLoading}
                                        fullWidth
                                        style={{
                                            backgroundColor: activeThemeColor,
                                            shadowColor: activeThemeColor,
                                            marginTop: spacing.lg
                                        }}
                                    />
                                </View>

                                <View style={styles.footer}>
                                    <View style={styles.footerRow}>
                                        <Text style={styles.footerText}>Already have an account? </Text>
                                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                            <Text style={[styles.footerLink, { color: activeThemeColor }]}>Login</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    safeArea: {
        flex: 1,
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginHorizontal: spacing.md,
        ...shadows.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    transparentInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
    },
    glassButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    title: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    form: {
        marginTop: spacing.md,
    },
    footer: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    footerLink: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '700',
    },
});
