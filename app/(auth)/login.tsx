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
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { SKIP_AUTH_IN_DEV } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { setPendingAuth } from '@/lib/pending-auth';

const REMEMBER_EMAIL_KEY = '@remember_email';
const REMEMBER_ENABLED_KEY = '@remember_enabled';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Kayıtlı e-postayı yükle
  useEffect(() => {
    (async () => {
      try {
        const [savedEmail, savedEnabled] = await Promise.all([
          AsyncStorage.getItem(REMEMBER_EMAIL_KEY),
          AsyncStorage.getItem(REMEMBER_ENABLED_KEY),
        ]);
        if (savedEnabled === 'true' && savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch {}
    })();
  }, []);

  const isValid = email.includes('@') && email.includes('.') && password.length >= 6;

  const handleSignIn = useCallback(async () => {
    if (!isValid) return;

    setLoading(true);

    // Beni hatırla tercihini kaydet
    try {
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
        await AsyncStorage.setItem(REMEMBER_ENABLED_KEY, 'true');
      } else {
        await AsyncStorage.multiRemove([REMEMBER_EMAIL_KEY, REMEMBER_ENABLED_KEY]);
      }
    } catch {}

    // Engelli email kontrolü
    const { data: blocked } = await supabase
      .from('blocked_emails')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (blocked) {
      setLoading(false);
      Alert.alert('Hata', 'Bu hesap askıya alınmıştır.');
      return;
    }

    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      if (SKIP_AUTH_IN_DEV) {
        router.replace('/(tabs)');
        return;
      }
      // Supabase hata mesajlarını kullanıcı dostu Türkçeye çevir
      if (error.toLowerCase().includes('email not confirmed')) {
        // Pending auth kaydet ve doğrulama ekranına yönlendir
        setPendingAuth(email.trim(), password);
        // Yeni doğrulama kodu gönder
        supabase.auth.resend({ type: 'signup', email: email.trim() }).catch(() => {});
        Alert.alert(
          'E-posta Doğrulanmadı',
          'E-posta adresinize yeni bir doğrulama kodu gönderdik. Lütfen kodu girin.',
          [{ text: 'Tamam', onPress: () => router.push('/(auth)/verify-email') }],
        );
      } else if (error.toLowerCase().includes('invalid login credentials')) {
        Alert.alert('Giriş Başarısız', 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
      } else {
        Alert.alert('Giriş Başarısız', error);
      }
      return;
    }
  }, [isValid, email, password, rememberMe, signIn, router]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding */}
          <View style={styles.brandingContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="business" size={32} color={Colors.text.inverse} />
            </View>
            <Text style={styles.appName}>Beraber Satalım</Text>
            <Text style={styles.tagline}>
              Portföyünüz burada buluşuyor
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Giriş Yap</Text>
            <Text style={styles.formSubtitle}>
              E-posta ve şifrenizle giriş yapın
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
              />
            </View>

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
                placeholder="Şifreniz"
                placeholderTextColor={Colors.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
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

            {/* Beni Hatırla + Şifremi Unuttum */}
            <View style={styles.rememberForgotRow}>
              <Pressable
                style={styles.rememberButton}
                onPress={() => setRememberMe((v) => !v)}
                hitSlop={6}
              >
                <Ionicons
                  name={rememberMe ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={rememberMe ? Colors.accent : Colors.text.tertiary}
                />
                <Text style={styles.rememberText}>Beni Hatırla</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotText}>Şifremi Unuttum</Text>
              </Pressable>
            </View>

            {/* Sign In Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                !isValid && styles.primaryButtonDisabled,
                pressed && isValid && { opacity: 0.9 },
              ]}
              onPress={handleSignIn}
              disabled={!isValid || loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : (
                <Text style={styles.primaryButtonText}>Giriş Yap</Text>
              )}
            </Pressable>
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Hesabınız yok mu? </Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
            </Pressable>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  appName: {
    ...Typography.title1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    ...Shadows.lg,
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
  rememberForgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  rememberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rememberText: {
    ...Typography.footnote,
    color: Colors.text.secondary,
  },
  forgotText: {
    ...Typography.footnote,
    color: Colors.accent,
    fontWeight: '600',
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
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  registerText: {
    ...Typography.subhead,
    color: Colors.text.secondary,
  },
  registerLink: {
    ...Typography.subhead,
    color: Colors.accent,
    fontWeight: '600',
  },
});
