import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getListings,
  getDemands,
  getMyListings,
  getMyDemands,
  getMyMatches,
  getPendingMatchCount,
  getPlatformStats,
  sendMatchRequest,
  respondToMatch,
  createListing,
  createDemand,
  updateListing,
  updateDemand,
  getBlockedUserIds,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './database';
import { supabase } from './supabase';
import { useAuth } from './auth-context';
import { mockListings, mockDemands, mockMatches } from './mockData';
import type { Listing, BuyerDemand, Match, TransactionType, PropertyType } from '@/types';

let _hookCounter = 0;

// Auto-match bildirim Edge Function'ini cagir
async function triggerAutoMatchNotify(table: 'listings' | 'buyer_demands', record: Record<string, unknown>) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return;

    await fetch(`${supabaseUrl}/functions/v1/auto-match-notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ type: 'INSERT', table, record }),
    });
  } catch (e) {
    // Auto-match notify sessizce başarısız oldu
  }
}

// ─── LISTINGS ────────────────────────────────────────

interface UseListingsOptions {
  city?: string;
  district?: string;
  neighborhood?: string;
  transaction_type?: TransactionType;
  property_type?: PropertyType;
}

export function useListings(filters?: UseListingsOptions) {
  const { profile } = useAuth();
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = profile?.id;

  const fetch = useCallback(async () => {
    if (__DEV__) {
      let result = mockListings;
      if (filters?.district && filters.district !== 'Hepsi') {
        result = result.filter((l) => l.district === filters.district);
      }
      if (filters?.neighborhood) {
        result = result.filter((l) => l.neighborhood === filters.neighborhood);
      }
      if (filters?.transaction_type) {
        result = result.filter((l) => l.transaction_type === filters.transaction_type);
      }
      if (filters?.property_type) {
        result = result.filter((l) => l.property_type === filters.property_type);
      }
      setData(result);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [listingsResult, blockedIds] = await Promise.all([
      getListings({
        city: filters?.city,
        district: filters?.district,
        neighborhood: filters?.neighborhood,
        transaction_type: filters?.transaction_type,
        property_type: filters?.property_type,
      }),
      userId ? getBlockedUserIds(userId) : Promise.resolve([]),
    ]);
    const filtered = blockedIds.length > 0
      ? listingsResult.data.filter((l) => !blockedIds.includes(l.agent_id))
      : listingsResult.data;
    setData(filtered);
    setError(listingsResult.error ?? null);
    setLoading(false);
  }, [userId, filters?.city, filters?.district, filters?.neighborhood, filters?.transaction_type, filters?.property_type]);

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

interface UseDemandOptions {
  city?: string;
  district?: string;
  neighborhood?: string;
  transaction_type?: TransactionType;
  property_type?: PropertyType;
}

export function useDemands(filters?: UseDemandOptions) {
  const { profile } = useAuth();
  const [data, setData] = useState<BuyerDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = profile?.id;

  const fetch = useCallback(async () => {
    if (__DEV__) {
      let result = mockDemands;
      if (filters?.district && filters.district !== 'Hepsi') {
        result = result.filter((d) => d.district === filters.district);
      }
      if (filters?.neighborhood) {
        result = result.filter((d) => (d.neighborhoods ?? []).includes(filters.neighborhood!));
      }
      if (filters?.transaction_type) {
        result = result.filter((d) => d.transaction_type === filters.transaction_type);
      }
      if (filters?.property_type) {
        result = result.filter((d) => d.property_type === filters.property_type);
      }
      setData(result);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [demandsResult, blockedIds] = await Promise.all([
      getDemands({
        city: filters?.city,
        district: filters?.district,
        neighborhood: filters?.neighborhood,
        transaction_type: filters?.transaction_type,
        property_type: filters?.property_type,
      }),
      userId ? getBlockedUserIds(userId) : Promise.resolve([]),
    ]);
    const filtered = blockedIds.length > 0
      ? demandsResult.data.filter((d) => !blockedIds.includes(d.agent_id))
      : demandsResult.data;
    setData(filtered);
    setError(demandsResult.error ?? null);
    setLoading(false);
  }, [userId, filters?.city, filters?.district, filters?.neighborhood, filters?.transaction_type, filters?.property_type]);

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
  const hookIdRef = useRef(`${++_hookCounter}`);

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
    try {
      const [matchesResult, countResult] = await Promise.all([
        getMyMatches(userId),
        getPendingMatchCount(userId),
      ]);
      setData(matchesResult.data ?? []);
      setPendingCount(countResult.count ?? 0);
      setError(matchesResult.error ?? countResult.error ?? null);
    } catch (e: any) {
      // Eşleşmeler yüklenemedi
      setData([]);
      setPendingCount(0);
      setError(e?.message ?? 'İş birlikleri yüklenirken hata oluştu');
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Realtime: eslesmeler degistiginde otomatik guncelle
  // hookId ile benzersiz kanal adi olustur — ayni hook birden fazla yerde kullanildiginda crash onlenir
  useEffect(() => {
    if (__DEV__ || !userId) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel(`matches-${userId}-${hookIdRef.current}`)
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
    } catch (e) {
      // Realtime kanal hatası — sessizce devam et
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, fetch]);

  return { data, pendingCount, loading, error, refetch: fetch };
}

// ─── MATCH COUNT (profil icin hafif hook — realtime yok) ─────

export function useMatchCount() {
  const { profile } = useAuth();
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const userId = profile?.id;

  useEffect(() => {
    if (__DEV__) {
      const uid = '1';
      setTotal(mockMatches.filter((m) => m.requester_id === uid || m.target_id === uid).length);
      setPendingCount(mockMatches.filter((m) => m.target_id === uid && m.status === 'PENDING').length);
      return;
    }
    if (!userId) return;

    (async () => {
      try {
        const [totalResult, pendingResult] = await Promise.all([
          supabase.from('matches').select('*', { count: 'exact', head: true })
            .or(`requester_id.eq.${userId},target_id.eq.${userId}`),
          getPendingMatchCount(userId),
        ]);
        setTotal(totalResult.count ?? 0);
        setPendingCount(pendingResult.count ?? 0);
      } catch (e) {
        // Match count hatası — sessizce devam et
      }
    })();
  }, [userId]);

  return { total, pendingCount };
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
      // Basarili ise auto-match bildirim gonder
      if (data && !error) {
        triggerAutoMatchNotify('listings', data as unknown as Record<string, unknown>);
      }
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
      // Basarili ise auto-match bildirim gonder
      if (data && !error) {
        triggerAutoMatchNotify('buyer_demands', data as unknown as Record<string, unknown>);
      }
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

// ─── PLATFORM STATS ─────────────────────────────────

export function usePlatformStats() {
  const [stats, setStats] = useState({ activeListings: 0, activeDemands: 0 });

  useEffect(() => {
    if (__DEV__) {
      setStats({ activeListings: mockListings.length, activeDemands: mockDemands.length });
      return;
    }

    getPlatformStats().then(setStats).catch(() => {});
  }, []);

  return stats;
}

// ─── UNREAD NOTIFICATION COUNT ───────────────────────

export function useNotifications() {
  const { profile } = useAuth();
  const [data, setData] = useState<import('@/types').AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = profile?.id;

  const fetch = useCallback(async () => {
    if (__DEV__) {
      setData([]);
      setLoading(false);
      return;
    }
    if (!userId) return;
    setLoading(true);
    const { data: result } = await getNotifications(userId);
    setData(result);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const markRead = useCallback(async (notificationId: string) => {
    await markNotificationRead(notificationId);
    setData((prev) => prev.map((n) => n.id === notificationId ? { ...n, status: 'read' as const, read_at: new Date().toISOString() } : n));
  }, []);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
    setData((prev) => prev.map((n) => ({ ...n, status: 'read' as const, read_at: n.read_at ?? new Date().toISOString() })));
  }, [userId]);

  return { data, loading, refetch: fetch, markRead, markAllRead };
}

export function useUnreadNotificationCount() {
  const { profile } = useAuth();
  const [count, setCount] = useState(0);
  const userId = profile?.id;

  useEffect(() => {
    if (__DEV__) {
      setCount(2);
      return;
    }
    if (!userId) return;

    const fetchCount = async () => {
      const { count: c } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'sent');
      setCount(c ?? 0);
    };
    fetchCount();

    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return count;
}
