import { useState, useEffect, useCallback } from 'react';
import {
  getListings,
  getDemands,
  getMyListings,
  getMyDemands,
  getMyMatches,
  getPendingMatchCount,
  sendMatchRequest,
  respondToMatch,
  createListing,
  createDemand,
  updateListing,
  updateDemand,
} from './database';
import { supabase } from './supabase';
import { useAuth } from './auth-context';
import { mockListings, mockDemands, mockMatches } from './mockData';
import type { Listing, BuyerDemand, Match, TransactionType, PropertyType } from '@/types';

// ─── LISTINGS ────────────────────────────────────────

interface UseListingsOptions {
  district?: string;
  transaction_type?: TransactionType;
  property_type?: PropertyType;
}

export function useListings(filters?: UseListingsOptions) {
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (__DEV__) {
      let result = mockListings;
      if (filters?.district && filters.district !== 'Hepsi') {
        result = result.filter((l) => l.district === filters.district);
      }
      setData(result);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: listings, error: err } = await getListings({
      district: filters?.district,
      transaction_type: filters?.transaction_type,
      property_type: filters?.property_type,
    });
    setData(listings);
    setError(err ?? null);
    setLoading(false);
  }, [filters?.district, filters?.transaction_type, filters?.property_type]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Realtime: yeni ilan eklendiginde veya guncelleme olunca listeyi yenile
  useEffect(() => {
    if (__DEV__) return;

    const channel = supabase
      .channel('listings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listings' },
        () => { fetch(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ─── DEMANDS ─────────────────────────────────────────

export function useDemands(filters?: { district?: string }) {
  const [data, setData] = useState<BuyerDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (__DEV__) {
      let result = mockDemands;
      if (filters?.district && filters.district !== 'Hepsi') {
        result = result.filter((d) => d.district === filters.district);
      }
      setData(result);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: demands, error: err } = await getDemands({
      district: filters?.district,
    });
    setData(demands);
    setError(err ?? null);
    setLoading(false);
  }, [filters?.district]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Realtime: yeni talep eklendiginde listeyi yenile
  useEffect(() => {
    if (__DEV__) return;

    const channel = supabase
      .channel('demands-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'buyer_demands' },
        () => { fetch(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ─── MY LISTINGS ─────────────────────────────────────

export function useMyListings() {
  const { profile } = useAuth();
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = profile?.id;

  const fetch = useCallback(async () => {
    if (__DEV__) {
      setData(mockListings.filter((l) => l.agent_id === '1'));
      setLoading(false);
      return;
    }
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: listings, error: err } = await getMyListings(userId);
    setData(listings);
    setError(err ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ─── MY DEMANDS ──────────────────────────────────────

export function useMyDemands() {
  const { profile } = useAuth();
  const [data, setData] = useState<BuyerDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = profile?.id;

  const fetch = useCallback(async () => {
    if (__DEV__) {
      setData(mockDemands.filter((d) => d.agent_id === '1'));
      setLoading(false);
      return;
    }
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: demands, error: err } = await getMyDemands(userId);
    setData(demands);
    setError(err ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ─── MY MATCHES ──────────────────────────────────────

export function useMyMatches() {
  const { profile } = useAuth();
  const [data, setData] = useState<Match[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = profile?.id;

  const fetch = useCallback(async () => {
    if (__DEV__) {
      const uid = '1';
      setData(
        mockMatches.filter(
          (m) => m.requester_id === uid || m.target_id === uid
        )
      );
      setPendingCount(
        mockMatches.filter(
          (m) => m.target_id === uid && m.status === 'PENDING'
        ).length
      );
      setLoading(false);
      return;
    }
    if (!userId) {
      setData([]);
      setPendingCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [matchesResult, countResult] = await Promise.all([
      getMyMatches(userId),
      getPendingMatchCount(userId),
    ]);
    setData(matchesResult.data);
    setPendingCount(countResult.count);
    setError(matchesResult.error ?? countResult.error ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Realtime: eslesmeler degistiginde otomatik guncelle
  useEffect(() => {
    if (__DEV__ || !userId) return;

    const channel = supabase
      .channel(`matches-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        (payload) => {
          const row = payload.new as Record<string, unknown> | undefined;
          const old = payload.old as Record<string, unknown> | undefined;
          // Sadece bu kullaniciya ait degisiklikleri dinle
          const isRelevant =
            row?.requester_id === userId ||
            row?.target_id === userId ||
            old?.requester_id === userId ||
            old?.target_id === userId;
          if (isRelevant) {
            fetch();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetch]);

  return { data, pendingCount, loading, error, refetch: fetch };
}

// ─── MATCH ACTIONS ───────────────────────────────────

export function useMatchActions() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const send = useCallback(
    async (params: {
      targetId: string;
      matchType: 'LISTING' | 'DEMAND';
      listingId?: string;
      demandId?: string;
      message?: string;
    }) => {
      if (__DEV__) return { error: null };
      if (!profile) return { error: 'Giriş yapmalısınız' };
      setLoading(true);
      const { error } = await sendMatchRequest({
        requester_id: profile.id,
        target_id: params.targetId,
        match_type: params.matchType,
        listing_id: params.listingId,
        demand_id: params.demandId,
        message: params.message,
      });
      setLoading(false);
      return { error };
    },
    [profile]
  );

  const respond = useCallback(
    async (matchId: string, status: 'ACCEPTED' | 'REJECTED') => {
      if (__DEV__) return { error: null };
      setLoading(true);
      const { error } = await respondToMatch(matchId, status);
      setLoading(false);
      return { error };
    },
    []
  );

  return { send, respond, loading };
}

// ─── CREATE LISTING ──────────────────────────────────

export function useCreateListing() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const create = useCallback(
    async (params: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'agent' | 'agent_id' | 'status'>) => {
      if (!profile && !__DEV__) return { data: null, error: 'Giriş yapmalısınız' };
      setLoading(true);
      if (__DEV__) {
        setLoading(false);
        return { data: { ...params, id: Date.now().toString(), agent_id: '1', status: 'ACTIVE' as const, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, error: null };
      }
      const { data, error } = await createListing({
        ...params,
        agent_id: profile!.id,
        status: 'ACTIVE',
      });
      setLoading(false);
      return { data, error };
    },
    [profile]
  );

  return { create, loading };
}

// ─── CREATE DEMAND ───────────────────────────────────

export function useCreateDemand() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const create = useCallback(
    async (params: Omit<BuyerDemand, 'id' | 'created_at' | 'updated_at' | 'agent' | 'agent_id' | 'status' | 'expires_at'>) => {
      if (!profile && !__DEV__) return { data: null, error: 'Giriş yapmalısınız' };
      setLoading(true);
      if (__DEV__) {
        setLoading(false);
        return { data: { ...params, id: Date.now().toString(), agent_id: '1', status: 'ACTIVE' as const, expires_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, error: null };
      }
      const { data, error } = await createDemand({
        ...params,
        agent_id: profile!.id,
        status: 'ACTIVE',
        expires_at: null,
      });
      setLoading(false);
      return { data, error };
    },
    [profile]
  );

  return { create, loading };
}

// ─── UPDATE LISTING ─────────────────────────────────

export function useUpdateListing() {
  const [loading, setLoading] = useState(false);

  const update = useCallback(
    async (id: string, updates: Record<string, unknown>) => {
      if (__DEV__) return { error: null };
      setLoading(true);
      const { error } = await updateListing(id, updates as Partial<Listing>);
      setLoading(false);
      return { error };
    },
    []
  );

  return { update, loading };
}

// ─── UPDATE DEMAND ──────────────────────────────────

export function useUpdateDemand() {
  const [loading, setLoading] = useState(false);

  const update = useCallback(
    async (id: string, updates: Record<string, unknown>) => {
      if (__DEV__) return { error: null };
      setLoading(true);
      const { error } = await updateDemand(id, updates as Partial<BuyerDemand>);
      setLoading(false);
      return { error };
    },
    []
  );

  return { update, loading };
}
