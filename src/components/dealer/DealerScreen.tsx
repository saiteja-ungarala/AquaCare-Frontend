import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dealerTheme } from '../../theme/dealerTheme';

type DealerScreenProps = {
    children: React.ReactNode;
    contentStyle?: StyleProp<ViewStyle>;
    dark?: boolean;
};

export const DealerScreen: React.FC<DealerScreenProps> = ({ children, contentStyle, dark = false }) => {
    return (
        <SafeAreaView
            style={[styles.safeArea, dark ? styles.safeAreaDark : null]}
            edges={['top', 'bottom']}
        >
            <StatusBar style={dark ? 'light' : 'dark'} />
            <View style={[styles.content, contentStyle]}>{children}</View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: dealerTheme.colors.dealerSurfaceAlt,
    },
    safeAreaDark: {
        backgroundColor: dealerTheme.colors.dealerDark,
    },
    content: {
        flex: 1,
    },
});
