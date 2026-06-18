import React, { useState, useCallback, useEffect } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const passwordsMatch = password === passwordConfirm;
  const isValid = password.length >= 6 && passwordsMatch;

  // Deep link ile gelen token otomatik olarak Supabase tarafindan islenir.
  // onAuthStateChange PASSWORD_RECOVERY event'i tetiklenir.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    // Sayfa acildiginda session zaten varsa direkt hazir
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        Alert.alert('Hata', error.message);
      } else {
        setSuccess(true);
      }
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [isValid, password]);

  if (success) {
    return (
      <>
        <Stack.Screen options={{ title: 'Şifre Sıfırlama', headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.successContent}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={48} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Şifre Güncellendi</Text>
            <Text style={styles.successSubtitle}>
              Yeni şifreniz başarıyla kaydedildi. Giriş yapabilirsiniz.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.primaryButtonText}>Giriş Yap</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Şifre Sıfırlama', headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <View style={styles.formCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-open-outline" size={28} color={Colors.accent} />
              </View>
              <Text style={styles.formTitle}>Yeni Şifre Belirle</Text>
              <Text style={styles.formSubtitle}>
                En az 6 karakter uzunluğunda yeni bir şifre girin.
              </Text>

              {!sessionReady && (
                <View style={styles.warningBox}>
                  <ActivityIndicator size="small" color={Colors.warning} />
                  <Text style={styles.warningText}>
                    Oturum doğrulanıyor...
                  </Text>
                </View>
              )}

              {/* Password */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Yeni şifre (en az 6 karakter)"
                  placeholderTextColor={Colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.text.tertiary}
                  />
                </Pressable>
              </View>

              {/* Password Confirm */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.text.tertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre tekrar"
                  placeholderTextColor={Colors.text.tertiary}
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>

              {password.length > 0 && passwordConfirm.length > 0 && !passwordsMatch && (
                <Text style={styles.errorText}>Şifreler uyuşmuyor</Text>
              )}

              {/* Submit */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  (!isValid || !sessionReady) && styles.primaryButtonDisabled,
                  pressed && isValid && { opacity: 0.9 },
                ]}
                onPress={handleSubmit}
                disabled={!isValid || loading || !sessionReady}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.text.inverse} />
                ) : (
                  <Text style={styles.primaryButtonText}>Şifreyi Güncelle</Text>
                )}
              </Pressable>
            </View>

            {/* Back to login */}
            <Pressable
              onPress={() => router.replace('/(auth)/login')}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={16} color={Colors.text.secondary} />
              <Text style={styles.backText}>Giriş ekranına dön</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '14',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  warningText: {
    ...Typography.footnote,
    color: Colors.warning,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
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
  eyeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  errorText: {
    ...Typography.caption1,
    color: Colors.error,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing['2xl'],
  },
  backText: {
    ...Typography.subhead,
    color: Colors.text.secondary,
  },
});
