import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { SKIP_AUTH_IN_DEV } from '@/lib/config';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isValid = email.includes('@') && email.includes('.');

  const handleReset = useCallback(async () => {
    if (!isValid) return;

    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);

    if (error) {
      if (SKIP_AUTH_IN_DEV) {
        setSent(true);
        return;
      }
      Alert.alert('Hata', error);
      return;
    }

    setSent(true);
  }, [isValid, email, resetPassword]);

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContent}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Bağlantı Gönderildi</Text>
          <Text style={styles.successSubtitle}>
            {email} adresine şifre sıfırlama bağlantısı gönderildi. Lütfen
            e-posta kutunuzu kontrol edin.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Giriş Ekranına Dön</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={28} color={Colors.accent} />
            </View>
            <Text style={styles.formTitle}>Şifremi Unuttum</Text>
            <Text style={styles.formSubtitle}>
              Kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı
              göndereceğiz.
            </Text>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.text.tertiary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="E-posta adresiniz"
                placeholderTextColor={Colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                autoFocus
              />
            </View>

            {/* Send Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                !isValid && styles.primaryButtonDisabled,
                pressed && isValid && { opacity: 0.9 },
              ]}
              onPress={handleReset}
              disabled={!isValid || loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Sıfırlama Bağlantısı Gönder
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  headerRow: {
    position: 'absolute',
    top: Spacing.lg,
    left: 0,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    ...Shadows.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent + '14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  formTitle: {
    ...Typography.title3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    marginBottom: Spacing['2xl'],
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  inputIcon: {
    paddingLeft: Spacing.md,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.text.tertiary,
  },
  primaryButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
  successContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success + '14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    ...Typography.title2,
    color: Colors.text.primary,
  },
  successSubtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
});
