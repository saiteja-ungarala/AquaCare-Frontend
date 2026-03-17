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
    const { signup, isLoading, errorMessage, fieldErrors, clearError, clearFieldError } = useAuthStore();

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
        } else if (password.length < 6) {
            nextFieldErrors.password = 'Password must be at least 6 characters';
        }

        setClientFieldErrors(nextFieldErrors);
        return Object.keys(nextFieldErrors).length === 0;
    };

    const handleSignup = async () => {
        clearError();
        if (!validateForm()) {
            return;
        }

        const success = await signup({
            name: fullName.trim(),
            email: email.trim(),
            password,
            phone: phone.trim(),
            role: 'customer'
        });

        if (success) {
            // Success logic is handled by store (sets user, navigates)
        }
    };

    return (
        <ImageBackground
            source={require('../../../assets/customer-login.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <SafeAreaView style={styles.safeArea}>
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
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="chevron-back" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.content}>
                            <View style={styles.glassContent}>
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subtitle}>Join IonCare today</Text>

                                <View style={styles.form}>
                                    <AuthErrorBanner
                                        message={errorMessage}
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
                                        error={clientFieldErrors.phone || fieldErrors.phone}
                                    />

                                    <Input
                                        label="Password"
                                        placeholder="Create a password (min. 6 chars)"
                                        value={password}
                                        onChangeText={(value) => {
                                            setPassword(value);
                                            clearFieldState('password');
                                        }}
                                        secureTextEntry
                                        leftIcon="lock-closed-outline"
                                        error={clientFieldErrors.password || fieldErrors.password}
                                    />

                                    <Button
                                        title="Sign Up"
                                        onPress={handleSignup}
                                        loading={isLoading}
                                        fullWidth
                                        style={{
                                            backgroundColor: customerColors.primary,
                                            shadowColor: customerColors.primary,
                                            marginTop: spacing.lg
                                        }}
                                    />
                                </View>

                                <View style={styles.footer}>
                                    <View style={styles.footerRow}>
                                        <Text style={styles.footerText}>Already have an account? </Text>
                                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                            <Text style={[styles.footerLink, { color: customerColors.primary }]}>Login</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
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
        justifyContent: 'flex-end',
        paddingBottom: spacing.xxl,
    },
    glassContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        ...shadows.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
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
