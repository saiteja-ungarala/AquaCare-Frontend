import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface BannerItem {
    id: string;
    title: string;
    subtitle: string;
    image?: any;
    ctaText?: string;
    backgroundColor: string;
}

interface BannerCarouselProps {
    banners: BannerItem[];
    autoPlayInterval?: number;
    onBannerPress?: (banner: BannerItem) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
    banners,
    autoPlayInterval = 3500,
    onBannerPress,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isInteracting = useRef(false);

    // Auto-play logic using useEffect
    useEffect(() => {
        // Don't auto-play if user is interacting
        if (isInteracting.current) return;

        const nextIndex = (activeIndex + 1) % banners.length;

        timerRef.current = setTimeout(() => {
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
            setActiveIndex(nextIndex);
        }, autoPlayInterval);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [activeIndex, autoPlayInterval, banners.length]);

    // Handle manual scroll start
    const onScrollBeginDrag = () => {
        isInteracting.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    // Handle manual scroll end
    const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = event.nativeEvent.contentOffset.x;
        const index = Math.round(offset / SCREEN_WIDTH);

        // Only update if index actually changed to avoid unnecessary re-renders
        if (index !== activeIndex) {
            setActiveIndex(index);
        }

        isInteracting.current = false;

        // The state update (or lack thereof) will trigger/keep the useEffect, 
        // effectively restarting the timer naturally
    };

    // Handle scroll failures (e.g. rapid scrolling)
    const onScrollFailed = (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
        const offset = info.index * SCREEN_WIDTH;
        flatListRef.current?.scrollToOffset({ offset, animated: true });
    };

    const renderItem = ({ item }: { item: BannerItem }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onBannerPress?.(item)}
                style={styles.itemContainer}
            >
                <View style={[styles.card, { backgroundColor: item.backgroundColor }]}>
                    {/* Decorative Circle */}
                    <View style={styles.decorCircle} />

                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.subtitle}>{item.subtitle}</Text>

                        {item.ctaText && (
                            <View style={styles.ctaButton}>
                                <Text style={styles.ctaText}>{item.ctaText}</Text>
                                <Ionicons name="arrow-forward" size={12} color={colors.surface} />
                            </View>
                        )}
                    </View>

                    {/* Illustration placeholder */}
                    <View style={styles.illustration}>
                        <Ionicons name="water-outline" size={80} color="rgba(255,255,255,0.15)" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={banners}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScrollBeginDrag={onScrollBeginDrag}
                onMomentumScrollEnd={onMomentumScrollEnd}
                onScrollToIndexFailed={onScrollFailed}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
                snapToInterval={SCREEN_WIDTH}
                decelerationRate="fast"
                bounces={false}
            />

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {banners.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === activeIndex ? styles.activeDot : styles.inactiveDot,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    itemContainer: {
        width: SCREEN_WIDTH,
        paddingHorizontal: spacing.lg,
    },
    card: {
        height: 160,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        flexDirection: 'row',
        position: 'relative',
        ...shadows.md,
    },
    decorCircle: {
        position: 'absolute',
        top: -60,
        right: -40,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    contentContainer: {
        flex: 1,
        padding: spacing.lg,
        justifyContent: 'center',
        zIndex: 1,
    },
    title: {
        ...typography.h2,
        color: '#FFFFFF',
        marginBottom: spacing.xs,
        fontSize: 22,
    },
    subtitle: {
        ...typography.bodySmall,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: spacing.lg,
        fontWeight: '500',
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    ctaText: {
        ...typography.caption,
        color: '#FFFFFF',
        fontWeight: '700',
        textTransform: 'uppercase',
        fontSize: 11,
    },
    illustration: {
        position: 'absolute',
        bottom: -15,
        right: 15,
        zIndex: 0,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
        gap: 6,
    },
    dot: {
        height: 4,
        borderRadius: 2,
    },
    activeDot: {
        width: 20,
        backgroundColor: colors.primary,
    },
    inactiveDot: {
        width: 6,
        backgroundColor: colors.textMuted,
        opacity: 0.3,
    },
});
