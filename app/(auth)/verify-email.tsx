import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { getPendingAuth, clearPendingAuth } from '@/lib/pending-auth';
import { SKIP_AUTH_IN_DEV } from '@/lib/config';

const RESEND_COOLDOWN = 60;
const POLL_INTERVAL = 3000;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user, emailVerified } = useAuth();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { email: pendingEmail, password: pendingPassword } = getPendingAuth();
  const userEmail = pendingEmail || user?.email || '';

  // E-posta doğrulandığında yönlendir
  useEffect(() => {
    if (emailVerified) {
      clearPendingAuth();
      router.replace('/(tabs)');
    }
  }, [emailVerified, router]);

  // Polling: signInWithPassword ile email doğrulanmış mı kontrol et
  useEffect(() => {
    if (SKIP_AUTH_IN_DEV) {
      const timeout = setTimeout(() => {
        router.replace('/(tabs)');
      }, 3000);
      return () => clearTimeout(timeout);
    }

    if (!pendingEmail || !pendingPassword) return;

    pollRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: pendingEmail,
          password: pendingPassword,
        });
        if (!error && data.session?.user?.email_confirmed_at) {
          if (pollRef.current) clearInterval(pollRef.current);
          clearPendingAuth();
          router.replace('/(tabs)');
        }
      } catch {
        // Ağ hatası — polling devam eder
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [router, pendingEmail, pendingPassword]);

  // Cooldown sayacı
  useEffect(() => {
    if (resendCooldown <= 0) {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      return;
    }
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [resendCooldown]);

  // OTP ile doğrula
  const handleVerifyOtp = useCallback(async () => {
    if (otpCode.length !== 6 || !userEmail) return;

    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: otpCode,
        type: 'signup',
      });

      if (error) {
        Alert.alert('Hata', 'Doğrulama kodu geçersiz veya süresi dolmuş. Lütfen "Kodu Tekrar Gönder" ile yeni kod isteyin.');
        setVerifying(false);
        return;
      }

      // Başarılı — session otomatik oluşur, onAuthStateChange tetiklenir
      clearPendingAuth();
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Hata', 'Bir sorun oluştu. Lütfen tekrar deneyin.');
    }
    setVerifying(false);
  }, [otpCode, userEmail, router]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });
      Alert.alert('Gönderildi', 'Yeni doğrulama kodu e-posta adresinize gönderildi.');
    } catch {
      // Sessizce devam et
    }
    setResending(false);
    setResendCooldown(RESEND_COOLDOWN);
  }, [resendCooldown, resending, userEmail]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Mail İkonu */}
        <View style={styles.iconCircle}>
          <Ionicons name="mail-unread-outline" size={48} color={Colors.accent} />
        </View>

        <Text style={styles.title}>E-posta Dogrulamasi</Text>
        <Text style={styles.subtitle}>
          Asagidaki adrese 6 haneli dogrulama kodu gonderdik:
        </Text>

        <View style={styles.emailBadge}>
          <Text style={styles.emailText} numberOfLines={1} adjustsFontSizeToFit>
            {userEmail}
          </Text>
        </View>

        {/* OTP Girişi */}
        <Text style={styles.otpLabel}>Dogrulama Kodu</Text>
        <TextInput
          style={styles.otpInput}
          value={otpCode}
          onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="------"
          placeholderTextColor={Colors.text.tertiary}
          textContentType="oneTimeCode"
          autoFocus
        />

        {/* Doğrula Butonu */}
        <Pressable
          style={({ pressed }) => [
            styles.verifyButton,
            otpCode.length !== 6 && styles.verifyButtonDisabled,
            pressed && otpCode.length === 6 && { opacity: 0.9 },
          ]}
          onPress={handleVerifyOtp}
          disabled={otpCode.length !== 6 || verifying}
        >
          {verifying ? (
            <ActivityIndicator size="small" color={Colors.text.inverse} />
          ) : (
            <Text style={styles.verifyButtonText}>Dogrula</Text>
          )}
        </Pressable>

        {/* Spam uyarısı */}
        <View style={styles.spamWarning}>
          <Ionicons name="warning-outline" size={18} color={Colors.warning} />
          <Text style={styles.spamWarningText}>
            E-postayi bulamiyorsaniz <Text style={styles.spamBold}>Spam / Gereksiz</Text> klasorunu kontrol edin.
          </Text>
        </View>

        {/* Bekleme göstergesi */}
        <View style={styles.pollingRow}>
          <ActivityIndicator size="small" color={Colors.accent} />
          <Text style={styles.pollingText}>Dogrulama bekleniyor...</Text>
        </View>

        {/* Tekrar Gönder */}
        <Pressable
          style={({ pressed }) => [
            styles.resendButton,
            (resendCooldown > 0 || resending) && styles.resendButtonDisabled,
            pressed && resendCooldown === 0 && { opacity: 0.9 },
          ]}
          onPress={handleResend}
          disabled={resendCooldown > 0 || resending}
        >
          {resending ? (
            <ActivityIndicator size="small" color={Colors.accent} />
          ) : (
            <Text style={styles.resendButtonText}>
              {resendCooldown > 0
                ? `Tekrar Gonder (${resendCooldown}sn)`
                : 'Kodu Tekrar Gonder'}
            </Text>
          )}
        </Pressable>

        {/* Giriş ekranına dön */}
        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={16} color={Colors.text.secondary} />
          <Text style={styles.backText}>Giris ekranina don</Text>
        </Pressable>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.accent + '14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
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
    marginBottom: Spacing.lg,
  },
  emailBadge: {
    backgroundColor: Colors.primary + '0D',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
    maxWidth: '100%',
  },
  emailText: {
    ...Typography.headline,
    color: Colors.primary,
  },
  otpLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  otpInput: {
    width: 200,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 12,
    textAlign: 'center',
    color: Colors.text.primary,
    marginBottom: Spacing.xl,
  },
  verifyButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['3xl'],
    alignItems: 'center',
    ...Shadows.sm,
    marginBottom: Spacing.xl,
    minWidth: 220,
  },
  verifyButtonDisabled: {
    backgroundColor: Colors.text.tertiary,
  },
  verifyButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
  spamWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    marginHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  spamWarningText: {
    ...Typography.footnote,
    color: '#92400E',
    flex: 1,
    lineHeight: 20,
  },
  spamBold: {
    fontWeight: '700',
  },
  pollingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  pollingText: {
    ...Typography.footnote,
    color: Colors.text.secondary,
  },
  resendButton: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
    marginBottom: Spacing.xl,
  },
  resendButtonDisabled: {
    borderColor: Colors.text.tertiary,
  },
  resendButtonText: {
    ...Typography.subhead,
    color: Colors.accent,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backText: {
    ...Typography.subhead,
    color: Colors.text.secondary,
  },
});
