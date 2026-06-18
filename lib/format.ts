import type { TransactionType, PropertyType } from '@/types';

// ─── Fiyat / Bütçe Formatlama ─────────────────────────

export function formatBudget(amount: number): string {
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return val % 1 === 0 ? `${val}M TL` : `${val.toFixed(1)}M TL`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K TL`;
  }
  return `${amount.toLocaleString('tr-TR')} TL`;
}

export function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    const val = price / 1_000_000;
    return `₺${val % 1 === 0 ? val : val.toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `₺${(price / 1_000).toFixed(0)}K`;
  }
  return `₺${price.toLocaleString('tr-TR')}`;
}

export function formatPriceInput(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('tr-TR');
}

// ─── Zaman Formatlama ─────────────────────────────────

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Az önce';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}dk`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}sa`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}g`;
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// ─── Etiketler ────────────────────────────────────────

export const TRANSACTION_LABELS: Record<TransactionType, string> = {
  SALE: 'Satılık',
  RENT: 'Kiralık',
};

export const PROPERTY_LABELS: Record<PropertyType, string> = {
  RESIDENTIAL: 'Konut',
  COMMERCIAL: 'Ticari',
  LAND: 'Arsa',
};

// ─── Yardımcılar ──────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
