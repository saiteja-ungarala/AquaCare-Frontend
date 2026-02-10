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
            colors={[colors.background, colors.backgroundAlt]}
            style={[styles.gradient, style]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <StatusBar
                barStyle={lightStatusBar ? 'dark-content' : 'light-content'}
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
