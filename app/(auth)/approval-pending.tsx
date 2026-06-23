import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated, Easing, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';

export default function ApprovalPendingScreen() {
  const { signOut, refreshProfile } = useAuth();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  // Her 15 saniyede profili yenile — onay geldiğinde routing guard yönlendirir
  useEffect(() => {
    const interval = setInterval(() => {
      refreshProfile();
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshProfile]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const steps = [
    { label: 'Kayıt', completed: true },
    { label: 'Belge Yükleme', completed: true },
    { label: 'Onay Bekleniyor', completed: false, active: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="time-outline" size={48} color={Colors.accent} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Belgeniz İnceleniyor</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Yetki belgeniz ekibimiz tarafından incelenmektedir. Onay süreci en geç 24 saat içinde tamamlanacaktır.
        </Text>

        {/* Steps Card */}
        <View style={styles.stepsCard}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepIndicatorColumn}>
                {step.completed ? (
                  <View style={styles.stepCircleCompleted}>
                    <Ionicons name="checkmark" size={14} color={Colors.text.inverse} />
                  </View>
                ) : (
                  <Animated.View
                    style={[
                      styles.stepCircleActive,
                      { opacity: pulseAnim },
                    ]}
                  >
                    <View style={styles.stepDotInner} />
                  </Animated.View>
                )}
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      step.completed ? styles.stepLineCompleted : styles.stepLinePending,
                    ]}
                  />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepNumber}>Adım {index + 1}</Text>
                <Text
                  style={[
                    styles.stepLabel,
                    step.active && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
                {step.completed && (
                  <Text style={styles.stepStatus}>Tamamlandı</Text>
                )}
                {step.active && (
                  <Text style={styles.stepStatusActive}>Devam ediyor...</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* WhatsApp Destek */}
        <Pressable
          style={({ pressed }) => [
            styles.supportButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => Linking.openURL('https://wa.me/905332951303?text=Merhaba, Beraber Satalım uygulaması hakkında destek almak istiyorum.')}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          <Text style={styles.supportText}>Destek Hattı</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
        </Pressable>

        {/* Sign Out Button */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['5xl'],
    paddingBottom: Spacing['3xl'],
  },
  // Icon
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.accent + '14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  // Title
  title: {
    ...Typography.title1,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  // Subtitle
  subtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  // Steps Card
  stepsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    width: '100%',
    ...Shadows.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicatorColumn: {
    alignItems: 'center',
    width: 28,
    marginRight: Spacing.lg,
  },
  stepCircleCompleted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.text.inverse,
  },
  stepLine: {
    width: 2,
    height: 28,
    marginVertical: Spacing.xs,
  },
  stepLineCompleted: {
    backgroundColor: Colors.success,
  },
  stepLinePending: {
    backgroundColor: Colors.border,
  },
  stepContent: {
    flex: 1,
    paddingBottom: Spacing.xl,
  },
  stepNumber: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
    fontWeight: '500',
    marginBottom: 2,
  },
  stepLabel: {
    ...Typography.headline,
    color: Colors.text.primary,
  },
  stepLabelActive: {
    color: Colors.accent,
  },
  stepStatus: {
    ...Typography.caption1,
    color: Colors.success,
    fontWeight: '500',
    marginTop: 2,
  },
  stepStatusActive: {
    ...Typography.caption1,
    color: Colors.accent,
    fontWeight: '500',
    marginTop: 2,
  },
  // Bottom
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    width: '100%',
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  supportText: {
    ...Typography.headline,
    color: '#25D366',
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '0A',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error + '28',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  signOutText: {
    ...Typography.headline,
    color: Colors.error,
  },
});
