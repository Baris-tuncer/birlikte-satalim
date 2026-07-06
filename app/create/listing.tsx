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
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import {
  CITIES,
  CITY_DISTRICTS,
  TRANSACTION_TYPES,
  PROPERTY_TYPES,
  ROOM_OPTIONS,
  HEATING_TYPES,
  BUILDING_AGE_OPTIONS,
  getNeighborhoodsForDistrict,
} from '@/lib/constants';
import { formatPriceInput, checkContent } from '@/lib/format';
import { useCreateListing, useUpdateListing } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import DropdownPicker from '@/components/ui/DropdownPicker';
import type { TransactionType, PropertyType, Listing } from '@/types';

const CITY_OPTIONS = CITIES.map((c) => ({ key: c, label: c }));
const ROOM_PICKER_OPTIONS = ROOM_OPTIONS.map((r) => ({ key: r, label: r }));
const HEATING_PICKER_OPTIONS = HEATING_TYPES.map((h) => ({ key: h, label: h }));

export default function CreateListingScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEdit = !!editId;
  const { create, loading: createLoading } = useCreateListing();
  const { update, loading: updateLoading } = useUpdateListing();
  const loading = createLoading || updateLoading;
  const scrollRef = useRef<ScrollView>(null);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [roomCount, setRoomCount] = useState('');
  const [netArea, setNetArea] = useState('');
  const [grossArea, setGrossArea] = useState('');
  const [floor, setFloor] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [buildingAge, setBuildingAge] = useState('');
  const [hasParking, setHasParking] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [heatingType, setHeatingType] = useState('');
  const [ada, setAda] = useState('');
  const [parsel, setParsel] = useState('');
  const [priceText, setPriceText] = useState('');
  const [description, setDescription] = useState('');
  const [listingUrl, setListingUrl] = useState('');

  // Düzenleme modunda mevcut veriyi yükle
  useEffect(() => {
    if (!editId) return;
    supabase
      .from('listings')
      .select('*')
      .eq('id', editId)
      .single()
      .then(({ data }) => {
        if (data) {
          const l = data as Listing;
          setTransactionType(l.transaction_type);
          setPropertyType(l.property_type);
          setCity(l.city ?? 'İstanbul');
          setDistrict(l.district);
          setNeighborhood(l.neighborhood ?? '');
          setRoomCount(l.room_count ?? '');
          setNetArea(l.net_area?.toString() ?? '');
          setGrossArea(l.gross_area?.toString() ?? '');
          setFloor(l.floor?.toString() ?? '');
          setTotalFloors(l.total_floors?.toString() ?? '');
          setBuildingAge(l.building_age ?? '');
          setHasParking(l.has_parking ?? false);
          setHasElevator(l.has_elevator ?? false);
          setHeatingType(l.heating_type ?? '');
          setAda(l.ada ?? '');
          setParsel(l.parsel ?? '');
          setPriceText(l.price ? formatPriceInput(l.price.toString()) : '');
          setDescription(l.description ?? '');
          setListingUrl(l.listing_url ?? '');
        }
        setInitialLoading(false);
      }, () => setInitialLoading(false));
  }, [editId]);

  const isLand = propertyType === 'LAND';
  const isUrbanRenewal = propertyType === 'URBAN_RENEWAL';

  const districtOptions = useMemo(() => {
    return (CITY_DISTRICTS[city] ?? []).map((d) => ({ key: d, label: d }));
  }, [city]);

  const neighborhoodOptions = useMemo(() => {
    if (!district) return [];
    return getNeighborhoodsForDistrict(city, district).map((n) => ({ key: n, label: n }));
  }, [city, district]);

  const handleCityChange = (c: string) => {
    setCity(c);
    setDistrict('');
    setNeighborhood('');
  };

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    setNeighborhood('');
  };

  const handlePriceChange = (text: string) => {
    setPriceText(formatPriceInput(text));
  };

  const parsePrice = (text: string) => Number(text.replace(/\./g, '').replace(/,/g, ''));

  const handleSubmit = async () => {
    if (!transactionType) return Alert.alert('Hata', 'İşlem tipi seçin.');
    if (!propertyType) return Alert.alert('Hata', 'Mülk tipi seçin.');
    if (!district) return Alert.alert('Hata', 'İlçe seçin.');
    if (!isUrbanRenewal && !priceText) return Alert.alert('Hata', 'Fiyat girin.');

    const price = priceText ? parsePrice(priceText) : 0;
    if (!isUrbanRenewal && price <= 0) return Alert.alert('Hata', 'Geçerli bir fiyat girin.');
    if (price > 50_000_000_000) return Alert.alert('Hata', 'Fiyat 50 milyar TL\'yi geçemez.');

    if (description.length > 500) return Alert.alert('Hata', 'Açıklama en fazla 500 karakter olabilir.');
    if (listingUrl && !/^https?:\/\/.+\..+/.test(listingUrl)) return Alert.alert('Hata', 'Geçerli bir URL girin (https://... ile başlamalı).');

    const contentError = checkContent(description);
    if (contentError) return Alert.alert('Hata', contentError);

    if (netArea && (Number(netArea) <= 0 || Number(netArea) > 100_000)) return Alert.alert('Hata', 'Geçerli bir net alan girin.');
    if (grossArea && (Number(grossArea) <= 0 || Number(grossArea) > 100_000)) return Alert.alert('Hata', 'Geçerli bir brüt alan girin.');
    if (floor && (Number(floor) < -5 || Number(floor) > 100)) return Alert.alert('Hata', 'Geçerli bir kat numarası girin.');
    if (totalFloors && (Number(totalFloors) <= 0 || Number(totalFloors) > 100)) return Alert.alert('Hata', 'Geçerli bir toplam kat sayısı girin.');

    const listingData = {
      transaction_type: transactionType,
      property_type: propertyType,
      city,
      district,
      neighborhood: neighborhood || null,
      room_count: roomCount || null,
      net_area: netArea ? Number(netArea) : null,
      gross_area: grossArea ? Number(grossArea) : null,
      floor: floor ? Number(floor) : null,
      total_floors: totalFloors ? Number(totalFloors) : null,
      building_age: buildingAge || null,
      has_parking: isLand || isUrbanRenewal ? null : hasParking,
      has_elevator: isLand || isUrbanRenewal ? null : hasElevator,
      heating_type: isLand || isUrbanRenewal ? null : heatingType || null,
      ada: isUrbanRenewal ? ada || null : null,
      parsel: isUrbanRenewal ? parsel || null : null,
      price,
      description: description || null,
      listing_url: listingUrl || null,
    };

    if (isEdit && editId) {
      const { error } = await update(editId, listingData);
      if (error) {
        Alert.alert('Hata', error);
        return;
      }
      Alert.alert('Başarılı', 'İlan güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } else {
      const { error } = await create(listingData);
      if (error) {
        Alert.alert('Hata', error);
        return;
      }
      Alert.alert('Başarılı', 'İlanınız yayınlandı.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEdit ? 'İlanı Düzenle' : 'İlan Oluştur',
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
              <Text style={styles.sectionTitle}>İşlem Tipi</Text>
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
              <Text style={styles.sectionTitle}>Mülk Tipi</Text>
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
              <Text style={styles.sectionTitle}>Konum</Text>
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
                {district && neighborhoodOptions.length > 0 && (
                  <>
                    <Text style={styles.inputLabel}>Mahalle</Text>
                    <DropdownPicker
                      label="Mahalle Seçin"
                      value={neighborhood || null}
                      options={neighborhoodOptions}
                      onSelect={setNeighborhood}
                      placeholder="Mahalle seçin..."
                    />
                  </>
                )}
              </View>
            </View>

            {/* Ada / Parsel (Kentsel Dönüşüm) */}
            {isUrbanRenewal && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ada / Parsel</Text>
                <View style={styles.card}>
                  <View style={styles.inputRow}>
                    <View style={styles.inputHalf}>
                      <Text style={styles.inputLabel}>Ada No</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="1234"
                        placeholderTextColor={Colors.text.tertiary}
                        keyboardType="numeric"
                        value={ada}
                        onChangeText={setAda}
                      />
                    </View>
                    <View style={styles.inputHalf}>
                      <Text style={styles.inputLabel}>Parsel No</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="56"
                        placeholderTextColor={Colors.text.tertiary}
                        keyboardType="numeric"
                        value={parsel}
                        onChangeText={setParsel}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Oda Sayısı */}
            {!isLand && !isUrbanRenewal && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Oda Sayısı</Text>
                <DropdownPicker
                  label="Oda Sayısı Seçin"
                  value={roomCount || null}
                  options={ROOM_PICKER_OPTIONS}
                  onSelect={setRoomCount}
                  placeholder="Oda sayısı seçin..."
                />
              </View>
            )}

            {/* Alan ve Kat */}
            {!isUrbanRenewal && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alan ve Kat</Text>
              <View style={styles.card}>
                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Net Alan (m²)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="120"
                      placeholderTextColor={Colors.text.tertiary}
                      keyboardType="numeric"
                      value={netArea}
                      onChangeText={setNetArea}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Brüt Alan (m²)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="145"
                      placeholderTextColor={Colors.text.tertiary}
                      keyboardType="numeric"
                      value={grossArea}
                      onChangeText={setGrossArea}
                    />
                  </View>
                </View>
                {!isLand && (
                  <>
                    <View style={styles.inputRow}>
                      <View style={styles.inputHalf}>
                        <Text style={styles.inputLabel}>Kat</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="4"
                          placeholderTextColor={Colors.text.tertiary}
                          keyboardType="numeric"
                          value={floor}
                          onChangeText={setFloor}
                        />
                      </View>
                      <View style={styles.inputHalf}>
                        <Text style={styles.inputLabel}>Toplam Kat</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="7"
                          placeholderTextColor={Colors.text.tertiary}
                          keyboardType="numeric"
                          value={totalFloors}
                          onChangeText={setTotalFloors}
                        />
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
            )}

            {/* Bina Yaşı */}
            {!isLand && !isUrbanRenewal && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bina Yaşı</Text>
                <DropdownPicker
                  label="Bina Yaşı Seçin"
                  value={buildingAge || null}
                  options={BUILDING_AGE_OPTIONS}
                  onSelect={setBuildingAge}
                  placeholder="Bina yaşı seçin..."
                />
              </View>
            )}

            {/* Özellikler */}
            {!isLand && !isUrbanRenewal && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Özellikler</Text>
                <View style={styles.card}>
                  <Pressable
                    style={styles.toggleRow}
                    onPress={() => setHasParking(!hasParking)}
                  >
                    <Text style={styles.toggleLabel}>Otopark</Text>
                    <Ionicons
                      name={hasParking ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={hasParking ? Colors.accent : Colors.text.tertiary}
                    />
                  </Pressable>
                  <View style={styles.toggleDivider} />
                  <Pressable
                    style={styles.toggleRow}
                    onPress={() => setHasElevator(!hasElevator)}
                  >
                    <Text style={styles.toggleLabel}>Asansör</Text>
                    <Ionicons
                      name={hasElevator ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={hasElevator ? Colors.accent : Colors.text.tertiary}
                    />
                  </Pressable>
                </View>
              </View>
            )}

            {/* Isıtma Tipi */}
            {!isLand && !isUrbanRenewal && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Isıtma Tipi</Text>
                <DropdownPicker
                  label="Isıtma Tipi Seçin"
                  value={heatingType || null}
                  options={HEATING_PICKER_OPTIONS}
                  onSelect={setHeatingType}
                  placeholder="Isıtma tipi seçin..."
                />
              </View>
            )}

            {/* Fiyat */}
            {!isUrbanRenewal && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fiyat</Text>
              <View style={styles.card}>
                <Text style={styles.inputLabel}>
                  {transactionType === 'RENT' ? 'Aylık Kira (TL)' : 'Fiyat (TL)'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="12.500.000"
                  placeholderTextColor={Colors.text.tertiary}
                  keyboardType="numeric"
                  value={priceText}
                  onChangeText={handlePriceChange}
                />
              </View>
            </View>
            )}

            {/* Açıklama */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <View style={styles.card}>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Mülk hakkında kısa açıklama..."
                  placeholderTextColor={Colors.text.tertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                  value={description}
                  onChangeText={setDescription}
                  onFocus={() => {
                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
                  }}
                />
              </View>
            </View>

            {/* Orijinal İlan Linki (Opsiyonel) */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Orijinal İlan Linki</Text>
                <Text style={styles.optionalLabel}>Opsiyonel</Text>
              </View>
              <View style={styles.card}>
                <TextInput
                  style={styles.input}
                  placeholder="https://sahibinden.com/ilan/..."
                  placeholderTextColor={Colors.text.tertiary}
                  value={listingUrl}
                  onChangeText={setListingUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {listingUrl.length > 0 && (
                  <View style={styles.urlWarning}>
                    <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
                    <Text style={styles.urlWarningText}>
                      Bu link ilan kartlarında ve detay sayfasında diğer danışmanlara görünecektir.
                    </Text>
                  </View>
                )}
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
                <Text style={styles.submitButtonText}>{isEdit ? 'Güncelle' : 'İlanı Yayınla'}</Text>
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
  },
  sectionTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  toggleLabel: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  toggleDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  optionalLabel: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  urlWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.warning + '14',
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  urlWarningText: {
    ...Typography.caption1,
    color: Colors.warning,
    flex: 1,
    lineHeight: 18,
  },
});
