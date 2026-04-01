import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/theme';
import { customerColors } from '../../theme/customerTheme';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonList } from '../../components/Skeleton';
import { notificationService, Notification } from '../../services/notificationService';

type Props = { navigation: NativeStackNavigationProp<any> };

const formatTime = (iso: string): string => {
    try {
        const d = new Date(iso);
        const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
        return '';
    }
};

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = useCallback(async () => {
        try {
            const data = await notificationService.getNotifications(1, 20);
            setNotifications(data.notifications);
        } catch (err) {
            console.error('[Notifications] load failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    }, [loadNotifications]);

    const handleMarkAsRead = useCallback(async (item: Notification) => {
        if (item.is_read) return;
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
        try {
            await notificationService.markAsRead(item.id);
        } catch {
            // Revert on failure
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: false } : n));
        }
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        try {
            await notificationService.markAllAsRead();
        } catch {
            // Silently ignore — next refresh will reconcile from the server
        }
    }, []);

    const hasUnread = notifications.some(n => !n.is_read);

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.card, item.is_read && styles.cardRead]}
            activeOpacity={0.88}
            onPress={() => handleMarkAsRead(item)}
        >
            <View style={[styles.dot, item.is_read && styles.dotRead]} />
            <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                    <Text
                        style={[styles.cardTitle, item.is_read && styles.cardTitleRead]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    <Text style={styles.cardTime}>{formatTime(item.created_at)}</Text>
                </View>
                <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={customerColors.primary} />

            <LinearGradient
                colors={[customerColors.primary, customerColors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + spacing.md }]}
            >
                <Ionicons name="notifications" size={120} color="rgba(255,255,255,0.08)" style={styles.headerBgIcon} />
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTitles}>
                        <Text style={styles.headerTitle}>Notifications</Text>
                        <Text style={styles.headerSubtitle}>Stay updated with IONORA CARE</Text>
                    </View>
                    {hasUnread && (
                        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllBtn}>
                            <Text style={styles.markAllText}>Mark all read</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            {isLoading ? (
                <SkeletonList count={6} />
            ) : notifications.length === 0 ? (
                <EmptyState
                    icon="notifications-outline"
                    title="No notifications yet"
                    description="Order updates, booking alerts, and offers will appear here."
                />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[customerColors.primary]}
                            tintColor={customerColors.primary}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    headerBgIcon: {
        position: 'absolute',
        right: -20,
        bottom: -20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 32,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -spacing.sm,
        marginRight: spacing.xs,
    },
    headerTitles: {
        flex: 1,
    },
    headerTitle: {
        ...typography.h2,
        color: '#FFFFFF',
        fontWeight: '800',
    },
    headerSubtitle: {
        ...typography.caption,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginTop: 2,
    },
    markAllBtn: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    markAllText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: spacing.sm,
        padding: spacing.md,
        gap: spacing.sm,
        shadowColor: 'rgba(0,0,0,0.06)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 2,
    },
    cardRead: {
        backgroundColor: '#F9FAFB',
        shadowOpacity: 0,
        elevation: 0,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: customerColors.primary,
        marginTop: 5,
        flexShrink: 0,
    },
    dotRead: {
        backgroundColor: 'transparent',
    },
    cardContent: {
        flex: 1,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    cardTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginRight: spacing.sm,
    },
    cardTitleRead: {
        fontWeight: '500',
        color: colors.textSecondary,
    },
    cardTime: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '500',
        flexShrink: 0,
    },
    cardBody: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
});
