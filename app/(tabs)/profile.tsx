import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, ScrollView, Image, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { useMatchCount } from '@/lib/hooks';
import { mockUsers } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { updateUserProfile } from '@/lib/database';
import { getInitials } from '@/lib/format';
import { registerForPushNotifications } from '@/lib/notifications';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, licenseStatus, signOut, deleteAccount, refreshProfile } = useAuth();
  const { total: matchCount, pendingCount } = useMatchCount();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = useCallback(() => {
    setEditName(profile?.name ?? '');
    setEditCompany(profile?.company_name ?? '');
    setEditPhone(profile?.phone ?? '');
    setEditVisible(true);
  }, [profile]);

  const saveEdit = useCallback(async () => {
    if (!profile?.id) return;
    if (!editName.trim()) {
      Alert.alert('Hata', 'İsim boş olamaz.');
      return;
    }
    setEditSaving(true);
    const { error } = await updateUserProfile(profile.id, {
      name: editName.trim(),
      company_name: editCompany.trim() || null,
      phone: editPhone.trim() || null,
    });
    setEditSaving(false);
    if (error) {
      Alert.alert('Hata', error);
      return;
    }
    await refreshProfile();
    setEditVisible(false);
    Alert.alert('Başarılı', 'Profil güncellendi.');
  }, [profile?.id, editName, editCompany, editPhone, refreshProfile]);

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

  const avatarUrl = profile?.avatar_url ?? devUser?.avatar_url ?? null;
  const initials = displayName ? getInitials(displayName) : '?';

  const expertiseText = profile?.expertise_districts && profile.expertise_districts.length > 0
    ? `${profile.expertise_city ?? 'İstanbul'} / ${profile.expertise_districts.join(', ')}`
    : null;

  const handleAvatarPick = useCallback(async () => {
    Alert.alert('Profil Fotoğrafı', 'Fotoğraf kaynağı seçin', [
      {
        text: 'Galeriden Seç',
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('İzin Gerekli', 'Galeri erişim izni gerekiyor.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              uploadAvatar(result.assets[0].uri);
            }
          } catch (e: any) {
            Alert.alert('Hata', e?.message ?? 'Galeri açılamadı');
          }
        },
      },
      {
        text: 'Fotoğraf Çek',
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('İzin Gerekli', 'Kamera erişim izni gerekiyor.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              uploadAvatar(result.assets[0].uri);
            }
          } catch (e: any) {
            Alert.alert('Hata', e?.message ?? 'Kamera açılamadı');
          }
        },
      },
      { text: 'Vazgeç', style: 'cancel' },
    ]);
  }, [profile, user]);

  const uploadAvatar = useCallback(async (uri: string) => {
    if (!profile?.id || !user?.id) return;
    setAvatarUploading(true);
    try {
      const ext = uri.split('.').pop() ?? 'jpg';
      const filePath = `${user.id}/avatar.${ext}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (uploadError) {
        Alert.alert('Hata', 'Fotoğraf yüklenirken hata oluştu.');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Cache-bust için timestamp ekle
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await updateUserProfile(profile.id, { avatar_url: publicUrl });
      await refreshProfile();
      Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi.');
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'Beklenmeyen bir hata oluştu.');
    } finally {
      setAvatarUploading(false);
    }
  }, [profile, user, refreshProfile]);

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

  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınız ve tüm verileriniz (ilanlar, talepler, eşleşmeler) kalıcı olarak silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Hesabımı Sil',
          style: 'destructive',
          onPress: () => {
            // İkinci onay
            Alert.alert(
              'Emin misiniz?',
              'Hesabınız kalıcı olarak silinecek. Devam etmek istiyor musunuz?',
              [
                { text: 'Vazgeç', style: 'cancel' },
                {
                  text: 'Evet, Sil',
                  style: 'destructive',
                  onPress: async () => {
                    setDeleting(true);
                    const { error } = await deleteAccount();
                    setDeleting(false);
                    if (error) {
                      Alert.alert('Hata', error);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Pressable
          style={({ pressed }) => [styles.editHeaderBtn, pressed && { opacity: 0.7 }]}
          onPress={openEdit}
        >
          <Ionicons name="create-outline" size={20} color={Colors.accent} />
          <Text style={styles.editHeaderText}>Düzenle</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Pressable onPress={handleAvatarPick} disabled={avatarUploading}>
            <View style={styles.avatar}>
              {avatarUploading ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitials}>{initials}</Text>
              )}
            </View>
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={14} color={Colors.text.inverse} />
            </View>
          </Pressable>
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
            onPress={() => router.push('/profile/expertise' as any)}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <Ionicons name="location-outline" size={18} color={Colors.text.tertiary} />
                <Text style={styles.cardLabel}>Uzmanlık Bölgesi</Text>
              </View>
              <View style={styles.matchRight}>
                <Text style={[styles.cardValue, { maxWidth: 160 }]} numberOfLines={1}>
                  {expertiseText ?? 'Belirtilmedi'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
              </View>
            </View>
          </Pressable>
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
                <Text style={styles.cardValue}>{matchCount}</Text>
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

        {/* Bildirimler */}
        <Pressable
          style={({ pressed }) => [
            styles.adminButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => {
            if (profile?.id) {
              registerForPushNotifications(profile.id, false);
            } else {
              Alert.alert('Hata', 'Profil yüklenemedi.');
            }
          }}
        >
          <Ionicons name="notifications-outline" size={20} color={Colors.accent} />
          <Text style={styles.adminButtonText}>Bildirimleri Etkinleştir</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
        </Pressable>

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

        {/* Hesabı Sil */}
        <Pressable
          style={({ pressed }) => [
            styles.deleteAccountButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
              <Text style={styles.deleteAccountText}>Hesabımı Sil</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili Düzenle</Text>
              <Pressable onPress={() => setEditVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Ad Soyad</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Ad Soyad"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="words"
            />

            <Text style={styles.modalLabel}>Firma Adı</Text>
            <TextInput
              style={styles.modalInput}
              value={editCompany}
              onChangeText={setEditCompany}
              placeholder="Firma Adı"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="words"
            />

            <Text style={styles.modalLabel}>Telefon</Text>
            <TextInput
              style={styles.modalInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="05XX XXX XX XX"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="phone-pad"
            />

            <Pressable
              style={({ pressed }) => [
                styles.modalSaveBtn,
                pressed && { opacity: 0.9 },
                editSaving && { opacity: 0.7 },
              ]}
              onPress={saveEdit}
              disabled={editSaving}
            >
              {editSaving ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : (
                <Text style={styles.modalSaveBtnText}>Kaydet</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editHeaderText: {
    ...Typography.subhead,
    color: Colors.accent,
    fontWeight: '600',
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
    overflow: 'hidden',
    ...Shadows.md,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarInitials: {
    ...Typography.title2,
    color: Colors.text.inverse,
    fontWeight: '700',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
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
    marginBottom: Spacing.md,
  },
  logoutText: {
    ...Typography.headline,
    color: Colors.error,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '08',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error + '1A',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing['5xl'],
  },
  deleteAccountText: {
    ...Typography.caption1,
    color: Colors.error,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing['2xl'],
    paddingBottom: Spacing['5xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.title3,
    color: Colors.text.primary,
  },
  modalLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    ...Typography.body,
    color: Colors.text.primary,
  },
  modalSaveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
    ...Shadows.sm,
  },
  modalSaveBtnText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
});
