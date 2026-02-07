// Forgot Password Screen

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
import { Button, Input, GradientBackground } from '../../components';
import { isValidEmail } from '../../utils/errorMapper';
import api from '../../services/api';

type ForgotPasswordScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async () => {
        // Validate email
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        if (!isValidEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: email.trim() });
            setIsSubmitted(true);
            Alert.alert(
                'Request Sent',
                'If this email exists in our system, we have sent reset instructions.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            // Even on error, show the same message for security
            setIsSubmitted(true);
            Alert.alert(
                'Request Sent',
                'If this email exists in our system, we have sent reset instructions.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } finally {
            setIsLoading(false);
        }
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
                            <Ionicons name="key-outline" size={48} color={colors.glassText} />
                            <Text style={styles.headerTitle}>Forgot Password</Text>
                            <Text style={styles.headerSubtitle}>
                                Enter your email to receive reset instructions
                            </Text>
                        </View>
                    </View>

                    {/* Form Container */}
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Reset your password</Text>

                        <Input
                            label="Email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="mail-outline"
                            editable={!isSubmitted}
                        />

                        <Button
                            title={isSubmitted ? 'Request Sent' : 'Send Reset Link'}
                            onPress={handleSubmit}
                            loading={isLoading}
                            fullWidth
                            disabled={isSubmitted}
                        />

                        <TouchableOpacity
                            style={styles.backToLogin}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={16} color={colors.accent} />
                            <Text style={styles.backToLoginText}>Back to Login</Text>
                        </TouchableOpacity>
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
    headerSubtitle: {
        ...typography.body,
        color: colors.glassTextSecondary,
        marginTop: spacing.sm,
        textAlign: 'center',
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
    backToLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xl,
        gap: spacing.xs,
    },
    backToLoginText: {
        ...typography.body,
        color: colors.accent,
        fontWeight: '500',
    },
});
