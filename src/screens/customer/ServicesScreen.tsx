import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Service, ServiceCategory } from '../../models/types';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';

type ServicesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ServiceCategoryItem {
    id: string;
    title: string;
    category: ServiceCategory;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    description: string;
    price: number;
}

const SERVICE_CATEGORIES: ServiceCategoryItem[] = [
    {
        id: '1',
        title: 'Water Purifier Service',
        category: 'water_purifier',
        icon: 'water',
        color: '#4FC3F7',
        description: 'Complete RO water purifier service including filter change and membrane cleaning.',
        price: 499,
    },
    {
        id: '2',
        title: 'RO Plant Service',
        category: 'ro_plant',
        icon: 'construct',
        color: '#29B6F6',
        description: 'Industrial and commercial RO plant maintenance and repair services.',
        price: 1499,
    },
    {
        id: '3',
        title: 'Water Softener Service',
        category: 'water_softener',
        icon: 'beaker',
        color: '#039BE5',
        description: 'Water softener regeneration and resin cleaning service.',
        price: 899,
    },
    {
        id: '4',
        title: 'Ionizer Service',
        category: 'ionizer',
        icon: 'flash',
        color: '#0277BD',
        description: 'Deep cleaning and electrode maintenance for water ionizers.',
        price: 1999,
    },
];

export const ServicesScreen = () => {
    const navigation = useNavigation<ServicesScreenNavigationProp>();

    const handleServicePress = (item: ServiceCategoryItem) => {
        // Create a dummy service object to pass to details
        const service: Service = {
            id: item.id,
            name: item.title,
            description: item.description,
            price: item.price,
            category: item.category,
            image: 'https://via.placeholder.com/300', // Placeholder
            duration: '60 mins',
        };
        navigation.navigate('ServiceDetails', { service });
    };

    const renderItem = ({ item }: { item: ServiceCategoryItem }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleServicePress(item)}
            activeOpacity={0.9}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={32} color="#FFFFFF" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardPrice}>Starts @ ₹{item.price}</Text>
            </View>
            <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Our Services</Text>
                <Text style={styles.headerSubtitle}>Select a service to book</Text>
            </View>
            <FlatList
                data={SERVICE_CATEGORIES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                numColumns={1}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
        backgroundColor: colors.surface,
        borderBottomLeftRadius: borderRadius.xl,
        borderBottomRightRadius: borderRadius.xl,
        ...shadows.sm,
        marginBottom: spacing.md,
    },
    headerTitle: {
        ...typography.h1,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        ...typography.body,
        color: colors.textSecondary,
    },
    listContent: {
        padding: spacing.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        ...typography.h3,
        color: colors.text,
        marginBottom: 4,
    },
    cardPrice: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '600',
    },
    arrowContainer: {
        padding: spacing.xs,
    },
});
