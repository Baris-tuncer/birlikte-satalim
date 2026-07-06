import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { formatPriceInput, formatPrice } from '@/lib/format';
import { useCalculatorConfig } from '@/lib/hooks';
import {
  hesaplaTapuHarci,
  hesaplaKredi,
  hesaplaAmortisman,
  type TapuHarciResult,
  type KrediResult,
  type AmortizationRow,
} from '@/lib/calculator';

const VADE_PRESETS = [12, 24, 36, 60, 120];

function parsePrice(text: string): number {
  return Number(text.replace(/\./g, '')) || 0;
}

export default function CalculatorScreen() {
  const router = useRouter();
  const { price } = useLocalSearchParams<{ price?: string }>();
  const { tapuConfig, krediConfig } = useCalculatorConfig();

  // — Tapu Harcı state
  const [tapuFiyat, setTapuFiyat] = useState(
    price ? formatPriceInput(price) : '',
  );
  const [tapuResult, setTapuResult] = useState<TapuHarciResult | null>(null);

  // — Kredi state
  const [krediFiyat, setKrediFiyat] = useState(
    price ? formatPriceInput(price) : '',
  );
  const [pesinOdeme, setPesinOdeme] = useState('');
  const [selectedVade, setSelectedVade] = useState<number | null>(null);
  const [customVade, setCustomVade] = useState('');
  const [faizOrani, setFaizOrani] = useState(
    (krediConfig.varsayilan_aylik_oran * 100).toFixed(2),
  );
  const [krediResult, setKrediResult] = useState<KrediResult | null>(null);
  const [amortismanVisible, setAmortismanVisible] = useState(false);
  const [amortismanData, setAmortismanData] = useState<AmortizationRow[]>([]);

  const vade = selectedVade ?? (customVade ? Number(customVade) : 0);

  const pesinYuzde = useMemo(() => {
    const fiyat = parsePrice(krediFiyat);
    const pesin = parsePrice(pesinOdeme);
    if (fiyat <= 0 || pesin <= 0) return '';
    return `%${Math.round((pesin / fiyat) * 100)}`;
  }, [krediFiyat, pesinOdeme]);

  // — Handlers
  const handleTapuHesapla = () => {
    const fiyat = parsePrice(tapuFiyat);
    if (fiyat <= 0) return;
    setTapuResult(hesaplaTapuHarci(fiyat, tapuConfig));
  };

  const handleKrediHesapla = () => {
    const fiyat = parsePrice(krediFiyat);
    const pesin = parsePrice(pesinOdeme);
    const oran = Number(faizOrani.replace(',', '.')) / 100;
    if (fiyat <= 0 || vade <= 0 || oran < 0) return;

    const result = hesaplaKredi(fiyat, pesin, vade, oran);
    setKrediResult(result);
    setAmortismanData(hesaplaAmortisman(result.kredi_tutari, vade, oran));
    setAmortismanVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Tapu & Kredi Hesaplama',
          headerTitleStyle: { ...Typography.headline, color: Colors.text.primary },
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="chevron-back" size={28} color={Colors.text.primary} />
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
          <Ionicons name="information-circle-outline" size={18} color={Colors.text.secondary} />
          <Text style={styles.disclaimerText}>
            Hesaplamalar tahminidir, kesin tutarlar için ilgili kuruma başvurun.
          </Text>
        </View>

        {/* ═══ TAPU HARCI ═══ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Tapu Harcı Hesaplama</Text>
          </View>

          <Text style={styles.inputLabel}>Satış Fiyatı (TL)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>₺</Text>
            <TextInput
              style={styles.input}
              value={tapuFiyat}
              onChangeText={(t) => setTapuFiyat(formatPriceInput(t))}
              keyboardType="number-pad"
              placeholder="5.000.000"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.calculateButton,
              !parsePrice(tapuFiyat) && styles.calculateButtonDisabled,
              pressed && parsePrice(tapuFiyat) > 0 && { opacity: 0.9 },
            ]}
            onPress={handleTapuHesapla}
            disabled={!parsePrice(tapuFiyat)}
          >
            <Text style={styles.calculateButtonText}>Hesapla</Text>
          </Pressable>

          {tapuResult && (
            <View style={styles.resultCard}>
              <ResultRow
                label="Alıcı Tapu Harcı"
                sublabel={`Oran: %${(tapuConfig.alici_oran * 100).toFixed(0)}`}
                value={formatPrice(tapuResult.alici_harci)}
              />
              <View style={styles.resultDivider} />
              <ResultRow
                label="Satıcı Tapu Harcı"
                sublabel={`Oran: %${(tapuConfig.satici_oran * 100).toFixed(0)}`}
                value={formatPrice(tapuResult.satici_harci)}
              />
              <View style={styles.resultDivider} />
              <ResultRow
                label="Döner Sermaye Bedeli"
                value={formatPrice(tapuResult.doner_sermaye)}
              />
              <View style={styles.resultDividerThick} />
              <ResultRow
                label="Alıcı Toplam Maliyeti"
                value={formatPrice(tapuResult.toplam_alici)}
                bold
              />
              <View style={styles.resultDivider} />
              <ResultRow
                label="Satıcı Toplam Maliyeti"
                value={formatPrice(tapuResult.toplam_satici)}
                bold
              />
              <View style={styles.resultDividerThick} />
              <ResultRow
                label="TOPLAM MALİYET"
                value={formatPrice(tapuResult.toplam_maliyet)}
                bold
                accent
              />
            </View>
          )}
        </View>

        {/* ═══ KREDİ HESAPLAMA ═══ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up-outline" size={22} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Konut Kredisi Hesaplama</Text>
          </View>

          <Text style={styles.inputLabel}>Emlak Fiyatı (TL)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>₺</Text>
            <TextInput
              style={styles.input}
              value={krediFiyat}
              onChangeText={(t) => setKrediFiyat(formatPriceInput(t))}
              keyboardType="number-pad"
              placeholder="5.000.000"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <Text style={styles.inputLabel}>
            Peşinat (TL){pesinYuzde ? ` — ${pesinYuzde}` : ''}
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>₺</Text>
            <TextInput
              style={styles.input}
              value={pesinOdeme}
              onChangeText={(t) => setPesinOdeme(formatPriceInput(t))}
              keyboardType="number-pad"
              placeholder="1.000.000"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <Text style={styles.inputLabel}>Vade (Ay)</Text>
          <View style={styles.vadeRow}>
            {VADE_PRESETS.map((v) => (
              <Pressable
                key={v}
                style={[
                  styles.vadePill,
                  selectedVade === v && styles.vadePillActive,
                ]}
                onPress={() => {
                  setSelectedVade(v);
                  setCustomVade('');
                }}
              >
                <Text
                  style={[
                    styles.vadePillText,
                    selectedVade === v && styles.vadePillTextActive,
                  ]}
                >
                  {v}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.vadeInput}
            value={customVade}
            onChangeText={(t) => {
              setCustomVade(t.replace(/[^0-9]/g, ''));
              setSelectedVade(null);
            }}
            keyboardType="number-pad"
            placeholder="veya özel vade girin"
            placeholderTextColor={Colors.text.tertiary}
          />

          <Text style={styles.inputLabel}>Aylık Faiz Oranı (%)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>%</Text>
            <TextInput
              style={styles.input}
              value={faizOrani}
              onChangeText={setFaizOrani}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'number-pad'}
              placeholder="2.79"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.calculateButton,
              (!parsePrice(krediFiyat) || vade <= 0) && styles.calculateButtonDisabled,
              pressed && parsePrice(krediFiyat) > 0 && vade > 0 && { opacity: 0.9 },
            ]}
            onPress={handleKrediHesapla}
            disabled={!parsePrice(krediFiyat) || vade <= 0}
          >
            <Text style={styles.calculateButtonText}>Hesapla</Text>
          </Pressable>

          {krediResult && (
            <>
              <View style={styles.resultCard}>
                <ResultRow label="Kredi Tutarı" value={formatPrice(krediResult.kredi_tutari)} />
                <View style={styles.resultDivider} />
                <ResultRow
                  label="Aylık Taksit"
                  value={formatPrice(krediResult.aylik_taksit)}
                  bold
                  accent
                />
                <View style={styles.resultDivider} />
                <ResultRow label="Toplam Geri Ödeme" value={formatPrice(krediResult.toplam_odeme)} />
                <View style={styles.resultDivider} />
                <ResultRow label="Toplam Faiz" value={formatPrice(krediResult.toplam_faiz)} />
              </View>

              {amortismanData.length > 0 && (
                <Pressable
                  style={styles.amortismanToggle}
                  onPress={() => setAmortismanVisible((v) => !v)}
                >
                  <Text style={styles.amortismanToggleText}>
                    {amortismanVisible ? 'Ödeme Planını Gizle' : 'Ödeme Planını Gör'}
                  </Text>
                  <Ionicons
                    name={amortismanVisible ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.accent}
                  />
                </Pressable>
              )}

              {amortismanVisible && amortismanData.length > 0 && (
                <View style={styles.amortismanTable}>
                  {/* Header */}
                  <View style={styles.amortismanHeaderRow}>
                    <Text style={[styles.amortismanHeaderCell, styles.amortismanCellAy]}>Ay</Text>
                    <Text style={[styles.amortismanHeaderCell, styles.amortismanCellNum]}>Taksit</Text>
                    <Text style={[styles.amortismanHeaderCell, styles.amortismanCellNum]}>Anapara</Text>
                    <Text style={[styles.amortismanHeaderCell, styles.amortismanCellNum]}>Faiz</Text>
                    <Text style={[styles.amortismanHeaderCell, styles.amortismanCellNum]}>Kalan</Text>
                  </View>
                  {/* Rows */}
                  {amortismanData.map((row) => (
                    <View
                      key={row.ay}
                      style={[
                        styles.amortismanRow,
                        row.ay % 2 === 0 && styles.amortismanRowEven,
                      ]}
                    >
                      <Text style={[styles.amortismanCell, styles.amortismanCellAy]}>{row.ay}</Text>
                      <Text style={[styles.amortismanCell, styles.amortismanCellNum]}>
                        {row.taksit.toLocaleString('tr-TR')}
                      </Text>
                      <Text style={[styles.amortismanCell, styles.amortismanCellNum]}>
                        {row.anapara.toLocaleString('tr-TR')}
                      </Text>
                      <Text style={[styles.amortismanCell, styles.amortismanCellNum]}>
                        {row.faiz.toLocaleString('tr-TR')}
                      </Text>
                      <Text style={[styles.amortismanCell, styles.amortismanCellNum]}>
                        {row.kalan_borc.toLocaleString('tr-TR')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Alt bileşen ──────────────────────────────────────

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
        <Text
          style={[
            styles.resultLabel,
            bold && styles.resultLabelBold,
            accent && { color: Colors.accent },
          ]}
        >
          {label}
        </Text>
        {sublabel && <Text style={styles.resultSublabel}>{sublabel}</Text>}
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

// ─── Stiller ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '08',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  disclaimerText: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 18,
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
  vadeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  vadePill: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  vadePillActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '14',
  },
  vadePillText: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  vadePillTextActive: {
    color: Colors.accent,
  },
  vadeInput: {
    ...Typography.body,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  amortismanToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  amortismanToggleText: {
    ...Typography.subhead,
    color: Colors.accent,
    fontWeight: '600',
  },
  amortismanTable: {
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amortismanHeaderRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  amortismanHeaderCell: {
    ...Typography.caption2,
    color: Colors.text.inverse,
    fontWeight: '700',
    textAlign: 'center',
  },
  amortismanRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.card,
  },
  amortismanRowEven: {
    backgroundColor: Colors.background,
  },
  amortismanCell: {
    ...Typography.caption2,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  amortismanCellAy: {
    width: 30,
    textAlign: 'center',
  },
  amortismanCellNum: {
    flex: 1,
  },
});
