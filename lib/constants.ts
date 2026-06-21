import type { TransactionType, PropertyType } from '@/types';

// ─── Şehirler ─────────────────────────────────────────

export const CITIES = ['İstanbul', 'Ankara', 'İzmir'] as const;
export type City = (typeof CITIES)[number];

// ─── İstanbul İlçeleri (39 ilçe) ──────────────────────

export const ISTANBUL_DISTRICTS = [
  'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar',
  'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş',
  'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca',
  'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih',
  'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal',
  'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer',
  'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli',
  'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu',
];

// ─── Çoklu Şehir İlçeleri ────────────────────────────

export const CITY_DISTRICTS: Record<string, string[]> = {
  'İstanbul': ISTANBUL_DISTRICTS,
  'Ankara': [
    'Altındağ', 'Çankaya', 'Çubuk', 'Etimesgut', 'Gölbaşı',
    'Keçiören', 'Mamak', 'Pursaklar', 'Sincan', 'Yenimahalle',
  ],
  'İzmir': [
    'Balçova', 'Bayraklı', 'Bornova', 'Buca', 'Çiğli',
    'Gaziemir', 'Karabağlar', 'Karşıyaka', 'Konak', 'Narlıdere',
  ],
};

// ─── Backward compat ──────────────────────────────────

export const DISTRICTS = ['Hepsi', ...ISTANBUL_DISTRICTS] as string[];

// ─── İstanbul Mahalleler ──────────────────────────────

