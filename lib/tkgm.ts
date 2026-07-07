// TKGM CBS API Entegrasyonu
// Tapu ve Kadastro Genel Müdürlüğü — Parsel Sorgulama
// API: cbsapi.tkgm.gov.tr (ücretsiz, auth gerektirmez)

import type { Nitelik } from './valuation';

const TKGM_CBS_BASE = 'https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api';
const TKGM_PARSEL_BASE = 'https://parselsorgu.tkgm.gov.tr';
const TIMEOUT_MS = 10000;

export interface TkgmProvince {
  id: number;
  name: string;
}

export interface TkgmDistrict {
  id: number;
  name: string;
}

export interface TkgmNeighborhood {
  id: number;
  name: string;
}

export interface TkgmParcel {
  nitelik: string;
  alan: number;
  adaNo: string;
  parselNo: string;
  mahalleAd: string;
  ilceAd: string;
  ilAd: string;
  mevkii: string;
}

// ─── Fetch with timeout helper ──────────────────────

async function fetchWithTimeout(url: string, timeoutMs = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

// ─── İl Listesi ─────────────────────────────────────

export async function getProvinces(): Promise<TkgmProvince[]> {
  try {
    const res = await fetchWithTimeout(
      `${TKGM_PARSEL_BASE}/app/modules/administrativeQuery/data/ilListe.json`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    // GeoJSON FeatureCollection format
    if (data?.features) {
      return data.features
        .map((f: any) => ({ id: f.properties?.id, name: f.properties?.text }))
        .filter((p: any) => p.id && p.name)
        .sort((a: TkgmProvince, b: TkgmProvince) => a.name.localeCompare(b.name, 'tr'));
    }
    return [];
  } catch {
    return [];
  }
}

// ─── İlçe Listesi ───────────────────────────────────

export async function getDistricts(provinceId: number): Promise<TkgmDistrict[]> {
  try {
    const res = await fetchWithTimeout(
      `${TKGM_CBS_BASE}/idariYapi/ilceListe/${provinceId}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) {
      return data
        .map((d: any) => ({ id: d.id, name: d.ad || d.text }))
        .filter((d: any) => d.id && d.name)
        .sort((a: TkgmDistrict, b: TkgmDistrict) => a.name.localeCompare(b.name, 'tr'));
    }
    return [];
  } catch {
    return [];
  }
}

// ─── Mahalle Listesi ────────────────────────────────

export async function getNeighborhoods(districtId: number): Promise<TkgmNeighborhood[]> {
  try {
    const res = await fetchWithTimeout(
      `${TKGM_CBS_BASE}/idariYapi/mahalleListe/${districtId}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) {
      return data
        .map((n: any) => ({ id: n.id, name: n.ad || n.text }))
        .filter((n: any) => n.id && n.name)
        .sort((a: TkgmNeighborhood, b: TkgmNeighborhood) => a.name.localeCompare(b.name, 'tr'));
    }
    return [];
  } catch {
    return [];
  }
}

// ─── Parsel Sorgu ───────────────────────────────────

export async function queryParcel(
  neighborhoodId: number,
  adaNo: string,
  parselNo: string,
): Promise<TkgmParcel | null> {
  try {
    const res = await fetchWithTimeout(
      `${TKGM_CBS_BASE}/parsel/${neighborhoodId}/${adaNo}/${parselNo}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Response is GeoJSON Feature or FeatureCollection
    const feature = data?.type === 'Feature' ? data : data?.features?.[0];
    if (!feature?.properties) return null;
    const p = feature.properties;
    return {
      nitelik: p.nitelik || p.NITELIK || '',
      alan: parseFloat(p.alan || p.ALAN || '0') || 0,
      adaNo: String(p.adaNo || p.ADA_NO || adaNo),
      parselNo: String(p.parselNo || p.PARSEL_NO || parselNo),
      mahalleAd: p.mahalleAd || p.MAHALLE_AD || '',
      ilceAd: p.ilceAd || p.ILCE_AD || '',
      ilAd: p.ilAd || p.IL_AD || '',
      mevkii: p.mevkii || p.MEVKII || '',
    };
  } catch {
    return null;
  }
}

// ─── Nitelik Normalizasyonu ─────────────────────────
// TKGM nitelik string -> uygulamanin Nitelik tipi

const NITELIK_MAP: Record<string, Nitelik> = {
  'ARSA': 'arsa',
  'TARLA': 'tarla',
  'ZEYTİNLİK': 'zeytinlik',
  'ZEYTINLIK': 'zeytinlik',
  'BAHÇE': 'bahce',
  'BAHCE': 'bahce',
  'BAĞ': 'bag',
  'BAG': 'bag',
  'MERA': 'mera',
  'ÇAYIR': 'cayir',
  'CAYIR': 'cayir',
  'OTLAK': 'mera',
  'HAM TOPRAK': 'tarla',
  'HAMTOPRAK': 'tarla',
  'ORMAN': 'orman',
};

export function normalizeNitelik(tkgmNitelik: string): Nitelik {
  if (!tkgmNitelik) return 'diger';
  const upper = tkgmNitelik.toUpperCase().trim();
  return NITELIK_MAP[upper] ?? 'diger';
}
