/**
 * Mock Data Seed Script for Birlikte Satalım
 *
 * Generates mock users, listings, and demands for every district in every city.
 * Run with: npx tsx scripts/seed-mock-data.ts
 */

import crypto from 'crypto';

// ─── Config ──────────────────────────────────────────────
const SUPABASE_URL = 'https://rjhhrcoorayrqwotfqbc.supabase.co';
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaGhyY29vcmF5cnF3b3RmcWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgwNTE2OCwiZXhwIjoyMDk3MzgxMTY4fQ.CbDZBYt_EZ3cwQA0ufDqJbSwRM-XvXtwnYDZeUKi820';

// ─── City → Districts ────────────────────────────────────
const CITY_DISTRICTS: Record<string, string[]> = {
  'İstanbul': [
    'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar',
    'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş',
    'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca',
    'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih',
    'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal',
    'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer',
    'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli',
    'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu',
  ],
  'Ankara': [
    'Altındağ', 'Çankaya', 'Çubuk', 'Etimesgut', 'Gölbaşı',
    'Keçiören', 'Mamak', 'Pursaklar', 'Sincan', 'Yenimahalle',
  ],
  'İzmir': [
    'Balçova', 'Bayraklı', 'Bornova', 'Buca', 'Çiğli',
    'Gaziemir', 'Karabağlar', 'Karşıyaka', 'Konak', 'Narlıdere',
  ],
  'Bursa': [
    'Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl',
    'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya',
    'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli', 'Orhangazi',
    'Osmangazi', 'Yenişehir', 'Yıldırım',
  ],
  'Antalya': [
    'Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı',
    'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer',
    'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat',
    'Muratpaşa', 'Serik',
  ],
  'Balıkesir': [
    'Altıeylül', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç',
    'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç',
    'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut',
    'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk',
  ],
  'Kocaeli': [
    'Başiskele', 'Çayırova', 'Darıca', 'Derince', 'Dilovası',
    'Gebze', 'Gölcük', 'İzmit', 'Kandıra', 'Karamürsel',
    'Kartepe', 'Körfez',
  ],
  'Mersin': [
    'Akdeniz', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla',
    'Erdemli', 'Gülnar', 'Mezitli', 'Mut', 'Silifke',
    'Tarsus', 'Toroslar', 'Yenişehir',
  ],
  'Muğla': [
    'Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere',
    'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ortaca',
    'Seydikemer', 'Ula', 'Yatağan',
  ],
  'Tekirdağ': [
    'Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı',
    'Malkara', 'Marmara Ereğlisi', 'Muratlı', 'Saray', 'Süleymanpaşa',
    'Şarköy',
  ],
  'Eskişehir': [
    'Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han',
    'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Odunpazarı',
    'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Tepebaşı',
  ],
  'Sakarya': [
    'Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli',
    'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca',
    'Kocaali', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü',
    'Taraklı',
  ],
  'Samsun': [
    'Alaçam', 'Asarcık', 'Atakum', 'Ayvacık', 'Bafra',
    'Canik', 'Çarşamba', 'Havza', 'İlkadım', 'Kavak',
    'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Tekkeköy', 'Terme',
    'Vezirköprü', 'Yakakent',
  ],
  'Edirne': [
    'Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa',
    'Meriç', 'Merkez', 'Süloğlu', 'Uzunköprü',
  ],
  'Kayseri': [
    'Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar',
    'İncesu', 'Kocasinan', 'Melikgazi', 'Özvatan', 'Pınarbaşı',
    'Sarıoğlan', 'Sarız', 'Talas', 'Tomarza', 'Yahyalı',
    'Yeşilhisar',
  ],
  'Konya': [
    'Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir',
    'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent',
    'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysınır',
    'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı',
    'Karapınar', 'Karatay', 'Kulu', 'Meram', 'Sarayönü',
    'Selçuklu', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük',
    'Yunak',
  ],
  'Kuzey Kıbrıs': [
    'Lefkoşa', 'Gazimağusa', 'Girne', 'Güzelyurt', 'İskele', 'Lefke',
  ],
};

