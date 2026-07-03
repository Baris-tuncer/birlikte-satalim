import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/Theme';
import {
  CITIES,
  getDistrictsForCity,
  getNeighborhoodsForDistrict,
} from '@/lib/constants';

// ─── Types ───────────────────────────────────────────

interface FilterBarProps {
  selectedCity: string;
  selectedDistrict: string;
  selectedNeighborhood: string;
  transactionType: string;
  propertyType: string;
  onApply: (filters: {
    city: string;
    district: string;
    neighborhood: string;
    transactionType: string;
    propertyType: string;
  }) => void;
}

type DropdownType = 'city' | 'district' | 'neighborhood' | 'transaction' | 'property' | null;

// ─── Options ─────────────────────────────────────────

const TRANSACTION_OPTIONS = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'SALE', label: 'Satılık' },
  { key: 'RENT', label: 'Kiralık' },
];

const PROPERTY_OPTIONS = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'RESIDENTIAL', label: 'Konut' },
  { key: 'COMMERCIAL', label: 'Ticari' },
  { key: 'LAND', label: 'Arsa' },
];

const TRANSACTION_LABELS: Record<string, string> = {
  ALL: 'Tümü',
  SALE: 'Satılık',
  RENT: 'Kiralık',
};

const PROPERTY_LABELS: Record<string, string> = {
  ALL: 'Tümü',
  RESIDENTIAL: 'Konut',
  COMMERCIAL: 'Ticari',
  LAND: 'Arsa',
};

// ─── Turkish-aware search ────────────────────────────

function turkishLower(str: string): string {
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase();
}

