// Customer Home Screen - Modern Viral India Dashboard
// Clean, flat, high contrast

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import {
    AppBar,
    CategoryChip,
    ServiceCard,
    ProductCard,
    FadeInView,
    BubbleCelebration,
} from '../../components';
import type { CategoryItem } from '../../components';
import { useCartStore, useAuthStore } from '../../store';
import { mockServices, mockProducts } from '../../services/mockData';

type CustomerHomeScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

// Category data for horizontal scroll
const categories: CategoryItem[] = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'purifier', name: 'Purifiers', icon: 'water' },
    { id: 'softener', name: 'Softeners', icon: 'beaker' },
    { id: 'ionizer', name: 'Ionizers', icon: 'flash' },
    { id: 'spares', name: 'Spares', icon: 'construct' },
];

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
    navigation,
}) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { showLoginCelebration, setShowLoginCelebration } = useAuthStore();
    const { items: cartItems } = useCartStore();

    return (
        <SafeAreaView style={styles.container}>
            {/* AppBar */}
            <AppBar
                location="Select Location"
                onLocationPress={() => Alert.alert('Location', 'Location selector coming soon!')}
                onNotificationPress={() => Alert.alert('Notifications', 'No new notifications')}
                onCartPress={() => navigation.navigate('Cart')}
                cartCount={cartItems.length}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Search Bar */}
                <TouchableOpacity style={styles.searchBar} activeOpacity={0.7}>
                    <Ionicons name="search" size={20} color={colors.textMuted} />
                    <Text style={styles.searchPlaceholder}>Search services & products</Text>
                </TouchableOpacity>

                {/* Category Chips */}
                <CategoryChip
                    categories={categories}
                    selectedId={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                {/* Book Service Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Popular Services</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
                            <Text style={styles.viewAll}>View All →</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.serviceGrid}>
                        {mockServices.slice(0, 4).map((service) => (
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

                {/* Referral Banner */}
                <TouchableOpacity style={styles.referralBanner} activeOpacity={0.8}>
                    <Ionicons name="gift" size={28} color={colors.accent} />
                    <View style={styles.referralContent}>
                        <Text style={styles.referralTitle}>Refer & Earn ₹500</Text>
                        <Text style={styles.referralDesc}>Invite friends to AquaCare</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* Water Products Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Water Products</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Store')}>
                            <Text style={styles.viewAll}>View All →</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.productGrid}>
                        {mockProducts.slice(0, 4).map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onPress={() => navigation.navigate('Store')}
                                onAddToCart={() => navigation.navigate('Store')}
                            />
                        ))}
                    </View>
                </View>

                {/* Why Choose Us Section */}
                <View style={styles.whyChooseSection}>
                    <Text style={styles.sectionTitle}>Why Choose AquaCare?</Text>

                    <View style={styles.featuresGrid}>
                        {[
                            {
                                icon: 'shield-checkmark',
                                title: 'Verified Experts',
                                desc: 'Background checked',
                            },
                            {
                                icon: 'time',
                                title: 'On-Time Service',
                                desc: '30 mins or refund',
                            },
                            {
                                icon: 'pricetag',
                                title: 'Best Prices',
                                desc: 'Transparent pricing',
                            },
                            {
                                icon: 'headset',
                                title: '24/7 Support',
                                desc: 'Always here to help',
                            },
                        ].map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <Ionicons
                                        name={feature.icon as any}
                                        size={22}
                                        color={colors.primary}
                                    />
                                </View>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDesc}>{feature.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Login Celebration Animation Overlay */}
            {showLoginCelebration && (
                <BubbleCelebration
                    onComplete={() => setShowLoginCelebration(false)}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.sm,
    },
    searchPlaceholder: {
        ...typography.body,
        color: colors.textMuted,
    },
    section: {
        marginTop: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
        ...typography.h2,
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
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    referralBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.accent + '30',
        ...shadows.sm,
        gap: spacing.md,
    },
    referralContent: {
        flex: 1,
    },
    referralTitle: {
        ...typography.h2,
        fontSize: 17,
        color: colors.text,
        marginBottom: 2,
    },
    referralDesc: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    whyChooseSection: {
        marginTop: spacing.lg,
        marginHorizontal: spacing.lg,
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.md,
        gap: spacing.md,
    },
    featureItem: {
        width: '47%',
        alignItems: 'center',
        padding: spacing.sm,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    featureTitle: {
        ...typography.bodySmall,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 2,
    },
    featureDesc: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
