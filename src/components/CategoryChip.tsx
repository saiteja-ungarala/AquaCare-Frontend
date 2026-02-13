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
    customColors?: any;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
    categories,
    selectedId,
    onSelect,
    customColors,
}) => {
    const theme = customColors || colors;

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
                            { backgroundColor: theme.surface2, borderColor: theme.border },
                            isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                        ]}
                        onPress={() => onSelect(category.id)}
                    >
                        <Ionicons
                            name={category.icon}
                            size={18}
                            color={isSelected ? theme.textOnPrimary : theme.textSecondary}
                        />
                        <Text
                            style={[
                                styles.chipText,
                                { color: theme.textSecondary },
                                isSelected && { color: theme.textOnPrimary },
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
