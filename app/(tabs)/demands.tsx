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
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import FilterBar from '@/components/ui/FilterBar';
import DemandCard from '@/components/ui/DemandCard';
import { useDemands, useMatchActions, useUpdateDemand } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/lib/subscription-context';
import type { BuyerDemand } from '@/types';

export default function DemandPoolScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { showPaywallIfNeeded } = useSubscription();
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [transactionType, setTransactionType] = useState('ALL');
  const [propertyType, setPropertyType] = useState('ALL');

  const { data: demands, loading, error: demandsError, refetch } = useDemands({
    city: selectedCity,
    district: selectedDistrict || undefined,
    neighborhood: selectedNeighborhood || undefined,
    transaction_type: transactionType !== 'ALL' ? (transactionType as any) : undefined,
    property_type: propertyType !== 'ALL' ? (propertyType as any) : undefined,
  });
  const { send: sendMatch } = useMatchActions();
  const { update: updateDemandStatus } = useUpdateDemand();

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

  const handleMatch = useCallback((demandId: string) => {
    if (showPaywallIfNeeded()) return;
    const demand = demands.find((d) => d.id === demandId);
    if (!demand) return;

    Alert.alert(
      'İlanım Var',
      'Bu talebe uygun bir ilanınız olduğunu bildireceksiniz. Karşı taraf kabul ederse iletişim bilgileriniz paylaşılacak.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: async () => {
            const { error } = await sendMatch({
              targetId: demand.agent_id,
              matchType: 'DEMAND',
              demandId: demand.id,
            });
            if (error) {
              Alert.alert('Hata', error);
            } else {
              Alert.alert('Başarılı', 'İş birliği talebi gönderildi.');
            }
          },
        },
      ]
    );
  }, [demands, sendMatch, showPaywallIfNeeded]);

  const handleRemove = useCallback(async (demandId: string) => {
    const { error } = await updateDemandStatus(demandId, { status: 'DELETED' });
    if (error) {
      Alert.alert('Hata', error);
    } else {
      refetch();
    }
  }, [updateDemandStatus, refetch]);

  const currentUserName = profile?.name ?? '';

  const renderItem = useCallback(
    ({ item }: { item: BuyerDemand }) => (
      <DemandCard
        demand={item}
        onMatch={handleMatch}
        onRemove={handleRemove}
        isOwnDemand={item.agent_id === currentUserId}
        currentUserName={currentUserName}
      />
    ),
    [handleMatch, handleRemove, currentUserId, currentUserName]
  );

  const keyExtractor = useCallback((item: BuyerDemand) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={demands}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Talep Havuzu</Text>
                <Text style={styles.subtitle}>Alıcı talepleri</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={() => {
                  if (showPaywallIfNeeded()) return;
                  router.push('/create/demand');
                }}
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
                {demands.length} talep bulundu
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
              <Ionicons
                name={demandsError ? "cloud-offline-outline" : "heart-outline"}
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.emptyTitle}>
                {demandsError ? 'Bağlantı hatası' : 'Bu bölgede talep yok'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {demandsError
                  ? 'Talepler yüklenirken bir sorun oluştu'
                  : 'Farklı bir bölge seçin veya ilk talebi siz ekleyin'}
              </Text>
              {demandsError && (
                <Pressable
                  style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.9 }]}
                  onPress={onRefresh}
                >
                  <Ionicons name="refresh" size={18} color={Colors.text.inverse} />
                  <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </Pressable>
              )}
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
  greeting: {
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
    paddingBottom: Spacing.md,
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
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    ...Typography.subhead,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});
