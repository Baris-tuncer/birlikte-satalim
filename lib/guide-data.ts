// ─── Rehber & Mevzuat İçerik Verileri ─────────────────────────────
// Supabase'e taşımak istendiğinde sadece getGuideArticles / getGuideArticle
// fonksiyonlarının içi değiştirilir, UI dokunulmaz.

import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

// ─── Tipler ────────────────────────────────────────────────────────

export type GuideCategory = 'SALE' | 'RENT';

export interface GuideSection {
  heading: string;
  items: string[];
}

export interface GuideArticle {
  slug: string;
  category: GuideCategory;
  title: string;
  summary: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  sections: GuideSection[];
  attentionNotes: string[];
}

// ─── Satış İşlemleri ───────────────────────────────────────────────

const SALE_ARTICLES: GuideArticle[] = [
  {
    slug: 'tapu-devri',
    category: 'SALE',
    title: 'Tapu Devri Adımları',
    summary: 'Tapu devir işleminin başından sonuna tüm adımları.',
    icon: 'swap-horizontal-outline',
    sections: [
      {
        heading: 'Ön Hazırlık',
        items: [
          'Tapu kaydını TAKBIS üzerinden sorgulayın (ada, parsel, malik bilgileri)',
          'Tapu üzerinde ipotek, haciz, şerh veya tedbir olup olmadığını kontrol edin',
          'Güncel tapu senedi fotokopisini edinin',
          'Emlak vergisi borcu yoktur belgesi alın (ilgili belediyeden)',
          'Zorunlu deprem sigortası (DASK) poliçesinin geçerliliğini kontrol edin',
        ],
      },
      {
        heading: 'Tapu Müdürlüğü Randevusu',
        items: [
          'Tapu ve Kadastro Genel Müdürlüğü ALO 181 hattından veya web.tkgm.gov.tr üzerinden randevu alın',
          'Randevu günü tüm tarafların (alıcı, satıcı veya vekaletname ile vekiller) hazır bulunması gerekir',
          'Randevu saatinden en az 15 dakika önce Tapu Müdürlüğü\'nde olun',
        ],
      },
      {
        heading: 'Devir Günü Belgeleri',
        items: [
          'Nüfus cüzdanı veya pasaport (aslı)',
          'Güncel 2 adet vesikalık fotoğraf (son 6 ay)',
          'DASK poliçesi',
          'Emlak vergisi borcu yoktur belgesi',
          'Tapu senedi aslı',
          'Ekspertiz (değerleme) raporu (banka kredili işlemlerde zorunlu)',
          'Vekaletname (vekil ile işlem yapılıyorsa, noter onaylı)',
        ],
      },
      {
        heading: 'Devir İşlemi Sırası',
        items: [
          '1. Tapu Müdürlüğü\'ne başvuru yapılır',
          '2. Harç ve döner sermaye bedeli ödenir (alıcı ve satıcı ayrı ayrı)',
          '3. Tapu sicil müdürü huzurunda sözleşme imzalanır',
          '4. Tapu senedi yeni malik adına düzenlenir',
          '5. TAKBIS sistemine kayıt yapılır',
          '6. Yeni tapu senedi teslim alınır (genellikle aynı gün)',
        ],
      },
    ],
    attentionNotes: [
      'Tapu harcı satış bedelinin %4\'üdür (alıcı %2, satıcı %2). 2026 yılı için güncel oranları kontrol edin.',
      'Rayiç bedelin altında beyan yapmayın; cezai yaptırım uygulanabilir.',
      'Vekaletname ile işlem yapılıyorsa, vekaletnamenin "taşınmaz satışı" yetkisi içerdiğinden emin olun.',
      'Banka kredili satışlarda ekspertiz raporu zorunludur ve banka tarafından atanır.',
    ],
  },
  {
    slug: 'gerekli-belgeler',
    category: 'SALE',
    title: 'Gerekli Belgeler',
    summary: 'Satış işleminde taraflardan istenen tüm belgeler.',
    icon: 'document-text-outline',
    sections: [
      {
        heading: 'Satıcıdan İstenen Belgeler',
        items: [
          'Tapu senedi aslı',
          'Nüfus cüzdanı veya pasaport fotokopisi',
          '2 adet vesikalık fotoğraf (son 6 ay)',
          'Emlak vergisi borcu yoktur belgesi (belediyeden)',
          'DASK (Zorunlu Deprem Sigortası) poliçesi',
          'Enerji Kimlik Belgesi (EKB) — 2020 sonrası zorunlu',
          'Yapı Kullanma İzni (İskan Belgesi)',
          'İmar durumu belgesi (belediyeden)',
          'Aidat borcu yoktur yazısı (apartman/site yönetiminden)',
          'Vekaletname (vekil ile satışta, noter onaylı)',
        ],
      },
      {
        heading: 'Alıcıdan İstenen Belgeler',
        items: [
          'Nüfus cüzdanı veya pasaport fotokopisi',
          '2 adet vesikalık fotoğraf (son 6 ay)',
          'Vekaletname (vekil ile alımda)',
          'Banka kredi onay yazısı (kredili alımlarda)',
        ],
      },
      {
        heading: 'Ek Belgeler (Duruma Göre)',
        items: [
          'Yabancı uyruklu alıcılarda: Pasaport noter onaylı tercümesi, vergi numarası',
          'Tüzel kişilerde: Ticaret sicil gazetesi, yetki belgesi, imza sirküleri',
          'Miras yoluyla satışlarda: Veraset ilamı, mirasçılık belgesi',
          'Boşanma durumunda: Kesinleşmiş boşanma kararı',
        ],
      },
    ],
    attentionNotes: [
      'Enerji Kimlik Belgesi (EKB) olmadan satış işlemi yapılamaz.',
      'DASK poliçesi olmadan tapu devri gerçekleştirilemez.',
      'İskan belgesi olmayan yapılarda alıcıyı mutlaka bilgilendirin; hukuki sorumluluk doğar.',
      'Tüm belgelerin güncel ve geçerli olduğundan emin olun.',
    ],
  },
  {
    slug: 'alim-satim-proseduru',
    category: 'SALE',
    title: 'Alım-Satım Prosedürü',
    summary: 'Portföy almadan tapu devrine kadar eksiksiz süreç.',
    icon: 'git-network-outline',
    sections: [
      {
        heading: '1. Portföy Alma',
        items: [
          'Mülk sahibi ile yetkilendirme (portföy) sözleşmesi imzalayın',
          'Sözleşmede komisyon oranı, süre ve yetki kapsamını açıkça belirtin',
          'Tapu kaydını ve imar durumunu kontrol edin',
          'Taşınmazı yerinde inceleyin, fotoğraf ve video çekin',
          'Piyasa araştırması yaparak uygun satış fiyatı belirleyin',
        ],
      },
      {
        heading: '2. Pazarlama',
        items: [
          'Profesyonel fotoğraf ve video çekimi yaptırın',
          'İlan metnini hazırlayın (doğru ve yanıltıcı olmayan bilgiler)',
          'Uygulamaya ve diğer platformlara ilan girin',
          'Beraber Satalım üzerinden iş birliği talepleri değerlendirin',
        ],
      },
      {
        heading: '3. Yer Gösterme',
        items: [
          'Her gösterim öncesi yer gösterme belgesi düzenleyin',
          'Müşterinin kimlik bilgilerini kayıt altına alın',
          'Taşınmazın tüm özelliklerini ve varsa eksikliklerini açıkça belirtin',
          'Çevre bilgisi verin (ulaşım, okul, hastane, market)',
        ],
      },
      {
        heading: '4. Teklif ve Pazarlık',
        items: [
          'Alıcının teklifini yazılı olarak alın',
          'Satıcıya teklifi ileterek karşı teklif sürecini yönetin',
          'Anlaşma sağlandığında ön protokol (ön sözleşme) hazırlayın',
          'Kaparo alınacaksa makbuz düzenleyin ve koşulları belirtin',
        ],
      },
      {
        heading: '5. Tapu Devri',
        items: [
          'Tapu randevusu alın ve tüm belgeleri hazırlayın',
          'Harç ve masrafları taraflara önceden bildirin',
          'Tapu devri günü tüm tarafların hazır bulunmasını sağlayın',
          'Devir sonrası komisyon faturası kesin',
        ],
      },
    ],
    attentionNotes: [
      'Yetkilendirme sözleşmesi olmadan portföy almayın; komisyon hakkınızı koruyamazsınız.',
      'Yer gösterme belgesi düzenlemeden taşınmaz göstermeyin.',
      'Kaparo alırken mutlaka yazılı protokol düzenleyin ve koşulları netleştirin.',
      'Komisyon oranı Ticaret Bakanlığı tarafından belirlenen azami oranları aşmamalıdır (satışta %4+KDV).',
    ],
  },
  {
    slug: 'ekspertiz-degerleme',
    category: 'SALE',
    title: 'Ekspertiz ve Değerleme',
    summary: 'Taşınmaz değerleme süreci ve ekspertiz raporu hakkında.',
    icon: 'analytics-outline',
    sections: [
      {
        heading: 'Ekspertiz Nedir?',
        items: [
          'SPK lisanslı değerleme kuruluşları tarafından yapılan bağımsız taşınmaz değerleme işlemidir',
          'Banka kredili satışlarda zorunludur',
          'Kredi tutarı ekspertiz değerine göre belirlenir',
          'Ekspertiz raporu genellikle 3 ay geçerlidir',
        ],
      },
      {
        heading: 'Değerleme Yöntemleri',
        items: [
          'Emsal Karşılaştırma: Benzer taşınmazların son satış fiyatlarıyla karşılaştırma',
          'Maliyet Yaklaşımı: Arsa değeri + yapı maliyeti üzerinden hesaplama',
          'Gelir Yaklaşımı: Kira geliri potansiyeline göre değerleme (yatırım amaçlı)',
        ],
      },
      {
        heading: 'Değerlemeyi Etkileyen Faktörler',
        items: [
          'Konum ve ulaşım imkânları',
          'Yapı yaşı, kalitesi ve bakım durumu',
          'Kat, cephe ve manzara',
          'Brüt ve net alan (m²)',
          'İmar durumu ve yapı kullanma izni',
          'Deprem bölgesi ve zemin etüdü',
          'Çevredeki sosyal donatılar (okul, hastane, park)',
          'Bölgedeki emsal satış fiyatları',
        ],
      },
      {
        heading: 'Ekspertiz Süreci',
        items: [
          '1. Banka, SPK lisanslı değerleme şirketini atar',
          '2. Değerleme uzmanı taşınmazı yerinde inceler',
          '3. Tapu, imar ve belediye kayıtları kontrol edilir',
          '4. Emsal analizi ve hesaplamalar yapılır',
          '5. Rapor hazırlanır ve bankaya iletilir (3-5 iş günü)',
          '6. Banka, kredi tutarını ekspertiz değerine göre belirler',
        ],
      },
    ],
    attentionNotes: [
      'Ekspertiz değeri ile satış fiyatı farklı olabilir; banka krediyi ekspertiz değerine göre verir.',
      'Ekspertiz ücreti genellikle alıcı (kredi başvuru sahibi) tarafından ödenir.',
      'Rayiç bedelin çok altında veya üstünde beyan yapılması yasal sorun yaratabilir.',
      'İskansız (yapı kullanma izni olmayan) yapılarda ekspertiz değeri düşük çıkabilir veya kredi onaylanmayabilir.',
    ],
  },
  {
    slug: 'vergi-harc-masraf',
    category: 'SALE',
    title: 'Vergi, Harç ve Masraflar',
    summary: '2026 yılı güncel tapu harçları, vergiler ve satış masrafları.',
    icon: 'receipt-outline',
    sections: [
      {
        heading: 'Tapu Harcı',
        items: [
          'Toplam %4 (alıcı %2 + satıcı %2)',
          'Harç, tapu müdürlüğünde beyan edilen satış bedeli üzerinden hesaplanır',
          'Beyan edilen bedel, emlak vergi değerinden düşük olamaz',
          'Ödeme tapu müdürlüğündeki vezneye veya banka aracılığıyla yapılır',
        ],
      },
      {
        heading: 'Döner Sermaye Harcı',
        items: [
          'Tapu işlemleri için döner sermaye ücreti alınır',
          '2026 yılı için güncel tutar Tapu Kadastro Genel Müdürlüğü sitesinden kontrol edilmelidir',
          'Her iki taraftan ayrı ayrı tahsil edilir',
        ],
      },
      {
        heading: 'Emlak Vergisi',
        items: [
          'Konutlarda binde 1 (büyükşehirlerde binde 2)',
          'İşyerlerinde binde 2 (büyükşehirlerde binde 4)',
          'Arsalarda binde 3 (büyükşehirlerde binde 6)',
          'Emlak vergisi belediyeye ödenir, yılda iki taksit (Mayıs ve Kasım)',
          'Satış öncesi birikmiş vergi borcu satıcı tarafından ödenmelidir',
        ],
      },
      {
        heading: 'Diğer Masraflar',
        items: [
          'Ekspertiz ücreti: Bankaya göre değişir (yaklaşık 5.000-15.000 TL)',
          'DASK primi: Konum ve m²\'ye göre değişir',
          'Emlak komisyonu: Satış bedelinin %2+KDV\'si (her iki taraftan, toplam %4+KDV)',
          'Enerji Kimlik Belgesi (EKB): Yaklaşık 3.000-8.000 TL',
          'Noter masrafları (vekaletname gerekiyorsa)',
        ],
      },
      {
        heading: 'Gelir Vergisi (Değer Artış Kazancı)',
        items: [
          'Satın alındıktan sonra 5 yıl içinde satılan taşınmazlarda değer artış kazancı vergisi uygulanır',
          '5 yıldan fazla elde tutulan taşınmazlar bu vergiden muaftır',
          'Miras veya bağış yoluyla edinilen taşınmazlar istisna kapsamındadır',
          'Vergi oranı, kazanç tutarına göre %15 ile %40 arasında kademeli uygulanır',
        ],
      },
    ],
    attentionNotes: [
      'Tapu harcını düşük göstermek için düşük bedel beyan etmeyin; vergi incelemesinde ağır cezalar uygulanır.',
      'Alıcıya tüm masrafları önceden yazılı olarak bildirin.',
      '5 yıl kuralını alıcı ve satıcıya mutlaka hatırlatın.',
      'Komisyon oranını yetkilendirme sözleşmesinde net olarak belirtin.',
    ],
  },
  {
    slug: 'yetki-belgesi',
    category: 'SALE',
    title: 'Yetki Belgesi Kuralları',
    summary: 'Emlak danışmanlığı yetki belgesi zorunlulukları.',
    icon: 'ribbon-outline',
    sections: [
      {
        heading: 'Yetki Belgesi Nedir?',
        items: [
          'Ticaret Bakanlığı tarafından verilen Taşınmaz Ticareti Yetki Belgesidir',
          'Emlak danışmanlığı faaliyeti yürütmek için zorunludur',
          '5 yıl geçerlidir ve süre sonunda yenilenmelidir',
          'Yetki belgesi olmadan emlak komisyonculuğu yapmak yasaktır ve cezai yaptırımı vardır',
        ],
      },
      {
        heading: 'Başvuru Şartları',
        items: [
          'En az lise mezunu olmak',
          'Mesleki Yeterlilik Belgesi (MYK) sahibi olmak',
          'Sabıka kaydı temiz olmak',
          'Ticaret odasına kayıtlı olmak',
          'İş yeri açma ve çalışma ruhsatı almak',
          'Mesleki sorumluluk sigortası yaptırmak',
        ],
      },
      {
        heading: 'Yetki Belgesi Kapsamı',
        items: [
          'Taşınmaz alım-satım ve kiralama aracılığı',
          'Portföy oluşturma ve pazarlama',
          'Ekspertiz ve değerleme hizmeti (SPK lisansı ayrıca gerekir)',
          'Danışmanlık hizmeti',
        ],
      },
      {
        heading: 'Komisyon Oranları (Yasal Sınırlar)',
        items: [
          'Satışta: Satış bedelinin %4\'üne kadar (+KDV) — taraflardan eşit olarak',
          'Kiralamada: Bir aylık kira bedeli (+KDV)',
          'Bu oranlar Ticaret Bakanlığı tarafından belirlenen azami sınırlardır',
          'Sözleşmede açıkça belirtilmelidir',
        ],
      },
    ],
    attentionNotes: [
      'Yetki belgesi olmadan faaliyet göstermek idari para cezası ve işyeri kapatma yaptırımına tabidir.',
      'MYK belgesi almak için Mesleki Yeterlilik Kurumu onaylı sınav merkezlerine başvurun.',
      'Yetki belgesi yenileme başvurusunu süre dolmadan yapın.',
      'Her şubede ayrı yetki belgesi gereklidir.',
    ],
  },
  {
    slug: 'kentsel-donusum',
    category: 'SALE',
    title: 'Kentsel Dönüşüm Satışları',
    summary: 'Riskli yapı, dönüşüm süreci ve hak sahipliği.',
    icon: 'construct-outline',
    sections: [
      {
        heading: 'Kentsel Dönüşüm Nedir?',
        items: [
          '6306 sayılı Afet Riski Altındaki Alanların Dönüştürülmesi Hakkında Kanun kapsamında yürütülür',
          'Riskli yapı tespiti yapılan binaların yıkılıp yeniden yapılması sürecidir',
          'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı koordinasyonunda yürütülür',
        ],
      },
      {
        heading: 'Riskli Yapı Tespiti',
        items: [
          'Bakanlık lisanslı kuruluşlar tarafından yapılır',
          'Bina sahibi veya kat maliklerinin 2/3 çoğunluğu ile başvurulur',
          'Tespit sonucu AFAD ve ilgili belediyeye bildirilir',
          'İtiraz süresi 15 gündür (İl Müdürlüğü\'ne)',
        ],
      },
      {
        heading: 'Satışta Dikkat Edilecekler',
        items: [
          'Riskli yapı tespiti yapılmış mülklerde tapu kaydına "riskli yapı" şerhi düşülür',
          'Alıcıyı riskli yapı durumu hakkında mutlaka bilgilendirin',
          'Dönüşüm projesi onaylanmışsa, yeni yapıdaki hak sahipliği durumunu netleştirin',
          'Müteahhit ile yapılan sözleşmeyi (kat karşılığı inşaat sözleşmesi) inceleyin',
          'Arsa payı oranını ve yeni yapıdaki daire/konum bilgisini kontrol edin',
        ],
      },
      {
        heading: 'Devlet Destekleri',
        items: [
          'Kira yardımı: Riskli yapıda oturan hak sahiplerine aylık kira yardımı',
          'Kredi desteği: Düşük faizli dönüşüm kredisi imkânı',
          'Tapu harç ve vergi muafiyetleri',
          'Yıkım ve nakliye masraflarında destek',
        ],
      },
    ],
    attentionNotes: [
      'Riskli yapı şerhi olan taşınmaz satışında alıcıyı bilgilendirmemek hukuki sorumluluk doğurur.',
      'Kat maliklerinin 2/3 çoğunluğu sağlanmadan dönüşüm kararı alınamaz.',
      'Müteahhit sözleşmesini mutlaka bir avukata inceletin.',
      'Dönüşüm sürecinde devlet desteklerinden yararlanma şartlarını araştırın.',
    ],
  },
];

