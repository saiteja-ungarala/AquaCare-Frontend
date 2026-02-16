import React from 'react';
import { SafeAreaView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { agentTheme } from '../../theme/agentTheme';

type AgentScreenProps = {
    children: React.ReactNode;
    contentStyle?: StyleProp<ViewStyle>;
    dark?: boolean;
};

export const AgentScreen: React.FC<AgentScreenProps> = ({ children, contentStyle, dark = false }) => {
    return (
        <SafeAreaView style={[styles.safeArea, dark ? styles.safeAreaDark : null]}>
            <StatusBar style={dark ? 'light' : 'dark'} />
            <View style={[styles.content, contentStyle]}>{children}</View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: agentTheme.colors.agentSurfaceAlt,
    },
    safeAreaDark: {
        backgroundColor: agentTheme.colors.agentDark,
    },
    content: {
        flex: 1,
    },
});
