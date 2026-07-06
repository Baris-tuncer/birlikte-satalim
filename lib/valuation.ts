// ─── Değerleme & Hukuki Risk Analizi ─────────────────
// Saf fonksiyonlar — React bağımsız, side-effect yok.

// ─── Tipler ──────────────────────────────────────────

export type Nitelik = 'tarla' | 'arsa' | 'zeytinlik' | 'bahce' | 'diger';
export type TapuTipi = 'mustakil' | 'hisseli';
export type RiskLevel = 'RED' | 'YELLOW' | 'GREEN' | 'GRAY';

export interface LegalRiskResult {
  level: RiskLevel;
  rule: string;
  message: string;
  actionRequired: string;
}

export interface ValuationResult {
  basePrice: number;
  hizliSatis: number;
  ucAylik: number;
  altiAylikMin: number;
  altiAylikMax: number;
}

// ─── Sabitler ────────────────────────────────────────

export const NITELIK_OPTIONS = [
  { key: 'tarla' as Nitelik, label: 'Tarla' },
  { key: 'arsa' as Nitelik, label: 'Arsa' },
  { key: 'zeytinlik' as Nitelik, label: 'Zeytinlik' },
  { key: 'bahce' as Nitelik, label: 'Bahçe' },
  { key: 'diger' as Nitelik, label: 'Diğer' },
];