// ─── Kiralama İşlemleri ────────────────────────────────────────────

const RENT_ARTICLES: GuideArticle[] = [
  {
    slug: 'kira-sozlesmesi-unsurlari',
    category: 'RENT',
    title: 'Kira Sözleşmesinde Zorunlu Unsurlar',
    summary: 'Geçerli bir kira sözleşmesinde bulunması gereken maddeler.',
    icon: 'create-outline',
    sections: [
      {
        heading: 'Zorunlu Bilgiler',
        items: [
          'Kiraya verenin ad-soyad, TC kimlik no, adres ve iletişim bilgileri',
          'Kiracının ad-soyad, TC kimlik no, adres ve iletişim bilgileri',
          'Kiralanan taşınmazın açık adresi ve tanımı',
          'Kira süresi (başlangıç ve bitiş tarihleri)',
          'Aylık kira bedeli (rakam ve yazı ile)',
          'Kira ödeme günü ve ödeme yöntemi',
          'Depozito (güvence bedeli) tutarı',
        ],
      },
      {
        heading: 'Önemli Maddeler',
        items: [
          'Kira artış oranı ve hesaplama yöntemi',
          'Aidat ve ortak giderlerin kime ait olduğu',
          'Taşınmazın kullanım amacı (konut, işyeri)',
          'Tahliye koşulları ve bildirim süreleri',
          'Taşınmazın mevcut durumu (teslim tutanağı ile)',
          'Alt kiralama ve devir koşulları',
          'Tadilat ve değişiklik kuralları',
        ],
      },
      {
        heading: 'Ek Düzenlemeler',
        items: [
          'Kefil bilgileri ve kefaletname (varsa)',
          'Eşya listesi (mobilyalı kiralamada)',
          'Özel şartlar (hayvan besleme, sigara içme vb.)',
          'İhtilaf halinde yetkili mahkeme',
          'Sözleşmenin kaç nüsha düzenlendiği',
        ],
      },
    ],
    attentionNotes: [
      'Kira sözleşmesi yazılı yapılmalıdır; sözlü anlaşma ispat zorluğu yaratır.',
      'Teslim tutanağı düzenleyerek taşınmazın mevcut durumunu fotoğraflarla belgeleyin.',
      'Sözleşmeyi en az 2 nüsha düzenleyin (taraflara birer adet).',
      'Depozito tutarını bankaya yatırın; makbuz/dekont ile belgeleyin.',
    ],
  },
  {
    slug: 'kira-artisi',
    category: 'RENT',
    title: 'Kira Artışı Hesaplama',
    summary: 'TÜFE bazlı kira artışı, yasal sınırlar ve hesaplama yöntemi.',
    icon: 'trending-up-outline',
    sections: [
      {
        heading: 'Yasal Çerçeve',
        items: [
          '6098 sayılı Türk Borçlar Kanunu (TBK) madde 344 uygulanır',
          'Konut kiralarında yıllık artış oranı, bir önceki kira yılına ait TÜFE on iki aylık ortalamasını geçemez',
          'İşyeri kiralarında 5 yıldan kısa sözleşmelerde aynı kural geçerlidir',
          '5 yıldan uzun sözleşmelerde hakim, emsal kiralara göre yeni bedel belirleyebilir',
        ],
      },
      {
        heading: 'TÜFE Hesaplama Yöntemi',
        items: [
          'TÜİK tarafından açıklanan Tüketici Fiyat Endeksi (TÜFE) 12 aylık ortalaması baz alınır',
          'Kira artış dönemi hangi aya denk geliyorsa, o aydan önceki 12 aylık TÜFE ortalaması uygulanır',
          'Örnek: Temmuz 2026\'da yenilenecek sözleşme için Haziran 2026 TÜFE ortalaması kullanılır',
          'Güncel TÜFE oranını TÜİK resmi sitesinden kontrol edin',
        ],
      },
      {
        heading: 'Özel Durumlar',
        items: [
          'Taraflar TÜFE\'nin altında bir oran kararlaştırabilir',
          'TÜFE\'nin üstünde anlaşma yapılsa bile yasal sınır uygulanır',
          'Yeni kira dönemi başlamadan en az 30 gün önce artış bildirimi yapılmalıdır',
          'Kira tespit davası açılabilir (emsal kiraların çok altında kalan durumlarda)',
        ],
      },
    ],
    attentionNotes: [
      'TÜFE oranını aşan artış geçersizdir; kiracı itiraz edebilir.',
      'Kira artış oranını sözleşmede açıkça belirtin.',
      '5 yılı aşan sözleşmelerde kira tespit davası açılabileceğini taraflara bildirin.',
      'Güncel TÜFE oranlarını TÜİK web sitesinden (tuik.gov.tr) kontrol edin.',
    ],
  },
  {
    slug: 'depozito-kurallari',
    category: 'RENT',
    title: 'Depozito Kuralları',
    summary: 'Depozito üst sınırı, saklama ve iade koşulları.',
    icon: 'wallet-outline',
    sections: [
      {
        heading: 'Yasal Düzenleme',
        items: [
          'TBK madde 342: Güvence bedeli (depozito) en fazla 3 aylık kira bedelidir',
          '3 aylık kira bedelini aşan depozito talebi yasaya aykırıdır',
          'Kiracı, fazla ödenen depozitoyu geri isteyebilir',
        ],
      },
      {
        heading: 'Depozito Yatırma',
        items: [
          'Depozito vadeli mevduat hesabına yatırılmalıdır (TBK madde 342/2)',
          'Hesap kiracı adına açılır',
          'İki tarafın birlikte rızası olmadan veya kesinleşmiş icra takibi / mahkeme kararı olmadan çekilemez',
          'Faiz geliri kiracıya aittir',
        ],
      },
      {
        heading: 'İade Koşulları',
        items: [
          'Tahliye sonrası taşınmaz hasar kontrolü yapılır',
          'Normal kullanımdan kaynaklanan yıpranma düşülemez',
          'Kira borcu, hasar bedeli veya ödenmeyen faturalar mahsup edilebilir',
          'Kalan tutar ve birikmiş faiz kiracıya iade edilir',
          'İade, tahliye ve teslim tutanağı sonrası yapılmalıdır',
        ],
      },
    ],
    attentionNotes: [
      '3 aylık kira bedelini aşan depozito talebi yasadışıdır.',
      'Depozitoyu elden almak yerine banka hesabına yatırılmasını sağlayın.',
      'Tahliye öncesi mutlaka teslim tutanağı düzenleyin ve fotoğrafla belgeleyin.',
      'Depozito iadesinde anlaşmazlık olursa, sulh hukuk mahkemesine başvurulabilir.',
    ],
  },
  {
    slug: 'tahliye-prosedurleri',
    category: 'RENT',
    title: 'Tahliye Prosedürleri',
    summary: 'Yasal tahliye yolları: ihtarname, icra ve dava süreçleri.',
    icon: 'log-out-outline',
    sections: [
      {
        heading: 'Kiracının Kendiliğinden Tahliyesi',
        items: [
          'Belirli süreli sözleşmede: Bitiş tarihinden en az 15 gün önce yazılı bildirim yapılmalıdır',
          'Belirsiz süreli sözleşmede: Fesih bildirim sürelerine uyulmalıdır (her 6 aylık dönemin sonu için, 3 ay önceden)',
          'Bildirim yapılmazsa sözleşme aynı koşullarla 1 yıl uzar',
        ],
      },
      {
        heading: 'Ev Sahibinin Tahliye Yolları',
        items: [
          'İhtiyaç nedeniyle tahliye: Kendisi, eşi, çocuğu veya bakmakla yükümlü olduğu kişilerin konut ihtiyacı',
          'Yeni malik tahliyesi: Taşınmazı satın alan yeni malik, edinme tarihinden itibaren 1 ay içinde bildirimde bulunarak 6 ay sonunda tahliye isteyebilir',
          'Yeniden inşa/imar: Esaslı tadilat veya yeniden inşa için tahliye',
          'İki haklı ihtar: Bir kira yılı içinde iki kez kirayı ödememesi halinde',
          'Tahliye taahhüdü: Kiracının noter onaylı yazılı tahliye taahhüdü vermesi',
        ],
      },
      {
        heading: 'Tahliye Davası',
        items: [
          'Sulh Hukuk Mahkemesi\'nde açılır',
          'İhtiyaç nedeniyle tahliye davasında samimi ve zorunlu ihtiyaç kanıtlanmalıdır',
          'Dava süresince kiracı taşınmazda oturmaya devam edebilir',
          'Mahkeme kararı kesinleşmeden icra takibi yapılamaz',
        ],
      },
      {
        heading: 'İcra Yoluyla Tahliye',
        items: [
          'Kira borcunu ödemeyen kiracıya icra takibi başlatılabilir',
          'Ödeme emri tebliğ edilir, kiracıya 30 gün (konut) süre verilir',
          'Süre sonunda ödeme yapılmazsa tahliye davası açılır',
          'Tahliye kararı alan ev sahibi, icra dairesi aracılığıyla tahliye ettiribilir',
        ],
      },
    ],
    attentionNotes: [
      'Ev sahibi, kiracıyı zorla çıkaramaz; mutlaka yasal yollardan tahliye etmelidir.',
      'İhtiyaç nedeniyle tahliye ettirilen taşınmaz 3 yıl süreyle başkasına kiralanamaz.',
      'Tahliye taahhüdü kira sözleşmesinden sonra ayrı bir tarihte alınmalıdır (sözleşme ile aynı tarihte alınan taahhüt geçersiz sayılabilir).',
      'İcra takibinde sürelere dikkat edin; usul hatası süreci uzatır.',
    ],
  },
  {
    slug: 'kiraci-ev-sahibi-haklari',
    category: 'RENT',
    title: 'Kiracı ve Ev Sahibi Hakları',
    summary: 'Her iki tarafın yasal hak ve yükümlülükleri.',
    icon: 'people-outline',
    sections: [
      {
        heading: 'Kiracının Hakları',
        items: [
          'Kira süresi boyunca taşınmazı kullanma hakkı',
          'Yasal sınırı aşan kira artışını reddetme hakkı',
          'Taşınmazın oturulabilir durumda teslim alınması hakkı',
          'Yapısal onarımların ev sahibi tarafından yaptırılmasını isteme hakkı',
          'Depozito iadesini talep hakkı (tahliye sonrası)',
          'Kira bedelinin indirilmesini isteme hakkı (taşınmazda ayıp varsa)',
          'Sözleşme süresince keyfi tahliye edilememe güvencesi',
        ],
      },
      {
        heading: 'Kiracının Yükümlülükleri',
        items: [
          'Kira bedelini zamanında ödemek',
          'Taşınmazı özenle kullanmak',
          'Komşulara saygılı davranmak',
          'İzinsiz tadilat yapmamak',
          'Taşınmazı izinsiz devretmemek veya alt kiraya vermemek',
          'Tahliye sonrası taşınmazı teslim alındığı durumda (normal yıpranma hariç) iade etmek',
        ],
      },
      {
        heading: 'Ev Sahibinin Hakları',
        items: [
          'Kira bedelini zamanında tahsil etme hakkı',
          'Yasal koşullar oluştuğunda tahliye talep etme hakkı',
          'Kira sözleşmesindeki kurallara uyulmasını isteme hakkı',
          'Taşınmazdaki hasarların tazmin edilmesini isteme hakkı',
          'Kira tespit davası açma hakkı (emsal kiraların çok altında kalınması halinde)',
        ],
      },
      {
        heading: 'Ev Sahibinin Yükümlülükleri',
        items: [
          'Taşınmazı sözleşmedeki amaca uygun, kullanılabilir durumda teslim etmek',
          'Yapısal bakım ve onarımları yaptırmak (çatı, tesisat, dış cephe)',
          'Kiracının huzurlu kullanımını engellememe',
          'Kira artışını yasal sınırlar içinde yapmak',
          'Depozito iadesini zamanında yapmak',
        ],
      },
    ],
    attentionNotes: [
      'Kiracı 10 yıl ve üzeri oturmuşsa, ev sahibi sözleşmeyi sona erdirebilir (TBK madde 347).',
      'Ev sahibi kiracının rızası olmadan taşınmaza giremez.',
      'Kira borcunu ödemeyen kiracıya karşı iki haklı ihtar yöntemi uygulanabilir.',
      'Taraflara haklarını ve yükümlülüklerini sözleşme aşamasında açıkça anlatın.',
    ],
  },
  {
    slug: 'sik-karsilasilan-maddeler',
    category: 'RENT',
    title: 'Sık Karşılaşılan Maddeler',
    summary: 'Hayvan besleme, tadilat, komşu şikayeti ve kısa süreli kiralama.',
    icon: 'help-circle-outline',
    sections: [
      {
        heading: 'Hayvan Besleme',
        items: [
          'Kira sözleşmesinde hayvan besleme yasağı konulabilir',
          'Yasak konulmamışsa kiracı evcil hayvan besleyebilir',
          'Ancak hayvan komşulara rahatsızlık veriyorsa (gürültü, koku) ev sahibi itiraz edebilir',
          'Kat mülkiyeti yönetim planında hayvan besleme yasağı varsa bu bağlayıcıdır',
        ],
      },
      {
        heading: 'Tadilat ve Değişiklikler',
        items: [
          'Kiracı, ev sahibinin yazılı onayı olmadan esaslı tadilat yapamaz',
          'Basit bakım ve boyama gibi işlemler kiracı tarafından yapılabilir',
          'İzinle yapılan tadilat masrafları sözleşmede belirlenmelidir',
          'Tahliye sırasında, izinsiz yapılan değişikliklerin eski haline getirilmesi istenebilir',
        ],
      },
      {
        heading: 'Komşu Şikâyetleri',
        items: [
          'Kiracı, komşulara karşı saygılı davranmakla yükümlüdür',
          'Gürültü, kötü koku veya rahatsız edici davranışlar şikâyet nedenidir',
          'Tekrarlayan şikâyetler tahliye sebebi olabilir',
          'Apartman yönetim planı kurallarına uyulması zorunludur',
        ],
      },
      {
        heading: 'Kısa Süreli Kiralama (Günlük)',
        items: [
          'Apartmanlarda günlük kiralama, kat maliklerinin oybirliğiyle alacağı karara bağlıdır',
          'İzinsiz günlük kiralama yapılması halinde diğer kat malikleri dava açabilir',
          'Turizm amaçlı kısa süreli kiralamalarda belediye izni ve tesis belgesi gerekebilir',
          'Kiracı, asıl kira sözleşmesinde izin verilmedikçe alt kiralama yapamaz',
        ],
      },
    ],
    attentionNotes: [
      'Sözleşmede açıkça belirtilmeyen konularda TBK ve Kat Mülkiyeti Kanunu hükümleri uygulanır.',
      'Tadilat izni mutlaka yazılı olarak alınmalı; sözlü izin ispat edilemez.',
      'Komşu şikâyetlerinde önce uyarı yazısı gönderin; dava son çare olmalıdır.',
      'Günlük kiralama yapmak isteyen kiracıyı kat malikleri kararı hakkında bilgilendirin.',
    ],
  },
  {
    slug: 'gecici-kiralama',
    category: 'RENT',
    title: 'Geçici Kiralama (Airbnb) Kuralları',
    summary: 'Kısa süreli ve turizm amaçlı kiralama mevzuatı.',
    icon: 'airplane-outline',
    sections: [
      {
        heading: 'Yasal Çerçeve',
        items: [
          '6585 sayılı Perakende Ticaretin Düzenlenmesi Hakkında Kanun ile düzenlenmektedir',
          'Konutların 100 günden fazla turizm amaçlı kiralanması için izin belgesi gerekir',
          'Belediyeden işyeri açma ve çalışma ruhsatı alınmalıdır',
          'Kat maliklerinin oybirliği ile karar alması gerekir',
        ],
      },
      {
        heading: 'İzin ve Belgeler',
        items: [
          'Kültür ve Turizm Bakanlığı\'ndan turizm işletme belgesi (100 günü aşan kiralamalarda)',
          'Belediyeden kısa süreli kiralama izni',
          'Kat malikleri kurulu kararı (oybirliği)',
          'Yangın güvenliği ve sigorta belgeleri',
          'Kimlik bildirimi yükümlülüğü (emniyet müdürlüğüne)',
        ],
      },
      {
        heading: 'Vergisel Yükümlülükler',
        items: [
          'Kira geliri vergisi beyanı zorunludur',
          'Yıllık gelir vergisi beyannamesi verilmelidir',
          'KDV yükümlülüğü doğabilir (konaklama hizmeti kapsamında)',
          'Stopaj vergisi uygulanmaz (gerçek kişi kiracıda)',
          'Gelir vergisi istisna tutarı üzerindeki gelirler vergilendirilir',
        ],
      },
      {
        heading: 'Dikkat Edilecek Hususlar',
        items: [
          'Platformlara (Airbnb vb.) kayıt olmadan önce tüm izinleri alın',
          'Kat maliklerinden izin almadan kısa süreli kiralama yapmayın',
          'Misafir kimlik bilgilerini kayıt altına alın ve emniyete bildirin',
          'Sigorta yaptırın (misafirlerin verebileceği hasarlara karşı)',
          'Komşu şikâyetlerini minimize etmek için ev kuralları belirleyin',
        ],
      },
    ],
    attentionNotes: [
      'İzinsiz kısa süreli kiralama yapanlara idari para cezası uygulanır.',
      'Kat malikleri oybirliği sağlanmadan yapılan kiralamalarda diğer malikler dava açabilir.',
      'Kimlik bildirimi yapılmaması güvenlik mevzuatına aykırıdır ve cezai yaptırımı vardır.',
      'Vergisel yükümlülükleri yerine getirmemek vergi cezasına neden olur.',
    ],
  },
];

