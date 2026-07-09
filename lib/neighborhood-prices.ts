// Mahalle Bazlı m² Konut Fiyat Verisi
// Kaynak: Endeksa, TCMB KFE, gzt.com, evarsadegeri.com (Mart-Temmuz 2026)
// Son güncelleme: Temmuz 2026
// NOT: Bu veriler referans amaçlıdır, güncel fiyatlar için emlak portallarını kontrol edin.

// Yapi: { [il]: { [ilce]: { [mahalle]: m2_fiyat_TL } } }
export const NEIGHBORHOOD_PRICES: Record<string, Record<string, Record<string, number>>> = {
  // ─── İSTANBUL (Ortalama: 63.446 TL/m²) ─────────────────
  'İstanbul': {
    // Beşiktaş: 160.000 TL/m²
    'Beşiktaş': {
      'Bebek': 208_000,
      'Levazım': 196_000,
      'Etiler': 200_000,
      'Levent': 192_000,
      'Nisbetiye': 188_000,
      'Ulus': 184_000,
      'Akatlar': 180_000,
      'Konaklar': 178_000,
      'Kuruçeşme': 176_000,
      'Gayrettepe': 172_000,
      'Arnavutköy': 168_000,
      'Ortaköy': 160_000,
      'Dikilitaş': 156_000,
      'Sinanpaşa': 152_000,
      'Abbasağa': 148_000,
      'Vişnezade': 146_000,
      'Yıldız': 144_000,
      'Muradiye': 140_000,
      'Türkali': 136_000,
      'Cihannüma': 128_000,
    },
    // Kadıköy: 155.000 TL/m²
    'Kadıköy': {
      'Fenerbahçe': 200_000,
      'Suadiye': 194_000,
      'Caddebostan': 186_000,
      'Moda': 185_000,
      'Caferağa': 178_000,
      'Acıbadem': 172_000,
      'Osmanağa': 170_000,
      'Koşuyolu': 168_000,
      'Zühtüpaşa': 164_000,
      'Rasimpaşa': 162_000,
      'Erenköy': 160_000,
      'Yeldeğirmeni': 158_000,
      'Bostancı': 155_000,
      'Göztepe': 148_000,
      'Feneryolu': 145_000,
      'Kozyatağı': 140_000,
      'Hasanpaşa': 138_000,
      'Sahrayıcedit': 132_000,
      'Merdivenköy': 132_000,
      'İçerenköy': 130_000,
      'Dumlupınar': 126_000,
      'Fikirtepe': 120_000,
    },
    // Sarıyer: 150.000 TL/m²
    'Sarıyer': {
      'Maslak': 195_000,
      'İstinye': 188_000,
      'Emirgan': 180_000,
      'Baltalimanı': 175_000,
      'Tarabya': 172_000,
      'Rumelihisarı': 165_000,
      'Yeniköy': 158_000,
      'Kireçburnu': 156_000,
      'Büyükdere': 150_000,
      'Reşitpaşa': 148_000,
      'Ayazağa': 142_000,
      'Zekeriyaköy': 135_000,
      'Fatih Sultan Mehmet': 132_000,
      'Darüşşafaka': 128_000,
      'Bahçeköy': 120_000,
      'PTT Evleri': 118_000,
      'Pınar': 116_000,
      'Rumeli Kavağı': 112_000,
      'Çamlıtepe': 110_000,
    },
    // Bakırköy: 115.000 TL/m²
    'Bakırköy': {
      'Ataköy 7-8-9-10. Kısım': 162_000,
      'Ataköy 3-4-11. Kısım': 158_000,
      'Ataköy': 150_000,
      'Ataköy 2-5-6. Kısım': 150_000,
      'Ataköy 1. Kısım': 146_000,
      'Florya': 142_000,
      'Yeşilköy': 138_000,
      'Basınköy': 130_000,
      'Yeşilyurt': 125_000,
      'Şenlikköy': 118_000,
      'Zeytinlik': 112_000,
      'Osmaniye': 105_000,
      'Kartaltepe': 100_000,
      'Sakızağacı': 95_000,
      'Cevizlik': 90_000,
      'Zuhuratbaba': 88_000,
      'Mahmutbey': 82_000,
    },
    // Beykoz: 105.000 TL/m²
    'Beykoz': {
      'Kanlıca': 145_000,
      'Anadoluhisarı': 137_000,
      'Kavacık': 130_000,
      'Rüzgarlıbahçe': 125_000,
      'Çubuklu': 120_000,
      'Göksu': 115_000,
      'Acarlar': 112_000,
      'Gümüşsuyu': 108_000,
      'Paşabahçe': 105_000,
      'Yalıköy': 100_000,
      'İncirköy': 95_000,
      'Polonezköy': 90_000,
      'Riva': 85_000,
      'Çavuşbaşı': 82_000,
      'Anadolu Kavağı': 80_000,
    },
    // Üsküdar: 95.000 TL/m²
    'Üsküdar': {
      'Vaniköy': 135_000,
      'Beylerbeyi': 124_000,
      'Çengelköy': 120_000,
      'Kuzguncuk': 118_000,
      'Salacak': 116_000,
      'İcadiye': 114_000,
      'Kandilli': 112_000,
      'Altunizade': 105_000,
      'Selimiye': 102_000,
      'Acıbadem': 100_000,
      'Aziz Mahmut Hüdayi': 98_000,
      'Kısıklı': 95_000,
      'Validei Atik': 92_000,
      'Burhaniye': 90_000,
      'Ferah': 88_000,
      'Bahçelievler': 86_000,
      'Ünalan': 85_000,
      'Bulgurlu': 80_000,
      'Küçükçamlıca': 78_000,
      'Yavuztürk': 74_000,
      'Mimar Sinan': 72_000,
    },
    // Adalar: 90.000 TL/m²
    'Adalar': {
      'Büyükada': 117_000,
      'Heybeliada': 100_000,
      'Burgazada': 95_000,
      'Kınalıada': 80_000,
      'Sedef Adası': 72_000,
    },
    // Maltepe: 82.000 TL/m²
    'Maltepe': {
      'Dragos': 115_000,
      'İdealtepe': 107_000,
      'Altayçeşme': 102_000,
      'Altıntepe': 98_000,
      'Küçükyalı': 95_000,
      'Yalı': 90_000,
      'Aydınevler': 85_000,
      'Zümrütevler': 80_000,
      'Girne': 78_000,
      'Cevizli': 75_000,
      'Esenkent': 72_000,
      'Bağlarbaşı': 70_000,
      'Feyzullah': 68_000,
      'Fındıklı': 65_000,
      'Çınar': 62_000,
      'Başıbüyük': 60_000,
      'Gülensu': 55_000,
      'Gülsuyu': 52_000,
    },
    // Ataşehir: 77.000 TL/m²
    'Ataşehir': {
      'Barbaros': 100_000,
      'Küçükbakkalköy': 95_000,
      'Yeni Çamlıca': 92_000,
      'Atatürk': 88_000,
      'Batı Ataşehir': 85_000,
      'İçerenköy': 82_000,
      'Yenisahra': 77_000,
      'Yenişehir': 75_000,
      'Esatpaşa': 74_000,
      'Mustafa Kemal': 72_000,
      'İnönü': 70_000,
      'Mevlana': 68_000,
      'Mimar Sinan': 65_000,
      'Aşık Veysel': 64_000,
      'Fetih': 62_000,
      'Ferhatpaşa': 62_000,
      'Kayışdağı': 58_000,
    },
    // Zeytinburnu: 74.000 TL/m²
    'Zeytinburnu': {
      'Kazlıçeşme': 96_000,
      'Merkezefendi': 88_000,
      'Beştelsiz': 82_000,
      'Sümer': 76_000,
      'Nuripaşa': 72_000,
      'Telsiz': 68_000,
      'Veliefendi': 65_000,
      'Maltepe': 62_000,
      'Gökalp': 60_000,
      'Çırpıcı': 58_000,
      'Seyitnizam': 56_000,
      'Yeşiltepe': 54_000,
    },
    // Şişli: 72.000 TL/m²
    'Şişli': {
      'Nişantaşı': 94_000,
      'Teşvikiye': 90_000,
      'Harbiye': 88_000,
      'Osmanbey': 86_000,
      'Mecidiyeköy': 82_000,
      'Esentepe': 80_000,
      'Bomonti': 78_000,
      'Fulya': 76_000,
      'Halaskargazi': 74_000,
      'Meşrutiyet': 72_000,
      'Pangaltı': 70_000,
      'Dikilitaş': 68_000,
      'Cumhuriyet': 68_000,
      'Feriköy': 66_000,
      'Gülbahar': 64_000,
      'İnönü': 62_000,
      'İstiklal': 60_000,
      'Duatepe': 58_000,
      'Yayla': 56_000,
      'Kuştepe': 55_000,
      'Paşa': 52_000,
    },
    // Başakşehir: 72.000 TL/m²
    'Başakşehir': {
      'Bahçeşehir 1. Kısım': 94_000,
      'Bahçeşehir 2. Kısım': 88_000,
      'Başak': 75_000,
      'Ziya Gökalp': 72_000,
      'Altınşehir': 68_000,
      'Kayabaşı': 65_000,
      'Başakşehir': 62_000,
      'Kayaşehir': 60_000,
      'Şahintepe': 60_000,
      'Güvercintepe': 55_000,
    },
    // Pendik: 73.000 TL/m²
    'Pendik': {
      'Batı': 160_000,
      'Kurtköy': 105_000,
      'Güzelyalı': 95_000,
      'Yenişehir': 82_000,
      'Kaynarca': 72_000,
      'Velibaba': 65_000,
      'Bahçelievler': 58_000,
      'Fevzi Çakmak': 55_000,
      'Sapanbağları': 52_000,
      'Dumlupınar': 48_000,
      'Ramazanoğlu': 46_000,
      'Esenyalı': 44_000,
      'Esenler': 42_000,
      'Doğu': 40_000,
      'Güllü Bağlar': 38_000,
      'Ahmet Yesevi': 38_000,
      'Çamçeşme': 35_000,
      'Çınardere': 33_000,
    },
    // Kartal: 65.000 TL/m²
    'Kartal': {
      'Kordonboyu': 130_000,
      'Hürriyet': 80_000,
      'Esentepe': 75_000,
      'Cevizli': 72_000,
      'Atalar': 68_000,
      'Uğur Mumcu': 60_000,
      'Topselvi': 56_000,
      'Karlıktepe': 54_000,
      'Soğanlık': 52_000,
      'Çavuşoğlu': 48_000,
      'Yakacık': 45_000,
      'Yukarı': 44_000,
      'Orhantepe': 42_000,
    },
    // Ümraniye: 65.000 TL/m²
    'Ümraniye': {
      'Armağanevler': 85_000,
      'Atatürk': 78_000,
      'Site': 75_000,
      'Çakmak': 68_000,
      'Tatlısu': 66_000,
      'İstiklal': 65_000,
      'Saray': 62_000,
      'Hekimbaşı': 60_000,
      'Esenşehir': 58_000,
      'Namık Kemal': 55_000,
      'Yukarı Dudullu': 54_000,
      'Tantavi': 52_000,
      'Aşağı Dudullu': 52_000,
      'Altınşehir': 50_000,
      'Çamlık': 48_000,
      'İnkılap': 47_000,
      'Kazım Karabekir': 46_000,
      'Parseller': 44_000,
      'Madenler': 42_000,
      'Tepetarla': 40_000,
      'Esenevler': 38_000,
    },
    // Tuzla: 60.000 TL/m²
    'Tuzla': {
      'İçmeler': 78_000,
      'Postane': 68_000,
      'Mimar Sinan': 64_000,
      'Evliya Çelebi': 62_000,
      'Cami': 60_000,
      'Aydınlı': 58_000,
      'Aydıntepe': 56_000,
      'Yayla': 55_000,
      'Fatih': 52_000,
      'Mescit': 50_000,
      'Orhanlı': 48_000,
      'İstasyon': 46_000,
      'Şifa': 45_000,
    },
    // Kağıthane: 58.000 TL/m²
    'Kağıthane': {
      'Çeliktepe': 75_000,
      'Harmantepe': 70_000,
      'Gültepe': 65_000,
      'Seyrantepe': 62_000,
      'Yahya Kemal': 58_000,
      'Hamidiye': 56_000,
      'Merkez': 54_000,
      'Emniyet': 52_000,
      'Hürriyet': 50_000,
      'Mehmet Akif Ersoy': 48_000,
      'Nurtepe': 48_000,
      'Ortabayır': 46_000,
      'Çağlayan': 45_000,
      'Talatpaşa': 44_000,
      'Sanayi': 42_000,
      'Şirintepe': 40_000,
    },
    // Eyüpsultan: 57.000 TL/m²
    'Eyüpsultan': {
      'Göktürk': 74_000,
      'İslambey': 68_000,
      'Kemerburgaz': 62_000,
      'Nişancı': 57_000,
      'Defterdar': 55_000,
      'Alibeyköy': 52_000,
      'Akşemsettin': 48_000,
      'Silahtarağa': 46_000,
      'Rami': 45_000,
      'Yeşilpınar': 44_000,
      'Pirinççi': 43_000,
      'Topçular': 42_000,
      'Emniyettepe': 40_000,
      'Çırçır': 38_000,
    },
    // Çekmeköy: 55.000 TL/m²
    'Çekmeköy': {
      'Merkez': 72_000,
      'Mimar Sinan': 65_000,
      'Taşdelen': 62_000,
      'Alemdağ': 58_000,
      'Mehmet Akif': 55_000,
      'Hamidiye': 50_000,
      'Nişantepe': 48_000,
      'Çamlık': 46_000,
      'Sultançiftliği': 44_000,
      'Ömerli': 42_000,
    },
    // Sancaktepe: 52.000 TL/m²
    'Sancaktepe': {
      'Yenidoğan': 68_000,
      'Sarıgazi': 60_000,
      'Osmangazi': 55_000,
      'Abdurrahman Gazi': 52_000,
      'Atatürk': 50_000,
      'Fatih': 48_000,
      'Meclis': 47_000,
      'İnönü': 45_000,
      'Emek': 44_000,
      'Akpınar': 42_000,
      'Eyüp Sultan': 40_000,
      'Merve': 38_000,
      'Veysel Karani': 36_000,
    },
    // Küçükçekmece: 50.000 TL/m²
    'Küçükçekmece': {
      'Atakent': 65_000,
      'Halkalı': 58_000,
      'Cennet': 55_000,
      'Sefaköy': 52_000,
      'Atatürk': 50_000,
      'İnönü': 48_000,
      'Beşyol': 45_000,
      'Fatih': 44_000,
      'Mehmet Akif': 42_000,
      'Kanarya': 40_000,
      'Cumhuriyet': 38_000,
      'Gültepe': 37_000,
      'Kemalpaşa': 36_000,
      'Fevzi Çakmak': 35_000,
      'Söğütlüçeşme': 34_000,
      'Yeşilova': 33_000,
      'Yarımburgaz': 30_000,
    },
    // Bahçelievler: 52.000 TL/m²
    'Bahçelievler': {
      'Bahçelievler': 68_000,
      'Şirinevler': 60_000,
      'Soganli': 55_000,
      'Kocasinan': 52_000,
      'Yenibosna': 48_000,
      'Çobançeşme': 45_000,
      'Siyavuşpaşa': 43_000,
      'Hürriyet': 42_000,
      'Fevzi Çakmak': 40_000,
      'Zafer': 38_000,
    },
    // Bayrampaşa: 50.000 TL/m²
    'Bayrampaşa': {
      'Yıldırım': 65_000,
      'Muratpaşa': 58_000,
      'Kocatepe': 52_000,
      'Altıntepsi': 50_000,
      'Cevatpaşa': 46_000,
      'Orta': 44_000,
      'İsmetpaşa': 42_000,
      'Terazidere': 40_000,
      'Vatan': 38_000,
      'Yenidoğan': 36_000,
    },
    // Bağcılar: 48.000 TL/m²
    'Bağcılar': {
      'Güneşli': 62_000,
      'Kirazlı': 55_000,
      'Mahmutbey': 52_000,
      'Yıldıztepe': 48_000,
      'Fatih': 45_000,
      'Hürriyet': 44_000,
      'Barbaros': 42_000,
      'Evren': 41_000,
      'Yenimahalle': 40_000,
      'Merkez': 40_000,
      'Çınar': 39_000,
      'Bağlar': 38_000,
      'Demirkapı': 38_000,
      'Sancaktepe': 37_000,
      'Kemalpaşa': 37_000,
      'İnönü': 36_000,
      'Kazım Karabekir': 36_000,
      'Yenigün': 35_000,
      'Fevzi Çakmak': 34_000,
      'Yavuz Selim': 33_000,
    },
    // Güngören: 45.000 TL/m²
    'Güngören': {
      'Merkez': 59_000,
      'Tozkoparan': 52_000,
      'Güneştepe': 48_000,
      'Haznedar': 45_000,
      'Güven': 44_000,
      'Gençosman': 42_000,
      'Mehmet Nesih Özmen': 40_000,
      'Akıncılar': 38_000,
      'Mareşal Çakmak': 36_000,
      'Sanayi': 34_000,
    },
    // Avcılar: 45.000 TL/m²
    'Avcılar': {
      'Cihangir': 59_000,
      'Ambarlı': 52_000,
      'Üniversite': 50_000,
      'Merkez': 48_000,
      'Denizköşkler': 45_000,
      'Mustafa Kemal Paşa': 43_000,
      'Firuzköy': 42_000,
      'Tahtakale': 40_000,
      'Gümüşpala': 38_000,
      'Yeşilkent': 35_000,
    },
    // Gaziosmanpaşa: 44.000 TL/m²
    'Gaziosmanpaşa': {
      'Merkez': 57_000,
      'Bağlarbaşı': 52_000,
      'Yıldıztabya': 48_000,
      'Hürriyet': 46_000,
      'Barbaros': 44_000,
      'Mevlana': 42_000,
      'Karadeniz': 40_000,
      'Karlıtepe': 39_000,
      'Yenimahalle': 38_000,
      'Kazım Karabekir': 36_000,
      'Sarıgöl': 34_000,
    },
    // Fatih: 42.000 TL/m²
    'Fatih': {
      'Sultanahmet': 55_000,
      'Süleymaniye': 54_000,
      'Balat': 52_000,
      'Fener': 50_000,
      'Vefa': 48_000,
      'Beyazıt': 47_000,
      'Laleli': 46_000,
      'Çarşamba': 44_000,
      'Cankurtaran': 44_000,
      'Saraçhane': 43_000,
      'Karagümrük': 42_000,
      'Cerrahpaşa': 40_000,
      'Edirnekapı': 39_000,
      'Aksaray': 38_000,
      'Zeyrek': 37_000,
      'Yedikule': 36_000,
      'Kumkapı': 35_000,
      'Topkapı': 34_000,
      'Haseki': 32_000,
    },
    // Esenler: 42.000 TL/m²
    'Esenler': {
      'Menderes': 55_000,
      'Oruçreis': 48_000,
      'Davutpaşa': 45_000,
      'Atışalanı': 44_000,
      'Fatih': 42_000,
      'Oruç Reis': 41_000,
      'Birlik': 38_000,
      'Namık Kemal': 37_000,
      'Kazım Karabekir': 36_000,
      'Kâzım Karabekir': 36_000,
      'Tuna': 35_000,
      'Fevzi Çakmak': 34_000,
      'Yavuz Selim': 33_000,
      'Havaalanı': 32_000,
    },
    // Beylikdüzü: 45.000 TL/m²
    'Beylikdüzü': {
      'Adnan Kahveci': 59_000,
      'Sahil': 55_000,
      'Cumhuriyet': 52_000,
      'Büyükşehir': 50_000,
      'Yakuplu': 48_000,
      'Marmara': 46_000,
      'Barış': 45_000,
      'Kavakpınar': 42_000,
      'İnönü': 40_000,
      'Dereağzı': 40_000,
      'Gürpınar': 38_000,
      'Kavaklı': 35_000,
    },
    // Arnavutköy: 40.000 TL/m²
    'Arnavutköy': {
      'Hadımköy': 52_000,
      'Haraççı': 46_000,
      'Merkez': 42_000,
      'İmrahor': 40_000,
      'Yeşilbayır': 38_000,
      'Taşoluk': 36_000,
      'Karlıbayır': 35_000,
      'Bolluca': 34_000,
      'Yassıören': 32_000,
      'Dursunköy': 30_000,
    },
    // Sultangazi: 39.000 TL/m²
    'Sultangazi': {
      'Cebeci': 51_000,
      'Esentepe': 45_000,
      'Zübeyde Hanım': 42_000,
      'Cumhuriyet': 40_000,
      '50. Yıl': 38_000,
      'Uğur Mumcu': 37_000,
      'Yunus Emre': 36_000,
      'Malkoçoğlu': 35_000,
      'Sultançiftliği': 34_000,
      'Yayla': 33_000,
      'Habibler': 32_000,
      'İsmetpaşa': 31_000,
      'Gazi': 30_000,
    },
    // Sultanbeyli: 38.000 TL/m²
    'Sultanbeyli': {
      'Merkez': 49_000,
      'Battalgazi': 44_000,
      'Fatih': 40_000,
      'Abdurrahman Gazi': 38_000,
      'Hamidiye': 36_000,
      'Hasanpaşa': 35_000,
      'Orhangazi': 34_000,
      'Mecidiye': 33_000,
      'Mehmet Akif': 32_000,
      'Mimar Sinan': 31_000,
      'Necip Fazıl': 30_000,
      'Turgut Reis': 29_000,
      'Yavuz Selim': 29_000,
    },
    // Büyükçekmece: 48.000 TL/m²
    'Büyükçekmece': {
      'Mimarsinan': 62_000,
      'Ulus': 55_000,
      'Bahçelievler': 52_000,
      'Fatih': 50_000,
      'Kumburgaz': 48_000,
      'Atatürk': 46_000,
      'Cumhuriyet': 45_000,
      'Pınartepe': 44_000,
      'Kamiloba': 42_000,
      'Batıköy': 40_000,
      'Türkoba': 38_000,
      'Muratbey': 37_000,
    },
    // Silivri: 38.000 TL/m²
    'Silivri': {
      'Merkez': 49_000,
      'Selimpaşa': 44_000,
      'Alibey': 42_000,
      'Kavaklı': 40_000,
      'Mimarsinan': 39_000,
      'Ortaköy': 38_000,
      'Cumhuriyet': 37_000,
      'Fatih': 36_000,
      'Piri Mehmet Paşa': 35_000,
      'Değirmenköy': 34_000,
      'Yolçatı': 32_000,
      'Çanta': 30_000,
      'Semizkumlar': 28_000,
    },
    // Çatalca: 32.000 TL/m²
    'Çatalca': {
      'Merkez': 42_000,
      'Çatalca Merkez': 42_000,
      'Ferhatpaşa': 36_000,
      'Kaleiçi': 34_000,
      'Subaşı': 32_000,
      'Kestanelik': 30_000,
      'Ovayenice': 26_000,
      'Muratbey': 24_000,
    },
    // Şile: 40.000 TL/m²
    'Şile': {
      'Merkez': 52_000,
      'Ağva': 46_000,
      'Sahilköy': 44_000,
      'Kumbaba': 42_000,
      'Hacıkasım': 40_000,
      'Sofular': 38_000,
      'Üvezli': 36_000,
      'Balibey': 34_000,
      'Doğancılı': 30_000,
    },
    // Esenyurt: 30.000 TL/m²
    'Esenyurt': {
      'Bahçeşehir 1. Kısım': 48_000,
      'Bahçeşehir 2. Kısım': 45_000,
      'Pınar': 39_000,
      'Fatih': 35_000,
      'Yeşilkent': 32_000,
      'Yenikent': 31_000,
      'İnönü': 30_000,
      'İstiklal': 29_000,
      'Ardıçlı': 28_000,
      'Namık Kemal': 27_000,
      'Kıraç': 26_000,
      'Mehterçeşme': 26_000,
      'Talatpaşa': 25_000,
      'Saadetdere': 24_000,
      'Üçevler': 23_000,
      'Akevler': 22_000,
    },
    // Beyoğlu: 68.000 TL/m²
    'Beyoğlu': {
      'Cihangir': 95_000,
      'Gümüşsuyu': 90_000,
      'Tomtom': 88_000,
      'Firuzağa': 85_000,
      'Galata': 82_000,
      'Çukurcuma': 80_000,
      'Asmalımescit': 78_000,
      'Pürtelaş': 65_000,
      'Ömeravni': 60_000,
      'Kulaksız': 55_000,
      'Kasımpaşa': 50_000,
      'Tarlabaşı': 45_000,
    },
  },

  // ─── ANKARA (Ortalama: 43.272 TL/m²) ────────────────────
  'Ankara': {
    // Çankaya: 60.000 TL/m²
    'Çankaya': {
      'Gaziosmanpaşa': 78_000,
      'Kavaklıdere': 75_000,
      'Çukurambar': 72_000,
      'Ayrancı': 68_000,
      'Birlik': 64_000,
      'Mustafa Kemal': 60_000,
      'Ümitköy': 58_000,
      'Çayyolu': 55_000,
      'Balgat': 52_000,
      'Bahçelievler': 50_000,
      'Dikmen': 48_000,
      'Cevizlidere': 46_000,
    },
    // Etimesgut: 48.000 TL/m²
    'Etimesgut': {
      'Bağlıca': 62_000,
      'Eryaman': 55_000,
      'Elvankent': 50_000,
      'Yapracık': 46_000,
      'Topçu': 42_000,
      'Ayyıldız': 38_000,
      'Süvari': 36_000,
    },
    // Yenimahalle: 42.000 TL/m²
    'Yenimahalle': {
      'Çiğdem': 55_000,
      'Mehmet Akif Ersoy': 50_000,
      'Batıkent': 45_000,
      'Kardelen': 42_000,
      'Demetevler': 38_000,
      'Ostim': 35_000,
      'Güventepe': 32_000,
      'Yuva': 30_000,
    },
    // Keçiören: 34.000 TL/m²
    'Keçiören': {
      'Etlik': 44_000,
      'Subayevleri': 40_000,
      'Atapark': 38_000,
      'Kuşcağız': 34_000,
      'Kalaba': 30_000,
      'Bağlum': 28_000,
      'Ovacık': 26_000,
      'Esertepe': 24_000,
    },
    // Pursaklar: 32.000 TL/m²
    'Pursaklar': {
      'Saray': 42_000,
      'Fatih': 36_000,
      'Merkez': 32_000,
      'Altınova': 28_000,
      'Yukarı Murtaza': 26_000,
      'Sirkeli': 24_000,
    },
    // Sincan: 34.000 TL/m²
    'Sincan': {
      'Fatih': 44_000,
      'Tandoğan': 40_000,
      'Yenikent': 36_000,
      'Merkez': 34_000,
      'Pınarbaşı': 30_000,
      'Temelli': 26_000,
      'Akşemsettin': 24_000,
    },
    // Mamak: 25.000 TL/m²
    'Mamak': {
      'Abidinpaşa': 33_000,
      'Natoyolu': 28_000,
      'Kutlu': 26_000,
      'Gülveren': 24_000,
      'Şahintepe': 22_000,
      'Misket': 20_000,
      'Derbent': 18_000,
    },
    // Gölbaşı: 38.000 TL/m²
    'Gölbaşı': {
      'İncek': 49_000,
      'Karşıyaka': 42_000,
      'Bahçelievler': 38_000,
      'Karagedik': 34_000,
      'Virancık': 30_000,
      'Eymir': 28_000,
    },
    // Altındağ: 28.000 TL/m²
    'Altındağ': {
      'Battalgazi': 36_000,
      'Hacıbayram': 32_000,
      'Beşikkaya': 28_000,
      'Ulubey': 26_000,
      'Siteler': 24_000,
      'Doğantepe': 22_000,
      'Karapürçek': 20_000,
    },
    // Çubuk: 22.000 TL/m²
    'Çubuk': {
      'Merkez': 29_000,
      'Cumhuriyet': 24_000,
      'Aşağıçavundur': 22_000,
      'Dumlupınar': 18_000,
      'Kızılca': 16_000,
    },
    // Polatlı: 18.000 TL/m²
    'Polatlı': {
      'Merkez': 23_000,
      'Zafer': 20_000,
      'Cumhuriyet': 18_000,
      'Yenice': 15_000,
      'Karşıyaka': 14_000,
    },
  },

  // ─── İZMİR (Ortalama: 51.000 TL/m²) ────────────────────
  'İzmir': {
    // Karşıyaka: 68.000 TL/m²
    'Karşıyaka': {
      'Mavişehir': 88_000,
      'Bostanlı': 82_000,
      'Donanmacı': 74_000,
      'Alaybey': 68_000,
      'Tersane': 64_000,
      'Şemikler': 58_000,
      'Nergiz': 54_000,
      'Örnekköy': 52_000,
    },
    // Narlıdere: 65.000 TL/m²
    'Narlıdere': {
      'Çatalkaya': 85_000,
      'Arıkent': 75_000,
      'Huzur': 68_000,
      'Narlı': 62_000,
      'Atatürk': 58_000,
      'Çamtepe': 52_000,
    },
    // Konak: 58.000 TL/m²
    'Konak': {
      'Alsancak': 75_000,
      'Güzelyalı': 68_000,
      'Hatay': 64_000,
      'Göztepe': 60_000,
      'Küçükyalı': 58_000,
      'Kahramanlar': 54_000,
      'Kemeraltı': 50_000,
      'Basmane': 44_000,
    },
    // Balçova: 60.000 TL/m²
    'Balçova': {
      'Bahçelerarası': 78_000,
      'Çetin Emeç': 68_000,
      'Atatürk': 62_000,
      'Onur': 58_000,
      'Korutürk': 54_000,
      'Teleferik': 48_000,
    },
    // Bornova: 52.000 TL/m²
    'Bornova': {
      'Erzene': 68_000,
      'Kazımdirik': 60_000,
      'Ergene': 55_000,
      'Altındağ': 52_000,
      'Birlik': 48_000,
      'Çamdibi': 44_000,
      'Mevlana': 40_000,
      'Doğanlar': 38_000,
    },
    // Bayraklı: 48.000 TL/m²
    'Bayraklı': {
      'Manavkuyu': 62_000,
      'Mansuroğlu': 56_000,
      'Bayraklı': 50_000,
      'Çiçek': 48_000,
      'Postacılar': 44_000,
      'Alparslan': 38_000,
      'Osmangazi': 36_000,
    },
    // Buca: 42.000 TL/m²
    'Buca': {
      'Adatepe': 55_000,
      'Kozağaç': 48_000,
      'Çamlık': 44_000,
      'Tınaztepe': 42_000,
      'Buca Koop': 38_000,
      'Kuruçeşme': 35_000,
      'Şirinyer': 32_000,
    },
    // Gaziemir: 44.000 TL/m²
    'Gaziemir': {
      'Atıfbey': 57_000,
      'Sarnıç': 50_000,
      'Gazi': 46_000,
      'Sakarya': 42_000,
      'Önder': 38_000,
      'Sevgi': 34_000,
    },
    // Çiğli: 40.000 TL/m²
    'Çiğli': {
      'Mavişehir': 52_000,
      'Ataşehir': 46_000,
      'Küçükçiğli': 42_000,
      'Balatçık': 38_000,
      'Egekent': 36_000,
      'Harmandalı': 30_000,
    },
    // Güzelbahçe: 55.000 TL/m²
    'Güzelbahçe': {
      'Yalı': 72_000,
      'Kahramandere': 62_000,
      'Atatürk': 55_000,
      'Çamlı': 50_000,
      'Maltepe': 44_000,
    },
    // Menemen: 28.000 TL/m²
    'Menemen': {
      'Merkez': 36_000,
      'Kasımpaşa': 30_000,
      'Seyrek': 28_000,
      'Ulukent': 26_000,
      'Villakent': 22_000,
    },
    // Torbalı: 30.000 TL/m²
    'Torbalı': {
      'Merkez': 39_000,
      'Ayrancılar': 34_000,
      'Pancar': 30_000,
      'Subaşı': 26_000,
      'Çaybaşı': 22_000,
    },
    // Çeşme: 80.000 TL/m²
    'Çeşme': {
      'Alaçatı': 104_000,
      'Ilıca': 92_000,
      'Dalyan': 82_000,
      'Çiftlikköy': 76_000,
      'Reisdere': 68_000,
      'Boyalık': 62_000,
    },
    // Urla: 55.000 TL/m²
    'Urla': {
      'İskele': 72_000,
      'Merkez': 60_000,
      'Zeytinalanı': 55_000,
      'Kuşçular': 48_000,
      'Demircili': 42_000,
    },
    // Seferihisar: 42.000 TL/m²
    'Seferihisar': {
      'Sığacık': 55_000,
      'Merkez': 46_000,
      'Ürkmez': 42_000,
      'Doğanbey': 38_000,
      'Düzce': 32_000,
    },
    // Foça: 38.000 TL/m²
    'Foça': {
      'Eski Foça': 49_000,
      'Yeni Foça': 42_000,
      'Merkez': 38_000,
      'Bağarası': 30_000,
      'Gerenköy': 28_000,
    },
  },

  // ─── BURSA (Ortalama: 39.297 TL/m²) ────────────────────
  'Bursa': {
    // Nilüfer: 52.000 TL/m²
    'Nilüfer': {
      'Çamlıca': 68_000,
      'Beşevler': 62_000,
      'Özlüce': 58_000,
      'İhsaniye': 55_000,
      'Görükle': 52_000,
      'Ataevler': 48_000,
      'Ertuğrul': 44_000,
      'Karaman': 40_000,
    },
    // Mudanya: 48.000 TL/m²
    'Mudanya': {
      'Güzelyalı': 62_000,
      'Halitpaşa': 52_000,
      'Ömerbey': 48_000,
      'Şükrüçavuş': 44_000,
      'Kumyaka': 40_000,
      'Trilye': 38_000,
    },
    // Osmangazi: 40.000 TL/m²
    'Osmangazi': {
      'Çekirge': 52_000,
      'Kükürtlü': 46_000,
      'Hüdavendigâr': 42_000,
      'Hamitler': 38_000,
      'Soğanlı': 36_000,
      'Demirtaş': 34_000,
      'Panayır': 30_000,
    },
    // Yıldırım: 30.000 TL/m²
    'Yıldırım': {
      'Esenevler': 39_000,
      'Beyazıt': 34_000,
      'Millet': 30_000,
      'Yiğitler': 28_000,
      'Bağlarbaşı': 26_000,
      'Namazgah': 22_000,
    },
    // Gemlik: 32.000 TL/m²
    'Gemlik': {
      'Hamidiye': 42_000,
      'Kayhan': 36_000,
      'Cumhuriyet': 32_000,
      'Hisar': 28_000,
      'Umurbey': 24_000,
    },
    // İnegöl: 28.000 TL/m²
    'İnegöl': {
      'Alanyurt': 36_000,
      'Sinanbey': 32_000,
      'Cuma': 28_000,
      'Kemalpaşa': 26_000,
      'Turgutalp': 22_000,
    },
    // Kestel: 26.000 TL/m²
    'Kestel': {
      'Merkez': 34_000,
      'Barakfaki': 28_000,
      'Sülüklügöl': 26_000,
      'Dudaklı': 22_000,
      'Gümüştepe': 20_000,
    },
    // Gürsu: 28.000 TL/m²
    'Gürsu': {
      'Zafer': 36_000,
      'Yeni': 30_000,
      'Vatan': 28_000,
      'Heceler': 24_000,
      'Ulus': 22_000,
    },
    // Orhangazi: 25.000 TL/m²
    'Orhangazi': {
      'Merkez': 33_000,
      'Yenimahalle': 28_000,
      'Gedelek': 25_000,
      'Çakırlı': 22_000,
      'Sölöz': 18_000,
    },
  },

  // ─── ANTALYA ────────────────────────────────────────────
  'Antalya': {
    // Konyaaltı: 68.000 TL/m²
    'Konyaaltı': {
      'Liman': 88_000,
      'Arapsuyu': 78_000,
      'Hurma': 72_000,
      'Uncalı': 68_000,
      'Sarısu': 62_000,
      'Mollayusuf': 55_000,
      'Kuşkavağı': 52_000,
    },
    // Muratpaşa: 58.000 TL/m²
    'Muratpaşa': {
      'Meltem': 75_000,
      'Lara': 70_000,
      'Güzeloba': 65_000,
      'Fener': 60_000,
      'Memurevleri': 55_000,
      'Sinan': 50_000,
      'Kızıltoprak': 48_000,
      'Gebizli': 44_000,
    },
    // Kemer: 62.000 TL/m²
    'Kemer': {
      'Göynük': 81_000,
      'Çamyuva': 72_000,
      'Merkez': 62_000,
      'Tekirova': 58_000,
      'Beldibi': 54_000,
      'Kuzdere': 48_000,
    },
    // Alanya: 52.000 TL/m²
    'Alanya': {
      'Saray': 68_000,
      'Oba': 60_000,
      'Cikcilli': 55_000,
      'Kestel': 50_000,
      'Mahmutlar': 48_000,
      'Tosmur': 44_000,
      'Kargıcak': 42_000,
      'Konaklı': 40_000,
    },
    // Kaş: 65.000 TL/m²
    'Kaş': {
      'Kalkan': 85_000,
      'Merkez': 70_000,
      'Çukurbağ': 62_000,
      'Andifli': 55_000,
      'Gömbe': 50_000,
    },
    // Serik: 32.000 TL/m²
    'Serik': {
      'Belek': 42_000,
      'Merkez': 34_000,
      'Kadriye': 32_000,
      'Boğazkent': 30_000,
      'Gebiz': 24_000,
    },
    // Kepez: 38.000 TL/m²
    'Kepez': {
      'Fabrikalar': 49_000,
      'Varsak': 42_000,
      'Şafak': 38_000,
      'Kepez': 35_000,
      'Sütçüler': 32_000,
      'Göksu': 28_000,
    },
    // Döşemealtı: 35.000 TL/m²
    'Döşemealtı': {
      'Merkez': 46_000,
      'Yağca': 38_000,
      'Çığlık': 35_000,
      'Kovanlık': 30_000,
      'Düzlerçamı': 26_000,
    },
    // Manavgat: 35.000 TL/m²
    'Manavgat': {
      'Side': 46_000,
      'Çolaklı': 38_000,
      'Sarılar': 35_000,
      'Kızılağaç': 30_000,
      'Evrenseki': 28_000,
      'Merkez': 26_000,
    },
    // Aksu: 30.000 TL/m²
    'Aksu': {
      'Merkez': 39_000,
      'Kundu': 35_000,
      'Macun': 30_000,
      'Fığla': 26_000,
      'Pınarlı': 22_000,
    },
  },

  // ─── MUĞLA ──────────────────────────────────────────────
  'Muğla': {
    // Bodrum: 120.000 TL/m²
    'Bodrum': {
      'Yalıkavak': 156_000,
      'Türkbükü': 148_000,
      'Gündoğan': 135_000,
      'Gümüşlük': 128_000,
      'Bitez': 120_000,
      'Ortakent': 110_000,
      'Konacık': 100_000,
      'Turgutreis': 95_000,
      'Güvercinlik': 90_000,
    },
    // Marmaris: 65.000 TL/m²
    'Marmaris': {
      'İçmeler': 85_000,
      'Siteler': 72_000,
      'Armutalan': 65_000,
      'Beldibi': 60_000,
      'Tepe': 55_000,
      'Çamlı': 50_000,
    },
    // Fethiye: 55.000 TL/m²
    'Fethiye': {
      'Ölüdeniz': 72_000,
      'Hisarönü': 62_000,
      'Çalış': 58_000,
      'Karagözler': 55_000,
      'Cumhuriyet': 50_000,
      'Tuzla': 46_000,
      'Babataşı': 42_000,
    },
    // Datça: 60.000 TL/m²
    'Datça': {
      'İskele': 78_000,
      'Reşadiye': 65_000,
      'Mesudiye': 58_000,
      'Kızlan': 52_000,
      'Yazıköy': 46_000,
    },
    // Dalaman: 32.000 TL/m²
    'Dalaman': {
      'Merkez': 42_000,
      'Karaçalı': 34_000,
      'Kapukargın': 30_000,
      'Akkaya': 28_000,
      'Altıntaş': 24_000,
    },
    // Köyceğiz: 28.000 TL/m²
    'Köyceğiz': {
      'Merkez': 36_000,
      'Toparlar': 30_000,
      'Çandır': 28_000,
      'Beyobası': 24_000,
      'Yangı': 21_000,
    },
    // Milas: 30.000 TL/m²
    'Milas': {
      'Güllük': 39_000,
      'Ören': 34_000,
      'Merkez': 30_000,
      'Bafa': 26_000,
      'Çomakdağ': 22_000,
    },
    // Menteşe: 35.000 TL/m²
    'Menteşe': {
      'Merkez': 46_000,
      'Orhaniye': 38_000,
      'Muslihittin': 35_000,
      'Karabağlar': 30_000,
      'Yeşilyurt': 26_000,
    },
    // Ortaca: 28.000 TL/m²
    'Ortaca': {
      'Merkez': 36_000,
      'Dalyan': 32_000,
      'Sarıgerme': 28_000,
      'Okçular': 24_000,
      'Fevziye': 21_000,
    },
  },

  // ─── KOCAELİ ────────────────────────────────────────────
  'Kocaeli': {
    // İzmit: 38.000 TL/m²
    'İzmit': {
      'Kozluk': 49_000,
      'Yahyakaptan': 44_000,
      'Yenişehir': 40_000,
      'Topçular': 36_000,
      'Körfez': 34_000,
      'Kemalpaşa': 30_000,
      'Arızlı': 28_000,
    },
    // Gebze: 42.000 TL/m²
    'Gebze': {
      'Osman Yılmaz': 55_000,
      'Güzeller': 48_000,
      'Mevlana': 42_000,
      'Hacıhalil': 38_000,
      'Beylikbağı': 35_000,
      'Mustafapaşa': 32_000,
    },
    // Darıca: 40.000 TL/m²
    'Darıca': {
      'Osmangazi': 52_000,
      'Bayramoğlu': 46_000,
      'Nene Hatun': 42_000,
      'Bağlarbaşı': 38_000,
      'Sırasöğütler': 34_000,
      'Abdi İpekçi': 30_000,
    },
    // Çayırova: 38.000 TL/m²
    'Çayırova': {
      'Merkez': 49_000,
      'Şekerpınar': 42_000,
      'Akse': 38_000,
      'Özgürlük': 34_000,
      'Emek': 28_000,
    },
    // Kartepe: 35.000 TL/m²
    'Kartepe': {
      'Maşukiye': 46_000,
      'Suadiye': 38_000,
      'Uzuntarla': 35_000,
      'Acısu': 30_000,
      'Eşme': 26_000,
    },
    // Gölcük: 30.000 TL/m²
    'Gölcük': {
      'Merkez': 39_000,
      'Değirmendere': 34_000,
      'İhsaniye': 30_000,
      'Halıdere': 26_000,
      'Yazlık': 22_000,
    },
    // Derince: 32.000 TL/m²
    'Derince': {
      'Çenedağ': 42_000,
      'Merkez': 35_000,
      'Sırrıpaşa': 32_000,
      'Deniz': 28_000,
      'Çene': 24_000,
    },
    // Kandıra: 18.000 TL/m²
    'Kandıra': {
      'Merkez': 23_000,
      'Bağırganlı': 20_000,
      'Akçabeyli': 18_000,
      'Sarısu': 15_000,
      'Karaağaç': 13_000,
    },
    // Başiskele: 33.000 TL/m²
    'Başiskele': {
      'Yeniköy': 43_000,
      'Kullar': 36_000,
      'Serdivan': 33_000,
      'Yeşilyurt': 30_000,
      'Bahçecik': 26_000,
    },
    // Körfez: 28.000 TL/m²
    'Körfez': {
      'Hereke': 36_000,
      'Merkez': 30_000,
      'Yarımca': 28_000,
      'Kirazlıyalı': 24_000,
      'Yavuz Sultan Selim': 21_000,
    },
  },

  // ─── MERSİN ─────────────────────────────────────────────
  'Mersin': {
    // Yenişehir: 42.000 TL/m²
    'Yenişehir': {
      'Akdeniz': 55_000,
      'Çankaya': 50_000,
      'Güvenevler': 46_000,
      'Bahçe': 42_000,
      'Limonluk': 38_000,
      'Palmiye': 36_000,
      'Menteş': 32_000,
    },
    // Mezitli: 40.000 TL/m²
    'Mezitli': {
      'Tece': 52_000,
      'Viranşehir': 44_000,
      'Davultepe': 40_000,
      'Kuyuluk': 38_000,
      'Fındıkpınarı': 34_000,
      'Çeşmeli': 30_000,
    },
    // Akdeniz: 28.000 TL/m²
    'Akdeniz': {
      'Merkez': 36_000,
      'Nusratiye': 30_000,
      'Karaduvar': 28_000,
      'Çankaya': 26_000,
      'Mahmudiye': 22_000,
    },
    // Toroslar: 30.000 TL/m²
    'Toroslar': {
      'Yeni': 39_000,
      'Alsancak': 34_000,
      'Arpaçsakarlar': 30_000,
      'Gözne': 26_000,
      'Değirmençay': 22_000,
    },
    // Tarsus: 25.000 TL/m²
    'Tarsus': {
      'Gaziler': 33_000,
      'Şehitler': 28_000,
      'Caminur': 25_000,
      'Yenice': 22_000,
      'Kızılmurat': 18_000,
    },
    // Erdemli: 28.000 TL/m²
    'Erdemli': {
      'Kızkalesi': 36_000,
      'Merkez': 30_000,
      'Limonlu': 28_000,
      'Tömük': 24_000,
      'Ayaş': 22_000,
    },
    // Silifke: 22.000 TL/m²
    'Silifke': {
      'Merkez': 29_000,
      'Taşucu': 24_000,
      'Atayurt': 22_000,
      'Göksu': 18_000,
      'Narlıkuyu': 16_000,
    },
    // Anamur: 20.000 TL/m²
    'Anamur': {
      'Merkez': 26_000,
      'İskele': 22_000,
      'Bozdoğan': 20_000,
      'Abanoz': 16_000,
      'Çarık': 15_000,
    },
  },

  // ─── TEKİRDAĞ ───────────────────────────────────────────
  'Tekirdağ': {
    // Süleymanpaşa: 32.000 TL/m²
    'Süleymanpaşa': {
      'Hürriyet': 42_000,
      'Barbaros': 36_000,
      'Aydoğdu': 32_000,
      'Kumbağ': 30_000,
      'Yavuz': 28_000,
      'Zafer': 26_000,
      'Karaevli': 24_000,
    },
    // Çorlu: 28.000 TL/m²
    'Çorlu': {
      'Zafer': 36_000,
      'Muhittin': 32_000,
      'Reşadiye': 28_000,
      'Kazımiye': 26_000,
      'Hıdırağa': 22_000,
      'Esentepe': 20_000,
    },
    // Çerkezköy: 26.000 TL/m²
    'Çerkezköy': {
      'Kızılpınar': 34_000,
      'Atatürk': 28_000,
      'G.O. Paşa': 26_000,
      'Veliköy': 22_000,
      'Gazi Osman Paşa': 20_000,
    },
    // Kapaklı: 24.000 TL/m²
    'Kapaklı': {
      'Merkez': 31_000,
      'Cumhuriyet': 26_000,
      'Karaağaç': 24_000,
      'Uzunhacı': 20_000,
      'İnanlı': 18_000,
    },
    // Marmara Ereğlisi: 22.000 TL/m²
    'Marmara Ereğlisi': {
      'Merkez': 29_000,
      'Sultanköy': 24_000,
      'Yeniçiftlik': 22_000,
      'Karaevli': 18_000,
      'Kıyıköy': 16_000,
    },
    // Saray: 18.000 TL/m²
    'Saray': {
      'Merkez': 23_000,
      'Büyükyoncalı': 20_000,
      'Küçükyoncalı': 18_000,
      'Safaalan': 15_000,
      'Çukuryurt': 14_000,
    },
  },

  // ─── BALIKESİR ──────────────────────────────────────────
  'Balıkesir': {
    // Edremit: 38.000 TL/m²
    'Edremit': {
      'Akçay': 49_000,
      'Altınoluk': 44_000,
      'Güre': 40_000,
      'Zeytinli': 35_000,
      'Merkez': 32_000,
      'Kadıköy': 28_000,
    },
    // Ayvalık: 42.000 TL/m²
    'Ayvalık': {
      'Cunda': 55_000,
      'Sarımsaklı': 48_000,
      'Altınova': 42_000,
      'Küçükköy': 38_000,
      'Merkez': 34_000,
      'Murateli': 32_000,
    },
    // Bandırma: 28.000 TL/m²
    'Bandırma': {
      'Merkez': 36_000,
      'Yeni': 30_000,
      'Haydar Çavuş': 28_000,
      'Paşabayır': 26_000,
      'Edincik': 22_000,
    },
    // Altıeylül: 24.000 TL/m²
    'Altıeylül': {
      'Gümüşçeşme': 31_000,
      'Hasan Basri Çantay': 26_000,
      'Plevne': 24_000,
      'Bahçelievler': 20_000,
      'Yıldız': 18_000,
    },
    // Karesi: 22.000 TL/m²
    'Karesi': {
      'Bahçelievler': 29_000,
      'Atatürk': 24_000,
      'Paşaalanı': 22_000,
      'Kuva-i Milliye': 18_000,
      'Dumlupınar': 16_000,
    },
    // Burhaniye: 35.000 TL/m²
    'Burhaniye': {
      'Ören': 46_000,
      'Pelitköy': 38_000,
      'Merkez': 35_000,
      'Mahkeme': 30_000,
      'Taylıeli': 26_000,
    },
    // Gönen: 18.000 TL/m²
    'Gönen': {
      'Merkez': 23_000,
      'Kaplıca': 20_000,
      'Hasanbey': 18_000,
      'Bostancı': 15_000,
      'Muradiye': 14_000,
    },
    // Erdek: 30.000 TL/m²
    'Erdek': {
      'Merkez': 39_000,
      'Ocaklar': 34_000,
      'Narlı': 30_000,
      'İlhan': 26_000,
      'Turan': 22_000,
    },
  },

  // ─── ESKİŞEHİR ──────────────────────────────────────────
  'Eskişehir': {
    // Odunpazarı: 32.000 TL/m²
    'Odunpazarı': {
      'Akarbaşı': 42_000,
      'Şarkiye': 38_000,
      'Büyükdere': 34_000,
      'Kurtuluş': 32_000,
      'Yenidoğan': 28_000,
      'Göztepe': 26_000,
      'Vadişehir': 24_000,
    },
    // Tepebaşı: 35.000 TL/m²
    'Tepebaşı': {
      'Hoşnudiye': 46_000,
      'Batıkent': 40_000,
      'Şirintepe': 36_000,
      'Çankaya': 35_000,
      'Emek': 32_000,
      'Ertuğrulgazi': 28_000,
      'Tunalı': 26_000,
    },
  },

  // ─── SAKARYA ─────────────────────────────────────────────
  'Sakarya': {
    // Serdivan: 32.000 TL/m²
    'Serdivan': {
      'Bahçelievler': 42_000,
      'Kazımpaşa': 36_000,
      'Kemalpaşa': 32_000,
      'Arabacıalanı': 28_000,
      'Beşköprü': 26_000,
    },
    // Adapazarı: 28.000 TL/m²
    'Adapazarı': {
      'Çark': 36_000,
      'Cumhuriyet': 32_000,
      'Ozanlar': 28_000,
      'Karaman': 24_000,
      'Semerciler': 22_000,
      'Güllük': 20_000,
    },
    // Erenler: 24.000 TL/m²
    'Erenler': {
      'Büyükesence': 31_000,
      'Yeni': 26_000,
      'Kozluk': 24_000,
      'Beşköprü': 20_000,
      'Erenler': 18_000,
    },
    // Sapanca: 35.000 TL/m²
    'Sapanca': {
      'Kırkpınar': 46_000,
      'Rüstempaşa': 38_000,
      'Mahmudiye': 35_000,
      'Gölbaşı': 30_000,
      'Kurtuluş': 26_000,
    },
    // Akyazı: 18.000 TL/m²
    'Akyazı': {
      'Merkez': 23_000,
      'Konuralp': 20_000,
      'Dokurcun': 18_000,
      'Altındere': 15_000,
      'Kuzuluk': 14_000,
    },
    // Hendek: 16.000 TL/m²
    'Hendek': {
      'Merkez': 21_000,
      'Yeni': 18_000,
      'Dikmen': 16_000,
      'Uzuncaorman': 13_000,
      'Süleymaniye': 12_000,
    },
  },

  // ─── SAMSUN ─────────────────────────────────────────────
  'Samsun': {
    // Atakum: 28.000 TL/m²
    'Atakum': {
      'Atakent': 36_000,
      'Kurupelit': 32_000,
      'Balaç': 28_000,
      'Yenimahalle': 26_000,
      'Çobanlı': 22_000,
      'Büyükoyumca': 20_000,
    },
    // İlkadım: 25.000 TL/m²
    'İlkadım': {
      'Kale': 33_000,
      'Baruthane': 28_000,
      'Derebahçe': 25_000,
      'Adalet': 22_000,
      'Kalkanca': 20_000,
      'Çiçekli': 18_000,
    },
    // Canik: 22.000 TL/m²
    'Canik': {
      'Yalı': 29_000,
      'Osmangazi': 24_000,
      'Fazıl': 22_000,
      'İncesu': 18_000,
      'Değirmendere': 16_000,
    },
    // Bafra: 18.000 TL/m²
    'Bafra': {
      'İshaklı': 23_000,
      'Gazipaşa': 20_000,
      'Kızılırmak': 18_000,
      'Cumhuriyet': 15_000,
      'Alaçam': 14_000,
    },
    // Çarşamba: 16.000 TL/m²
    'Çarşamba': {
      'Merkez': 21_000,
      'Orta': 18_000,
      'Dikencik': 16_000,
      'Kumgeçit': 13_000,
      'Çınarlık': 12_000,
    },
    // Terme: 14.000 TL/m²
    'Terme': {
      'Merkez': 18_000,
      'Gölbaşı': 15_000,
      'Sakarlı': 14_000,
      'Çayiçi': 12_000,
      'Kozluk': 10_000,
    },
  },

  // ─── EDİRNE ─────────────────────────────────────────────
  'Edirne': {
    // Merkez: 22.000 TL/m²
    'Merkez': {
      'Talatpaşa': 29_000,
      'Yıldırım': 26_000,
      'Sabuni': 22_000,
      'Medrese Ali Bey': 20_000,
      'Barutluk': 18_000,
      'Karaağaç': 16_000,
    },
    // Keşan: 20.000 TL/m²
    'Keşan': {
      'Cumhuriyet': 26_000,
      'Yukarı Zaferiye': 22_000,
      'Aşağı Zaferiye': 20_000,
      'İlyasbey': 16_000,
      'Erikli': 15_000,
    },
    // Uzunköprü: 16.000 TL/m²
    'Uzunköprü': {
      'Muradiye': 21_000,
      'Kırcasalih': 18_000,
      'Kavak': 16_000,
      'Çöpköy': 13_000,
      'Kurtbey': 12_000,
    },
  },

  // ─── KAYSERİ ────────────────────────────────────────────
  'Kayseri': {
    // Melikgazi: 28.000 TL/m²
    'Melikgazi': {
      'Köşk': 36_000,
      'Kıranardı': 32_000,
      'Esentepe': 28_000,
      'Anbar': 26_000,
      'Germir': 22_000,
      'Gesi': 20_000,
    },
    // Kocasinan: 24.000 TL/m²
    'Kocasinan': {
      'Yıldırım Beyazıt': 31_000,
      'Erkilet': 28_000,
      'Argıncık': 24_000,
      'Sümer': 20_000,
      'Mithat Paşa': 18_000,
    },
    // Talas: 32.000 TL/m²
    'Talas': {
      'Mevlana': 42_000,
      'Ali Dağı': 36_000,
      'Kiçiköy': 32_000,
      'Başakpınar': 28_000,
      'Reşadiye': 24_000,
    },
    // Develi: 15.000 TL/m²
    'Develi': {
      'Merkez': 20_000,
      'Fenese': 16_000,
      'Sindelhöyük': 15_000,
      'Havadan': 12_000,
      'Epçe': 11_000,
    },
  },

  // ─── KONYA ──────────────────────────────────────────────
  'Konya': {
    // Selçuklu: 28.000 TL/m²
    'Selçuklu': {
      'Sancak': 36_000,
      'Bosna Hersek': 32_000,
      'Hocacihan': 28_000,
      'Yazır': 26_000,
      'Işık': 24_000,
      'Tepekent': 22_000,
      'Dikilitaş': 20_000,
    },
    // Meram: 25.000 TL/m²
    'Meram': {
      'Yeniyol': 33_000,
      'Havzan': 28_000,
      'Ladik': 25_000,
      'Gödene': 22_000,
      'Karahüyük': 20_000,
      'Hatıp': 18_000,
    },
    // Karatay: 20.000 TL/m²
    'Karatay': {
      'Aziziye': 26_000,
      'Fetih': 22_000,
      'Hacı Veyiszade': 20_000,
      'Akabe': 18_000,
      'Karaaslan': 16_000,
      'Stadyum': 14_000,
    },
    // Ereğli: 18.000 TL/m²
    'Ereğli': {
      'Merkez': 23_000,
      'Belceağaç': 20_000,
      'Orhaniye': 18_000,
      'Ziya Gökalp': 15_000,
      'Akhüyük': 14_000,
    },
    // Akşehir: 14.000 TL/m²
    'Akşehir': {
      'Merkez': 18_000,
      'Altuntaş': 15_000,
      'Engilli': 14_000,
      'Reis': 12_000,
      'Ulupınar': 10_000,
    },
    // Beyşehir: 12.000 TL/m²
    'Beyşehir': {
      'Merkez': 16_000,
      'Gölyaka': 13_000,
      'Üzümlü': 12_000,
      'Bayavşar': 10_000,
      'Yeşildağ': 9_000,
    },
  },

  // ─── KUZEY KIBRIS ───────────────────────────────────────
  'Kuzey Kıbrıs': {
    // Girne: 65.000 TL/m²
    'Girne': {
      'Bellapais': 85_000,
      'Alsancak': 78_000,
      'Lapta': 72_000,
      'Çatalköy': 68_000,
      'Karaoğlanoğlu': 62_000,
      'Zeytinlik': 58_000,
      'Ozanköy': 55_000,
      'Doğanköy': 50_000,
    },
    // Lefkoşa: 30.000 TL/m²
    'Lefkoşa': {
      'Kızılbaş': 39_000,
      'Ortaköy': 34_000,
      'Göçmenköy': 30_000,
      'Yenikent': 28_000,
      'Kumsal': 26_000,
      'Hamitköy': 24_000,
      'Gönyeli': 22_000,
    },
    // Gazimağusa: 28.000 TL/m²
    'Gazimağusa': {
      'Maraş': 36_000,
      'Baykal': 30_000,
      'Lala Mustafa Paşa': 28_000,
      'Sakarya': 26_000,
      'Namık Kemal': 24_000,
      'Çanakkale': 22_000,
    },
    // İskele: 45.000 TL/m²
    'İskele': {
      'Long Beach': 59_000,
      'Bafra': 50_000,
      'Boğaz': 45_000,
      'Tatlısu': 40_000,
      'Merkez': 38_000,
      'Yeni Erenköy': 34_000,
    },
    // Güzelyurt: 20.000 TL/m²
    'Güzelyurt': {
      'Merkez': 26_000,
      'Güneşköy': 22_000,
      'Serhatköy': 20_000,
      'Bostancı': 16_000,
      'Gaziveren': 15_000,
    },
    // Lefke: 18.000 TL/m²
    'Lefke': {
      'Merkez': 23_000,
      'Gemikonağı': 20_000,
      'Yeşilyurt': 18_000,
      'Çamlıköy': 15_000,
      'Bağlıköy': 14_000,
    },
  },
};

