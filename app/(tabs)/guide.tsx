import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import {
  getGuideArticles,
  searchGuideArticles,
  type GuideArticle,
  type GuideCategory,
} from '@/lib/guide-data';

// ─── Kategori tanımları ────────────────────────────────────────────

interface CategoryDef {
  key: GuideCategory;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'SALE',
    title: 'Satış İşlemleri',
    subtitle: 'Tapu devri, belgeler, vergiler ve prosedürler',
    icon: 'business-outline',
    color: Colors.accent,
  },
  {
    key: 'RENT',
    title: 'Kiralama İşlemleri',
    subtitle: 'Kira sözleşmesi, artış, depozito ve tahliye',
    icon: 'key-outline',
    color: Colors.rent,
  },
];

export default function GuideScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<GuideCategory | null>(null);

  const isSearching = searchQuery.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return searchGuideArticles(searchQuery);
  }, [searchQuery, isSearching]);

  const toggleCategory = useCallback((key: GuideCategory) => {
    setExpandedCategory((prev) => (prev === key ? null : key));
  }, []);

  const navigateToArticle = useCallback(
    (slug: string) => {
      router.push(`/guide/${slug}` as any);
    },
    [router],
  );

  const renderArticleRow = useCallback(
    (article: GuideArticle) => (
      <Pressable
        key={article.slug}
        style={({ pressed }) => [styles.articleRow, pressed && { opacity: 0.8 }]}
        onPress={() => navigateToArticle(article.slug)}
      >
        <View
          style={[
            styles.articleIconCircle,
            {
              backgroundColor:
                (article.category === 'SALE' ? Colors.accent : Colors.rent) + '14',
            },
          ]}
        >
          <Ionicons
            name={article.icon as any}
            size={20}
            color={article.category === 'SALE' ? Colors.accent : Colors.rent}
          />
        </View>
        <View style={styles.articleTextContainer}>
          <Text style={styles.articleTitle} numberOfLines={1}>
            {article.title}
          </Text>
          <Text style={styles.articleSummary} numberOfLines={2}>
            {article.summary}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
      </Pressable>
    ),
    [navigateToArticle],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Başlık */}
        <Text style={styles.title}>Rehber & Mevzuat</Text>
        <Text style={styles.subtitle}>
          Gayrimenkul işlemlerinde bilmeniz gereken her şey
        </Text>

        {/* Arama */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Konu veya anahtar kelime ara..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {isSearching && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
            </Pressable>
          )}
        </View>

        {/* Arama sonuçları */}
        {isSearching ? (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsLabel}>
              {searchResults.length > 0
                ? `${searchResults.length} sonuç bulundu`
                : 'Sonuç bulunamadı'}
            </Text>
            {searchResults.map(renderArticleRow)}
          </View>
        ) : (
          /* Kategori kartları */
          <View style={styles.categoriesList}>
            {CATEGORIES.map((cat) => {
              const articles = getGuideArticles(cat.key);
              const isExpanded = expandedCategory === cat.key;

              return (
                <View key={cat.key} style={styles.categoryCard}>
                  {/* Kategori başlığı */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.categoryHeader,
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => toggleCategory(cat.key)}
                  >
                    <View style={[styles.categoryIconCircle, { backgroundColor: cat.color + '14' }]}>
                      <Ionicons name={cat.icon} size={28} color={cat.color} />
                    </View>
                    <View style={styles.categoryTextContainer}>
                      <Text style={styles.categoryTitle}>{cat.title}</Text>
                      <Text style={styles.categorySubtitle}>{cat.subtitle}</Text>
                    </View>
                    <View style={[styles.countBadge, { backgroundColor: cat.color + '14' }]}>
                      <Text style={[styles.countBadgeText, { color: cat.color }]}>
                        {articles.length}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={Colors.text.tertiary}
                    />
                  </Pressable>

                  {/* Açılan konu listesi */}
                  {isExpanded && (
                    <View style={styles.articlesList}>
                      {articles.map(renderArticleRow)}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
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

  // Başlık
  title: {
    ...Typography.largeTitle,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
  },

  // Arama
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    padding: 0,
  },

  // Arama sonuçları
  searchResults: {
    gap: Spacing.md,
  },
  searchResultsLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },

  // Kategori kartları
  categoriesList: {
    gap: Spacing.lg,
  },
  categoryCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  categorySubtitle: {
    ...Typography.footnote,
    color: Colors.text.secondary,
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    ...Typography.footnote,
    fontWeight: '700',
  },

  // Konu listesi
  articlesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  articleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleTextContainer: {
    flex: 1,
  },
  articleTitle: {
    ...Typography.subhead,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  articleSummary: {
    ...Typography.caption1,
    color: Colors.text.secondary,
  },
});