// ─── Erişim Fonksiyonları ──────────────────────────────────────────

const ALL_ARTICLES: GuideArticle[] = [...SALE_ARTICLES, ...RENT_ARTICLES];

/** Tüm rehber makalelerini döndürür. Kategori filtresi opsiyonel. */
export function getGuideArticles(category?: GuideCategory): GuideArticle[] {
  if (!category) return ALL_ARTICLES;
  return ALL_ARTICLES.filter((a) => a.category === category);
}

/** Slug ile tek makale döndürür. */
export function getGuideArticle(slug: string): GuideArticle | undefined {
  return ALL_ARTICLES.find((a) => a.slug === slug);
}

/** Arama: başlık, özet ve içeriklerde arama yapar. */
export function searchGuideArticles(query: string): GuideArticle[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_ARTICLES;

  return ALL_ARTICLES.filter((article) => {
    if (article.title.toLowerCase().includes(q)) return true;
    if (article.summary.toLowerCase().includes(q)) return true;
    for (const section of article.sections) {
      if (section.heading.toLowerCase().includes(q)) return true;
      for (const item of section.items) {
        if (item.toLowerCase().includes(q)) return true;
      }
    }
    for (const note of article.attentionNotes) {
      if (note.toLowerCase().includes(q)) return true;
    }
    return false;
  });
}
