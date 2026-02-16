import { Alert, Platform, ToastAndroid } from 'react-native';

export const showAgentToast = (message: string): void => {
    if (!message) return;

    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
        return;
    }

    Alert.alert('Notice', message);
};