// ─── Neighborhoods (key districts) ───────────────────────
const DISTRICT_NEIGHBORHOODS: Record<string, Record<string, string[]>> = {
  'İstanbul': {
    'Adalar': ['Burgazada', 'Büyükada', 'Heybeliada', 'Kınalıada'],
    'Ataşehir': ['Barbaros', 'İçerenköy', 'Kayışdağı', 'Küçükbakkalköy', 'Mustafa Kemal', 'Yenişehir'],
    'Avcılar': ['Ambarlı', 'Cihangir', 'Denizköşkler', 'Merkez', 'Üniversite'],
    'Bağcılar': ['Güneşli', 'Kirazlı', 'Mahmutbey', 'Yıldıztepe'],
    'Bahçelievler': ['Bahçelievler', 'Şirinevler', 'Yenibosna', 'Soganli', 'Kocasinan'],
    'Bakırköy': ['Ataköy 1. Kısım', 'Ataköy 7-8-9-10. Kısım', 'Florya', 'Yeşilköy', 'Yeşilyurt'],
    'Başakşehir': ['Başakşehir', 'Kayabaşı', 'Kayaşehir'],
    'Beşiktaş': ['Bebek', 'Etiler', 'Levent', 'Ortaköy', 'Ulus', 'Nisbetiye'],
    'Beykoz': ['Anadoluhisarı', 'Çubuklu', 'Kavacık', 'Paşabahçe', 'Riva'],
    'Beylikdüzü': ['Adnan Kahveci', 'Büyükşehir', 'Cumhuriyet', 'Kavakpınar', 'Yakuplu'],
    'Beyoğlu': ['Cihangir', 'Galata', 'Kasımpaşa', 'Tarlabaşı', 'Asmalımescit'],
    'Büyükçekmece': ['Batıköy', 'Mimarsinan', 'Cumhuriyet'],
    'Çekmeköy': ['Alemdağ', 'Hamidiye', 'Taşdelen', 'Merkez'],
    'Esenler': ['Davutpaşa', 'Menderes', 'Oruç Reis'],
    'Esenyurt': ['Bahçeşehir 1. Kısım', 'Bahçeşehir 2. Kısım', 'Kıraç', 'Yenikent'],
    'Eyüpsultan': ['Göktürk', 'Kemerburgaz', 'Alibeyköy'],
    'Fatih': ['Aksaray', 'Sultanahmet', 'Laleli', 'Fener', 'Balat'],
    'Kadıköy': ['Acıbadem', 'Bostancı', 'Caddebostan', 'Fenerbahçe', 'Göztepe', 'Kozyatağı', 'Moda', 'Suadiye'],
    'Kağıthane': ['Çağlayan', 'Gültepe', 'Seyrantepe', 'Hamidiye'],
    'Kartal': ['Atalar', 'Cevizli', 'Kordonboyu', 'Soğanlık', 'Yakacık'],
    'Küçükçekmece': ['Cennet', 'Halkalı', 'Söğütlüçeşme'],
    'Maltepe': ['Altayçeşme', 'Cevizli', 'Dragos', 'İdealtepe', 'Küçükyalı', 'Zümrütevler'],
    'Pendik': ['Batı', 'Esenyalı', 'Kaynarca', 'Kurtköy', 'Yenişehir'],
    'Sancaktepe': ['Sarıgazi', 'Yenidoğan', 'Osmangazi'],
    'Sarıyer': ['Emirgan', 'İstinye', 'Maslak', 'Rumelihisarı', 'Tarabya', 'Zekeriyaköy'],
    'Şişli': ['Bomonti', 'Fulya', 'Mecidiyeköy', 'Nişantaşı', 'Teşvikiye'],
    'Tuzla': ['Aydınlı', 'İçmeler', 'Orhanlı', 'Postane'],
    'Ümraniye': ['Atatürk', 'Çakmak', 'Esenşehir', 'İnkılap', 'Tantavi'],
    'Üsküdar': ['Acıbadem', 'Altunizade', 'Beylerbeyi', 'Çengelköy', 'Kandilli', 'Kuzguncuk'],
    'Zeytinburnu': ['Kazlıçeşme', 'Merkezefendi', 'Sümer', 'Yeşiltepe'],
    'Arnavutköy': ['Bolluca', 'Hadımköy', 'Taşoluk'],
    'Bayrampaşa': ['Kocatepe', 'Vatan', 'Yenidoğan'],
    'Çatalca': ['Çatalca Merkez', 'Ferhatpaşa'],
    'Gaziosmanpaşa': ['Barbaros', 'Hürriyet', 'Merkez'],
    'Güngören': ['Güneştepe', 'Haznedar', 'Tozkoparan', 'Merkez'],
    'Silivri': ['Merkez', 'Selimpaşa'],
    'Sultanbeyli': ['Fatih', 'Hamidiye', 'Orhangazi'],
    'Sultangazi': ['Cebeci', 'Esentepe', 'Gazi'],
    'Şile': ['Ağva', 'Merkez'],
  },
  'Ankara': {
    'Altındağ': ['Aktaş', 'Aydınlıkevler', 'Battalgazi', 'Hacettepe', 'Siteler'],
    'Çankaya': ['Bahçelievler', 'Balgat', 'Çayyolu', 'Dikmen', 'Kavaklıdere', 'Kızılay', 'Oran', 'Çukurambar', 'Yaşamkent'],
    'Çubuk': ['Cumhuriyet', 'Merkez'],
    'Etimesgut': ['Bağlıca', 'Elvankent', 'Eryaman', 'Yapracık'],
    'Gölbaşı': ['İncek', 'Kızılcaşar', 'Bahçelievler'],
    'Keçiören': ['Etlik', 'Kalaba', 'Kuşcağız', 'Subayevleri'],
    'Mamak': ['Abidinpaşa', 'Boğaziçi', 'Tuzluçayır'],
    'Pursaklar': ['Altınova', 'Fatih', 'Saray'],
    'Sincan': ['Fatih', 'Tandoğan', 'Yenikent'],
    'Yenimahalle': ['Batıkent', 'Demetevler', 'Ostim', 'Şentepe'],
  },
  'İzmir': {
    'Balçova': ['Bahçelerarası', 'Ege', 'İnciraltı', 'Teleferik'],
    'Bayraklı': ['Bayraklı', 'Manavkuyu', 'Mansuroğlu'],
    'Bornova': ['Çamdibi', 'Evka-3', 'Kazımdirik', 'Yeşilova'],
    'Buca': ['Adatepe', 'Gaziler', 'Şirinyer', 'Tınaztepe'],
    'Çiğli': ['Atatürk', 'Egekent', 'Evka-5'],
    'Gaziemir': ['Atıfbey', 'Gazi', 'Sevgi'],
    'Karabağlar': ['Bozyaka', 'Limontepe', 'Üçkuyular', 'Uzundere'],
    'Karşıyaka': ['Bostanlı', 'Çarşı', 'Mavişehir', 'Yalı'],
    'Konak': ['Alsancak', 'Güzelyalı', 'Hatay', 'Kemeraltı', 'Pasaport'],
    'Narlıdere': ['Atatürk', 'Sahilevleri', 'Narlı'],
  },
  'Bursa': {
    'Osmangazi': ['Çekirge', 'Demirtaşpaşa', 'Hüdavendigar', 'Kükürtlü', 'Muradiye', 'Soğanlı', 'Altıparmak'],
    'Nilüfer': ['Ataevler', 'Beşevler', 'Çamlıca', 'Görükle', 'İhsaniye', 'Odunluk', 'Özlüce'],
    'Yıldırım': ['Demetevler', 'Esenevler', 'Millet', 'Namazgah', 'Yıldırım'],
    'İnegöl': ['Cuma', 'Cumhuriyet', 'Fatih', 'Kemalpaşa'],
    'Gemlik': ['Cumhuriyet', 'Hamidiye', 'Hisar'],
    'Mudanya': ['Güzelyalı Yalı', 'Halitpaşa', 'Tirilye'],
    'Gürsu': ['İstiklal', 'Kurtuluş', 'Zafer'],
    'Kestel': ['Babasultan', 'Esentepe', 'Orhaniye'],
    'Mustafakemalpaşa': ['Cumhuriyet', 'Hamidiye', 'Lütfiye'],
    'Karacabey': ['Esentepe', 'Hamidiye', 'Sultaniye'],
    'Orhangazi': ['Camii Kebir', 'Fatih', 'Hürriyet'],
    'İznik': ['Beyler', 'Eşrefzade', 'Yeni'],
    'Yenişehir': ['Cumhuriyet', 'Kurtuluş', 'Yeni'],
    'Büyükorhan': ['Cumhuriyet', 'Bayındır'],
    'Harmancık': ['Merkez', 'Yeşilyurt'],
    'Keles': ['Cuma', 'Ertuğrulgazi'],
    'Orhaneli': ['Esentepe', 'Fevzipaşa'],
  },
  'Antalya': {
    'Muratpaşa': ['Bahçelievler', 'Fener', 'Güzeloba', 'Konyaaltı', 'Lara', 'Meltem', 'Şirinyalı'],
    'Konyaaltı': ['Altınkum', 'Arapsuyu', 'Hurma', 'Liman', 'Sarısu', 'Uncalı'],
    'Kepez': ['Emek', 'Fabrikalar', 'Gülveren', 'Şafak', 'Varsak Esentepe'],
    'Alanya': ['Cikcilli', 'Kestel', 'Mahmutlar', 'Oba', 'Tosmur', 'Türkler'],
    'Manavgat': ['Çolaklı', 'Ilıca', 'Side', 'Sorgun'],
    'Kemer': ['Beldibi', 'Çamyuva', 'Göynük', 'Tekirova'],
    'Kaş': ['Kalkan', 'Çukurbağ', 'Andifli'],
    'Serik': ['Belek', 'Boğazkent', 'Kadriye'],
    'Aksu': ['Kemerağzı', 'Kundu', 'Yurtpınar'],
    'Döşemealtı': ['Düzlerçamı', 'Karaman', 'Yeniköy'],
    'Akseki': ['Cevizli', 'Güzelsu'],
    'Demre': ['Beymelek', 'Çevreli'],
    'Elmalı': ['Bayındır', 'Yuva'],
    'Finike': ['İskele', 'Sahilkent'],
    'Gazipaşa': ['Cumhuriyet', 'Esentepe'],
    'Gündoğmuş': ['Fatih', 'Ortaköy'],
    'İbradı': ['Ormana', 'Ürünlü'],
    'Korkuteli': ['Karşıyaka', 'Yazır'],
    'Kumluca': ['Merkez', 'Beykonak'],
  },
  'Muğla': {
    'Bodrum': ['Yalıkavak', 'Gündoğan', 'Akyarlar', 'Torba', 'Bitez', 'Gümbet', 'Gümüşlük', 'Konacık', 'Turgutreis', 'Türkbükü'],
    'Fethiye': ['Çalış', 'Göcek', 'Hisarönü', 'Ölüdeniz', 'Çiftlik', 'Karagözler'],
    'Marmaris': ['Armutalan', 'İçmeler', 'Selimiye', 'Siteler', 'Turunç'],
    'Datça': ['Datça', 'İskele', 'Mesudiye', 'Reşadiye'],
    'Dalaman': ['Merkez', 'Karacaağaç'],
    'Kavaklıdere': ['Cumhuriyet', 'Menteşe'],
    'Köyceğiz': ['Köyceğiz', 'Toparlar', 'Sultaniye'],
    'Menteşe': ['Kötekli', 'Muslihittin', 'Orhaniye'],
    'Milas': ['Burgaz', 'Güllük', 'Ören'],
    'Ortaca': ['Dalyan', 'Sarıgerme', 'Cumhuriyet'],
    'Seydikemer': ['Kumluova', 'Eşen', 'Ören'],
    'Ula': ['Akyaka', 'Gökova', 'Ataköy'],
    'Yatağan': ['Cumhuriyet', 'Atatürk', 'Yeni'],
  },
  'Kocaeli': {
    'İzmit': ['Cedit', 'Körfez', 'Yenişehir', 'Yahyakaptan', 'Ömerağa'],
    'Gebze': ['Güzeller', 'Sultan Orhan', 'Osman Yılmaz', 'Mevlana'],
    'Darıca': ['Bayramoğlu', 'Osmangazi', 'Emek'],
    'Çayırova': ['Şekerpınar', 'Atatürk', 'Cumhuriyet'],
    'Başiskele': ['Yuvacık Yakacık', 'Kullar Merkez', 'Sahil'],
    'Derince': ['Deniz', 'Çınarlı', 'Yenikent'],
    'Dilovası': ['Diliskelesi', 'Tavşancıl', 'Fatih'],
    'Gölcük': ['Değirmendere Merkez', 'İhsaniye Merkez', 'Merkez'],
    'Kandıra': ['Çarşı', 'Kefken', 'Kerpe'],
    'Karamürsel': ['4 Temmuz', 'İhsaniye', 'Kadriye'],
    'Kartepe': ['Köseköy', 'Maşukiye', 'Uzunçiftlik'],
    'Körfez': ['Cumhuriyet', 'Yarımca', 'Hereke'],
  },
  'Tekirdağ': {
    'Çerkezköy': ['Atatürk', 'Fatih', 'Kızılpınar'],
    'Çorlu': ['Cumhuriyet', 'Esentepe', 'Reşadiye', 'Zafer'],
    'Kapaklı': ['Atatürk', 'Cumhuriyet', 'Fatih'],
    'Süleymanpaşa': ['Aydoğdu', 'Barbaros', 'Hürriyet'],
    'Ergene': ['Cumhuriyet', 'Velimeşe'],
    'Hayrabolu': ['Cumhuriyet', 'Hisar'],
    'Malkara': ['Cumhuriyet', 'Hürriyet'],
    'Marmara Ereğlisi': [],
    'Muratlı': [],
    'Saray': [],
    'Şarköy': [],
  },
};

