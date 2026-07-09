import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import {
  CITIES,
  CITY_DISTRICTS,
  TRANSACTION_TYPES,
  PROPERTY_TYPES,
  ROOM_OPTIONS,
  BUILDING_AGE_OPTIONS,
  getNeighborhoodsForDistrict,
} from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { formatPriceInput, checkContent } from '@/lib/format';
import { useCreateDemand, useUpdateDemand } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import DropdownPicker from '@/components/ui/DropdownPicker';
import type { TransactionType, PropertyType, BuyerDemand } from '@/types';

const CITY_OPTIONS = CITIES.map((c) => ({ key: c, label: c }));
const ROOM_PICKER_OPTIONS = ROOM_OPTIONS.map((r) => ({ key: r, label: r }));

export default function CreateDemandScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEdit = !!editId;
  const { create, loading: createLoading } = useCreateDemand();
  const { update, loading: updateLoading } = useUpdateDemand();
  const loading = createLoading || updateLoading;
  const scrollRef = useRef<ScrollView>(null);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [minBudgetText, setMinBudgetText] = useState('');
  const [maxBudgetText, setMaxBudgetText] = useState('');
  const [minRooms, setMinRooms] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxFloor, setMaxFloor] = useState('');
  const [selectedBuildingAges, setSelectedBuildingAges] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!editId) return;
    supabase
      .from('buyer_demands')
      .select('*')
      .eq('id', editId)
      .single()
      .then(({ data }) => {
        if (data) {
          const d = data as BuyerDemand;
          setTransactionType(d.transaction_type);
          setPropertyType(d.property_type);
          setCity(d.city ?? 'İstanbul');
          setDistrict(d.district);
          setSelectedNeighborhoods(d.neighborhoods ?? []);
          setMinBudgetText(d.min_budget ? formatPriceInput(d.min_budget.toString()) : '');
          setMaxBudgetText(d.max_budget ? formatPriceInput(d.max_budget.toString()) : '');
          setMinRooms(d.min_rooms ?? '');
          setMinArea(d.min_area?.toString() ?? '');
          setMaxFloor(d.max_floor?.toString() ?? '');
          setSelectedBuildingAges(d.building_ages ?? []);
          setNotes(d.notes ?? '');
        }
        setInitialLoading(false);
      }, () => setInitialLoading(false));
  }, [editId]);

  const isLand = propertyType === 'LAND';

  const districtOptions = useMemo(() => {
    return (CITY_DISTRICTS[city] ?? []).map((d) => ({ key: d, label: d }));
  }, [city]);

  const neighborhoodList = useMemo(() => {
    if (!district) return [];
    return getNeighborhoodsForDistrict(city, district);
  }, [city, district]);

  const toggleNeighborhood = (n: string) => {
    setSelectedNeighborhoods((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  };

  const toggleBuildingAge = (key: string) => {
    setSelectedBuildingAges((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const handleCityChange = (c: string) => {
    setCity(c);
    setDistrict('');
    setSelectedNeighborhoods([]);
  };

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    setSelectedNeighborhoods([]);
  };

  const parsePrice = (text: string) => Number(text.replace(/\./g, '').replace(/,/g, ''));

  const handleSubmit = async () => {
    if (!transactionType) return Alert.alert('Hata', 'İşlem tipi seçin.');
    if (!propertyType) return Alert.alert('Hata', 'Mülk tipi seçin.');
    if (!district) return Alert.alert('Hata', 'İlçe seçin.');
    if (!minBudgetText) return Alert.alert('Hata', 'Min bütçe girin.');
    if (!maxBudgetText) return Alert.alert('Hata', 'Max bütçe girin.');

    const minBudget = parsePrice(minBudgetText);
    const maxBudget = parsePrice(maxBudgetText);

    if (minBudget <= 0 || maxBudget <= 0) return Alert.alert('Hata', 'Geçerli bir bütçe girin.');
    if (minBudget > maxBudget) return Alert.alert('Hata', 'Min bütçe max bütçeden büyük olamaz.');
    if (maxBudget > 50_000_000_000) return Alert.alert('Hata', 'Bütçe 50 milyar TL\'yi geçemez.');

    if (notes.length > 500) return Alert.alert('Hata', 'Notlar en fazla 500 karakter olabilir.');

    const contentError = checkContent(notes);
    if (contentError) return Alert.alert('Hata', contentError);

    if (minArea && (Number(minArea) <= 0 || Number(minArea) > 100_000)) return Alert.alert('Hata', 'Geçerli bir alan girin.');
    if (maxFloor && (Number(maxFloor) <= 0 || Number(maxFloor) > 100)) return Alert.alert('Hata', 'Geçerli bir kat sayısı girin.');
    if (selectedNeighborhoods.length > 20) return Alert.alert('Hata', 'En fazla 20 mahalle seçebilirsiniz.');

    const demandData = {
      transaction_type: transactionType,
      property_type: propertyType,
      city,
      district,
      neighborhoods: selectedNeighborhoods,
      min_budget: minBudget,
      max_budget: maxBudget,
      min_rooms: minRooms || null,
      min_area: minArea ? Number(minArea) : null,
      max_floor: maxFloor ? Number(maxFloor) : null,
      building_ages: selectedBuildingAges.length > 0 ? selectedBuildingAges : null,
      notes: notes || null,
    };

    if (isEdit && editId) {
      const { error } = await update(editId, demandData);
      if (error) {
        Alert.alert('Hata', error);
        return;
      }
      Alert.alert('Başarılı', 'Talep güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } else {
      const { error } = await create(demandData);
      if (error) {
        Alert.alert('Hata', error);
        return;
      }
      Alert.alert('Başarılı', 'Talebiniz yayınlandı.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEdit ? 'Talebi Düzenle' : 'Talep Oluştur',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {initialLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* İşlem Tipi */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#3B82F6' }]}>
                  <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.sectionTitle}>İşlem Tipi</Text>
              </View>
              <DropdownPicker
                label="İşlem Tipi Seçin"
                value={transactionType}
                options={TRANSACTION_TYPES.map((t) => ({ key: t.key, label: t.label }))}
                onSelect={(key) => setTransactionType(key as TransactionType)}
                placeholder="Satılık / Kiralık"
              />
            </View>

            {/* Mülk Tipi */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="home" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.sectionTitle}>Mülk Tipi</Text>
              </View>
              <DropdownPicker
                label="Mülk Tipi Seçin"
                value={propertyType}
                options={PROPERTY_TYPES.map((t) => ({ key: t.key, label: t.label }))}
                onSelect={(key) => setPropertyType(key as PropertyType)}
                placeholder="Konut / Ticari / Arsa"
              />
            </View>

            {/* Konum */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#EF4444' }]}>
                  <Ionicons name="location" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.sectionTitle}>Konum</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.inputLabel}>Şehir</Text>
                <DropdownPicker
                  label="Şehir Seçin"
                  value={city}
                  options={CITY_OPTIONS}
                  onSelect={handleCityChange}
                  placeholder="Şehir seçin..."
                />
                <Text style={styles.inputLabel}>İlçe</Text>
                <DropdownPicker
                  label="İlçe Seçin"
                  value={district || null}
                  options={districtOptions}
                  onSelect={handleDistrictChange}
                  placeholder="İlçe seçin..."
                />

                {district && neighborhoodList.length > 0 && (
                  <>
                    <Text style={styles.inputLabel}>
                      Mahalleler ({selectedNeighborhoods.length} seçili)
                    </Text>
                    <View style={styles.neighborhoodWrap}>
                      {neighborhoodList.map((n) => {
                        const sel = selectedNeighborhoods.includes(n);
                        return (
                          <Pressable
                            key={n}
                            style={[
                              styles.chipSmall,
                              sel && styles.chipSmallSelected,
                            ]}
                            onPress={() => toggleNeighborhood(n)}
                          >
                            <Text
                              style={[
                                styles.chipSmallText,
                                sel && styles.chipSmallTextSelected,
                              ]}
                            >
                              {n}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Bütçe */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#06B6D4' }]}>
                  <Ionicons name="wallet" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.sectionTitle}>Bütçe Aralığı</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Min Bütçe (TL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="10.000.000"
                      placeholderTextColor={Colors.text.tertiary}
                      keyboardType="numeric"
                      value={minBudgetText}
                      onChangeText={(t) => setMinBudgetText(formatPriceInput(t))}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Max Bütçe (TL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="15.000.000"
                      placeholderTextColor={Colors.text.tertiary}
                      keyboardType="numeric"
                      value={maxBudgetText}
                      onChangeText={(t) => setMaxBudgetText(formatPriceInput(t))}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Min Oda Sayısı */}
            {!isLand && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#EC4899' }]}>
                    <Ionicons name="bed" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.sectionTitle}>Min Oda Sayısı</Text>
                </View>
                <DropdownPicker
                  label="Min Oda Sayısı Seçin"
                  value={minRooms || null}
                  options={ROOM_PICKER_OPTIONS}
                  onSelect={setMinRooms}
                  placeholder="Min oda sayısı seçin..."
                />
              </View>
            )}

            {/* Ek Kriterler */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#14B8A6' }]}>
                  <Ionicons name="resize" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.sectionTitle}>Ek Kriterler</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Min Alan (m²)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="100"
                      placeholderTextColor={Colors.text.tertiary}
                      keyboardType="numeric"
                      value={minArea}
                      onChangeText={setMinArea}
                    />
                  </View>
                  {!isLand && (
                    <View style={styles.inputHalf}>
                      <Text style={styles.inputLabel}>Max Kat</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="5"
                        placeholderTextColor={Colors.text.tertiary}
                        keyboardType="numeric"
                        value={maxFloor}
                        onChangeText={setMaxFloor}
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Bina Yaşı (multi-select) */}
            {!isLand && propertyType !== 'URBAN_RENEWAL' && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#F59E0B' }]}>
                    <Ionicons name="calendar" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.sectionTitle}>
                    Bina Yaşı ({selectedBuildingAges.length} seçili)
                  </Text>
                </View>
                <View style={styles.card}>
                  <View style={styles.neighborhoodWrap}>
                    {BUILDING_AGE_OPTIONS.map((opt) => {
                      const sel = selectedBuildingAges.includes(opt.key);
                      return (
                        <Pressable
                          key={opt.key}
                          style={[
                            styles.chipSmall,
                            sel && styles.chipSmallSelected,
                          ]}
                          onPress={() => toggleBuildingAge(opt.key)}
                        >
                          <Text
                            style={[
                              styles.chipSmallText,
                              sel && styles.chipSmallTextSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* Notlar */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="document-text" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.sectionTitle}>Notlar</Text>
              </View>
              <View style={styles.card}>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Müşteri tercihleri, özel istekler..."
                  placeholderTextColor={Colors.text.tertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                  value={notes}
                  onChangeText={setNotes}
                  onFocus={() => {
                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
                  }}
                />
              </View>
            </View>

            {/* Submit */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : (
                <Text style={styles.submitButtonText}>{isEdit ? 'Güncelle' : 'Talebi Yayınla'}</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  section: {
    marginBottom: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    ...Shadows.sm,
  },
  chipSmall: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipSmallSelected: {
    backgroundColor: Colors.primary,
  },
  chipSmallText: {
    ...Typography.caption1,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  chipSmallTextSelected: {
    color: Colors.text.inverse,
  },
  neighborhoodWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  inputLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.text.primary,
  },
  inputMultiline: {
    minHeight: 100,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadows.md,
  },
  submitButtonPressed: {
    backgroundColor: Colors.accentDark,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
});
