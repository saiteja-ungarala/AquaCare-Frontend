// Login Screen with validation and proper error handling

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
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius } from '../../theme/theme';
import { useAuthStore } from '../../store';
import { Button, Input, GradientBackground } from '../../components';
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
                // Show success toast and navigate
                Alert.alert('Success', 'Login successful!', [
                    { text: 'OK', onPress: () => setShowLoginCelebration(true) }
                ]);
            } else {
                // Get error from store
                const currentError = useAuthStore.getState().error;
                const message = currentError || 'Login failed. Please try again.';
                Alert.alert('Login Failed', message);
            }
        } catch (error) {
            const message = mapAuthError(error);
            Alert.alert('Login Failed', message);
        }
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    return (
        <GradientBackground>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.glassText} />
                        </TouchableOpacity>
                        <View style={styles.headerContent}>
                            <Ionicons name="water" size={48} color={colors.glassText} />
                            <Text style={styles.headerTitle}>Welcome Back</Text>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleBadgeText}>{getRoleLabel()}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Form Container with Glass Effect */}
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Login to your account</Text>

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

                        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
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
                            onPress={() => Alert.alert('OTP Login', 'OTP login coming soon!')}
                            variant="outline"
                            fullWidth
                            icon={<Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />}
                        />

                        <View style={styles.signupRow}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingTop: spacing.xxl + 20,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.glassSurface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    headerContent: {
        alignItems: 'center',
        paddingTop: spacing.lg,
    },
    headerTitle: {
        ...typography.h2,
        color: colors.glassText,
        marginTop: spacing.md,
    },
    roleBadge: {
        backgroundColor: colors.glassSurface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    roleBadgeText: {
        ...typography.bodySmall,
        color: colors.glassText,
        fontWeight: '600',
    },
    formContainer: {
        flex: 1,
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        marginTop: spacing.md,
    },
    formTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.lg,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.lg,
    },
    forgotPasswordText: {
        ...typography.bodySmall,
        color: colors.accent,
        fontWeight: '500',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginHorizontal: spacing.md,
    },
    signupRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.lg,
    },
    signupText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    signupLink: {
        ...typography.body,
        color: colors.accent,
        fontWeight: '600',
    },
});
