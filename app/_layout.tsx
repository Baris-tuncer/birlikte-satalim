import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Theme';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { SKIP_AUTH_IN_DEV } from '@/lib/config';
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
  const { isLoggedIn, isLoading, emailVerified, licenseStatus, profile } = useAuth();
  const notificationCleanup = useRef<(() => void) | null>(null);

  // Push bildirim kaydı
  useEffect(() => {
    if (!isLoggedIn || !profile?.id) return;

    registerForPushNotifications(profile.id);
    clearBadgeCount();

    notificationCleanup.current = addNotificationListeners({
      onTap: (response) => {
        const data = response.notification.request.content.data;
        if (data?.matchId) {
          router.push(`/match/${data.matchId}`);
        }
      },
    });

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

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isLoggedIn && !emailVerified && !inAuthGroup) {
      router.replace('/(auth)/verify-email');
    } else if (isLoggedIn && emailVerified && licenseStatus === 'none' && !inAuthGroup) {
      router.replace('/(auth)/license-upload');
    } else if (isLoggedIn && emailVerified && licenseStatus === 'pending' && !inAuthGroup) {
      router.replace('/(auth)/approval-pending');
    } else if (isLoggedIn && emailVerified && licenseStatus === 'approved' && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, isLoading, emailVerified, segments, licenseStatus]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
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
        <Stack.Screen name="reset-password" />
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

  if (!loaded) {
    return null;
  }

  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AnimatedSplash>
          <RootLayoutNav />
        </AnimatedSplash>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