export const DISTRICT_NEIGHBORHOODS: Record<string, string[]> = {
  'Adalar': ['Burgazada', 'Büyükada', 'Heybeliada', 'Kınalıada'],
  'Arnavutköy': ['Bolluca', 'Dursunköy', 'Hadımköy', 'İmrahor', 'Karlıbayır', 'Taşoluk', 'Yassıören', 'Yeşilbayır'],
  'Ataşehir': ['Aşık Veysel', 'Atatürk', 'Barbaros', 'Batı Ataşehir', 'Esatpaşa', 'Fetih', 'İçerenköy', 'İnönü', 'Kayışdağı', 'Küçükbakkalköy', 'Mevlana', 'Mimar Sinan', 'Mustafa Kemal', 'Yenişehir', 'Yeni Çamlıca'],
  'Avcılar': ['Ambarlı', 'Cihangir', 'Denizköşkler', 'Firuzköy', 'Gümüşpala', 'Merkez', 'Mustafa Kemal Paşa', 'Tahtakale', 'Üniversite', 'Yeşilkent'],
  'Bağcılar': ['Barbaros', 'Bağlar', 'Çınar', 'Demirkapı', 'Evren', 'Fatih', 'Fevzi Çakmak', 'Güneşli', 'Hürriyet', 'İnönü', 'Kazım Karabekir', 'Kemalpaşa', 'Kirazlı', 'Mahmutbey', 'Merkez', 'Sancaktepe', 'Yavuz Selim', 'Yenigün', 'Yenimahalle', 'Yıldıztepe'],
  'Bahçelievler': ['Bahçelievler', 'Çobançeşme', 'Fevzi Çakmak', 'Hürriyet', 'Kocasinan', 'Siyavuşpaşa', 'Soganli', 'Şirinevler', 'Yenibosna', 'Zafer'],
  'Bakırköy': ['Ataköy 1. Kısım', 'Ataköy 2-5-6. Kısım', 'Ataköy 3-4-11. Kısım', 'Ataköy 7-8-9-10. Kısım', 'Basınköy', 'Cevizlik', 'Florya', 'Kartaltepe', 'Mahmutbey', 'Osmaniye', 'Sakızağacı', 'Şenlikköy', 'Yeşilköy', 'Yeşilyurt', 'Zuhuratbaba'],
  'Başakşehir': ['Altınşehir', 'Başak', 'Başakşehir', 'Güvercintepe', 'Kayabaşı', 'Kayaşehir', 'Şahintepe', 'Ziya Gökalp'],
  'Bayrampaşa': ['Altıntepsi', 'Cevatpaşa', 'İsmetpaşa', 'Kocatepe', 'Muratpaşa', 'Orta', 'Terazidere', 'Vatan', 'Yenidoğan', 'Yıldırım'],
  'Beşiktaş': ['Abbasağa', 'Akatlar', 'Arnavutköy', 'Bebek', 'Cihannüma', 'Dikilitaş', 'Etiler', 'Gayrettepe', 'Konaklar', 'Kuruçeşme', 'Levent', 'Levazım', 'Muradiye', 'Nisbetiye', 'Ortaköy', 'Sinanpaşa', 'Türkali', 'Ulus', 'Vişnezade', 'Yıldız'],
  'Beykoz': ['Acarlar', 'Anadoluhisarı', 'Çavuşbaşı', 'Çubuklu', 'Gümüşsuyu', 'İncirköy', 'Kanlıca', 'Kavacık', 'Paşabahçe', 'Polonezköy', 'Riva', 'Rüzgarlıbahçe'],
  'Beylikdüzü': ['Adnan Kahveci', 'Barış', 'Büyükşehir', 'Cumhuriyet', 'Dereağzı', 'Gürpınar', 'İnönü', 'Kavakpınar', 'Kavaklı', 'Marmara', 'Sahil', 'Yakuplu'],
  'Beyoğlu': ['Asmalımescit', 'Cihangir', 'Çukurcuma', 'Firuzağa', 'Galata', 'Gümüşsuyu', 'Kasımpaşa', 'Kulaksız', 'Ömeravni', 'Pürtelaş', 'Tarlabaşı', 'Tomtom'],
  'Büyükçekmece': ['Atatürk', 'Bahçelievler', 'Batıköy', 'Cumhuriyet', 'Fatih', 'Kamiloba', 'Mimarsinan', 'Muratbey', 'Pınartepe', 'Türkoba'],
  'Çatalca': ['Çatalca Merkez', 'Ferhatpaşa', 'Kaleiçi', 'Muratbey', 'Ovayenice', 'Subaşı'],
  'Çekmeköy': ['Alemdağ', 'Çamlık', 'Hamidiye', 'Mehmet Akif', 'Merkez', 'Mimar Sinan', 'Ömerli', 'Sultançiftliği', 'Taşdelen'],
  'Esenler': ['Atışalanı', 'Birlik', 'Davutpaşa', 'Fatih', 'Fevzi Çakmak', 'Havaalanı', 'Kâzım Karabekir', 'Menderes', 'Namık Kemal', 'Oruç Reis', 'Tuna', 'Yavuz Selim'],
  'Esenyurt': ['Ardıçlı', 'Bahçeşehir 1. Kısım', 'Bahçeşehir 2. Kısım', 'Fatih', 'İnönü', 'İstiklal', 'Kıraç', 'Mehterçeşme', 'Namık Kemal', 'Pınar', 'Saadetdere', 'Talatpaşa', 'Üçevler', 'Yenikent', 'Yeşilkent'],
  'Eyüpsultan': ['Akşemsettin', 'Alibeyköy', 'Çırçır', 'Defterdar', 'Emniyettepe', 'Göktürk', 'İslambey', 'Kemerburgaz', 'Nişancı', 'Pirinççi', 'Rami', 'Silahtarağa', 'Topçular', 'Yeşilpınar'],
  'Fatih': ['Aksaray', 'Balat', 'Beyazıt', 'Cankurtaran', 'Cerrahpaşa', 'Çarşamba', 'Edirnekapı', 'Fener', 'Haseki', 'Karagümrük', 'Kumkapı', 'Laleli', 'Saraçhane', 'Sultanahmet', 'Süleymaniye', 'Vefa', 'Yedikule', 'Zeyrek'],
  'Gaziosmanpaşa': ['Bağlarbaşı', 'Barbaros', 'Hürriyet', 'Karlıtepe', 'Karadeniz', 'Kazım Karabekir', 'Merkez', 'Mevlana', 'Sarıgöl', 'Yenimahalle', 'Yıldıztabya'],
  'Güngören': ['Akıncılar', 'Güneştepe', 'Gençosman', 'Güven', 'Haznedar', 'Mareşal Çakmak', 'Mehmet Nesih Özmen', 'Merkez', 'Sanayi', 'Tozkoparan'],
  'Kadıköy': ['Acıbadem', 'Bostancı', 'Caferağa', 'Caddebostan', 'Dumlupınar', 'Erenköy', 'Fenerbahçe', 'Feneryolu', 'Fikirtepe', 'Göztepe', 'Hasanpaşa', 'İçerenköy', 'Koşuyolu', 'Kozyatağı', 'Merdivenköy', 'Moda', 'Osmanağa', 'Rasimpaşa', 'Sahrayıcedit', 'Suadiye', 'Yeldeğirmeni', 'Zühtüpaşa'],
  'Kağıthane': ['Çağlayan', 'Çeliktepe', 'Emniyet', 'Gültepe', 'Hamidiye', 'Harmantepe', 'Hürriyet', 'Mehmet Akif Ersoy', 'Merkez', 'Nurtepe', 'Ortabayır', 'Sanayi', 'Seyrantepe', 'Şirintepe', 'Talatpaşa', 'Yahya Kemal'],
  'Kartal': ['Atalar', 'Cevizli', 'Çavuşoğlu', 'Esentepe', 'Hürriyet', 'Karlıktepe', 'Kordonboyu', 'Orhantepe', 'Soğanlık', 'Topselvi', 'Uğur Mumcu', 'Yakacık', 'Yukarı'],
  'Küçükçekmece': ['Atatürk', 'Beşyol', 'Cennet', 'Cumhuriyet', 'Fatih', 'Fevzi Çakmak', 'Gültepe', 'Halkalı', 'İnönü', 'Kanarya', 'Kemalpaşa', 'Mehmet Akif', 'Söğütlüçeşme', 'Yarımburgaz', 'Yeşilova'],
  'Maltepe': ['Altayçeşme', 'Altıntepe', 'Aydınevler', 'Bağlarbaşı', 'Başıbüyük', 'Cevizli', 'Çınar', 'Dragos', 'Esenkent', 'Feyzullah', 'Fındıklı', 'Girne', 'Gülsuyu', 'Gülensu', 'İdealtepe', 'Küçükyalı', 'Yalı', 'Zümrütevler'],
  'Pendik': ['Ahmet Yesevi', 'Bahçelievler', 'Batı', 'Çamçeşme', 'Çınardere', 'Doğu', 'Dumlupınar', 'Esenler', 'Esenyalı', 'Güllü Bağlar', 'Güzelyalı', 'Kaynarca', 'Kurtköy', 'Ramazanoğlu', 'Sapanbağları', 'Velibaba', 'Yenişehir'],
  'Sancaktepe': ['Abdurrahman Gazi', 'Akpınar', 'Atatürk', 'Emek', 'Eyüp Sultan', 'Fatih', 'İnönü', 'Meclis', 'Merve', 'Osmangazi', 'Sarıgazi', 'Veysel Karani', 'Yenidoğan'],
  'Sarıyer': ['Ayazağa', 'Bahçeköy', 'Baltalimanı', 'Büyükdere', 'Çamlıtepe', 'Darüşşafaka', 'Emirgan', 'Fatih Sultan Mehmet', 'İstinye', 'Kireçburnu', 'Maslak', 'Pınar', 'PTT Evleri', 'Reşitpaşa', 'Rumelihisarı', 'Rumeli Kavağı', 'Tarabya', 'Yeniköy', 'Zekeriyaköy'],
  'Silivri': ['Alibey', 'Cumhuriyet', 'Fatih', 'Merkez', 'Mimarsinan', 'Piri Mehmet Paşa', 'Selimpaşa', 'Yolçatı'],
  'Sultanbeyli': ['Abdurrahman Gazi', 'Battalgazi', 'Fatih', 'Hamidiye', 'Hasanpaşa', 'Mecidiye', 'Mehmet Akif', 'Mimar Sinan', 'Necip Fazıl', 'Orhangazi', 'Turgut Reis', 'Yavuz Selim'],
  'Sultangazi': ['50. Yıl', 'Cebeci', 'Cumhuriyet', 'Esentepe', 'Gazi', 'Habibler', 'İsmetpaşa', 'Malkoçoğlu', 'Sultançiftliği', 'Uğur Mumcu', 'Yayla', 'Yunus Emre', 'Zübeyde Hanım'],
  'Şile': ['Ağva', 'Balibey', 'Hacıkasım', 'Kumbaba', 'Merkez', 'Sahilköy', 'Üvezli'],
  'Şişli': ['Bomonti', 'Cumhuriyet', 'Dikilitaş', 'Duatepe', 'Esentepe', 'Feriköy', 'Fulya', 'Gülbahar', 'Halaskargazi', 'Harbiye', 'İnönü', 'İstiklal', 'Kuştepe', 'Mecidiyeköy', 'Meşrutiyet', 'Nişantaşı', 'Osmanbey', 'Paşa', 'Teşvikiye', 'Yayla'],
  'Tuzla': ['Aydınlı', 'Aydıntepe', 'Cami', 'Evliya Çelebi', 'Fatih', 'İçmeler', 'İstasyon', 'Mescit', 'Mimar Sinan', 'Orhanlı', 'Postane', 'Şifa', 'Yayla'],
  'Ümraniye': ['Armağanevler', 'Aşağı Dudullu', 'Atatürk', 'Çakmak', 'Çamlık', 'Esenevler', 'Esenşehir', 'Hekimbaşı', 'İnkılap', 'İstiklal', 'Kazım Karabekir', 'Madenler', 'Namık Kemal', 'Parseller', 'Saray', 'Site', 'Tantavi', 'Tatlısu', 'Tepetarla', 'Yukarı Dudullu'],
  'Üsküdar': ['Acıbadem', 'Altunizade', 'Aziz Mahmut Hüdayi', 'Bahçelievler', 'Beylerbeyi', 'Burhaniye', 'Çengelköy', 'Ferah', 'İcadiye', 'Kandilli', 'Kısıklı', 'Kuzguncuk', 'Mimar Sinan', 'Salacak', 'Selimiye', 'Ünalan', 'Validei Atik', 'Vaniköy', 'Yavuztürk'],
  'Zeytinburnu': ['Beştelsiz', 'Çırpıcı', 'Gökalp', 'Kazlıçeşme', 'Maltepe', 'Merkezefendi', 'Nuripaşa', 'Seyitnizam', 'Sümer', 'Telsiz', 'Veliefendi', 'Yeşiltepe'],
};

