/* ==========================================================================
   Persistent LocalStorage Store & Helpers for Op. Dr. Hasan Doğan Platform
   ========================================================================== */

window.Store = (function () {
  const STORAGE_KEY = 'hasan_dogan_seminer_v1';

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function defaultState() {
    return {
      settings: clone(AppData.INITIAL_SETTINGS),
      seminars: clone(AppData.INITIAL_SEMINARS),
      doctors: clone(AppData.INITIAL_DOCTORS),
      participants: clone(AppData.INITIAL_PARTICIPANTS),
      campaigns: clone(AppData.INITIAL_CAMPAIGNS),
      activities: clone(AppData.INITIAL_ACTIVITIES),
      socialPosts: clone(AppData.INITIAL_SOCIAL_POSTS),
      discoverySelection: {
        cities: ['Adana', 'Ankara', 'Denizli', 'İstanbul', 'İzmir'],
        specialties: ['Ortopedi', 'Fizik Tedavi'],
        customKeyword: ''
      },
      outreachDraft: {
        seminarId: 'sem-hackett-denizli',
        targetCity: 'ALL',
        targetSpecialty: 'ALL',
        onlyNew: false,
        includeLinks: true,
        selectedDoctorIds: [],
        template:
          'Sayın {{unvan_ad}},\n\nBilimsel Proloterapi Derneği Kurucu Başkanı Op. Dr. Hasan Doğan tarafından düzenlenecek "{{seminer_adi}}" eğitimimize davetlisiniz.\n\n📅 Tarih: {{tarih}}\n📍 Konum / Platform: {{konum}}\n\nDetaylı program ve online kayıt için:\n{{kayit_linki}}\n\nSaygılarımızla,\nOp. Dr. Hasan Doğan Eğitim Ekibi'
      }
    };
  }

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const def = defaultState();
      return {
        ...def,
        ...parsed,
        settings: { ...def.settings, ...(parsed.settings || {}) },
        discoverySelection: { ...def.discoverySelection, ...(parsed.discoverySelection || {}) },
        outreachDraft: { ...def.outreachDraft, ...(parsed.outreachDraft || {}) }
      };
    } catch (err) {
      console.warn('Store load fallback:', err);
      return defaultState();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Store save warning:', err);
    }
  }

  function get() {
    return state;
  }

  function resetAll() {
    state = defaultState();
    save();
  }

  function exportJson() {
    return JSON.stringify(state, null, 2);
  }

  function importJson(jsonText) {
    const parsed = JSON.parse(jsonText);
    if (!parsed || !Array.isArray(parsed.seminars)) {
      throw new Error('Geçersiz yedek dosyası formatı.');
    }
    state = { ...defaultState(), ...parsed };
    save();
  }

  function addActivity(type, text) {
    state.activities.unshift({
      id: 'act-' + Date.now(),
      type,
      text,
      time: 'Az önce'
    });
    if (state.activities.length > 30) state.activities.length = 30;
    save();
  }

  function slugify(str) {
    const trMap = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', İ: 'i', Ö: 'o', Ş: 's', Ü: 'u' };
    return (str || '')
      .replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m] || m)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'seminer-' + Date.now();
  }

  function getBaseUrl() {
    const loc = window.location;
    return `${loc.origin}${loc.pathname}`;
  }

  function getSeminarPublicUrl(seminar) {
    return `${getBaseUrl()}#/seminer/${seminar.slug}`;
  }

  function getClassroomPublicUrl() {
    return `${getBaseUrl()}#/canli-giris`;
  }

  function cleanPhoneForWhatsApp(phone) {
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('90') && digits.length >= 12) return digits;
    if (digits.startsWith('0') && digits.length === 11) return '9' + digits;
    if (digits.length === 10 && digits.startsWith('5')) return '90' + digits;
    return digits;
  }

  function buildWhatsAppUrl(phone, message) {
    const num = cleanPhoneForWhatsApp(phone);
    const encoded = encodeURIComponent(message || '');
    return num ? `https://wa.me/${num}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  }

  function renderOutreachMessage(template, doctor, seminar, includeLinks) {
    const s = state.settings;
    const regLink = seminar ? getSeminarPublicUrl(seminar) : getBaseUrl();
    let msg = (template || '')
      .replace(/\{\{unvan_ad\}\}/g, doctor ? doctor.name : 'Değerli Meslektaşım')
      .replace(/\{\{klinik\}\}/g, doctor ? doctor.clinic : 'Kliniğiniz')
      .replace(/\{\{sehir\}\}/g, doctor ? doctor.city : 'Türkiye')
      .replace(/\{\{seminer_adi\}\}/g, seminar ? seminar.title : 'Proloterapi Eğitimi')
      .replace(/\{\{tarih\}\}/g, seminar ? `${seminar.dateText}${seminar.timeText ? ' · ' + seminar.timeText : ''}` : '')
      .replace(/\{\{konum\}\}/g, seminar ? seminar.location : '')
      .replace(/\{\{kayit_linki\}\}/g, regLink);

    if (includeLinks) {
      msg += `\n\n🌐 Web: ${s.websitePrimary.replace(/^https?:\/\//, '')} | ${s.websiteSecondary.replace(/^https?:\/\//, '')}\n📞 Bilgi & Kayıt (${s.coordinatorName}): ${s.coordinatorPhone}`;
    }
    return msg;
  }

  function formatTRY(amount) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(Number(amount) || 0);
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Doctors mutations
  function mergeDiscoveredDoctors(newDoctors) {
    const existingKeys = new Set(state.doctors.map((d) => `${d.name.toLowerCase()}|${d.city.toLowerCase()}`));
    let added = 0;
    newDoctors.forEach((doc) => {
      const key = `${doc.name.toLowerCase()}|${doc.city.toLowerCase()}`;
      if (!existingKeys.has(key)) {
        state.doctors.unshift(doc);
        existingKeys.add(key);
        added++;
      }
    });
    if (added > 0) {
      addActivity('discovery', `Google Maps keşfi ile ${added} yeni hekim / klinik veritabanına eklendi.`);
    }
    save();
    return added;
  }

  function addManualDoctor(doc) {
    const item = {
      id: 'doc-' + Date.now(),
      name: doc.name.trim(),
      clinic: doc.clinic.trim() || `${doc.city} ${doc.specialty} Kliniği`,
      specialty: doc.specialty,
      city: doc.city,
      district: doc.district.trim() || 'Merkez',
      phone: doc.phone.trim(),
      rating: 5.0,
      reviews: 1,
      status: 'new',
      source: 'Manuel Ekleme',
      lat: (AppData.PROVINCES_81.find((p) => p.name === doc.city) || { lat: 39.0 }).lat,
      lng: (AppData.PROVINCES_81.find((p) => p.name === doc.city) || { lng: 35.0 }).lng,
      addedAt: 'Az önce',
      notes: doc.notes || ''
    };
    state.doctors.unshift(item);
    addActivity('discovery', `${item.name} (${item.city}) hekim listesine eklendi.`);
    save();
    return item;
  }

  function updateDoctorStatus(id, status) {
    const doc = state.doctors.find((d) => d.id === id);
    if (!doc) return;
    doc.status = status;
    save();
  }

  function updateDoctorNotes(id, notes) {
    const doc = state.doctors.find((d) => d.id === id);
    if (!doc) return;
    doc.notes = notes;
    save();
  }

  function deleteDoctor(id) {
    state.doctors = state.doctors.filter((d) => d.id !== id);
    save();
  }

  // Seminar mutations
  function saveSeminar(seminarData) {
    if (seminarData.id) {
      const idx = state.seminars.findIndex((s) => s.id === seminarData.id);
      if (idx !== -1) {
        state.seminars[idx] = { ...state.seminars[idx], ...seminarData };
        addActivity('seminar', `"${seminarData.title}" semineri güncellendi.`);
        save();
        return state.seminars[idx];
      }
    }
    const created = {
      ...seminarData,
      id: 'sem-' + Date.now(),
      slug: seminarData.slug || slugify(seminarData.title),
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    state.seminars.unshift(created);
    addActivity('seminar', `Yeni seminer oluşturuldu: "${created.title}" (${created.dateText}).`);
    save();
    return created;
  }

  function deleteSeminar(id) {
    state.seminars = state.seminars.filter((s) => s.id !== id);
    save();
  }

  // Participant mutations
  function generateCredentials() {
    const num = Math.floor(1000 + Math.random() * 8999);
    const passNum = Math.floor(1000 + Math.random() * 8999);
    return {
      accessUser: `DR-${num}`,
      accessPass: `PROLO${passNum}`
    };
  }

  function registerParticipant(payload) {
    const creds = generateCredentials();
    const sem = state.seminars.find((s) => s.id === payload.seminarId);
    const nowStr = new Date().toLocaleString('tr-TR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const part = {
      id: 'part-' + Date.now(),
      seminarId: payload.seminarId,
      title: payload.title,
      fullName: payload.fullName.trim(),
      specialty: payload.specialty,
      clinic: payload.clinic.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      city: payload.city,
      paymentStatus: payload.paymentStatus || 'pending',
      paymentMethod: payload.paymentMethod || 'Havale / EFT',
      amount: sem ? sem.price : 0,
      accessUser: creds.accessUser,
      accessPass: creds.accessPass,
      registeredAt: nowStr
    };
    state.participants.unshift(part);

    // Also sync doctor record if matching or add as registered
    const matchingDoc = state.doctors.find(
      (d) => cleanPhoneForWhatsApp(d.phone) === cleanPhoneForWhatsApp(part.phone)
    );
    if (matchingDoc) {
      matchingDoc.status = 'registered';
    } else {
      state.doctors.unshift({
        id: 'doc-reg-' + Date.now(),
        name: `${part.title} ${part.fullName}`,
        clinic: part.clinic || `${part.city} Kliniği`,
        specialty: part.specialty,
        city: part.city,
        district: 'Merkez',
        phone: part.phone,
        rating: 5.0,
        reviews: 1,
        status: 'registered',
        source: 'Seminer Kayıt Formu',
        lat: (AppData.PROVINCES_81.find((p) => p.name === part.city) || { lat: 39.0 }).lat,
        lng: (AppData.PROVINCES_81.find((p) => p.name === part.city) || { lng: 35.0 }).lng,
        addedAt: 'Az önce',
        notes: `${sem ? sem.title : 'Seminer'} kaydı ile otomatik eklendi.`
      });
    }

    addActivity(
      part.paymentStatus === 'paid' ? 'payment' : 'register',
      `${part.title} ${part.fullName} (${part.city}) "${sem ? sem.title : 'Seminer'}" kaydını tamamladı (${part.paymentStatus === 'paid' ? 'Ödeme Onaylı' : 'Ödeme Bekliyor'}).`
    );
    save();
    return part;
  }

  function confirmParticipantPayment(id) {
    const part = state.participants.find((p) => p.id === id);
    if (!part) return null;
    part.paymentStatus = 'paid';
    if (!part.accessUser) {
      const creds = generateCredentials();
      part.accessUser = creds.accessUser;
      part.accessPass = creds.accessPass;
    }
    addActivity('payment', `${part.title} ${part.fullName} ödemesi onaylandı — Giriş kodu: ${part.accessUser}`);
    save();
    return part;
  }

  function recordCampaign(campaignData) {
    const cmp = {
      id: 'cmp-' + Date.now(),
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'active',
      ...campaignData
    };
    state.campaigns.unshift(cmp);
    addActivity('whatsapp', `"${cmp.name}" WhatsApp kampanyası başlatıldı (${cmp.sentCount} hekim).`);
    save();
    return cmp;
  }

  function updateSettings(partial) {
    state.settings = { ...state.settings, ...partial };
    save();
  }

  function downloadCSV(filename, headers, rows) {
    const bom = '\uFEFF';
    const csvLines = [
      headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(';'),
      ...rows.map((r) => r.map((v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(';'))
    ];
    const blob = new Blob([bom + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return {
    get,
    save,
    resetAll,
    exportJson,
    importJson,
    addActivity,
    slugify,
    getBaseUrl,
    getSeminarPublicUrl,
    getClassroomPublicUrl,
    cleanPhoneForWhatsApp,
    buildWhatsAppUrl,
    renderOutreachMessage,
    formatTRY,
    escapeHtml,
    mergeDiscoveredDoctors,
    addManualDoctor,
    updateDoctorStatus,
    updateDoctorNotes,
    deleteDoctor,
    saveSeminar,
    deleteSeminar,
    registerParticipant,
    confirmParticipantPayment,
    recordCampaign,
    updateSettings,
    downloadCSV
  };
})();
