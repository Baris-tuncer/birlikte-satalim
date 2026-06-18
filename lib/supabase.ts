import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (!__DEV__) {
    throw new Error(
      'EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_ANON_KEY tanimli olmali. ' +
      '.env.example dosyasini .env olarak kopyalayip degerleri doldurun.'
    );
  }
  console.warn('[Supabase] Env degiskenleri tanimli degil. __DEV__ modda mock data kullanilacak.');
}

// Web SSR sırasında AsyncStorage kullanılamaz (window is not defined)
// Platform'a göre storage seç
let storage: any = undefined;

if (Platform.OS !== 'web') {
  // Native (iOS/Android) - AsyncStorage kullan
  storage = require('@react-native-async-storage/async-storage').default;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    ...(storage ? { storage } : {}),
    autoRefreshToken: true,
    persistSession: Platform.OS !== 'web',
    detectSessionInUrl: false,
  },
});
