import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { formatPriceInput, formatPrice } from '@/lib/format';
import { CITIES, CITY_DISTRICTS } from '@/lib/constants';
import DropdownPicker from '@/components/ui/DropdownPicker';
import SegmentControl from '@/components/ui/SegmentControl';
import {
  hesaplaDegerleme,
  analizEtHukukiRisk,
  NITELIK_OPTIONS,
  TAPU_TIPI_OPTIONS,
  RISK_LEVEL_CONFIG,
  KONUM_KALITESI_OPTIONS,
  type ValuationResult,
  type RiskAnalysisResult,
  type Nitelik,
  type TapuTipi,
  type KonumKalitesi,
} from '@/lib/valuation';
import {
  getBestPrice,
  getDistrictNeighborhoods,
} from '@/lib/neighborhood-prices';
import {
  getEarthquakeZone,
  getEarthquakeRiskLabel,
} from '@/lib/earthquake-zones';
import {
  getProvinces as getTkgmProvinces,
  getDistricts as getTkgmDistricts,
  getNeighborhoods as getTkgmNeighborhoods,
  queryParcel,
  normalizeNitelik,
  type TkgmNeighborhood,
} from '@/lib/tkgm';

function parseNumber(text: string): number {
  return Number(text.replace(/\./g, '')) || 0;
}

function normalizeTr(s: string): string {
  return s
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .trim();
}

// ─── Sub-components ──────────────────────────────────

