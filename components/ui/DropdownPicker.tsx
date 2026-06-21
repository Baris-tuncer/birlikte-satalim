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

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface DropdownOption {
  key: string;
  label: string;
}

interface DropdownPickerProps {
  label: string;
  value: string | null;
  options: DropdownOption[];
  onSelect: (key: string) => void;
  placeholder?: string;
}

export default function DropdownPicker({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Seçin...',
}: DropdownPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((o) => o.key === value);
  const displayText = selectedOption?.label ?? placeholder;

  const handleSelect = (key: string) => {
    onSelect(key);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: DropdownOption }) => {
    const isSelected = item.key === value;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.listItem,
          pressed && { backgroundColor: Colors.borderLight },
        ]}
        onPress={() => handleSelect(item.key)}
      >
        <Text
          style={[
            styles.listItemText,
            isSelected && styles.listItemTextSelected,
          ]}
        >
          {item.label}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color={Colors.accent} />
        )}
      </Pressable>
    );
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          pressed && { opacity: 0.9 },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedOption && styles.triggerPlaceholder,
          ]}
        >
          {displayText}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={Colors.text.secondary}
        />
      </Pressable>

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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
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

            <FlatList
              data={options}
              keyExtractor={(item) => item.key}
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  triggerText: {
    ...Typography.body,
    color: Colors.text.primary,
    flex: 1,
  },
  triggerPlaceholder: {
    color: Colors.text.tertiary,
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
    maxHeight: SCREEN_HEIGHT * 0.5,
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
