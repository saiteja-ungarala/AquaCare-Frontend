// Service Details Screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackScreenProps } from '../../models/types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { Button } from '../../components';
import { Service } from '../../models/types';
import { useCartStore } from '../../store';

type ServiceDetailsScreenProps = RootStackScreenProps<'ServiceDetails'>;

export const ServiceDetailsScreen: React.FC<ServiceDetailsScreenProps> = ({
    navigation,
    route,
}) => {
    const { service } = route.params;
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const addToCart = useCartStore((state) => state.addToCart);

    // Generate next 5 days
    const dates = Array.from({ length: 5 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            date: date.getDate().toString(),
            fullDate: date.toISOString().split('T')[0],
        };
    });

    const timeSlots = [
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    ];

    // Get icon based on category
    const getIcon = (): keyof typeof Ionicons.glyphMap => {
        switch (service.category) {
            case 'water_purifier':
                return 'water';
            case 'ro_plant':
                return 'filter';
            case 'water_softener':
                return 'beaker';
            case 'ionizer':
                return 'flash';
            default:
                return 'construct';
        }
    };


    const handleBookService = () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert('Select Slot', 'Please select a date and time for your service');
            return;
        }

        addToCart(service, 'service', { date: selectedDate, time: selectedTime });

        Alert.alert(
            'Added to Cart! 🛒',
            `Service scheduled for ${selectedTime} on ${selectedDate}`,
            [
                {
                    text: 'View Cart',
                    onPress: () => navigation.navigate('Cart'),
                },
                {
                    text: 'Continue',
                    style: 'cancel'
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    style={styles.header}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.textOnPrimary} />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <View style={styles.iconContainer}>
                            <Ionicons name={getIcon()} size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.serviceDuration}>{service.duration}</Text>
                    </View>
                </LinearGradient>

                {/* Content */}
                <View style={styles.content}>
                    {/* Price Card */}
                    <View style={styles.priceCard}>
                        <View>
                            <Text style={styles.priceLabel}>Service Price</Text>
                            <Text style={styles.priceValue}>₹{service.price}</Text>
                        </View>
                        <View style={styles.priceNote}>
                            <Ionicons name="information-circle" size={18} color={colors.info} />
                            <Text style={styles.priceNoteText}>Includes all materials</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this service</Text>
                        <Text style={styles.description}>{service.description}</Text>
                    </View>

                    {/* What's Included */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What's Included</Text>
                        <View style={styles.includesList}>
                            <View style={styles.includeItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                <Text style={styles.includeText}>Deep cleaning of all filters</Text>
                            </View>
                            <View style={styles.includeItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                <Text style={styles.includeText}>TDS and water quality check</Text>
                            </View>
                            <View style={styles.includeItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                <Text style={styles.includeText}>Sanitization of tank</Text>
                            </View>
                            <View style={styles.includeItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                <Text style={styles.includeText}>30-day service warranty</Text>
                            </View>
                        </View>
                    </View>

                    {/* Select Date */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Date</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.dateList}
                        >
                            {dates.map((d) => (
                                <TouchableOpacity
                                    key={d.fullDate}
                                    style={[
                                        styles.dateCard,
                                        selectedDate === d.fullDate && styles.dateCardSelected,
                                    ]}
                                    onPress={() => setSelectedDate(d.fullDate)}
                                >
                                    <Text
                                        style={[
                                            styles.dateDay,
                                            selectedDate === d.fullDate && styles.dateDaySelected,
                                        ]}
                                    >
                                        {d.day}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.dateNum,
                                            selectedDate === d.fullDate && styles.dateNumSelected,
                                        ]}
                                    >
                                        {d.date}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Select Time */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Time</Text>
                        <View style={styles.timeGrid}>
                            {timeSlots.map((time) => (
                                <TouchableOpacity
                                    key={time}
                                    style={[
                                        styles.timeSlot,
                                        selectedTime === time && styles.timeSlotSelected,
                                    ]}
                                    onPress={() => setSelectedTime(time)}
                                >
                                    <Text
                                        style={[
                                            styles.timeText,
                                            selectedTime === time && styles.timeTextSelected,
                                        ]}
                                    >
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.bottomTotal}>Total</Text>
                    <Text style={styles.bottomPrice}>₹{service.price}</Text>
                </View>
                <Button
                    title="Book Now"
                    onPress={handleBookService}
                    style={styles.bookButton}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
        borderBottomLeftRadius: borderRadius.xl,
        borderBottomRightRadius: borderRadius.xl,
    },
    backButton: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        zIndex: 1,
        padding: spacing.sm,
    },
    headerContent: {
        alignItems: 'center',
        paddingTop: spacing.lg,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    serviceName: {
        ...typography.h2,
        color: colors.textOnPrimary,
        textAlign: 'center',
    },
    serviceDuration: {
        ...typography.body,
        color: 'rgba(255,255,255,0.8)',
        marginTop: spacing.xs,
    },
    content: {
        padding: spacing.md,
    },
    priceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.md,
        marginBottom: spacing.lg,
    },
    priceLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    priceValue: {
        ...typography.h2,
        color: colors.primary,
        fontWeight: '700',
    },
    priceNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    priceNoteText: {
        ...typography.caption,
        color: colors.info,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: spacing.md,
    },
    description: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    includesList: {
        gap: spacing.sm,
    },
    includeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    includeText: {
        ...typography.body,
        color: colors.text,
    },
    dateList: {
        gap: spacing.sm,
    },
    dateCard: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: spacing.sm,
    },
    dateCardSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dateDay: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    dateDaySelected: {
        color: colors.textOnPrimary,
    },
    dateNum: {
        ...typography.h3,
        color: colors.text,
    },
    dateNumSelected: {
        color: colors.textOnPrimary,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    timeSlot: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    timeSlotSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    timeText: {
        ...typography.bodySmall,
        color: colors.text,
    },
    timeTextSelected: {
        color: colors.textOnPrimary,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    bottomTotal: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    bottomPrice: {
        ...typography.h3,
        color: colors.text,
        fontWeight: '700',
    },
    bookButton: {
        paddingHorizontal: spacing.xl,
    },
});
