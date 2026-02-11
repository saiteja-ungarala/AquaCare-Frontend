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
    ImageBackground,
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

    const isCustomLogin = selectedRole === 'customer' || selectedRole === 'agent' || selectedRole === 'dealer';
    const Wrapper = (isCustomLogin ? ImageBackground : View) as React.ComponentType<any>;

    const getBackgroundImage = () => {
        if (selectedRole === 'customer') return require('../../../assets/customer-login.png');
        if (selectedRole === 'agent') return require('../../../assets/technicain-login.jpg');
        if (selectedRole === 'dealer') return require('../../../assets/dealer-login.png');
        return undefined;
    };

    const wrapperProps = isCustomLogin
        ? { source: getBackgroundImage(), style: styles.backgroundImage, resizeMode: 'cover' as const }
        : { style: styles.container };

    return (
        <Wrapper {...wrapperProps}>
            {isCustomLogin && (
                <View style={styles.overlay} />
            )}
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
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={[styles.backButton, isCustomLogin && styles.glassButton]}
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="arrow-back" size={22} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Main Content Wrapper */}
                        <View style={[
                            styles.content,
                            isCustomLogin && styles.bottomContent,
                        ]}>
                            {/* Frosted Glass Card (for refined roles) */}
                            <View style={isCustomLogin ? styles.glassContent : undefined}>
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
                                        inputContainerStyle={isCustomLogin ? styles.transparentInput : undefined}
                                    />

                                    <Input
                                        label="Password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        leftIcon="lock-closed-outline"
                                        inputContainerStyle={isCustomLogin ? styles.transparentInput : undefined}
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
        justifyContent: 'center', // Default center for consistency
    },
    bottomContent: {
        justifyContent: 'flex-end',
        paddingBottom: spacing.xxl,
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
    // New Styles for Image Background / Glass Effect
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
        backgroundColor: 'rgba(0, 0, 0, 0.05)', // Very subtle dark tint to make white text pop if needed, or just clear
    },
    glassContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Much more transparent
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        // Removed marginTop to rely on parent positioning
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
});

