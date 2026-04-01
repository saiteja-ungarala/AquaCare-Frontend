import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    onRate?: (rating: number) => void;
    readonly?: boolean;
    size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxStars = 5,
    onRate,
    readonly = false,
    size = 28,
}) => {
    return (
        <View style={styles.row}>
            {Array.from({ length: maxStars }, (_, i) => {
                const filled = i < rating;
                const icon = (
                    <Ionicons
                        name={filled ? 'star' : 'star-outline'}
                        size={size}
                        color={filled ? '#F59E0B' : '#D1D5DB'}
                    />
                );

                if (readonly || !onRate) {
                    return <View key={i}>{icon}</View>;
                }

                return (
                    <TouchableOpacity key={i} onPress={() => onRate(i + 1)} activeOpacity={0.7}>
                        {icon}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 6,
    },
});
