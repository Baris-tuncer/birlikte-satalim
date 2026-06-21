import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { formatPrice, TRANSACTION_LABELS, PROPERTY_LABELS } from '@/lib/format';
import AgentInfo from '@/components/ui/AgentInfo';
import { useAuth } from '@/lib/auth-context';
import { useMatchActions, useUpdateListing } from '@/lib/hooks';
import { mockListings } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import type { Listing } from '@/types';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { send: sendMatch, loading: matchLoading } = useMatchActions();
  const { update: updateListingStatus } = useUpdateListing();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = profile?.id ?? (__DEV__ ? '1' : '');

  useEffect(() => {
    if (__DEV__) {
      setListing(mockListings.find((l) => l.id === id) ?? null);
      setLoading(false);
      return;
    }
    supabase
      .from('listings')
      .select('*, agent:users(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setListing(data as Listing | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'İlan Detayı', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Stack.Screen options={{ title: 'İlan Detayı', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.text.tertiary} />
          <Text style={styles.emptyTitle}>İlan Bulunamadı</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Geri Dön</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const isOwner = listing.agent_id === currentUserId;
  const isSale = listing.transaction_type === 'SALE';

  const isUrbanRenewal = listing.property_type === 'URBAN_RENEWAL';

  const details: { label: string; value: string | null }[] = isUrbanRenewal
    ? [
        { label: 'Ada', value: listing.ada ?? null },
        { label: 'Parsel', value: listing.parsel ?? null },
      ]
    : [
        { label: 'Oda Sayısı', value: listing.room_count },
        { label: 'Net Alan', value: listing.net_area ? `${listing.net_area} m²` : null },
        { label: 'Brüt Alan', value: listing.gross_area ? `${listing.gross_area} m²` : null },
        { label: 'Kat', value: listing.floor != null && listing.total_floors != null ? `${listing.floor} / ${listing.total_floors}` : listing.floor != null ? `${listing.floor}` : null },
        { label: 'Bina Yaşı', value: listing.building_age != null ? `${listing.building_age} yıl` : null },
        { label: 'Otopark', value: listing.has_parking != null ? (listing.has_parking ? 'Var' : 'Yok') : null },
        { label: 'Asansör', value: listing.has_elevator != null ? (listing.has_elevator ? 'Var' : 'Yok') : null },
        { label: 'Isıtma', value: listing.heating_type },
      ];

  const handleMatch = () => {
    Alert.alert('Müşterim Var', 'Bu ilan için müşteriniz olduğunu bildireceksiniz. Karşı taraf kabul ederse iletişim bilgileriniz paylaşılacak.', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Gönder',
        onPress: async () => {
          const { error } = await sendMatch({
            targetId: listing.agent_id,
            matchType: 'LISTING',
            listingId: listing.id,
          });
          if (error) {
            Alert.alert('Hata', error);
          } else {
            Alert.alert('Başarılı', 'Eşleşme talebi gönderildi.');
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'İlan Detayı',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: isSale ? Colors.accent + '14' : Colors.rent + '14' }]}>
            <Text style={[styles.badgeText, { color: isSale ? Colors.accent : Colors.rent }]}>
              {TRANSACTION_LABELS[listing.transaction_type]}
            </Text>
          </View>
          <View style={styles.propertyBadge}>
            <Text style={styles.propertyBadgeText}>
              {PROPERTY_LABELS[listing.property_type]}
            </Text>
          </View>
        </View>

        {/* Location */}
        <Text style={styles.location}>
          {[listing.district, listing.neighborhood].filter(Boolean).join(', ')}
        </Text>

        {/* Price */}
        {!isUrbanRenewal && listing.price > 0 && (
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        )}

        {/* Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detaylar</Text>
          {details.map((row) => {
            if (!row.value) return null;
            return (
              <View key={row.label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            );
          })}
        </View>

        {/* Description */}
        {listing.description ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Açıklama</Text>
            <Text style={styles.descriptionText}>{listing.description}</Text>
          </View>
        ) : null}

        {/* Agent (blind) */}
        <View style={styles.card}>
          <AgentInfo agent={listing.agent} size="full" />
          <Text style={styles.agentBlindText}>
            Eşleşme sonrası iletişim bilgileri görünür
          </Text>
        </View>

        {/* Owner Actions / Match Button */}
        {isOwner ? (
          <View style={styles.ownerActions}>
            <Pressable
              style={({ pressed }) => [styles.ownerEditBtn, pressed && { opacity: 0.85 }]}
              onPress={() => router.push(`/create/listing?editId=${listing.id}` as any)}
            >
              <Ionicons name="create-outline" size={18} color={Colors.accent} />
              <Text style={styles.ownerEditText}>Düzenle</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.ownerActionBtn, pressed && { opacity: 0.85 }]}
              onPress={() => {
                const options = [
                  { label: 'Aktif', value: 'ACTIVE' },
                  { label: 'Durduruldu', value: 'PAUSED' },
                  { label: 'Satıldı', value: 'SOLD' },
                  { label: 'Kiralandı', value: 'RENTED' },
                ];
                Alert.alert('Durum Değiştir', 'İlanın yeni durumunu seçin', [
                  ...options.map((opt) => ({
                    text: opt.label,
                    onPress: async () => {
                      const { error } = await updateListingStatus(listing.id, { status: opt.value });
                      if (error) {
                        Alert.alert('Hata', error);
                      } else {
                        setListing((prev) => prev ? { ...prev, status: opt.value as Listing['status'] } : null);
                        Alert.alert('Başarılı', `İlan durumu "${opt.label}" olarak güncellendi.`);
                      }
                    },
                  })),
                  { text: 'Vazgeç', style: 'cancel' as const },
                ]);
              }}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color={Colors.primary} />
              <Text style={styles.ownerActionText}>Durum Değiştir</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.ownerDeleteBtn, pressed && { opacity: 0.85 }]}
              onPress={() => {
                Alert.alert('İlanı Sil', 'Bu ilan kalıcı olarak silinecek. Emin misiniz?', [
                  { text: 'Vazgeç', style: 'cancel' },
                  {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                      const { error } = await updateListingStatus(listing.id, { status: 'DELETED' });
                      if (error) {
                        Alert.alert('Hata', error);
                      } else {
                        Alert.alert('Silindi', 'İlan başarıyla silindi.');
                        router.back();
                      }
                    },
                  },
                ]);
              }}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
              <Text style={styles.ownerDeleteText}>Sil</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.matchButton,
              pressed && styles.matchButtonPressed,
            ]}
            onPress={handleMatch}
            disabled={matchLoading}
          >
            <Ionicons name="people" size={18} color={Colors.text.inverse} />
            <Text style={styles.matchButtonText}>Müşterim Var</Text>
          </Pressable>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing['5xl'] },
  emptyContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  emptyTitle: { ...Typography.headline, color: Colors.text.primary },
  backBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  backBtnText: { ...Typography.subhead, color: Colors.text.inverse, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm },
  badgeText: { ...Typography.caption1, fontWeight: '600' },
  propertyBadge: { backgroundColor: Colors.primary + '0A', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm },
  propertyBadgeText: { ...Typography.caption1, color: Colors.primary, fontWeight: '600' },
  location: { ...Typography.headline, color: Colors.text.primary, marginBottom: Spacing.sm },
  price: { ...Typography.title1, color: Colors.primary, marginBottom: Spacing.xl },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.sm },
  cardTitle: { ...Typography.headline, color: Colors.text.primary, marginBottom: Spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.borderLight },
  detailLabel: { ...Typography.subhead, color: Colors.text.secondary },
  detailValue: { ...Typography.subhead, color: Colors.text.primary, fontWeight: '600' },
  descriptionText: { ...Typography.body, color: Colors.text.primary, lineHeight: 24 },
  agentBlindText: { ...Typography.caption1, color: Colors.text.tertiary, marginTop: Spacing.sm },
  ownerActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm, flexWrap: 'wrap' },
  ownerEditBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.accent + '0A', borderRadius: Radius.md, paddingVertical: Spacing.lg, borderWidth: 1, borderColor: Colors.accent + '28' },
  ownerEditText: { ...Typography.subhead, color: Colors.accent, fontWeight: '600' },
  ownerActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary + '0A', borderRadius: Radius.md, paddingVertical: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '28' },
  ownerActionText: { ...Typography.subhead, color: Colors.primary, fontWeight: '600' },
  ownerDeleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.error + '0A', borderRadius: Radius.md, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, borderWidth: 1, borderColor: Colors.error + '28' },
  ownerDeleteText: { ...Typography.subhead, color: Colors.error, fontWeight: '600' },
  matchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, gap: Spacing.sm, ...Shadows.md },
  matchButtonPressed: { backgroundColor: Colors.accentDark },
  matchButtonText: { ...Typography.headline, color: Colors.text.inverse },
});
