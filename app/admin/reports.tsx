import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { getContentReports, updateReportStatus } from '@/lib/database';
import { timeAgo } from '@/lib/format';
import type { ContentReport } from '@/lib/database';

const REASON_LABELS: Record<string, string> = {
  MISLEADING: 'Yanıltıcı İçerik',
  INAPPROPRIATE: 'Uygunsuz İçerik',
  SPAM: 'Spam',
  OTHER: 'Diğer',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  REVIEWED: 'İncelendi',
  RESOLVED: 'Çözüldü',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: Colors.warning,
  REVIEWED: Colors.accent,
  RESOLVED: Colors.success,
};

type FilterStatus = 'ALL' | 'PENDING' | 'REVIEWED' | 'RESOLVED';

export default function AdminReportsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('PENDING');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = profile?.is_admin ?? (__DEV__ ? true : false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const statusFilter = filter === 'ALL' ? undefined : filter;
    const { data } = await getContentReports(statusFilter as any);
    setReports(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Yetkisiz', 'Bu sayfaya erişim yetkiniz yok.');
      router.back();
      return;
    }
    fetchReports();
  }, [isAdmin, fetchReports, router]);

  const handleUpdateStatus = useCallback(
    async (reportId: string, status: 'REVIEWED' | 'RESOLVED') => {
      setActionLoading(reportId);
      const { error } = await updateReportStatus(reportId, status);
      setActionLoading(null);
      if (error) {
        Alert.alert('Hata', error);
      } else {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status } : r))
        );
      }
    },
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: ContentReport }) => {
      const isProcessing = actionLoading === item.id;
      const statusColor = STATUS_COLORS[item.status] ?? Colors.text.tertiary;

      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: item.content_type === 'LISTING' ? Colors.primary + '14' : Colors.accent + '14' }]}>
              <Ionicons
                name={item.content_type === 'LISTING' ? 'home-outline' : 'search-outline'}
                size={14}
                color={item.content_type === 'LISTING' ? Colors.primary : Colors.accent}
              />
              <Text style={[styles.typeText, { color: item.content_type === 'LISTING' ? Colors.primary : Colors.accent }]}>
                {item.content_type === 'LISTING' ? 'İlan' : 'Talep'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '14' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {STATUS_LABELS[item.status]}
              </Text>
            </View>
          </View>

          <View style={styles.reasonRow}>
            <Ionicons name="flag-outline" size={16} color={Colors.error} />
            <Text style={styles.reasonText}>{REASON_LABELS[item.reason] ?? item.reason}</Text>
          </View>

          <View style={styles.reporterRow}>
            <Ionicons name="person-outline" size={14} color={Colors.text.tertiary} />
            <Text style={styles.reporterText}>
              {item.reporter?.name ?? 'Bilinmeyen'} ({item.reporter?.email ?? '—'})
            </Text>
          </View>

          <Text style={styles.timeText}>{timeAgo(item.created_at)}</Text>

          {item.status === 'PENDING' && (
            <View style={styles.actionsRow}>
              <Pressable
                style={({ pressed }) => [styles.reviewBtn, pressed && { opacity: 0.85 }]}
                onPress={() => handleUpdateStatus(item.id, 'REVIEWED')}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={Colors.accent} />
                ) : (
                  <>
                    <Ionicons name="eye-outline" size={16} color={Colors.accent} />
                    <Text style={styles.reviewBtnText}>İncelendi</Text>
                  </>
                )}
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.resolveBtn, pressed && { opacity: 0.85 }]}
                onPress={() => handleUpdateStatus(item.id, 'RESOLVED')}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={Colors.text.inverse} />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color={Colors.text.inverse} />
                    <Text style={styles.resolveBtnText}>Çözüldü</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {item.status === 'REVIEWED' && (
            <Pressable
              style={({ pressed }) => [styles.resolveBtn, { marginTop: Spacing.md }, pressed && { opacity: 0.85 }]}
              onPress={() => handleUpdateStatus(item.id, 'RESOLVED')}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={Colors.text.inverse} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color={Colors.text.inverse} />
                  <Text style={styles.resolveBtnText}>Çözüldü Olarak İşaretle</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      );
    },
    [actionLoading, handleUpdateStatus]
  );

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'PENDING', label: 'Bekleyen' },
    { key: 'REVIEWED', label: 'İncelenen' },
    { key: 'RESOLVED', label: 'Çözülen' },
    { key: 'ALL', label: 'Tümü' },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Şikayetler',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
        }}
      />
      <View style={styles.container}>
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            loading ? (
              <ActivityIndicator style={styles.loader} size="large" color={Colors.accent} />
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Ionicons name="checkmark-done-outline" size={48} color={Colors.success} />
                <Text style={styles.emptyTitle}>
                  {filter === 'PENDING' ? 'Bekleyen şikayet yok' : 'Şikayet bulunamadı'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {filter === 'PENDING'
                    ? 'Tüm şikayetler incelenmiş.'
                    : 'Bu filtrede şikayet bulunmuyor.'}
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterChipText: {
    ...Typography.caption1,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.text.inverse,
  },
  listContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  loader: {
    paddingVertical: Spacing['3xl'],
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  typeText: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  statusText: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reasonText: {
    ...Typography.headline,
    color: Colors.text.primary,
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  reporterText: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
  },
  timeText: {
    ...Typography.caption2,
    color: Colors.text.tertiary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  reviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accent + '0A',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent + '28',
  },
  reviewBtnText: {
    ...Typography.subhead,
    color: Colors.accent,
    fontWeight: '600',
  },
  resolveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.success,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  resolveBtnText: {
    ...Typography.subhead,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});
