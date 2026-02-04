// FadeInView - Simple fade-in animation wrapper with stagger support

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    distance?: number;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
    children,
    style,
    delay = 0,
    duration = 400,
    direction = 'up',
    distance = 20,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateAnim = useRef(new Animated.Value(
        direction === 'up' ? distance :
            direction === 'down' ? -distance :
                direction === 'left' ? distance :
                    direction === 'right' ? -distance : 0
    )).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateAnim, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const getTransform = () => {
        if (direction === 'up' || direction === 'down') {
            return [{ translateY: translateAnim }];
        }
        if (direction === 'left' || direction === 'right') {
            return [{ translateX: translateAnim }];
        }
        return [];
    };

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: fadeAnim,
                    transform: getTransform(),
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};