// ─── Yardımcı: Normalize (Türkçe karakter ve büyük/küçük harf duyarsız) ─────

function normalize(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
}

function findKey<T>(
  record: Record<string, T> | undefined,
  key: string,
): [string, T] | null {
  if (!record) return null;
  const normalizedKey = normalize(key);
  for (const k of Object.keys(record)) {
    if (normalize(k) === normalizedKey) {
      return [k, record[k]];
    }
  }
  return null;
}

// ─── Dışa Aktarılan Fonksiyonlar ────────────────────────

/**
 * Belirli bir mahalle için m² fiyatını döndürür.
 * Bulunamazsa null döner.
 */
export function getNeighborhoodPrice(
  city: string,
  district: string,
  neighborhood: string,
): number | null {
  const cityEntry = findKey(NEIGHBORHOOD_PRICES, city);
  if (!cityEntry) return null;

  const districtEntry = findKey(cityEntry[1], district);
  if (!districtEntry) return null;

  const neighborhoodEntry = findKey(districtEntry[1], neighborhood);
  if (!neighborhoodEntry) return null;

  return neighborhoodEntry[1];
}

/**
 * Belirli bir ilçedeki tüm mahalle isimlerini döndürür.
 * Bulunamazsa boş dizi döner.
 */
export function getDistrictNeighborhoods(
  city: string,
  district: string,
): string[] {
  const cityEntry = findKey(NEIGHBORHOOD_PRICES, city);
  if (!cityEntry) return [];

  const districtEntry = findKey(cityEntry[1], district);
  if (!districtEntry) return [];

  return Object.keys(districtEntry[1]);
}