// ─── Kadıköy backward compat ──────────────────────────
export const KADIKOY_NEIGHBORHOODS = DISTRICT_NEIGHBORHOODS['Kadıköy'];

// ─── Ankara Mahalleler ────────────────────────────────

export const ANKARA_NEIGHBORHOODS: Record<string, string[]> = {
  'Altındağ': ['Aktaş', 'Aydınlıkevler', 'Başpınar', 'Battalgazi', 'Doğantepe', 'Gülpınar', 'Hacettepe', 'Karapürçek', 'Siteler', 'Ulubey'],
  'Çankaya': ['Bahçelievler', 'Balgat', 'Çayyolu', 'Dikmen', 'Emek', 'Gaziosmanpaşa', 'Kavaklıdere', 'Kızılay', 'Oran', 'Çukurambar', 'Yaşamkent'],
  'Çubuk': ['Aşağıçavundur', 'Cumhuriyet', 'Dumlupınar', 'Mehmet Akif Ersoy', 'Merkez'],
  'Etimesgut': ['30 Ağustos', 'Ahi Mesut', 'Alsancak', 'Bağlıca', 'Elvankent', 'Eryaman', 'Topçu', 'Yapracık'],
  'Gölbaşı': ['Bahçelievler', 'Eymir', 'Gaziosmanpaşa', 'İncek', 'Karşıyaka', 'Kızılcaşar', 'Tuluntaş'],
  'Keçiören': ['Aktepe', 'Bağlum', 'Etlik', 'İncirli', 'Kalaba', 'Kanuni', 'Kuşcağız', 'Ovacık', 'Subayevleri', 'Ufuktepe'],
  'Mamak': ['Abidinpaşa', 'Akdere', 'Boğaziçi', 'Cengizhan', 'Durali Alıç', 'Eğitim', 'Fahri Korutürk', 'Kutlu', 'Tuzluçayır'],
  'Pursaklar': ['Altınova', 'Fatih', 'Merkez', 'Saray', 'Yukarı Murtaza'],
  'Sincan': ['Atatürk', 'Fatih', 'Lale', 'Mareşal Çakmak', 'Pınarbaşı', 'Tandoğan', 'Törekent', 'Yenikent'],
  'Yenimahalle': ['Batıkent', 'Çamlıca', 'Demetevler', 'Gayret', 'Karşıyaka', 'Macunköy', 'Mehmet Akif Ersoy', 'Ostim', 'Şentepe'],
};

