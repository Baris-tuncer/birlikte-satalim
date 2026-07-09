import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useSubscription } from '@/lib/subscription-context';

export default function SubscriptionScreen() {
  const router = useRouter();
  const {
    isSubscribed,
    isTrialActive,
    trialDaysLeft,
    subscriptionStatus,
    isLoading,
    purchaseSubscription,
    restorePurchases,
  } = useSubscription();

  const [purchasing, setPurchasing] = React.useState(false);
  const [restoring, setRestoring] = React.useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    await purchaseSubscription();
    setPurchasing(false);
  };

  const handleRestore = async () => {
    setRestoring(true);
    await restorePurchases();
    setRestoring(false);
  };

  // Abone ise direkt geri gönder
  React.useEffect(() => {
    if (!isLoading && isSubscribed) {
      router.back();
    }
  }, [isLoading, isSubscribed]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={28} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Ionicons name="diamond" size={40} color={Colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Beraber Satalim Pro</Text>
          <Text style={styles.heroSubtitle}>
            {subscriptionStatus === 'expired'
              ? 'Deneme sureniz sona erdi. Tum ozelliklere erismeye devam etmek icin abone olun.'
              : 'Gayrimenkul is birliginde bir adim onde olun.'}
          </Text>
        </View>

        {/* Durum karti */}
        {subscriptionStatus === 'expired' && (
          <View style={styles.expiredCard}>
            <Ionicons name="time-outline" size={20} color={Colors.error} />
            <Text style={styles.expiredText}>
              Deneme sureniz sona erdi
            </Text>
          </View>
        )}

        {isTrialActive && (
          <View style={styles.trialCard}>
            <Ionicons name="hourglass-outline" size={20} color={Colors.warning} />
            <Text style={styles.trialText}>
              Deneme suresi: {trialDaysLeft} gun kaldi
            </Text>
          </View>
        )}

        {/* Ozellikler */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Pro ile neler yapabilirsiniz?</Text>

          <FeatureRow
            icon="business-outline"
            text="Sinirsiz ilan girisi"
          />
          <FeatureRow
            icon="search-outline"
            text="Sinirsiz talep olusturma"
          />
          <FeatureRow
            icon="people-outline"
            text="Is birligi talebi gonderme"
          />
          <FeatureRow
            icon="git-compare-outline"
            text="Musterim Var butonu ile eslestirme"
          />
          <FeatureRow
            icon="notifications-outline"
            text="Bolgenize ozel anlik bildirimler"
          />
        </View>

        {/* Fiyat */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Aylik abonelik</Text>
          <Text style={styles.priceAmount}>599 TL / ay</Text>
          <Text style={styles.priceNote}>
            Otomatik yenilenir. Istediginiz zaman iptal edebilirsiniz.
          </Text>
        </View>

        {/* Butonlar */}
        <Pressable
          style={({ pressed }) => [
            styles.subscribeButton,
            pressed && { opacity: 0.9 },
            purchasing && { opacity: 0.7 },
          ]}
          onPress={handlePurchase}
          disabled={purchasing || isLoading}
        >
          {purchasing ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <Text style={styles.subscribeButtonText}>Abone Ol</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.restoreButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleRestore}
          disabled={restoring}
        >
          {restoring ? (
            <ActivityIndicator size="small" color={Colors.accent} />
          ) : (
            <Text style={styles.restoreButtonText}>Satin Almalari Geri Yukle</Text>
          )}
        </Pressable>

        {/* Yasal bilgiler */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            Odeme, Apple ID / Google Play hesabiniz uzerinden alinir. Abonelik, mevcut donem bitmeden
            en az 24 saat once iptal edilmezse otomatik olarak yenilenir. Aboneligi Ayarlar &gt;
            Apple ID / Google Play &gt; Abonelikler uzerinden iptal edebilirsiniz.
          </Text>
          <View style={styles.legalLinks}>
            <Pressable onPress={() => router.push('/legal/terms')}>
              <Text style={styles.legalLink}>Kullanim Kosullari</Text>
            </Pressable>
            <Text style={styles.legalDot}>·</Text>
            <Pressable onPress={() => router.push('/legal/privacy')}>
              <Text style={styles.legalLink}>Gizlilik Politikasi</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={Colors.accent} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent + '14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    ...Typography.title1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  expiredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.error + '0F',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error + '28',
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  expiredText: {
    ...Typography.subhead,
    color: Colors.error,
    fontWeight: '600',
  },
  trialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '0F',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.warning + '28',
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  trialText: {
    ...Typography.subhead,
    color: '#92400E',
    fontWeight: '600',
  },
  featuresCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  featuresTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent + '14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    ...Typography.subhead,
    color: Colors.text.primary,
    flex: 1,
  },
  priceCard: {
    backgroundColor: Colors.accent + '0A',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.accent + '28',
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  priceLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  priceAmount: {
    ...Typography.title1,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  priceNote: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  subscribeButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  subscribeButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
  restoreButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  restoreButtonText: {
    ...Typography.subhead,
    color: Colors.accent,
    fontWeight: '600',
  },
  legalSection: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  legalText: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legalLink: {
    ...Typography.caption1,
    color: Colors.accent,
    fontWeight: '500',
  },
  legalDot: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
  },
});
