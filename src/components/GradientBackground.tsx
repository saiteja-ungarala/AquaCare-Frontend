// GradientBackground - Reusable gradient background wrapper component

import React from 'react';
import { StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/theme';

interface GradientBackgroundProps {
    children: React.ReactNode;
    style?: ViewStyle;
    /** Use light status bar for gradient backgrounds */
    lightStatusBar?: boolean;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
    children,
    style,
    lightStatusBar = true,
}) => {
    return (
        <LinearGradient
            colors={[
                colors.gradientStart,    // Deep ocean blue
                colors.gradientMiddle,   // Electric blue
                colors.gradientEnd       // Bright cyan
            ]}
            style={[styles.gradient, style]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            locations={[0, 0.5, 1]}
        >
            <StatusBar
                barStyle={lightStatusBar ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
});
