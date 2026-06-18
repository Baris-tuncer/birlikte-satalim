import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';

interface SegmentControlProps {
  segments: string[];
  selected: number;
  onSelect: (index: number) => void;
}

export default function SegmentControl({
  segments,
  selected,
  onSelect,
}: SegmentControlProps) {
  return (
    <View style={styles.container}>
      {segments.map((label, index) => {
        const isSelected = index === selected;
        return (
          <Pressable
            key={label}
            style={({ pressed }) => [
              styles.segment,
              isSelected && styles.segmentSelected,
              pressed && !isSelected && styles.segmentPressed,
            ]}
            onPress={() => onSelect(index)}
          >
            <Text
              style={[
                styles.segmentText,
                isSelected && styles.segmentTextSelected,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: 3,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
  },
  segmentSelected: {
    backgroundColor: Colors.card,
    ...Shadows.sm,
  },
  segmentPressed: {
    opacity: 0.7,
  },
  segmentText: {
    ...Typography.footnote,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  segmentTextSelected: {
    color: Colors.text.primary,
  },
});