// ─── Turkish Names ───────────────────────────────────────
const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hasan', 'Hüseyin', 'İbrahim', 'Osman',
  'Murat', 'Yusuf', 'Emre', 'Burak', 'Serkan', 'Kemal', 'Cem', 'Barış',
  'Onur', 'Tolga', 'Uğur', 'Volkan', 'Engin', 'Tuncay', 'Şenol', 'Gökhan',
  'Erdem', 'Kaan', 'Sinan', 'Cenk', 'Tamer', 'Deniz', 'Orhan', 'Ferhat',
  'Ayşe', 'Fatma', 'Emine', 'Zeynep', 'Elif', 'Merve', 'Büşra', 'Esra',
  'Derya', 'Seda', 'Gül', 'Sibel', 'Pınar', 'Burcu', 'Ebru', 'Gamze',
  'Nalan', 'Özlem', 'Sevgi', 'Dilek', 'Hatice', 'Havva', 'Serpil', 'Tülay',
  'Aslı', 'Canan', 'Filiz', 'Gülşen', 'Hülya', 'Nilgün', 'Selma', 'Yeliz',
  'Tuğçe', 'İrem', 'Selin', 'Cansu', 'Başak', 'Damla', 'Ece', 'Naz',
];

const LAST_NAMES = [
  'Yılmaz', 'Demir', 'Çelik', 'Şahin', 'Kaya', 'Öztürk', 'Arslan', 'Doğan',
  'Aydın', 'Yıldız', 'Özdemir', 'Yıldırım', 'Özer', 'Aktaş', 'Aksoy',
  'Koç', 'Korkmaz', 'Kaplan', 'Acar', 'Güneş', 'Kurt', 'Özkan', 'Şen',
  'Polat', 'Kılıç', 'Bayrak', 'Aslan', 'Erdoğan', 'Çetinkaya', 'Taş',
  'Bulut', 'Sarı', 'Karaca', 'Güler', 'Tekin', 'Başaran', 'Turan', 'Ateş',
  'Keskin', 'Duman', 'Erdem', 'Çakır', 'Bal', 'Toprak', 'Kara', 'Tan',
  'Uysal', 'Alkan', 'Sönmez', 'Bilgin', 'Peker', 'Ceylan', 'Uzun', 'Yalçın',
];

