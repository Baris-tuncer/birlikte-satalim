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
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { updateUserProfile } from '@/lib/database';
import { parseMYKQRData } from '@/lib/format';
import QRScanner from '@/components/ui/QRScanner';

export default function ProfileLicenseUploadScreen() {
  const router = useRouter();
  const { profile, setLicenseStatus, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState(profile?.license_number ?? '');
  const [showQRScanner, setShowQRScanner] = useState(false);

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
    if (!isValid || !profile?.id) return;

    setUploading(true);
    try {
      await updateUserProfile(profile.id, {
        license_number: licenseNumber.trim(),
        license_status: 'pending',
      } as any);

      await refreshProfile();
      setLicenseStatus('pending');
      Alert.alert(
        'Belgeniz Gönderildi',
        'Yetki belge numaranız incelemeye alındı. Onaylandığında bildirim alacaksınız ve profilinizde onaylı danışman rozeti görünecek.',
        [{ text: 'Tamam', onPress: () => router.back() }],
      );
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'Beklenmeyen bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  }, [isValid, licenseNumber, profile, setLicenseStatus, refreshProfile, router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Yetki Belgesi' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Başlık */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.title}>Yetki Belgesi Doğrulama</Text>
          <Text style={styles.subtitle}>
            Yetki belge numaranızı girerek onaylı gayrimenkul danışmanı rozeti kazanın.
            Onaylanan danışmanlar ilanlarında mavi tik ile gösterilir.
          </Text>
        </View>

        {/* QR Kod ile okutma */}
        <Pressable
          style={({ pressed }) => [styles.qrButton, pressed && { opacity: 0.8 }]}
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
        <View>
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

        {licenseNumber.length > 0 && (
          <View style={styles.licensePreview}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.licensePreviewText}>{licenseNumber}</Text>
          </View>
        )}

        {/* Bilgi notu */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color={Colors.accent} />
          <Text style={styles.infoText}>
            Yetki belge numaranız ekibimiz tarafından doğrulanacaktır. Onay süreci
            24 saat içinde tamamlanır. Onaylandığınızda profilinizde ve ilanlarınızda
            onaylı danışman rozeti görünecektir.
          </Text>
        </View>

        {/* Gönder butonu */}
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
              <Ionicons name="shield-checkmark" size={20} color={Colors.text.inverse} />
              <Text style={styles.submitButtonText}>Belgeyi Gönder</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
      <QRScanner
        visible={showQRScanner}
        onScanned={handleQRScanned}
        onClose={() => setShowQRScanner(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: Spacing['5xl'] },
  header: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.accent + '14',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: { ...Typography.title2, color: Colors.text.primary, marginBottom: Spacing.sm },
  subtitle: { ...Typography.subhead, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.lg },
  qrButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.xl,
    padding: Spacing.lg, gap: Spacing.md, ...Shadows.sm,
  },
  qrIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary + '14',
    justifyContent: 'center', alignItems: 'center',
  },
  qrTextContainer: { flex: 1 },
  qrButtonTitle: { ...Typography.headline, color: Colors.text.primary, marginBottom: 2 },
  qrButtonSubtitle: { ...Typography.caption1, color: Colors.text.secondary },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl, gap: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { ...Typography.footnote, color: Colors.text.tertiary },
  licenseInputLabel: { ...Typography.footnote, color: Colors.text.secondary, marginBottom: Spacing.xs, fontWeight: '600' },
  licenseInput: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
    ...Typography.body, color: Colors.text.primary,
  },
  licensePreview: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md, paddingHorizontal: Spacing.sm },
  licensePreviewText: { ...Typography.footnote, color: Colors.success, fontWeight: '600' },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.accent + '0A', borderRadius: Radius.md,
    padding: Spacing.lg, marginTop: Spacing['2xl'], gap: Spacing.sm,
  },
  infoText: { ...Typography.footnote, color: Colors.text.secondary, flex: 1, lineHeight: 18 },
  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingVertical: Spacing.lg, gap: Spacing.sm,
    marginTop: Spacing['3xl'], ...Shadows.md,
  },
  submitButtonDisabled: { backgroundColor: Colors.text.tertiary },
  submitButtonText: { ...Typography.headline, color: Colors.text.inverse },
});