export const TAPU_TIPI_OPTIONS = [
  { key: 'mustakil' as TapuTipi, label: 'Müstakil Tapu' },
  { key: 'hisseli' as TapuTipi, label: 'Hisseli Tapu' },
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

// ─── İlçe Bazlı Statik Fiyat Verisi (Konut m²/TL) ──
// Kaynak: Halka açık emlak endeksleri (Haziran 2026)
// Danışman bu değeri görecek ama isterse düzeltebilecek.

export const DISTRICT_PRICES: Record<string, Record<string, number>> = {
  'İstanbul': {
    'Adalar': 75000,
    'Arnavutköy': 42000,
    'Ataşehir': 80000,
    'Avcılar': 45000,
    'Bağcılar': 42000,
    'Bahçelievler': 55000,
    'Bakırköy': 118000,
    'Başakşehir': 72000,
    'Bayrampaşa': 52000,
    'Beşiktaş': 169000,
    'Beykoz': 85000,
    'Beylikdüzü': 52000,
    'Beyoğlu': 88000,
    'Büyükçekmece': 48000,
    'Çatalca': 28000,
    'Çekmeköy': 48000,
    'Esenler': 38000,
    'Esenyurt': 32000,
    'Eyüpsultan': 55000,
    'Fatih': 72000,
    'Gaziosmanpaşa': 42000,
    'Güngören': 48000,
    'Kadıköy': 148000,
    'Kağıthane': 62000,
    'Kartal': 65000,
    'Küçükçekmece': 48000,
    'Maltepe': 68000,
    'Pendik': 52000,
    'Sancaktepe': 45000,
    'Sarıyer': 162000,
    'Silivri': 30000,
    'Sultanbeyli': 35000,
    'Sultangazi': 40000,
    'Şile': 32000,
    'Şişli': 95000,
    'Tuzla': 52000,
    'Ümraniye': 65000,
    'Üsküdar': 96000,
    'Zeytinburnu': 72000,
  },
  'Ankara': {
    'Akyurt': 15000,
    'Altındağ': 22000,
    'Ayaş': 12000,
    'Bala': 10000,
    'Beypazarı': 14000,
    'Çamlıdere': 10000,
    'Çankaya': 58000,
    'Çubuk': 16000,
    'Elmadağ': 14000,
    'Etimesgut': 35000,
    'Evren': 8000,
    'Gölbaşı': 38000,
    'Güdül': 10000,
    'Haymana': 10000,
    'Kahramankazan': 18000,
    'Kalecik': 10000,
    'Keçiören': 28000,
    'Kızılcahamam': 12000,
    'Mamak': 22000,
    'Nallıhan': 10000,
    'Polatlı': 15000,
    'Pursaklar': 25000,
    'Sincan': 22000,
    'Şereflikoçhisar': 10000,
    'Yenimahalle': 42000,
  },
  'İzmir': {
    'Aliağa': 30000,
    'Balçova': 62000,
    'Bayındır': 18000,
    'Bayraklı': 48000,
    'Bergama': 18000,
    'Beydağ': 12000,
    'Bornova': 52000,
    'Buca': 42000,
    'Çeşme': 85000,
    'Çiğli': 38000,
    'Dikili': 25000,
    'Foça': 35000,
    'Gaziemir': 42000,
    'Güzelbahçe': 72000,
    'Karabağlar': 38000,
    'Karaburun': 30000,
    'Karşıyaka': 65000,
    'Kemalpaşa': 25000,
    'Kınık': 12000,
    'Kiraz': 12000,
    'Konak': 55000,
    'Menderes': 28000,
    'Menemen': 25000,
    'Narlıdere': 72000,
    'Ödemiş': 18000,
    'Seferihisar': 42000,
    'Selçuk': 25000,
    'Tire': 18000,
    'Torbalı': 25000,
    'Urla': 65000,
  },
  'Bursa': {
    'Büyükorhan': 10000,
    'Gemlik': 28000,
    'Gürsu': 22000,
    'Harmancık': 8000,
    'İnegöl': 22000,
    'İznik': 18000,
    'Karacabey': 15000,
    'Keles': 8000,
    'Kestel': 22000,
    'Mudanya': 35000,
    'Mustafakemalpaşa': 14000,
    'Nilüfer': 48000,
    'Orhaneli': 10000,
    'Orhangazi': 22000,
    'Osmangazi': 38000,
    'Yenişehir': 15000,
    'Yıldırım': 28000,
  },
  'Antalya': {
    'Akseki': 12000,
    'Aksu': 32000,
    'Alanya': 55000,
    'Demre': 22000,
    'Döşemealtı': 28000,
    'Elmalı': 12000,
    'Finike': 22000,
    'Gazipaşa': 25000,
    'Gündoğmuş': 10000,
    'İbradı': 10000,
    'Kaş': 55000,
    'Kemer': 52000,
    'Kepez': 35000,
    'Konyaaltı': 62000,
    'Korkuteli': 14000,
    'Kumluca': 18000,
    'Manavgat': 35000,
    'Muratpaşa': 68000,
    'Serik': 28000,
  },
  'Balıkesir': {
    'Altıeylül': 25000,
    'Ayvalık': 35000,
    'Balya': 8000,
    'Bandırma': 25000,
    'Bigadiç': 10000,
    'Burhaniye': 28000,
    'Dursunbey': 10000,
    'Edremit': 32000,
    'Erdek': 28000,
    'Gömeç': 25000,
    'Gönen': 14000,
    'Havran': 12000,
    'İvrindi': 8000,
    'Karesi': 22000,
    'Kepsut': 8000,
    'Manyas': 10000,
    'Marmara': 20000,
    'Savaştepe': 10000,
    'Sındırgı': 10000,
    'Susurluk': 14000,
  },
  'Kocaeli': {
    'Başiskele': 32000,
    'Çayırova': 28000,
    'Darıca': 30000,
    'Derince': 28000,
    'Dilovası': 22000,
    'Gebze': 35000,
    'Gölcük': 25000,
    'İzmit': 35000,
    'Kandıra': 15000,
    'Karamürsel': 22000,
    'Kartepe': 28000,
    'Körfez': 25000,
  },
  'Mersin': {
    'Akdeniz': 22000,
    'Anamur': 18000,
    'Aydıncık': 12000,
    'Bozyazı': 15000,
    'Çamlıyayla': 10000,
    'Erdemli': 22000,
    'Gülnar': 10000,
    'Mezitli': 35000,
    'Mut': 12000,
    'Silifke': 18000,
    'Tarsus': 20000,
    'Toroslar': 25000,
    'Yenişehir': 32000,
  },
  'Muğla': {
    'Bodrum': 95000,
    'Dalaman': 28000,
    'Datça': 55000,
    'Fethiye': 55000,
    'Kavaklıdere': 12000,
    'Köyceğiz': 22000,
    'Marmaris': 62000,
    'Menteşe': 32000,
    'Milas': 25000,
    'Ortaca': 22000,
    'Seydikemer': 25000,
    'Ula': 18000,
    'Yatağan': 15000,
  },
  'Tekirdağ': {
    'Çerkezköy': 28000,
    'Çorlu': 30000,
    'Ergene': 22000,
    'Hayrabolu': 12000,
    'Kapaklı': 25000,
    'Malkara': 14000,
    'Marmara Ereğlisi': 22000,
    'Muratlı': 15000,
    'Saray': 18000,
    'Süleymanpaşa': 28000,
    'Şarköy': 22000,
  },
  'Eskişehir': {
    'Alpu': 8000,
    'Beylikova': 8000,
    'Çifteler': 10000,
    'Günyüzü': 8000,
    'Han': 8000,
    'İnönü': 10000,
    'Mahmudiye': 8000,
    'Mihalgazi': 8000,
    'Mihalıççık': 8000,
    'Odunpazarı': 28000,
    'Sarıcakaya': 8000,
    'Seyitgazi': 10000,
    'Sivrihisar': 10000,
    'Tepebaşı': 25000,
  },
  'Sakarya': {
    'Adapazarı': 25000,
    'Akyazı': 15000,
    'Arifiye': 22000,
    'Erenler': 20000,
    'Ferizli': 12000,
    'Geyve': 14000,
    'Hendek': 15000,
    'Karapürçek': 10000,
    'Karasu': 18000,
    'Kaynarca': 10000,
    'Kocaali': 15000,
    'Pamukova': 12000,
    'Sapanca': 32000,
    'Serdivan': 28000,
    'Söğütlü': 10000,
    'Taraklı': 10000,
  },
  'Samsun': {
    'Alaçam': 10000,
    'Asarcık': 8000,
    'Atakum': 25000,
    'Ayvacık': 8000,
    'Bafra': 14000,
    'Canik': 18000,
    'Çarşamba': 14000,
    'Havza': 10000,
    'İlkadım': 22000,
    'Kavak': 10000,
    'Ladik': 8000,
    'Ondokuzmayıs': 10000,
    'Salıpazarı': 8000,
    'Tekkeköy': 15000,
    'Terme': 12000,
    'Vezirköprü': 10000,
    'Yakakent': 10000,
  },
  'Edirne': {
    'Enez': 15000,
    'Havsa': 10000,
    'İpsala': 10000,
    'Keşan': 18000,
    'Lalapaşa': 8000,
    'Meriç': 10000,
    'Merkez': 22000,
    'Süloğlu': 8000,
    'Uzunköprü': 14000,
  },
  'Kayseri': {
    'Akkışla': 8000,
    'Bünyan': 10000,
    'Develi': 12000,
    'Felahiye': 8000,
    'Hacılar': 18000,
    'İncesu': 12000,
    'Kocasinan': 25000,
    'Melikgazi': 28000,
    'Özvatan': 8000,
    'Pınarbaşı': 8000,
    'Sarıoğlan': 8000,
    'Sarız': 8000,
    'Talas': 25000,
    'Tomarza': 8000,
    'Yahyalı': 10000,
    'Yeşilhisar': 10000,
  },
  'Konya': {
    'Ahırlı': 6000,
    'Akören': 6000,
    'Akşehir': 12000,
    'Altınekin': 6000,
    'Beyşehir': 12000,
    'Bozkır': 8000,
    'Cihanbeyli': 8000,
    'Çeltik': 6000,
    'Çumra': 8000,
    'Derbent': 6000,
    'Derebucak': 6000,
    'Doğanhisar': 8000,
    'Emirgazi': 6000,
    'Ereğli': 14000,
    'Güneysınır': 6000,
    'Hadim': 6000,
    'Halkapınar': 6000,
    'Hüyük': 6000,
    'Ilgın': 10000,
    'Kadınhanı': 8000,
    'Karapınar': 8000,
    'Karatay': 20000,
    'Kulu': 10000,
    'Meram': 25000,
    'Sarayönü': 8000,
    'Selçuklu': 28000,
    'Seydişehir': 12000,
    'Taşkent': 6000,
    'Tuzlukçu': 6000,
    'Yalıhüyük': 6000,
    'Yunak': 8000,
  },
  'Kuzey Kıbrıs': {
    'Lefkoşa': 35000,
    'Gazimağusa': 30000,
    'Girne': 55000,
    'Güzelyurt': 22000,
    'İskele': 45000,
    'Lefke': 18000,
  },
};

// ─── Yardımcı Fonksiyonlar ──────────────────────────

export function getDistrictPrice(
  city: string,
  district: string,
): number | null {
  return DISTRICT_PRICES[city]?.[district] ?? null;
}

// ─── Değerleme Hesaplama ─────────────────────────────

export function hesaplaDegerleme(
  m2Fiyat: number,
  yuzolcumu: number,
): ValuationResult {
  const basePrice = m2Fiyat * yuzolcumu;
  return {
    basePrice: Math.round(basePrice),
    hizliSatis: Math.round(basePrice * 0.85),
    ucAylik: Math.round(basePrice * 0.95),
    altiAylikMin: Math.round(basePrice),
    altiAylikMax: Math.round(basePrice * 1.05),
  };
}

// ─── Hukuki Risk Analizi (Rule Engine) ───────────────

export function analizEtHukukiRisk(
  nitelik: Nitelik,
  yuzolcumu: number,
  tapuTipi: TapuTipi,
): LegalRiskResult {
  // Kural 1: Tarla + küçük yüzölçüm → KIRMIZI
  if (nitelik === 'tarla' && yuzolcumu < 5000) {
    return {
      level: 'RED',
      rule: '5403 Sayılı Toprak Koruma ve Arazi Kullanımı Kanunu, Md. 8/a',
      message:
        'Tarım arazileri 5.000 m²\'den küçük parçalara bölünemez. Bu taşınmazın devri teknik olarak mümkün olmayabilir.',
      actionRequired:
        'Tapu Müdürlüğü veya İl Tarım Müdürlüğü ile teyit edin. Bölünme izni alınıp alınamayacağını sorgulayın.',
    };
  }

  // Kural 2: Zeytinlik → KIRMIZI (mutlak koruma)
  if (nitelik === 'zeytinlik') {
    return {
      level: 'RED',
      rule: '3573 Sayılı Zeytinciliğin Islahı Hakkında Kanun',
      message:
        'Zeytinlik vasfındaki taşınmazlar özel koruma altındadır. Zeytinlik alanlar içinde yapı izni verilememekte ve kullanım amacı değiştirilememektedir.',
      actionRequired:
        'Bu taşınmazın satışında Tarım Bakanlığı onayı ve uzman tarım avukatı desteği gereklidir.',
    };
  }

  // Kural 3: Tarla + hisseli → SARI (ön alım hakkı)
  if (nitelik === 'tarla' && tapuTipi === 'hisseli') {
    return {
      level: 'YELLOW',
      rule: '4721 Sayılı TMK, Md. 732 — Ön Alım Hakkı',
      message:
        'Hisseli tarla satışında diğer hissedarların yasal ön alım hakkı bulunmaktadır. Satış öncesinde hissedarlar noter aracılığıyla bilgilendirilmelidir.',
      actionRequired:
        'Diğer hissedarların ön alım hakkından vazgeçtiğine dair noter beyannamesi alın.',
    };
  }

  // Kural 4: Arsa → YEŞİL
  if (nitelik === 'arsa') {
    return {
      level: 'GREEN',
      rule: 'İmar Mevzuatı',
      message:
        'İmarlı arsa niteliğindeki taşınmazlar düşük hukuki risk taşır. Yine de güncel imar durumu belgesi alınması önerilir.',
      actionRequired:
        'Belediyeden güncel imar durumu belgesi ve tapu kütüğü sorgulaması yapın.',
    };
  }

  // Kural 5: Diğer → GRİ
  return {
    level: 'GRAY',
    rule: '—',
    message:
      'Seçilen nitelik için otomatik risk değerlendirmesi yapılamadı. Manuel inceleme gereklidir.',
    actionRequired:
      'Hukuk danışmanına veya Tapu Müdürlüğüne başvurun.',
  };
}
