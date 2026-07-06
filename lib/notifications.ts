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

// Android bildirim kanalını uygulama başlatılır başlatılmaz oluştur
// (push geldiğinde kanal hazır olsun)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'İş Birliği ve İlan Bildirimleri',
    description: 'Yeni iş birliği talepleri, uygun ilanlar ve bölge bildirimleri',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF6B4A',
    showBadge: true,
  });
}

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
        name: 'İş Birliği ve İlan Bildirimleri',
        description: 'Yeni iş birliği talepleri, uygun ilanlar ve bölge bildirimleri',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B4A',
        showBadge: true,
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
          'İş birliği ve bölge bildirimlerini alabilmek için bildirim iznini ayarlardan açmanız gerekiyor.',
        );
      }
      return null;
    }

    // Token al
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '264935b9-802f-4f3b-a79a-75677adaf202',
    });
    const token = tokenData.data;

    // Eski token'ları sil, yeni token'ı kaydet (kullanıcı başına tek token)
    await supabase.from('push_tokens').delete().eq('user_id', userId);

    let upsertError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const { error } = await supabase.from('push_tokens').insert({
        user_id: userId,
        token,
        platform: Platform.OS,
      });
      if (!error) {
        upsertError = null;
        break;
      }
      upsertError = error;
      if (attempt === 0) await new Promise(r => setTimeout(r, 1000));
    }

    if (upsertError) {
      // Push token kaydedilemedi
      if (!silent) Alert.alert('Hata', 'Bildirim kaydı yapılamadı: ' + upsertError.message);
      return null;
    }

    if (!silent) Alert.alert('Başarılı', 'Bildirimler etkinleştirildi.');
    return token;
  } catch (e: any) {
    // Push bildirim kayıt hatası
    if (!silent) Alert.alert('Hata', 'Bildirim kurulumu başarısız: ' + (e?.message ?? 'Bilinmeyen hata'));
    return null;
  }
}

// Bildirim izin durumunu kontrol et
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    if (!Device.isDevice) return false;
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
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
