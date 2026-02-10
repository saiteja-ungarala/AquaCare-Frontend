import React from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';

interface PressableScaleProps {
    children: React.ReactNode;
    onPress?: () => void;
    scale?: number;
    style?: any;
    disabled?: boolean;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
    children,
    onPress,
    scale = 0.96,
    style,
    disabled = false,
}) => {
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: scale,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            activeOpacity={1}
            style={style}
        >
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
};
