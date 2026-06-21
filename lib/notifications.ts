import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from './supabase';

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Push token al ve Supabase'e kaydet
export async function registerForPushNotifications(userId: string, silent = true): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      if (!silent) Alert.alert('Uyarı', 'Push bildirimleri sadece fiziksel cihazda çalışır.');
      return null;
    }

    // Android kanalı ayarla (izin istemeden önce)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Varsayılan',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B4A',
      });
    }

    // Mevcut izin durumunu kontrol et
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // İzin yoksa iste
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      if (!silent) {
        Alert.alert(
          'Bildirim İzni Gerekli',
          'Eşleşme ve bölge bildirimlerini alabilmek için bildirim iznini ayarlardan açmanız gerekiyor.',
        );
      }
      return null;
    }

    // Token al
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '264935b9-802f-4f3b-a79a-75677adaf202',
    });
    const token = tokenData.data;

    // Token'ı Supabase'e kaydet — başarısız olursa 1 kez tekrar dene
    let upsertError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const { error } = await supabase.from('push_tokens').upsert(
        {
          user_id: userId,
          token,
          platform: Platform.OS,
        },
        { onConflict: 'user_id,token' }
      );
      if (!error) {
        upsertError = null;
        break;
      }
      upsertError = error;
      // İlk denemede hata olduysa 1sn bekle tekrar dene
      if (attempt === 0) await new Promise(r => setTimeout(r, 1000));
    }

    if (upsertError) {
      console.error('Push token kaydedilemedi:', upsertError);
      if (!silent) Alert.alert('Hata', 'Bildirim kaydı yapılamadı: ' + upsertError.message);
      return null;
    }

    if (!silent) Alert.alert('Başarılı', 'Bildirimler etkinleştirildi.');
    return token;
  } catch (e: any) {
    console.error('Push bildirim kayit hatasi:', e);
    if (!silent) Alert.alert('Hata', 'Bildirim kurulumu başarısız: ' + (e?.message ?? 'Bilinmeyen hata'));
    return null;
  }
}

// Bildirim dinleyicileri ekle
export function addNotificationListeners(callbacks: {
  onReceive?: (notification: Notifications.Notification) => void;
  onTap?: (response: Notifications.NotificationResponse) => void;
}) {
  const receiveSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      callbacks.onReceive?.(notification);
    }
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      callbacks.onTap?.(response);
    }
  );

  return () => {
    receiveSubscription.remove();
    responseSubscription.remove();
  };
}

// Badge sayısını sıfırla
export async function clearBadgeCount() {
  await Notifications.setBadgeCountAsync(0);
}
