import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import type { Listing } from '@/types';
import {
  formatPrice,
  timeAgo,
  TRANSACTION_LABELS,
  PROPERTY_LABELS,
} from '@/lib/format';
import AgentInfo from '@/components/ui/AgentInfo';

interface ListingCardProps {
  listing: Listing;
  onMatch: (listingId: string) => void;
  isOwnListing?: boolean;
}

export default function ListingCard({
  listing,
  onMatch,
  isOwnListing = false,
}: ListingCardProps) {
  const isSale = listing.transaction_type === 'SALE';

  const locationText = [listing.district, listing.neighborhood]
    .filter(Boolean)
    .join(', ');

  const features: { label: string }[] = [];
  if (listing.has_parking) features.push({ label: 'Otopark' });
  if (listing.has_elevator) features.push({ label: 'Asansör' });
  if (listing.heating_type) features.push({ label: listing.heating_type });

  return (
    <View style={styles.card}>
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
        <Text style={styles.timeText}>{timeAgo(listing.created_at)}</Text>
      </View>

      {/* Location */}
      <Text style={styles.locationText}>{locationText}</Text>

      {/* Price tag */}
      <View style={styles.pricePill}>
        <Text style={styles.priceText}>{formatPrice(listing.price)}</Text>
      </View>

      {/* Property details chips */}
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
              {listing.building_age} yaşında
            </Text>
          </View>
        )}
      </View>

      {/* Features row */}
      {features.length > 0 && (
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

      {/* Divider */}
      <View style={styles.divider} />

      {/* Agent row (blind) */}
      <View style={styles.agentRow}>
        <AgentInfo agent={listing.agent} size="compact" />
      </View>

      {/* Match button */}
      {!isOwnListing && (
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
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
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
});