function ResultRow({
  label,
  sublabel,
  value,
  bold,
  accent,
}: {
  label: string;
  sublabel?: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <View style={styles.resultRow}>
      <View style={{ flex: 1 }}>
        <Text style={bold ? styles.resultLabelBold : styles.resultLabel}>
          {label}
        </Text>
        {sublabel ? <Text style={styles.resultSublabel}>{sublabel}</Text> : null}
      </View>
      <Text
        style={[
          styles.resultValue,
          bold && styles.resultValueBold,
          accent && { color: Colors.accent },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function FindingCard({ finding }: { finding: RiskAnalysisResult['findings'][0] }) {
  const cfg = RISK_LEVEL_CONFIG[finding.level];
  return (
    <View style={[styles.findingCard, { borderLeftColor: cfg.color }]}>
      <View style={styles.findingHeader}>
        <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
        <Text style={[styles.findingLevel, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
      <Text style={styles.findingRule}>{finding.rule}</Text>
      <Text style={styles.findingMessage}>{finding.message}</Text>
      <View style={styles.findingActionBox}>
        <Text style={styles.findingActionLabel}>Yapılması Gereken:</Text>
        <Text style={styles.findingActionText}>{finding.actionRequired}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────

export default function ValuationScreen() {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState(0);

  // — Değerleme state
  const [valCity, setValCity] = useState<string | null>(null);
  const [valDistrict, setValDistrict] = useState<string | null>(null);
  const [valNeighborhood, setValNeighborhood] = useState<string | null>(null);
  const [m2Fiyat, setM2Fiyat] = useState('');
  const [yuzolcumu, setYuzolcumu] = useState('');
  const [konumKalitesi, setKonumKalitesi] = useState<string | null>('normal');
  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null);
  const [priceLevel, setPriceLevel] = useState<'mahalle' | 'ilce' | null>(null);

  // — Risk state
  const [riskCity, setRiskCity] = useState<string | null>(null);
  const [riskDistrict, setRiskDistrict] = useState<string | null>(null);
  const [adaNo, setAdaNo] = useState('');
  const [parselNo, setParselNo] = useState('');
  const [tkgmLoading, setTkgmLoading] = useState(false);
  const [tkgmResult, setTkgmResult] = useState<string | null>(null); // 'success' | 'error' | null
  const [selectedNitelik, setSelectedNitelik] = useState<string | null>(null);
  const [riskYuzolcumu, setRiskYuzolcumu] = useState('');
  const [selectedTapuTipi, setSelectedTapuTipi] = useState<string | null>(null);
  const [riskResult, setRiskResult] = useState<RiskAnalysisResult | null>(null);

  // — TKGM resolution state
  const [tkgmProvinceId, setTkgmProvinceId] = useState<number | null>(null);
  const [tkgmDistrictId, setTkgmDistrictId] = useState<number | null>(null);
  const [tkgmNeighborhoods, setTkgmNeighborhoods] = useState<TkgmNeighborhood[]>([]);
  const [riskNeighborhood, setRiskNeighborhood] = useState<string | null>(null);
  const [tkgmNeighborhoodId, setTkgmNeighborhoodId] = useState<number | null>(null);
  const [tkgmLoadingMahalle, setTkgmLoadingMahalle] = useState(false);
  const provincesCache = useRef<{ id: number; name: string }[]>([]);

  // Resolve TKGM province ID when city changes
  useEffect(() => {
    if (!riskCity) { setTkgmProvinceId(null); return; }
    let cancelled = false;
    (async () => {
      if (provincesCache.current.length === 0) {
        provincesCache.current = await getTkgmProvinces();
      }
      if (cancelled) return;
      const norm = normalizeTr(riskCity);
      const match = provincesCache.current.find((p) => normalizeTr(p.name) === norm);
      setTkgmProvinceId(match?.id ?? null);
    })();
    return () => { cancelled = true; };
  }, [riskCity]);

  // Resolve TKGM district ID + load neighborhoods when district changes
  useEffect(() => {
    setTkgmDistrictId(null);
    setTkgmNeighborhoods([]);
    setTkgmNeighborhoodId(null);
    setRiskNeighborhood(null);
    if (!riskDistrict || !tkgmProvinceId) return;
    let cancelled = false;
    (async () => {
      setTkgmLoadingMahalle(true);
      const districts = await getTkgmDistricts(tkgmProvinceId);
      if (cancelled) return;
      const norm = normalizeTr(riskDistrict);
      const match = districts.find((d) => normalizeTr(d.name) === norm);
      setTkgmDistrictId(match?.id ?? null);
      if (match) {
        const nbrs = await getTkgmNeighborhoods(match.id);
        if (!cancelled) setTkgmNeighborhoods(nbrs);
      }
      if (!cancelled) setTkgmLoadingMahalle(false);
    })();
    return () => { cancelled = true; };
  }, [riskDistrict, tkgmProvinceId]);

  // — Derived: options
  const cityOptions = useMemo(
    () => CITIES.map((c) => ({ key: c, label: c })),
    [],
  );

  const valDistrictOptions = useMemo(() => {
    if (!valCity) return [];
    return (CITY_DISTRICTS[valCity] ?? []).map((d) => ({ key: d, label: d }));
  }, [valCity]);

  const valNeighborhoodOptions = useMemo(() => {
    if (!valCity || !valDistrict) return [];
    const neighborhoods = getDistrictNeighborhoods(valCity, valDistrict);
    if (neighborhoods.length === 0) {
      return [];
    }
    return neighborhoods.map((n) => ({ key: n, label: n }));
  }, [valCity, valDistrict]);

  const riskDistrictOptions = useMemo(() => {
    if (!riskCity) return [];
    return (CITY_DISTRICTS[riskCity] ?? []).map((d) => ({ key: d, label: d }));
  }, [riskCity]);

  const riskNeighborhoodOptions = useMemo(() => {
    return tkgmNeighborhoods.map((n) => ({ key: String(n.id), label: n.name }));
  }, [tkgmNeighborhoods]);

  // Deprem bilgisi
  const riskEarthquakeInfo = useMemo(() => {
    if (!riskCity || !riskDistrict) return null;
    const zone = getEarthquakeZone(riskCity, riskDistrict);
    if (!zone) return null;
    return { zone, label: getEarthquakeRiskLabel(zone) };
  }, [riskCity, riskDistrict]);

  // — Değerleme handlers
  const handleValCityChange = (city: string) => {
    setValCity(city);
    setValDistrict(null);
    setValNeighborhood(null);
    setM2Fiyat('');
    setValuationResult(null);
    setPriceLevel(null);
  };

  const handleValDistrictChange = (district: string) => {
    setValDistrict(district);
    setValNeighborhood(null);
    setValuationResult(null);
    // Set district-level price as default
    if (valCity) {
      const result = getBestPrice(valCity, district);
      if (result) {
        setM2Fiyat(formatPriceInput(String(result.price)));
        setPriceLevel(result.level);
      } else {
        setM2Fiyat('');
        setPriceLevel(null);
      }
    }
  };

  const handleValNeighborhoodChange = (neighborhood: string) => {
    setValNeighborhood(neighborhood);
    setValuationResult(null);
    if (valCity && valDistrict) {
      const result = getBestPrice(valCity, valDistrict, neighborhood);
      if (result) {
        setM2Fiyat(formatPriceInput(String(result.price)));
        setPriceLevel(result.level);
      }
    }
  };

  const handleDegerlemeHesapla = () => {
    const fiyat = parseNumber(m2Fiyat);
    const alan = parseFloat(yuzolcumu) || 0;
    if (fiyat <= 0 || alan <= 0) return;
    setValuationResult(
      hesaplaDegerleme(fiyat, alan, (konumKalitesi as KonumKalitesi) || 'normal'),
    );
  };

  // — Risk handlers
  const handleRiskCityChange = (city: string) => {
    setRiskCity(city);
    setRiskDistrict(null);
    setRiskResult(null);
    setTkgmResult(null);
    setRiskNeighborhood(null);
    setTkgmNeighborhoodId(null);
  };

  const handleRiskDistrictChange = (district: string) => {
    setRiskDistrict(district);
    setRiskResult(null);
    setTkgmResult(null);
    setRiskNeighborhood(null);
    setTkgmNeighborhoodId(null);
  };

  const handleRiskNeighborhoodChange = (key: string) => {
    const nbr = tkgmNeighborhoods.find((n) => String(n.id) === key);
    setRiskNeighborhood(nbr?.name ?? null);
    setTkgmNeighborhoodId(nbr?.id ?? null);
    setTkgmResult(null);
  };

  const handleTkgmQuery = useCallback(async () => {
    if (!adaNo.trim() || !parselNo.trim() || !tkgmNeighborhoodId) return;
    setTkgmLoading(true);
    setTkgmResult(null);
    try {
      const parcel = await queryParcel(tkgmNeighborhoodId, adaNo.trim(), parselNo.trim());
      if (parcel && parcel.nitelik) {
        setSelectedNitelik(normalizeNitelik(parcel.nitelik));
        if (parcel.alan > 0) {
          setRiskYuzolcumu(String(Math.round(parcel.alan)));
        }
        setTkgmResult('success');
      } else {
        setTkgmResult('error');
      }
    } catch {
      setTkgmResult('error');
    }
    setTkgmLoading(false);
  }, [adaNo, parselNo, tkgmNeighborhoodId]);

  const handleRiskAnaliz = () => {
    if (!selectedNitelik || !selectedTapuTipi) return;
    const alan = parseFloat(riskYuzolcumu) || 0;
    if (alan <= 0) return;
    setRiskResult(
      analizEtHukukiRisk({
        nitelik: selectedNitelik as Nitelik,
        yuzolcumu: alan,
        tapuTipi: selectedTapuTipi as TapuTipi,
        city: riskCity ?? undefined,
        district: riskDistrict ?? undefined,
      }),
    );
  };

  const handleShare = async () => {
    const lines: string[] = [];
    lines.push('BERABER SATALIM — DEĞERLEMELİK RAPOR');
    lines.push('═══════════════════════════════════');
    lines.push(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`);

    if (valuationResult && valCity && valDistrict) {
      lines.push('');
      lines.push('── FİYAT DEĞERLEMESİ ──────────────');
      const loc = [valCity, valDistrict, valNeighborhood].filter(Boolean).join(' / ');
      lines.push(`Konum: ${loc}`);
      lines.push(`m² Fiyatı: ${formatPrice(parseNumber(m2Fiyat))}`);
      lines.push(`Yüzölçümü: ${yuzolcumu} m²`);
      if (konumKalitesi && konumKalitesi !== 'normal') {
        const kLabel = KONUM_KALITESI_OPTIONS.find((o) => o.key === konumKalitesi)?.label;
        if (kLabel) lines.push(`Konum Kalitesi: ${kLabel}`);
      }
      lines.push('');
      lines.push(`Baz Değer: ${formatPrice(valuationResult.basePrice)}`);
      lines.push(`Hızlı Satış (~3-4 hafta): ${formatPrice(valuationResult.hizliSatis)}`);
      lines.push(`3 Aylık Satış: ${formatPrice(valuationResult.ucAylik)}`);
      lines.push(`6+ Aylık Satış: ${formatPrice(valuationResult.altiAylikMin)} – ${formatPrice(valuationResult.altiAylikMax)}`);
    }

    if (riskResult) {
      const cfg = RISK_LEVEL_CONFIG[riskResult.overallLevel];
      lines.push('');
      lines.push('── HUKUKİ RİSK ANALİZİ ────────────');
      lines.push(`Genel Risk Düzeyi: ${cfg.label}`);
      if (riskResult.earthquakeLabel) {
        lines.push(`Deprem Bölgesi: ${riskResult.earthquakeLabel}`);
      }
      lines.push('');
      riskResult.findings.forEach((f, i) => {
        const fCfg = RISK_LEVEL_CONFIG[f.level];
        lines.push(`${i + 1}. ${fCfg.label} — ${f.rule}`);
        lines.push(`   ${f.message}`);
        lines.push(`   → ${f.actionRequired}`);
        lines.push('');
      });
    }

    lines.push('─────────────────────────────────────');
    lines.push('Bu rapor tahmini bilgi amaçlıdır. Kesin hukuki değerlendirme için uzman görüşü alın.');

    await Share.share({ message: lines.join('\n'), title: 'Değerleme Raporu' });
  };

  const canCalculate = parseNumber(m2Fiyat) > 0 && (parseFloat(yuzolcumu) || 0) > 0;
  const canAnalyze =
    !!selectedNitelik &&
    !!selectedTapuTipi &&
    (parseFloat(riskYuzolcumu) || 0) > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Değerleme & Risk Analizi',
          headerTitleStyle: {
            ...Typography.headline,
            color: Colors.text.primary,
          },
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerBackTitle: 'Geri',
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={Colors.text.secondary}
          />
          <Text style={styles.disclaimerText}>
            Hesaplamalar tahminidir, kesin değerleme için SPK lisanslı kuruluşa
            başvurun.
          </Text>
        </View>

        {/* Segment Control */}
        <View style={styles.segmentWrapper}>
          <SegmentControl
            segments={['Değerleme', 'Risk Analizi']}
            selected={activeSegment}
            onSelect={setActiveSegment}
          />
        </View>

        {/* ═══ DEĞERLEME ═══ */}
        {activeSegment === 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="trending-up-outline"
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.sectionTitle}>Taşınmaz Değerlemesi</Text>
            </View>

            {/* Şehir */}
            <Text style={styles.inputLabel}>Şehir</Text>
            <View style={styles.pickerWrapper}>
              <DropdownPicker
                label="Şehir"
                value={valCity}
                options={cityOptions}
                onSelect={handleValCityChange}
                placeholder="Şehir seçin"
              />
            </View>

            {/* İlçe */}
            <Text style={styles.inputLabel}>İlçe</Text>
            <View style={styles.pickerWrapper}>
              <DropdownPicker
                label="İlçe"
                value={valDistrict}
                options={valDistrictOptions}
                onSelect={handleValDistrictChange}
                placeholder={valCity ? 'İlçe seçin' : 'Önce şehir seçin'}
              />
            </View>

            {/* Mahalle */}
            {valDistrict && valNeighborhoodOptions.length > 0 && (
              <>
                <Text style={styles.inputLabel}>Mahalle</Text>
                <View style={styles.pickerWrapper}>
                  <DropdownPicker
                    label="Mahalle"
                    value={valNeighborhood}
                    options={valNeighborhoodOptions}
                    onSelect={handleValNeighborhoodChange}
                    placeholder="Mahalle seçin (opsiyonel)"
                  />
                </View>
              </>
            )}

            {/* Price info chip */}
            {priceLevel && parseNumber(m2Fiyat) > 0 && (
              <View style={styles.infoChip}>
                <Ionicons
                  name="analytics-outline"
                  size={14}
                  color={Colors.primary}
                />
                <Text style={styles.infoChipText}>
                  {priceLevel === 'mahalle' ? 'Mahalle ortalaması' : 'İlçe ortalaması'}:{' '}
                  {formatPrice(parseNumber(m2Fiyat))}/m²
                </Text>
              </View>
            )}

            {/* m² Fiyat */}
            <Text style={styles.inputLabel}>m² Birim Fiyatı (TL)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>₺</Text>
              <TextInput
                style={styles.input}
                value={m2Fiyat}
                onChangeText={(t) => {
                  setM2Fiyat(formatPriceInput(t));
                  setValuationResult(null);
                }}
                keyboardType="number-pad"
                placeholder="65.000"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>

            {/* Yüzölçümü */}
            <Text style={styles.inputLabel}>Yüzölçümü (m²)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { paddingLeft: Spacing.md }]}
                value={yuzolcumu}
                onChangeText={(t) => {
                  setYuzolcumu(t.replace(/[^0-9.,]/g, ''));
                  setValuationResult(null);
                }}
                keyboardType="decimal-pad"
                placeholder="120"
                placeholderTextColor={Colors.text.tertiary}
              />
              <Text style={styles.inputSuffix}>m²</Text>
            </View>

            {/* Konum Kalitesi */}
            <Text style={styles.inputLabel}>Konum Kalitesi (Şerefiye)</Text>
            <View style={styles.pickerWrapper}>
              <DropdownPicker
                label="Konum Kalitesi"
                value={konumKalitesi}
                options={KONUM_KALITESI_OPTIONS.map((o) => ({
                  key: o.key,
                  label: `${o.label} (${o.carpan > 1 ? '+' : ''}${Math.round((o.carpan - 1) * 100)}%)`,
                }))}
                onSelect={(v) => {
                  setKonumKalitesi(v);
                  setValuationResult(null);
                }}
                placeholder="Konum kalitesi seçin"
              />
            </View>

            {/* Hesapla */}
            <Pressable
              style={({ pressed }) => [
                styles.calculateButton,
                !canCalculate && styles.calculateButtonDisabled,
                pressed && canCalculate && { opacity: 0.9 },
              ]}
              onPress={handleDegerlemeHesapla}
              disabled={!canCalculate}
            >
              <Text style={styles.calculateButtonText}>Hesapla</Text>
            </Pressable>

            {/* Sonuç */}
            {valuationResult && (
              <View style={styles.resultCard}>
                <ResultRow
                  label="Baz Değer"
                  sublabel="m² × yüzölçümü × konum çarpanı"
                  value={formatPrice(valuationResult.basePrice)}
                  bold
                />
                <View style={styles.resultDividerThick} />
                <ResultRow
                  label="Hızlı Satış"
                  sublabel="~3-4 hafta içinde (%85)"
                  value={formatPrice(valuationResult.hizliSatis)}
                  accent
                />
                <View style={styles.resultDivider} />
                <ResultRow
                  label="3 Aylık Satış"
                  sublabel="Piyasa ortalaması (%95)"
                  value={formatPrice(valuationResult.ucAylik)}
                />
                <View style={styles.resultDivider} />
                <ResultRow
                  label="6+ Aylık Satış"
                  sublabel="Sabırlı satıcı (%100–105)"
                  value={`${formatPrice(valuationResult.altiAylikMin)} – ${formatPrice(valuationResult.altiAylikMax)}`}
                />
                <View style={styles.resultDividerThick} />

                <Pressable
                  style={({ pressed }) => [
                    styles.shareButton,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={handleShare}
                >
                  <Ionicons name="share-outline" size={18} color={Colors.primary} />
                  <Text style={styles.shareButtonText}>Raporu Paylaş</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* ═══ RİSK ANALİZİ ═══ */}
        {activeSegment === 1 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.sectionTitle}>Hukuki Risk Analizi</Text>
            </View>

            {/* Konum Seçimi */}
            <Text style={styles.inputLabel}>Şehir</Text>
            <View style={styles.pickerWrapper}>
              <DropdownPicker
                label="Şehir"
                value={riskCity}
                options={cityOptions}
                onSelect={handleRiskCityChange}
                placeholder="Şehir seçin"
              />
            </View>

            <Text style={styles.inputLabel}>İlçe</Text>
            <View style={styles.pickerWrapper}>
              <DropdownPicker
                label="İlçe"
                value={riskDistrict}
                options={riskDistrictOptions}
                onSelect={handleRiskDistrictChange}
                placeholder={riskCity ? 'İlçe seçin' : 'Önce şehir seçin'}
              />
            </View>

            {/* Mahalle (TKGM) */}
            {riskDistrict && (
              <>
                <Text style={styles.inputLabel}>
                  Mahalle{tkgmLoadingMahalle ? ' (yükleniyor...)' : ''}
                </Text>
                <View style={styles.pickerWrapper}>
                  <DropdownPicker
                    label="Mahalle"
                    value={tkgmNeighborhoodId ? String(tkgmNeighborhoodId) : null}
                    options={riskNeighborhoodOptions}
                    onSelect={handleRiskNeighborhoodChange}
                    placeholder={
                      tkgmLoadingMahalle
                        ? 'Mahalleler yükleniyor...'
                        : riskNeighborhoodOptions.length === 0
                          ? 'TKGM verisi alınamadı'
                          : 'Mahalle seçin (TKGM sorgusu için)'
                    }
                  />
                </View>
              </>
            )}

            {/* Deprem Bölgesi Bilgisi */}
            {riskEarthquakeInfo && (
              <View style={[
                styles.earthquakeChip,
                riskEarthquakeInfo.zone <= 2 && styles.earthquakeChipHigh,
              ]}>
                <Ionicons
                  name="warning-outline"
                  size={16}
                  color={riskEarthquakeInfo.zone <= 2 ? Colors.warning : Colors.text.secondary}
                />
                <Text style={[
                  styles.earthquakeChipText,
                  riskEarthquakeInfo.zone <= 2 && { color: Colors.warning, fontWeight: '600' },
                ]}>
                  {riskEarthquakeInfo.label}
                </Text>
              </View>
            )}

            {/* Ada / Parsel */}
            <Text style={styles.inputLabel}>Ada / Parsel (Opsiyonel — TKGM Sorgusu)</Text>
            <View style={styles.adaParselRow}>
              <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }]}>
                <TextInput
                  style={[styles.input, { paddingLeft: Spacing.md }]}
                  value={adaNo}
                  onChangeText={(t) => {
                    setAdaNo(t.replace(/[^0-9]/g, ''));
                    setTkgmResult(null);
                  }}
                  keyboardType="number-pad"
                  placeholder="Ada No"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }]}>
                <TextInput
                  style={[styles.input, { paddingLeft: Spacing.md }]}
                  value={parselNo}
                  onChangeText={(t) => {
                    setParselNo(t.replace(/[^0-9]/g, ''));
                    setTkgmResult(null);
                  }}
                  keyboardType="number-pad"
                  placeholder="Parsel No"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
            </View>

            {/* TKGM Sorgula */}
            {adaNo.trim() && parselNo.trim() && tkgmNeighborhoodId && (
              <Pressable
                style={({ pressed }) => [
                  styles.tkgmButton,
                  pressed && { opacity: 0.85 },
                  tkgmLoading && { opacity: 0.6 },
                ]}
                onPress={handleTkgmQuery}
                disabled={tkgmLoading}
              >
                {tkgmLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Ionicons name="search-outline" size={18} color={Colors.primary} />
                )}
                <Text style={styles.tkgmButtonText}>TKGM Sorgula</Text>
              </Pressable>
            )}

            {/* TKGM Sonuç */}
            {tkgmResult === 'success' && (
              <View style={styles.tkgmSuccessChip}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.tkgmSuccessText}>TKGM'den doğrulandı — nitelik ve alan otomatik dolduruldu</Text>
              </View>
            )}
            {tkgmResult === 'error' && (
              <View style={styles.tkgmErrorChip}>
                <Ionicons name="close-circle" size={16} color={Colors.error} />
                <Text style={styles.tkgmErrorText}>Parsel bulunamadı — manuel girin</Text>
              </View>
            )}

            {/* Nitelik */}
            <Text style={styles.inputLabel}>Arazi Niteliği</Text>
            <View style={styles.pickerWrapper}>
              <DropdownPicker
                label="Nitelik"
                value={selectedNitelik}
                options={NITELIK_OPTIONS}
                onSelect={(v) => {
                  setSelectedNitelik(v);
                  setRiskResult(null);
                }}
                placeholder="Nitelik seçin"
              />
            </View>

            {/* Yüzölçümü */}
            <Text style={styles.inputLabel}>Yüzölçümü (m²)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { paddingLeft: Spacing.md }]}
                value={riskYuzolcumu}
                onChangeText={(t) => {
                  setRiskYuzolcumu(t.replace(/[^0-9.,]/g, ''));
                  setRiskResult(null);
                }}
                keyboardType="decimal-pad"
                placeholder="5000"
                placeholderTextColor={Colors.text.tertiary}
              />
              <Text style={styles.inputSuffix}>m²</Text>
            </View>

            {/* Tapu Tipi */}
            <Text style={styles.inputLabel}>Tapu Tipi</Text>
            <View style={styles.pickerWrapper}>
              <DropdownPicker
                label="Tapu Tipi"
                value={selectedTapuTipi}
                options={TAPU_TIPI_OPTIONS}
                onSelect={(v) => {
                  setSelectedTapuTipi(v);
                  setRiskResult(null);
                }}
                placeholder="Tapu tipi seçin"
              />
            </View>

            {/* Analiz Et */}
            <Pressable
              style={({ pressed }) => [
                styles.calculateButton,
                !canAnalyze && styles.calculateButtonDisabled,
                pressed && canAnalyze && { opacity: 0.9 },
              ]}
              onPress={handleRiskAnaliz}
              disabled={!canAnalyze}
            >
              <Text style={styles.calculateButtonText}>Analiz Et</Text>
            </Pressable>

            {/* Risk Sonuçları */}
            {riskResult && (
              <View style={styles.riskResultContainer}>
                {/* Genel Risk Badge */}
                {(() => {
                  const cfg = RISK_LEVEL_CONFIG[riskResult.overallLevel];
                  return (
                    <View
                      style={[
                        styles.riskBadge,
                        { backgroundColor: cfg.color + '14', borderColor: cfg.color },
                      ]}
                    >
                      <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
                      <Text style={[styles.riskBadgeText, { color: cfg.color }]}>
                        Genel: {cfg.label}
                      </Text>
                    </View>
                  );
                })()}

                {/* Deprem Bilgisi */}
                {riskResult.earthquakeLabel && (
                  <View style={styles.earthquakeResultChip}>
                    <Ionicons name="earth-outline" size={16} color={Colors.text.secondary} />
                    <Text style={styles.earthquakeResultText}>
                      {riskResult.earthquakeLabel}
                    </Text>
                  </View>
                )}

                {/* Bulgular */}
                <Text style={styles.findingsTitle}>
                  {riskResult.findings.length} Bulgu
                </Text>
                {riskResult.findings.map((f, i) => (
                  <FindingCard key={i} finding={f} />
                ))}

                {/* Paylaş */}
                <Pressable
                  style={({ pressed }) => [
                    styles.shareButton,
                    pressed && { opacity: 0.85 },
                    { marginTop: Spacing.md },
                  ]}
                  onPress={handleShare}
                >
                  <Ionicons name="share-outline" size={18} color={Colors.primary} />
                  <Text style={styles.shareButtonText}>Raporu Paylaş</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Stiller ─────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '0A',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  disclaimerText: {
    ...Typography.caption1,
    color: Colors.text.secondary,
    flex: 1,
  },
  segmentWrapper: {
    marginBottom: Spacing.xl,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.title3,
    color: Colors.text.primary,
  },
  inputLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  pickerWrapper: {
    marginBottom: Spacing.lg,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '0A',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  infoChipText: {
    ...Typography.caption1,
    color: Colors.primary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  inputPrefix: {
    ...Typography.body,
    color: Colors.text.tertiary,
    paddingLeft: Spacing.md,
    fontWeight: '600',
  },
  inputSuffix: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    paddingRight: Spacing.md,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  calculateButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  calculateButtonDisabled: {
    backgroundColor: Colors.text.tertiary,
  },
  calculateButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
  resultCard: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  resultLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
  },
  resultLabelBold: {
    ...Typography.subhead,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  resultSublabel: {
    ...Typography.caption2,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  resultValue: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  resultValueBold: {
    ...Typography.headline,
    fontWeight: '700',
  },
  resultDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  resultDividerThick: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '28',
    backgroundColor: Colors.primary + '0A',
  },
  shareButtonText: {
    ...Typography.subhead,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Risk Analizi ek stiller
  adaParselRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tkgmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '28',
    backgroundColor: Colors.primary + '0A',
    marginBottom: Spacing.lg,
  },
  tkgmButtonText: {
    ...Typography.subhead,
    color: Colors.primary,
    fontWeight: '600',
  },
  tkgmSuccessChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success + '0A',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tkgmSuccessText: {
    ...Typography.caption1,
    color: Colors.success,
    fontWeight: '500',
    flex: 1,
  },
  tkgmErrorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.error + '0A',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tkgmErrorText: {
    ...Typography.caption1,
    color: Colors.error,
    fontWeight: '500',
    flex: 1,
  },
  earthquakeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  earthquakeChipHigh: {
    backgroundColor: Colors.warning + '0A',
    borderColor: Colors.warning + '28',
  },
  earthquakeChipText: {
    ...Typography.caption1,
    color: Colors.text.secondary,
    flex: 1,
  },
  // Risk sonuçları
  riskResultContainer: {
    marginTop: Spacing.xl,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  riskBadgeText: {
    ...Typography.headline,
    fontWeight: '700',
  },
  earthquakeResultChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  earthquakeResultText: {
    ...Typography.caption1,
    color: Colors.text.secondary,
  },
  findingsTitle: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  findingCard: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
  },
  findingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  findingLevel: {
    ...Typography.footnote,
    fontWeight: '700',
  },
  findingRule: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  findingMessage: {
    ...Typography.footnote,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  findingActionBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  findingActionLabel: {
    ...Typography.caption2,
    color: Colors.text.tertiary,
    fontWeight: '600',
    marginBottom: 2,
  },
  findingActionText: {
    ...Typography.caption1,
    color: Colors.text.secondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
