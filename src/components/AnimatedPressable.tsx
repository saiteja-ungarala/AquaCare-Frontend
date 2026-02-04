// AnimatedButton - Button with scale press animation

import React, { useRef } from 'react';
import {
    Animated,
    TouchableWithoutFeedback,
    ViewStyle,
    StyleSheet,
} from 'react-native';

interface AnimatedPressableProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    scaleValue?: number;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
    children,
    style,
    onPress,
    scaleValue = 0.95,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: scaleValue,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    return (
        <TouchableWithoutFeedback
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View
                style={[
                    style,
                    {
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {children}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({});
