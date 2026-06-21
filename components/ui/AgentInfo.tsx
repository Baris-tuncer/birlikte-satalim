import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/Theme';
import { getInitials } from '@/lib/format';
import type { User } from '@/types';

interface AgentInfoProps {
  agent: User | undefined;
  size?: 'compact' | 'full';
  showContactActions?: boolean;
  currentUserName?: string;
}

export default function AgentInfo({ agent, size = 'compact', showContactActions = false, currentUserName }: AgentInfoProps) {
  const isCompact = size === 'compact';
  const avatarSize = isCompact ? 48 : 56;
  const initials = agent?.name ? getInitials(agent.name) : '?';

  const expertiseText = agent?.expertise_districts && agent.expertise_districts.length > 0
    ? `Uzmanlık Bölgesi: ${agent.expertise_city ?? 'İstanbul'} / ${agent.expertise_districts.join(', ')}`
    : null;

  const handleWhatsApp = () => {
    if (!agent?.phone) return;
    const phone = agent.phone.replace(/\D/g, '');
    const phoneNumber = phone.startsWith('0') ? '9' + phone : phone.startsWith('90') ? phone : '90' + phone;
    const senderName = currentUserName ?? '';
    const message = encodeURIComponent(`Merhaba, size Beraber Satalım uygulaması üzerinden ulaşıyorum ben ${senderName}`);
    Linking.openURL(`https://wa.me/${phoneNumber}?text=${message}`);
  };

  const handlePhone = () => {
    if (!agent?.phone) return;
    const phone = agent.phone.replace(/\D/g, '');
    Linking.openURL(`tel:${phone}`);
  };

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
        {expertiseText && (
          <Text style={styles.expertiseText} numberOfLines={1}>
            {expertiseText}
          </Text>
        )}
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={13} color={Colors.accent} />
          <Text style={styles.badgeText}>Yetkili Emlakçı</Text>
        </View>
      </View>

      {/* Contact actions */}
      {showContactActions && agent?.phone && (
        <View style={styles.contactActions}>
          <Pressable
            style={({ pressed }) => [styles.contactBtn, styles.whatsappBtn, pressed && { opacity: 0.7 }]}
            onPress={handleWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.contactBtn, styles.phoneBtn, pressed && { opacity: 0.7 }]}
            onPress={handlePhone}
          >
            <Ionicons name="call-outline" size={18} color={Colors.accent} />
          </Pressable>
        </View>
      )}
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
  expertiseText: {
    ...Typography.caption2,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  contactActions: {
    flexDirection: 'column',
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  contactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappBtn: {
    backgroundColor: '#25D366' + '14',
  },
  phoneBtn: {
    backgroundColor: Colors.accent + '14',
  },
});
