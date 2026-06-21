import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/Theme';
import MatchCard from '@/components/ui/MatchCard';
import { useMyMatches, useMatchActions } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import type { Match } from '@/types';

export default function MatchesScreen() {
  const { profile } = useAuth();
  const { data: userMatches, loading, error, refetch } = useMyMatches();
  const { respond } = useMatchActions();

  const currentUserId = profile?.id ?? (__DEV__ ? '1' : '');

  const handleAccept = useCallback(
    async (matchId: string) => {
      const { error } = await respond(matchId, 'ACCEPTED');
      if (error) {
        Alert.alert('Hata', error);
        return;
      }
      Alert.alert('Eşleşme Kabul Edildi', 'İletişim bilgileri artık görünür.');
      refetch();
    },
    [respond, refetch]
  );

  const handleReject = useCallback(
    async (matchId: string) => {
      const { error } = await respond(matchId, 'REJECTED');
      if (error) {
        Alert.alert('Hata', error);
        return;
      }
      Alert.alert('Eşleşme Reddedildi', 'Eşleşme reddedildi.');
      refetch();
    },
    [respond, refetch]
  );

  const renderItem = useCallback(
    ({ item }: { item: Match }) => (
      <MatchCard
        match={item}
        currentUserId={currentUserId}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    ),
    [handleAccept, handleReject, currentUserId]
  );

  const keyExtractor = useCallback((item: Match) => item.id, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Eşleşmelerim',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
        }}
      />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={48} color={Colors.error} />
            <Text style={styles.emptyTitle}>Yüklenemedi</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={userMatches}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={
              userMatches.length === 0 ? styles.emptyListContent : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="git-compare-outline" size={48} color={Colors.text.tertiary} />
                <Text style={styles.emptyTitle}>Henüz eşleşme yok</Text>
                <Text style={styles.emptySubtitle}>
                  İlan ve talepleri eşleştirmeye başladığınızda burada görünecek.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing['5xl'],
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
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