function turkishIncludes(text: string, query: string): boolean {
  return turkishLower(text).includes(turkishLower(query));
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

// ─── Component ───────────────────────────────────────

export default function FilterBar({
  selectedCity,
  selectedDistrict,
  selectedNeighborhood,
  transactionType,
  propertyType,
  onApply,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Derived data
  const districts = useMemo(() => selectedCity ? getDistrictsForCity(selectedCity) : [], [selectedCity]);
  const neighborhoods = useMemo(
    () => (selectedCity && selectedDistrict ? getNeighborhoodsForDistrict(selectedCity, selectedDistrict) : []),
    [selectedCity, selectedDistrict],
  );

  // Filtered for search
  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) return districts;
    return districts.filter((d) => turkishIncludes(d, searchQuery.trim()));
  }, [districts, searchQuery]);

  const filteredNeighborhoods = useMemo(() => {
    if (!searchQuery.trim()) return neighborhoods;
    return neighborhoods.filter((n) => turkishIncludes(n, searchQuery.trim()));
  }, [neighborhoods, searchQuery]);

  // ─── Handlers ────────────────────────────────────────

  const openPicker = useCallback((type: DropdownType) => {
    setSearchQuery('');
    setOpenDropdown(type);
  }, []);

  const closePicker = useCallback(() => {
    setOpenDropdown(null);
    setSearchQuery('');
  }, []);

  const selectCity = useCallback((city: string) => {
    onApply({
      city,
      district: '',
      neighborhood: '',
      transactionType,
      propertyType,
    });
    closePicker();
  }, [transactionType, propertyType, onApply, closePicker]);

  const selectDistrict = useCallback((district: string) => {
    onApply({
      city: selectedCity,
      district,
      neighborhood: '',
      transactionType,
      propertyType,
    });
    closePicker();
  }, [selectedCity, transactionType, propertyType, onApply, closePicker]);

  const selectNeighborhood = useCallback((neighborhood: string) => {
    onApply({
      city: selectedCity,
      district: selectedDistrict,
      neighborhood,
      transactionType,
      propertyType,
    });
    closePicker();
  }, [selectedCity, selectedDistrict, transactionType, propertyType, onApply, closePicker]);

  const selectTransaction = useCallback((key: string) => {
    onApply({
      city: selectedCity,
      district: selectedDistrict,
      neighborhood: selectedNeighborhood,
      transactionType: key,
      propertyType,
    });
    closePicker();
  }, [selectedCity, selectedDistrict, selectedNeighborhood, propertyType, onApply, closePicker]);

  const selectProperty = useCallback((key: string) => {
    onApply({
      city: selectedCity,
      district: selectedDistrict,
      neighborhood: selectedNeighborhood,
      transactionType,
      propertyType: key,
    });
    closePicker();
  }, [selectedCity, selectedDistrict, selectedNeighborhood, transactionType, onApply, closePicker]);

  const handleClear = useCallback(() => {
    onApply({
      city: 'İstanbul',
      district: '',
      neighborhood: '',
      transactionType: 'ALL',
      propertyType: 'ALL',
    });
  }, [onApply]);

  // ─── Display values ──────────────────────────────────

  const cityDisplay = selectedCity || 'Tüm Şehirler';
  const districtDisplay = selectedDistrict || 'Tüm İlçeler';
  const neighborhoodDisplay = selectedNeighborhood || 'Tüm Mahalleler';
  const transactionDisplay = TRANSACTION_LABELS[transactionType] || 'Tümü';
  const propertyDisplay = PROPERTY_LABELS[propertyType] || 'Tümü';

  const hasAnyFilter =
    selectedCity !== 'İstanbul' ||
    selectedDistrict !== '' ||
    selectedNeighborhood !== '' ||
    (transactionType !== 'ALL' && transactionType !== '') ||
    (propertyType !== 'ALL' && propertyType !== '');

  // ─── Bottom sheet modal for options ────────────────

  const renderBottomSheet = () => {
    if (!openDropdown) return null;

    let title = '';
    let items: { key: string; label: string }[] = [];
    let selectedKey = '';
    let onSelect: (key: string) => void = () => {};
    let showSearch = false;

    switch (openDropdown) {
      case 'city':
        title = 'Şehir Seçin';
        items = [
          { key: '', label: 'Tüm Şehirler' },
          ...CITIES.map((c) => ({ key: c, label: c })),
        ];
        selectedKey = selectedCity;
        onSelect = selectCity;
        break;
      case 'district':
        title = 'İlçe Seçin';
        items = [
          { key: '', label: 'Tüm İlçeler' },
          ...filteredDistricts.map((d) => ({ key: d, label: d })),
        ];
        selectedKey = selectedDistrict;
        onSelect = selectDistrict;
        showSearch = true;
        break;
      case 'neighborhood':
        title = 'Mahalle Seçin';
        items = [
          { key: '', label: 'Tüm Mahalleler' },
          ...filteredNeighborhoods.map((n) => ({ key: n, label: n })),
        ];
        selectedKey = selectedNeighborhood;
        onSelect = selectNeighborhood;
        showSearch = true;
        break;
      case 'transaction':
        title = 'İşlem Tipi Seçin';
        items = TRANSACTION_OPTIONS;
        selectedKey = transactionType;
        onSelect = selectTransaction;
        break;
      case 'property':
        title = 'Mülk Tipi Seçin';
        items = PROPERTY_OPTIONS;
        selectedKey = propertyType;
        onSelect = selectProperty;
        break;
    }

    const maxHeight = showSearch ? SCREEN_HEIGHT * 0.7 : Math.min(items.length * 56 + 120, SCREEN_HEIGHT * 0.5);

    return (
      <Modal
        visible
        transparent
        animationType="slide"
        onRequestClose={closePicker}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closePicker} />
          <View style={[styles.sheetContainer, { maxHeight }]}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Title */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <Pressable onPress={closePicker} hitSlop={12}>
                <Ionicons name="close" size={24} color={Colors.text.secondary} />
              </Pressable>
            </View>

            {/* Search (only for district/neighborhood) */}
            {showSearch && (
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={16} color={Colors.text.tertiary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ara..."
                  placeholderTextColor={Colors.text.tertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                  autoCapitalize="words"
                  clearButtonMode="while-editing"
                />
              </View>
            )}

            {/* Options list */}
            <FlatList
              data={items}
              keyExtractor={(item) => item.key}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.key === selectedKey;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.optionItem,
                      pressed && { backgroundColor: Colors.borderLight },
                    ]}
                    onPress={() => onSelect(item.key)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={Colors.accent} />
                    )}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.optionList}
            />
          </View>
        </View>
      </Modal>
    );
  };

  // ─── Render ──────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Şehir */}
      <DropdownRow
        label="Şehir"
        value={cityDisplay}
        icon="location-outline"
        onPress={() => openPicker('city')}
        isFiltered={false}
      />

      {/* İlçe */}
      <DropdownRow
        label="İlçe"
        value={districtDisplay}
        icon="business-outline"
        onPress={() => openPicker('district')}
        isFiltered={selectedDistrict !== ''}
        disabled={!selectedCity}
        disabledText="Önce şehir seçin"
      />

      {/* Mahalle */}
      <DropdownRow
        label="Mahalle"
        value={neighborhoodDisplay}
        icon="map-outline"
        onPress={() => openPicker('neighborhood')}
        isFiltered={selectedNeighborhood !== ''}
        disabled={!selectedCity || !selectedDistrict}
      />

      {/* İşlem Tipi */}
      <DropdownRow
        label="İşlem Tipi"
        value={transactionDisplay}
        icon="pricetag-outline"
        onPress={() => openPicker('transaction')}
        isFiltered={transactionType !== 'ALL' && transactionType !== ''}
      />

      {/* Mülk Tipi */}
      <DropdownRow
        label="Mülk Tipi"
        value={propertyDisplay}
        icon="home-outline"
        onPress={() => openPicker('property')}
        isFiltered={propertyType !== 'ALL' && propertyType !== ''}
      />

      {/* Temizle */}
      {hasAnyFilter && (
        <Pressable style={styles.clearRow} onPress={handleClear}>
          <Ionicons name="close-circle-outline" size={16} color={Colors.accent} />
          <Text style={styles.clearText}>Filtreleri Temizle</Text>
        </Pressable>
      )}

      {renderBottomSheet()}
    </View>
  );
}

