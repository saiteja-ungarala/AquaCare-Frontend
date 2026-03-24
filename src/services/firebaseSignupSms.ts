import { Platform } from 'react-native';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { cleanPhone } from '../utils/phoneValidator';

let confirmationResult: FirebaseAuthTypes.ConfirmationResult | null = null;

const getNativeFirebaseAuth = (): (() => FirebaseAuthTypes.Module) => {
    if (Platform.OS === 'web') {
        throw new Error('Firebase SMS signup verification is supported only on Android and iOS app builds.');
    }

    try {
        return require('@react-native-firebase/auth').default as () => FirebaseAuthTypes.Module;
    } catch (error) {
        throw new Error('Firebase native auth is not available. Use an Android/iOS dev build or EAS build instead of Expo Go for signup SMS OTP.');
    }
};

const toIndianE164 = (phone: string): string => {
    const normalized = cleanPhone(phone);
    if (!/^[6-9]\d{9}$/.test(normalized)) {
        throw new Error('Enter a valid 10-digit Indian mobile number before sending SMS OTP.');
    }
    return `+91${normalized}`;
};

export const firebaseSignupSms = {
    async sendOtp(phone: string, forceResend = false): Promise<void> {
        const auth = getNativeFirebaseAuth()();
        confirmationResult = await auth.signInWithPhoneNumber(toIndianE164(phone), forceResend);
    },

    async confirmOtp(otp: string): Promise<string> {
        if (!confirmationResult) {
            throw new Error('SMS OTP session not started. Please resend the SMS OTP.');
        }

        const result = await confirmationResult.confirm(otp);
        const user = result?.user;

        if (!user) {
            throw new Error('Unable to verify the SMS OTP right now. Please try again.');
        }

        const idToken = await user.getIdToken(true);

        try {
            await getNativeFirebaseAuth()().signOut();
        } catch (error) {
            // Keep the signup flow moving even if local Firebase sign-out fails.
        }

        confirmationResult = null;
        return idToken;
    },

    async clear(): Promise<void> {
        confirmationResult = null;

        if (Platform.OS === 'web') {
            return;
        }

        try {
            await getNativeFirebaseAuth()().signOut();
        } catch (error) {
            // Ignore cleanup errors.
        }
    },
};
