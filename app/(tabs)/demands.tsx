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
import DistrictFilter from '@/components/ui/DistrictFilter';
import DemandCard from '@/components/ui/DemandCard';
import { useDemands, useMatchActions } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import type { District, BuyerDemand } from '@/types';

export default function DemandPoolScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [selectedDistrict, setSelectedDistrict] = useState<District>('Hepsi');

  const { data: demands, loading, refetch } = useDemands({
    district: selectedDistrict,
  });
  const { send: sendMatch } = useMatchActions();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const currentUserId = profile?.id ?? (__DEV__ ? '1' : '');

  const handleMatch = useCallback((demandId: string) => {
    const demand = demands.find((d) => d.id === demandId);
    if (!demand) return;

    Alert.alert(
      'Eşleşme Talebi',
      'Bu talep için portföyünüzden bir ilan eşleştirilecek.',
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
              Alert.alert('Başarılı', 'Eşleşme talebi gönderildi.');
            }
          },
        },
      ]
    );
  }, [demands, sendMatch]);

  const renderItem = useCallback(
    ({ item }: { item: BuyerDemand }) => (
      <DemandCard
        demand={item}
        onMatch={handleMatch}
        isOwnDemand={item.agent_id === currentUserId}
      />
    ),
    [handleMatch, currentUserId]
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
                onPress={() => router.push('/create/demand')}
              >
                <Ionicons name="add" size={24} color={Colors.text.inverse} />
              </Pressable>
            </View>

            <DistrictFilter
              selected={selectedDistrict}
              onSelect={setSelectedDistrict}
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
              <Ionicons name="heart-outline" size={48} color={Colors.text.tertiary} />
              <Text style={styles.emptyTitle}>Bu bölgede talep yok</Text>
              <Text style={styles.emptySubtitle}>
                Farklı bir bölge seçin veya ilk talebi siz ekleyin
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
});