export const IZMIR_NEIGHBORHOODS: Record<string, string[]> = {
  'Balçova': ['Bahçelerarası', 'Çetin Emeç', 'Ege', 'Fevzi Çakmak', 'İnciraltı', 'Korutürk', 'Onur', 'Teleferik'],
  'Bayraklı': ['Adalet', 'Bayraklı', 'Çiçek', 'Manavkuyu', 'Mansuroğlu', 'Onur', 'Osmangazi', 'Salhane', 'Turan'],
  'Bornova': ['Altındağ', 'Çamdibi', 'Doğanlar', 'Ergene', 'Evka-3', 'Kazımdirik', 'Kemalpaşa', 'Laka', 'Mevlana', 'Yeşilova'],
  'Buca': ['Adatepe', 'Çamlıkule', 'Efes', 'Gaziler', 'İnkılap', 'Kozağaç', 'Şirinyer', 'Tınaztepe', 'Yasin'],
  'Çiğli': ['Atatürk', 'Balatçık', 'Egekent', 'Evka-5', 'Harmandere', 'Küçükçiğli', 'Ova'],
  'Gaziemir': ['Aktepe', 'Atıfbey', 'Binbaşı Reşatbey', 'Gazi', 'Sakarya', 'Sevgi', 'Yeşil'],
  'Karabağlar': ['Bozyaka', 'Cennetçeşme', 'Günaltay', 'Limontepe', 'Peker', 'Salih Omurtak', 'Üçkuyular', 'Uzundere'],
  'Karşıyaka': ['Aksoy', 'Alaybey', 'Bostanlı', 'Çarşı', 'Dedebaşı', 'Donanmacı', 'Mavişehir', 'Nergiz', 'Tersane', 'Yalı'],
  'Konak': ['Alsancak', 'Basmane', 'Çankaya', 'Güzelyalı', 'Hatay', 'Kahramanlar', 'Kemeraltı', 'Konak', 'Pasaport', 'Üçkuyular'],
  'Narlıdere': ['Atatürk', 'Çatalkaya', 'Huzur', 'Limanreis', 'Narlı', 'Sahilevleri'],
};

