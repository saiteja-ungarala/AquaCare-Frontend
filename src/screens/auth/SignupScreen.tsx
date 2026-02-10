// Signup Screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { useAuthStore } from '../../store';
import { Button, Input } from '../../components';
import { mapAuthError, isValidEmail } from '../../utils/errorMapper';

type SignupScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');

    const { signup, isLoading, error, selectedRole, clearError } = useAuthStore();

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

    const validateForm = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return false;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return false;
        }
        if (!phone.trim()) {
            Alert.alert('Error', 'Please enter your phone number');
            return false;
        }
        if (!password) {
            Alert.alert('Error', 'Please enter a password');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        // Additional email format validation
        if (!isValidEmail(email)) {
            Alert.alert('Validation Error', 'Please enter a valid email address');
            return;
        }

        if (!selectedRole) {
            Alert.alert('Error', 'Please select a role first');
            navigation.navigate('RoleSelection');
            return;
        }

        try {
            const success = await signup({
                name,
                email: email.trim(),
                phone,
                password,
                role: selectedRole,
                referralCode: referralCode.trim() || undefined,
            });

            if (success) {
                // Show success toast - auto-login happens via the store
                Alert.alert('Success', 'Registration successful! Welcome to AquaCare.');
            } else {
                // Get fresh error from store and map it
                const currentError = useAuthStore.getState().error;
                const message = currentError || mapAuthError(null);
                Alert.alert('Signup Failed', message);
                clearError();
            }
        } catch (error) {
            const message = mapAuthError(error);
            Alert.alert('Signup Failed', message);
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
                >
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={22} color={colors.text} />
                        </TouchableOpacity>
                        <View style={styles.headerContent}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="water" size={48} color={colors.primary} />
                            </View>
                            <Text style={styles.headerTitle}>Create Account</Text>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleBadgeText}>{getRoleLabel()}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.formTitle}>Fill in your details</Text>

                        <Input
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={name}
                            onChangeText={setName}
                            leftIcon="person-outline"
                        />

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
                            label="Phone Number"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            leftIcon="call-outline"
                        />

                        <Input
                            label="Password"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                        />

                        <Input
                            label="Referral Code (Optional)"
                            placeholder="Enter referral code if you have one"
                            value={referralCode}
                            onChangeText={setReferralCode}
                            autoCapitalize="characters"
                            leftIcon="gift-outline"
                        />

                        {selectedRole === 'customer' && (
                            <View style={styles.referralNote}>
                                <Ionicons name="information-circle" size={20} color={colors.info} />
                                <Text style={styles.referralNoteText}>
                                    Use a referral code to get your first service free!
                                </Text>
                            </View>
                        )}

                        <Button
                            title="Create Account"
                            onPress={handleSignup}
                            loading={isLoading}
                            fullWidth
                            style={styles.signupButton}
                        />

                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.loginLink}>Login</Text>
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
        backgroundColor: colors.background,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    backButton: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        zIndex: 1,
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    headerContent: {
        alignItems: 'center',
        paddingTop: spacing.lg,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    headerTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    roleBadge: {
        backgroundColor: colors.surface2,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    roleBadgeText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '700',
    },
    form: {
        flex: 1,
        padding: spacing.lg,
    },
    formTitle: {
        ...typography.h2,
        fontSize: 20,
        color: colors.text,
        marginBottom: spacing.lg,
    },
    referralNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface2,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    referralNoteText: {
        ...typography.bodySmall,
        color: colors.info,
        flex: 1,
    },
    signupButton: {
        marginTop: spacing.md,
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
    loginText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    loginLink: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
    },
});
