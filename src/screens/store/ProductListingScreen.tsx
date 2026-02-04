import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storeTheme, spacing, borderRadius } from '../../theme/theme';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
}

const mockProducts: Product[] = [
    { id: '1', name: '20L Water Can', price: 50, image: 'water', rating: 4.5 },
    { id: '2', name: 'Water Dispenser', price: 2500, image: 'cube', rating: 4.8 },
    { id: '3', name: 'Water Filter', price: 1200, image: 'filter', rating: 4.3 },
    { id: '4', name: 'Water Pump', price: 3500, image: 'hardware-chip', rating: 4.6 },
    { id: '5', name: 'Water Cooler', price: 4500, image: 'snow', rating: 4.7 },
    { id: '6', name: 'Bottle Stand', price: 450, image: 'construct', rating: 4.2 },
];

export function ProductListingScreen({ route, navigation }: any) {
    const { category } = route.params || {};

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
        >
            <View style={styles.productImage}>
                <Ionicons name={item.image as any} size={50} color={storeTheme.primary} />
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                <Text style={styles.productPrice}>₹{item.price}</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={storeTheme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{category || 'Products'}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="search" size={22} color={storeTheme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="filter" size={22} color={storeTheme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <TouchableOpacity style={styles.filterChip}>
                    <Text style={styles.filterChipText}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChipOutline}>
                    <Text style={styles.filterChipOutlineText}>Price: Low to High</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChipOutline}>
                    <Text style={styles.filterChipOutlineText}>Rating</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={mockProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: storeTheme.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: storeTheme.background,
        borderBottomWidth: 1,
        borderBottomColor: storeTheme.border,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: storeTheme.text,
        marginLeft: spacing.sm,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.xs,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: storeTheme.border,
    },
    filterChip: {
        backgroundColor: storeTheme.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
    },
    filterChipText: {
        color: storeTheme.textOnPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    filterChipOutline: {
        backgroundColor: 'transparent',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: storeTheme.border,
        marginRight: spacing.sm,
    },
    filterChipOutlineText: {
        color: storeTheme.text,
        fontSize: 14,
    },
    listContent: {
        padding: spacing.md,
    },
    productCard: {
        flex: 1,
        backgroundColor: storeTheme.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        margin: spacing.sm,
        borderWidth: 1,
        borderColor: storeTheme.border,
        maxWidth: '47%',
    },
    productImage: {
        width: '100%',
        height: 120,
        backgroundColor: storeTheme.surfaceSecondary,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: storeTheme.text,
        marginBottom: spacing.xs,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    ratingText: {
        fontSize: 12,
        color: storeTheme.textSecondary,
        marginLeft: spacing.xs / 2,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: storeTheme.primary,
        marginBottom: spacing.sm,
    },
    addButton: {
        backgroundColor: storeTheme.primary,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
    },
    addButtonText: {
        color: storeTheme.textOnPrimary,
        fontWeight: '600',
        fontSize: 13,
    },
});
