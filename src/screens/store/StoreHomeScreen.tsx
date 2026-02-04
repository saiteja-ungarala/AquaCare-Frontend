import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storeTheme, spacing, borderRadius } from '../../theme/theme';

interface Category {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const categories: Category[] = [
    { id: '1', name: 'Water Cans', icon: 'water' },
    { id: '2', name: 'Dispensers', icon: 'cube' },
    { id: '3', name: 'Filters', icon: 'filter' },
    { id: '4', name: 'Accessories', icon: 'construct' },
    { id: '5', name: 'Pumps', icon: 'hardware-chip' },
    { id: '6', name: 'Coolers', icon: 'snow' },
];

export function StoreHomeScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="menu" size={24} color={storeTheme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Store</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="cart-outline" size={24} color={storeTheme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={storeTheme.textSecondary} />
                    <Text style={styles.searchText}>Search products...</Text>
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <View style={styles.categoriesGrid}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={styles.categoryItem}
                                onPress={() => navigation.navigate('ProductListing', { category: category.name })}
                            >
                                <View style={styles.categoryIcon}>
                                    <Ionicons name={category.icon} size={28} color={storeTheme.primary} />
                                </View>
                                <Text style={styles.categoryName}>{category.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Featured Banner */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.banner}>
                        <View style={styles.bannerContent}>
                            <Text style={styles.bannerTitle}>New Arrivals</Text>
                            <Text style={styles.bannerSubtitle}>Premium Water Dispensers</Text>
                            <View style={styles.bannerButton}>
                                <Text style={styles.bannerButtonText}>Shop Now</Text>
                            </View>
                        </View>
                        <View style={styles.bannerImage}>
                            <Ionicons name="water" size={60} color={storeTheme.primary} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Popular Products */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Popular Products</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
                        {[1, 2, 3, 4].map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={styles.productCard}
                                onPress={() => navigation.navigate('ProductDetails', { productId: item })}
                            >
                                <View style={styles.productImage}>
                                    <Ionicons name="water" size={40} color={storeTheme.primary} />
                                </View>
                                <Text style={styles.productName}>20L Water Can</Text>
                                <Text style={styles.productPrice}>₹50</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Special Offer */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.offerBanner}>
                        <Ionicons name="pricetag" size={24} color={storeTheme.primary} />
                        <View style={styles.offerContent}>
                            <Text style={styles.offerTitle}>Special Offer</Text>
                            <Text style={styles.offerSubtitle}>Get 20% off on first order</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={storeTheme.textSecondary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: storeTheme.background,
        borderBottomWidth: 1,
        borderBottomColor: storeTheme.border,
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: storeTheme.text,
    },
    scrollView: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: storeTheme.surfaceSecondary,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 4,
        margin: spacing.md,
    },
    searchText: {
        marginLeft: spacing.sm,
        fontSize: 16,
        color: storeTheme.textSecondary,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: storeTheme.text,
        paddingHorizontal: spacing.md,
    },
    seeAllText: {
        fontSize: 14,
        color: storeTheme.primary,
        fontWeight: '600',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.md,
        marginTop: spacing.md,
    },
    categoryItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: spacing.md,
        marginRight: '3.33%',
    },
    categoryIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: storeTheme.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    categoryName: {
        fontSize: 12,
        color: storeTheme.text,
        textAlign: 'center',
        fontWeight: '500',
    },
    banner: {
        flexDirection: 'row',
        backgroundColor: storeTheme.surfaceSecondary,
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.md,
        padding: spacing.lg,
        overflow: 'hidden',
    },
    bannerContent: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: storeTheme.text,
        marginBottom: spacing.xs,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: storeTheme.textSecondary,
        marginBottom: spacing.md,
    },
    bannerButton: {
        backgroundColor: storeTheme.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
    },
    bannerButtonText: {
        color: storeTheme.textOnPrimary,
        fontWeight: '600',
        fontSize: 14,
    },
    bannerImage: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productsScroll: {
        paddingLeft: spacing.md,
    },
    productCard: {
        width: 140,
        backgroundColor: storeTheme.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginRight: spacing.md,
        borderWidth: 1,
        borderColor: storeTheme.border,
    },
    productImage: {
        width: '100%',
        height: 100,
        backgroundColor: storeTheme.surfaceSecondary,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: storeTheme.text,
        marginBottom: spacing.xs,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: storeTheme.primary,
    },
    offerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: storeTheme.surfaceSecondary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginHorizontal: spacing.md,
    },
    offerContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: storeTheme.text,
    },
    offerSubtitle: {
        fontSize: 13,
        color: storeTheme.textSecondary,
        marginTop: spacing.xs / 2,
    },
});
