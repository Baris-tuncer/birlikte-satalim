import { StyleSheet, Text, View, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { useMyMatches } from '@/lib/hooks';
import { mockUsers } from '@/lib/mockData';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, licenseStatus, signOut } = useAuth();
  const { data: matches, pendingCount } = useMyMatches();

  // DEV modda mock, production'da gerçek profil
  const devUser = __DEV__ ? mockUsers[0] : null;
  const displayName = profile?.name ?? devUser?.name ?? user?.user_metadata?.name ?? 'Emlakçı';
  const companyName = profile?.company_name ?? devUser?.company_name ?? null;
  const email = profile?.email ?? user?.email ?? '';
  const phone = profile?.phone ?? devUser?.phone ?? '';
  const createdAt = profile?.created_at ?? devUser?.created_at ?? null;

  const licenseLabel = {
    none: 'Yüklenmedi',
    pending: 'Onay Bekliyor',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
  }[licenseStatus];

  const licenseColor = {
    none: Colors.text.tertiary,
    pending: Colors.warning,
    approved: Colors.success,
    rejected: Colors.error,
  }[licenseStatus];

  const licenseIcon = {
    none: 'document-outline' as const,
    pending: 'time-outline' as const,
    approved: 'checkmark-circle' as const,
    rejected: 'close-circle' as const,
  }[licenseStatus];

  const handleSignOut = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={Colors.text.inverse} />
          </View>
          <Text style={styles.name}>{displayName}</Text>
          {companyName && (
            <Text style={styles.companyName}>{companyName}</Text>
          )}
          {email ? (
            <Text style={styles.email}>{email}</Text>
          ) : null}

          <View style={[styles.badge, { backgroundColor: licenseColor + '14' }]}>
            <Ionicons name={licenseIcon} size={14} color={licenseColor} />
            <Text style={[styles.badgeText, { color: licenseColor }]}>
              {licenseLabel}
            </Text>
          </View>
        </View>

        {/* Bilgi kartı */}
        <View style={styles.card}>
          {email ? (
            <>
              <ProfileRow
                icon="mail-outline"
                label="E-posta"
                value={email}
              />
              <View style={styles.divider} />
            </>
          ) : null}
          {phone ? (
            <>
              <ProfileRow
                icon="call-outline"
                label="Telefon"
                value={phone}
              />
              <View style={styles.divider} />
            </>
          ) : null}
          {companyName && (
            <>
              <ProfileRow
                icon="business-outline"
                label="Firma"
                value={companyName}
              />
              <View style={styles.divider} />
            </>
          )}
          <ProfileRow
            icon="document-text-outline"
            label="Yetki Belgesi"
            value={licenseLabel}
            valueColor={licenseColor}
          />
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/matches')}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <Ionicons name="git-compare-outline" size={18} color={Colors.text.tertiary} />
                <Text style={styles.cardLabel}>Eşleşmelerim</Text>
              </View>
              <View style={styles.matchRight}>
                {pendingCount > 0 && (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                  </View>
                )}
                <Text style={styles.cardValue}>{matches.length}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
              </View>
            </View>
          </Pressable>
          <View style={styles.divider} />
          <ProfileRow
            icon="calendar-outline"
            label="Kayıt Tarihi"
            value={
              createdAt
                ? new Date(createdAt).toLocaleDateString('tr-TR')
                : '-'
            }
          />
        </View>

        {/* Admin Paneli */}
        {(profile?.is_admin || (__DEV__ && devUser?.is_admin)) && (
          <Pressable
            style={({ pressed }) => [
              styles.adminButton,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => router.push('/admin/licenses')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.accent} />
            <Text style={styles.adminButtonText}>Lisans Onay Paneli</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
          </Pressable>
        )}

        {/* Çıkış butonu */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.cardRow}>
      <View style={styles.cardRowLeft}>
        <Ionicons name={icon} size={18} color={Colors.text.tertiary} />
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      <Text style={[styles.cardValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  name: {
    ...Typography.title3,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  companyName: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  email: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  badgeText: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  cardRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  cardLabel: {
    ...Typography.subhead,
    color: Colors.text.secondary,
  },
  cardValue: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  matchRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pendingBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  pendingBadgeText: {
    ...Typography.caption2,
    color: Colors.text.inverse,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  adminButtonText: {
    ...Typography.headline,
    color: Colors.accent,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '0A',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error + '28',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing['5xl'],
  },
  logoutText: {
    ...Typography.headline,
    color: Colors.error,
  },
});
