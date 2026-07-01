import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useNotifications } from '@/lib/hooks';
import type { AppNotification } from '@/types';

const NOTIFICATION_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  match_request: { name: 'people-outline', color: Colors.accent },
  match_accepted: { name: 'checkmark-circle-outline', color: '#34C759' },
  match_rejected: { name: 'close-circle-outline', color: Colors.error },
  auto_match_listing: { name: 'business-outline', color: Colors.primary },
  auto_match_demand: { name: 'heart-outline', color: Colors.primary },
  expertise_listing: { name: 'location-outline', color: '#FF9500' },
  expertise_demand: { name: 'location-outline', color: '#FF9500' },
};

function getNotificationRoute(notification: AppNotification): string | null {
  const { type, reference_id } = notification;
  if (!reference_id) return null;

  if (type.includes('match')) return `/match/${reference_id}`;
  if (type.includes('listing')) return `/listing/${reference_id}`;
  if (type.includes('demand')) return `/demand/${reference_id}`;
  return null;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes}dk`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}sa`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}g`;
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: notifications, loading, refetch, markRead, markAllRead } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);

  const unreadCount = notifications.filter((n) => n.status !== 'read').length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleTap = useCallback(async (notification: AppNotification) => {
    if (notification.status !== 'read') {
      markRead(notification.id);
    }
    const route = getNotificationRoute(notification);
    if (route) {
      router.push(route as any);
    }
  }, [markRead, router]);

  const renderItem = useCallback(({ item }: { item: AppNotification }) => {
    const isUnread = item.status !== 'read';
    const iconConfig = NOTIFICATION_ICONS[item.type] ?? { name: 'notifications-outline' as const, color: Colors.text.secondary };

    return (
      <Pressable
        style={({ pressed }) => [
          styles.notifCard,
          isUnread && styles.notifCardUnread,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => handleTap(item)}
      >
        {isUnread && <View style={styles.unreadDot} />}
        <View style={[styles.iconContainer, { backgroundColor: iconConfig.color + '14' }]}>
          <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, isUnread && styles.notifTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notifBody} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        <Text style={styles.notifTime}>{formatTimeAgo(item.created_at)}</Text>
      </Pressable>
    );
  }, [handleTap]);

  const keyExtractor = useCallback((item: AppNotification) => item.id, []);

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bildirimler</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bildirimler</Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllRead} hitSlop={8}>
            <Text style={styles.markAllText}>Tümünü Oku</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={56} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Henüz bildirim yok</Text>
            <Text style={styles.emptySubtitle}>
              İlan ve talep eşleşmeleri, iş birliği talepleri ve bölge bildirimleri burada görünecek.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: { ...Typography.title2, color: Colors.text.primary },
  markAllText: { ...Typography.subhead, color: Colors.accent, fontWeight: '600' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingVertical: Spacing.sm },
  emptyList: { flex: 1 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  notifCardUnread: {
    backgroundColor: Colors.accent + '06',
  },
  unreadDot: {
    position: 'absolute',
    left: Spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  notifContent: { flex: 1, marginRight: Spacing.sm },
  notifTitle: { ...Typography.subhead, color: Colors.text.primary, marginBottom: 2 },
  notifTitleUnread: { fontWeight: '700' },
  notifBody: { ...Typography.footnote, color: Colors.text.secondary, lineHeight: 18 },
  notifTime: { ...Typography.caption2, color: Colors.text.tertiary },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.md,
  },
  emptyTitle: { ...Typography.headline, color: Colors.text.primary },
  emptySubtitle: { ...Typography.subhead, color: Colors.text.tertiary, textAlign: 'center', lineHeight: 22 },
});
