import React, { useState } from 'react';
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
import type { District } from '@/types';

const DISTRICTS: District[] = [
  'Hepsi',
  'Kadıköy',
  'Beşiktaş',
  'Şişli',
  'Esenyurt',
  'Bakırköy',
  'Üsküdar',
  'Ataşehir',
  'Maltepe',
  'Beylikdüzü',
  'Sarıyer',
];

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface DistrictFilterProps {
  selected: District;
  onSelect: (district: District) => void;
}

export default function DistrictFilter({
  selected,
  onSelect,
}: DistrictFilterProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const displayLabel = selected === 'Hepsi' ? 'Tüm İlçeler' : selected;

  const handleSelect = (district: District) => {
    onSelect(district);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: District }) => {
    const isSelected = item === selected;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.listItem,
          pressed && { backgroundColor: Colors.borderLight },
        ]}
        onPress={() => handleSelect(item)}
      >
        <Text
          style={[
            styles.listItemText,
            isSelected && styles.listItemTextSelected,
          ]}
        >
          {item === 'Hepsi' ? 'Tüm İlçeler' : item}
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
          <Text style={styles.cityText}>İstanbul</Text>
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
              <Text style={styles.modalTitle}>İlçe Seçin</Text>
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

            {/* City row (future: city selector) */}
            <View style={styles.cityRow}>
              <Ionicons name="pin" size={16} color={Colors.accent} />
              <Text style={styles.cityRowText}>İstanbul</Text>
            </View>

            {/* District list */}
            <FlatList
              data={DISTRICTS}
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
    maxHeight: SCREEN_HEIGHT * 0.6,
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
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cityRowText: {
    ...Typography.subhead,
    color: Colors.accent,
    fontWeight: '600',
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
