import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { getPendingLicenses, reviewLicense } from '@/lib/database';
import { formatDate } from '@/lib/format';
import type { User } from '@/types';

export default function AdminLicensesScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = profile?.is_admin ?? (__DEV__ ? true : false);

  const fetch = useCallback(async () => {
    if (__DEV__) {
      setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await getPendingLicenses();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Yetkisiz', 'Bu sayfaya erişim yetkiniz yok.');
      router.back();
      return;
    }
    fetch();
  }, [isAdmin, fetch, router]);

  const handleReview = useCallback(
    async (userId: string, status: 'approved' | 'rejected') => {
      if (!profile?.id) return;

      const label = status === 'approved' ? 'onaylamak' : 'reddetmek';
      Alert.alert(
        'Onay',
        `Bu yetki belgesini ${label} istediğinize emin misiniz?`,
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: status === 'approved' ? 'Onayla' : 'Reddet',
            style: status === 'rejected' ? 'destructive' : 'default',
            onPress: async () => {
              setActionLoading(userId);
              const { error } = await reviewLicense(userId, status, profile.id);
              setActionLoading(null);
              if (error) {
                Alert.alert('Hata', error);
              } else {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
                Alert.alert(
                  'Başarılı',
                  status === 'approved'
                    ? 'Yetki belgesi onaylandı.'
                    : 'Yetki belgesi reddedildi.'
                );
              }
            },
          },
        ]
      );
    },
    [profile?.id]
  );

  const renderItem = useCallback(
    ({ item }: { item: User }) => {
      const isProcessing = actionLoading === item.id;
      return (
        <View style={styles.card}>
          {/* User Info */}
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.name ?? '?').substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name ?? 'İsimsiz'}</Text>
              <Text style={styles.userCompany}>{item.company_name ?? '—'}</Text>
              <Text style={styles.userMeta}>
                {item.email} {item.phone ? `• ${item.phone}` : ''}
              </Text>
              <Text style={styles.userDate}>
                Kayıt: {formatDate(item.created_at)}
              </Text>
            </View>
          </View>

          {/* License Image */}
          {item.license_image_url ? (
            <Pressable
              onPress={() => {
                if (item.license_image_url) {
                  Linking.openURL(item.license_image_url);
                }
              }}
            >
              <Image
                source={{ uri: item.license_image_url }}
                style={styles.licenseImage}
                resizeMode="cover"
              />
              <Text style={styles.imageHint}>Büyütmek için dokunun</Text>
            </Pressable>
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={32} color={Colors.text.tertiary} />
              <Text style={styles.noImageText}>Belge yüklenmemiş</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [styles.rejectBtn, pressed && { opacity: 0.85 }]}
              onPress={() => handleReview(item.id, 'rejected')}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={Colors.error} />
              ) : (
                <>
                  <Ionicons name="close" size={18} color={Colors.error} />
                  <Text style={styles.rejectText}>Reddet</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.approveBtn, pressed && { opacity: 0.85 }]}
              onPress={() => handleReview(item.id, 'approved')}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={Colors.text.inverse} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color={Colors.text.inverse} />
                  <Text style={styles.approveText}>Onayla</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      );
    },
    [actionLoading, handleReview]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Lisans Onay',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
        }}
      />
      <FlatList
        data={users}
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
              <Text style={styles.emptyTitle}>Tüm belgeler incelendi</Text>
              <Text style={styles.emptySubtitle}>
                Bekleyen yetki belgesi yok.
              </Text>
            </View>
          ) : null
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  userRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.headline,
    color: Colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.headline,
    color: Colors.text.primary,
  },
  userCompany: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  userMeta: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
  },
  userDate: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  licenseImage: {
    width: '100%',
    height: 200,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xs,
  },
  imageHint: {
    ...Typography.caption2,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  noImage: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  noImageText: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.error + '0A',
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error + '28',
  },
  rejectText: {
    ...Typography.subhead,
    color: Colors.error,
    fontWeight: '600',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
  },
  approveText: {
    ...Typography.subhead,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});
