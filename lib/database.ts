import { supabase } from './supabase';
import { isValidUUID } from './format';
import type {
  User,
  Listing,
  BuyerDemand,
  Match,
  NeighborhoodPrice,
  TransactionType,
  PropertyType,
  MatchStatus,
} from '@/types';

// ─── USER ─────────────────────────────────────────────

export async function getUserProfile(authId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .single();
  return { data: data as User | null, error: error?.message };
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);
  return { error: error?.message };
}

// ─── LISTINGS ─────────────────────────────────────────

interface ListingFilters {
  city?: string;
  district?: string;
  neighborhood?: string;
  transaction_type?: TransactionType;
  property_type?: PropertyType;
  min_price?: number;
  max_price?: number;
}

export async function getListings(filters?: ListingFilters) {
  let query = supabase
    .from('listings')
    .select('*, agent:users!inner(*)')
    .eq('status', 'ACTIVE')
    .eq('agent.is_admin', false)
    .order('created_at', { ascending: false });

  if (filters?.city) {
    query = query.eq('city', filters.city);
  }
  if (filters?.district && filters.district !== 'Hepsi') {
    query = query.eq('district', filters.district);
  }
  if (filters?.neighborhood) {
    query = query.eq('neighborhood', filters.neighborhood);
  }
  if (filters?.transaction_type) {
    query = query.eq('transaction_type', filters.transaction_type);
  }
  if (filters?.property_type) {
    query = query.eq('property_type', filters.property_type);
  }
  if (filters?.min_price) {
    query = query.gte('price', filters.min_price);
  }
  if (filters?.max_price) {
    query = query.lte('price', filters.max_price);
  }

  const { data, error } = await query;
  return { data: (data as Listing[]) ?? [], error: error?.message };
}

export async function getMyListings(agentId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*, agent:users(*)')
    .eq('agent_id', agentId)
    .neq('status', 'DELETED')
    .order('created_at', { ascending: false });

  return { data: (data as Listing[]) ?? [], error: error?.message };
}

export async function createListing(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'agent'>) {
  // Günlük ilan limiti (10)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count: dailyCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', listing.agent_id)
    .gte('created_at', startOfDay.toISOString());

  if ((dailyCount ?? 0) >= 10) {
    return { data: null, error: 'Günlük ilan ekleme limitine ulaştınız (10). Yarın tekrar deneyin.' };
  }

  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();
  return { data: data as Listing | null, error: error?.message };
}

