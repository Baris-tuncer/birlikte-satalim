import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Platform, Alert } from 'react-native';
import { useAuth } from './auth-context';
import { useRouter } from 'expo-router';

// RevenueCat lazy import — native modül build'de yoksa crash olmaz
let Purchases: any = null;
let LOG_LEVEL: any = null;
try {
  const rc = require('react-native-purchases');
  Purchases = rc.default;
  LOG_LEVEL = rc.LOG_LEVEL;
} catch (e) {
  // Native modül henüz yüklenmemiş (eas build gerekli)
}

// RevenueCat API Keys — Dashboard'dan alınacak
const RC_IOS_KEY = 'appl_REPLACE_WITH_IOS_KEY';
const RC_ANDROID_KEY = 'goog_REPLACE_WITH_ANDROID_KEY';

const ENTITLEMENT_ID = 'pro';

interface SubscriptionState {
  isSubscribed: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number;
  subscriptionStatus: 'trial' | 'active' | 'expired';
  isLoading: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  purchaseSubscription: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  showPaywallIfNeeded: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const router = useRouter();

  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: true, // Default true to avoid flash of paywall
    isTrialActive: false,
    trialDaysLeft: 0,
    subscriptionStatus: 'trial',
    isLoading: true,
  });

  const [rcConfigured, setRcConfigured] = useState(false);

  // RevenueCat'i initialize et
  useEffect(() => {
    if (!Purchases) return; // Native modül yoksa atla

    const initRC = async () => {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        const apiKey = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;
        Purchases.configure({ apiKey });
        setRcConfigured(true);
      } catch (e) {
        console.warn('RevenueCat init error:', e);
      }
    };

    initRC();
  }, []);

  // Kullanıcı login olduğunda RevenueCat'e identify et
  useEffect(() => {
    if (!Purchases || !rcConfigured || !profile?.id) return;

    const identify = async () => {
      try {
        await Purchases.logIn(profile.id);
      } catch (e) {
        // Identify hatası — sessizce devam et
      }
    };

    identify();
  }, [rcConfigured, profile?.id]);

  // Abonelik durumunu hesapla
  const computeSubscriptionState = useCallback(
    (customerInfo: any): SubscriptionState => {
      // Admin kullanıcılar her zaman abone
      if (profile?.is_admin) {
        return {
          isSubscribed: true,
          isTrialActive: false,
          trialDaysLeft: 0,
          subscriptionStatus: 'active',
          isLoading: false,
        };
      }

      // RevenueCat entitlement kontrolü
      const hasEntitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] != null;

      if (hasEntitlement) {
        return {
          isSubscribed: true,
          isTrialActive: false,
          trialDaysLeft: 0,
          subscriptionStatus: 'active',
          isLoading: false,
        };
      }

      // Deneme süresi kontrolü
      const trialEnd = profile?.trial_ends_at;
      if (trialEnd) {
        const now = new Date();
        const endDate = new Date(trialEnd);
        const diffMs = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          return {
            isSubscribed: true,
            isTrialActive: true,
            trialDaysLeft: diffDays,
            subscriptionStatus: 'trial',
            isLoading: false,
          };
        }
      }

      // Ne entitlement ne deneme — expired
      return {
        isSubscribed: false,
        isTrialActive: false,
        trialDaysLeft: 0,
        subscriptionStatus: 'expired',
        isLoading: false,
      };
    },
    [profile?.is_admin, profile?.trial_ends_at]
  );

  // Abonelik durumunu kontrol et
  const checkSubscription = useCallback(async () => {
    if (!Purchases || !rcConfigured) {
      // RC yoksa veya henüz hazır değilse — sadece trial kontrolü yap
      setState(computeSubscriptionState(null));
      return;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      setState(computeSubscriptionState(customerInfo));
    } catch (e) {
      // RC hatası — trial kontrolüne düş
      setState(computeSubscriptionState(null));
    }
  }, [rcConfigured, computeSubscriptionState]);

  // Profil veya RC değiştiğinde kontrol et
  useEffect(() => {
    if (!profile) return;
    checkSubscription();
  }, [profile, checkSubscription]);

  // RevenueCat listener — abonelik değiştiğinde otomatik güncelle
  useEffect(() => {
    if (!Purchases || !rcConfigured) return;

    const listener = (customerInfo: any) => {
      setState(computeSubscriptionState(customerInfo));
    };

    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [rcConfigured, computeSubscriptionState]);

  // Satın alma
  const purchaseSubscription = useCallback(async () => {
    if (!Purchases || !rcConfigured) {
      Alert.alert('Hata', 'Ödeme sistemi henüz hazır değil. Lütfen tekrar deneyin.');
      return;
    }

    try {
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      if (!currentOffering || currentOffering.availablePackages.length === 0) {
        Alert.alert('Hata', 'Şu anda mevcut bir abonelik paketi bulunamadı.');
        return;
      }

      // İlk paketi al (aylık)
      const pkg = currentOffering.availablePackages[0];
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setState(computeSubscriptionState(customerInfo));

      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        Alert.alert('Tebrikler!', 'Aboneliğiniz başarıyla aktifleştirildi.');
      }
    } catch (e: any) {
      if (e.userCancelled) return;
      Alert.alert('Hata', e.message || 'Satın alma işlemi başarısız oldu.');
    }
  }, [rcConfigured, computeSubscriptionState]);

  // Satın almaları geri yükle
  const restorePurchases = useCallback(async () => {
    if (!Purchases || !rcConfigured) {
      Alert.alert('Hata', 'Ödeme sistemi henüz hazır değil.');
      return;
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      setState(computeSubscriptionState(customerInfo));

      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        Alert.alert('Başarılı', 'Aboneliğiniz geri yüklendi.');
      } else {
        Alert.alert('Bilgi', 'Aktif bir abonelik bulunamadı.');
      }
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'Geri yükleme başarısız oldu.');
    }
  }, [rcConfigured, computeSubscriptionState]);

  // Paywall kontrolü — abone değilse paywall'a yönlendir
  const showPaywallIfNeeded = useCallback((): boolean => {
    if (state.isSubscribed || state.isLoading) return false;
    router.push('/subscription' as any);
    return true;
  }, [state.isSubscribed, state.isLoading, router]);

  const value = useMemo(
    () => ({
      ...state,
      purchaseSubscription,
      restorePurchases,
      checkSubscription,
      showPaywallIfNeeded,
    }),
    [state, purchaseSubscription, restorePurchases, checkSubscription, showPaywallIfNeeded]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
