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
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import {
  DISTRICTS,
  KADIKOY_NEIGHBORHOODS,
  TRANSACTION_TYPES,
  PROPERTY_TYPES,
  ROOM_OPTIONS,
} from '@/lib/constants';
import { formatPriceInput } from '@/lib/format';
import { useCreateDemand } from '@/lib/hooks';
import type { TransactionType, PropertyType } from '@/types';

export default function CreateDemandScreen() {
  const router = useRouter();
  const { create, loading } = useCreateDemand();

  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [district, setDistrict] = useState('');
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [neighborhoodText, setNeighborhoodText] = useState('');
  const [minBudgetText, setMinBudgetText] = useState('');
  const [maxBudgetText, setMaxBudgetText] = useState('');
  const [minRooms, setMinRooms] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxFloor, setMaxFloor] = useState('');
  const [notes, setNotes] = useState('');

  const isLand = propertyType === 'LAND';
  const isKadikoy = district === 'Kadıköy';

  const toggleNeighborhood = (n: string) => {
    setSelectedNeighborhoods((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
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

    const neighborhoods = isKadikoy
      ? selectedNeighborhoods
      : neighborhoodText
        ? neighborhoodText.split(',').map((n) => n.trim()).filter(Boolean)
        : [];

    const { error } = await create({
      transaction_type: transactionType,
      property_type: propertyType,
      district,
      neighborhoods,
      min_budget: minBudget,
      max_budget: maxBudget,
      min_rooms: minRooms || null,
      min_area: minArea ? Number(minArea) : null,
      max_floor: maxFloor ? Number(maxFloor) : null,
      notes: notes || null,
    });

    if (error) {
      Alert.alert('Hata', error);
      return;
    }

    Alert.alert('Başarılı', 'Talebiniz yayınlandı.', [
      { text: 'Tamam', onPress: () => router.back() },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Talep Oluştur',
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
                      onPress={() => {
                        setDistrict(d);
                        setSelectedNeighborhoods([]);
                      }}
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

                {isKadikoy ? (
                  <>
                    <Text style={styles.inputLabel}>
                      Mahalleler ({selectedNeighborhoods.length} seçili)
                    </Text>
                    <View style={styles.neighborhoodWrap}>
                      {KADIKOY_NEIGHBORHOODS.map((n) => {
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
                ) : district ? (
                  <>
                    <Text style={styles.inputLabel}>
                      Mahalleler (virgülle ayırın)
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Mahalle1, Mahalle2..."
                      placeholderTextColor={Colors.text.tertiary}
                      value={neighborhoodText}
                      onChangeText={setNeighborhoodText}
                    />
                  </>
                ) : null}
              </View>
            </View>

            {/* Bütçe */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bütçe Aralığı</Text>
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
                <Text style={styles.sectionTitle}>Min Oda Sayısı</Text>
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
                        minRooms === r && styles.pillSelected,
                      ]}
                      onPress={() => setMinRooms(r)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          minRooms === r && styles.pillTextSelected,
                        ]}
                      >
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Ek Kriterler */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ek Kriterler</Text>
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

            {/* Notlar */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notlar</Text>
              <View style={styles.card}>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Müşteri tercihleri, özel istekler..."
                  placeholderTextColor={Colors.text.tertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={notes}
                  onChangeText={setNotes}
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
                <Text style={styles.submitButtonText}>Talebi Yayınla</Text>
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
