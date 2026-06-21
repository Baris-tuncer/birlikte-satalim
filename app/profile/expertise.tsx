import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { useAuth } from '@/lib/auth-context';
import { updateUserProfile } from '@/lib/database';
import { CITIES, getDistrictsForCity, getNeighborhoodsForDistrict } from '@/lib/constants';

export default function ExpertiseScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();

  const [city, setCity] = useState(profile?.expertise_city ?? 'İstanbul');
  const [districts, setDistricts] = useState<string[]>(profile?.expertise_districts ?? []);
  const [neighborhoods, setNeighborhoods] = useState<Record<string, string[]>>(
    profile?.expertise_neighborhoods ?? {}
  );
  const [saving, setSaving] = useState(false);
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

  const availableDistricts = getDistrictsForCity(city);

  const toggleDistrict = (d: string) => {
    setDistricts((prev) => {
      if (prev.includes(d)) {
        // İlçeyi çıkardığımızda mahallelerini de temizle
        const copy = { ...neighborhoods };
        delete copy[d];
        setNeighborhoods(copy);
        return prev.filter((x) => x !== d);
      }
      return [...prev, d];
    });
  };

  const toggleNeighborhood = (district: string, n: string) => {
    setNeighborhoods((prev) => {
      const current = prev[district] ?? [];
      if (current.includes(n)) {
        return { ...prev, [district]: current.filter((x) => x !== n) };
      }
      return { ...prev, [district]: [...current, n] };
    });
  };

  const handleSave = useCallback(async () => {
    if (!profile?.id) return;
    setSaving(true);
    const { error } = await updateUserProfile(profile.id, {
      expertise_city: city,
      expertise_districts: districts,
      expertise_neighborhoods: neighborhoods,
    } as any);
    setSaving(false);
    if (error) {
      Alert.alert('Hata', error);
    } else {
      await refreshProfile();
      Alert.alert('Kaydedildi', 'Uzmanlık bölgeniz güncellendi.');
      router.back();
    }
  }, [profile, city, districts, neighborhoods, refreshProfile, router]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Uzmanlık Bölgesi',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Şehir seçimi */}
        <Text style={styles.sectionTitle}>Şehir</Text>
        <View style={styles.chipRow}>
          {CITIES.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, city === c && styles.chipSelected]}
              onPress={() => {
                setCity(c);
                setDistricts([]);
                setNeighborhoods({});
              }}
            >
              <Text style={[styles.chipText, city === c && styles.chipTextSelected]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* İlçe seçimi */}
        <Text style={styles.sectionTitle}>İlçeler</Text>
        <Text style={styles.sectionHint}>Uzman olduğunuz ilçeleri seçin</Text>

        {availableDistricts.map((d) => {
          const isSelected = districts.includes(d);
          const neighborhoodList = getNeighborhoodsForDistrict(city, d);
          const isExpanded = expandedDistrict === d;
          const selectedNeighborhoods = neighborhoods[d] ?? [];

          return (
            <View key={d}>
              <Pressable
                style={[styles.districtRow, isSelected && styles.districtRowSelected]}
                onPress={() => toggleDistrict(d)}
              >
                <View style={styles.districtLeft}>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? Colors.accent : Colors.text.tertiary}
                  />
                  <Text style={[styles.districtText, isSelected && styles.districtTextSelected]}>
                    {d}
                  </Text>
                  {selectedNeighborhoods.length > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{selectedNeighborhoods.length}</Text>
                    </View>
                  )}
                </View>
                {isSelected && neighborhoodList.length > 0 && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      setExpandedDistrict(isExpanded ? null : d);
                    }}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={Colors.text.tertiary}
                    />
                  </Pressable>
                )}
              </Pressable>

              {/* Mahalle listesi */}
              {isSelected && isExpanded && neighborhoodList.length > 0 && (
                <View style={styles.neighborhoodContainer}>
                  <View style={styles.neighborhoodChipRow}>
                    {neighborhoodList.map((n) => {
                      const nSelected = selectedNeighborhoods.includes(n);
                      return (
                        <Pressable
                          key={n}
                          style={[styles.nChip, nSelected && styles.nChipSelected]}
                          onPress={() => toggleNeighborhood(d, n)}
                        >
                          <Text style={[styles.nChipText, nSelected && styles.nChipTextSelected]}>
                            {n}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Kaydet butonu */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.text.inverse} />
          ) : (
            <Text style={styles.saveButtonText}>Kaydet</Text>
          )}
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  sectionTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
  },
  sectionHint: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  chipSelected: {
    backgroundColor: Colors.accent + '14',
    borderColor: Colors.accent,
  },
  chipText: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xs,
    ...Shadows.sm,
  },
  districtRowSelected: {
    backgroundColor: Colors.accent + '08',
    borderWidth: 1,
    borderColor: Colors.accent + '28',
  },
  districtLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  districtText: {
    ...Typography.subhead,
    color: Colors.text.secondary,
  },
  districtTextSelected: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    ...Typography.caption2,
    color: Colors.text.inverse,
    fontWeight: '700',
  },
  neighborhoodContainer: {
    paddingLeft: Spacing['3xl'],
    paddingRight: Spacing.md,
    paddingBottom: Spacing.md,
  },
  neighborhoodChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  nChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nChipSelected: {
    backgroundColor: Colors.accent + '14',
    borderColor: Colors.accent,
  },
  nChipText: {
    ...Typography.caption1,
    color: Colors.text.secondary,
  },
  nChipTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing['3xl'],
    ...Shadows.md,
  },
  saveButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
});
