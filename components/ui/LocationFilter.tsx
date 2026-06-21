import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '@/constants/Theme';
import { CITIES, getDistrictsForCity } from '@/lib/constants';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface LocationFilterProps {
  selectedCity: string;
  selectedDistrict: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
}

export default function LocationFilter({
  selectedCity,
  selectedDistrict,
  onCityChange,
  onDistrictChange,
}: LocationFilterProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const districts = useMemo(
    () => ['Hepsi', ...getDistrictsForCity(selectedCity)],
    [selectedCity]
  );

  const displayLabel =
    selectedDistrict === 'Hepsi' ? 'Tum Ilceler' : selectedDistrict;

  const handleCityChange = (city: string) => {
    onCityChange(city);
    onDistrictChange('Hepsi');
  };

  const handleDistrictSelect = (district: string) => {
    onDistrictChange(district);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = item === selectedDistrict;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.listItem,
          pressed && { backgroundColor: Colors.borderLight },
        ]}
        onPress={() => handleDistrictSelect(item)}
      >
        <Text
          style={[
            styles.listItemText,
            isSelected && styles.listItemTextSelected,
          ]}
        >
          {item === 'Hepsi' ? 'Tum Ilceler' : item}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color={Colors.accent} />
        )}
      </Pressable>
    );
  };

  return (
    <>
      {/* Trigger button */}
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          pressed && { opacity: 0.9 },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.triggerLeft}>
          <Ionicons
            name="location-outline"
            size={18}
            color={Colors.text.secondary}
          />
          <Text style={styles.cityText}>{selectedCity}</Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={Colors.text.tertiary}
          />
          <Text style={styles.districtText}>{displayLabel}</Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={18}
          color={Colors.text.secondary}
        />
      </Pressable>

      {/* Selection modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bolge Secin</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={12}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={Colors.text.secondary}
                />
              </Pressable>
            </View>

            {/* City selector - large tabs */}
            <View style={styles.cityRow}>
              {CITIES.map((city) => {
                const isActive = city === selectedCity;
                return (
                  <Pressable
                    key={city}
                    style={[
                      styles.cityTab,
                      isActive && styles.cityTabActive,
                    ]}
                    onPress={() => handleCityChange(city)}
                  >
                    <Ionicons
                      name={isActive ? 'location' : 'location-outline'}
                      size={18}
                      color={isActive ? Colors.text.inverse : Colors.accent}
                    />
                    <Text
                      style={[
                        styles.cityTabText,
                        isActive && styles.cityTabTextActive,
                      ]}
                    >
                      {city}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* District list */}
            <FlatList
              data={districts}
              keyExtractor={(item) => item}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              style={styles.list}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cityText: {
    ...Typography.subhead,
    color: Colors.text.secondary,
  },
  districtText: {
    ...Typography.headline,
    color: Colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: Spacing['4xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.title3,
    color: Colors.text.primary,
  },
  cityRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  cityTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent + '14',
    borderWidth: 1.5,
    borderColor: Colors.accent + '28',
  },
  cityTabActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  cityTabText: {
    ...Typography.headline,
    color: Colors.accent,
    fontSize: 15,
  },
  cityTabTextActive: {
    color: Colors.text.inverse,
  },
  list: {
    paddingHorizontal: Spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  listItemText: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  listItemTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
  },
});
