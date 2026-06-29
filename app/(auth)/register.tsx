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
import { setPendingAuth } from '@/lib/pending-auth';
import { SKIP_AUTH_IN_DEV } from '@/lib/config';
import { supabase } from '@/lib/supabase';

interface LegalCheckbox {
  key: string;
  label: string;
  slug: string;
  checked: boolean;
}

const INITIAL_CHECKBOXES: LegalCheckbox[] = [
  {
    key: 'terms',
    label: 'B2B Kullanıcı ve İş Ağı Sözleşmesi',
    slug: 'terms',
    checked: false,
  },
  {
    key: 'kvkk',
    label: 'KVKK Aydınlatma Metni',
    slug: 'kvkk',
    checked: false,
  },
  {
    key: 'consent',
    label: 'Açık Rıza Beyanı',
    slug: 'consent',
    checked: false,
  },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkboxes, setCheckboxes] = useState(INITIAL_CHECKBOXES);

  const allChecked = checkboxes.every((c) => c.checked);
  const passwordsMatch = password === passwordConfirm;
  const passwordHasUpper = /[A-Z]/.test(password);
  const passwordHasNumber = /\d/.test(password);
  const passwordLongEnough = password.length >= 8;
  const passwordStrong = passwordLongEnough && passwordHasUpper && passwordHasNumber;
  const isValid =
    name.trim().length >= 2 &&
    companyName.trim().length >= 2 &&
    email.includes('@') &&
    email.includes('.') &&
    phone.replace(/\D/g, '').length >= 10 &&
    passwordStrong &&
    passwordsMatch &&
    allChecked;

  const toggleCheckbox = useCallback((key: string) => {
    setCheckboxes((prev) =>
      prev.map((c) => (c.key === key ? { ...c, checked: !c.checked } : c))
    );
  }, []);

  const openLegal = useCallback(
    (slug: string) => {
      router.push(`/legal/${slug}`);
    },
    [router]
  );

  const handleRegister = useCallback(async () => {
    if (!isValid) return;

    if (!passwordsMatch) {
      Alert.alert('Hata', 'Şifreler uyuşmuyor.');
      return;
    }

    setLoading(true);

    // Engelli email kontrolü
    const { data: blocked } = await supabase
      .from('blocked_emails')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (blocked) {
      setLoading(false);
      Alert.alert('Hata', 'Bu e-posta adresi ile kayıt olunamaz.');
      return;
    }

    const { error } = await signUp({
      email: email.trim(),
      password,
      name: name.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
    });
    setLoading(false);

    if (error) {
      if (SKIP_AUTH_IN_DEV) {
        router.push('/(auth)/verify-email');
        return;
      }
      Alert.alert('Hata', error);
      return;
    }

    setPendingAuth(email.trim(), password);
    router.push('/(auth)/verify-email');
  }, [isValid, passwordsMatch, email, password, name, companyName, phone, signUp, router]);

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
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>Kayıt Ol</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Hesap Oluştur</Text>
            <Text style={styles.formSubtitle}>
              Tüm alanları doldurun ve hukuki metinleri onaylayın
            </Text>

            {/* Name */}
            <InputField
              icon="person-outline"
              placeholder="Ad Soyad"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            {/* Company */}
            <InputField
              icon="business-outline"
              placeholder="Firma Adı"
              value={companyName}
              onChangeText={setCompanyName}
              autoCapitalize="words"
            />

            {/* Email */}
            <InputField
              icon="mail-outline"
              placeholder="E-posta Adresi"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Phone */}
            <InputField
              icon="call-outline"
              placeholder="Telefon (05XX XXX XX XX)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

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
                placeholder="Şifre (en az 8 karakter, 1 büyük harf, 1 rakam)"
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
            <InputField
              icon="lock-closed-outline"
              placeholder="Şifre Tekrar"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            {password.length > 0 && !passwordStrong && (
              <Text style={styles.errorText}>
                {!passwordLongEnough ? 'Şifre en az 8 karakter olmalı' :
                 !passwordHasUpper ? 'Şifre en az 1 büyük harf içermeli' :
                 'Şifre en az 1 rakam içermeli'}
              </Text>
            )}
            {password.length > 0 && passwordConfirm.length > 0 && !passwordsMatch && (
              <Text style={styles.errorText}>Şifreler uyuşmuyor</Text>
            )}

            {/* Legal Checkboxes */}
            <View style={styles.legalSection}>
              <Text style={styles.legalSectionTitle}>Hukuki Onaylar</Text>
              {checkboxes.map((item) => (
                <View key={item.key} style={styles.checkboxRow}>
                  <Pressable
                    onPress={() => toggleCheckbox(item.key)}
                    style={[
                      styles.checkbox,
                      item.checked && styles.checkboxChecked,
                    ]}
                    hitSlop={4}
                  >
                    {item.checked && (
                      <Ionicons name="checkmark" size={14} color={Colors.text.inverse} />
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => openLegal(item.slug)}
                    style={styles.legalLabelButton}
                  >
                    <Text style={styles.legalLabel}>{item.label}</Text>
                  </Pressable>
                  <Text style={styles.legalRequired}>*</Text>
                </View>
              ))}
              <Text style={styles.legalHint}>
                Metinlerin üzerine tıklayarak okuyabilirsiniz
              </Text>
            </View>

            {/* Register Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                !isValid && styles.primaryButtonDisabled,
                pressed && isValid && { opacity: 0.9 },
              ]}
              onPress={handleRegister}
              disabled={!isValid || loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : (
                <Text style={styles.primaryButtonText}>Kayıt Ol</Text>
              )}
            </Pressable>
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.inputContainer}>
      <Ionicons
        name={icon}
        size={20}
        color={Colors.text.tertiary}
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        autoCorrect={false}
      />
    </View>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['5xl'],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing['2xl'],
  },
  headerTitle: {
    ...Typography.title3,
    color: Colors.text.primary,
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
  errorText: {
    ...Typography.caption1,
    color: Colors.error,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  legalSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  legalSectionTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  legalLabelButton: {
    flex: 1,
  },
  legalLabel: {
    ...Typography.subhead,
    color: Colors.accent,
    textDecorationLine: 'underline',
  },
  legalRequired: {
    ...Typography.body,
    color: Colors.error,
    marginLeft: Spacing.xs,
  },
  legalHint: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing['2xl'],
  },
  loginText: {
    ...Typography.subhead,
    color: Colors.text.secondary,
  },
  loginLink: {
    ...Typography.subhead,
    color: Colors.accent,
    fontWeight: '600',
  },
});