// ─── Company Name Prefixes & Suffixes ────────────────────
const COMPANY_PREFIXES = [
  'Atlas', 'Prestij', 'Vizyon', 'Doruk', 'Nova', 'Mira', 'Pera', 'Altın',
  'Beyaz', 'Mavi', 'Zirve', 'Merkez', 'Panorama', 'ERA', 'MOVA', 'SETA',
  'Royal', 'Park', 'Kent', 'Deniz', 'Ada', 'Kardelen', 'Lotus', 'Selen',
  'Yıldız', 'Güneş', 'Safir', 'Elmas', 'İnci', 'Toprak', 'Değer', 'Denge',
  'Köşe', 'Lider', 'Başarı', 'Güven', 'Baran', 'Ege', 'Akdeniz', 'Karadeniz',
  'Trakya', 'Anadolu', 'Boğaz', 'Sahil', 'Marina', 'Vadi', 'Tepe', 'Burç',
  'Kale', 'Köprü', 'Nehir', 'Göl', 'Orman', 'Bahçe', 'Çiçek', 'Lale',
  'Zambak', 'Papatya', 'Menekşe', 'Çınar', 'Kaynak', 'Pusula', 'Ufuk', 'Seçkin',
  'Elit', 'Platin', 'Kristal', 'Opal', 'Yakut', 'Zümrüt', 'Gümüş', 'Bronz',
  'Metro', 'Cadde', 'Bulvar', 'Sokak', 'Mahalle', 'Semt', 'Forum', 'Plaza',
  'Kıyı', 'Delta', 'Bosphorus', 'Galata', 'Pazar', 'Çarşı', 'Konak', 'Saray',
  'Taç', 'Hilal', 'Yeni', 'Modern', 'Plus', 'Prime', 'Max', 'Net',
];
const COMPANY_SUFFIXES = ['Emlak', 'Gayrimenkul', 'Konut', 'Yapı', 'Grup'];

