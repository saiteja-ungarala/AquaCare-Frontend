import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/theme';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius: radius = borderRadius.sm,
    style,
}) => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius: radius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const SkeletonCard: React.FC = () => {
    return (
        <View style={styles.card}>
            <Skeleton width={60} height={60} borderRadius={12} />
            <View style={styles.cardContent}>
                <Skeleton width="70%" height={20} style={{ marginBottom: spacing.sm }} />
                <Skeleton width="40%" height={16} />
            </View>
        </View>
    );
};

export const SkeletonProductCard: React.FC = () => {
    return (
        <View style={styles.productCard}>
            <Skeleton width="100%" height={120} borderRadius={borderRadius.md} />
            <Skeleton width="90%" height={16} style={{ marginTop: spacing.sm }} />
            <Skeleton width="60%" height={14} style={{ marginTop: spacing.xs }} />
            <View style={styles.productFooter}>
                <Skeleton width={60} height={20} />
                <Skeleton width={80} height={36} borderRadius={borderRadius.sm} />
            </View>
        </View>
    );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => {
    return (
        <View style={styles.list}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: colors.surface2,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    cardContent: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'center',
    },
    productCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        flex: 1,
        margin: spacing.sm,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    list: {
        padding: spacing.md,
    },
});
