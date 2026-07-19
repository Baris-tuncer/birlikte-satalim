import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { CITIES, CITY_DISTRICTS } from '@/lib/constants';
import DropdownPicker from '@/components/ui/DropdownPicker';
import SegmentControl from '@/components/ui/SegmentControl';
import {
  getProvinces,
  getDistricts,
  getNeighborhoods,
  queryParcel,
  type TkgmProvince,
  type TkgmDistrict,
  type TkgmNeighborhood,
} from '@/lib/tkgm';
import { getDroneHtml, calculateCentroid } from '@/lib/drone-html';

let WebView: any = null;
try {
  WebView = require('react-native-webview').WebView;
} catch {
  // Native modül yok
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBeYv6dJF-FYVuUB023jK67Jf5PRUR_ZyM';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type SearchMode = 0 | 1; // 0: adres, 1: ada/parsel

export default function DroneViewScreen() {
  // Arama modu
  const [searchMode, setSearchMode] = useState<SearchMode>(0);

  // Adres ile arama
  const [city, setCity] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [addressDetail, setAddressDetail] = useState('');

  // Ada/Parsel ile arama
  const [provinces, setProvinces] = useState<TkgmProvince[]>([]);
  const [districts, setDistricts] = useState<TkgmDistrict[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<TkgmNeighborhood[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<number | null>(null);
  const [adaNo, setAdaNo] = useState('');
  const [parselNo, setParselNo] = useState('');

  // 3D Görünüm
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const webViewRef = useRef<any>(null);

  // TKGM il listesini yükle
  useEffect(() => {
    getProvinces().then(setProvinces);
  }, []);

  // İlçe listesi
  useEffect(() => {
    if (selectedProvince) {
      setSelectedDistrict(null);
      setSelectedNeighborhood(null);
      setNeighborhoods([]);
      getDistricts(selectedProvince).then(setDistricts);
    }
  }, [selectedProvince]);

  // Mahalle listesi
  useEffect(() => {
    if (selectedDistrict) {
      setSelectedNeighborhood(null);
      getNeighborhoods(selectedDistrict).then(setNeighborhoods);
    }
  }, [selectedDistrict]);

  const districtOptions = city ? (CITY_DISTRICTS[city] || []).map((d) => ({ key: d, label: d })) : [];

  const handleGeocode = useCallback(async () => {
    if (!city || !district) {
      Alert.alert('Uyarı', 'Lütfen şehir ve ilçe seçin.');
      return;
    }
    setLoading(true);
    setCoordinates(null);
    setMapReady(false);

    const address = [addressDetail, district, city, 'Türkiye'].filter(Boolean).join(', ');
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const data = await res.json();
      if (data.results?.[0]?.geometry?.location) {
        const { lat, lng } = data.results[0].geometry.location;
        setCoordinates({ lat, lng });
      } else {
        Alert.alert('Bulunamadı', 'Bu adres için konum bulunamadı.');
      }
    } catch {
      Alert.alert('Hata', 'Konum aranırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [city, district, addressDetail]);

  const handleParcelSearch = useCallback(async () => {
    if (!selectedNeighborhood || !adaNo || !parselNo) {
      Alert.alert('Uyarı', 'Lütfen il, ilçe, mahalle, ada ve parsel girin.');
      return;
    }
    setLoading(true);
    setCoordinates(null);
    setMapReady(false);

    try {
      // TKGM API'den parsel sorgula
      const res = await fetch(
        `https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api/parsel/${selectedNeighborhood}/${adaNo}/${parselNo}`,
      );
      if (!res.ok) {
        Alert.alert('Bulunamadı', 'Bu ada/parsel bilgisi bulunamadı.');
        return;
      }
      const data = await res.json();
      const feature = data?.type === 'Feature' ? data : data?.features?.[0];

      if (feature?.geometry?.coordinates) {
        const centroid = calculateCentroid(feature.geometry.coordinates);
        if (centroid) {
          setCoordinates(centroid);
        } else {
          Alert.alert('Hata', 'Parsel koordinatları hesaplanamadı.');
        }
      } else {
        Alert.alert('Bulunamadı', 'Bu ada/parsel için konum bilgisi bulunamadı.');
      }
    } catch {
      Alert.alert('Hata', 'Parsel sorgulanırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [selectedNeighborhood, adaNo, parselNo]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'ready') setMapReady(true);
      if (msg.type === 'orbitStarted') setIsOrbiting(true);
      if (msg.type === 'orbitStopped' || msg.type === 'viewReset') setIsOrbiting(false);
    } catch {}
  }, []);

  const injectJS = (code: string) => {
    webViewRef.current?.injectJavaScript(`${code}; true;`);
  };

  if (!WebView) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.unavailable}>
          <Ionicons name="videocam-off-outline" size={48} color={Colors.text.tertiary} />
          <Text style={styles.unavailableTitle}>3D Drone Görünümü</Text>
          <Text style={styles.unavailableText}>
            Bu özellik için uygulamanın güncel sürümünü indirin.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 3D Görünüm açıksa */}
        {coordinates ? (
          <View style={{ flex: 1 }}>
            {/* WebView */}
            <View style={styles.webViewContainer}>
              <WebView
                ref={webViewRef}
                source={{ html: getDroneHtml(coordinates) }}
                style={styles.webView}
                onMessage={handleWebViewMessage}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
              />

              {/* Kontrol butonları */}
              {mapReady && (
                <View style={styles.controls}>
                  <Pressable
                    style={[styles.controlBtn, isOrbiting && styles.controlBtnActive]}
                    onPress={() => {
                      if (isOrbiting) {
                        injectJS('stopOrbit()');
                      } else {
                        injectJS('startOrbit()');
                      }
                    }}
                  >
                    <Ionicons
                      name={isOrbiting ? 'pause' : 'play'}
                      size={20}
                      color="#FFF"
                    />
                    <Text style={styles.controlBtnText}>
                      {isOrbiting ? 'Durdur' : 'Çekimi Başlat'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.controlBtnSecondary}
                    onPress={() => injectJS('resetView()')}
                  >
                    <Ionicons name="refresh" size={18} color={Colors.text.primary} />
                  </Pressable>

                  <Pressable
                    style={styles.controlBtnSecondary}
                    onPress={() => {
                      injectJS('stopOrbit()');
                      setCoordinates(null);
                      setMapReady(false);
                      setIsOrbiting(false);
                    }}
                  >
                    <Ionicons name="close" size={18} color={Colors.text.primary} />
                  </Pressable>
                </View>
              )}

              {!mapReady && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.accent} />
                  <Text style={styles.loadingText}>3D Görünüm Yükleniyor...</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          /* Arama Formu */
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>3D Drone Görünümü</Text>
            <Text style={styles.subtitle}>
              Binaların 3D görünümünü oluşturun ve ekran kaydı ile paylaşın
            </Text>

            {/* Arama Modu Seçici */}
            <SegmentControl
              segments={['Adres ile Ara', 'Ada/Parsel ile Ara']}
              selected={searchMode}
              onSelect={(i) => setSearchMode(i as SearchMode)}
            />

            <View style={styles.formSection}>
              {searchMode === 0 ? (
                /* Adres ile Arama */
                <>
                  <Text style={styles.label}>Şehir</Text>
                  <DropdownPicker
                    label="Şehir Seçin"
                    value={city}
                    options={CITIES.map((c) => ({ key: c, label: c }))}
                    onSelect={(v) => { setCity(v); setDistrict(null); }}
                  />

                  <Text style={styles.label}>İlçe</Text>
                  <DropdownPicker
                    label="İlçe Seçin"
                    value={district}
                    options={districtOptions}
                    onSelect={setDistrict}
                    placeholder={city ? 'İlçe seçin...' : 'Önce şehir seçin'}
                  />

                  <Text style={styles.label}>Mahalle / Sokak (opsiyonel)</Text>
                  <TextInput
                    style={styles.input}
                    value={addressDetail}
                    onChangeText={setAddressDetail}
                    placeholder="Örn: Atatürk Mah. 123. Sok."
                    placeholderTextColor={Colors.text.tertiary}
                  />

                  <Pressable
                    style={[styles.searchBtn, loading && { opacity: 0.6 }]}
                    onPress={handleGeocode}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="search" size={18} color="#FFF" />
                        <Text style={styles.searchBtnText}>Görüntüle</Text>
                      </>
                    )}
                  </Pressable>
                </>
              ) : (
                /* Ada/Parsel ile Arama */
                <>
                  <Text style={styles.label}>İl</Text>
                  <DropdownPicker
                    label="İl Seçin"
                    value={selectedProvince?.toString() ?? null}
                    options={provinces.map((p) => ({ key: p.id.toString(), label: p.name }))}
                    onSelect={(v) => setSelectedProvince(Number(v))}
                  />

                  <Text style={styles.label}>İlçe</Text>
                  <DropdownPicker
                    label="İlçe Seçin"
                    value={selectedDistrict?.toString() ?? null}
                    options={districts.map((d) => ({ key: d.id.toString(), label: d.name }))}
                    onSelect={(v) => setSelectedDistrict(Number(v))}
                    placeholder={selectedProvince ? 'İlçe seçin...' : 'Önce il seçin'}
                  />

                  <Text style={styles.label}>Mahalle</Text>
                  <DropdownPicker
                    label="Mahalle Seçin"
                    value={selectedNeighborhood?.toString() ?? null}
                    options={neighborhoods.map((n) => ({ key: n.id.toString(), label: n.name }))}
                    onSelect={(v) => setSelectedNeighborhood(Number(v))}
                    placeholder={selectedDistrict ? 'Mahalle seçin...' : 'Önce ilçe seçin'}
                  />

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <Text style={styles.label}>Ada No</Text>
                      <TextInput
                        style={styles.input}
                        value={adaNo}
                        onChangeText={setAdaNo}
                        placeholder="Örn: 1234"
                        placeholderTextColor={Colors.text.tertiary}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.halfField}>
                      <Text style={styles.label}>Parsel No</Text>
                      <TextInput
                        style={styles.input}
                        value={parselNo}
                        onChangeText={setParselNo}
                        placeholder="Örn: 5"
                        placeholderTextColor={Colors.text.tertiary}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>

                  <Pressable
                    style={[styles.searchBtn, loading && { opacity: 0.6 }]}
                    onPress={handleParcelSearch}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="search" size={18} color="#FFF" />
                        <Text style={styles.searchBtnText}>Görüntüle</Text>
                      </>
                    )}
                  </Pressable>
                </>
              )}
            </View>

            {/* Bilgi notu */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.text.secondary} />
              <Text style={styles.infoText}>
                3D görünüm yüklendikten sonra "Çekimi Başlat" butonuyla kamera otomatik döner.
                Telefonunuzun ekran kaydı özelliğiyle videoyu kaydedebilirsiniz.
              </Text>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  title: {
    ...Typography.title2,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
  },
  formSection: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  label: {
    ...Typography.footnote,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.text.primary,
    ...Shadows.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    marginTop: Spacing.xl,
    ...Shadows.md,
  },
  searchBtnText: {
    ...Typography.headline,
    color: '#FFF',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    marginTop: Spacing.xl,
    ...Shadows.sm,
  },
  infoText: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  // WebView & Controls
  webViewContainer: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  webView: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    ...Shadows.lg,
  },
  controlBtnActive: {
    backgroundColor: Colors.primary,
  },
  controlBtnText: {
    ...Typography.headline,
    color: '#FFF',
    fontSize: 15,
  },
  controlBtnSecondary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
  },
  loadingText: {
    ...Typography.footnote,
    color: '#FFF',
    marginTop: Spacing.md,
  },
  // Unavailable state
  unavailable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
  },
  unavailableTitle: {
    ...Typography.title3,
    color: Colors.text.primary,
  },
  unavailableText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
