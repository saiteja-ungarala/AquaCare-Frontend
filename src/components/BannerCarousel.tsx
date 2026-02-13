import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    useWindowDimensions,
    TouchableOpacity,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

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
    const { width: screenWidth } = useWindowDimensions();
    const CARD_MARGIN = spacing.lg;
    const CARD_WIDTH = screenWidth - CARD_MARGIN * 2;

    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isInteracting = useRef(false);

    // Auto-play logic
    useEffect(() => {
        if (isInteracting.current) return;
        const nextIndex = (activeIndex + 1) % banners.length;
        timerRef.current = setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setActiveIndex(nextIndex);
        }, autoPlayInterval);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [activeIndex, autoPlayInterval, banners.length]);

    const onScrollBeginDrag = () => {
        isInteracting.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = event.nativeEvent.contentOffset.x;
        const index = Math.round(offset / screenWidth);
        if (index !== activeIndex) setActiveIndex(index);
        isInteracting.current = false;
    };

    const onScrollFailed = (info: { index: number }) => {
        flatListRef.current?.scrollToOffset({ offset: info.index * screenWidth, animated: true });
    };

    const renderItem = ({ item }: { item: BannerItem }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onBannerPress?.(item)}
            style={[styles.itemContainer, { width: screenWidth }]}
        >
            <View style={[styles.card, { backgroundColor: item.backgroundColor, width: CARD_WIDTH }]}>
                {/* Decorative circles */}
                <View style={[styles.decorCircle, styles.decorCircle1]} />
                <View style={[styles.decorCircle, styles.decorCircle2]} />

                <View style={styles.contentContainer}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>

                    {item.ctaText && (
                        <View style={styles.ctaButton}>
                            <Text style={styles.ctaText}>{item.ctaText}</Text>
                            <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                        </View>
                    )}
                </View>

                {/* Illustration */}
                <View style={styles.illustration}>
                    <Ionicons name="water-outline" size={72} color="rgba(255,255,255,0.12)" />
                </View>
            </View>
        </TouchableOpacity>
    );

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
                    length: screenWidth,
                    offset: screenWidth * index,
                    index,
                })}
                snapToInterval={screenWidth}
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
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
    itemContainer: {
        alignItems: 'center',
    },
    card: {
        aspectRatio: 2.2,
        minHeight: 150,
        maxHeight: 200,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        flexDirection: 'row',
        position: 'relative',
        ...shadows.md,
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    decorCircle1: {
        top: -50,
        right: -30,
        width: 180,
        height: 180,
    },
    decorCircle2: {
        bottom: -40,
        left: -20,
        width: 120,
        height: 120,
    },
    contentContainer: {
        flex: 1,
        padding: spacing.lg,
        paddingRight: 80,
        justifyContent: 'center',
        zIndex: 1,
    },
    title: {
        ...typography.h2,
        color: '#FFFFFF',
        marginBottom: spacing.xs,
        fontSize: 20,
        lineHeight: 26,
    },
    subtitle: {
        ...typography.bodySmall,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: spacing.md,
        fontWeight: '500',
        lineHeight: 18,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 14,
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
        bottom: 10,
        right: 16,
        opacity: 0.8,
        zIndex: 0,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
        gap: 6,
    },
    dot: {
        height: 5,
        borderRadius: 3,
    },
    activeDot: {
        width: 22,
        backgroundColor: colors.primary,
    },
    inactiveDot: {
        width: 7,
        backgroundColor: colors.textMuted,
        opacity: 0.3,
    },
});
