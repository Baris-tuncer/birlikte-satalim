// ─── Değerleme & Hukuki Risk Analizi ─────────────────
// Saf fonksiyonlar — React bağımsız, side-effect yok.

import {
  getEarthquakeZone,
  getEarthquakeRiskLabel,
  isCoastalDistrict,
  isForestedDistrict,
  type EarthquakeZone,
} from './earthquake-zones';

// ─── Tipler ──────────────────────────────────────────

export type Nitelik =
  | 'tarla'
  | 'arsa'
  | 'zeytinlik'
  | 'bahce'
  | 'bag'
  | 'mera'
  | 'cayir'
  | 'orman'
  | 'diger';

export type TapuTipi = 'mustakil' | 'hisseli';
export type RiskLevel = 'RED' | 'YELLOW' | 'GREEN' | 'GRAY';

export interface LegalRiskResult {
  level: RiskLevel;
  rule: string;
  message: string;
  actionRequired: string;
}

export interface RiskAnalysisResult {
  overallLevel: RiskLevel;
  findings: LegalRiskResult[];
  earthquakeZone: EarthquakeZone | null;
  earthquakeLabel: string | null;
}

export interface ValuationResult {
  basePrice: number;
  hizliSatis: number;
  ucAylik: number;
  altiAylikMin: number;
  altiAylikMax: number;
}

// ─── Sabitler ────────────────────────────────────────

export const NITELIK_OPTIONS: { key: Nitelik; label: string }[] = [
  { key: 'arsa', label: 'Arsa' },
  { key: 'tarla', label: 'Tarla' },
  { key: 'zeytinlik', label: 'Zeytinlik' },
  { key: 'bahce', label: 'Bahçe' },
  { key: 'bag', label: 'Bağ' },
  { key: 'mera', label: 'Mera' },
  { key: 'cayir', label: 'Çayır / Otlak' },
  { key: 'orman', label: 'Orman' },
  { key: 'diger', label: 'Diğer' },
];

export const TAPU_TIPI_OPTIONS: { key: TapuTipi; label: string }[] = [
  { key: 'mustakil', label: 'Müstakil Tapu' },
  { key: 'hisseli', label: 'Hisseli Tapu' },
];

export const RISK_LEVEL_CONFIG: Record<
  RiskLevel,
  { color: string; icon: string; label: string }
> = {
  RED: { color: '#EF4444', icon: 'alert-circle', label: 'Yüksek Risk' },
  YELLOW: { color: '#F59E0B', icon: 'warning-outline', label: 'Orta Risk' },
  GREEN: { color: '#10B981', icon: 'checkmark-circle', label: 'Düşük Risk' },
  GRAY: { color: '#94A3B8', icon: 'help-circle-outline', label: 'Belirsiz' },
};

const RISK_PRIORITY: Record<RiskLevel, number> = {
  RED: 4,
  YELLOW: 3,
  GREEN: 2,
  GRAY: 1,
};

// ─── Kat Katsayısı ──────────────────────────────────

export type KatTipi = 'bodrum_zemin' | 'kat_1' | 'kat_2_7' | 'kat_8_plus' | 'cati_dubleks';

export const KAT_OPTIONS: { key: KatTipi; label: string; carpan: number }[] = [
  { key: 'bodrum_zemin', label: 'Bodrum / Zemin Kat', carpan: 0.90 },
  { key: 'kat_1', label: '1. Kat', carpan: 0.95 },
  { key: 'kat_2_7', label: '2–7. Kat (İdeal)', carpan: 1.05 },
  { key: 'kat_8_plus', label: '8+ Kat', carpan: 1.00 },
  { key: 'cati_dubleks', label: 'Çatı Katı / Dubleks', carpan: 1.08 },
];

// ─── Bina Yaşı Katsayısı ────────────────────────────

export type BinaYasi = 'yeni_0_5' | 'yeni_6_10' | 'orta_11_20' | 'eski_21_30' | 'eski_31_plus';