// ─── Listing Descriptions ────────────────────────────────
const LISTING_DESCRIPTIONS = [
  'Bakımlı, ara kat, güney cephe. Yapı denetimli bina.',
  'Manzaralı, geniş salon, açık mutfak. Site içi.',
  'Yeni bina, kullanılmamış daire. Metro yakını.',
  'Cadde üzeri, kiracılı yatırımlık daire.',
  'Ferah, aydınlık, otoparklı. Okul ve market yakını.',
  'Doğalgaz kombili, ara kat daire. Ulaşıma yakın.',
  'Lüks rezidans dairesi, güvenlikli site içinde.',
  'Deniz manzaralı, geniş balkonlu. Yeni tadilatlı.',
  'Köşe başı, çift cephe, doğa manzaralı.',
  'Merkezi konumda, tüm sosyal olanaklara yakın.',
  'Havuzlu site, kapalı otopark, 7/24 güvenlik.',
  'Yüksek giriş, bahçe katı daire. Geniş teras.',
  'Asansörlü bina, bakımlı daire. Eşyalı teslim.',
  'Prestijli lokasyon, profesyonel tasarım. Lüks malzeme.',
  'Depreme dayanıklı, yeni inşaat. Hemen teslim.',
  'Geniş mutfak, ebeveyn banyosu. Sakin çevre.',
  'Açık mutfak, amerikan mutfak. Modern tasarım.',
  'Yerden ısıtmalı, akıllı ev sistemi. Sıfır bina.',
  'Arakat, kuzeydoğu cephe. Ferah ve aydınlık.',
  'Yatırıma uygun, gelir getiren mülk.',
  'Ticari bölgede, işyerine uygun. Yüksek tavan.',
  'Köşe parselde, imarlı arsa. Konut alanı.',
  'Yola cepheli, altyapısı hazır arsa.',
  'Müstakil, bahçeli ev. Doğa içinde.',
  'Ara kat, güneybatı cephe. Isı yalıtımlı.',
  'Çatı dublex, şömineli. Panoramik manzara.',
  'Dış cephe mantolama yapılmış. Bakımlı apartman.',
  'Ebeveyn banyolu, giyinme odalı. Geniş yaşam alanı.',
  'Metro hattına yürüme mesafesinde. Ulaşım kolay.',
  'Üniversite yakını, kiracı potansiyeli yüksek.',
];

