import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { technicianTheme } from '../../theme/technicianTheme';

type TechnicianScreenProps = {
    children: React.ReactNode;
    contentStyle?: StyleProp<ViewStyle>;
    dark?: boolean;
};

export const TechnicianScreen: React.FC<TechnicianScreenProps> = ({ children, contentStyle, dark = false }) => {
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
        backgroundColor: technicianTheme.colors.agentSurfaceAlt,
    },
    safeAreaDark: {
        backgroundColor: technicianTheme.colors.agentDark,
    },
    content: {
        flex: 1,
    },
});
