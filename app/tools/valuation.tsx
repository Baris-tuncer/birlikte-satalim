import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Share,
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
  getDistrictPrice,
  hesaplaDegerleme,
  analizEtHukukiRisk,
  NITELIK_OPTIONS,
  TAPU_TIPI_OPTIONS,
  RISK_LEVEL_CONFIG,
  type ValuationResult,
  type LegalRiskResult,
  type Nitelik,
  type TapuTipi,
} from '@/lib/valuation';

function parseNumber(text: string): number {
  return Number(text.replace(/\./g, '')) || 0;
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

// ─── Main Screen ─────────────────────────────────────

export default function ValuationScreen() {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState(0);

  // — Değerleme state
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [m2Fiyat, setM2Fiyat] = useState('');
  const [yuzolcumu, setYuzolcumu] = useState('');
  const [valuationResult, setValuationResult] =
    useState<ValuationResult | null>(null);

  // — Risk state
  const [selectedNitelik, setSelectedNitelik] = useState<string | null>(null);
  const [riskYuzolcumu, setRiskYuzolcumu] = useState('');
  const [selectedTapuTipi, setSelectedTapuTipi] = useState<string | null>(null);
  const [riskResult, setRiskResult] = useState<LegalRiskResult | null>(null);

  // — Derived
  const cityOptions = useMemo(
    () => CITIES.map((c) => ({ key: c, label: c })),
    [],
  );

  const districtOptions = useMemo(() => {
    if (!selectedCity) return [];
    return (CITY_DISTRICTS[selectedCity] ?? []).map((d) => ({
      key: d,
      label: d,
    }));
  }, [selectedCity]);

  const suggestedPrice = useMemo(() => {
    if (!selectedCity || !selectedDistrict) return null;
    return getDistrictPrice(selectedCity, selectedDistrict);
  }, [selectedCity, selectedDistrict]);

  // — Handlers
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict(null);
    setM2Fiyat('');
    setValuationResult(null);
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setValuationResult(null);
    const price = selectedCity
      ? getDistrictPrice(selectedCity, district)
      : null;
    if (price) {
      setM2Fiyat(formatPriceInput(String(price)));
    } else {
      setM2Fiyat('');
    }
  };

  const handleDegerlemeHesapla = () => {
    const fiyat = parseNumber(m2Fiyat);
    const alan = parseFloat(yuzolcumu) || 0;
    if (fiyat <= 0 || alan <= 0) return;
    setValuationResult(hesaplaDegerleme(fiyat, alan));
  };

  const handleRiskAnaliz = () => {
    if (!selectedNitelik || !selectedTapuTipi) return;
    const alan = parseFloat(riskYuzolcumu) || 0;
    if (alan <= 0) return;
    setRiskResult(
      analizEtHukukiRisk(
        selectedNitelik as Nitelik,
        alan,
        selectedTapuTipi as TapuTipi,
      ),
    );
  };

  const handleShare = async () => {
    const lines: string[] = [];
    lines.push('BERABER SATALIM — DEĞERLEMELİK RAPOR');
    lines.push('═══════════════════════════════════');
    lines.push(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`);

    if (valuationResult && selectedCity && selectedDistrict) {
      lines.push('');
      lines.push('── FİYAT DEĞERLEMESİ ──────────────');
      lines.push(`Konum: ${selectedCity} / ${selectedDistrict}`);
      lines.push(`m² Fiyatı: ${formatPrice(parseNumber(m2Fiyat))}`);
      lines.push(`Yüzölçümü: ${yuzolcumu} m²`);
      lines.push('');
      lines.push(`Baz Değer: ${formatPrice(valuationResult.basePrice)}`);
      lines.push(
        `Hızlı Satış (~3-4 hafta): ${formatPrice(valuationResult.hizliSatis)}`,
      );
      lines.push(
        `3 Aylık Satış: ${formatPrice(valuationResult.ucAylik)}`,
      );
      lines.push(
        `6+ Aylık Satış: ${formatPrice(valuationResult.altiAylikMin)} – ${formatPrice(valuationResult.altiAylikMax)}`,
      );
    }

    if (riskResult) {
      const cfg = RISK_LEVEL_CONFIG[riskResult.level];
      lines.push('');
      lines.push('── HUKUKİ RİSK ANALİZİ ────────────');
      lines.push(`Risk Düzeyi: ${cfg.label}`);
      lines.push(`Dayanak: ${riskResult.rule}`);
      lines.push(`Açıklama: ${riskResult.message}`);
      lines.push(`Yapılması Gereken: ${riskResult.actionRequired}`);
    }

    lines.push('');
    lines.push('─────────────────────────────────────');
    lines.push(
      'Bu rapor tahmini bilgi amaçlıdır. Kesin hukuki değerlendirme için uzman görüşü alın.',
    );

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
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons
                name="chevron-back"
                size={28}
                color={Colors.text.primary}
              />
            </Pressable>
          ),
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
                value={selectedCity}
                options={cityOptions}
                onSelect={handleCityChange}
                placeholder="Şehir seçin"
              />
            </View>

            {/* İlçe */}
            <Text style={styles.inputLabel}>İlçe</Text>
            <View style={styles.pickerWrapper}>
              <DropdownPicker
                label="İlçe"
                value={selectedDistrict}
                options={districtOptions}
                onSelect={handleDistrictChange}
                placeholder={
                  selectedCity ? 'İlçe seçin' : 'Önce şehir seçin'
                }
              />
            </View>

            {/* Suggested price info */}
            {suggestedPrice && (
              <View style={styles.infoChip}>
                <Ionicons
                  name="analytics-outline"
                  size={14}
                  color={Colors.primary}
                />
                <Text style={styles.infoChipText}>
                  İlçe ortalaması: {formatPrice(suggestedPrice)}/m²
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
                  sublabel="m² × yüzölçümü"
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

                {/* Paylaş */}
                <Pressable
                  style={({ pressed }) => [
                    styles.shareButton,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={handleShare}
                >
                  <Ionicons
                    name="share-outline"
                    size={18}
                    color={Colors.primary}
                  />
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

            {/* Sonuç */}
            {riskResult && (() => {
              const cfg = RISK_LEVEL_CONFIG[riskResult.level];
              return (
                <View style={styles.resultCard}>
                  {/* Risk Badge */}
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: cfg.color + '14', borderColor: cfg.color },
                    ]}
                  >
                    <Ionicons
                      name={cfg.icon as any}
                      size={22}
                      color={cfg.color}
                    />
                    <Text style={[styles.riskBadgeText, { color: cfg.color }]}>
                      {cfg.label}
                    </Text>
                  </View>

                  <View style={styles.resultDivider} />

                  <ResultRow label="Hukuki Dayanak" value={riskResult.rule} />

                  <View style={styles.resultDivider} />

                  <Text style={styles.riskMessageLabel}>Açıklama</Text>
                  <Text style={styles.riskMessageText}>
                    {riskResult.message}
                  </Text>

                  <View style={styles.resultDivider} />

                  <Text style={styles.riskMessageLabel}>Yapılması Gereken</Text>
                  <Text style={styles.riskActionText}>
                    {riskResult.actionRequired}
                  </Text>

                  <View style={styles.resultDividerThick} />

                  {/* Paylaş */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.shareButton,
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={handleShare}
                  >
                    <Ionicons
                      name="share-outline"
                      size={18}
                      color={Colors.primary}
                    />
                    <Text style={styles.shareButtonText}>Raporu Paylaş</Text>
                  </Pressable>
                </View>
              );
            })()}
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
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  riskBadgeText: {
    ...Typography.headline,
    fontWeight: '700',
  },
  riskMessageLabel: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  riskMessageText: {
    ...Typography.footnote,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  riskActionText: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
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
});
