// .env dosyasi yokken __DEV__ modda auth guard'i ve Supabase cagrilarini atla.
// .env dosyasi varken (gercek Supabase baglantisi) __DEV__ modda bile auth aktif olur.
export const SKIP_AUTH_IN_DEV = __DEV__ && !process.env.EXPO_PUBLIC_SUPABASE_URL;