export const BINA_YASI_OPTIONS: { key: BinaYasi; label: string; carpan: number }[] = [
  { key: 'yeni_0_5', label: '0–5 Yıl (Sıfır / Yeni)', carpan: 1.10 },
  { key: 'yeni_6_10', label: '6–10 Yıl', carpan: 1.05 },
  { key: 'orta_11_20', label: '11–20 Yıl', carpan: 1.00 },
  { key: 'eski_21_30', label: '21–30 Yıl', carpan: 0.92 },
  { key: 'eski_31_plus', label: '31+ Yıl', carpan: 0.85 },
];

// ─── Manzara Katsayısı ──────────────────────────────

export type ManzaraTipi = 'deniz_bogaz' | 'gol_nehir' | 'sehir' | 'park_yesil' | 'manzara_yok';

export const MANZARA_OPTIONS: { key: ManzaraTipi; label: string; carpan: number }[] = [
  { key: 'deniz_bogaz', label: 'Deniz / Boğaz Manzarası', carpan: 1.17 },
  { key: 'gol_nehir', label: 'Göl / Nehir Manzarası', carpan: 1.10 },
  { key: 'sehir', label: 'Şehir Manzarası', carpan: 1.05 },
  { key: 'park_yesil', label: 'Park / Yeşil Alan', carpan: 1.05 },
  { key: 'manzara_yok', label: 'Manzara Yok / İç Cephe', carpan: 1.00 },
];

// ─── Bakım Durumu Katsayısı ─────────────────────────

export type BakimDurumu = 'sifir_tadilat' | 'bakimli' | 'normal' | 'bakimsiz';

export const BAKIM_OPTIONS: { key: BakimDurumu; label: string; carpan: number }[] = [
  { key: 'sifir_tadilat', label: 'Sıfır / Komple Tadilatlı', carpan: 1.10 },
  { key: 'bakimli', label: 'Bakımlı', carpan: 1.05 },
  { key: 'normal', label: 'Normal', carpan: 1.00 },
  { key: 'bakimsiz', label: 'Bakımsız / Tadilat Gerekli', carpan: 0.90 },
];

// ─── Özellikler (Ek Katsayılar) ─────────────────────

export type Ozellik = 'asansor' | 'otopark' | 'balkon_teras' | 'guvenlik_site' | 'havuz' | 'rezidans';

export const OZELLIK_OPTIONS: { key: Ozellik; label: string; carpan: number }[] = [
  { key: 'asansor', label: 'Asansör', carpan: 0.03 },
  { key: 'otopark', label: 'Kapalı Otopark', carpan: 0.05 },
  { key: 'balkon_teras', label: 'Balkon / Teras', carpan: 0.03 },
  { key: 'guvenlik_site', label: 'Güvenlik / Site İçi', carpan: 0.04 },
  { key: 'havuz', label: 'Havuz', carpan: 0.06 },
  { key: 'rezidans', label: 'Rezidans', carpan: 0.08 },
];

// ─── Mahalle Prestiji ───────────────────────────────

export type MahallePrestiji = 'cok_yuksek' | 'yuksek' | 'orta' | 'dusuk';

export const PRESTIJ_OPTIONS: { key: MahallePrestiji; label: string; carpan: number }[] = [
  { key: 'cok_yuksek', label: 'Çok Yüksek (Caddebostan, Etiler vb.)', carpan: 1.15 },
  { key: 'yuksek', label: 'Yüksek Prestij', carpan: 1.08 },
  { key: 'orta', label: 'Orta Prestij', carpan: 1.00 },
  { key: 'dusuk', label: 'Düşük Prestij', carpan: 0.92 },
];

// ─── Konum Kalitesi Çarpanı (Şerefiye) ─────────────

export type KonumKalitesi = 'ana_cadde' | 'ara_sokak' | 'site_ici' | 'normal';

export const KONUM_KALITESI_OPTIONS: { key: KonumKalitesi; label: string; carpan: number }[] = [
  { key: 'ana_cadde', label: 'Ana Cadde / Bulvar Cephesi', carpan: 1.15 },
  { key: 'site_ici', label: 'Site İçi / Kapalı Yerleşke', carpan: 1.10 },
  { key: 'normal', label: 'Normal Konum', carpan: 1.00 },
  { key: 'ara_sokak', label: 'Ara Sokak / İç Kısım', carpan: 0.90 },
];

