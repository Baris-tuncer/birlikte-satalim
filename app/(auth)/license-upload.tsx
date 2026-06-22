import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { SKIP_AUTH_IN_DEV } from '@/lib/config';
import { updateUserProfile } from '@/lib/database';
import { parseMYKQRData } from '@/lib/format';
import QRScanner from '@/components/ui/QRScanner';

export default function LicenseUploadScreen() {
  const router = useRouter();
  const { user, profile, setLicenseStatus, refreshProfile } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);

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

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'İzin Gerekli',
        'Fotoğraf seçebilmek için galeri erişim izni vermeniz gerekiyor.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'İzin Gerekli',
        'Fotoğraf çekebilmek için kamera erişim izni vermeniz gerekiyor.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!imageUri) return;

    setUploading(true);

    try {
      if (SKIP_AUTH_IN_DEV) {
        // Env var yokken DEV modda simüle et
        await new Promise((r) => setTimeout(r, 1000));
        setLicenseStatus('pending');
        router.replace('/(auth)/approval-pending');
        return;
      }

      // Dosya uzantısı kontrolü
      const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif'];
      const ext = (imageUri.split('.').pop() ?? '').toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        Alert.alert('Hata', 'Sadece JPG, PNG veya HEIC formatında dosya yükleyebilirsiniz.');
        setUploading(false);
        return;
      }

      // Dosyayı Supabase Storage'a yükle
      const fileName = `${user?.id ?? 'unknown'}_${Date.now()}.${ext}`;
      const filePath = `licenses/${fileName}`;

      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Dosya boyutu kontrolü (max 10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (blob.size > MAX_FILE_SIZE) {
        Alert.alert('Hata', 'Dosya boyutu 10MB\'dan küçük olmalıdır.');
        setUploading(false);
        return;
      }

      const arrayBuffer = await new Response(blob).arrayBuffer();

      // MIME tipi doğrulama
      const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
      const mimeType = blob.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const contentType = ALLOWED_MIME_TYPES.includes(mimeType) ? mimeType : `image/${ext === 'jpg' ? 'jpeg' : ext}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, arrayBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        Alert.alert('Hata', 'Dosya yüklenirken bir hata oluştu.');
        setUploading(false);
        return;
      }

      // Public URL al
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Kullanıcı profilini güncelle
      if (profile?.id) {
        const updates: Record<string, unknown> = {
          license_image_url: urlData.publicUrl,
          license_status: 'pending',
        };
        if (licenseNumber) {
          updates.license_number = licenseNumber;
        }
        await updateUserProfile(profile.id, updates as any);
      }

      await refreshProfile();
      setLicenseStatus('pending');
      router.replace('/(auth)/approval-pending');
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'Beklenmeyen bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  }, [imageUri, user, profile, setLicenseStatus, refreshProfile, router]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Başlık */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.title}>Yetki Belgesi</Text>
          <Text style={styles.subtitle}>
            Yetkili emlakçı olarak doğrulanmak için yetki belgenizin fotoğrafını
            yükleyin
          </Text>
        </View>

        {/* Fotoğraf alanı */}
        <View>
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <Pressable
                style={styles.removeButton}
                onPress={() => setImageUri(null)}
              >
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={Colors.error}
                />
              </Pressable>
              <View style={styles.previewBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.success}
                />
                <Text style={styles.previewBadgeText}>Fotoğraf hazır</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadArea}>
              <Ionicons
                name="cloud-upload-outline"
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.uploadTitle}>
                Yetki belgenizi yükleyin
              </Text>
              <Text style={styles.uploadSubtitle}>
                JPG, PNG formatında, en az 1MB
              </Text>

              <View style={styles.uploadButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.uploadOption,
                    pressed && styles.uploadOptionPressed,
                  ]}
                  onPress={pickImage}
                >
                  <Ionicons
                    name="images-outline"
                    size={22}
                    color={Colors.accent}
                  />
                  <Text style={styles.uploadOptionText}>Galeriden Seç</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.uploadOption,
                    pressed && styles.uploadOptionPressed,
                  ]}
                  onPress={takePhoto}
                >
                  <Ionicons
                    name="camera-outline"
                    size={22}
                    color={Colors.accent}
                  />
                  <Text style={styles.uploadOptionText}>Fotoğraf Çek</Text>
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.qrButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => setShowQRScanner(true)}
              >
                <Ionicons name="qr-code-outline" size={22} color={Colors.primary} />
                <Text style={styles.qrButtonText}>QR Kod ile Belge No Okut</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Belge numarası */}
        <View style={styles.licenseInputContainer}>
          <Text style={styles.licenseInputLabel}>Belge Numarası</Text>
          <TextInput
            style={styles.licenseInput}
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="QR okutun veya manuel girin"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>

        {/* Bilgi notu */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle"
            size={18}
            color={Colors.accent}
          />
          <Text style={styles.infoText}>
            Yetki belgeniz ekibimiz tarafından incelenecektir. Onay süreci 24
            saat içinde tamamlanır.
          </Text>
        </View>

        {/* Alt butonlar */}
        <View style={styles.bottomActions}>
          <View>
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                !imageUri && styles.submitButtonDisabled,
                pressed && { opacity: 0.9 },
              ]}
              onPress={handleUpload}
              disabled={!imageUri || uploading}
            >
              {uploading ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload"
                    size={20}
                    color={Colors.text.inverse}
                  />
                  <Text style={styles.submitButtonText}>Belgeyi Yükle</Text>
                </>
              )}
            </Pressable>
          </View>

          <View>
            <Pressable style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Şimdilik Atla</Text>
            </Pressable>
          </View>
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
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
  // Yükleme alanı
  uploadArea: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: Spacing['3xl'],
    alignItems: 'center',
    ...Shadows.sm,
  },
  uploadTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  uploadSubtitle: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    marginBottom: Spacing['2xl'],
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent + '0A',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accent + '28',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  uploadOptionPressed: {
    backgroundColor: Colors.accent + '1A',
  },
  uploadOptionText: {
    ...Typography.footnote,
    color: Colors.accent,
    fontWeight: '600',
  },
  // Fotoğraf önizleme
  previewContainer: {
    position: 'relative',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: Radius.xl,
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  previewBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  previewBadgeText: {
    ...Typography.caption1,
    color: Colors.success,
    fontWeight: '600',
  },
  // QR button
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '0A',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '28',
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  qrButtonText: {
    ...Typography.footnote,
    color: Colors.primary,
    fontWeight: '600',
  },
  // License input
  licenseInputContainer: {
    marginTop: Spacing.xl,
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
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.text.primary,
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
    marginTop: 'auto',
    paddingBottom: Spacing['2xl'],
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
});