// ─── Demand Notes ────────────────────────────────────────
const DEMAND_NOTES = [
  'Müşterimiz acil arıyor, nakit ödeme yapacak.',
  'Deniz manzaralı, güney cephe tercih ediliyor.',
  'Okul ve hastane yakını olmalı.',
  'Site içi, güvenlikli, kapalı otopark şart.',
  'Metro veya tramvay hattına yakın olmalı.',
  'Yeni bina, 5 yaşından küçük tercih.',
  'Geniş balkon ve teras isteniyor.',
  'Doğalgaz kombili, asansörlü bina aranıyor.',
  'Bahçe katı veya müstakil ev tercih.',
  'Yatırım amaçlı, kiracılı da olabilir.',
  'Müşteri kredi kullanacak, bankaya uygun olmalı.',
  'Eşyalı, taşınmaya hazır daire aranıyor.',
  'Müstakil veya villa tipi ev isteniyor.',
  'AVM ve alışveriş merkezine yakın olmalı.',
  'Park ve yeşil alana yakın, sakin çevre.',
  'Açık mutfak, geniş salon isteniyor.',
  'Lüks segment, prestijli lokasyon aranıyor.',
  'Otoparklı, asansörlü bina şart.',
  'Depreme dayanıklı, yeni yapı aranıyor.',
  'Müşteri emekli, sakin ve huzurlu ortam istiyor.',
  'İş yeri açmak için ticari mülk aranıyor.',
  'Arsa arıyor, konut imarlı olmalı.',
  'Yol kenarı, ticari imarlı arsa tercih.',
  'Denize yakın, tatil evi olarak kullanılacak.',
  'Ailenin büyümesi nedeniyle geniş daire aranıyor.',
  'Yerden ısıtmalı, akıllı ev sistemi tercih.',
  'Ebeveyn banyolu, en az 3+1 daire şart.',
  'Hastane ve sağlık kuruluşlarına yakın olmalı.',
  'Toplu taşıma erişimi kolay olmalı.',
  'Doğa içinde, sessiz ve sakin bir konum isteniyor.',
];

// ─── Heating Types ───────────────────────────────────────
const HEATING_TYPES = ['Doğalgaz (Kombi)', 'Merkezi', 'Yerden Isıtma', 'Klima', null];

const ROOM_COUNTS = ['1+1', '2+1', '3+1', '4+1', '5+1'];

// ─── Price Ranges ────────────────────────────────────────
type PriceRange = { saleMin: number; saleMax: number; rentMin: number; rentMax: number };

const PRICE_RANGES: Record<string, PriceRange> = {
  'İstanbul': { saleMin: 3_000_000, saleMax: 35_000_000, rentMin: 20_000, rentMax: 150_000 },
  'Ankara': { saleMin: 1_500_000, saleMax: 15_000_000, rentMin: 10_000, rentMax: 60_000 },
  'İzmir': { saleMin: 1_500_000, saleMax: 15_000_000, rentMin: 10_000, rentMax: 60_000 },
  'Bursa': { saleMin: 1_500_000, saleMax: 15_000_000, rentMin: 10_000, rentMax: 60_000 },
  'Antalya': { saleMin: 1_500_000, saleMax: 15_000_000, rentMin: 10_000, rentMax: 60_000 },
  'Muğla': { saleMin: 1_500_000, saleMax: 15_000_000, rentMin: 10_000, rentMax: 60_000 },
};
const DEFAULT_PRICE_RANGE: PriceRange = {
  saleMin: 800_000, saleMax: 8_000_000, rentMin: 7_000, rentMax: 35_000,
};

function getPriceRange(city: string): PriceRange {
  return PRICE_RANGES[city] ?? DEFAULT_PRICE_RANGE;
}

// ─── Helpers ─────────────────────────────────────────────
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function randBool(chance = 0.5): boolean {
  return Math.random() < chance;
}

function getNeighborhoods(city: string, district: string): string[] {
  return DISTRICT_NEIGHBORHOODS[city]?.[district] ?? [];
}

function generateCompanyName(index: number): string {
  const prefixIdx = index % COMPANY_PREFIXES.length;
  const suffixIdx = Math.floor(index / COMPANY_PREFIXES.length) % COMPANY_SUFFIXES.length;
  return `${COMPANY_PREFIXES[prefixIdx]} ${COMPANY_SUFFIXES[suffixIdx]}`;
}

function generateTurkishName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function generatePrice(
  city: string,
  transactionType: 'SALE' | 'RENT',
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND',
): number {
  const range = getPriceRange(city);
  let min: number, max: number;

  if (transactionType === 'SALE') {
    min = range.saleMin;
    max = range.saleMax;
    if (propertyType === 'LAND') {
      min = Math.round(min * 0.5);
      max = Math.round(max * 2);
    } else if (propertyType === 'COMMERCIAL') {
      min = Math.round(min * 1.5);
      max = Math.round(max * 3);
    }
  } else {
    min = range.rentMin;
    max = range.rentMax;
    if (propertyType === 'COMMERCIAL') {
      min = Math.round(min * 1.5);
      max = Math.round(max * 3);
    } else if (propertyType === 'LAND') {
      // Land not typically rented, but give a value anyway
      min = Math.round(min * 0.3);
      max = Math.round(max * 0.5);
    }
  }

  // Round to nearest 1000
  return Math.round(randInt(min, max) / 1000) * 1000;
}

