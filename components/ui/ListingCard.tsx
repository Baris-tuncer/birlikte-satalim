import React from 'react';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import type { Listing } from '@/types';
import {
  formatPrice,
  formatDate,
  TRANSACTION_LABELS,
  PROPERTY_LABELS,
} from '@/lib/format';
import type { ComponentProps } from 'react';
import AgentInfo from '@/components/ui/AgentInfo';

interface ListingCardProps {
  listing: Listing;
  onMatch: (listingId: string) => void;
  onRemove?: (listingId: string) => void;
  isOwnListing?: boolean;
  currentUserName?: string;
}

export default function ListingCard({
  listing,
  onMatch,
  onRemove,
  isOwnListing = false,
  currentUserName,
}: ListingCardProps) {
  const router = useRouter();
  const isSale = listing.transaction_type === 'SALE';

  const cityLabel = listing.city && listing.city !== 'İstanbul' ? listing.city : '';
  const locationText = [cityLabel, listing.district, listing.neighborhood]
    .filter(Boolean)
    .join(', ');

  const features: { label: string }[] = [];
  if (listing.has_parking) features.push({ label: 'Otopark' });
  if (listing.has_elevator) features.push({ label: 'Asansör' });
  if (listing.heating_type) features.push({ label: listing.heating_type });

  return (
    <View style={styles.card}>
      <Pressable onPress={() => router.push(`/listing/${listing.id}` as any)} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {/* Top row: badges + time */}
      <View style={styles.topRow}>
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isSale
                  ? Colors.accent + '14'
                  : Colors.rent + '14',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isSale ? Colors.accent : Colors.rent },
              ]}
            >
              {TRANSACTION_LABELS[listing.transaction_type]}
            </Text>
          </View>
          <View style={styles.propertyBadge}>
            <Text style={styles.propertyBadgeText}>
              {PROPERTY_LABELS[listing.property_type]}
            </Text>
          </View>
        </View>
        <Text style={styles.timeText}>{listing.created_at ? formatDate(listing.created_at) : '—'}</Text>
      </View>

      {/* Location */}
      <Text style={styles.locationText}>{locationText}</Text>

      {/* Price tag */}
      {listing.property_type !== 'URBAN_RENEWAL' && listing.price > 0 && (
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>{formatPrice(listing.price)}</Text>
        </View>
      )}

      {/* Ada / Parsel (Kentsel Dönüşüm) */}
      {listing.property_type === 'URBAN_RENEWAL' && (listing.ada || listing.parsel) && (
        <View style={styles.chipsRow}>
          {listing.ada && (
            <View style={styles.chip}>
              <Ionicons name="map-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.chipText}>Ada: {listing.ada}</Text>
            </View>
          )}
          {listing.parsel && (
            <View style={styles.chip}>
              <Ionicons name="grid-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.chipText}>Parsel: {listing.parsel}</Text>
            </View>
          )}
        </View>
      )}

      {/* Property details chips */}
      {listing.property_type !== 'URBAN_RENEWAL' && (
      <View style={styles.chipsRow}>
        {listing.room_count != null && (
          <View style={styles.chip}>
            <Ionicons
              name="bed-outline"
              size={14}
              color={Colors.text.secondary}
            />
            <Text style={styles.chipText}>{listing.room_count}</Text>
          </View>
        )}
        {listing.net_area != null && (
          <View style={styles.chip}>
            <Ionicons
              name="resize-outline"
              size={14}
              color={Colors.text.secondary}
            />
            <Text style={styles.chipText}>{listing.net_area}m² net</Text>
          </View>
        )}
        {listing.floor != null && listing.total_floors != null && (
          <View style={styles.chip}>
            <Ionicons
              name="layers-outline"
              size={14}
              color={Colors.text.secondary}
            />
            <Text style={styles.chipText}>
              {listing.floor}/{listing.total_floors}. kat
            </Text>
          </View>
        )}
        {listing.building_age != null && (
          <View style={styles.chip}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={Colors.text.secondary}
            />
            <Text style={styles.chipText}>
              {listing.building_age} yıl
            </Text>
          </View>
        )}
      </View>
      )}

      {/* Features row */}
      {features.length > 0 && listing.property_type !== 'URBAN_RENEWAL' && (
        <View style={styles.featuresRow}>
          {features.map((feature) => (
            <View key={feature.label} style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>{feature.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Description */}
      {listing.description ? (
        <Text style={styles.descriptionText} numberOfLines={2}>
          {listing.description}
        </Text>
      ) : null}

      {/* Orijinal ilan linki badge */}
      {listing.listing_url ? (
        <View style={styles.linkBadge}>
          <Ionicons name="link-outline" size={12} color={Colors.primary} />
          <Text style={styles.linkBadgeText}>Orijinal ilan linki mevcut</Text>
        </View>
      ) : null}

      </Pressable>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Agent row (blind) */}
      <View style={styles.agentRow}>
        <AgentInfo
          agent={listing.agent}
          size="compact"
          showContactActions={!isOwnListing}
          currentUserName={currentUserName}
        />
      </View>

      {/* Owner: showing cert + edit + remove buttons / Non-owner: match button */}
      {isOwnListing ? (
        <>
          <Pressable
            style={({ pressed }) => [
              styles.showingCertButton,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => router.push(`/tools/showing-certificate?listingId=${listing.id}` as any)}
          >
            <Ionicons name="document-text-outline" size={18} color={Colors.accent} />
            <Text style={styles.showingCertButtonText}>Yer Gösterme Belgesi Hazırla</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
          </Pressable>
          {!isSale && (
            <Pressable
              style={({ pressed }) => [
                styles.rentalContractButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                const params = new URLSearchParams({
                  propertyAddress: [listing.district, listing.neighborhood].filter(Boolean).join(', ') + (listing.city ? ` / ${listing.city}` : ''),
                  propertyType: PROPERTY_LABELS[listing.property_type] ?? '',
                  roomCount: listing.room_count ?? '',
                  squareMeters: listing.net_area ? String(listing.net_area) : '',
                  rentAmount: listing.price > 0 ? String(listing.price) : '',
                });
                router.push(`/tools/rental-contract?${params.toString()}` as any);
              }}
            >
              <Ionicons name="document-attach-outline" size={18} color={Colors.rent} />
              <Text style={styles.rentalContractButtonText}>Kira Kontratı Oluştur</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
            </Pressable>
          )}
          <View style={styles.ownerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.editButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => router.push(`/create/listing?editId=${listing.id}` as any)}
            >
              <Ionicons name="create-outline" size={18} color={Colors.accent} />
              <Text style={styles.editButtonText}>Düzenle</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.removeButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                Alert.alert(
                  'İlanı Kaldır',
                  'Bu ilan kaldırılacak ve artık diğer danışmanlar tarafından görülmeyecek. Emin misiniz?',
                  [
                    { text: 'Vazgeç', style: 'cancel' },
                    {
                      text: 'Kaldır',
                      style: 'destructive',
                      onPress: () => onRemove?.(listing.id),
                    },
                  ]
                );
              }}
            >
              <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
              <Text style={styles.removeButtonText}>Kaldır</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.matchButton,
            pressed && styles.matchButtonPressed,
          ]}
          onPress={() => onMatch(listing.id)}
        >
          <Ionicons name="people" size={18} color={Colors.text.inverse} />
          <Text style={styles.matchButtonText}>Müşterim Var</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  badgeText: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  propertyBadge: {
    backgroundColor: Colors.primary + '0A',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  propertyBadgeText: {
    ...Typography.caption1,
    color: Colors.primary,
    fontWeight: '600',
  },
  timeText: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
  },
  locationText: {
    ...Typography.headline,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  pricePill: {
    backgroundColor: Colors.primary + '0A',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  priceText: {
    ...Typography.title3,
    color: Colors.primary,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipText: {
    ...Typography.footnote,
    color: Colors.text.secondary,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  featureBadge: {
    backgroundColor: Colors.primary + '08',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  featureBadgeText: {
    ...Typography.caption1,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  descriptionText: {
    ...Typography.footnote,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  linkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '0A',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  linkBadgeText: {
    ...Typography.caption2,
    color: Colors.primary,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  agentRow: {
    marginBottom: Spacing.lg,
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  matchButtonPressed: {
    backgroundColor: Colors.accentDark,
  },
  matchButtonText: {
    ...Typography.subhead,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  ownerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent + '0A',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent + '28',
  },
  editButtonText: {
    ...Typography.subhead,
    color: Colors.accent,
    fontWeight: '600',
  },
  removeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '0A',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error + '28',
  },
  removeButtonText: {
    ...Typography.subhead,
    color: Colors.error,
    fontWeight: '600',
  },
  showingCertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '0A',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent + '28',
  },
  showingCertButtonText: {
    ...Typography.subhead,
    color: Colors.accent,
    fontWeight: '600',
    flex: 1,
  },
  rentalContractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.rent + '0A',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.rent + '28',
  },
  rentalContractButtonText: {
    ...Typography.subhead,
    color: Colors.rent,
    fontWeight: '600',
    flex: 1,
  },
});
