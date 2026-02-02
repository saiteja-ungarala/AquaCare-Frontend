// Customer Home Screen - Main dashboard for customers

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { BannerSlider, ServiceCard, ProductCard } from '../../components';
import { useCartStore } from '../../store';
import { mockServices, mockProducts, mockBanners } from '../../services/mockData';

type CustomerHomeScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
    navigation,
}) => {
    const addToCart = useCartStore((state) => state.addToCart);

    return (
        <SafeAreaView style={styles.container}>
            {/* Make StatusBar fully explicit for native safety */}
            <StatusBar
                barStyle="dark-content"
                backgroundColor={colors.background}
                translucent={false}
            />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.locationContainer}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <View style={styles.locationText}>
                        <Text style={styles.locationLabel}>Deliver to</Text>
                        <TouchableOpacity style={styles.locationSelector}>
                            <Text style={styles.locationValue}>Select Location</Text>
                            <Ionicons name="chevron-down" size={16} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="notifications-outline" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <Ionicons name="cart-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Partner reach info */}
            <View style={styles.reachBanner}>
                <Ionicons name="time-outline" size={18} color={colors.success} />
                <Text style={styles.reachText}>Reach partner in 30 minutes</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Search Bar */}
                <TouchableOpacity style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <Text style={styles.searchPlaceholder}>
                        Search services & products
                    </Text>
                </TouchableOpacity>

                {/* Category Shortcuts */}
                <View style={styles.categoriesContainer}>
                    {['Water Purifier', 'Softener', 'Ionizer', 'Spares'].map((cat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.catItem}
                            onPress={() => navigation.navigate('Services')}
                        >
                            <View style={styles.catIcon}>
                                <Ionicons
                                    name={
                                        index === 0
                                            ? 'water'
                                            : index === 1
                                                ? 'beaker'
                                                : index === 2
                                                    ? 'flash'
                                                    : 'construct'
                                    }
                                    size={24}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.catText}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Referral Banner */}
                <TouchableOpacity style={styles.referralBanner}>
                    <View>
                        <Text style={styles.referralTitle}>Refer & Earn ₹500</Text>
                        <Text style={styles.referralDesc}>Invite friends to AquaCare</Text>
                    </View>
                    <Ionicons
                        name="gift-outline"
                        size={40}
                        color={colors.textOnPrimary}
                    />
                </TouchableOpacity>

                {/* Banner Slider */}
                <BannerSlider
                    banners={mockBanners}
                    onBannerPress={(banner) =>
                        console.log('Banner pressed:', banner.title)
                    }
                />

                {/* Book Service Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Book Service</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Services')}
                        >
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.serviceGrid}>
                        {mockServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onPress={() =>
                                    navigation.navigate('ServiceDetails', { service })
                                }
                                compact
                            />
                        ))}
                    </View>
                </View>

                {/* Water Products Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Water Products</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.productGrid}>
                        {mockProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onPress={() =>
                                    navigation.navigate('ProductDetails', { product })
                                }
                                onAddToCart={() => addToCart(product, 'product')}
                            />
                        ))}
                    </View>
                </View>

                {/* Why Choose Us Section */}
                <View style={styles.whyChooseSection}>
                    <Text style={styles.sectionTitle}>Why Choose AquaCare?</Text>

                    <View style={styles.featuresGrid}>
                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons
                                    name="shield-checkmark"
                                    size={24}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.featureTitle}>Verified Experts</Text>
                            <Text style={styles.featureDesc}>
                                Background checked technicians
                            </Text>
                        </View>

                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name="time" size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.featureTitle}>On-Time Service</Text>
                            <Text style={styles.featureDesc}>
                                30 mins or money back
                            </Text>
                        </View>

                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons
                                    name="pricetag"
                                    size={24}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.featureTitle}>Best Prices</Text>
                            <Text style={styles.featureDesc}>
                                Transparent pricing
                            </Text>
                        </View>

                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons
                                    name="headset"
                                    size={24}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.featureTitle}>24/7 Support</Text>
                            <Text style={styles.featureDesc}>
                                Always here to help
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // <-- numeric (native-safe)
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        ...shadows.sm,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        marginLeft: spacing.sm,
    },
    locationLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    locationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationValue: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
    },
    headerRight: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reachBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        backgroundColor: colors.surfaceSecondary,
        gap: spacing.xs,
    },
    reachText: {
        ...typography.bodySmall,
        color: colors.success,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoriesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        marginTop: spacing.md,
    },
    catItem: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    catIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    catText: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '500',
    },
    referralBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.primary,
        marginHorizontal: spacing.md,
        marginTop: spacing.lg,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    referralTitle: {
        ...typography.h3,
        color: colors.textOnPrimary,
        marginBottom: 4,
    },
    referralDesc: {
        ...typography.bodySmall,
        color: colors.textOnPrimary,
        opacity: 0.9,
    },
    searchPlaceholder: {
        ...typography.body,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
    section: {
        paddingHorizontal: spacing.md,
        marginTop: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text,
    },
    viewAll: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '600',
    },
    serviceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    whyChooseSection: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        backgroundColor: colors.surfaceSecondary,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.md,
    },
    featureItem: {
        width: '50%',
        padding: spacing.sm,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    featureTitle: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    featureDesc: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 2,
    },
});