// ─── Generate Records ────────────────────────────────────

interface MockUser {
  auth_id: string;
  email: string;
  phone: string;
  name: string;
  company_name: string;
  license_status: string;
  is_mock: boolean;
  is_active: boolean;
  is_admin: boolean;
}

interface Listing {
  agent_id: string;
  city: string;
  district: string;
  neighborhood: string | null;
  transaction_type: 'SALE' | 'RENT';
  property_type: 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND';
  price: number;
  room_count: string | null;
  net_area: number | null;
  gross_area: number | null;
  floor: number | null;
  total_floors: number | null;
  building_age: number | null;
  has_parking: boolean;
  has_elevator: boolean;
  heating_type: string | null;
  description: string;
  status: string;
}

interface Demand {
  agent_id: string;
  city: string;
  district: string;
  neighborhoods: string[];
  transaction_type: 'SALE' | 'RENT';
  property_type: 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND';
  min_budget: number;
  max_budget: number;
  min_rooms: string | null;
  min_area: number | null;
  max_floor: number | null;
  notes: string;
  status: string;
}

function generateListings(
  agentId: string,
  city: string,
  district: string,
): Listing[] {
  const listings: Listing[] = [];
  const neighborhoods = getNeighborhoods(city, district);

  // 8 SALE + 4 RENT = 12
  // 8 RESIDENTIAL + 2 COMMERCIAL + 2 LAND = 12
  const configs: { txn: 'SALE' | 'RENT'; prop: 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND' }[] = [
    // 8 SALE: 6 RESIDENTIAL, 1 COMMERCIAL, 1 LAND
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'COMMERCIAL' },
    { txn: 'SALE', prop: 'LAND' },
    // 4 RENT: 2 RESIDENTIAL, 1 COMMERCIAL, 1 LAND
    { txn: 'RENT', prop: 'RESIDENTIAL' },
    { txn: 'RENT', prop: 'RESIDENTIAL' },
    { txn: 'RENT', prop: 'COMMERCIAL' },
    { txn: 'RENT', prop: 'LAND' },
  ];

  for (const cfg of configs) {
    const price = generatePrice(city, cfg.txn, cfg.prop);

    let netArea: number | null = null;
    let grossArea: number | null = null;
    let floor: number | null = null;
    let totalFloors: number | null = null;
    let buildingAge: number | null = randInt(0, 30);
    let roomCount: string | null = null;

    if (cfg.prop === 'RESIDENTIAL') {
      roomCount = pick(ROOM_COUNTS);
      netArea = randInt(45, 300);
      grossArea = Math.round(netArea * (1.1 + Math.random() * 0.1));
      floor = randInt(1, 15);
      totalFloors = floor + randInt(0, 5);
    } else if (cfg.prop === 'COMMERCIAL') {
      netArea = randInt(50, 500);
      grossArea = Math.round(netArea * (1.1 + Math.random() * 0.15));
      floor = randInt(-1, 10);
      totalFloors = Math.max(floor, 1) + randInt(1, 10);
      buildingAge = randInt(0, 25);
    } else {
      // LAND
      netArea = null;
      grossArea = null;
      floor = null;
      totalFloors = null;
      buildingAge = null;
    }

    const neighborhood = neighborhoods.length > 0 ? pick(neighborhoods) : null;

    listings.push({
      agent_id: agentId,
      city,
      district,
      neighborhood,
      transaction_type: cfg.txn,
      property_type: cfg.prop,
      price,
      room_count: roomCount,
      net_area: netArea,
      gross_area: grossArea,
      floor,
      total_floors: totalFloors,
      building_age: buildingAge,
      has_parking: randBool(0.5),
      has_elevator: randBool(0.6),
      heating_type: pick(HEATING_TYPES),
      description: pick(LISTING_DESCRIPTIONS),
      status: 'ACTIVE',
    });
  }

  return listings;
}

