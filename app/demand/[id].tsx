import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { formatBudget, TRANSACTION_LABELS, PROPERTY_LABELS } from '@/lib/format';
import AgentInfo from '@/components/ui/AgentInfo';
import { useAuth } from '@/lib/auth-context';
import { useMatchActions, useUpdateDemand } from '@/lib/hooks';
import { mockDemands } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import type { BuyerDemand } from '@/types';

export default function DemandDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { send: sendMatch, loading: matchLoading } = useMatchActions();
  const { update: updateDemandStatus } = useUpdateDemand();

  const [demand, setDemand] = useState<BuyerDemand | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = profile?.id ?? (__DEV__ ? '1' : '');

  useEffect(() => {
    if (__DEV__) {
      setDemand(mockDemands.find((d) => d.id === id) ?? null);
      setLoading(false);
      return;
    }
    supabase
      .from('buyer_demands')
      .select('*, agent:users(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setDemand(data as BuyerDemand | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Talep Detayı', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </>
    );
  }

  if (!demand) {
    return (
      <>
        <Stack.Screen options={{ title: 'Talep Detayı', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Talep Bulunamadı</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Geri Dön</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const isOwner = demand.agent_id === currentUserId;
  const isSale = demand.transaction_type === 'SALE';
  const locationText = [demand.district, ...(demand.neighborhoods ?? [])].join(', ');

  const criteria: { label: string; value: string | null }[] = [
    { label: 'Min Oda', value: demand.min_rooms },
    { label: 'Min Alan', value: demand.min_area ? `${demand.min_area} m²` : null },
    { label: 'Max Kat', value: demand.max_floor != null ? `${demand.max_floor}. kat` : null },
  ];

  const hasCriteria = criteria.some((c) => c.value !== null);

  const handleMatch = () => {
    Alert.alert('Eşleşme Talebi', 'Bu talep için portföyünüzden eşleşme gönderilecek.', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Gönder',
        onPress: async () => {
          const { error } = await sendMatch({
            targetId: demand.agent_id,
            matchType: 'DEMAND',
            demandId: demand.id,
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
          title: 'Talep Detayı',
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
              {TRANSACTION_LABELS[demand.transaction_type]}
            </Text>
          </View>
          <View style={styles.propertyBadge}>
            <Text style={styles.propertyBadgeText}>
              {PROPERTY_LABELS[demand.property_type]}
            </Text>
          </View>
        </View>

        {/* Location */}
        <Text style={styles.location}>{locationText}</Text>

        {/* Budget */}
        <Text style={styles.budget}>
          {formatBudget(demand.min_budget)} – {formatBudget(demand.max_budget)}
        </Text>

        {/* Criteria */}
        {hasCriteria && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kriterler</Text>
            {criteria.map((row) => {
              if (!row.value) return null;
              return (
                <View key={row.label} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{row.label}</Text>
                  <Text style={styles.detailValue}>{row.value}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Notes */}
        {demand.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notlar</Text>
            <Text style={styles.notesText}>{demand.notes}</Text>
          </View>
        ) : null}

        {/* Agent (blind) */}
        <View style={styles.card}>
          <AgentInfo agent={demand.agent} size="full" />
          <Text style={styles.agentBlindText}>
            Eşleşme sonrası iletişim bilgileri görünür
          </Text>
        </View>

        {/* Owner Actions / Match Button */}
        {isOwner ? (
          <View style={styles.ownerActions}>
            <Pressable
              style={({ pressed }) => [styles.ownerEditBtn, pressed && { opacity: 0.85 }]}
              onPress={() => router.push(`/create/demand?editId=${demand.id}` as any)}
            >
              <Ionicons name="create-outline" size={18} color={Colors.accent} />
              <Text style={styles.ownerEditText}>Düzenle</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.ownerActionBtn, pressed && { opacity: 0.85 }]}
              onPress={() => {
                const options = [
                  { label: 'Aktif', value: 'ACTIVE' },
                  { label: 'Karşılandı', value: 'FULFILLED' },
                ];
                Alert.alert('Durum Değiştir', 'Talebin yeni durumunu seçin', [
                  ...options.map((opt) => ({
                    text: opt.label,
                    onPress: async () => {
                      const { error } = await updateDemandStatus(demand.id, { status: opt.value });
                      if (error) {
                        Alert.alert('Hata', error);
                      } else {
                        setDemand((prev) => prev ? { ...prev, status: opt.value as BuyerDemand['status'] } : null);
                        Alert.alert('Başarılı', `Talep durumu "${opt.label}" olarak güncellendi.`);
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
                Alert.alert('Talebi Sil', 'Bu talep kalıcı olarak silinecek. Emin misiniz?', [
                  { text: 'Vazgeç', style: 'cancel' },
                  {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                      const { error } = await updateDemandStatus(demand.id, { status: 'DELETED' });
                      if (error) {
                        Alert.alert('Hata', error);
                      } else {
                        Alert.alert('Silindi', 'Talep başarıyla silindi.');
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
            <Ionicons name="git-compare-outline" size={18} color={Colors.text.inverse} />
            <Text style={styles.matchButtonText}>Portföyümden Eşle</Text>
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
  budget: { ...Typography.title1, color: Colors.primary, marginBottom: Spacing.xl },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.sm },
  cardTitle: { ...Typography.headline, color: Colors.text.primary, marginBottom: Spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.borderLight },
  detailLabel: { ...Typography.subhead, color: Colors.text.secondary },
  detailValue: { ...Typography.subhead, color: Colors.text.primary, fontWeight: '600' },
  notesText: { ...Typography.body, color: Colors.text.primary, lineHeight: 24 },
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