/**
 * Belirli bir ilçenin ortalama m² fiyatını döndürür (tüm mahallelerin ortalaması).
 * Bulunamazsa null döner.
 */
export function getDistrictAveragePrice(
  city: string,
  district: string,
): number | null {
  const cityEntry = findKey(NEIGHBORHOOD_PRICES, city);
  if (!cityEntry) return null;

  const districtEntry = findKey(cityEntry[1], district);
  if (!districtEntry) return null;

  const prices = Object.values(districtEntry[1]);
  if (prices.length === 0) return null;

  const sum = prices.reduce((acc, p) => acc + p, 0);
  return Math.round(sum / prices.length);
}

/**
 * En iyi fiyat kaynağını döndürür:
 * - Mahalle verilmişse ve bulunursa: { price, level: 'mahalle' }
 * - Mahalle bulunamazsa veya verilmemişse: ilçe ortalaması { price, level: 'ilce' }
 * - Hiçbiri bulunamazsa: null
 */
export function getBestPrice(
  city: string,
  district: string,
  neighborhood?: string,
): { price: number; level: 'mahalle' | 'ilce' } | null {
  // Mahalle verilmişse önce onu dene
  if (neighborhood) {
    const price = getNeighborhoodPrice(city, district, neighborhood);
    if (price !== null) {
      return { price, level: 'mahalle' };
    }
  }

  // Mahalle bulunamadıysa veya verilmediyse ilçe ortalamasına düş
  const avgPrice = getDistrictAveragePrice(city, district);
  if (avgPrice !== null) {
    return { price: avgPrice, level: 'ilce' };
  }

  return null;
}
