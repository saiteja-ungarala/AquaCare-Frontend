// BubbleCelebration.tsx - Floating bubbles animation overlay for login celebration
// Displays once per login session on the Home screen

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BubbleCelebrationProps {
    onComplete?: () => void;
}

interface Bubble {
    id: number;
    x: number;
    size: number;
    duration: number;
    drift: number;
    color: string;
    opacity: number;
    delay: number;
}

// Generate random bubbles
const generateBubbles = (): Bubble[] => {
    const bubbleCount = Math.floor(Math.random() * 9) + 12; // 12-20 bubbles
    const bubbles: Bubble[] = [];

    for (let i = 0; i < bubbleCount; i++) {
        // Determine if this is an accent bubble (20% chance)
        const isAccent = Math.random() < 0.2;

        bubbles.push({
            id: i,
            x: Math.random() * (SCREEN_WIDTH - 50), // Random X position
            size: Math.random() * 25 + 15, // 15-40px
            duration: Math.random() * 1000 + 2500, // 2.5-3.5s
            drift: Math.random() * 40 - 20, // -20 to +20 horizontal drift
            color: isAccent ? '#19c3c0' : Math.random() < 0.5 ? '#FFFFFF' : '#E0F7F7',
            opacity: Math.random() * 0.15 + 0.1, // 10-25%
            delay: Math.random() * 300, // Stagger start times
        });
    }

    return bubbles;
};

export const BubbleCelebration: React.FC<BubbleCelebrationProps> = ({ onComplete }) => {
    const bubbles = useRef(generateBubbles()).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    // Create animated values for each bubble
    const bubbleAnimations = useRef(
        bubbles.map(() => ({
            translateY: new Animated.Value(0),
            translateX: new Animated.Value(0),
            opacity: new Animated.Value(0),
        }))
    ).current;

    useEffect(() => {
        // Fade in overlay
        Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();

        // Animate each bubble
        const animations = bubbles.map((bubble, index) => {
            return Animated.parallel([
                // Rise up
                Animated.timing(bubbleAnimations[index].translateY, {
                    toValue: -SCREEN_HEIGHT - 100,
                    duration: bubble.duration,
                    delay: bubble.delay,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                // Horizontal drift
                Animated.timing(bubbleAnimations[index].translateX, {
                    toValue: bubble.drift,
                    duration: bubble.duration,
                    delay: bubble.delay,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                // Fade in then fade out
                Animated.sequence([
                    Animated.delay(bubble.delay),
                    Animated.timing(bubbleAnimations[index].opacity, {
                        toValue: bubble.opacity,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.delay(bubble.duration - 600),
                    Animated.timing(bubbleAnimations[index].opacity, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
            ]);
        });

        // Run all bubble animations
        Animated.parallel(animations).start();

        // Fade out overlay and complete after longest animation
        const maxDuration = Math.max(...bubbles.map(b => b.duration + b.delay));

        setTimeout(() => {
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                onComplete?.();
            });
        }, maxDuration - 300);

    }, []);

    return (
        <Animated.View
            style={[
                styles.overlay,
                {
                    opacity: overlayOpacity,
                },
            ]}
            pointerEvents="auto" // Block touches during animation
        >
            {bubbles.map((bubble, index) => (
                <Animated.View
                    key={bubble.id}
                    style={[
                        styles.bubble,
                        {
                            left: bubble.x,
                            bottom: -50,
                            width: bubble.size,
                            height: bubble.size,
                            borderRadius: bubble.size / 2,
                            backgroundColor: bubble.color,
                            opacity: bubbleAnimations[index].opacity,
                            transform: [
                                { translateY: bubbleAnimations[index].translateY },
                                { translateX: bubbleAnimations[index].translateX },
                            ],
                        },
                    ]}
                />
            ))}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    bubble: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
});
