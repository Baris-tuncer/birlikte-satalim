import type { District, TransactionType, PropertyType } from '@/types';

// ─── İlçeler ──────────────────────────────────────────

export const DISTRICTS: District[] = [
  'Hepsi',
  'Kadıköy',
  'Beşiktaş',
  'Şişli',
  'Esenyurt',
  'Bakırköy',
  'Üsküdar',
  'Ataşehir',
  'Maltepe',
  'Beylikdüzü',
  'Sarıyer',
];

// ─── Kadıköy Mahalleleri (Pilot) ──────────────────────

export const KADIKOY_NEIGHBORHOODS = [
  'Caferağa',
  'Moda',
  'Fenerbahçe',
  'Göztepe',
  'Kozyatağı',
  'Bostancı',
  'Suadiye',
  'Erenköy',
  'Caddebostan',
  'Acıbadem',
  'Hasanpaşa',
  'Rasimpaşa',
  'Osmanağa',
  'Yeldeğirmeni',
  'Fikirtepe',
];

// ─── İşlem Tipleri ────────────────────────────────────

export const TRANSACTION_TYPES: { key: TransactionType; label: string }[] = [
  { key: 'SALE', label: 'Satılık' },
  { key: 'RENT', label: 'Kiralık' },
];

// ─── Mülk Tipleri ─────────────────────────────────────

export const PROPERTY_TYPES: { key: PropertyType; label: string }[] = [
  { key: 'RESIDENTIAL', label: 'Konut' },
  { key: 'COMMERCIAL', label: 'Ticari' },
  { key: 'LAND', label: 'Arsa' },
];

// ─── Oda Sayıları ─────────────────────────────────────

export const ROOM_OPTIONS = [
  'Stüdyo',
  '1+0',
  '1+1',
  '2+0',
  '2+1',
  '3+1',
  '3+2',
  '4+1',
  '4+2',
  '5+1',
  '5+2',
  '6+',
];

// ─── Isıtma Tipleri ───────────────────────────────────

export const HEATING_TYPES = [
  'Doğalgaz (Kombi)',
  'Doğalgaz (Kat Kalörifer)',
  'Merkezi Sistem',
  'Soba',
  'Klima',
  'Yerden Isıtma',
  'Yok',
];
