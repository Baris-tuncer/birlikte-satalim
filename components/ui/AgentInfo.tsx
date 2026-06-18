import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/Theme';
import { getInitials } from '@/lib/format';
import type { User } from '@/types';

interface AgentInfoProps {
  agent: User | undefined;
  size?: 'compact' | 'full';
}

export default function AgentInfo({ agent, size = 'compact' }: AgentInfoProps) {
  const isCompact = size === 'compact';
  const avatarSize = isCompact ? 48 : 56;
  const initials = agent?.name ? getInitials(agent.name) : '?';

  return (
    <View style={styles.row}>
      {/* Square avatar */}
      <View
        style={[
          styles.avatarContainer,
          { width: avatarSize, height: avatarSize },
        ]}
      >
        {agent?.avatar_url ? (
          <Image
            source={{ uri: agent.avatar_url }}
            style={[styles.avatarImage, { width: avatarSize, height: avatarSize }]}
          />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              { width: avatarSize, height: avatarSize },
            ]}
          >
            <Text
              style={[
                isCompact ? styles.initialsCompact : styles.initialsFull,
              ]}
            >
              {initials}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {agent?.name && (
          <Text
            style={isCompact ? styles.nameCompact : styles.nameFull}
            numberOfLines={1}
          >
            {agent.name}
          </Text>
        )}
        {agent?.license_number && (
          <Text style={isCompact ? styles.licenseCompact : styles.licenseFull}>
            {agent.license_number}
          </Text>
        )}
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={13} color={Colors.accent} />
          <Text style={styles.badgeText}>Yetkili Emlakci</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarContainer: {
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  avatarFallback: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  initialsCompact: {
    ...Typography.subhead,
    color: Colors.text.inverse,
    fontWeight: '700',
  },
  initialsFull: {
    ...Typography.headline,
    color: Colors.text.inverse,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameCompact: {
    ...Typography.footnote,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  nameFull: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  licenseCompact: {
    ...Typography.caption2,
    color: Colors.text.tertiary,
  },
  licenseFull: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    ...Typography.caption2,
    color: Colors.accent,
    fontWeight: '600',
  },
});