export function getKonumCarpani(konum: KonumKalitesi): number {
  return KONUM_KALITESI_OPTIONS.find((o) => o.key === konum)?.carpan ?? 1.0;
}

// ─── Değerleme Hesaplama ─────────────────────────────

export interface DegerlemeOptions {
  kat?: KatTipi;
  binaYasi?: BinaYasi;
  manzara?: ManzaraTipi;
  bakimDurumu?: BakimDurumu;
  ozellikler?: Ozellik[];
  mahallePrestiji?: MahallePrestiji;
}

export interface DegerlemeDetay {
  label: string;
  carpan: number;
}

export interface ValuationResultDetailed extends ValuationResult {
  detaylar: DegerlemeDetay[];
  toplamCarpan: number;
}

export function hesaplaDegerleme(
  m2Fiyat: number,
  yuzolcumu: number,
  konumKalitesi: KonumKalitesi = 'normal',
  options?: DegerlemeOptions,
): ValuationResultDetailed {
  const detaylar: DegerlemeDetay[] = [];

  // 1. Konum kalitesi
  const konumCarpan = getKonumCarpani(konumKalitesi);
  if (konumCarpan !== 1.0) {
    const lbl = KONUM_KALITESI_OPTIONS.find((o) => o.key === konumKalitesi)?.label ?? '';
    detaylar.push({ label: `Konum: ${lbl}`, carpan: konumCarpan });
  }

  // 2. Kat
  if (options?.kat) {
    const opt = KAT_OPTIONS.find((o) => o.key === options.kat);
    if (opt && opt.carpan !== 1.0) {
      detaylar.push({ label: `Kat: ${opt.label}`, carpan: opt.carpan });
    }
  }

  // 3. Bina yaşı
  if (options?.binaYasi) {
    const opt = BINA_YASI_OPTIONS.find((o) => o.key === options.binaYasi);
    if (opt && opt.carpan !== 1.0) {
      detaylar.push({ label: `Bina Yaşı: ${opt.label}`, carpan: opt.carpan });
    }
  }

  // 4. Manzara
  if (options?.manzara) {
    const opt = MANZARA_OPTIONS.find((o) => o.key === options.manzara);
    if (opt && opt.carpan !== 1.0) {
      detaylar.push({ label: `Manzara: ${opt.label}`, carpan: opt.carpan });
    }
  }

  // 5. Bakım durumu
  if (options?.bakimDurumu) {
    const opt = BAKIM_OPTIONS.find((o) => o.key === options.bakimDurumu);
    if (opt && opt.carpan !== 1.0) {
      detaylar.push({ label: `Bakım: ${opt.label}`, carpan: opt.carpan });
    }
  }

  // 6. Mahalle prestiji
  if (options?.mahallePrestiji) {
    const opt = PRESTIJ_OPTIONS.find((o) => o.key === options.mahallePrestiji);
    if (opt && opt.carpan !== 1.0) {
      detaylar.push({ label: `Prestij: ${opt.label}`, carpan: opt.carpan });
    }
  }

  // 7. Özellikler (toplanır)
  const ozellikCarpan = (options?.ozellikler ?? []).reduce((sum, key) => {
    const opt = OZELLIK_OPTIONS.find((o) => o.key === key);
    return sum + (opt?.carpan ?? 0);
  }, 0);
  if (ozellikCarpan > 0) {
    const labels = (options?.ozellikler ?? [])
      .map((k) => OZELLIK_OPTIONS.find((o) => o.key === k)?.label)
      .filter(Boolean)
      .join(', ');
    detaylar.push({ label: `Özellikler: ${labels}`, carpan: 1 + ozellikCarpan });
  }

  // Toplam çarpan: çarpanların hepsini çarp
  const toplamCarpan = detaylar.reduce((acc, d) => acc * d.carpan, 1.0);
  // Hiç detay yoksa konumKalitesi de 1.0 olabilir
  const finalCarpan = detaylar.length > 0 ? toplamCarpan : konumCarpan;

  const adjustedM2 = m2Fiyat * finalCarpan;
  const basePrice = adjustedM2 * yuzolcumu;

  return {
    basePrice: Math.round(basePrice),
    hizliSatis: Math.round(basePrice * 0.85),
    ucAylik: Math.round(basePrice * 0.95),
    altiAylikMin: Math.round(basePrice),
    altiAylikMax: Math.round(basePrice * 1.05),
    detaylar,
    toplamCarpan: finalCarpan,
  };
}

