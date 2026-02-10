// Login Screen - Modern Viral India Aesthetic
// Clean, minimal, high contrast

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { useAuthStore } from '../../store';
import { Button, Input } from '../../components';
import { validateLoginForm, mapAuthError } from '../../utils/errorMapper';

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, selectedRole, setShowLoginCelebration } = useAuthStore();

    const getRoleLabel = () => {
        switch (selectedRole) {
            case 'customer':
                return 'Customer';
            case 'agent':
                return 'Service Agent';
            case 'dealer':
                return 'Dealer';
            default:
                return 'User';
        }
    };

    const handleLogin = async () => {
        // Client-side validation first
        const validation = validateLoginForm(email, password);
        if (!validation.isValid) {
            Alert.alert('Validation Error', validation.error!);
            return;
        }

        if (!selectedRole) {
            Alert.alert('Error', 'Please select a role first');
            navigation.goBack();
            return;
        }

        try {
            const success = await login({
                email: email.trim(),
                password,
                role: selectedRole,
            });

            if (success) {
                setShowLoginCelebration(true);
            } else {
                const currentError = useAuthStore.getState().error;
                const message = currentError || 'Login failed. Please try again.';
                Alert.alert('Login Failed', message);
            }
        } catch (error) {
            const message = mapAuthError(error);
            Alert.alert('Login Failed', message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Main Content */}
                    <View style={styles.content}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Login as <Text style={styles.roleText}>{getRoleLabel()}</Text>
                        </Text>

                        {/* Form */}
                        <View style={styles.form}>
                            <Input
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                leftIcon="mail-outline"
                            />

                            <Input
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                leftIcon="lock-closed-outline"
                            />

                            <TouchableOpacity
                                style={styles.forgotPassword}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <Button
                                title="Login"
                                onPress={handleLogin}
                                loading={isLoading}
                                fullWidth
                            />

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <Button
                                title="Login with OTP"
                                onPress={() => Alert.alert('Coming Soon', 'OTP login will be available soon!')}
                                variant="outline"
                                fullWidth
                                icon={<Ionicons name="phone-portrait" size={18} color={colors.primary} />}
                            />
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Don't have an account?{' '}
                                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                    <Text style={styles.footerLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
    roleText: {
        color: colors.primary,
        fontWeight: '700',
    },
    form: {
        marginTop: spacing.lg,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.xl,
        marginTop: -spacing.xs,
    },
    forgotPasswordText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        ...typography.caption,
        color: colors.textMuted,
        marginHorizontal: spacing.md,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    footer: {
        marginTop: spacing.xxl,
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

