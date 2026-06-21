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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { SKIP_AUTH_IN_DEV } from '@/lib/config';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = email.includes('@') && email.includes('.') && password.length >= 6;

  const handleSignIn = useCallback(async () => {
    if (!isValid) return;

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      if (SKIP_AUTH_IN_DEV) {
        router.replace('/(tabs)');
        return;
      }
      Alert.alert('Hata', error);
      return;
    }
  }, [isValid, email, password, signIn, router]);

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

            {/* Forgot Password */}
            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>Şifremi Unuttum</Text>
            </Pressable>

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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
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