// ─── Dropdown Row ────────────────────────────────────

function DropdownRow({
  label,
  value,
  icon,
  onPress,
  isFiltered,
  disabled,
  disabledText,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isFiltered: boolean;
  disabled?: boolean;
  disabledText?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.dropdownRow,
        disabled && styles.dropdownRowDisabled,
        pressed && !disabled && { backgroundColor: Colors.borderLight },
      ]}
      onPress={disabled ? undefined : onPress}
    >
      <View style={styles.dropdownLeft}>
        <Ionicons
          name={icon}
          size={16}
          color={disabled ? Colors.text.tertiary : Colors.text.secondary}
        />
        <Text style={[styles.dropdownLabel, disabled && styles.dropdownLabelDisabled]}>
          {label}
        </Text>
      </View>
      <View style={styles.dropdownRight}>
        <Text
          style={[
            styles.dropdownValue,
            isFiltered && styles.dropdownValueFiltered,
            disabled && styles.dropdownValueDisabled,
          ]}
          numberOfLines={1}
        >
          {disabled ? (disabledText || 'Önce ilçe seçin') : value}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={disabled ? Colors.text.tertiary : Colors.text.secondary}
        />
      </View>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },

  // ── Dropdown rows ──────────────────────────────────
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  dropdownRowDisabled: {
    opacity: 0.5,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 100,
  },
  dropdownLabel: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  dropdownLabelDisabled: {
    color: Colors.text.tertiary,
  },
  dropdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  dropdownValue: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'right',
  },
  dropdownValueFiltered: {
    color: Colors.accent,
    fontWeight: '600',
  },
  dropdownValueDisabled: {
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },

  // ── Clear row ──────────────────────────────────────
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  clearText: {
    ...Typography.footnote,
    color: Colors.accent,
    fontWeight: '600',
  },

  // ── Bottom sheet modal ─────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheetContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  sheetTitle: {
    ...Typography.title3,
    color: Colors.text.primary,
  },

  // ── Search ─────────────────────────────────────────
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    paddingVertical: Platform.OS === 'ios' ? Spacing.xs : Spacing.sm,
  },

  // ── Option items ───────────────────────────────────
  optionList: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  optionText: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  optionTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
  },
});
