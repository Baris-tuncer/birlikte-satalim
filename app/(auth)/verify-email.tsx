import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { SKIP_AUTH_IN_DEV } from '@/lib/config';

const RESEND_COOLDOWN = 60;
const POLL_INTERVAL = 3000;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user, emailVerified } = useAuth();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const userEmail = user?.email ?? '';

  // E-posta doğrulandığında yönlendir
  useEffect(() => {
    if (emailVerified) {
      router.replace('/(auth)/license-upload');
    }
  }, [emailVerified, router]);

  // Polling: email_confirmed_at kontrol
  useEffect(() => {
    if (SKIP_AUTH_IN_DEV) {
      const timeout = setTimeout(() => {
        router.replace('/(auth)/license-upload');
      }, 3000);
      return () => clearTimeout(timeout);
    }

    pollRef.current = setInterval(async () => {
      // getUser() veritabanından direkt sorgular — refreshSession'dan daha güvenilir
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user?.email_confirmed_at) {
        if (pollRef.current) clearInterval(pollRef.current);
        // Session'ı da yenile ki auth-context güncellensin
        await supabase.auth.refreshSession();
        router.replace('/(auth)/license-upload');
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [router]);

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

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });
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

        <Text style={styles.title}>E-posta Doğrulaması</Text>
        <Text style={styles.subtitle}>
          Aşağıdaki adrese bir doğrulama bağlantısı gönderdik:
        </Text>

        <View style={styles.emailBadge}>
          <Text style={styles.emailText}>{userEmail || 'ornek@email.com'}</Text>
        </View>

        <Text style={styles.instruction}>
          Lütfen e-posta kutunuzu kontrol edin ve bağlantıya tıklayarak
          hesabınızı doğrulayın. Spam klasörünü de kontrol etmeyi unutmayın.
        </Text>

        {/* Bekleme göstergesi */}
        <View style={styles.pollingRow}>
          <ActivityIndicator size="small" color={Colors.accent} />
          <Text style={styles.pollingText}>Doğrulama bekleniyor...</Text>
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
            <ActivityIndicator size="small" color={Colors.text.inverse} />
          ) : (
            <Text style={styles.resendButtonText}>
              {resendCooldown > 0
                ? `Tekrar Gönder (${resendCooldown}sn)`
                : 'Tekrar Gönder'}
            </Text>
          )}
        </Pressable>

        {/* Giriş ekranına dön */}
        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={16} color={Colors.text.secondary} />
          <Text style={styles.backText}>Giriş ekranına dön</Text>
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
  },
  emailText: {
    ...Typography.headline,
    color: Colors.primary,
  },
  instruction: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  pollingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  pollingText: {
    ...Typography.footnote,
    color: Colors.text.secondary,
  },
  resendButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['3xl'],
    alignItems: 'center',
    ...Shadows.sm,
    marginBottom: Spacing.xl,
    minWidth: 220,
  },
  resendButtonDisabled: {
    backgroundColor: Colors.text.tertiary,
  },
  resendButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
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