export async function updateListing(id: string, updates: Partial<Listing>) {
  const { error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', id);
  return { error: error?.message };
}

// ─── BUYER DEMANDS ────────────────────────────────────

interface DemandFilters {
  city?: string;
  district?: string;
  neighborhood?: string;
  transaction_type?: TransactionType;
  property_type?: PropertyType;
  min_budget?: number;
  max_budget?: number;
}

export async function getDemands(filters?: DemandFilters) {
  let query = supabase
    .from('buyer_demands')
    .select('*, agent:users!inner(*)')
    .eq('status', 'ACTIVE')
    .eq('agent.is_admin', false)
    .order('created_at', { ascending: false });

  if (filters?.city) {
    query = query.eq('city', filters.city);
  }
  if (filters?.district && filters.district !== 'Hepsi') {
    query = query.eq('district', filters.district);
  }
  if (filters?.neighborhood) {
    query = query.contains('neighborhoods', [filters.neighborhood]);
  }
  if (filters?.transaction_type) {
    query = query.eq('transaction_type', filters.transaction_type);
  }
  if (filters?.property_type) {
    query = query.eq('property_type', filters.property_type);
  }

  const { data, error } = await query;
  return { data: (data as BuyerDemand[]) ?? [], error: error?.message };
}

export async function getMyDemands(agentId: string) {
  const { data, error } = await supabase
    .from('buyer_demands')
    .select('*, agent:users(*)')
    .eq('agent_id', agentId)
    .neq('status', 'DELETED')
    .order('created_at', { ascending: false });

  return { data: (data as BuyerDemand[]) ?? [], error: error?.message };
}

export async function createDemand(demand: Omit<BuyerDemand, 'id' | 'created_at' | 'updated_at' | 'agent'>) {
  // Günlük talep limiti (10)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count: dailyCount } = await supabase
    .from('buyer_demands')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', demand.agent_id)
    .gte('created_at', startOfDay.toISOString());

  if ((dailyCount ?? 0) >= 10) {
    return { data: null, error: 'Günlük talep ekleme limitine ulaştınız (10). Yarın tekrar deneyin.' };
  }

  const { data, error } = await supabase
    .from('buyer_demands')
    .insert(demand)
    .select()
    .single();
  return { data: data as BuyerDemand | null, error: error?.message };
}

export async function updateDemand(id: string, updates: Partial<BuyerDemand>) {
  const { error } = await supabase
    .from('buyer_demands')
    .update(updates)
    .eq('id', id);
  return { error: error?.message };
}

// ─── MATCHES ──────────────────────────────────────────

export async function sendMatchRequest(match: {
  requester_id: string;
  target_id: string;
  match_type: 'LISTING' | 'DEMAND';
  listing_id?: string;
  demand_id?: string;
  message?: string;
}) {
  // Mevcut eşleşme kontrolü — duplicate key hatasını önle
  let existingQuery = supabase
    .from('matches')
    .select('id, status')
    .eq('requester_id', match.requester_id)
    .eq('target_id', match.target_id);

  if (match.listing_id) {
    existingQuery = existingQuery.eq('listing_id', match.listing_id);
  }
  if (match.demand_id) {
    existingQuery = existingQuery.eq('demand_id', match.demand_id);
  }

  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    const statusText = existing.status === 'PENDING' ? 'beklemede' :
      existing.status === 'ACCEPTED' ? 'kabul edilmiş' : 'reddedilmiş';
    return { data: null, error: `Bu iş birliği talebi zaten gönderildi (${statusText}).` };
  }

  // Günlük toplam eşleşme talep limiti (10)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count: dailyCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('requester_id', match.requester_id)
    .gte('created_at', startOfDay.toISOString());

  if ((dailyCount ?? 0) >= 10) {
    return { data: null, error: 'Günlük iş birliği talep limitine ulaştınız (10). Yarın tekrar deneyin.' };
  }

  // Aynı kullanıcıya günlük limit (2)
  const { count: targetDailyCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('requester_id', match.requester_id)
    .eq('target_id', match.target_id)
    .gte('created_at', startOfDay.toISOString());

  if ((targetDailyCount ?? 0) >= 2) {
    return { data: null, error: 'Bu kullanıcıya bugün zaten 2 iş birliği talebi gönderdiniz.' };
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({ ...match, status: 'PENDING' })
    .select()
    .single();
  return { data: data as Match | null, error: error?.message };
}

export async function respondToMatch(matchId: string, status: 'ACCEPTED' | 'REJECTED') {
  // Önce mevcut match'i al (old_record için)
  const { data: oldMatch } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  const { data: updatedMatch, error } = await supabase
    .from('matches')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', matchId)
    .select()
    .single();

  if (!error && updatedMatch) {
    // match-response-push edge function'ı doğrudan çağır
    supabase.functions.invoke('match-response-push', {
      body: {
        type: 'UPDATE',
        table: 'matches',
        record: updatedMatch,
        old_record: oldMatch ?? { status: 'PENDING' },
      },
    }).catch(() => {});
  }

  return { error: error?.message };
}

export async function getMyMatches(userId: string) {
  if (!isValidUUID(userId)) {
    return { data: [], error: 'Geçersiz kullanıcı kimliği.' };
  }

  const { data, error } = await supabase
    .from('matches')
    .select('*, requester:users!requester_id(*), target:users!target_id(*), listing:listings(*), demand:buyer_demands(*)')
    .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
    .neq('status', 'EXPIRED')
    .order('created_at', { ascending: false });

  return { data: (data as Match[]) ?? [], error: error?.message };
}

export async function getPendingMatchCount(userId: string) {
  const { count, error } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('target_id', userId)
    .eq('status', 'PENDING');

  return { count: count ?? 0, error: error?.message };
}

// ─── ADMIN: LICENSE REVIEW ────────────────────────────

export async function getPendingLicenses() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('license_status', 'pending')
    .order('updated_at', { ascending: true });

  return { data: (data as User[]) ?? [], error: error?.message };
}

export async function reviewLicense(
  userId: string,
  status: 'approved' | 'rejected',
  reviewerId: string
) {
  const { error } = await supabase
    .from('users')
    .update({
      license_status: status,
      license_reviewed_at: new Date().toISOString(),
      license_reviewed_by: reviewerId,
    })
    .eq('id', userId);

  return { error: error?.message };
}

// ─── PLATFORM STATS ──────────────────────────────────

export async function getPlatformStats() {
  const [listingsResult, demandsResult] = await Promise.all([
    supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE'),
    supabase
      .from('buyer_demands')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE'),
  ]);

  return {
    activeListings: listingsResult.count ?? 0,
    activeDemands: demandsResult.count ?? 0,
  };
}

// ─── CONTENT REPORTS ─────────────────────────────────

export async function reportContent(report: {
  reporter_id: string;
  content_type: 'LISTING' | 'DEMAND';
  content_id: string;
  reason: string;
  description?: string;
}) {
  const { error } = await supabase
    .from('content_reports')
    .insert(report);

  if (error?.code === '23505') {
    return { error: 'Bu içeriği zaten bildirdiniz.' };
  }
  return { error: error?.message };
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  content_type: 'LISTING' | 'DEMAND';
  content_id: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  created_at: string;
  reporter?: { name: string; email: string } | null;
}

export async function getContentReports(statusFilter?: 'PENDING' | 'REVIEWED' | 'RESOLVED') {
  let query = supabase
    .from('content_reports')
    .select('*, reporter:users!reporter_id(name, email)')
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  return { data: (data as ContentReport[]) ?? [], error: error?.message };
}

export async function updateReportStatus(reportId: string, status: 'REVIEWED' | 'RESOLVED') {
  const { error } = await supabase
    .from('content_reports')
    .update({ status })
    .eq('id', reportId);
  return { error: error?.message };
}

// ─── USER BLOCKS ─────────────────────────────────────

export async function blockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase
    .from('user_blocks')
    .insert({ blocker_id: blockerId, blocked_id: blockedId });

  if (error?.code === '23505') {
    return { error: 'Bu kullanıcı zaten engellenmiş.' };
  }
  return { error: error?.message };
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  return { error: error?.message };
}

export async function getBlockedUserIds(blockerId: string): Promise<string[]> {
  const { data } = await supabase
    .from('user_blocks')
    .select('blocked_id')
    .eq('blocker_id', blockerId);
  return (data ?? []).map((row: any) => row.blocked_id);
}

// ─── NEIGHBORHOOD PRICES ──────────────────────────────

export async function getNeighborhoodPrice(district: string, neighborhood: string, propertyType: PropertyType) {
  const { data, error } = await supabase
    .from('neighborhood_prices')
    .select('*')
    .eq('district', district)
    .eq('neighborhood', neighborhood)
    .eq('property_type', propertyType)
    .single();

  return { data: data as NeighborhoodPrice | null, error: error?.message };
}

export async function getNeighborhoodPrices(district: string) {
  const { data, error } = await supabase
    .from('neighborhood_prices')
    .select('*')
    .eq('district', district)
    .order('neighborhood');

  return { data: (data as NeighborhoodPrice[]) ?? [], error: error?.message };
}
