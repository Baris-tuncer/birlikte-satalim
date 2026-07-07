// Mahalle Bazli m2 Fiyat Verisi
// Kaynak: Endeksa/Sahibinden emlak endeksleri
// Son guncelleme: Temmuz 2026

// Yapi: { [il]: { [ilce]: { [mahalle]: m2_fiyat_TL } } }
export const NEIGHBORHOOD_PRICES: Record<string, Record<string, Record<string, number>>> = {
  // ─── İSTANBUL ────────────────────────────────────────────
  'İstanbul': {
    'Kadıköy': {
      'Caferağa': 230_000,
      'Osmanağa': 220_000,
      'Rasimpaşa': 200_000,
      'Fenerbahçe': 250_000,
      'Göztepe': 180_000,
      'Kozyatağı': 170_000,
      'Suadiye': 240_000,
      'Bostancı': 190_000,
      'Erenköy': 200_000,
      'Caddebostan': 220_000,
    },
    'Beşiktaş': {
      'Levent': 280_000,
      'Etiler': 260_000,
      'Bebek': 270_000,
      'Ortaköy': 220_000,
      'Arnavutköy': 200_000,
      'Kuruçeşme': 240_000,
      'Sinanpaşa': 210_000,
      'Abbasağa': 200_000,
      'Yıldız': 190_000,
      'Türkali': 180_000,
    },
    'Bakırköy': {
      'Ataköy': 200_000,
      'Yeşilköy': 180_000,
      'Florya': 190_000,
      'Zeytinlik': 160_000,
      'Şenlikköy': 150_000,
      'Osmaniye': 140_000,
      'Kartaltepe': 130_000,
      'Sakızağacı': 125_000,
    },
    'Beylikdüzü': {
      'Adnan Kahveci': 55_000,
      'Yakuplu': 50_000,
      'Barış': 48_000,
      'Büyükçekmece (Kavaklı)': 45_000,
      'Cumhuriyet': 52_000,
      'Dereağzı': 40_000,
      'Gürpınar': 38_000,
    },
    'Esenyurt': {
      'Fatih': 35_000,
      'Yeşilkent': 32_000,
      'Ardıçlı': 28_000,
      'Mehterçeşme': 25_000,
      'İnönü': 30_000,
      'Saadetdere': 22_000,
      'Pınar': 38_000,
    },
    'Pendik': {
      'Kurtköy': 50_000,
      'Yenişehir': 45_000,
      'Kaynarca': 42_000,
      'Velibaba': 38_000,
      'Batı': 35_000,
      'Güzelyalı': 48_000,
      'Dumlupınar': 30_000,
      'Esenler': 28_000,
    },
    'Ümraniye': {
      'Atatürk': 75_000,
      'Çakmak': 65_000,
      'İstiklal': 60_000,
      'Hekimbaşı': 55_000,
      'Namık Kemal': 50_000,
      'Site': 70_000,
      'Tantavi': 48_000,
      'Armağanevler': 72_000,
    },
    'Sarıyer': {
      'İstinye': 180_000,
      'Tarabya': 160_000,
      'Maslak': 200_000,
      'Emirgan': 170_000,
      'Büyükdere': 140_000,
      'Rumelihisarı': 150_000,
      'Bahçeköy': 90_000,
      'Zekeriyaköy': 100_000,
    },
    'Üsküdar': {
      'Çengelköy': 180_000,
      'Kuzguncuk': 170_000,
      'Beylerbeyi': 190_000,
      'Altunizade': 160_000,
      'Acıbadem': 150_000,
      'Burhaniye': 130_000,
      'Ünalan': 120_000,
      'Bulgurlu': 110_000,
    },
    'Şişli': {
      'Nişantaşı': 220_000,
      'Teşvikiye': 210_000,
      'Osmanbey': 200_000,
      'Bomonti': 180_000,
      'Pangaltı': 170_000,
      'Feriköy': 160_000,
      'Mecidiyeköy': 190_000,
      'Halaskargazi': 175_000,
      'Kuştepe': 130_000,
    },
    'Maltepe': {
      'Küçükyalı': 85_000,
      'Altıntepe': 80_000,
      'İdealtepe': 90_000,
      'Zümrütevler': 70_000,
      'Aydınevler': 75_000,
      'Cevizli': 65_000,
      'Fındıklı': 55_000,
      'Bağlarbaşı': 60_000,
    },
    'Kartal': {
      'Hürriyet': 65_000,
      'Cevizli': 60_000,
      'Atalar': 55_000,
      'Uğur Mumcu': 50_000,
      'Kordonboyu': 70_000,
      'Yakacık': 45_000,
      'Soğanlık': 48_000,
    },
    'Ataşehir': {
      'Barbaros': 100_000,
      'Küçükbakkalköy': 95_000,
      'Atatürk': 90_000,
      'İçerenköy': 85_000,
      'Yenisahra': 80_000,
      'Mustafa Kemal': 75_000,
      'Ferhatpaşa': 65_000,
      'Kayışdağı': 60_000,
    },
    'Başakşehir': {
      'Bahçeşehir 1. Kısım': 55_000,
      'Bahçeşehir 2. Kısım': 50_000,
      'Başak': 45_000,
      'Kayabaşı': 35_000,
      'Güvercintepe': 30_000,
      'Ziya Gökalp': 42_000,
      'Şahintepe': 38_000,
    },
    'Fatih': {
      'Sultanahmet': 160_000,
      'Vefa': 140_000,
      'Çarşamba': 120_000,
      'Karagümrük': 110_000,
      'Balat': 130_000,
      'Fener': 125_000,
      'Aksaray': 100_000,
      'Yedikule': 90_000,
    },
    'Beykoz': {
      'Anadoluhisarı': 130_000,
      'Paşabahçe': 110_000,
      'Kavacık': 120_000,
      'Riva': 70_000,
      'Çubuklu': 100_000,
      'Göksu': 95_000,
    },
    'Eyüpsultan': {
      'Göktürk': 80_000,
      'Kemerburgaz': 60_000,
      'İslambey': 70_000,
      'Nişancı': 55_000,
      'Alibeyköy': 50_000,
      'Akşemsettin': 45_000,
    },
    'Çekmeköy': {
      'Merkez': 50_000,
      'Alemdağ': 45_000,
      'Mimar Sinan': 42_000,
      'Mehmet Akif': 40_000,
      'Hamidiye': 38_000,
      'Ömerli': 30_000,
    },
    'Büyükçekmece': {
      'Mimarsinan': 50_000,
      'Kumburgaz': 40_000,
      'Pınartepe': 35_000,
      'Fatih': 38_000,
      'Ulus': 42_000,
    },
    'Tuzla': {
      'Postane': 45_000,
      'Aydınlı': 40_000,
      'Mimar Sinan': 42_000,
      'İçmeler': 48_000,
      'Orhanlı': 35_000,
    },
    'Sultangazi': {
      'Cebeci': 30_000,
      'Esentepe': 28_000,
      '50. Yıl': 25_000,
      'Habibler': 22_000,
      'Zübeyde Hanım': 26_000,
    },
    'Küçükçekmece': {
      'Atakent': 55_000,
      'Halkalı': 50_000,
      'Sefaköy': 48_000,
      'İnönü': 42_000,
      'Cennet': 45_000,
      'Beşyol': 40_000,
    },
  },

  // ─── ANKARA ──────────────────────────────────────────────
  'Ankara': {
    'Çankaya': {
      'Gaziosmanpaşa': 80_000,
      'Kavaklıdere': 75_000,
      'Çukurambar': 65_000,
      'Birlik': 55_000,
      'Ümitköy': 50_000,
      'Çayyolu': 45_000,
      'Ayrancı': 60_000,
      'Bahçelievler': 40_000,
      'Balgat': 35_000,
      'Mustafa Kemal': 42_000,
    },
    'Keçiören': {
      'Etlik': 28_000,
      'Kuşcağız': 22_000,
      'Bağlum': 18_000,
      'Ovacık': 16_000,
      'Atapark': 25_000,
      'Kalaba': 20_000,
      'Subayevleri': 24_000,
    },
    'Yenimahalle': {
      'Batıkent': 30_000,
      'Demetevler': 25_000,
      'Ostim': 22_000,
      'Kardelen': 28_000,
      'Çiğdem': 35_000,
      'Güventepe': 20_000,
      'Mehmet Akif Ersoy': 32_000,
    },
    'Etimesgut': {
      'Elvankent': 22_000,
      'Eryaman': 25_000,
      'Bağlıca': 28_000,
      'Yapracık': 18_000,
      'Topçu': 20_000,
      'Ayyıldız': 15_000,
    },
    'Mamak': {
      'Abidinpaşa': 18_000,
      'Natoyolu': 16_000,
      'Gülveren': 14_000,
      'Kutlu': 15_000,
      'Şahintepe': 12_000,
    },
    'Gölbaşı': {
      'İncek': 35_000,
      'Karagedik': 20_000,
      'Bahçelievler': 18_000,
      'Virancık': 15_000,
      'Karşıyaka': 22_000,
    },
    'Pursaklar': {
      'Saray': 18_000,
      'Merkez': 15_000,
      'Altınova': 14_000,
      'Yukarı Murtaza': 12_000,
      'Fatih': 16_000,
    },
  },

  // ─── İZMİR ──────────────────────────────────────────────
  'İzmir': {
    'Konak': {
      'Alsancak': 80_000,
      'Güzelyalı': 70_000,
      'Hatay': 65_000,
      'Göztepe': 60_000,
      'Kahramanlar': 55_000,
      'Basmane': 45_000,
      'Kemeraltı': 50_000,
      'Küçükyalı': 58_000,
    },
    'Karşıyaka': {
      'Bostanlı': 85_000,
      'Mavişehir': 90_000,
      'Alaybey': 65_000,
      'Tersane': 60_000,
      'Donanmacı': 70_000,
      'Şemikler': 55_000,
      'Nergiz': 50_000,
    },
    'Bornova': {
      'Erzene': 55_000,
      'Kazımdirik': 50_000,
      'Altındağ': 45_000,
      'Çamdibi': 40_000,
      'Ergene': 48_000,
      'Mevlana': 35_000,
      'Birlik': 42_000,
    },
    'Bayraklı': {
      'Bayraklı': 50_000,
      'Manavkuyu': 55_000,
      'Çiçek': 45_000,
      'Postacılar': 40_000,
      'Mansuroğlu': 48_000,
      'Alparslan': 35_000,
    },
    'Çeşme': {
      'Alaçatı': 120_000,
      'Dalyan': 90_000,
      'Ilıca': 100_000,
      'Çiftlikköy': 80_000,
      'Reisdere': 70_000,
    },
    'Urla': {
      'Merkez': 55_000,
      'İskele': 65_000,
      'Zeytinalanı': 50_000,
      'Kuşçular': 45_000,
      'Demircili': 40_000,
    },
    'Narlıdere': {
      'Çatalkaya': 65_000,
      'Huzur': 60_000,
      'Narlı': 55_000,
      'Arıkent': 58_000,
      'Atatürk': 50_000,
    },
    'Buca': {
      'Adatepe': 40_000,
      'Kozağaç': 38_000,
      'Çamlık': 35_000,
      'Tınaztepe': 32_000,
      'Buca Koop': 30_000,
    },
  },

  // ─── BURSA ──────────────────────────────────────────────
  'Bursa': {
    'Nilüfer': {
      'Görükle': 35_000,
      'Özlüce': 40_000,
      'İhsaniye': 38_000,
      'Beşevler': 42_000,
      'Ataevler': 30_000,
      'Ertuğrul': 28_000,
      'Çamlıca': 45_000,
    },
    'Osmangazi': {
      'Çekirge': 35_000,
      'Kükürtlü': 30_000,
      'Hüdavendigâr': 28_000,
      'Hamitler': 22_000,
      'Soğanlı': 20_000,
      'Demirtaş': 18_000,
    },
    'Yıldırım': {
      'Esenevler': 18_000,
      'Millet': 16_000,
      'Yiğitler': 15_000,
      'Bağlarbaşı': 14_000,
      'Beyazıt': 17_000,
    },
    'Mudanya': {
      'Güzelyalı': 30_000,
      'Halitpaşa': 25_000,
      'Ömerbey': 22_000,
      'Şükrüçavuş': 20_000,
    },
    'Gemlik': {
      'Hamidiye': 18_000,
      'Kayhan': 16_000,
      'Cumhuriyet': 15_000,
      'Hisar': 14_000,
    },
  },

  // ─── ANTALYA ─────────────────────────────────────────────
  'Antalya': {
    'Muratpaşa': {
      'Lara': 55_000,
      'Konyaaltı': 50_000,
      'Fener': 48_000,
      'Memurevleri': 45_000,
      'Güzeloba': 52_000,
      'Meltem': 60_000,
      'Sinan': 40_000,
    },
    'Konyaaltı': {
      'Liman': 75_000,
      'Hurma': 65_000,
      'Sarısu': 55_000,
      'Uncalı': 60_000,
      'Arapsuyu': 70_000,
      'Mollayusuf': 45_000,
    },
    'Alanya': {
      'Oba': 45_000,
      'Kestel': 38_000,
      'Mahmutlar': 35_000,
      'Tosmur': 30_000,
      'Cikcilli': 40_000,
      'Saray': 50_000,
    },
    'Kepez': {
      'Varsak': 22_000,
      'Şafak': 20_000,
      'Fabrikalar': 25_000,
      'Kepez': 18_000,
      'Sütçüler': 15_000,
    },
    'Kaş': {
      'Merkez': 60_000,
      'Kalkan': 80_000,
      'Çukurbağ': 50_000,
      'Andifli': 45_000,
    },
    'Manavgat': {
      'Side': 40_000,
      'Çolaklı': 30_000,
      'Kızılağaç': 25_000,
      'Sarılar': 28_000,
    },
  },

  // ─── BALIKESİR ───────────────────────────────────────────
  'Balıkesir': {
    'Ayvalık': {
      'Cunda': 45_000,
      'Sarimsaklı': 35_000,
      'Altınova': 30_000,
      'Küçükköy': 25_000,
    },
    'Edremit': {
      'Akçay': 30_000,
      'Altınoluk': 28_000,
      'Güre': 25_000,
      'Zeytinli': 20_000,
    },
    'Bandırma': {
      'Merkez': 18_000,
      'Yeni': 16_000,
      'Haydar Çavuş': 14_000,
      'Paşabayır': 15_000,
    },
    'Karesi': {
      'Bahçelievler': 15_000,
      'Atatürk': 14_000,
      'Paşaalanı': 12_000,
    },
    'Altıeylül': {
      'Gümüşçeşme': 14_000,
      'Plevne': 12_000,
      'Hasan Basri Çantay': 13_000,
    },
  },

  // ─── KOCAELİ ─────────────────────────────────────────────
  'Kocaeli': {
    'İzmit': {
      'Yahyakaptan': 28_000,
      'Yenişehir': 25_000,
      'Körfez': 22_000,
      'Çayırova': 20_000,
      'Topçular': 18_000,
      'Kozluk': 30_000,
    },
    'Gebze': {
      'Osman Yılmaz': 30_000,
      'Güzeller': 28_000,
      'Mevlana': 25_000,
      'Hacıhalil': 22_000,
      'Beylikbağı': 20_000,
    },
    'Derince': {
      'Çenedağ': 18_000,
      'Merkez': 16_000,
      'Sırrıpaşa': 15_000,
    },
    'Kartepe': {
      'Maşukiye': 22_000,
      'Uzuntarla': 18_000,
      'Suadiye': 20_000,
    },
    'Başiskele': {
      'Yeniköy': 20_000,
      'Serdivan': 18_000,
      'Kullar': 16_000,
    },
  },

  // ─── MERSİN ──────────────────────────────────────────────
  'Mersin': {
    'Yenişehir': {
      'Çankaya': 30_000,
      'Güvenevler': 28_000,
      'Bahçe': 25_000,
      'Limonluk': 22_000,
      'Akdeniz': 35_000,
    },
    'Mezitli': {
      'Davultepe': 22_000,
      'Kuyuluk': 20_000,
      'Tece': 25_000,
      'Viranşehir': 18_000,
    },
    'Toroslar': {
      'Yeni': 15_000,
      'Alsancak': 14_000,
      'Arpaçsakarlar': 12_000,
    },
    'Erdemli': {
      'Kızkalesi': 18_000,
      'Limonlu': 14_000,
      'Tömük': 12_000,
    },
    'Tarsus': {
      'Gaziler': 12_000,
      'Şehitler': 10_000,
      'Caminur': 11_000,
    },
  },

  // ─── MUĞLA ───────────────────────────────────────────────
  'Muğla': {
    'Bodrum': {
      'Yalıkavak': 200_000,
      'Türkbükü': 180_000,
      'Gümüşlük': 140_000,
      'Bitez': 120_000,
      'Ortakent': 100_000,
      'Gündoğan': 130_000,
      'Konacık': 90_000,
      'Turgutreis': 85_000,
    },
    'Fethiye': {
      'Ölüdeniz': 75_000,
      'Hisarönü': 60_000,
      'Çalış': 55_000,
      'Karagözler': 50_000,
      'Tuzla': 40_000,
      'Cumhuriyet': 45_000,
    },
    'Marmaris': {
      'İçmeler': 60_000,
      'Armutalan': 50_000,
      'Beldibi': 45_000,
      'Siteler': 55_000,
      'Tepe': 40_000,
    },
    'Dalaman': {
      'Merkez': 25_000,
      'Karaçalı': 20_000,
      'Kapukargın': 18_000,
    },
    'Datça': {
      'İskele': 55_000,
      'Reşadiye': 45_000,
      'Kızlan': 35_000,
      'Mesudiye': 40_000,
    },
    'Milas': {
      'Güllük': 40_000,
      'Ören': 30_000,
      'Merkez': 20_000,
    },
  },

  // ─── TEKİRDAĞ ────────────────────────────────────────────
  'Tekirdağ': {
    'Çorlu': {
      'Muhittin': 16_000,
      'Reşadiye': 14_000,
      'Kazımiye': 12_000,
      'Zafer': 18_000,
      'Hıdırağa': 10_000,
    },
    'Süleymanpaşa': {
      'Hürriyet': 18_000,
      'Barbaros': 16_000,
      'Kumbağ': 15_000,
      'Aydoğdu': 14_000,
      'Yavuz': 12_000,
    },
    'Çerkezköy': {
      'Kızılpınar': 14_000,
      'Atatürk': 12_000,
      'G.O. Paşa': 11_000,
      'Veliköy': 10_000,
    },
    'Ergene': {
      'Velimeşe': 10_000,
      'Ulaş': 9_000,
      'Marmaracık': 8_000,
    },
  },

  // ─── ESKİŞEHİR ───────────────────────────────────────────
  'Eskişehir': {
    'Tepebaşı': {
      'Şirintepe': 18_000,
      'Batıkent': 20_000,
      'Emek': 16_000,
      'Hoşnudiye': 22_000,
      'Ertuğrulgazi': 15_000,
      'Çankaya': 17_000,
    },
    'Odunpazarı': {
      'Büyükdere': 16_000,
      'Yenidoğan': 14_000,
      'Şarkiye': 18_000,
      'Akarbaşı': 20_000,
      'Kurtuluş': 15_000,
    },
  },

  // ─── SAKARYA ──────────────────────────────────────────────
  'Sakarya': {
    'Serdivan': {
      'Bahçelievler': 18_000,
      'Kazımpaşa': 16_000,
      'Arabacıalanı': 14_000,
      'Kemalpaşa': 15_000,
    },
    'Adapazarı': {
      'Cumhuriyet': 14_000,
      'Ozanlar': 12_000,
      'Karaman': 11_000,
      'Çark': 13_000,
    },
    'Erenler': {
      'Büyükesence': 10_000,
      'Yeni': 9_000,
      'Kozluk': 8_000,
    },
    'Sapanca': {
      'Kırkpınar': 22_000,
      'Rüstempaşa': 18_000,
      'Mahmudiye': 16_000,
    },
  },

  // ─── SAMSUN ──────────────────────────────────────────────
  'Samsun': {
    'Atakum': {
      'Kurupelit': 18_000,
      'Balaç': 15_000,
      'Atakent': 20_000,
      'Yenimahalle': 14_000,
      'Çobanlı': 12_000,
    },
    'İlkadım': {
      'Kale': 16_000,
      'Derebahçe': 14_000,
      'Baruthane': 15_000,
      'Adalet': 12_000,
    },
    'Canik': {
      'Yalı': 12_000,
      'Osmangazi': 10_000,
      'Fazıl': 9_000,
    },
    'Bafra': {
      'İshaklı': 8_000,
      'Gazipaşa': 7_000,
      'Kızılırmak': 6_000,
    },
  },

  // ─── EDİRNE ──────────────────────────────────────────────
  'Edirne': {
    'Merkez': {
      'Yıldırım': 14_000,
      'Sabuni': 12_000,
      'Medrese Ali Bey': 11_000,
      'Talatpaşa': 15_000,
      'Barutluk': 10_000,
    },
    'Keşan': {
      'Cumhuriyet': 10_000,
      'Yukarı Zaferiye': 8_000,
      'Aşağı Zaferiye': 7_000,
    },
    'Uzunköprü': {
      'Muradiye': 8_000,
      'Kırcasalih': 6_000,
      'Kavak': 5_000,
    },
  },

  // ─── KAYSERİ ─────────────────────────────────────────────
  'Kayseri': {
    'Melikgazi': {
      'Kıranardı': 18_000,
      'Esentepe': 16_000,
      'Anbar': 14_000,
      'Köşk': 20_000,
      'Germir': 12_000,
    },
    'Kocasinan': {
      'Erkilet': 14_000,
      'Argıncık': 12_000,
      'Yıldırım Beyazıt': 15_000,
      'Sümer': 11_000,
    },
    'Talas': {
      'Mevlana': 16_000,
      'Ali Dağı': 14_000,
      'Başakpınar': 10_000,
      'Kiçiköy': 12_000,
    },
  },

  // ─── KONYA ───────────────────────────────────────────────
  'Konya': {
    'Selçuklu': {
      'Bosna Hersek': 18_000,
      'Yazır': 15_000,
      'Işık': 14_000,
      'Sancak': 20_000,
      'Tepekent': 12_000,
      'Hocacihan': 16_000,
    },
    'Meram': {
      'Yeniyol': 15_000,
      'Ladik': 12_000,
      'Havzan': 14_000,
      'Karahüyük': 10_000,
      'Gödene': 11_000,
    },
    'Karatay': {
      'Fetih': 12_000,
      'Hacı Veyiszade': 10_000,
      'Akabe': 9_000,
      'Aziziye': 11_000,
    },
  },

  // ─── KUZEY KIBRIS ────────────────────────────────────────
  'Kuzey Kıbrıs': {
    'Girne': {
      'Alsancak': 75_000,
      'Lapta': 65_000,
      'Karaoğlanoğlu': 55_000,
      'Zeytinlik': 50_000,
      'Çatalköy': 60_000,
      'Ozanköy': 45_000,
      'Bellapais': 80_000,
    },
    'Lefkoşa': {
      'Göçmenköy': 25_000,
      'Kumsal': 20_000,
      'Ortaköy': 30_000,
      'Yenikent': 22_000,
      'Hamitköy': 18_000,
      'Kızılbaş': 35_000,
    },
    'Gazimağusa': {
      'Maraş': 40_000,
      'Baykal': 25_000,
      'Lala Mustafa Paşa': 22_000,
      'Sakarya': 20_000,
      'Namık Kemal': 18_000,
    },
    'İskele': {
      'Bafra': 30_000,
      'Boğaz': 25_000,
      'Long Beach': 35_000,
      'Tatlısu': 20_000,
    },
    'Güzelyurt': {
      'Merkez': 15_000,
      'Güneşköy': 12_000,
      'Serhatköy': 10_000,
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
