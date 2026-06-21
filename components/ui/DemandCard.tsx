import React from 'react';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import type { BuyerDemand } from '@/types';
import {
  formatBudget,
  formatDate,
  TRANSACTION_LABELS,
  PROPERTY_LABELS,
} from '@/lib/format';
import AgentInfo from '@/components/ui/AgentInfo';

interface DemandCardProps {
  demand: BuyerDemand;
  onMatch: (demandId: string) => void;
  onRemove?: (demandId: string) => void;
  isOwnDemand?: boolean;
  currentUserName?: string;
}

export default function DemandCard({
  demand,
  onMatch,
  onRemove,
  isOwnDemand = false,
  currentUserName,
}: DemandCardProps) {
  const router = useRouter();
  const isSale = demand.transaction_type === 'SALE';

  const cityLabel = demand.city && demand.city !== 'İstanbul' ? demand.city : '';
  const locationText = [cityLabel, demand.district, ...(demand.neighborhoods ?? [])].filter(Boolean).join(', ');
  const budgetText = `${formatBudget(demand.min_budget)} – ${formatBudget(demand.max_budget)}`;

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
              {TRANSACTION_LABELS[demand.transaction_type]}
            </Text>
          </View>
          <View style={styles.propertyBadge}>
            <Text style={styles.propertyBadgeText}>
              {PROPERTY_LABELS[demand.property_type]}
            </Text>
          </View>
        </View>
        <Text style={styles.timeText}>{demand.created_at ? formatDate(demand.created_at) : '—'}</Text>
      </View>

      {/* Location */}
      <Text style={styles.locationText}>{locationText}</Text>

      {/* Budget bar */}
      <View style={styles.budgetBar}>
        <Text style={styles.budgetText}>{budgetText}</Text>
      </View>

      {/* Criteria chips */}
      <View style={styles.chipsRow}>
        {demand.min_rooms != null && (
          <View style={styles.chip}>
            <Ionicons
              name="bed-outline"
              size={14}
              color={Colors.text.secondary}
            />
            <Text style={styles.chipText}>{demand.min_rooms} min</Text>
          </View>
        )}
        {demand.min_area != null && (
          <View style={styles.chip}>
            <Ionicons
              name="resize-outline"
              size={14}
              color={Colors.text.secondary}
            />
            <Text style={styles.chipText}>{demand.min_area}m²+</Text>
          </View>
        )}
        {demand.max_floor != null && (
          <View style={styles.chip}>
            <Ionicons
              name="layers-outline"
              size={14}
              color={Colors.text.secondary}
            />
            <Text style={styles.chipText}>Max {demand.max_floor}. kat</Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {demand.notes ? (
        <Text style={styles.notesText} numberOfLines={2}>
          {demand.notes}
        </Text>
      ) : null}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Agent row (blind) */}
      <View style={styles.agentRow}>
        <AgentInfo
          agent={demand.agent}
          size="compact"
          showContactActions={!isOwnDemand}
          currentUserName={currentUserName}
        />
      </View>

      {/* Owner: edit + remove buttons / Non-owner: match button */}
      {isOwnDemand ? (
        <View style={styles.ownerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => router.push(`/create/demand?editId=${demand.id}` as any)}
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
                'Talebi Kaldır',
                'Bu talep kaldırılacak ve artık diğer emlakçılar tarafından görülmeyecek. Emin misiniz?',
                [
                  { text: 'Vazgeç', style: 'cancel' },
                  {
                    text: 'Kaldır',
                    style: 'destructive',
                    onPress: () => onRemove?.(demand.id),
                  },
                ]
              );
            }}
          >
            <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
            <Text style={styles.removeButtonText}>Kaldır</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.matchButton,
            pressed && styles.matchButtonPressed,
          ]}
          onPress={() => onMatch(demand.id)}
        >
          <Ionicons
            name="git-compare-outline"
            size={18}
            color={Colors.text.inverse}
          />
          <Text style={styles.matchButtonText}>İlanım Var</Text>
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
  budgetBar: {
    backgroundColor: Colors.primary + '08',
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  budgetText: {
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
  notesText: {
    ...Typography.footnote,
    color: Colors.text.primary,
    fontStyle: 'italic',
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
});
