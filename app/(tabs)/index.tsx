import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows } from '@/constants/Theme';
import FilterBar from '@/components/ui/FilterBar';
import ListingCard from '@/components/ui/ListingCard';
import { useListings, useMatchActions, useUpdateListing } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import type { Listing } from '@/types';

export default function ListingsScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const [selectedCity, setSelectedCity] = useState('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [transactionType, setTransactionType] = useState('ALL');
  const [propertyType, setPropertyType] = useState('ALL');

  const { data: listings, loading, refetch } = useListings({
    city: selectedCity,
    district: selectedDistrict || undefined,
    neighborhood: selectedNeighborhood || undefined,
    transaction_type: transactionType !== 'ALL' ? (transactionType as any) : undefined,
    property_type: propertyType !== 'ALL' ? (propertyType as any) : undefined,
  });
  const { send: sendMatch } = useMatchActions();
  const { update: updateListingStatus } = useUpdateListing();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const currentUserId = profile?.id ?? (__DEV__ ? '1' : '');

  const handleFilter = useCallback((filters: {
    city: string;
    district: string;
    neighborhood: string;
    transactionType: string;
    propertyType: string;
  }) => {
    setSelectedCity(filters.city);
    setSelectedDistrict(filters.district);
    setSelectedNeighborhood(filters.neighborhood);
    setTransactionType(filters.transactionType);
    setPropertyType(filters.propertyType);
  }, []);

  const handleMatch = useCallback((listingId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    Alert.alert(
      'Eşleşme Talebi',
      'Müşteriniz olduğu bildirimi gönderilecek.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: async () => {
            const { error } = await sendMatch({
              targetId: listing.agent_id,
              matchType: 'LISTING',
              listingId: listing.id,
            });
            if (error) {
              Alert.alert('Hata', error);
            } else {
              Alert.alert('Başarılı', 'Eşleşme talebi gönderildi.');
            }
          },
        },
      ]
    );
  }, [listings, sendMatch]);

  const handleRemove = useCallback(async (listingId: string) => {
    const { error } = await updateListingStatus(listingId, { status: 'DELETED' });
    if (error) {
      Alert.alert('Hata', error);
    } else {
      refetch();
    }
  }, [updateListingStatus, refetch]);

  const currentUserName = profile?.name ?? '';

  const renderItem = useCallback(
    ({ item }: { item: Listing }) => (
      <ListingCard
        listing={item}
        onMatch={handleMatch}
        onRemove={handleRemove}
        isOwnListing={item.agent_id === currentUserId}
        currentUserName={currentUserName}
      />
    ),
    [handleMatch, handleRemove, currentUserId, currentUserName]
  );

  const keyExtractor = useCallback((item: Listing) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>İlanlar</Text>
                <Text style={styles.subtitle}>Emlakçıların mülk portföyü</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={() => router.push('/create/listing')}
              >
                <Ionicons name="add" size={24} color={Colors.text.inverse} />
              </Pressable>
            </View>

            <FilterBar
              selectedCity={selectedCity}
              selectedDistrict={selectedDistrict}
              selectedNeighborhood={selectedNeighborhood}
              transactionType={transactionType}
              propertyType={propertyType}
              onApply={handleFilter}
            />

            <View style={styles.resultRow}>
              <Text style={styles.resultText}>
                {listings.length} ilan bulundu
              </Text>
            </View>

            {loading && !refreshing && (
              <ActivityIndicator style={styles.loader} color={Colors.accent} />
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={48} color={Colors.text.tertiary} />
              <Text style={styles.emptyTitle}>Bu bölgede ilan yok</Text>
              <Text style={styles.emptySubtitle}>
                Farklı bir bölge seçin veya ilk ilanı siz ekleyin
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: Spacing['5xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.text.primary,
  },
  subtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    marginTop: 2,
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
  resultRow: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  resultText: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  loader: {
    paddingVertical: Spacing.xl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
