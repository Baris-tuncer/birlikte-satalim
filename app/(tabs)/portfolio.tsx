import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import SegmentControl from '@/components/ui/SegmentControl';
import ListingCard from '@/components/ui/ListingCard';
import DemandCard from '@/components/ui/DemandCard';
import { useMyListings, useMyDemands, useMyMatches } from '@/lib/hooks';
import type { Listing, BuyerDemand } from '@/types';

const SEGMENTS = ['İlanlarım', 'Taleplerim'];

export default function PortfolioScreen() {
  const router = useRouter();
  const [selectedSegment, setSelectedSegment] = useState(0);

  const { data: myListings, loading: listingsLoading } = useMyListings();
  const { data: myDemands, loading: demandsLoading } = useMyDemands();
  const { data: myMatches } = useMyMatches();

  const handleAdd = useCallback(() => {
    Alert.alert('Yeni Ekle', 'Ne eklemek istiyorsunuz?', [
      {
        text: 'İlan Ekle',
        onPress: () => router.push('/create/listing'),
      },
      {
        text: 'Talep Ekle',
        onPress: () => router.push('/create/demand'),
      },
      { text: 'Vazgeç', style: 'cancel' },
    ]);
  }, [router]);

  const renderListing = useCallback(
    ({ item }: { item: Listing }) => (
      <ListingCard listing={item} onMatch={() => {}} isOwnListing />
    ),
    []
  );

  const renderDemand = useCallback(
    ({ item }: { item: BuyerDemand }) => (
      <DemandCard demand={item} onMatch={() => {}} isOwnDemand />
    ),
    []
  );

  const keyExtractorListing = useCallback((item: Listing) => item.id, []);
  const keyExtractorDemand = useCallback((item: BuyerDemand) => item.id, []);

  const isLoading = selectedSegment === 0 ? listingsLoading : demandsLoading;

  const EmptyListing = useCallback(
    () => (
      <View style={styles.empty}>
        <Ionicons name="business-outline" size={48} color={Colors.text.tertiary} />
        <Text style={styles.emptyTitle}>Henüz ilan eklemediniz</Text>
        <Text style={styles.emptySubtext}>
          İlk ilanınızı ekleyerek portföyünüzü oluşturun
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.emptyButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/create/listing')}
        >
          <Ionicons name="add-circle" size={20} color={Colors.text.inverse} />
          <Text style={styles.emptyButtonText}>İlan Ekle</Text>
        </Pressable>
      </View>
    ),
    [router]
  );

  const EmptyDemand = useCallback(
    () => (
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={48} color={Colors.text.tertiary} />
        <Text style={styles.emptyTitle}>Henüz talep eklemediniz</Text>
        <Text style={styles.emptySubtext}>
          Müşteriniz için bir talep oluşturun
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.emptyButton,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/create/demand')}
        >
          <Ionicons name="add-circle" size={20} color={Colors.text.inverse} />
          <Text style={styles.emptyButtonText}>Talep Ekle</Text>
        </Pressable>
      </View>
    ),
    [router]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Portföyüm</Text>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={handleAdd}
        >
          <Ionicons name="add" size={24} color={Colors.text.inverse} />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{myListings.length}</Text>
          <Text style={styles.statLabel}>İlan</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{myDemands.length}</Text>
          <Text style={styles.statLabel}>Talep</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.accent }]}>
            {myMatches.length}
          </Text>
          <Text style={styles.statLabel}>İş Birliği</Text>
        </View>
      </View>

      {/* Segment Control */}
      <View style={styles.segmentContainer}>
        <SegmentControl
          segments={SEGMENTS}
          selected={selectedSegment}
          onSelect={setSelectedSegment}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={Colors.accent} size="large" />
      ) : selectedSegment === 0 ? (
        <FlatList
          data={myListings}
          renderItem={renderListing}
          keyExtractor={keyExtractorListing}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyListing}
        />
      ) : (
        <FlatList
          data={myDemands}
          renderItem={renderDemand}
          keyExtractor={keyExtractorDemand}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyDemand}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  addButtonPressed: {
    backgroundColor: Colors.accentDark,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statValue: {
    ...Typography.title2,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption1,
    color: Colors.text.secondary,
  },
  segmentContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: Spacing['5xl'],
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
  },
  emptySubtext: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
    ...Shadows.sm,
  },
  emptyButtonText: {
    ...Typography.subhead,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});