// ─── Hukuki Risk Analizi (Çoklu Kural Motoru) ───────

interface RiskAnalysisParams {
  nitelik: Nitelik;
  yuzolcumu: number;
  tapuTipi: TapuTipi;
  city?: string;
  district?: string;
}

export function analizEtHukukiRisk(params: RiskAnalysisParams): RiskAnalysisResult {
  const { nitelik, yuzolcumu, tapuTipi, city, district } = params;
  const findings: LegalRiskResult[] = [];

  // ── Nitelik Bazlı Kurallar ──

  // Kural 1: Zeytinlik — mutlak koruma
  if (nitelik === 'zeytinlik') {
    findings.push({
      level: 'RED',
      rule: '3573 Sayılı Zeytinciliğin Islahı Hakkında Kanun',
      message:
        'Zeytinlik vasfındaki taşınmazlar özel koruma altındadır. Zeytinlik alanlar içinde yapı izni verilememekte ve kullanım amacı değiştirilememektedir.',
      actionRequired:
        'Bu taşınmazın satışında Tarım Bakanlığı onayı ve uzman tarım avukatı desteği gereklidir.',
    });
  }

  // Kural 2: Mera / Çayır / Otlak — devlet malı
  if (nitelik === 'mera' || nitelik === 'cayir') {
    findings.push({
      level: 'RED',
      rule: '4342 Sayılı Mera Kanunu',
      message:
        'Mera, çayır ve otlak arazileri devletin hüküm ve tasarrufu altındadır. Özel mülkiyete konu olamazlar ve satılamaz, devredilemez, zamanaşımı ile iktisap edilemezler.',
      actionRequired:
        'Tapu kaydını ve nitelik değişikliği olup olmadığını Tapu Müdürlüğü\'nden kontrol edin. Mera tahsis amacı değişikliği için İl Özel İdaresi\'ne başvurun.',
    });
  }

  // Kural 3: Orman — mutlak koruma
  if (nitelik === 'orman') {
    findings.push({
      level: 'RED',
      rule: '6831 Sayılı Orman Kanunu, Anayasa Md. 169-170',
      message:
        'Orman vasfındaki taşınmazlar devlet ormanı statüsünde olup satışa konu olamazlar. 2B arazisi olarak orman dışına çıkarılmış olsa dahi özel kısıtlamalar mevcuttur.',
      actionRequired:
        '2B belgesi ve orman kadastro durumunu Orman Bölge Müdürlüğü\'nden sorgulayın. Tapu kaydındaki şerhleri kontrol edin.',
    });
  }

  // Kural 4: Küçük tarla — bölünemez
  if (nitelik === 'tarla' && yuzolcumu < 5000) {
    findings.push({
      level: 'RED',
      rule: '5403 Sayılı Toprak Koruma ve Arazi Kullanımı Kanunu, Md. 8/a',
      message:
        'Tarım arazileri 5.000 m²\'den küçük parçalara bölünemez. Bu taşınmazın devri teknik olarak mümkün olmayabilir.',
      actionRequired:
        'Tapu Müdürlüğü veya İl Tarım Müdürlüğü ile teyit edin. Bölünme izni alınıp alınamayacağını sorgulayın.',
    });
  }

  // Kural 5: Küçük bahçe — tarım arazisi kısıtlaması
  if (nitelik === 'bahce' && yuzolcumu < 5000) {
    findings.push({
      level: 'RED',
      rule: '5403 Sayılı Toprak Koruma ve Arazi Kullanımı Kanunu, Md. 8/a',
      message:
        'Bahçe vasfındaki tarım arazileri de 5.000 m²\'den küçük parçalara bölünemez. Minimum tarım arazisi büyüklüğü kuralı geçerlidir.',
      actionRequired:
        'İl Tarım Müdürlüğü\'nden arazi kullanım izni ve bölünme durumunu sorgulayın.',
    });
  }

  // Kural 6: Bağ — tarım arazisi kısıtlamaları
  if (nitelik === 'bag') {
    findings.push({
      level: 'YELLOW',
      rule: '5403 Sayılı Toprak Koruma ve Arazi Kullanımı Kanunu',
      message:
        'Bağ vasfındaki taşınmazlar tarım arazisi statüsünde olup kullanım amacı değişikliği kısıtlamalara tabidir. İmar planı dışında yapılaşma izni verilmez.',
      actionRequired:
        'Belediyeden imar durumu belgesi alın. Tarım dışı kullanım için İl Tarım Müdürlüğü izni gereklidir.',
    });
  }

  // ── Tapu Tipi Kuralları ──

  // Kural 7: Hisseli tarla — ön alım hakkı
  if (nitelik === 'tarla' && tapuTipi === 'hisseli') {
    findings.push({
      level: 'YELLOW',
      rule: '4721 Sayılı TMK, Md. 732 — Ön Alım Hakkı',
      message:
        'Hisseli tarla satışında diğer hissedarların yasal ön alım hakkı bulunmaktadır. Satış öncesinde hissedarlar noter aracılığıyla bilgilendirilmelidir.',
      actionRequired:
        'Diğer hissedarların ön alım hakkından vazgeçtiğine dair noter beyannamesi alın.',
    });
  }

  // Kural 8: Hisseli arsa — ön alım hakkı
  if (nitelik === 'arsa' && tapuTipi === 'hisseli') {
    findings.push({
      level: 'YELLOW',
      rule: '4721 Sayılı TMK, Md. 732 — Ön Alım Hakkı',
      message:
        'Hisseli arsa satışında diğer hissedarların yasal ön alım hakkı bulunmaktadır. Satış sonrası 3 ay içinde dava açılabilir.',
      actionRequired:
        'Hissedarları noter kanalıyla bilgilendirin. Mümkünse ön alım hakkından feragat belgesi alın.',
    });
  }

  // Kural 9: Hisseli bahçe/bağ — ön alım hakkı
  if ((nitelik === 'bahce' || nitelik === 'bag') && tapuTipi === 'hisseli') {
    findings.push({
      level: 'YELLOW',
      rule: '4721 Sayılı TMK, Md. 732 — Ön Alım Hakkı',
      message:
        'Hisseli tarım arazisi satışında diğer hissedarların yasal ön alım hakkı mevcuttur.',
      actionRequired:
        'Hissedarları noter kanalıyla bilgilendirin ve ön alım hakkından feragat belgesi talep edin.',
    });
  }

  // Kural 10: Büyük tarla — özel inceleme
  if (nitelik === 'tarla' && yuzolcumu > 200000) {
    findings.push({
      level: 'YELLOW',
      rule: 'Büyük Ölçekli Tarım Arazisi — Özel İnceleme',
      message:
        '200 dönümü aşan tarım arazilerinin devri için Tarım Bakanlığı\'nın ön izni gerekebilir. Yabancıya satış durumunda ek kısıtlamalar söz konusudur.',
      actionRequired:
        'İl Tarım Müdürlüğü\'nden satış uygunluk belgesi alın. Yabancıya satış durumunda Valilik izni kontrol edin.',
    });
  }

  // ── Konum Bazlı Kurallar ──

  if (city && district) {
    // Kural 11: Deprem bölgesi
    const eqZone = getEarthquakeZone(city, district);
    if (eqZone === 1) {
      findings.push({
        level: 'YELLOW',
        rule: 'AFAD Deprem Tehlike Haritası — 1. Derece Bölge',
        message:
          `${district}, ${city} — Çok yüksek deprem tehlikesi bölgesinde yer almaktadır. Yapısal dayanıklılık ve deprem sigortası (DASK) durumu önem taşır.`,
        actionRequired:
          'Binanın deprem yönetmeliğine uygun olup olmadığını kontrol edin. Güncel DASK poliçesi olduğundan emin olun. Zemin etüt raporu isteyin.',
      });
    } else if (eqZone === 2) {
      findings.push({
        level: 'YELLOW',
        rule: 'AFAD Deprem Tehlike Haritası — 2. Derece Bölge',
        message:
          `${district}, ${city} — Yüksek deprem tehlikesi bölgesinde yer almaktadır.`,
        actionRequired:
          'DASK poliçesi ve yapı güvenliği belgelerini kontrol edin.',
      });
    }

    // Kural 12: Kıyı ilçesi
    if (isCoastalDistrict(city, district)) {
      findings.push({
        level: 'YELLOW',
        rule: '3621 Sayılı Kıyı Kanunu',
        message:
          `${district} kıyı ilçesidir. Kıyı şeridinde (deniz kenarından 100m) yapılaşma kısıtlamaları mevcuttur. Sahil şeridinde (100-200m) ise özel koşullara tabidir.`,
        actionRequired:
          'Taşınmazın kıyı kenar çizgisine olan mesafesini belirleyin. Belediyeden imar durumu ve kıyı şeridi durumunu sorgulayın.',
      });
    }

    // Kural 13: Orman bölgesi ilçe
    if (isForestedDistrict(city, district)) {
      findings.push({
        level: 'YELLOW',
        rule: '6831 Sayılı Orman Kanunu — Bölge Uyarısı',
        message:
          `${district} orman alanlarının yoğun olduğu bir ilçedir. Taşınmazın orman kadastrosu, 2B durumu ve orman sınırlarına yakınlığı kontrol edilmelidir.`,
        actionRequired:
          'Orman Bölge Müdürlüğü\'nden orman kadastro haritası ile karşılaştırma yapın. Tapu kaydındaki şerhleri kontrol edin.',
      });
    }
  }

  // ── Düşük Risk (Olumlu) Kurallar ──

  // Kural 14: İmarlı arsa — düşük risk
  if (nitelik === 'arsa' && tapuTipi === 'mustakil') {
    findings.push({
      level: 'GREEN',
      rule: 'İmar Mevzuatı',
      message:
        'Müstakil tapulu, imarlı arsa niteliğindeki taşınmazlar düşük hukuki risk taşır.',
      actionRequired:
        'Belediyeden güncel imar durumu belgesi ve tapu kütüğü sorgulaması yapın.',
    });
  }

  // ── Belirsiz ──

  // Kural 15: Tanımsız/diğer nitelik
  if (nitelik === 'diger') {
    findings.push({
      level: 'GRAY',
      rule: '—',
      message:
        'Seçilen nitelik için otomatik risk değerlendirmesi yapılamadı. Manuel inceleme gereklidir.',
      actionRequired:
        'Hukuk danışmanına veya Tapu Müdürlüğüne başvurun.',
    });
  }

  // Hiç bulgu yoksa genel düşük risk
  if (findings.length === 0) {
    findings.push({
      level: 'GREEN',
      rule: 'Genel Değerlendirme',
      message: 'Bu taşınmaz için belirgin hukuki risk tespit edilmedi.',
      actionRequired: 'Standart tapu ve imar kontrollerini yaptırın.',
    });
  }

  // Deprem bilgisi
  const eqZone = city && district ? getEarthquakeZone(city, district) : null;
  const eqLabel = eqZone ? getEarthquakeRiskLabel(eqZone) : null;

  // Genel risk seviyesi: en yüksek risk
  const overallLevel = findings.reduce<RiskLevel>((max, f) => {
    return RISK_PRIORITY[f.level] > RISK_PRIORITY[max] ? f.level : max;
  }, 'GREEN');

  return {
    overallLevel,
    findings,
    earthquakeZone: eqZone,
    earthquakeLabel: eqLabel,
  };
}
