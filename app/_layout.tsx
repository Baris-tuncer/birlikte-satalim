import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import * as Updates from 'expo-updates';
import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Theme';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { SubscriptionProvider } from '@/lib/subscription-context';
import { SKIP_AUTH_IN_DEV } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { registerForPushNotifications, addNotificationListeners, clearBadgeCount } from '@/lib/notifications';
import AnimatedSplash from '@/components/ui/AnimatedSplash';
import AppErrorBoundary from '@/components/ui/ErrorBoundary';
export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoggedIn, isLoading, profileLoading, emailVerified, profile } = useAuth();
  const notificationCleanup = useRef<(() => void) | null>(null);

  // Deep link ile gelen Supabase auth callback'lerini yakala
  useEffect(() => {
    const handleUrl = (url: string) => {
      if (!url) return;
      // Fragment'tan (#) access_token ve refresh_token çıkar
      const hashPart = url.split('#')[1];
      if (!hashPart) return;
      const params = new URLSearchParams(hashPart);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    };

    // Uygulama açıkken gelen deep link'leri dinle
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    // Uygulama kapalıyken gelen deep link'i kontrol et
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    return () => subscription.remove();
  }, []);

  // Push bildirim kaydı
  useEffect(() => {
    if (!isLoggedIn || !profile?.id) return;

    try {
      // Her açılışta sessiz kayıt — hata olursa profildeki butonla manual tetiklenebilir
      registerForPushNotifications(profile.id, true).catch(() => {});
      clearBadgeCount().catch(() => {});

      notificationCleanup.current = addNotificationListeners({
        onTap: (response) => {
          const data = response.notification.request.content.data;
          if (data?.matchId) {
            router.push(`/match/${data.matchId}`);
          } else if (data?.listingId && data?.type?.toString().includes('listing')) {
            router.push(`/listing/${data.listingId}`);
          } else if (data?.demandId && data?.type?.toString().includes('demand')) {
            router.push(`/demand/${data.demandId}`);
          }
        },
      });
    } catch (e) {
      // Bildirim kurulumu başarısız — sessizce devam et
    }

    return () => {
      notificationCleanup.current?.();
    };
  }, [isLoggedIn, profile?.id]);

  // Auth durumuna gore yonlendirme
  // __DEV__ modda Supabase yokken auth'u atla, tum ekranlari test et
  useEffect(() => {
    if (isLoading) return;
    if (SKIP_AUTH_IN_DEV) return; // Env var yokken auth guard devre disi

    const inAuthGroup = segments[0] === '(auth)';
    const inLegalGroup = segments[0] === 'legal';

    // Legal ve reset-password sayfalarina her zaman izin ver
    if (inLegalGroup) return;
    if (segments[0] === 'reset-password') return;

    // Profil henüz yükleniyorsa yönlendirme yapma (döngü önleme)
    if (isLoggedIn && emailVerified && profileLoading) return;

    if (!isLoggedIn) {
      // Giriş yapılmamış — auth akışı dışındaysa welcome'a yönlendir
      if (segments[1] !== 'welcome' && segments[1] !== 'login' && segments[1] !== 'register' && segments[1] !== 'forgot-password' && segments[1] !== 'verify-email') {
        router.replace('/(auth)/welcome');
      }
    } else if (isLoggedIn && inAuthGroup && (segments[1] === 'welcome' || segments[1] === 'login' || segments[1] === 'register')) {
      // Login/register sayfasında ama giriş yapılmış — doğru adıma yönlendir
      if (!emailVerified) {
        router.replace('/(auth)/verify-email');
      } else {
        // E-posta doğrulanmış, ana ekrana yönlendir (lisans durumu fark etmez)
        router.replace('/(tabs)');
      }
    } else if (isLoggedIn && !emailVerified) {
      // E-posta doğrulanmamış — verify-email dışındaysa yönlendir
      if (segments[1] !== 'verify-email') {
        router.replace('/(auth)/verify-email');
      }
    } else if (isLoggedIn && emailVerified && inAuthGroup) {
      // E-posta doğrulanmış, ana ekrana yönlendir (lisans durumu fark etmez)
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, isLoading, profileLoading, emailVerified, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="legal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="create" />
        <Stack.Screen name="listing" />
        <Stack.Screen name="demand" />
        <Stack.Screen name="match" />
        <Stack.Screen name="matches" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="subscription" options={{ presentation: 'modal' }} />
        <Stack.Screen name="tools" />
        <Stack.Screen name="admin" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // OTA güncelleme kontrolü — açılışta kontrol et, varsa kullanıcıya sor
  useEffect(() => {
    if (__DEV__) return; // Dev modda çalıştırma
    async function checkForOTAUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Güncelleme Hazır',
            'Yeni bir güncelleme indirildi. Uygulamayı şimdi yenilemek ister misiniz?',
            [
              { text: 'Sonra', style: 'cancel' },
              { text: 'Güncelle', onPress: () => Updates.reloadAsync() },
            ],
          );
        }
      } catch (_) {
        // Sessizce devam et
      }
    }
    checkForOTAUpdate();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <AuthProvider>
          <SubscriptionProvider>
            <AnimatedSplash>
              <RootLayoutNav />
            </AnimatedSplash>
          </SubscriptionProvider>
        </AuthProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
