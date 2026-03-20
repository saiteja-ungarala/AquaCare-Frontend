import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/theme';
import { customerColors } from '../../theme/customerTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = { navigation: NativeStackNavigationProp<any> };

const METHODS = [
    {
        icon: 'phone-portrait-outline',
        title: 'UPI Apps',
        subtitle: 'Supported through Razorpay checkout when enabled.',
    },
    {
        icon: 'card-outline',
        title: 'Debit and Credit Cards',
        subtitle: 'Cards are entered securely during checkout and are not stored in the app.',
    },
    {
        icon: 'globe-outline',
        title: 'Net Banking',
        subtitle: 'Available through supported banks in the payment gateway.',
    },
    {
        icon: 'wallet-outline',
        title: 'Wallet Credits and Refunds',
        subtitle: 'Refunds and credits appear in your IONORA CARE wallet after processing.',
    },
];

export const PaymentMethodsScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Methods</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <View style={styles.iconWrap}>
                        <Ionicons name="shield-checkmark-outline" size={56} color={customerColors.primary} />
                    </View>
                    <Text style={styles.title}>Secure checkout</Text>
                    <Text style={styles.subtitle}>
                        Payments are completed during checkout using the available options from the payment gateway.
                    </Text>
                </View>

                <View style={styles.card}>
                    {METHODS.map((method, index) => (
                        <View key={method.title} style={[styles.row, index === METHODS.length - 1 && styles.rowLast]}>
                            <View style={styles.rowIcon}>
                                <Ionicons name={method.icon as keyof typeof Ionicons.glyphMap} size={22} color={customerColors.primary} />
                            </View>
                            <View style={styles.rowContent}>
                                <Text style={styles.rowTitle}>{method.title}</Text>
                                <Text style={styles.rowSubtitle}>{method.subtitle}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, ...shadows.sm },
    backButton: {
        width: 32,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -spacing.sm,
        marginRight: spacing.xs,
    },
    headerTitle: { ...typography.h2, fontSize: 20, color: colors.text },
    content: { padding: spacing.lg },
    hero: {
        alignItems: 'center',
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
    },
    iconWrap: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
    subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    rowIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    rowContent: {
        flex: 1,
    },
    rowTitle: {
        ...typography.body,
        color: colors.text,
        fontWeight: '700',
        marginBottom: 2,
    },
    rowSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        lineHeight: 18,
    },
});
