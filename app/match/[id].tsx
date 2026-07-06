import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert, ActivityIndicator, Linking } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { formatPrice, formatBudget, formatDate, TRANSACTION_LABELS, PROPERTY_LABELS } from '@/lib/format';
import { useAuth } from '@/lib/auth-context';
import { useMatchActions } from '@/lib/hooks';
import { mockMatches } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { blockUser } from '@/lib/database';
import type { Match, MatchStatus } from '@/types';

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  PENDING: { label: 'Beklemede', color: Colors.warning, icon: 'time-outline' },
  ACCEPTED: { label: 'Kabul Edildi', color: Colors.success, icon: 'checkmark-circle-outline' },
  REJECTED: { label: 'Reddedildi', color: Colors.error, icon: 'close-circle-outline' },
  EXPIRED: { label: 'Süresi Doldu', color: Colors.text.tertiary, icon: 'hourglass-outline' },
};

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { respond, loading: actionLoading } = useMatchActions();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = profile?.id ?? (__DEV__ ? '1' : '');

  useEffect(() => {
    if (__DEV__) {
      setMatch(mockMatches.find((m) => m.id === id) ?? null);
      setLoading(false);
      return;
    }
    supabase
      .from('matches')
      .select('*, requester:users!requester_id(*), target:users!target_id(*), listing:listings(*), demand:buyer_demands(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setMatch(data as Match | null);
        setLoading(false);
      }, () => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'İş Birliği Detayı', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </>
    );
  }

  if (!match) {
    return (
      <>
        <Stack.Screen options={{ title: 'İş Birliği Detayı', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.text.tertiary} />
          <Text style={styles.emptyTitle}>İş Birliği Bulunamadı</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Geri Dön</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const statusConfig = STATUS_CONFIG[match.status];
  const isTarget = match.target_id === currentUserId;
  const isPending = match.status === 'PENDING';
  const isAccepted = match.status === 'ACCEPTED';

  const handleAccept = async () => {
    const { error } = await respond(match.id, 'ACCEPTED');
    if (error) {
      Alert.alert('Hata', error);
      return;
    }
    setMatch((prev) => prev ? { ...prev, status: 'ACCEPTED', responded_at: new Date().toISOString() } : null);
    Alert.alert('İş Birliği Kabul Edildi', 'İletişim bilgileri artık görünür.');
  };

  const handleReject = async () => {
    const { error } = await respond(match.id, 'REJECTED');
    if (error) {
      Alert.alert('Hata', error);
      return;
    }
    setMatch((prev) => prev ? { ...prev, status: 'REJECTED', responded_at: new Date().toISOString() } : null);
    Alert.alert('İş Birliği Reddedildi', 'İş birliği reddedildi.');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'İş Birliği Detayı',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
          headerRight: () => {
            const otherUserId = isTarget ? match.requester_id : match.target_id;
            return (
              <Pressable
                onPress={() => {
                  Alert.alert('Kullanıcı Hakkında', 'Ne yapmak istiyorsunuz?', [
                    {
                      text: 'Kullanıcıyı Engelle',
                      onPress: () => {
                        Alert.alert('Engelle', 'Bu kullanıcının ilanları ve talepleri artık size gösterilmeyecek.', [
                          { text: 'Vazgeç', style: 'cancel' },
                          {
                            text: 'Engelle',
                            style: 'destructive',
                            onPress: async () => {
                              const { error } = await blockUser(currentUserId, otherUserId);
                              Alert.alert(error ? 'Hata' : 'Engellendi', error ?? 'Kullanıcı engellendi.');
                              if (!error) router.back();
                            },
                          },
                        ]);
                      },
                    },
                    { text: 'Vazgeç', style: 'cancel' },
                  ]);
                }}
                hitSlop={12}
                style={{ padding: Spacing.xs }}
              >
                <Ionicons name="flag-outline" size={22} color={Colors.text.secondary} />
              </Pressable>
            );
          },
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '14' }]}>
          <Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Match Type */}
        <Text style={styles.matchType}>
          {match.match_type === 'DEMAND' ? 'Talep İş Birliği' : 'İlan İş Birliği'}
        </Text>

        {/* Listing Summary */}
        {match.listing && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>İlan</Text>
            <View style={styles.summaryBadgeRow}>
              <View style={[styles.summaryBadge, { backgroundColor: match.listing.transaction_type === 'SALE' ? Colors.accent + '14' : Colors.rent + '14' }]}>
                <Text style={[styles.summaryBadgeText, { color: match.listing.transaction_type === 'SALE' ? Colors.accent : Colors.rent }]}>
                  {TRANSACTION_LABELS[match.listing.transaction_type]}
                </Text>
              </View>
              <View style={styles.propertyBadge}>
                <Text style={styles.propertyBadgeText}>
                  {PROPERTY_LABELS[match.listing.property_type]}
                </Text>
              </View>
            </View>
            <Text style={styles.summaryLocation}>
              {[match.listing.district, match.listing.neighborhood].filter(Boolean).join(', ')}
            </Text>
            <Text style={styles.summaryPrice}>{formatPrice(match.listing.price)}</Text>

            {/* Detay bilgileri */}
            <View style={styles.detailGrid}>
              {match.listing.room_count && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Oda</Text>
                  <Text style={styles.detailValue}>{match.listing.room_count}</Text>
                </View>
              )}
              {(match.listing.net_area || match.listing.gross_area) && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Alan</Text>
                  <Text style={styles.detailValue}>
                    {match.listing.net_area ? `${match.listing.net_area}m² net` : `${match.listing.gross_area}m² brüt`}
                  </Text>
                </View>
              )}
              {match.listing.floor != null && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Kat</Text>
                  <Text style={styles.detailValue}>
                    {match.listing.floor}{match.listing.total_floors ? `/${match.listing.total_floors}` : ''}
                  </Text>
                </View>
              )}
              {match.listing.building_age && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Bina Yaşı</Text>
                  <Text style={styles.detailValue}>{match.listing.building_age}</Text>
                </View>
              )}
            </View>
            {(match.listing.has_parking || match.listing.has_elevator) && (
              <View style={styles.featureRow}>
                {match.listing.has_parking && (
                  <View style={styles.featureBadge}>
                    <Ionicons name="car-outline" size={14} color={Colors.text.secondary} />
                    <Text style={styles.featureText}>Otopark</Text>
                  </View>
                )}
                {match.listing.has_elevator && (
                  <View style={styles.featureBadge}>
                    <Ionicons name="arrow-up-outline" size={14} color={Colors.text.secondary} />
                    <Text style={styles.featureText}>Asansör</Text>
                  </View>
                )}
              </View>
            )}
            {match.listing.description && (
              <Text style={styles.descriptionText} numberOfLines={3}>{match.listing.description}</Text>
            )}
          </View>
        )}

        {/* Demand Summary */}
        {match.demand && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Talep</Text>
            <View style={styles.summaryBadgeRow}>
              <View style={[styles.summaryBadge, { backgroundColor: match.demand.transaction_type === 'SALE' ? Colors.accent + '14' : Colors.rent + '14' }]}>
                <Text style={[styles.summaryBadgeText, { color: match.demand.transaction_type === 'SALE' ? Colors.accent : Colors.rent }]}>
                  {TRANSACTION_LABELS[match.demand.transaction_type]}
                </Text>
              </View>
              <View style={styles.propertyBadge}>
                <Text style={styles.propertyBadgeText}>
                  {PROPERTY_LABELS[match.demand.property_type]}
                </Text>
              </View>
            </View>
            <Text style={styles.summaryLocation}>{match.demand.district}</Text>
            {match.demand.neighborhoods?.length > 0 && (
              <Text style={styles.summaryNeighborhoods}>
                {match.demand.neighborhoods.join(', ')}
              </Text>
            )}
            <Text style={styles.summaryPrice}>
              {formatBudget(match.demand.min_budget)} – {formatBudget(match.demand.max_budget)}
            </Text>

            {/* Detay bilgileri */}
            <View style={styles.detailGrid}>
              {match.demand.min_rooms && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Min. Oda</Text>
                  <Text style={styles.detailValue}>{match.demand.min_rooms}+</Text>
                </View>
              )}
              {match.demand.min_area != null && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Min. Alan</Text>
                  <Text style={styles.detailValue}>{match.demand.min_area}m²</Text>
                </View>
              )}
              {match.demand.max_floor != null && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Max. Kat</Text>
                  <Text style={styles.detailValue}>{match.demand.max_floor}</Text>
                </View>
              )}
              {match.demand.building_ages && match.demand.building_ages.length > 0 && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Bina Yaşı</Text>
                  <Text style={styles.detailValue}>{match.demand.building_ages.join(', ')}</Text>
                </View>
              )}
            </View>
            {match.demand.notes && (
              <Text style={styles.descriptionText} numberOfLines={3}>{match.demand.notes}</Text>
            )}
          </View>
        )}

        {/* Message */}
        {match.message ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mesaj</Text>
            <Text style={styles.messageText}>{match.message}</Text>
          </View>
        ) : null}

        {/* Contact Box (Accepted) */}
        {isAccepted && (() => {
          const otherAgent = isTarget ? match.requester : match.target;
          // Telefon numarasını WhatsApp formatına çevir (sadece rakamlar, 90 ile başlayan 12 haneli)
          const rawPhone = otherAgent?.phone ?? '';
          const digits = rawPhone.replace(/\D/g, '');
          const otherPhone = digits.startsWith('90') && digits.length === 12
            ? digits
            : digits.startsWith('0') && digits.length === 11
              ? '90' + digits.slice(1)
              : digits.length === 10
                ? '90' + digits
                : digits;

          // WhatsApp mesajı — ilan/talep detayı ile
          let whatsappMsg = 'Merhaba, Beraber Satalım üzerinden ';
          if (match.listing) {
            const l = match.listing;
            const info = [l.district, TRANSACTION_LABELS[l.transaction_type], PROPERTY_LABELS[l.property_type]].filter(Boolean).join(', ');
            const extra = [l.room_count, l.price > 0 ? formatPrice(l.price) : null].filter(Boolean).join(', ');
            whatsappMsg += `${info}${extra ? ` (${extra})` : ''} ilanı hakkında iletişime geçiyorum.`;
          } else if (match.demand) {
            const d = match.demand;
            const info = [d.district, TRANSACTION_LABELS[d.transaction_type], PROPERTY_LABELS[d.property_type]].filter(Boolean).join(', ');
            whatsappMsg += `${info} talebi hakkında iletişime geçiyorum.`;
          } else {
            whatsappMsg += 'iletişime geçiyorum.';
          }

          return (
            <>
              <View style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <Ionicons name="call-outline" size={18} color={Colors.success} />
                  <Text style={styles.contactTitle}>İletişim Bilgileri</Text>
                </View>
                {match.requester?.name && (
                  <View style={styles.contactRow}>
                    <Text style={styles.contactLabel}>
                      {match.match_type === 'DEMAND' ? 'İlan Sahibi' : 'Talep Sahibi'}
                    </Text>
                    <Text style={styles.contactValue}>
                      {match.requester.name}
                      {match.requester.phone ? ` — ${match.requester.phone}` : ''}
                    </Text>
                  </View>
                )}
                {match.target?.name && (
                  <View style={styles.contactRow}>
                    <Text style={styles.contactLabel}>
                      {match.match_type === 'DEMAND' ? 'Talep Sahibi' : 'İlan Sahibi'}
                    </Text>
                    <Text style={styles.contactValue}>
                      {match.target.name}
                      {match.target.phone ? ` — ${match.target.phone}` : ''}
                    </Text>
                  </View>
                )}
              </View>

              {/* WhatsApp & Ara butonları */}
              {otherPhone ? (
                <View style={styles.contactActions}>
                  <Pressable
                    style={({ pressed }) => [styles.whatsappButton, pressed && { opacity: 0.85 }]}
                    onPress={() => {
                      if (otherAgent?.is_mock) {
                        Alert.alert('Bilgi', 'Bu ilan kullanıcı tarafından yayından kaldırılmıştır.');
                        return;
                      }
                      Linking.openURL(`https://wa.me/${otherPhone}?text=${encodeURIComponent(whatsappMsg)}`);
                    }}
                  >
                    <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                    <Text style={styles.whatsappButtonText}>WhatsApp</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.callButton, pressed && { opacity: 0.85 }]}
                    onPress={() => {
                      if (otherAgent?.is_mock) {
                        Alert.alert('Bilgi', 'Bu ilan kullanıcı tarafından yayından kaldırılmıştır.');
                        return;
                      }
                      Linking.openURL(`tel:${otherPhone}`);
                    }}
                  >
                    <Ionicons name="call" size={20} color={Colors.primary} />
                    <Text style={styles.callButtonText}>Ara</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          );
        })()}

        {/* Accept / Reject */}
        {isPending && isTarget && (
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [styles.rejectButton, pressed && { opacity: 0.85 }]}
              onPress={handleReject}
              disabled={actionLoading}
            >
              <Ionicons name="close" size={18} color={Colors.error} />
              <Text style={styles.rejectButtonText}>Reddet</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.acceptButton, pressed && { opacity: 0.85 }]}
              onPress={handleAccept}
              disabled={actionLoading}
            >
              <Ionicons name="checkmark" size={18} color={Colors.text.inverse} />
              <Text style={styles.acceptButtonText}>Kabul Et</Text>
            </Pressable>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Zaman Çizelgesi</Text>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.timelineText}>
              Talep gönderildi: {formatDate(match.created_at)}
            </Text>
          </View>
          {match.responded_at && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: match.status === 'ACCEPTED' ? Colors.success : Colors.error }]} />
              <Text style={styles.timelineText}>
                Yanıtlandı: {formatDate(match.responded_at)}
              </Text>
            </View>
          )}
        </View>
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
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.sm, marginBottom: Spacing.md },
  statusText: { ...Typography.subhead, fontWeight: '600' },
  matchType: { ...Typography.title2, color: Colors.text.primary, marginBottom: Spacing.xl },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.sm },
  cardTitle: { ...Typography.headline, color: Colors.text.primary, marginBottom: Spacing.md },
  summaryBadgeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  summaryBadge: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm },
  summaryBadgeText: { ...Typography.caption1, fontWeight: '600' },
  propertyBadge: { backgroundColor: Colors.primary + '0A', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm },
  propertyBadgeText: { ...Typography.caption1, color: Colors.primary, fontWeight: '600' },
  summaryLocation: { ...Typography.subhead, color: Colors.text.secondary, marginBottom: Spacing.xs },
  summaryNeighborhoods: { ...Typography.footnote, color: Colors.text.tertiary, marginBottom: Spacing.xs },
  summaryPrice: { ...Typography.title3, color: Colors.primary, fontWeight: '700' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.borderLight },
  detailItem: { minWidth: '40%' as any },
  detailLabel: { ...Typography.caption1, color: Colors.text.tertiary, marginBottom: 2 },
  detailValue: { ...Typography.subhead, color: Colors.text.primary, fontWeight: '600' },
  featureRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  featureBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '0A', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm },
  featureText: { ...Typography.caption1, color: Colors.text.secondary },
  descriptionText: { ...Typography.footnote, color: Colors.text.secondary, marginTop: Spacing.md, lineHeight: 20 },
  messageText: { ...Typography.body, color: Colors.text.primary, fontStyle: 'italic', lineHeight: 24 },
  contactCard: { backgroundColor: Colors.success + '0A', borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.success + '28' },
  contactHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  contactTitle: { ...Typography.headline, color: Colors.success },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.success + '28' },
  contactLabel: { ...Typography.subhead, color: Colors.text.secondary },
  contactValue: { ...Typography.subhead, color: Colors.text.primary, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  contactActions: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  whatsappButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366', borderRadius: Radius.md, paddingVertical: Spacing.lg, gap: Spacing.sm },
  whatsappButtonText: { ...Typography.subhead, color: '#fff', fontWeight: '600' },
  callButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary + '0A', borderRadius: Radius.md, paddingVertical: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.primary + '28' },
  callButtonText: { ...Typography.subhead, color: Colors.primary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  rejectButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.error + '0A', borderRadius: Radius.md, paddingVertical: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.error + '28' },
  rejectButtonText: { ...Typography.subhead, color: Colors.error, fontWeight: '600' },
  acceptButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.success, borderRadius: Radius.md, paddingVertical: Spacing.lg, gap: Spacing.sm },
  acceptButtonText: { ...Typography.subhead, color: Colors.text.inverse, fontWeight: '600' },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineText: { ...Typography.subhead, color: Colors.text.secondary },
});