export function getDistrictsForCity(city: string): string[] {
  return CITY_DISTRICTS[city] ?? CITY_DISTRICTS['İstanbul'];
}

export function getNeighborhoodsForDistrict(city: string, district: string): string[] {
  if (city === 'İstanbul') return DISTRICT_NEIGHBORHOODS[district] ?? [];
  if (city === 'Ankara') return ANKARA_NEIGHBORHOODS[district] ?? [];
  if (city === 'İzmir') return IZMIR_NEIGHBORHOODS[district] ?? [];
  return [];
}

// Tüm mahalleler - arama için düz liste
export function getAllNeighborhoods(city: string): { district: string; neighborhood: string }[] {
  const districts = getDistrictsForCity(city);
  const result: { district: string; neighborhood: string }[] = [];
  for (const district of districts) {
    const neighborhoods = getNeighborhoodsForDistrict(city, district);
    for (const neighborhood of neighborhoods) {
      result.push({ district, neighborhood });
    }
  }
  return result;
}

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
  { key: 'URBAN_RENEWAL', label: 'Kentsel Dönüşüm' },
];

// ─── Oda Sayıları ─────────────────────────────────────

export const ROOM_OPTIONS = [
  'Stüdyo', '1+0', '1+1', '2+0', '2+1', '3+1', '3+2', '4+1', '4+2', '5+1', '5+2', '6+',
];

// ─── Isıtma Tipleri ───────────────────────────────────

export const HEATING_TYPES = [
  'Doğalgaz (Kombi)', 'Doğalgaz (Kat Kalörifer)', 'Merkezi Sistem',
  'Soba', 'Klima', 'Yerden Isıtma', 'Yok',
];

// ─── Bina Yaşı Aralıkları ─────────────────────────────

export const BUILDING_AGE_OPTIONS = [
  { key: '0', label: '0 (Sıfır Bina)' },
  { key: '1-5', label: '1 - 5' },
  { key: '6-10', label: '6 - 10' },
  { key: '11-15', label: '11 - 15' },
  { key: '16-20', label: '16 - 20' },
  { key: '21-25', label: '21 - 25' },
  { key: '26-30', label: '26 - 30' },
  { key: '31+', label: '31 ve üzeri' },
];
