// PulseIcon - Icon with subtle pulsing glow animation

import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

interface PulseIconProps {
    name: keyof typeof Ionicons.glyphMap;
    size?: number;
    color?: string;
    pulseColor?: string;
    style?: ViewStyle;
}

export const PulseIcon: React.FC<PulseIconProps> = ({
    name,
    size = 24,
    color = colors.glassText,
    pulseColor = colors.glowTeal,
    style,
}) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(pulseAnim, {
                        toValue: 1.3,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.6,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <View style={[styles.container, style]}>
            <Animated.View
                style={[
                    styles.pulse,
                    {
                        backgroundColor: pulseColor,
                        width: size * 2,
                        height: size * 2,
                        borderRadius: size,
                        transform: [{ scale: pulseAnim }],
                        opacity: opacityAnim,
                    },
                ]}
            />
            <Ionicons name={name} size={size} color={color} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulse: {
        position: 'absolute',
    },
});
