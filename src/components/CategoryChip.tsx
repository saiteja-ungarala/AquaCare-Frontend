// CategoryChip Component - Horizontal scrollable category selector
// Modern Viral India Aesthetic

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/theme';

export interface CategoryItem {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
}

interface CategoryChipProps {
    categories: CategoryItem[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
    categories,
    selectedId,
    onSelect,
}) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {categories.map((category) => {
                const isSelected = category.id === selectedId;
                return (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.chip,
                            isSelected && styles.chipSelected,
                        ]}
                        onPress={() => onSelect(category.id)}
                    >
                        <Ionicons
                            name={category.icon}
                            size={18}
                            color={isSelected ? colors.textOnPrimary : colors.textSecondary}
                        />
                        <Text
                            style={[
                                styles.chipText,
                                isSelected && styles.chipTextSelected,
                            ]}
                        >
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.xs,
    },
    chipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: colors.textOnPrimary,
    },
});
