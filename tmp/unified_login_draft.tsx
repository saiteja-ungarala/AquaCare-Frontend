import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
    Image,
    Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows } from '../src/theme/theme';
import { customerColors } from '../src/theme/customerTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store';
import { UserRole } from '../src/models/types';
import { AuthErrorBanner, Button, Input, FadeInView } from '../src/components';
import { isValidEmail } from '../src/utils/errorMapper';

const { width } = Dimensions.get('window');

const blurWebActiveElement = () => {
    if (Platform.OS !== 'web') return;
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();
};

const navigateWithBlur = (callback: () => void) => {
    blurWebActiveElement();
    callback();
};

type RoleSelectionScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [clientFieldErrors, setClientFieldErrors] = useState<Record<string, string>>({});
    const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);
    const [isSignupVisible, setIsSignupVisible] = useState(false);
    const signupAnim = useRef(new Animated.Value(0)).current;

    const {
        login,
        isLoading,
        selectedRole,
        setSelectedRole,
        setShowLoginCelebration,
        errorMessage,
        fieldErrors,
        clearError,
        clearFieldError,
    } = useAuthStore();

    const currentRole = selectedRole || 'customer';

    const shiftAnim = useRef(new Animated.Value(currentRole === 'customer' ? 0 : 1)).current;

    useEffect(() => {
        clearError();
    }, [clearError]);

    useEffect(() => {
        Animated.timing(shiftAnim, {
            toValue: currentRole === 'customer' ? 0 : 1,
            duration: 800,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
            useNativeDriver: false,
        }).start();
    }, [currentRole, shiftAnim]);

    const handleSignupPress = () => {
        setIsSignupVisible(true);
        Animated.timing(signupAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false,
        }).start();
    };

    const handleCloseSignup = () => {
        Animated.timing(signupAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.in(Easing.exp),
            useNativeDriver: false,
        }).start(() => setIsSignupVisible(false));
    };

    const handleRoleSelect = (role: UserRole) => {
        if (role === currentRole) return;
        setSelectedRole(role);
        setLocalErrorMessage(null);
        clearError();
    };

    const clearFieldState = (field: string) => {
        if (localErrorMessage) setLocalErrorMessage(null);
        if (errorMessage) clearError();
        if (fieldErrors[field]) clearFieldError(field);
        if (clientFieldErrors[field]) {
            setClientFieldErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validateLogin = (): boolean => {
        const nextFieldErrors: Record<string, string> = {};
        if (!email.trim()) nextFieldErrors.email = 'Email is required';
        else if (!isValidEmail(email.trim())) nextFieldErrors.email = 'Enter a valid email address';
        
        if (!password) nextFieldErrors.password = 'Password is required';
        else if (password.length < 6) nextFieldErrors.password = 'Password must be at least 6 characters';

        setClientFieldErrors(nextFieldErrors);
        return Object.keys(nextFieldErrors).length === 0;
    };

    const handleLogin = async () => {
        setLocalErrorMessage(null);
        clearError();

        if (!validateLogin()) return;

        const success = await login({
            email: email.trim(),
            password,
            role: currentRole as UserRole,
        });

        if (success) {
            setShowLoginCelebration(true);
        }
    };

    const dismissErrorBanner = () => {
        setLocalErrorMessage(null);
        clearError();
    };

    const shouldHideBannerForInlineErrors = Boolean(
        clientFieldErrors.email || clientFieldErrors.password || fieldErrors.email || fieldErrors.password,
    );

    const activeThemeColor = currentRole === 'technician' ? colors.accent : customerColors.primary;
    const isTechnician = currentRole === 'technician';

    // Interpolations
    const customerBgOp = shiftAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
    const technicianBgOp = shiftAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    const customerCardOp = shiftAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
    const technicianCardOp = shiftAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    const customerTextTranslateX = shiftAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -width * 0.3] });
    const technicianTextTranslateX = shiftAnim.interpolate({ inputRange: [0, 1], outputRange: [width * 0.3, 0] });

    const signupTranslateY = signupAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [Dimensions.get('window').height, 0],
    });

    const cardBorderColor = shiftAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0, 194, 179, 0.5)', 'rgba(255, 176, 0, 0.5)']
    });

    const cardScale = shiftAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0.98, 1] // Slight dip during transition
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            {/* Backgrounds */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: customerBgOp }]}>
                <ImageBackground source={require('../assets/customer-login.png')} style={styles.bgImage} resizeMode="cover">
                    <LinearGradient
                        colors={['rgba(3, 10, 15, 0.65)', 'rgba(2, 28, 34, 0.75)', 'rgba(3, 20, 25, 0.96)']}
                        locations={[0, 0.4, 1]}
                        style={StyleSheet.absoluteFill}
                    />
                </ImageBackground>
            </Animated.View>

            <Animated.View style={[StyleSheet.absoluteFill, { opacity: technicianBgOp }]}>
                <ImageBackground source={require('../assets/technicain-login.jpg')} style={styles.bgImage} resizeMode="cover">
                    <LinearGradient
                        colors={['rgba(15, 10, 0, 0.65)', 'rgba(34, 25, 2, 0.82)', 'rgba(25, 20, 3, 0.98)']}
                        locations={[0, 0.4, 1]}
                        style={StyleSheet.absoluteFill}
                    />
                </ImageBackground>
            </Animated.View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.topBar}>
                    <Image source={require('../assets/icon.png')} style={styles.smallLogo} resizeMode="contain" />
                    
                    <View style={styles.roleSwitcher}>
                        <TouchableOpacity 
                            style={[styles.roleSwitchBtn, !isTechnician && styles.roleSwitchBtnActiveCus]} 
                            onPress={() => handleRoleSelect('customer')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="sparkles" size={20} color={!isTechnician ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.roleSwitchBtn, isTechnician && styles.roleSwitchBtnActiveTech]} 
                            onPress={() => handleRoleSelect('technician')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="construct" size={20} color={isTechnician ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} />
                        </TouchableOpacity>
                    </View>
                </View>

                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View style={[styles.glassContent, { borderColor: cardBorderColor, transform: [{ scale: cardScale }] }]}>
                            <View style={styles.titleWrapper}>
                                <Animated.View style={[StyleSheet.absoluteFill, { opacity: customerCardOp, transform: [{ translateX: customerTextTranslateX }] }]} pointerEvents="none">
                                    <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                                    <Text style={styles.subtitle}>
                                        Login as <Text style={{ color: customerColors.primary, fontWeight: '700' }}>Customer</Text>
                                    </Text>
                                </Animated.View>
                                <Animated.View style={[StyleSheet.absoluteFill, { opacity: technicianCardOp, transform: [{ translateX: technicianTextTranslateX }] }]} pointerEvents="none">
                                    <Text style={[styles.title, { color: colors.surface }]}>Welcome Back</Text>
                                    <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                                        Login as <Text style={{ color: colors.accent, fontWeight: '700' }}>Technician</Text>
                                    </Text>
                                </Animated.View>
                            </View>

                            <View style={styles.formContainer}>
                                <AuthErrorBanner
                                    message={localErrorMessage || (shouldHideBannerForInlineErrors ? null : errorMessage)}
                                    onClose={dismissErrorBanner}
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
                                    inputContainerStyle={styles.transparentInput}
                                    labelStyle={isTechnician ? { color: colors.surface } : undefined}
                                    placeholderTextColor={isTechnician ? 'rgba(255, 255, 255, 0.6)' : undefined}
                                    error={clientFieldErrors.email || fieldErrors.email}
                                />

                                <Input
                                    label="Password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={(value) => {
                                        setPassword(value);
                                        clearFieldState('password');
                                    }}
                                    secureTextEntry
                                    leftIcon="lock-closed-outline"
                                    inputContainerStyle={styles.transparentInput}
                                    labelStyle={isTechnician ? { color: colors.surface } : undefined}
                                    placeholderTextColor={isTechnician ? 'rgba(255, 255, 255, 0.6)' : undefined}
                                    error={clientFieldErrors.password || fieldErrors.password}
                                />

                                <TouchableOpacity
                                    style={styles.forgotPassword}
                                    onPress={() => navigateWithBlur(() => navigation.navigate('ForgotPassword'))}
                                >
                                    <Text style={[styles.forgotPasswordText, { color: activeThemeColor }]}>Forgot Password?</Text>
                                </TouchableOpacity>

                                <Button
                                    title="Connect Securely"
                                    onPress={handleLogin}
                                    loading={isLoading}
                                    fullWidth
                                    style={{ backgroundColor: activeThemeColor, shadowColor: activeThemeColor, borderRadius: borderRadius.full, marginTop: spacing.md }}
                                />
                            </View>
                            
                            <View style={styles.footerRow}>
                                <Text style={[styles.footerText, isTechnician && { color: 'rgba(255, 255, 255, 0.6)' }]}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigateWithBlur(handleSignupPress)}>
                                    <Text style={[styles.footerLink, { color: activeThemeColor }]}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Sign Up Curtain Overlay */}
            {isSignupVisible && (
                <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: signupTranslateY }], zIndex: 100 }]}>
                    <ImageBackground source={isTechnician ? require('../assets/technicain-login.jpg') : require('../assets/customer-login.png')} style={styles.bgImage} resizeMode="cover">
                        <LinearGradient
                            colors={['rgba(3, 10, 15, 0.3)', 'rgba(3, 20, 25, 0.85)']}
                            locations={[0, 1]}
                            style={StyleSheet.absoluteFill}
                        />
                        <SafeAreaView style={styles.safeArea}>
                            <View style={styles.topBar}>
                                <TouchableOpacity onPress={handleCloseSignup} style={[styles.roleSwitchBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <Ionicons name="close" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                                <ScrollView contentContainerStyle={styles.scrollContent}>
                                    <View style={[styles.glassContent, { borderColor: isTechnician ? 'rgba(255, 176, 0, 0.5)' : 'rgba(0, 194, 179, 0.5)' }]}>
                                        <Text style={[styles.title, { color: colors.text, marginBottom: spacing.xs }]}>Create Account</Text>
                                        <Text style={[styles.subtitle, { marginBottom: spacing.xl }]}>
                                            Join the IonCare family today.
                                        </Text>

                                        <Button 
                                            title="Complete Sign Up" 
                                            onPress={() => {
                                                handleCloseSignup();
                                                setTimeout(() => navigation.navigate('Signup'), 600);
                                            }} 
                                            style={{ backgroundColor: activeThemeColor, borderRadius: borderRadius.full }} 
                                            fullWidth
                                        />
                                    </View>
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </SafeAreaView>
                    </ImageBackground>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    bgImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    smallLogo: {
        width: 44,
        height: 44,
        borderRadius: 12,
    },
    roleSwitcher: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    roleSwitchBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleSwitchBtnActiveCus: {
        backgroundColor: customerColors.primary,
        ...shadows.md,
    },
    roleSwitchBtnActiveTech: {
        backgroundColor: colors.accent,
        ...shadows.md,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xxl,
    },
    glassContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 32,
        padding: spacing.xl,
        borderWidth: 1,
        ...shadows.lg,
    },
    titleWrapper: {
        height: 80,
        marginBottom: spacing.xs,
        justifyContent: 'center',
    },
    title: {
        ...typography.h1,
        fontSize: 32,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        fontSize: 16,
        color: colors.textSecondary,
    },
    formContainer: {
        marginTop: spacing.sm,
    },
    transparentInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderWidth: 1,
        borderRadius: 16,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginVertical: spacing.sm,
    },
    forgotPasswordText: {
        ...typography.bodySmall,
        fontWeight: '700',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    footerLink: {
        ...typography.body,
        fontWeight: '700',
    },
});
