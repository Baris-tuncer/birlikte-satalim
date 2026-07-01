// ─── ENUM'LAR ─────────────────────────────────────────

export type TransactionType = 'SALE' | 'RENT';
export type PropertyType = 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND' | 'URBAN_RENEWAL';
export type LicenseStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type ListingStatus = 'ACTIVE' | 'PAUSED' | 'SOLD' | 'RENTED' | 'DELETED';
export type DemandStatus = 'ACTIVE' | 'FULFILLED' | 'EXPIRED' | 'DELETED';
export type MatchStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type MatchType = 'LISTING' | 'DEMAND';

// ─── USER ─────────────────────────────────────────────

export interface User {
  id: string;
  auth_id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  license_status: LicenseStatus;
  license_image_url: string | null;
  license_number: string | null;
  expertise_city: string | null;
  expertise_districts: string[];
  expertise_neighborhoods: Record<string, string[]>;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// ─── LISTING (Mülk Portföyü — kör, adres yok) ────────

export interface Listing {
  id: string;
  agent_id: string;
  city: string;
  transaction_type: TransactionType;
  property_type: PropertyType;
  district: string;
  neighborhood: string | null;
  room_count: string | null;
  net_area: number | null;
  gross_area: number | null;
  floor: number | null;
  total_floors: number | null;
  building_age: string | null;
  has_parking: boolean | null;
  has_elevator: boolean | null;
  heating_type: string | null;
  price: number;
  ada: string | null;
  parsel: string | null;
  description: string | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  agent?: User;
}

// ─── BUYER DEMAND (Alıcı Talep Havuzu) ───────────────

export interface BuyerDemand {
  id: string;
  agent_id: string;
  city: string;
  transaction_type: TransactionType;
  property_type: PropertyType;
  district: string;
  neighborhoods: string[];
  min_budget: number;
  max_budget: number;
  min_rooms: string | null;
  min_area: number | null;
  max_floor: number | null;
  building_ages: string[] | null;
  notes: string | null;
  status: DemandStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  agent?: User;
}

// ─── MATCH (İş Birliği) ──────────────────────────────

export interface Match {
  id: string;
  requester_id: string;
  target_id: string;
  match_type: MatchType;
  listing_id: string | null;
  demand_id: string | null;
  status: MatchStatus;
  message: string | null;
  responded_at: string | null;
  created_at: string;
  requester?: User;
  target?: User;
  listing?: Listing;
  demand?: BuyerDemand;
}

// ─── NOTIFICATION (Bildirim) ─────────────────────────

export type NotificationStatus = 'pending' | 'sent' | 'read' | 'digest';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  reference_id: string | null;
  status: NotificationStatus;
  read_at: string | null;
  created_at: string;
}

// ─── NEIGHBORHOOD PRICE (Mahalle Fiyat Endeksi) ──────

export interface NeighborhoodPrice {
  id: string;
  district: string;
  neighborhood: string;
  property_type: PropertyType;
  avg_price_per_sqm: number;
  sample_size: number | null;
  updated_at: string;
  updated_by: string | null;
}

// ─── DISTRICT ─────────────────────────────────────────

export type District =
  | 'Hepsi'
  | 'Kadıköy'
  | 'Beşiktaş'
  | 'Şişli'
  | 'Esenyurt'
  | 'Bakırköy'
  | 'Üsküdar'
  | 'Ataşehir'
  | 'Maltepe'
  | 'Beylikdüzü'
  | 'Sarıyer';
