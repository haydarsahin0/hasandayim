/* ==========================================================================
   Op. Dr. Hasan Doğan — Turkey 81 Provinces, Medical Specialties, Seed Data
   and Dual Google Maps Discovery Engine (Live Places API + Built-in Turkey Dataset)
   ========================================================================== */

window.AppData = (function () {
  // All 81 provinces of Turkey with approximate center coordinates & region
  const PROVINCES_81 = [
    { name: 'Adana', region: 'Akdeniz', lat: 37.0000, lng: 35.3213, districts: ['Seyhan', 'Çukurova', 'Yüreğir'] },
    { name: 'Adıyaman', region: 'Güneydoğu', lat: 37.7648, lng: 38.2786, districts: ['Merkez', 'Kahta'] },
    { name: 'Afyonkarahisar', region: 'Ege', lat: 38.7507, lng: 30.5567, districts: ['Merkez', 'Sandıklı'] },
    { name: 'Ağrı', region: 'Doğu Anadolu', lat: 39.7191, lng: 43.0503, districts: ['Merkez', 'Doğubayazıt'] },
    { name: 'Aksaray', region: 'İç Anadolu', lat: 38.3687, lng: 34.0370, districts: ['Merkez'] },
    { name: 'Amasya', region: 'Karadeniz', lat: 40.6499, lng: 35.8353, districts: ['Merkez', 'Merzifon'] },
    { name: 'Ankara', region: 'İç Anadolu', lat: 39.9334, lng: 32.8597, districts: ['Çankaya', 'Yenimahalle', 'Keçiören', 'Etimesgut'] },
    { name: 'Antalya', region: 'Akdeniz', lat: 36.8969, lng: 30.7133, districts: ['Muratpaşa', 'Konyaaltı', 'Kepez', 'Alanya'] },
    { name: 'Ardahan', region: 'Doğu Anadolu', lat: 41.1105, lng: 42.7022, districts: ['Merkez'] },
    { name: 'Artvin', region: 'Karadeniz', lat: 41.1828, lng: 41.8183, districts: ['Merkez', 'Hopa'] },
    { name: 'Aydın', region: 'Ege', lat: 37.8560, lng: 27.8416, districts: ['Efeler', 'Kuşadası', 'Nazilli'] },
    { name: 'Balıkesir', region: 'Marmara', lat: 39.6484, lng: 27.8826, districts: ['Altıeylül', 'Karesi', 'Bandırma', 'Edremit'] },
    { name: 'Bartın', region: 'Karadeniz', lat: 41.6344, lng: 32.3375, districts: ['Merkez'] },
    { name: 'Batman', region: 'Güneydoğu', lat: 37.8812, lng: 41.1351, districts: ['Merkez'] },
    { name: 'Bayburt', region: 'Karadeniz', lat: 40.2552, lng: 40.2249, districts: ['Merkez'] },
    { name: 'Bilecik', region: 'Marmara', lat: 40.1451, lng: 29.9799, districts: ['Merkez', 'Bozüyük'] },
    { name: 'Bingöl', region: 'Doğu Anadolu', lat: 38.8854, lng: 40.4980, districts: ['Merkez'] },
    { name: 'Bitlis', region: 'Doğu Anadolu', lat: 38.4006, lng: 42.1095, districts: ['Merkez', 'Tatvan'] },
    { name: 'Bolu', region: 'Karadeniz', lat: 40.7392, lng: 31.6089, districts: ['Merkez'] },
    { name: 'Burdur', region: 'Akdeniz', lat: 37.7204, lng: 30.2908, districts: ['Merkez', 'Bucak'] },
    { name: 'Bursa', region: 'Marmara', lat: 40.1885, lng: 29.0610, districts: ['Nilüfer', 'Osmangazi', 'Yıldırım'] },
    { name: 'Çanakkale', region: 'Marmara', lat: 40.1553, lng: 26.4142, districts: ['Merkez', 'Biga'] },
    { name: 'Çankırı', region: 'İç Anadolu', lat: 40.6013, lng: 33.6134, districts: ['Merkez'] },
    { name: 'Çorum', region: 'Karadeniz', lat: 40.5506, lng: 34.9556, districts: ['Merkez', 'Sungurlu'] },
    { name: 'Denizli', region: 'Ege', lat: 37.7765, lng: 29.0864, districts: ['Pamukkale', 'Merkezefendi'] },
    { name: 'Diyarbakır', region: 'Güneydoğu', lat: 37.9144, lng: 40.2306, districts: ['Kayapınar', 'Yenişehir', 'Bağlar'] },
    { name: 'Düzce', region: 'Karadeniz', lat: 40.8438, lng: 31.1565, districts: ['Merkez'] },
    { name: 'Edirne', region: 'Marmara', lat: 41.6771, lng: 26.5557, districts: ['Merkez', 'Keşan'] },
    { name: 'Elazığ', region: 'Doğu Anadolu', lat: 38.6810, lng: 39.2264, districts: ['Merkez'] },
    { name: 'Erzincan', region: 'Doğu Anadolu', lat: 39.7500, lng: 39.5000, districts: ['Merkez'] },
    { name: 'Erzurum', region: 'Doğu Anadolu', lat: 39.9043, lng: 41.2679, districts: ['Yakutiye', 'Palandöken'] },
    { name: 'Eskişehir', region: 'İç Anadolu', lat: 39.7767, lng: 30.5206, districts: ['Tepebaşı', 'Odunpazarı'] },
    { name: 'Gaziantep', region: 'Güneydoğu', lat: 37.0662, lng: 37.3833, districts: ['Şehitkamil', 'Şahinbey'] },
    { name: 'Giresun', region: 'Karadeniz', lat: 40.9128, lng: 38.3895, districts: ['Merkez', 'Bulancak'] },
    { name: 'Gümüşhane', region: 'Karadeniz', lat: 40.4603, lng: 39.4814, districts: ['Merkez'] },
    { name: 'Hakkari', region: 'Doğu Anadolu', lat: 37.5833, lng: 43.7333, districts: ['Merkez', 'Yüksekova'] },
    { name: 'Hatay', region: 'Akdeniz', lat: 36.4018, lng: 36.3498, districts: ['Antakya', 'İskenderun', 'Defne'] },
    { name: 'Iğdır', region: 'Doğu Anadolu', lat: 39.9167, lng: 44.0333, districts: ['Merkez'] },
    { name: 'Isparta', region: 'Akdeniz', lat: 37.7648, lng: 30.5566, districts: ['Merkez'] },
    { name: 'İstanbul', region: 'Marmara', lat: 41.0082, lng: 28.9784, districts: ['Şişli', 'Kadıköy', 'Beşiktaş', 'Ataşehir', 'Bakırköy'] },
    { name: 'İzmir', region: 'Ege', lat: 38.4237, lng: 27.1428, districts: ['Konak', 'Karşıyaka', 'Bornova', 'Bayraklı'] },
    { name: 'Kahramanmaraş', region: 'Akdeniz', lat: 37.5858, lng: 36.9371, districts: ['Onikişubat', 'Dulkadiroğlu'] },
    { name: 'Karabük', region: 'Karadeniz', lat: 41.2061, lng: 32.6204, districts: ['Merkez', 'Safranbolu'] },
    { name: 'Karaman', region: 'İç Anadolu', lat: 37.1759, lng: 33.2287, districts: ['Merkez'] },
    { name: 'Kars', region: 'Doğu Anadolu', lat: 40.6013, lng: 43.0975, districts: ['Merkez'] },
    { name: 'Kastamonu', region: 'Karadeniz', lat: 41.3887, lng: 33.7827, districts: ['Merkez'] },
    { name: 'Kayseri', region: 'İç Anadolu', lat: 38.7312, lng: 35.4787, districts: ['Melikgazi', 'Kocasinan', 'Talas'] },
    { name: 'Kırıkkale', region: 'İç Anadolu', lat: 39.8468, lng: 33.5153, districts: ['Merkez'] },
    { name: 'Kırklareli', region: 'Marmara', lat: 41.7333, lng: 27.2167, districts: ['Merkez', 'Lüleburgaz'] },
    { name: 'Kırşehir', region: 'İç Anadolu', lat: 39.1425, lng: 34.1709, districts: ['Merkez'] },
    { name: 'Kilis', region: 'Güneydoğu', lat: 36.7184, lng: 37.1212, districts: ['Merkez'] },
    { name: 'Kocaeli', region: 'Marmara', lat: 40.8533, lng: 29.8815, districts: ['İzmit', 'Gebze', 'Başiskele'] },
    { name: 'Konya', region: 'İç Anadolu', lat: 37.8746, lng: 32.4932, districts: ['Selçuklu', 'Meram', 'Karatay'] },
    { name: 'Kütahya', region: 'Ege', lat: 39.4167, lng: 29.9833, districts: ['Merkez'] },
    { name: 'Malatya', region: 'Doğu Anadolu', lat: 38.3552, lng: 38.3095, districts: ['Battalgazi', 'Yeşilyurt'] },
    { name: 'Manisa', region: 'Ege', lat: 38.6191, lng: 27.4289, districts: ['Yunusemre', 'Şehzadeler', 'Turgutlu'] },
    { name: 'Mardin', region: 'Güneydoğu', lat: 37.3212, lng: 40.7245, districts: ['Artuklu', 'Kızıltepe'] },
    { name: 'Mersin', region: 'Akdeniz', lat: 36.8000, lng: 34.6333, districts: ['Yenişehir', 'Mezitli', 'Tarsus'] },
    { name: 'Muğla', region: 'Ege', lat: 37.2153, lng: 28.3636, districts: ['Menteşe', 'Bodrum', 'Fethiye', 'Marmaris'] },
    { name: 'Muş', region: 'Doğu Anadolu', lat: 38.7432, lng: 41.5064, districts: ['Merkez'] },
    { name: 'Nevşehir', region: 'İç Anadolu', lat: 38.6244, lng: 34.7239, districts: ['Merkez', 'Ürgüp'] },
    { name: 'Niğde', region: 'İç Anadolu', lat: 37.9667, lng: 34.6833, districts: ['Merkez'] },
    { name: 'Ordu', region: 'Karadeniz', lat: 40.9839, lng: 37.8764, districts: ['Altınordu', 'Ünye', 'Fatsa'] },
    { name: 'Osmaniye', region: 'Akdeniz', lat: 37.0742, lng: 36.2478, districts: ['Merkez'] },
    { name: 'Rize', region: 'Karadeniz', lat: 41.0201, lng: 40.5234, districts: ['Merkez'] },
    { name: 'Sakarya', region: 'Marmara', lat: 40.7569, lng: 30.3781, districts: ['Serdivan', 'Adapazarı'] },
    { name: 'Samsun', region: 'Karadeniz', lat: 41.2867, lng: 36.3300, districts: ['Atakum', 'İlkadım'] },
    { name: 'Şanlıurfa', region: 'Güneydoğu', lat: 37.1591, lng: 38.7969, districts: ['Haliliye', 'Karaköprü'] },
    { name: 'Siirt', region: 'Güneydoğu', lat: 37.9333, lng: 41.9500, districts: ['Merkez'] },
    { name: 'Sinop', region: 'Karadeniz', lat: 42.0231, lng: 35.1531, districts: ['Merkez'] },
    { name: 'Şırnak', region: 'Güneydoğu', lat: 37.5164, lng: 42.4611, districts: ['Merkez', 'Cizre'] },
    { name: 'Sivas', region: 'İç Anadolu', lat: 39.7477, lng: 37.0175, districts: ['Merkez'] },
    { name: 'Tekirdağ', region: 'Marmara', lat: 40.9833, lng: 27.5167, districts: ['Süleymanpaşa', 'Çorlu'] },
    { name: 'Tokat', region: 'Karadeniz', lat: 40.3167, lng: 36.5500, districts: ['Merkez'] },
    { name: 'Trabzon', region: 'Karadeniz', lat: 41.0015, lng: 39.7178, districts: ['Ortahisar', 'Akçaabat'] },
    { name: 'Tunceli', region: 'Doğu Anadolu', lat: 39.1079, lng: 39.5401, districts: ['Merkez'] },
    { name: 'Uşak', region: 'Ege', lat: 38.6823, lng: 29.4082, districts: ['Merkez'] },
    { name: 'Van', region: 'Doğu Anadolu', lat: 38.4891, lng: 43.4089, districts: ['İpekyolu', 'Tuşba'] },
    { name: 'Yalova', region: 'Marmara', lat: 40.6500, lng: 29.2667, districts: ['Merkez'] },
    { name: 'Yozgat', region: 'İç Anadolu', lat: 39.8181, lng: 34.8147, districts: ['Merkez'] },
    { name: 'Zonguldak', region: 'Karadeniz', lat: 41.4564, lng: 31.7987, districts: ['Merkez', 'Ereğli'] }
  ];

  const SPECIALTIES = [
    { id: 'ortopedi', label: 'Ortopedi ve Travmatoloji', short: 'Ortopedi', query: 'ortopedi doktoru kliniği' },
    { id: 'ftr', label: 'Fizik Tedavi ve Rehabilitasyon', short: 'Fizik Tedavi', query: 'fizik tedavi rehabilitasyon uzmanı' },
    { id: 'spor', label: 'Spor Hekimliği', short: 'Spor Hekimliği', query: 'spor hekimliği uzmanı kliniği' },
    { id: 'algoloji', label: 'Algoloji (Ağrı Tedavisi)', short: 'Algoloji', query: 'algoloji ağrı kliniği doktor' },
    { id: 'romatoloji', label: 'Romatoloji', short: 'Romatoloji', query: 'romatoloji uzmanı muayenehane' },
    { id: 'noroloji', label: 'Nöroloji', short: 'Nöroloji', query: 'nöroloji uzmanı kliniği' },
    { id: 'beyin', label: 'Beyin ve Sinir Cerrahisi', short: 'Beyin Cerrahisi', query: 'beyin sinir cerrahisi doktoru' },
    { id: 'getat', label: 'Bütüncül Tıp / GETAT', short: 'Bütüncül Tıp', query: 'proloterapi ozon bütüncül tıp kliniği' }
  ];

  const INITIAL_SETTINGS = {
    doctorName: 'Op. Dr. Hasan Doğan',
    doctorTitle: 'Ortopedi ve Travmatoloji Uzmanı · Bilimsel Proloterapi Derneği Kurucu Başkanı',
    coordinatorName: 'Seher Çakmak',
    coordinatorRole: 'Eğitim Koordinatörü',
    coordinatorPhone: '0 (530) 876 61 65',
    coordinatorPhoneClean: '905308766165',
    websitePrimary: 'https://www.drhasandogan.com',
    websiteSecondary: 'https://www.proloterapi.com.tr',
    instagramUrl: 'https://www.instagram.com/drhasandogan',
    facebookUrl: 'https://www.facebook.com/drhasandogan',
    googleMeetDefaultUrl: 'https://meet.google.com/hsn-prolo-egitim',
    googleMapsApiKey: '',
    whatsappMode: 'direct', // 'direct' (wa.me) or 'cloud_api'
    whatsappPhoneId: '',
    whatsappWebhookUrl: '',
    companyName: 'Dr. Hasan Doğan Sağlık & Eğitim Hizmetleri',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    bankName: 'Banka Bilgisi (Ayarlardan Güncellenebilir)',
    taxOffice: 'Denizli Vergi Dairesi',
    paymentGateway: 'iyzico / PayTR Hazır Altyapı'
  };

  const INITIAL_SEMINARS = [
    {
      id: 'sem-hackett-denizli',
      slug: 'uygulamali-klasik-hackett-proloterapi-denizli',
      title: 'Uygulamalı Klasik Hackett Proloterapi',
      shortDesc: 'Omuz, Dirsek ve El Bilek Eklemi Sorunları ile Diz, Ayak ve Ayak Bileği Sorunlarına bütüncül tıp bakış açısıyla teorik anlatım ve klinik vaka uygulamaları.',
      detailedDesc: 'Bilimsel Proloterapi Derneği Kurucu Başkanı Op. Dr. Hasan Doğan tarafından verilen bu iki günlük yoğun uygulamalı eğitimde, klasik Hackett-Hemwall proloterapi prensipleri, üst ve alt ekstremite anatomisi, enjeksiyon teknikleri ve gerçek klinik vaka uygulamaları birebir işlenmektedir.\n\nProgram İçeriği:\n• 1. Gün: Bütüncül Tıp Perspektifi, Omuz, Dirsek ve El Bilek Eklemi Anatomisi & Enjeksiyon Protokolleri\n• 2. Gün: Diz, Ayak ve Ayak Bileği Sorunları, Canlı Hasta Değerlendirmesi ve Uygulamalı Vaka Çalışmaları\n• Eğitim sonunda Bilimsel Proloterapi Derneği Katılım Sertifikası takdim edilir.',
      type: 'yuz_yuze', // 'yuz_yuze' | 'online' | 'hibrit'
      dateText: '20-21 Haziran 2026',
      timeText: '09:30 - 17:30',
      location: 'Denizli — Klinik Uygulama Merkezi',
      city: 'Denizli',
      meetUrl: '',
      slideDeckName: 'Hackett_Proloterapi_Ekstremite_Protokolleri.pdf',
      price: 25000,
      capacity: 30,
      coverImage: 'assets/proloterapi-cover.jpg',
      status: 'active',
      targetSpecialties: ['Ortopedi', 'Fizik Tedavi', 'Spor Hekimliği', 'Algoloji', 'Bütüncül Tıp'],
      createdAt: '2026-05-11'
    },
    {
      id: 'sem-butuncul-online',
      slug: 'butuncul-tip-bakis-acisiyla-kuresel-bir-teshis',
      title: 'Bütüncül Tıp Bakış Açısıyla Küresel Bir Teşhis',
      shortDesc: 'Google Meet üzerinden canlı ekran paylaşımı ve 39 slaytlık kapsamlı vaka sunumu ile hekimlere özel interaktif online seminer.',
      detailedDesc: 'Türkiye’nin her ilinden hekimlerin katılabileceği bu canlı online eğitimde, kronik kas-iskelet ağrılarının kök neden analizi, bütüncül teşhis yaklaşımı ve klinik karar verme algoritmaları 39 slaytlık güncel sunum eşliğinde ele alınmaktadır.\n\nOnline Eğitim İşleyişi:\n• Ödeme onayının ardından sistem tarafından size özel kullanıcı adı ve şifre oluşturulur.\n• Katılımcı Portalı üzerinden Op. Dr. Hasan Doğan’ın Google Meet canlı yayınına bağlanabilir, eş zamanlı ekran paylaşımı ve slaytları takip edebilirsiniz.\n• Soru-cevap ve vaka tartışma oturumu dahildir.',
      type: 'online',
      dateText: '12 Temmuz 2026',
      timeText: '20:00 - 22:30',
      location: 'Online Canlı Eğitim (Google Meet)',
      city: 'Online (81 İl)',
      meetUrl: 'https://meet.google.com/hsn-prolo-egitim',
      slideDeckName: 'Bütüncül Tıp Bakış Açısıyla Küresel Bir Teşhis.pdf (39 Sayfa)',
      price: 4500,
      capacity: 100,
      coverImage: 'assets/online-cover.jpg',
      status: 'active',
      targetSpecialties: ['Ortopedi', 'Fizik Tedavi', 'Algoloji', 'Romatoloji', 'Nöroloji', 'Bütüncül Tıp'],
      createdAt: '2026-05-12'
    }
  ];

  // Authentic sample slide deck for the online classroom viewer (from screenshot 5 PDF title!)
  const SAMPLE_SLIDES = [
    {
      num: 1,
      total: 39,
      section: 'Giriş & Çerçeve',
      title: 'Bütüncül Tıp Bakış Açısıyla Küresel Bir Teşhis',
      bullets: [
        'Op. Dr. Hasan Doğan — Bilimsel Proloterapi Derneği Kurucu Başkanı',
        'Kronik kas-iskelet ağrılarında semptom odaklı yaklaşımdan kök neden teşhisine geçiş',
        'Ligament, tendon ve entezis yapılarının biyomekanik bütünlüğü'
      ]
    },
    {
      num: 2,
      total: 39,
      section: 'Klinik Paradigma',
      title: 'Ağrının Kaynağını Doğru Okumak: Lokal vs. Sistemik Bakış',
      bullets: [
        'Görüntüleme bulguları ile klinik muayene arasındaki uyumsuzluklar',
        'Yansıyan ağrı haritaları (Hackett Referans Noktaları)',
        'Postüral zincir ve uzak segment kompansasyon mekanizmaları'
      ]
    },
    {
      num: 3,
      total: 39,
      section: 'Proloterapi Temelleri',
      title: 'Klasik Hackett Proloterapi & Rejeneratif İyileşme Kaskadı',
      bullets: [
        'Kontrollü inflamasyon fazı, fibroblast proliferasyonu ve kolajen remodeling',
        'Omuz, dirsek, el bileği ile diz ve ayak bileği instabilitelerinde hedef noktalar',
        'Hasta seçimi, kontrendikasyonlar ve takip protokolleri'
      ]
    },
    {
      num: 4,
      total: 39,
      section: 'Vaka Tartışması',
      title: 'Klinik Vaka Analizi & Soru-Cevap Oturumu',
      bullets: [
        'Dirençli kronik diz ve omuz ağrısı vakalarında kombine bütüncül değerlendirme',
        'Enjeksiyon sonrası rehabilitasyon ve beslenme/mikro-besin desteği',
        'Google Meet canlı ekran paylaşımı üzerinden katılımcı hekim vakalarının tartışılması'
      ]
    }
  ];

  const INITIAL_SOCIAL_POSTS = [
    {
      id: 'soc-1',
      platform: 'Instagram',
      date: '14 Mayıs 2026',
      title: 'Klasik Hackett Proloterapi ile Kronik Eklem Ağrılarında Kök Neden Yaklaşımı',
      excerpt: 'Omuz, dirsek, diz ve ayak bileği bağ yaralanmalarında rejeneratif proloterapi uygulamalarının klinik sonuçları üzerine canlı yayın özeti.',
      url: 'https://www.instagram.com/drhasandogan',
      tag: 'Canlı Yayın & Reels'
    },
    {
      id: 'soc-2',
      platform: 'Facebook',
      date: '10 Mayıs 2026',
      title: '20-21 Haziran Denizli Uygulamalı Proloterapi Eğitimi Duyurusu',
      excerpt: 'Bilimsel Proloterapi Derneği kapsamında hekimlerimize yönelik yüz yüze teorik anlatım ve canlı hasta vaka uygulamaları kayıtları açıldı.',
      url: 'https://www.facebook.com/drhasandogan',
      tag: 'Eğitim Duyurusu'
    },
    {
      id: 'soc-3',
      platform: 'Web Yayını',
      date: '04 Mayıs 2026',
      title: 'Bütüncül Tıp Perspektifinden Bağ Dokusu İyileşmesi (Makale)',
      excerpt: 'drhasandogan.com ve proloterapi.com.tr üzerinde yayımlanan güncel klinik rehber ve sık sorulan hekim soruları.',
      url: 'https://www.proloterapi.com.tr',
      tag: 'Bilimsel Arşiv'
    }
  ];

  const INITIAL_DOCTORS = [
    {
      id: 'doc-101',
      name: 'Doç. Dr. Osman Çiloğlu',
      clinic: 'Adana Ortopedi & Eklem Kliniği',
      specialty: 'Ortopedi',
      city: 'Adana',
      district: 'Seyhan',
      phone: '+90 530 330 33 44',
      rating: 4.8,
      reviews: 64,
      status: 'sent', // 'new' | 'sent' | 'replied' | 'registered'
      source: 'Google Maps',
      lat: 37.0012,
      lng: 35.3251,
      addedAt: 'Bugün 10:15',
      notes: 'Hackett Proloterapi broşürü WhatsApp’tan iletildi.'
    },
    {
      id: 'doc-102',
      name: 'Prof. Dr. Gürkan Özkoç',
      clinic: 'Özel Ortopedi & Spor Cerrahisi Muayenehanesi',
      specialty: 'Ortopedi',
      city: 'Adana',
      district: 'Çukurova',
      phone: '+90 530 780 53 00',
      rating: 4.9,
      reviews: 117,
      status: 'replied',
      source: 'Google Maps',
      lat: 37.0411,
      lng: 35.2912,
      addedAt: 'Bugün 10:15',
      notes: 'Denizli yüz yüze eğitim takvimini sordu.'
    },
    {
      id: 'doc-103',
      name: 'Prof. Dr. Serkan Akpınar',
      clinic: 'Akpınar Eklem Sağlığı Merkezi',
      specialty: 'Ortopedi',
      city: 'Adana',
      district: 'Seyhan',
      phone: '+90 541 848 89 82',
      rating: 4.8,
      reviews: 34,
      status: 'new',
      source: 'Google Maps',
      lat: 36.9924,
      lng: 35.3315,
      addedAt: 'Bugün 10:18',
      notes: ''
    },
    {
      id: 'doc-104',
      name: 'Uzm. Dr. Zeynep Karahan',
      clinic: 'Kadıköy Fizik Tedavi & Ağrı Kliniği',
      specialty: 'Fizik Tedavi',
      city: 'İstanbul',
      district: 'Kadıköy',
      phone: '+90 532 418 72 19',
      rating: 4.9,
      reviews: 142,
      status: 'registered',
      source: 'Google Maps',
      lat: 40.9885,
      lng: 29.0294,
      addedAt: 'Dün 16:40',
      notes: 'Online Google Meet seminerine kayıt oldu.'
    },
    {
      id: 'doc-105',
      name: 'Op. Dr. Emre Aydınlı',
      clinic: 'Çankaya Ortopedi & Rejeneratif Tıp',
      specialty: 'Ortopedi',
      city: 'Ankara',
      district: 'Çankaya',
      phone: '+90 533 612 45 90',
      rating: 4.7,
      reviews: 89,
      status: 'sent',
      source: 'Google Maps',
      lat: 39.9082,
      lng: 32.8618,
      addedAt: 'Dün 15:20',
      notes: 'WhatsApp tanıtım mesajı ve afiş gönderildi.'
    },
    {
      id: 'doc-106',
      name: 'Uzm. Dr. Murat Demirtaş',
      clinic: 'Pamukkale Algoloji & Fizik Tedavi',
      specialty: 'Algoloji',
      city: 'Denizli',
      district: 'Pamukkale',
      phone: '+90 535 741 28 63',
      rating: 4.9,
      reviews: 76,
      status: 'registered',
      source: 'Google Maps',
      lat: 37.7834,
      lng: 29.0942,
      addedAt: 'Dün 14:10',
      notes: 'Denizli uygulamalı Hackett eğitimine kayıt yaptı.'
    },
    {
      id: 'doc-107',
      name: 'Doç. Dr. Selin Yılmaz',
      clinic: 'Konak Spor Hekimliği & Rehabilitasyon',
      specialty: 'Spor Hekimliği',
      city: 'İzmir',
      district: 'Konak',
      phone: '+90 532 890 14 52',
      rating: 4.8,
      reviews: 108,
      status: 'replied',
      source: 'Google Maps',
      lat: 38.4265,
      lng: 27.1411,
      addedAt: '2 gün önce',
      notes: 'Online eğitim içeriğini inceledi, ekip arkadaşıyla katılacak.'
    },
    {
      id: 'doc-108',
      name: 'Op. Dr. Hakan Kaya',
      clinic: 'Nilüfer Ortopedi ve Travmatoloji Kliniği',
      specialty: 'Ortopedi',
      city: 'Bursa',
      district: 'Nilüfer',
      phone: '+90 542 309 61 77',
      rating: 4.6,
      reviews: 53,
      status: 'new',
      source: 'Google Maps',
      lat: 40.2145,
      lng: 28.9721,
      addedAt: '2 gün önce',
      notes: ''
    },
    {
      id: 'doc-109',
      name: 'Uzm. Dr. Ayşe Nur Şahin',
      clinic: 'Muratpaşa Bütüncül Tıp & Proloterapi',
      specialty: 'Bütüncül Tıp',
      city: 'Antalya',
      district: 'Muratpaşa',
      phone: '+90 536 520 84 11',
      rating: 5.0,
      reviews: 95,
      status: 'sent',
      source: 'Google Maps',
      lat: 36.8851,
      lng: 30.7192,
      addedAt: '2 gün önce',
      notes: 'WhatsApp üzerinden sunum daveti iletildi.'
    },
    {
      id: 'doc-110',
      name: 'Prof. Dr. Kemalettin Arslan',
      clinic: 'Şişli Romatoloji & Eklem Muayenehanesi',
      specialty: 'Romatoloji',
      city: 'İstanbul',
      district: 'Şişli',
      phone: '+90 532 214 99 30',
      rating: 4.7,
      reviews: 121,
      status: 'new',
      source: 'Google Maps',
      lat: 41.0604,
      lng: 28.9877,
      addedAt: '3 gün önce',
      notes: ''
    }
  ];

  const INITIAL_PARTICIPANTS = [
    {
      id: 'part-1',
      seminarId: 'sem-butuncul-online',
      title: 'Uzm. Dr.',
      fullName: 'Zeynep Karahan',
      specialty: 'Fizik Tedavi',
      clinic: 'Kadıköy Fizik Tedavi & Ağrı Kliniği',
      email: 'dr.zeynep@kadikoyftr.com',
      phone: '+90 532 418 72 19',
      city: 'İstanbul',
      paymentStatus: 'paid', // 'pending' | 'paid'
      paymentMethod: 'Kredi Kartı (Online)',
      amount: 4500,
      accessUser: 'DR-2026',
      accessPass: 'PROLO2026',
      registeredAt: '18 Mayıs 2026, 14:22'
    },
    {
      id: 'part-2',
      seminarId: 'sem-hackett-denizli',
      title: 'Uzm. Dr.',
      fullName: 'Murat Demirtaş',
      specialty: 'Algoloji',
      clinic: 'Pamukkale Algoloji & Fizik Tedavi',
      email: 'murat.demirtas@pamukkaleagri.com',
      phone: '+90 535 741 28 63',
      city: 'Denizli',
      paymentStatus: 'paid',
      paymentMethod: 'Havale / EFT',
      amount: 25000,
      accessUser: 'DR-8412',
      accessPass: 'HCKT4821',
      registeredAt: '18 Mayıs 2026, 11:05'
    },
    {
      id: 'part-3',
      seminarId: 'sem-hackett-denizli',
      title: 'Doç. Dr.',
      fullName: 'Selin Yılmaz',
      specialty: 'Spor Hekimliği',
      clinic: 'Konak Spor Hekimliği & Rehabilitasyon',
      email: 'selin.yilmaz@izmirsport.com',
      phone: '+90 532 890 14 52',
      city: 'İzmir',
      paymentStatus: 'pending',
      paymentMethod: 'Havale / EFT (Bekliyor)',
      amount: 25000,
      accessUser: 'DR-6390',
      accessPass: 'HCKT9104',
      registeredAt: '19 Mayıs 2026, 09:44'
    }
  ];

  const INITIAL_CAMPAIGNS = [
    {
      id: 'cmp-1',
      name: 'Denizli Hackett Proloterapi — Ege & Akdeniz WhatsApp Duyurusu',
      seminarId: 'sem-hackett-denizli',
      channel: 'WhatsApp',
      sentCount: 42,
      openedCount: 36,
      repliedCount: 11,
      registeredCount: 2,
      date: '16 Mayıs 2026',
      status: 'completed'
    },
    {
      id: 'cmp-2',
      name: 'Bütüncül Tıp Online Seminer — Büyükşehir FTR & Ortopedi',
      seminarId: 'sem-butuncul-online',
      channel: 'WhatsApp',
      sentCount: 68,
      openedCount: 59,
      repliedCount: 18,
      registeredCount: 1,
      date: '18 Mayıs 2026',
      status: 'active'
    }
  ];

  const INITIAL_ACTIVITIES = [
    { id: 'act-1', type: 'register', text: 'Doç. Dr. Selin Yılmaz (İzmir) "Uygulamalı Klasik Hackett Proloterapi" seminerine kayıt oluşturdu.', time: '2 saat önce' },
    { id: 'act-2', type: 'whatsapp', text: 'Adana ve Ankara bölgesinde 10 yeni Ortopedi hekimine WhatsApp eğitim afişi gönderildi.', time: '5 saat önce' },
    { id: 'act-3', type: 'payment', text: 'Uzm. Dr. Zeynep Karahan ödemesini tamamladı — Google Meet giriş şifresi (DR-2026) tanımlandı.', time: 'Dün' },
    { id: 'act-4', type: 'discovery', text: 'Google Maps taraması tamamlandı: İstanbul, Ankara, İzmir ve Denizli illerinden yeni klinikler eklendi.', time: '2 gün önce' }
  ];

  // Realistic Turkish physician generator for instant zero-API-key Google Maps Discovery demonstration
  const FIRST_NAMES = [
    'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'İbrahim', 'Ömer', 'Burak', 'Caner', 'Emre',
    'Kerem', 'Serhat', 'Tolga', 'Uğur', 'Volkan', 'Yusuf', 'Ayşe', 'Fatma', 'Elif', 'Zeynep',
    'Merve', 'Seda', 'Selin', 'Ebru', 'Deniz', 'Gülşah', 'Hande', 'Pınar', 'Tuğba', 'Esra'
  ];
  const LAST_NAMES = [
    'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir',
    'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek',
    'Polat', 'Korkmaz', 'Çakır', 'Erdoğan', 'Aksoy', 'Güneş', 'Karahan', 'Taş', 'Tekin', 'Bozkurt'
  ];
  const TITLES = ['Op. Dr.', 'Uzm. Dr.', 'Doç. Dr.', 'Prof. Dr.'];
  const CLINIC_SUFFIXES = [
    'Özel Muayenehanesi',
    'Eklem & Ağrı Kliniği',
    'Sağlık ve Rehabilitasyon Merkezi',
    'Tıp Merkezi',
    'Özel Kliniği'
  ];

  function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  /**
   * Instant built-in Turkish physician discovery (for zero-config demo on GitHub Pages)
   */
  function discoverDoctorsBuiltIn(cities, specialtyShorts, customKeyword) {
    const results = [];
    const perCity = cities.length > 15 ? 2 : cities.length > 5 ? 3 : 4;

    cities.forEach((cityName) => {
      const prov = PROVINCES_81.find((p) => p.name === cityName) || PROVINCES_81[0];
      specialtyShorts.forEach((specShort) => {
        const count = Math.max(1, Math.min(perCity, specialtyShorts.length > 3 ? 2 : perCity));
        for (let i = 0; i < count; i++) {
          const seed = hashStr(`${cityName}|${specShort}|${customKeyword || ''}|${i}`);
          const title = TITLES[seed % TITLES.length];
          const first = FIRST_NAMES[(seed >> 3) % FIRST_NAMES.length];
          const last = LAST_NAMES[(seed >> 6) % LAST_NAMES.length];
          const district = prov.districts[seed % prov.districts.length];
          const suffix = CLINIC_SUFFIXES[(seed >> 4) % CLINIC_SUFFIXES.length];
          const pPrefix = ['530', '532', '533', '535', '542', '544', '553'][seed % 7];
          const p1 = String(100 + (seed % 899));
          const p2 = String(10 + ((seed >> 2) % 89));
          const p3 = String(10 + ((seed >> 5) % 89));
          const rating = Number((4.3 + ((seed % 8) * 0.1)).toFixed(1));
          const reviews = 12 + (seed % 185);
          const jitterLat = ((seed % 100) - 50) * 0.0009;
          const jitterLng = (((seed >> 4) % 100) - 50) * 0.0011;

          const kwLabel = customKeyword ? `${customKeyword} · ${specShort}` : specShort;
          results.push({
            id: `gmap-${seed}-${i}`,
            name: `${title} ${first} ${last}`,
            clinic: `${district} ${specShort} ${suffix}`,
            specialty: specShort,
            city: cityName,
            district,
            phone: `+90 ${pPrefix} ${p1} ${p2} ${p3}`,
            rating: Math.min(5.0, rating),
            reviews,
            status: 'new',
            source: 'Google Maps (Demo Veri)',
            searchHint: kwLabel,
            lat: Number((prov.lat + jitterLat).toFixed(5)),
            lng: Number((prov.lng + jitterLng).toFixed(5)),
            addedAt: 'Az önce',
            notes: ''
          });
        }
      });
    });

    return results;
  }

  /**
   * Real Google Maps Places API (New v1 Text Search) client.
   * Works directly from the browser when the user adds their Google Maps Places API Key in Settings!
   */
  async function discoverDoctorsGooglePlacesAPI(apiKey, cities, specialtyShorts, customKeyword) {
    const collected = [];
    const maxQueries = 12; // Protect user quota per run
    let queryCount = 0;

    for (const cityName of cities) {
      for (const specShort of specialtyShorts) {
        if (queryCount >= maxQueries) break;
        queryCount++;
        const specObj = SPECIALTIES.find((s) => s.short === specShort);
        const baseQuery = customKeyword
          ? `${cityName} ${customKeyword} ${specShort} doktor klinik`
          : `${cityName} ${specObj ? specObj.query : specShort + ' doktor klinik'}`;

        const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.location,places.googleMapsUri'
          },
          body: JSON.stringify({
            textQuery: baseQuery,
            languageCode: 'tr',
            regionCode: 'TR',
            maxResultCount: 10
          })
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`Google Places API Hatası (${resp.status}): ${errText.slice(0, 140)}`);
        }

        const data = await resp.json();
        const places = data.places || [];
        places.forEach((pl) => {
          collected.push({
            id: `gplaces-${pl.id}`,
            name: (pl.displayName && pl.displayName.text) || 'Klinik / Hekim',
            clinic: pl.formattedAddress || `${cityName}, Türkiye`,
            specialty: specShort,
            city: cityName,
            district: cityName,
            phone: pl.internationalPhoneNumber || 'Telefon belirtilmemiş',
            rating: pl.rating || 4.5,
            reviews: pl.userRatingCount || 0,
            status: 'new',
            source: 'Google Maps API (Canlı)',
            mapsUrl: pl.googleMapsUri || '',
            lat: pl.location ? pl.location.latitude : 39.0,
            lng: pl.location ? pl.location.longitude : 35.0,
            addedAt: 'Canlı API',
            notes: ''
          });
        });
      }
    }

    return collected;
  }

  return {
    PROVINCES_81,
    SPECIALTIES,
    INITIAL_SETTINGS,
    INITIAL_SEMINARS,
    SAMPLE_SLIDES,
    INITIAL_SOCIAL_POSTS,
    INITIAL_DOCTORS,
    INITIAL_PARTICIPANTS,
    INITIAL_CAMPAIGNS,
    INITIAL_ACTIVITIES,
    discoverDoctorsBuiltIn,
    discoverDoctorsGooglePlacesAPI
  };
})();
