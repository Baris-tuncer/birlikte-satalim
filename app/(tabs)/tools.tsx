import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';

interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'calculator',
    title: 'Tapu Harcı & Kredi Hesaplama',
    description: 'Satış maliyetlerini ve kredi taksitlerini hesaplayın',
    icon: 'calculator-outline',
    route: '/tools/calculator',
  },
  {
    id: 'valuation',
    title: 'Değerleme & Risk Analizi',
    description: 'Taşınmaz değerlemesi ve hukuki risk analizi',
    icon: 'shield-checkmark-outline',
    route: '/tools/valuation',
  },
  {
    id: 'showing-certificate',
    title: 'Yer Gösterme Belgesi',
    description: 'Dijital yer gösterme belgesi oluşturun ve paylaşın',
    icon: 'document-text-outline',
    route: '/tools/showing-certificate',
  },
];

export default function ToolsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Araçlar</Text>
        <Text style={styles.subtitle}>Gayrimenkul hesaplama araçları</Text>

        <View style={styles.toolsList}>
          {TOOLS.map((tool) => (
            <Pressable
              key={tool.id}
              style={({ pressed }) => [
                styles.toolCard,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => router.push(tool.route as any)}
            >
              <View style={styles.toolIconCircle}>
                <Ionicons name={tool.icon} size={28} color={Colors.accent} />
              </View>
              <View style={styles.toolTextContainer}>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.text.tertiary}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    marginBottom: Spacing['2xl'],
  },
  toolsList: {
    gap: Spacing.md,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.md,
  },
  toolIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accent + '14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolTextContainer: {
    flex: 1,
  },
  toolTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  toolDescription: {
    ...Typography.footnote,
    color: Colors.text.secondary,
  },
});
