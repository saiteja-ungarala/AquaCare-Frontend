// Forgot Password Screen - Modern Viral India Aesthetic
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
import { Button, Input } from '../../components';
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
                        <View style={styles.iconContainer}>
                            <Ionicons name="key-outline" size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            No worries! Enter your email and we'll send you reset instructions
                        </Text>

                        {/* Form */}
                        <View style={styles.form}>
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
                                <Ionicons name="arrow-back" size={16} color={colors.primary} />
                                <Text style={styles.backToLoginText}>Back to Login</Text>
                            </TouchableOpacity>
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
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.title,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    form: {
        marginTop: spacing.lg,
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
        color: colors.primary,
        fontWeight: '600',
    },
});
