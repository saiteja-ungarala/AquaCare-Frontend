// Customer Home Screen - Main dashboard for customers with animations

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import {
    BannerSlider,
    ServiceCard,
    ProductCard,
    GradientBackground,
    FadeInView,
    AnimatedPressable,
    BubbleCelebration,
} from '../../components';
import { useCartStore, useAuthStore } from '../../store';
import { mockServices, mockProducts, mockBanners } from '../../services/mockData';

// Category data with icons and vibrant colors for visibility
const categories = [
    { name: 'Water Purifier', icon: 'water' as const, color: colors.accent, bgColor: 'rgba(25, 195, 192, 0.2)' },
    { name: 'Softener', icon: 'beaker' as const, color: '#FFFFFF', bgColor: 'rgba(255, 255, 255, 0.15)' },
    { name: 'Ionizer', icon: 'flash' as const, color: colors.accent, bgColor: 'rgba(25, 195, 192, 0.2)' },
    { name: 'Spares', icon: 'construct' as const, color: '#FFFFFF', bgColor: 'rgba(255, 255, 255, 0.15)' },
];

type CustomerHomeScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
    navigation,
}) => {
    const addToCart = useCartStore((state) => state.addToCart);
    const { showLoginCelebration, setShowLoginCelebration } = useAuthStore();

    return (
        <GradientBackground>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header with Glass Effect */}
            <View style={styles.header}>
                <View style={styles.locationContainer}>
                    <Ionicons name="location" size={20} color={colors.glassText} />
                    <View style={styles.locationText}>
                        <Text style={styles.locationLabel}>Deliver to</Text>
                        <TouchableOpacity style={styles.locationSelector}>
                            <Text style={styles.locationValue}>Select Location</Text>
                            <Ionicons name="chevron-down" size={16} color={colors.glassText} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <AnimatedPressable style={styles.headerButton} scaleValue={0.9}>
                        <Ionicons name="notifications-outline" size={24} color={colors.glassText} />
                    </AnimatedPressable>

                    <AnimatedPressable
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('Cart')}
                        scaleValue={0.9}
                    >
                        <Ionicons name="cart-outline" size={24} color={colors.glassText} />
                    </AnimatedPressable>
                </View>
            </View>

            {/* Partner reach info */}
            <View style={styles.reachBanner}>
                <Ionicons name="time-outline" size={18} color={colors.glassText} />
                <Text style={styles.reachText}>Reach partner in 30 minutes</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Search Bar with Glass Effect and Animation */}
                <FadeInView delay={100} duration={400}>
                    <AnimatedPressable style={styles.searchBar} scaleValue={0.98}>
                        <Ionicons name="search" size={20} color={colors.glassTextSecondary} />
                        <Text style={styles.searchPlaceholder}>
                            Search services & products
                        </Text>
                    </AnimatedPressable>
                </FadeInView>

                {/* Category Shortcuts with Staggered Animation */}
                <View style={styles.categoriesContainer}>
                    {categories.map((cat, index) => (
                        <FadeInView
                            key={index}
                            delay={200 + (index * 100)}
                            duration={400}
                            direction="up"
                            distance={20}
                        >
                            <AnimatedPressable
                                style={styles.catItem}
                                onPress={() => navigation.navigate('Services')}
                                scaleValue={0.92}
                            >
                                <View style={[styles.catIcon, { backgroundColor: cat.bgColor, borderColor: cat.color }]}>
                                    <Ionicons
                                        name={cat.icon}
                                        size={32}
                                        color={cat.color}
                                    />
                                </View>
                                <Text style={styles.catText}>{cat.name}</Text>
                            </AnimatedPressable>
                        </FadeInView>
                    ))}
                </View>

                {/* Referral Banner with Glass Effect and Animation */}
                <FadeInView delay={600} duration={500}>
                    <AnimatedPressable style={styles.referralBanner} scaleValue={0.98}>
                        <View>
                            <Text style={styles.referralTitle}>Refer & Earn ₹500</Text>
                            <Text style={styles.referralDesc}>Invite friends to AquaCare</Text>
                        </View>
                        <Ionicons
                            name="gift-outline"
                            size={40}
                            color={colors.glassText}
                        />
                    </AnimatedPressable>
                </FadeInView>

                {/* Banner Slider */}
                <BannerSlider
                    banners={mockBanners}
                    onBannerPress={(banner) =>
                        console.log('Banner pressed:', banner.title)
                    }
                />

                {/* Content Card with White Background */}
                <View style={styles.contentCard}>
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
                </View>
            </ScrollView>

            {/* Login Celebration Animation Overlay */}
            {showLoginCelebration && (
                <BubbleCelebration
                    onComplete={() => setShowLoginCelebration(false)}
                />
            )}
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xxl + 20, // Account for status bar
        paddingBottom: spacing.sm,
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
        color: colors.glassTextSecondary,
    },
    locationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationValue: {
        ...typography.body,
        fontWeight: '600',
        color: colors.glassText,
    },
    headerRight: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.glassSurface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    reachBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        backgroundColor: colors.glassSurface,
        gap: spacing.xs,
        marginHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    reachText: {
        ...typography.bodySmall,
        color: colors.glassText,
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
        backgroundColor: colors.glassSurface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
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
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: colors.glassSurfaceStrong,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    catText: {
        ...typography.caption,
        color: colors.glassText,
        fontWeight: '500',
    },
    referralBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surfaceGold,
        marginHorizontal: spacing.md,
        marginTop: spacing.lg,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.gold,
    },
    referralTitle: {
        ...typography.h3,
        color: colors.gold,
        marginBottom: 4,
    },
    referralDesc: {
        ...typography.bodySmall,
        color: colors.goldLight,
    },
    searchPlaceholder: {
        ...typography.body,
        color: colors.glassTextSecondary,
        marginLeft: spacing.sm,
    },
    contentCard: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        // Subtle shadow for depth
        ...shadows.md,
    },
    section: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
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
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.sm,
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
        ...shadows.sm,
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

