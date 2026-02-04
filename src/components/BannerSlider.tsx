// Banner Slider component for hero section

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../theme/theme';

interface Banner {
    id: string;
    image: string;
    title: string;
    subtitle: string;
}

interface BannerSliderProps {
    banners: Banner[];
    onBannerPress?: (banner: Banner) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - spacing.md * 2;

export const BannerSlider: React.FC<BannerSliderProps> = ({
    banners,
    onBannerPress,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % banners.length;
            setActiveIndex(nextIndex);
            scrollViewRef.current?.scrollTo({
                x: nextIndex * BANNER_WIDTH,
                animated: true,
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [activeIndex, banners.length]);

    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / BANNER_WIDTH);
        setActiveIndex(index);
    };

    // Get icon for each banner
    const getIcon = (index: number): keyof typeof Ionicons.glyphMap => {
        const icons: (keyof typeof Ionicons.glyphMap)[] = [
            'water',
            'gift',
            'people',
        ];
        return icons[index % icons.length];
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={BANNER_WIDTH}
                contentContainerStyle={styles.scrollContent}
            >
                {banners.map((banner, index) => (
                    <TouchableOpacity
                        key={banner.id}
                        style={styles.bannerContainer}
                        onPress={() => onBannerPress?.(banner)}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[colors.gradientStart, colors.gradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.banner}
                        >
                            <View style={styles.bannerContent}>
                                <Ionicons
                                    name={getIcon(index)}
                                    size={64}
                                    color={colors.glowPink}
                                    style={styles.bannerIcon}
                                />
                                <Text style={styles.bannerTitle}>{banner.title}</Text>
                                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.pagination}>
                {banners.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            index === activeIndex && styles.paginationDotActive,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.md,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
    },
    bannerContainer: {
        width: BANNER_WIDTH,
        marginRight: spacing.md,
    },
    banner: {
        height: 160,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    bannerContent: {
        padding: spacing.lg,
        position: 'relative',
    },
    bannerIcon: {
        position: 'absolute',
        right: spacing.md,
        top: '50%',
        transform: [{ translateY: -32 }],
    },
    bannerTitle: {
        ...typography.h2,
        color: colors.textOnPrimary,
        marginBottom: spacing.xs,
    },
    bannerSubtitle: {
        ...typography.body,
        color: colors.secondaryLight,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: colors.primary,
        width: 24,
    },
});
