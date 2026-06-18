import React, { useState } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { DISTRICTS, TRANSACTION_TYPES, PROPERTY_TYPES, ROOM_OPTIONS, HEATING_TYPES } from '@/lib/constants';
import { formatPriceInput } from '@/lib/format';
import { useCreateListing } from '@/lib/hooks';
import type { TransactionType, PropertyType } from '@/types';

export default function CreateListingScreen() {
  const router = useRouter();
  const { create, loading } = useCreateListing();

  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
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
  const [priceText, setPriceText] = useState('');
  const [description, setDescription] = useState('');

  const isLand = propertyType === 'LAND';

  const handlePriceChange = (text: string) => {
    setPriceText(formatPriceInput(text));
  };

  const parsePrice = (text: string) => Number(text.replace(/\./g, '').replace(/,/g, ''));

  const handleSubmit = async () => {
    if (!transactionType) return Alert.alert('Hata', 'İşlem tipi seçin.');
    if (!propertyType) return Alert.alert('Hata', 'Mülk tipi seçin.');
    if (!district) return Alert.alert('Hata', 'İlçe seçin.');
    if (!priceText) return Alert.alert('Hata', 'Fiyat girin.');

    const price = parsePrice(priceText);
    if (price <= 0) return Alert.alert('Hata', 'Geçerli bir fiyat girin.');

    const { error } = await create({
      transaction_type: transactionType,
      property_type: propertyType,
      district,
      neighborhood: neighborhood || null,
      room_count: roomCount || null,
      net_area: netArea ? Number(netArea) : null,
      gross_area: grossArea ? Number(grossArea) : null,
      floor: floor ? Number(floor) : null,
      total_floors: totalFloors ? Number(totalFloors) : null,
      building_age: buildingAge ? Number(buildingAge) : null,
      has_parking: isLand ? null : hasParking,
      has_elevator: isLand ? null : hasElevator,
      heating_type: isLand ? null : heatingType || null,
      price,
      description: description || null,
    });

    if (error) {
      Alert.alert('Hata', error);
      return;
    }

    Alert.alert('Başarılı', 'İlanınız yayınlandı.', [
      { text: 'Tamam', onPress: () => router.back() },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'İlan Oluştur',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* İşlem Tipi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>İşlem Tipi</Text>
              <View style={styles.pillRow}>
                {TRANSACTION_TYPES.map((t) => (
                  <Pressable
                    key={t.key}
                    style={[
                      styles.pill,
                      transactionType === t.key && styles.pillSelected,
                    ]}
                    onPress={() => setTransactionType(t.key)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        transactionType === t.key && styles.pillTextSelected,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Mülk Tipi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mülk Tipi</Text>
              <View style={styles.pillRow}>
                {PROPERTY_TYPES.map((t) => (
                  <Pressable
                    key={t.key}
                    style={[
                      styles.pill,
                      propertyType === t.key && styles.pillSelected,
                    ]}
                    onPress={() => setPropertyType(t.key)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        propertyType === t.key && styles.pillTextSelected,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Konum */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Konum</Text>
              <View style={styles.card}>
                <Text style={styles.inputLabel}>İlçe</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.districtScroll}
                >
                  {DISTRICTS.filter((d) => d !== 'Hepsi').map((d) => (
                    <Pressable
                      key={d}
                      style={[
                        styles.chipSmall,
                        district === d && styles.chipSmallSelected,
                      ]}
                      onPress={() => setDistrict(d)}
                    >
                      <Text
                        style={[
                          styles.chipSmallText,
                          district === d && styles.chipSmallTextSelected,
                        ]}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Text style={styles.inputLabel}>Mahalle</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mahalle adı"
                  placeholderTextColor={Colors.text.tertiary}
                  value={neighborhood}
                  onChangeText={setNeighborhood}
                />
              </View>
            </View>

            {/* Oda Sayısı */}
            {!isLand && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Oda Sayısı</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillRow}
                >
                  {ROOM_OPTIONS.map((r) => (
                    <Pressable
                      key={r}
                      style={[
                        styles.pill,
                        roomCount === r && styles.pillSelected,
                      ]}
                      onPress={() => setRoomCount(r)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          roomCount === r && styles.pillTextSelected,
                        ]}
                      >
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Alan ve Kat */}
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
                    <Text style={styles.inputLabel}>Bina Yaşı</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="5"
                      placeholderTextColor={Colors.text.tertiary}
                      keyboardType="numeric"
                      value={buildingAge}
                      onChangeText={setBuildingAge}
                    />
                  </>
                )}
              </View>
            </View>

            {/* Özellikler */}
            {!isLand && (
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
            {!isLand && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Isıtma Tipi</Text>
                <View style={styles.pillWrap}>
                  {HEATING_TYPES.map((h) => (
                    <Pressable
                      key={h}
                      style={[
                        styles.pill,
                        heatingType === h && styles.pillSelected,
                      ]}
                      onPress={() => setHeatingType(h)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          heatingType === h && styles.pillTextSelected,
                        ]}
                      >
                        {h}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Fiyat */}
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
                  value={description}
                  onChangeText={setDescription}
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
                <Text style={styles.submitButtonText}>İlanı Yayınla</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
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
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
  },
  pillText: {
    ...Typography.footnote,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  pillTextSelected: {
    color: Colors.text.inverse,
  },
  districtScroll: {
    marginBottom: Spacing.lg,
  },
  chipSmall: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
    marginRight: Spacing.sm,
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
});
