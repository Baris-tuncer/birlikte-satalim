import type { TransactionType, PropertyType } from '@/types';

// ─── Fiyat / Bütçe Formatlama ─────────────────────────

export function formatBudget(amount: number | null | undefined): string {
  if (amount == null) return '—';
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return val % 1 === 0 ? `${val}M TL` : `${val.toFixed(1)}M TL`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K TL`;
  }
  return `${amount.toLocaleString('tr-TR')} TL`;
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '—';
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

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (isNaN(seconds)) return '—';
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
  URBAN_RENEWAL: 'Kentsel Dönüşüm',
};

// ─── Doğrulama ───────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value);
}

// ─── Yardımcılar ──────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── İçerik Filtresi ──────────────────────────────

const BLOCKED_WORDS = [
  'amına', 'ananı', 'orospu', 'siktir', 'sikerim',
  'götveren', 'pezevenk', 'kahpe', 'gerizekalı',
  'yavşak', 'şerefsiz', 'haysiyetsiz',
];

// Kısa kelimeler — sadece bağımsız kelime olarak eşleşmeli (substring olarak değil)
const BLOCKED_WORDS_EXACT = [
  'amk', 'piç', 'ibne', 'salak', 'aptal',
];

const PHONE_RE = /(?:\+?90|0)[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/;
const EMAIL_RE = /[\w.-]+@[\w.-]+\.\w{2,}/;
const URL_RE = /https?:\/\/\S+|www\.\S+/i;

// Türkçe karakterler \b ile çalışmaz, bu yüzden kelime sınırını elle kontrol ediyoruz
const WORD_CHARS = new Set('abcçdefgğhıijklmnoöprsştuüvyzqwx0123456789');

function isWordBoundary(text: string, start: number, end: number): boolean {
  const before = start > 0 ? text[start - 1] : ' ';
  const after = end < text.length ? text[end] : ' ';
  return !WORD_CHARS.has(before) && !WORD_CHARS.has(after);
}

/**
 * Checks user-generated text for objectionable content.
 * Returns an error message if content is rejected, null if clean.
 */
export function checkContent(text: string): string | null {
  if (!text) return null;
  const lower = text.toLocaleLowerCase('tr');

  // Uzun/belirgin küfürler — substring yeterli
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return 'Açıklama uygunsuz ifade içeriyor. Lütfen düzenleyin.';
    }
  }

  // Kısa kelimeler — kelime sınırı kontrolü ile
  for (const word of BLOCKED_WORDS_EXACT) {
    let idx = lower.indexOf(word);
    while (idx !== -1) {
      if (isWordBoundary(lower, idx, idx + word.length)) {
        return 'Açıklama uygunsuz ifade içeriyor. Lütfen düzenleyin.';
      }
      idx = lower.indexOf(word, idx + 1);
    }
  }

  if (PHONE_RE.test(text)) {
    return 'Açıklamaya telefon numarası yazılamaz. İletişim bilgileri eşleşme sonrası paylaşılır.';
  }

  if (EMAIL_RE.test(text)) {
    return 'Açıklamaya e-posta adresi yazılamaz. İletişim bilgileri eşleşme sonrası paylaşılır.';
  }

  if (URL_RE.test(text)) {
    return 'Açıklamaya link eklenemez.';
  }

  return null;
}

// ─── MYK QR Kod Parse ──────────────────────────────

export function parseMYKQRData(qrData: string): string | null {
  // MYK QR kodu genelde URL veya belge numarası içerir
  // Örnek: "YB0203/17UY0333-5/00/724" veya URL içinde bu bilgi
  // URL varsa parametrelerden belge no çıkar
  try {
    if (qrData.startsWith('http')) {
      const url = new URL(qrData);
      // myk.gov.tr/dogrula?belgeNo=... veya benzer parametre
      const belgeNo = url.searchParams.get('belgeNo')
        || url.searchParams.get('belgeno')
        || url.searchParams.get('no')
        || url.searchParams.get('documentNo');
      if (belgeNo) return belgeNo;
      // URL path'inde belge no olabilir
      const pathMatch = url.pathname.match(/([A-Z]{2}\d{4}\/[\w\-\/]+)/);
      if (pathMatch) return pathMatch[1];
    }
    // Direkt belge numarası formatı: YB0203/17UY0333-5/00/724
    const directMatch = qrData.match(/[A-Z]{2}\d{4}\/[\w\-\/]+/);
    if (directMatch) return directMatch[0];
    // Herhangi bir alfanumerik seri numarası
    const serialMatch = qrData.match(/[\w\-\/]{8,}/);
    if (serialMatch) return serialMatch[0];
    return qrData.trim() || null;
  } catch {
    return qrData.trim() || null;
  }
}
