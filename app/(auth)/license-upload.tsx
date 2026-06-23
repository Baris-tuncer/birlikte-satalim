import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { SKIP_AUTH_IN_DEV } from '@/lib/config';
import { updateUserProfile } from '@/lib/database';
import { parseMYKQRData } from '@/lib/format';
import QRScanner from '@/components/ui/QRScanner';

export default function LicenseUploadScreen() {
  const router = useRouter();
  const { profile, setLicenseStatus, refreshProfile, signOut } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const insets = useSafeAreaInsets();

  const isValid = licenseNumber.trim().length >= 3;

  const handleQRScanned = useCallback((data: string) => {
    setShowQRScanner(false);
    const parsed = parseMYKQRData(data);
    if (parsed) {
      setLicenseNumber(parsed);
      Alert.alert('QR Okundu', `Belge No: ${parsed}`);
    } else {
      Alert.alert('Hata', 'QR koddan belge numarası okunamadı.');
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;

    setUploading(true);

    try {
      if (SKIP_AUTH_IN_DEV) {
        await new Promise((r) => setTimeout(r, 1000));
        setLicenseStatus('pending');
        setUploadSuccess(true);
        return;
      }

      if (profile?.id) {
        await updateUserProfile(profile.id, {
          license_number: licenseNumber.trim(),
          license_status: 'pending',
        } as any);
      }

      await refreshProfile();
      setLicenseStatus('pending');
      setUploadSuccess(true);
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'Beklenmeyen bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  }, [isValid, licenseNumber, profile, setLicenseStatus, refreshProfile]);

  const handleSkip = useCallback(() => {
    Alert.alert(
      'Atlamak istediğinize emin misiniz?',
      'Yetki belgenizi daha sonra profil sayfanızdan yükleyebilirsiniz. Belge onaylanana kadar bazı özellikler kısıtlı olacaktır.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Atla',
          onPress: () => {
            setLicenseStatus('none');
            router.replace('/(auth)/approval-pending');
          },
        },
      ]
    );
  }, [setLicenseStatus, router]);

  if (uploadSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContent}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Belgeniz Başarıyla Yüklendi</Text>
          <Text style={styles.successMessage}>
            Yetki belgeniz ekibimize ulaştı ve inceleme sürecine alındı.
            {'\n\n'}
            Onay tamamlandığında size bildirim göndereceğiz.{'\n'}
            Bu süreç genellikle 24 saat içinde sonuçlanır.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.successButton,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => router.replace('/(auth)/approval-pending')}
          >
            <Text style={styles.successButtonText}>Devam Et</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.text.inverse} />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Çıkış butonu */}
        <Pressable style={styles.signOutLink} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color={Colors.text.tertiary} />
          <Text style={styles.signOutLinkText}>Çıkış Yap</Text>
        </Pressable>

        {/* Başlık */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.title}>Yetki Belgesi</Text>
          <Text style={styles.subtitle}>
            Yetkili emlakçı olarak doğrulanmak için yetki belge numaranızı girin
          </Text>
        </View>

        {/* QR Kod ile okutma */}
        <Pressable
          style={({ pressed }) => [
            styles.qrButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => setShowQRScanner(true)}
        >
          <View style={styles.qrIconCircle}>
            <Ionicons name="qr-code-outline" size={28} color={Colors.primary} />
          </View>
          <View style={styles.qrTextContainer}>
            <Text style={styles.qrButtonTitle}>QR Kod ile Okut</Text>
            <Text style={styles.qrButtonSubtitle}>Yetki belgenizdeki QR kodu kameraya gösterin</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
        </Pressable>

        {/* Ayırıcı */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>veya</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Manuel belge numarası girişi */}
        <View style={styles.licenseInputContainer}>
          <Text style={styles.licenseInputLabel}>Belge Numarası</Text>
          <TextInput
            style={styles.licenseInput}
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="Örn: YB0203/17UY0333-5/00/724"
            placeholderTextColor={Colors.text.tertiary}
            autoCapitalize="characters"
          />
        </View>

        {/* QR ile dolduğunda göster */}
        {licenseNumber.length > 0 && (
          <View style={styles.licensePreview}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.licensePreviewText}>{licenseNumber}</Text>
          </View>
        )}

        {/* Bilgi notu */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle"
            size={18}
            color={Colors.accent}
          />
          <Text style={styles.infoText}>
            Yetki belge numaranız ekibimiz tarafından doğrulanacaktır. Onay süreci
            24 saat içinde tamamlanır.
          </Text>
        </View>

        {/* Alt butonlar */}
        <View style={styles.bottomActions}>
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              !isValid && styles.submitButtonDisabled,
              pressed && isValid && { opacity: 0.9 },
            ]}
            onPress={handleSubmit}
            disabled={!isValid || uploading}
          >
            {uploading ? (
              <ActivityIndicator color={Colors.text.inverse} />
            ) : (
              <>
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={Colors.text.inverse}
                />
                <Text style={styles.submitButtonText}>Belgeyi Doğrula</Text>
              </>
            )}
          </Pressable>

          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Şimdilik Atla</Text>
          </Pressable>
        </View>
      </ScrollView>
      <QRScanner
        visible={showQRScanner}
        onScanned={handleQRScanned}
        onClose={() => setShowQRScanner(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  signOutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  signOutLinkText: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  // Başlık
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent + '14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.title2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  // QR button
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  qrIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrTextContainer: {
    flex: 1,
  },
  qrButtonTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  qrButtonSubtitle: {
    ...Typography.caption1,
    color: Colors.text.secondary,
  },
  // Ayırıcı
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  // License input
  licenseInputContainer: {
  },
  licenseInputLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  licenseInput: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    ...Typography.body,
    color: Colors.text.primary,
  },
  // License preview
  licensePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  licensePreviewText: {
    ...Typography.footnote,
    color: Colors.success,
    fontWeight: '600',
  },
  // Bilgi kutusu
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.accent + '0A',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginTop: Spacing['2xl'],
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  // Alt butonlar
  bottomActions: {
    marginTop: Spacing['3xl'],
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.text.tertiary,
  },
  submitButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  skipButtonText: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  // Success screen
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success + '14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  successTitle: {
    ...Typography.title2,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  successMessage: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['3xl'],
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.sm,
    ...Shadows.md,
  },
  successButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
});