function generateDemands(
  agentId: string,
  city: string,
  district: string,
): Demand[] {
  const demands: Demand[] = [];
  const neighborhoods = getNeighborhoods(city, district);

  const configs: { txn: 'SALE' | 'RENT'; prop: 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND' }[] = [
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'RESIDENTIAL' },
    { txn: 'SALE', prop: 'COMMERCIAL' },
    { txn: 'SALE', prop: 'LAND' },
    { txn: 'RENT', prop: 'RESIDENTIAL' },
    { txn: 'RENT', prop: 'RESIDENTIAL' },
    { txn: 'RENT', prop: 'COMMERCIAL' },
    { txn: 'RENT', prop: 'LAND' },
  ];

  for (const cfg of configs) {
    const price = generatePrice(city, cfg.txn, cfg.prop);
    const multiplier = 1.3 + Math.random() * 0.7; // 1.3 to 2.0
    const minBudget = Math.round(price * 0.8 / 1000) * 1000;
    const maxBudget = Math.round(minBudget * multiplier / 1000) * 1000;

    const demandNeighborhoods =
      neighborhoods.length >= 2 ? pickN(neighborhoods, randInt(2, 3)) : [];

    const minRooms = randBool(0.7) ? pick(['1+1', '2+1', '3+1']) : null;
    const minArea = randBool(0.6) ? pick([50, 80, 100, 120]) : null;
    const maxFloor = randBool(0.4) ? pick([5, 10, 15]) : null;

    demands.push({
      agent_id: agentId,
      city,
      district,
      neighborhoods: demandNeighborhoods,
      transaction_type: cfg.txn,
      property_type: cfg.prop,
      min_budget: minBudget,
      max_budget: maxBudget,
      min_rooms: cfg.prop === 'RESIDENTIAL' ? minRooms : null,
      min_area: cfg.prop !== 'LAND' ? minArea : null,
      max_floor: cfg.prop === 'RESIDENTIAL' ? maxFloor : null,
      notes: pick(DEMAND_NOTES),
      status: 'ACTIVE',
    });
  }

  return demands;
}

// ─── Supabase REST API Helper ────────────────────────────

async function supabaseInsert<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to insert into ${table}: ${res.status} ${text}`);
  }

  return res.json();
}

// deno-lint-ignore no-explicit-any
async function insertInChunks(
  table: string,
  rows: any[],
  chunkSize: number,
): Promise<any[]> {
  const results: any[] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const inserted = await supabaseInsert(table, chunk);
    results.push(...inserted);
    if (rows.length > chunkSize) {
      console.log(`  [${table}] ${Math.min(i + chunkSize, rows.length)}/${rows.length} inserted...`);
    }
  }
  return results;
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  console.log('=== Birlikte Satalım Mock Data Seed ===\n');

  // Collect all districts
  const allDistricts: { city: string; district: string }[] = [];
  for (const [city, districts] of Object.entries(CITY_DISTRICTS)) {
    for (const district of districts) {
      allDistricts.push({ city, district });
    }
  }

  console.log(`Total districts: ${allDistricts.length}`);
  console.log('');

  // Step 1: Generate mock users
  console.log('Step 1: Creating mock users...');
  const mockUsers: MockUser[] = allDistricts.map((d, i) => ({
    auth_id: crypto.randomUUID(),
    email: `mock-${i + 1}@berabersatalim.com`,
    phone: `0500${String(1000000 + i + 1).slice(0)}`,
    name: generateTurkishName(),
    company_name: generateCompanyName(i),
    license_status: randBool(0.4) ? 'approved' : 'none',
    is_mock: true,
    is_active: true,
    is_admin: false,
  }));

  const insertedUsers = await insertInChunks('users', mockUsers, 50);
  console.log(`  Created ${insertedUsers.length} mock users.\n`);

  // Build a map: index → user id
  const userIdMap: Map<number, string> = new Map();
  for (let i = 0; i < insertedUsers.length; i++) {
    userIdMap.set(i, (insertedUsers[i] as any).id);
  }

  // Step 2: Generate listings
  console.log('Step 2: Creating listings...');
  const allListings: Listing[] = [];
  for (let i = 0; i < allDistricts.length; i++) {
    const { city, district } = allDistricts[i];
    const userId = userIdMap.get(i);
    if (!userId) {
      console.error(`  No user ID for district index ${i}`);
      continue;
    }
    const listings = generateListings(userId, city, district);
    allListings.push(...listings);
  }

  console.log(`  Total listings to insert: ${allListings.length}`);
  const insertedListings = await insertInChunks('listings', allListings, 100);
  console.log(`  Created ${insertedListings.length} listings.\n`);

  // Step 3: Generate demands
  console.log('Step 3: Creating buyer demands...');
  const allDemands: Demand[] = [];
  for (let i = 0; i < allDistricts.length; i++) {
    const { city, district } = allDistricts[i];
    const userId = userIdMap.get(i);
    if (!userId) {
      console.error(`  No user ID for district index ${i}`);
      continue;
    }
    const demands = generateDemands(userId, city, district);
    allDemands.push(...demands);
  }

  console.log(`  Total demands to insert: ${allDemands.length}`);
  const insertedDemands = await insertInChunks('buyer_demands', allDemands, 100);
  console.log(`  Created ${insertedDemands.length} buyer demands.\n`);

  // Summary
  console.log('=== SEED COMPLETE ===');
  console.log(`  Users:   ${insertedUsers.length}`);
  console.log(`  Listings: ${insertedListings.length}`);
  console.log(`  Demands:  ${insertedDemands.length}`);
  console.log(`  Total:    ${insertedUsers.length + insertedListings.length + insertedDemands.length}`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
