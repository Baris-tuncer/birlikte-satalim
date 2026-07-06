// ─── Tapu Harcı & Kredi Hesaplama ─────────────────────

// ─── Tipler ──────────────────────────────────────────

export interface TapuHarciConfig {
  alici_oran: number;
  satici_oran: number;
  doner_sermaye: number;
}

export interface KrediFaizConfig {
  varsayilan_aylik_oran: number;
  min_vade: number;
  max_vade: number;
}

export interface TapuHarciResult {
  alici_harci: number;
  satici_harci: number;
  doner_sermaye: number;
  toplam_alici: number;
  toplam_satici: number;
  toplam_maliyet: number;
}

export interface KrediResult {
  aylik_taksit: number;
  toplam_odeme: number;
  toplam_faiz: number;
  kredi_tutari: number;
}

export interface AmortizationRow {
  ay: number;
  taksit: number;
  anapara: number;
  faiz: number;
  kalan_borc: number;
}

// ─── Varsayılan Değerler (DB erişimi yoksa) ──────────

export const DEFAULT_TAPU_HARCI_CONFIG: TapuHarciConfig = {
  alici_oran: 0.02,
  satici_oran: 0.02,
  doner_sermaye: 3500,
};

export const DEFAULT_KREDI_FAIZ_CONFIG: KrediFaizConfig = {
  varsayilan_aylik_oran: 0.0279,
  min_vade: 12,
  max_vade: 120,
};

// ─── Hesaplama Fonksiyonları ─────────────────────────

export function hesaplaTapuHarci(
  satisFiyati: number,
  config: TapuHarciConfig,
): TapuHarciResult {
  const alici_harci = Math.round(satisFiyati * config.alici_oran);
  const satici_harci = Math.round(satisFiyati * config.satici_oran);
  const { doner_sermaye } = config;

  return {
    alici_harci,
    satici_harci,
    doner_sermaye,
    toplam_alici: alici_harci + doner_sermaye,
    toplam_satici: satici_harci,
    toplam_maliyet: alici_harci + satici_harci + doner_sermaye,
  };
}

/**
 * Kredi taksit hesapla (annüite formülü).
 * Aylık taksit = P × [r × (1+r)^n] / [(1+r)^n − 1]
 */
export function hesaplaKredi(
  emlakFiyati: number,
  pesinOdeme: number,
  vadeSuresi: number,
  aylikFaizOrani: number,
): KrediResult {
  const kredi_tutari = emlakFiyati - pesinOdeme;

  if (kredi_tutari <= 0) {
    return { aylik_taksit: 0, toplam_odeme: 0, toplam_faiz: 0, kredi_tutari: 0 };
  }

  if (aylikFaizOrani === 0) {
    const aylik_taksit = kredi_tutari / vadeSuresi;
    return {
      aylik_taksit: Math.round(aylik_taksit),
      toplam_odeme: kredi_tutari,
      toplam_faiz: 0,
      kredi_tutari,
    };
  }

  const r = aylikFaizOrani;
  const n = vadeSuresi;
  const rn = Math.pow(1 + r, n);
  const aylik_taksit = kredi_tutari * (r * rn) / (rn - 1);
  const toplam_odeme = aylik_taksit * n;
  const toplam_faiz = toplam_odeme - kredi_tutari;

  return {
    aylik_taksit: Math.round(aylik_taksit),
    toplam_odeme: Math.round(toplam_odeme),
    toplam_faiz: Math.round(toplam_faiz),
    kredi_tutari,
  };
}

export function hesaplaAmortisman(
  krediTutari: number,
  vadeSuresi: number,
  aylikFaizOrani: number,
): AmortizationRow[] {
  if (krediTutari <= 0 || vadeSuresi <= 0) return [];

  const r = aylikFaizOrani;
  const n = vadeSuresi;

  let taksit: number;
  if (r === 0) {
    taksit = krediTutari / n;
  } else {
    const rn = Math.pow(1 + r, n);
    taksit = krediTutari * (r * rn) / (rn - 1);
  }

  const rows: AmortizationRow[] = [];
  let kalanBorc = krediTutari;

  for (let ay = 1; ay <= n; ay++) {
    const faiz = kalanBorc * r;
    const anapara = taksit - faiz;
    kalanBorc = Math.max(0, kalanBorc - anapara);

    rows.push({
      ay,
      taksit: Math.round(taksit),
      anapara: Math.round(anapara),
      faiz: Math.round(faiz),
      kalan_borc: Math.round(kalanBorc),
    });
  }

  return rows;
}
