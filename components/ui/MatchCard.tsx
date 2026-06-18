import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import type { Match, MatchStatus } from '@/types';
import {
  formatPrice,
  formatBudget,
  timeAgo,
  TRANSACTION_LABELS,
  PROPERTY_LABELS,
} from '@/lib/format';

interface MatchCardProps {
  match: Match;
  currentUserId: string;
  onAccept?: (matchId: string) => void;
  onReject?: (matchId: string) => void;
}

const STATUS_CONFIG: Record<
  MatchStatus,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  PENDING: {
    label: 'Bekliyor',
    color: Colors.warning,
    icon: 'time-outline',
  },
  ACCEPTED: {
    label: 'Kabul Edildi',
    color: Colors.success,
    icon: 'checkmark-circle-outline',
  },
  REJECTED: {
    label: 'Reddedildi',
    color: Colors.error,
    icon: 'close-circle-outline',
  },
  EXPIRED: {
    label: 'Süresi Doldu',
    color: Colors.text.tertiary,
    icon: 'hourglass-outline',
  },
};

export default function MatchCard({
  match,
  currentUserId,
  onAccept,
  onReject,
}: MatchCardProps) {
  const statusConfig = STATUS_CONFIG[match.status];
  const isTarget = match.target_id === currentUserId;
  const isPending = match.status === 'PENDING';
  const isAccepted = match.status === 'ACCEPTED';

  const matchTypeLabel =
    match.match_type === 'DEMAND' ? 'Talep Eşleşmesi' : 'İlan Eşleşmesi';

  return (
    <View style={styles.card}>
      {/* Status badge + time */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.color + '14' },
          ]}
        >
          <Ionicons
            name={statusConfig.icon}
            size={14}
            color={statusConfig.color}
          />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
        <Text style={styles.timeText}>{timeAgo(match.created_at)}</Text>
      </View>

      {/* Match type */}
      <View style={styles.matchTypeRow}>
        <Ionicons
          name="git-compare-outline"
          size={16}
          color={Colors.primary}
        />
        <Text style={styles.matchTypeText}>{matchTypeLabel}</Text>
      </View>

      {/* Listing or Demand brief info */}
      {match.listing && (
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {TRANSACTION_LABELS[match.listing.transaction_type]} /{' '}
              {PROPERTY_LABELS[match.listing.property_type]}
            </Text>
          </View>
          <Text style={styles.infoLocation}>
            {[match.listing.district, match.listing.neighborhood]
              .filter(Boolean)
              .join(', ')}
          </Text>
          <Text style={styles.infoPrice}>
            {formatPrice(match.listing.price)}
          </Text>
        </View>
      )}

      {match.demand && (
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {TRANSACTION_LABELS[match.demand.transaction_type]} /{' '}
              {PROPERTY_LABELS[match.demand.property_type]}
            </Text>
          </View>
          <Text style={styles.infoLocation}>
            {[match.demand.district, ...match.demand.neighborhoods].join(', ')}
          </Text>
          <Text style={styles.infoPrice}>
            {formatBudget(match.demand.min_budget)} –{' '}
            {formatBudget(match.demand.max_budget)}
          </Text>
        </View>
      )}

      {/* Message if exists */}
      {match.message ? (
        <Text style={styles.messageText} numberOfLines={2}>
          {match.message}
        </Text>
      ) : null}

      {/* Accepted: show phone numbers */}
      {isAccepted && (
        <View style={styles.contactBox}>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={16} color={Colors.success} />
            <Text style={styles.contactLabel}>İletişim Bilgileri</Text>
          </View>
          {match.requester?.phone && (
            <Text style={styles.contactPhone}>
              Talep Eden: {match.requester.phone}
            </Text>
          )}
          {match.target?.phone && (
            <Text style={styles.contactPhone}>
              İlan Sahibi: {match.target.phone}
            </Text>
          )}
        </View>
      )}

      {/* Accept / Reject buttons */}
      {isTarget && isPending && (
        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.rejectButton,
              pressed && styles.rejectButtonPressed,
            ]}
            onPress={() => onReject?.(match.id)}
          >
            <Ionicons name="close" size={18} color={Colors.error} />
            <Text style={styles.rejectButtonText}>Reddet</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.acceptButton,
              pressed && styles.acceptButtonPressed,
            ]}
            onPress={() => onAccept?.(match.id)}
          >
            <Ionicons
              name="checkmark"
              size={18}
              color={Colors.text.inverse}
            />
            <Text style={styles.acceptButtonText}>Kabul Et</Text>
          </Pressable>
        </View>
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  statusText: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  timeText: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
  },
  matchTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  matchTypeText: {
    ...Typography.headline,
    color: Colors.text.primary,
  },
  infoBox: {
    backgroundColor: Colors.primary + '06',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  infoLabel: {
    ...Typography.caption1,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  infoLocation: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  infoPrice: {
    ...Typography.title3,
    color: Colors.primary,
    fontWeight: '700',
  },
  messageText: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  contactBox: {
    backgroundColor: Colors.success + '0A',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  contactLabel: {
    ...Typography.subhead,
    color: Colors.success,
    fontWeight: '600',
  },
  contactPhone: {
    ...Typography.footnote,
    color: Colors.text.primary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  rejectButton: {
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
  rejectButtonPressed: {
    backgroundColor: Colors.error + '1A',
  },
  rejectButtonText: {
    ...Typography.subhead,
    color: Colors.error,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  acceptButtonPressed: {
    opacity: 0.85,
  },
  acceptButtonText: {
    ...Typography.subhead,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});
