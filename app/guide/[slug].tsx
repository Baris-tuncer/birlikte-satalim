import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { getGuideArticle } from '@/lib/guide-data';

export default function GuideArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = useMemo(() => getGuideArticle(slug ?? ''), [slug]);

  if (!article) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Bulunamadı', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.text.tertiary} />
          <Text style={styles.emptyText}>İçerik bulunamadı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    const lines: string[] = [];
    lines.push(article.title.toUpperCase());
    lines.push('═'.repeat(40));
    lines.push('');
    lines.push(article.summary);
    lines.push('');

    for (const section of article.sections) {
      lines.push(`▸ ${section.heading}`);
      lines.push('─'.repeat(36));
      for (const item of section.items) {
        lines.push(`  • ${item}`);
      }
      lines.push('');
    }

    if (article.attentionNotes.length > 0) {
      lines.push('⚠ DİKKAT EDİLECEK NOKTALAR');
      lines.push('─'.repeat(36));
      for (const note of article.attentionNotes) {
        lines.push(`  ⚠ ${note}`);
      }
      lines.push('');
    }

    lines.push('─'.repeat(40));
    lines.push('Beraber Satalım uygulaması ile paylaşılmıştır.');

    await Share.share({
      message: lines.join('\n'),
      title: article.title,
    });
  };

  const categoryLabel = article.category === 'SALE' ? 'Satış İşlemleri' : 'Kiralama İşlemleri';
  const categoryColor = article.category === 'SALE' ? Colors.accent : Colors.rent;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: article.title,
          headerShown: true,
          headerBackTitle: 'Geri',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
          headerTitleStyle: { ...Typography.headline, color: Colors.text.primary },
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Kategori badge + başlık */}
        <View style={styles.headerSection}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '14' }]}>
            <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
              {categoryLabel}
            </Text>
          </View>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <Text style={styles.articleSummary}>{article.summary}</Text>
        </View>

        {/* İçerik bölümleri */}
        {article.sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumberCircle}>
                <Text style={styles.sectionNumber}>{sIdx + 1}</Text>
              </View>
              <Text style={styles.sectionHeading}>{section.heading}</Text>
            </View>

            <View style={styles.itemsList}>
              {section.items.map((item, iIdx) => (
                <View key={iIdx} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Dikkat Edilecek Noktalar */}
        {article.attentionNotes.length > 0 && (
          <View style={styles.attentionCard}>
            <View style={styles.attentionHeader}>
              <Ionicons name="warning-outline" size={22} color={Colors.warning} />
              <Text style={styles.attentionTitle}>Dikkat Edilecek Noktalar</Text>
            </View>
            <View style={styles.attentionList}>
              {article.attentionNotes.map((note, nIdx) => (
                <View key={nIdx} style={styles.attentionRow}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={Colors.warning}
                    style={styles.attentionIcon}
                  />
                  <Text style={styles.attentionText}>{note}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Paylaş butonu */}
        <Pressable
          style={({ pressed }) => [styles.shareButton, pressed && { opacity: 0.85 }]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color={Colors.text.inverse} />
          <Text style={styles.shareButtonText}>Paylaş</Text>
        </Pressable>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['5xl'],
  },

  // Header
  headerSection: {
    marginBottom: Spacing['2xl'],
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
  },
  categoryBadgeText: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  articleTitle: {
    ...Typography.title1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  articleSummary: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 24,
  },

  // Bölüm kartları
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionNumber: {
    ...Typography.footnote,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  sectionHeading: {
    ...Typography.title3,
    color: Colors.text.primary,
    flex: 1,
  },
  itemsList: {
    gap: Spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 8,
  },
  bulletText: {
    ...Typography.subhead,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },

  // Dikkat kutusu
  attentionCard: {
    backgroundColor: Colors.warning + '0D',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    padding: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
  },
  attentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  attentionTitle: {
    ...Typography.headline,
    color: Colors.warning,
  },
  attentionList: {
    gap: Spacing.md,
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  attentionIcon: {
    marginTop: 2,
  },
  attentionText: {
    ...Typography.subhead,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },

  // Paylaş butonu
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  shareButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },

  // Boş durum
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
});
