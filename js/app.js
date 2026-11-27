/* ==========================================================================
   Main Application Router, Shell, Event Wiring, Modals & Toasts
   ========================================================================== */

(function () {
  const esc = Store.escapeHtml;
  const appEl = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const toastRoot = document.getElementById('toast-root');

  let mobileSidebarOpen = false;

  const ADMIN_NAV = [
    { route: 'panel', label: 'Panel', icon: 'dashboard', title: 'Operasyon Paneli', subtitle: 'Genel bakış, dönüşüm hunisi ve yaklaşan seminerler' },
    { route: 'kesif', label: 'Hekim Keşfi', icon: 'compass', title: 'Google Maps Hekim Keşfi', subtitle: 'Türkiye’nin 81 ilinden hedef branşlardaki hekimleri bulun' },
    { route: 'hekimler', label: 'Hekimler', icon: 'users', title: 'Hekim Veritabanı (CRM)', subtitle: 'Keşfedilen ve kayıtlı tüm hekimlerin takip listesi' },
    { route: 'outreach', label: 'WhatsApp Outreach', icon: 'whatsapp', title: 'WhatsApp Duyuru Stüdyosu', subtitle: 'Seminer afişi ve kayıt linki ile hedef kitleye ulaşın' },
    { route: 'seminerler', label: 'Seminerler', icon: 'calendar', title: 'Seminer & Eğitim Yönetimi', subtitle: 'Yüz yüze ve Google Meet online seminer planlama' },
    { route: 'katilimcilar', label: 'Katılımcılar', icon: 'userCheck', title: 'Katılımcılar & Erişim', subtitle: 'Kayıt olan hekimler, ödeme onayı ve giriş şifreleri' },
    { route: 'raporlar', label: 'Raporlar', icon: 'barChart', title: 'Raporlar & Analitik', subtitle: 'İl ve branş bazlı erişim ve gelir istatistikleri' },
    { route: 'ayarlar', label: 'Ayarlar', icon: 'settings', title: 'Ayarlar & Entegrasyonlar', subtitle: 'Google Maps API, Google Meet, Ödeme ve Sosyal Medya' }
  ];

  /* ========================================================================
     Toasts & Modals
     ======================================================================== */
  function showToast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${esc(message)}</span>`;
    toastRoot.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'all 200ms ease';
      setTimeout(() => el.remove(), 220);
    }, 3400);
  }

  function openModal(title, bodyHtml, footHtml = '') {
    modalRoot.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3 class="card-title">${esc(title)}</h3>
          <button class="btn btn-ghost btn-icon" data-action="close-modal" aria-label="Kapat">${Icons.x}</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footHtml ? `<div class="modal-foot">${footHtml}</div>` : ''}
      </div>
    `;
    modalRoot.classList.add('open');
    modalRoot.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modalRoot.classList.remove('open');
    modalRoot.setAttribute('aria-hidden', 'true');
    modalRoot.innerHTML = '';
  }

  /* ========================================================================
     Router
     ======================================================================== */
  function parseRoute() {
    const raw = (window.location.hash || '#/panel').replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    const page = parts[0] || 'panel';
    const param = parts[1] || '';
    return { page, param };
  }

  function navigate(hash) {
    if (window.location.hash === hash) {
      render();
    } else {
      window.location.hash = hash;
    }
  }

  function renderAdminShell(page) {
    const st = Store.get();
    const meta = ADMIN_NAV.find((n) => n.route === page) || ADMIN_NAV[0];
    let contentHtml = '';

    switch (page) {
      case 'kesif': contentHtml = AdminViews.renderDiscovery(); break;
      case 'hekimler': contentHtml = AdminViews.renderDoctors(); break;
      case 'outreach': contentHtml = AdminViews.renderOutreach(); break;
      case 'seminerler': contentHtml = AdminViews.renderSeminars(); break;
      case 'katilimcilar': contentHtml = AdminViews.renderParticipants(); break;
      case 'raporlar': contentHtml = AdminViews.renderReports(); break;
      case 'ayarlar': contentHtml = AdminViews.renderSettings(); break;
      default: contentHtml = AdminViews.renderDashboard(); break;
    }

    const badgeCounts = {
      hekimler: st.doctors.length,
      seminerler: st.seminars.length,
      katilimcilar: st.participants.length
    };

    appEl.innerHTML = `
      <div class="admin-shell">
        <div class="sidebar-backdrop ${mobileSidebarOpen ? 'open' : ''}" data-action="close-mobile-nav"></div>
        <aside class="sidebar ${mobileSidebarOpen ? 'open' : ''}">
          <div class="sidebar-brand">
            <div class="brand-mark">HD</div>
            <div>
              <div class="brand-text-title">Dr. Hasan Doğan</div>
              <div class="brand-text-sub">Seminer Operasyon Merkezi</div>
            </div>
          </div>

          <nav class="sidebar-nav" aria-label="Yönetim paneli menüsü">
            <div class="nav-section-label">Operasyon</div>
            ${ADMIN_NAV.slice(0, 6).map((item) => `
              <a href="#/${item.route}" class="nav-item ${page === item.route ? 'active' : ''}" data-action="nav-link">
                ${Icons[item.icon]}
                <span>${item.label}</span>
                ${badgeCounts[item.route] != null ? `<span class="nav-badge tabular-nums">${badgeCounts[item.route]}</span>` : ''}
              </a>
            `).join('')}

            <div class="nav-section-label">Sistem</div>
            ${ADMIN_NAV.slice(6).map((item) => `
              <a href="#/${item.route}" class="nav-item ${page === item.route ? 'active' : ''}" data-action="nav-link">
                ${Icons[item.icon]}
                <span>${item.label}</span>
              </a>
            `).join('')}
          </nav>

          <div class="sidebar-footer">
            <div class="sidebar-portal-card">
              <strong style="font-size:0.81rem; color:var(--ink-primary);">Hekim Kayıt Portalı</strong>
              <p>Doktorların gördüğü halka açık seminer sayfasını ve Google Meet giriş ekranını inceleyin.</p>
              <a href="#/site" class="btn btn-primary btn-sm" style="width:100%;">${Icons.globe} Halka Açık Siteyi Aç</a>
            </div>
          </div>
        </aside>

        <div class="admin-main">
          <header class="topbar">
            <div class="topbar-left">
              <button class="btn btn-ghost btn-icon mobile-menu-btn" data-action="toggle-mobile-nav" aria-label="Menüyü aç">${Icons.menu}</button>
              <div>
                <div class="topbar-title">${esc(meta.title)}</div>
                <span class="topbar-subtitle">${esc(meta.subtitle)}</span>
              </div>
            </div>
            <div class="topbar-right">
              <div class="mode-switch" role="group" aria-label="Görünüm seçici">
                <button class="mode-switch-btn active" data-action="go-route" data-route="#/panel">Yönetim Paneli</button>
                <button class="mode-switch-btn" data-action="go-route" data-route="#/site">Hekim Portalı</button>
                <button class="mode-switch-btn" data-action="go-route" data-route="#/canli-giris">Online Oda</button>
              </div>
            </div>
          </header>

          <main class="page-content">
            ${contentHtml}
          </main>
        </div>
      </div>
    `;

    if (page === 'kesif') {
      setTimeout(() => AdminViews.mountDiscoveryMap(), 40);
    }
  }

  function render() {
    const { page, param } = parseRoute();
    if (page === 'site') {
      document.title = 'Op. Dr. Hasan Doğan — Proloterapi & Bütüncül Tıp Eğitim Portalı';
      appEl.innerHTML = PublicViews.renderPublicHome();
    } else if (page === 'seminer') {
      document.title = 'Seminer Kayıt — Op. Dr. Hasan Doğan';
      appEl.innerHTML = PublicViews.renderSeminarRegister(param);
    } else if (page === 'canli-giris') {
      document.title = 'Online Eğitim Odası — Op. Dr. Hasan Doğan';
      appEl.innerHTML = PublicViews.renderOnlineClassroom();
    } else {
      document.title = 'Op. Dr. Hasan Doğan — Seminer Operasyon Merkezi';
      renderAdminShell(page);
    }
  }

  /* ========================================================================
     Discovery Execution (Live Google Places API OR Built-in Turkey Dataset)
     ======================================================================== */
  async function executeDiscovery() {
    const st = Store.get();
    const cities = st.discoverySelection.cities;
    const specs = st.discoverySelection.specialties;
    const kw = st.discoverySelection.customKeyword || '';
    if (!cities.length || !specs.length) {
      showToast('Lütfen en az 1 şehir ve 1 branş seçin.', 'warn');
      return;
    }

    AdminViews.ui.discoveryRunning = true;
    render();

    try {
      const apiKey = (st.settings.googleMapsApiKey || '').trim();
      let found = [];
      if (apiKey) {
        found = await AppData.discoverDoctorsGooglePlacesAPI(apiKey, cities, specs, kw);
      } else {
        await new Promise((r) => setTimeout(r, 650));
        found = AppData.discoverDoctorsBuiltIn(cities, specs, kw);
      }
      const addedCount = Store.mergeDiscoveredDoctors(found);
      AdminViews.ui.discoveryRunning = false;
      render();
      if (addedCount > 0) {
        showToast(`Tarama tamamlandı! ${addedCount} yeni hekim / klinik listeye eklendi.`, 'success');
      } else {
        showToast(`Seçili şehir ve branşlardaki ${found.length} hekim zaten listenizde mevcut.`, 'info');
      }
    } catch (err) {
      AdminViews.ui.discoveryRunning = false;
      render();
      showToast(err.message || 'Tarama sırasında bir hata oluştu.', 'warn');
    }
  }

  /* ========================================================================
     Global Click Delegation
     ======================================================================== */
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) {
      if (e.target === modalRoot) closeModal();
      return;
    }

    const action = target.dataset.action;
    const id = target.dataset.id;
    const st = Store.get();

    switch (action) {
      case 'toggle-mobile-nav':
        mobileSidebarOpen = !mobileSidebarOpen;
        render();
        break;
      case 'close-mobile-nav':
      case 'nav-link':
        mobileSidebarOpen = false;
        break;
      case 'go-route':
        navigate(target.dataset.route);
        break;
      case 'close-modal':
        closeModal();
        break;

      // Dashboard quick new seminar
      case 'quick-new-seminar':
        AdminViews.ui.seminarDraft = AdminViews.getEmptySeminarDraft();
        AdminViews.ui.showSeminarForm = true;
        navigate('#/seminerler');
        break;

      // Discovery city & specialty toggles
      case 'toggle-city': {
        const city = target.dataset.city;
        const arr = st.discoverySelection.cities;
        const idx = arr.indexOf(city);
        if (idx >= 0) arr.splice(idx, 1);
        else arr.push(city);
        Store.save();
        render();
        break;
      }
      case 'preset-cities': {
        const p = target.dataset.preset;
        if (p === 'big5') st.discoverySelection.cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];
        else if (p === 'marmara') st.discoverySelection.cities = AppData.PROVINCES_81.filter((x) => x.region === 'Marmara').map((x) => x.name);
        else if (p === 'ege') st.discoverySelection.cities = AppData.PROVINCES_81.filter((x) => x.region === 'Ege').map((x) => x.name);
        else if (p === 'all') st.discoverySelection.cities = AppData.PROVINCES_81.map((x) => x.name);
        else st.discoverySelection.cities = [];
        Store.save();
        render();
        break;
      }
      case 'toggle-spec': {
        const spec = target.dataset.spec;
        const arr = st.discoverySelection.specialties;
        const idx = arr.indexOf(spec);
        if (idx >= 0) arr.splice(idx, 1);
        else arr.push(spec);
        Store.save();
        render();
        break;
      }
      case 'preset-specs': {
        if (target.dataset.preset === 'all') st.discoverySelection.specialties = AppData.SPECIALTIES.map((s) => s.short);
        else st.discoverySelection.specialties = [];
        Store.save();
        render();
        break;
      }
      case 'toggle-discovery-map':
        AdminViews.ui.discoveryShowMap = !AdminViews.ui.discoveryShowMap;
        render();
        break;
      case 'run-discovery':
        executeDiscovery();
        break;
      case 'clear-discovery-selection':
        AdminViews.ui.selectedDiscoveryIds.clear();
        render();
        break;
      case 'send-selected-to-outreach':
        st.outreachDraft.selectedDoctorIds = Array.from(AdminViews.ui.selectedDiscoveryIds);
        Store.save();
        AdminViews.ui.selectedDiscoveryIds.clear();
        navigate('#/outreach');
        showToast(`${st.outreachDraft.selectedDoctorIds.length} hekim WhatsApp kampanya kuyruğuna aktarıldı.`, 'success');
        break;

      // Single doctor WhatsApp direct open
      case 'quick-wa-doctor':
      case 'send-queue-wa': {
        const doc = st.doctors.find((d) => d.id === id);
        if (!doc) break;
        const sem = st.seminars.find((s) => s.id === st.outreachDraft.seminarId) || st.seminars[0];
        const msg = Store.renderOutreachMessage(st.outreachDraft.template, doc, sem, st.outreachDraft.includeLinks);
        const url = Store.buildWhatsAppUrl(doc.phone, msg);
        window.open(url, '_blank', 'noopener');
        if (doc.status === 'new') {
          Store.updateDoctorStatus(doc.id, 'sent');
          Store.addActivity('whatsapp', `${doc.name} (${doc.city}) için WhatsApp seminer daveti açıldı.`);
        }
        render();
        showToast(`${doc.name} için WhatsApp mesajı hazırlandı.`, 'success');
        break;
      }

      // Outreach
      case 'clear-outreach-explicit':
        st.outreachDraft.selectedDoctorIds = [];
        Store.save();
        render();
        break;
      case 'insert-var': {
        const ta = document.getElementById('outreach-template');
        const token = target.dataset.var;
        if (ta) {
          const start = ta.selectionStart || ta.value.length;
          const end = ta.selectionEnd || ta.value.length;
          ta.value = ta.value.slice(0, start) + token + ta.value.slice(end);
          st.outreachDraft.template = ta.value;
          Store.save();
          render();
        }
        break;
      }
      case 'launch-bulk-campaign': {
        const targets = AdminViews.getOutreachTargets();
        const sem = st.seminars.find((s) => s.id === st.outreachDraft.seminarId) || st.seminars[0];
        if (!targets.length) break;
        targets.forEach((d) => {
          if (d.status === 'new') d.status = 'sent';
        });
        const openedEst = Math.max(1, Math.round(targets.length * 0.82));
        const repliedEst = Math.round(targets.length * 0.21);
        Store.recordCampaign({
          name: `${sem ? sem.title : 'Seminer'} — ${targets.length} Hekim WhatsApp Duyurusu`,
          seminarId: sem ? sem.id : '',
          channel: 'WhatsApp',
          sentCount: targets.length,
          openedCount: openedEst,
          repliedCount: repliedEst,
          registeredCount: 0
        });
        st.outreachDraft.selectedDoctorIds = [];
        Store.save();
        render();
        showToast(`${targets.length} hekim için WhatsApp kampanyası kaydedildi! Birebir kuyruktan tek tıkla gönderebilirsiniz.`, 'success');
        break;
      }

      // Doctor Modals & CRUD
      case 'open-add-doctor-modal': {
        openModal(
          'Yeni Hekim / Klinik Ekle',
          `
            <form id="add-doctor-form" class="stack-md">
              <div class="form-group">
                <label class="form-label">Hekim Adı &amp; Unvanı <span class="req">*</span></label>
                <input name="name" class="form-input" required placeholder="Örn: Op. Dr. Mehmet Kaya" />
              </div>
              <div class="form-group">
                <label class="form-label">Klinik / Hastane</label>
                <input name="clinic" class="form-input" placeholder="Örn: Özel Ortopedi Muayenehanesi" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Branş</label>
                  <select name="specialty" class="form-select">
                    ${AppData.SPECIALTIES.map((s) => `<option value="${esc(s.short)}">${esc(s.short)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Şehir</label>
                  <select name="city" class="form-select">
                    ${AppData.PROVINCES_81.map((p) => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">İlçe</label>
                  <input name="district" class="form-input" placeholder="Merkez" />
                </div>
                <div class="form-group">
                  <label class="form-label">Telefon (WhatsApp) <span class="req">*</span></label>
                  <input name="phone" class="form-input" required placeholder="+90 5XX XXX XX XX" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Not</label>
                <textarea name="notes" class="form-textarea" rows="3" placeholder="İletişim veya ilgi notu..."></textarea>
              </div>
              <div class="row-between">
                <button type="button" class="btn btn-secondary" data-action="close-modal">İptal</button>
                <button type="submit" class="btn btn-primary">${Icons.check} Hekimi Kaydet</button>
              </div>
            </form>
          `
        );
        break;
      }
      case 'open-doctor-modal': {
        const doc = st.doctors.find((d) => d.id === id);
        if (!doc) break;
        openModal(
          doc.name,
          `
            <form id="edit-doctor-notes-form" data-id="${esc(doc.id)}" class="stack-md">
              <div class="seminar-meta-grid">
                <div class="seminar-meta-item">${Icons.mapPin} <span>${esc(doc.city)} / ${esc(doc.district)}</span></div>
                <div class="seminar-meta-item">${Icons.phone} <span>${esc(doc.phone)}</span></div>
              </div>
              <div class="form-group">
                <label class="form-label">Klinik / Muayenehane</label>
                <div class="text-muted">${esc(doc.clinic)} · ${esc(doc.specialty)}</div>
              </div>
              <div class="form-group">
                <label class="form-label">Takip Durumu</label>
                <select name="status" class="form-select">
                  <option value="new" ${doc.status === 'new' ? 'selected' : ''}>Yeni</option>
                  <option value="sent" ${doc.status === 'sent' ? 'selected' : ''}>Mesaj Gönderildi</option>
                  <option value="replied" ${doc.status === 'replied' ? 'selected' : ''}>Yanıtladı</option>
                  <option value="registered" ${doc.status === 'registered' ? 'selected' : ''}>Kayıtlı</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Notlar</label>
                <textarea name="notes" class="form-textarea" rows="4" placeholder="Görüşme veya WhatsApp geri dönüş notu...">${esc(doc.notes || '')}</textarea>
              </div>
              <div class="row-between">
                <button type="button" class="btn btn-secondary" data-action="close-modal">Kapat</button>
                <button type="submit" class="btn btn-primary">${Icons.check} Güncelle</button>
              </div>
            </form>
          `
        );
        break;
      }
      case 'delete-doctor':
        if (confirm('Bu hekim kaydını silmek istediğinize emin misiniz?')) {
          Store.deleteDoctor(id);
          render();
          showToast('Hekim kaydı silindi.', 'info');
        }
        break;
      case 'export-doctors-csv':
        Store.downloadCSV(
          'hasan-dogan-hekim-listesi.csv',
          ['Hekim', 'Klinik', 'Branş', 'Şehir', 'İlçe', 'Telefon', 'Google Puanı', 'Durum', 'Notlar'],
          st.doctors.map((d) => [d.name, d.clinic, d.specialty, d.city, d.district, d.phone, d.rating, d.status, d.notes || ''])
        );
        showToast('Hekim listesi Excel (CSV) olarak indirildi.', 'success');
        break;

      // Seminars CRUD & Link actions
      case 'open-new-seminar':
        AdminViews.ui.seminarDraft = AdminViews.getEmptySeminarDraft();
        AdminViews.ui.showSeminarForm = true;
        render();
        break;
      case 'edit-seminar': {
        const sem = st.seminars.find((s) => s.id === id);
        if (!sem) break;
        AdminViews.ui.seminarDraft = JSON.parse(JSON.stringify(sem));
        AdminViews.ui.showSeminarForm = true;
        render();
        break;
      }
      case 'close-seminar-form':
        AdminViews.ui.showSeminarForm = false;
        AdminViews.ui.seminarDraft = null;
        render();
        break;
      case 'use-cover-preset': {
        const src = target.dataset.src;
        if (AdminViews.ui.seminarDraft) AdminViews.ui.seminarDraft.coverImage = src;
        const img = document.getElementById('prev-sem-img');
        if (img) img.src = src;
        showToast('Kapak görseli güncellendi.', 'info');
        break;
      }
      case 'delete-seminar':
        if (confirm('Bu semineri silmek istediğinize emin misiniz?')) {
          Store.deleteSeminar(id);
          render();
          showToast('Seminer silindi.', 'info');
        }
        break;
      case 'copy-sem-link': {
        const sem = st.seminars.find((s) => s.id === id);
        if (!sem) break;
        const link = Store.getSeminarPublicUrl(sem);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(link).catch(() => {});
        }
        showToast(`Kayıt linki kopyalandı: ${link}`, 'success');
        break;
      }
      case 'promote-seminar':
        st.outreachDraft.seminarId = id;
        Store.save();
        navigate('#/outreach');
        break;

      // Participants
      case 'confirm-payment': {
        const part = Store.confirmParticipantPayment(id);
        if (part) {
          render();
          showToast(`${part.title} ${part.fullName} ödemesi onaylandı! Giriş kodu: ${part.accessUser}`, 'success');
        }
        break;
      }
      case 'send-participant-creds': {
        const part = st.participants.find((p) => p.id === id);
        if (!part) break;
        const sem = st.seminars.find((s) => s.id === part.seminarId);
        const portalUrl = Store.getClassroomPublicUrl();
        const msg =
          `Sayın ${part.title} ${part.fullName},\n\n` +
          `"${sem ? sem.title : 'Proloterapi Eğitimi'}" kaydınız onaylanmıştır.\n\n` +
          `📅 Tarih: ${sem ? sem.dateText + ' · ' + sem.timeText : ''}\n` +
          `🔐 Kullanıcı Kodu: ${part.accessUser}\n` +
          `🔑 Erişim Şifresi: ${part.accessPass}\n\n` +
          `Google Meet canlı eğitim ve slayt takip portalı:\n${portalUrl}\n\n` +
          `Saygılarımızla,\n${st.settings.doctorName} Eğitim Ekibi`;
        window.open(Store.buildWhatsAppUrl(part.phone, msg), '_blank', 'noopener');
        showToast(`${part.fullName} için giriş bilgileri WhatsApp’ta açıldı.`, 'success');
        break;
      }
      case 'export-participants-csv':
        Store.downloadCSV(
          'hasan-dogan-katilimcilar.csv',
          ['Unvan', 'Ad Soyad', 'Branş', 'Klinik', 'Şehir', 'E-posta', 'Telefon', 'Ödeme Durumu', 'Tutar', 'Kullanıcı Kodu', 'Şifre'],
          st.participants.map((p) => [p.title, p.fullName, p.specialty, p.clinic, p.city, p.email, p.phone, p.paymentStatus, p.amount, p.accessUser, p.accessPass])
        );
        showToast('Katılımcı listesi CSV olarak indirildi.', 'success');
        break;

      // Settings Backup / Reset
      case 'backup-json': {
        const blob = new Blob([Store.exportJson()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hasan-dogan-seminer-yedek.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast('Sistem yedeği JSON olarak indirildi.', 'success');
        break;
      }
      case 'reset-demo-data':
        if (confirm('Tüm veriler başlangıç demo haline sıfırlansın mı?')) {
          Store.resetAll();
          render();
          showToast('Demo verileri başarıyla geri yüklendi.', 'info');
        }
        break;

      // Public Registration & Classroom Actions
      case 'open-kvkk-modal':
        e.preventDefault();
        openModal(
          'KVKK Aydınlatma Metni',
          `<div class="stack-sm" style="font-size:0.86rem; color:var(--ink-secondary); line-height:1.6;">
            <p><strong>Veri Sorumlusu:</strong> ${esc(st.settings.companyName)} (${esc(st.settings.doctorName)})</p>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, seminer kayıt formunda paylaştığınız ad-soyad, unvan, branş, klinik, e-posta ve telefon bilgileriniz; yalnızca mesleki eğitim kaydınızın oluşturulması, sertifika düzenlenmesi, Google Meet canlı eğitim giriş bilgilerinin iletilmesi ve ilgili eğitim duyurularının WhatsApp / e-posta yoluyla tarafınıza ulaştırılması amacıyla işlenmektedir.</p>
            <p>Verileriniz üçüncü taraflarla ticari amaçla paylaşılmaz. Dilediğiniz zaman eğitim koordinatörümüz üzerinden kayıt silme talebinde bulunabilirsiniz.</p>
          </div>`,
          `<button class="btn btn-primary btn-sm" data-action="close-modal">Anladım</button>`
        );
        break;
      case 'reg-back-step1':
        PublicViews.pubState.regStep = 1;
        render();
        break;
      case 'complete-registration': {
        const d = PublicViews.pubState.regDraft;
        if (!d) break;
        const method = target.dataset.method;
        const created = Store.registerParticipant({
          ...d,
          paymentStatus: method === 'card' ? 'paid' : 'pending',
          paymentMethod: method === 'card' ? 'Kredi Kartı (Online)' : 'Havale / EFT'
        });
        PublicViews.pubState.confirmedParticipant = created;
        PublicViews.pubState.regStep = 3;
        render();
        showToast('Seminer kaydınız oluşturuldu ve yönetim paneline iletildi!', 'success');
        break;
      }
      case 'fill-demo-classroom': {
        const demo = st.participants.find((p) => p.paymentStatus === 'paid') || st.participants[0];
        if (demo) {
          PublicViews.pubState.loggedInParticipant = demo;
          PublicViews.pubState.currentSlideIndex = 0;
          render();
          showToast(`Hoş geldiniz, ${demo.title} ${demo.fullName}!`, 'success');
        }
        break;
      }
      case 'classroom-logout':
        PublicViews.pubState.loggedInParticipant = null;
        render();
        break;
      case 'slide-prev':
        PublicViews.pubState.currentSlideIndex = Math.max(0, PublicViews.pubState.currentSlideIndex - 1);
        render();
        break;
      case 'slide-next':
        PublicViews.pubState.currentSlideIndex = Math.min(AppData.SAMPLE_SLIDES.length - 1, PublicViews.pubState.currentSlideIndex + 1);
        render();
        break;
    }
  });

  /* ========================================================================
     Input & Change Events
     ======================================================================== */
  document.addEventListener('input', (e) => {
    const t = e.target;
    const st = Store.get();

    if (t.id === 'custom-keyword-input') {
      st.discoverySelection.customKeyword = t.value;
      Store.save();
    } else if (t.id === 'disc-search-input') {
      AdminViews.ui.discoverySearch = t.value;
      render();
      const el = document.getElementById('disc-search-input');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    } else if (t.id === 'doc-crm-search') {
      AdminViews.ui.doctorSearch = t.value;
      render();
      const el = document.getElementById('doc-crm-search');
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    } else if (t.id === 'outreach-template') {
      st.outreachDraft.template = t.value;
      Store.save();
      const sem = st.seminars.find((s) => s.id === st.outreachDraft.seminarId) || st.seminars[0];
      const targets = AdminViews.getOutreachTargets();
      const previewDoc = targets[0] || st.doctors[0];
      const bubble = document.querySelector('.wa-bubble-text');
      if (bubble) bubble.textContent = Store.renderOutreachMessage(t.value, previewDoc, sem, st.outreachDraft.includeLinks);
    } else if (t.id === 'classroom-notes-input') {
      PublicViews.pubState.classroomNote = t.value;
    } else if (['sem-title', 'sem-slug', 'sem-short', 'sem-date', 'sem-city', 'sem-price'].includes(t.id)) {
      // Live Seminar Preview Reactivity
      const draft = AdminViews.ui.seminarDraft || AdminViews.getEmptySeminarDraft();
      if (t.id === 'sem-title') {
        draft.title = t.value;
        const slugInput = document.getElementById('sem-slug');
        if (slugInput && !draft.id) {
          slugInput.value = Store.slugify(t.value);
          draft.slug = slugInput.value;
        }
        const el = document.getElementById('prev-sem-title');
        if (el) el.textContent = t.value || 'Seminer Başlığı';
      } else if (t.id === 'sem-slug') {
        draft.slug = Store.slugify(t.value);
      } else if (t.id === 'sem-short') {
        draft.shortDesc = t.value;
        const el = document.getElementById('prev-sem-short');
        if (el) el.textContent = t.value || 'Kısa açıklama burada görünecektir.';
      } else if (t.id === 'sem-date') {
        draft.dateText = t.value;
        const el = document.getElementById('prev-sem-date');
        if (el) el.textContent = t.value || 'Tarih';
      } else if (t.id === 'sem-city') {
        draft.city = t.value;
        const el = document.getElementById('prev-sem-city');
        if (el) el.textContent = t.value || 'Şehir';
      } else if (t.id === 'sem-price') {
        draft.price = Number(t.value) || 0;
        const el = document.getElementById('prev-sem-price');
        if (el) el.textContent = Store.formatTRY(draft.price);
      }
      AdminViews.ui.seminarDraft = draft;
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    const st = Store.get();

    if (t.id === 'disc-city-filter') { AdminViews.ui.discoveryCityFilter = t.value; render(); }
    else if (t.id === 'disc-spec-filter') { AdminViews.ui.discoverySpecFilter = t.value; render(); }
    else if (t.id === 'disc-sort-select') { AdminViews.ui.discoverySort = t.value; render(); }
    else if (t.id === 'disc-select-all') {
      const boxes = document.querySelectorAll('.disc-row-check');
      boxes.forEach((b) => {
        if (t.checked) AdminViews.ui.selectedDiscoveryIds.add(b.dataset.id);
        else AdminViews.ui.selectedDiscoveryIds.delete(b.dataset.id);
      });
      render();
    } else if (t.classList.contains('disc-row-check')) {
      if (t.checked) AdminViews.ui.selectedDiscoveryIds.add(t.dataset.id);
      else AdminViews.ui.selectedDiscoveryIds.delete(t.dataset.id);
      render();
    } else if (t.id === 'doc-crm-city') { AdminViews.ui.doctorCityFilter = t.value; render(); }
    else if (t.id === 'doc-crm-status') { AdminViews.ui.doctorStatusFilter = t.value; render(); }
    else if (t.dataset.action === 'change-doc-status') {
      Store.updateDoctorStatus(t.dataset.id, t.value);
      showToast('Hekim durumu güncellendi.', 'info');
    } else if (t.id === 'outreach-sem-select') { st.outreachDraft.seminarId = t.value; Store.save(); render(); }
    else if (t.id === 'outreach-city-select') { st.outreachDraft.targetCity = t.value; Store.save(); render(); }
    else if (t.id === 'outreach-spec-select') { st.outreachDraft.targetSpecialty = t.value; Store.save(); render(); }
    else if (t.id === 'outreach-only-new') { st.outreachDraft.onlyNew = t.checked; Store.save(); render(); }
    else if (t.id === 'outreach-include-links') { st.outreachDraft.includeLinks = t.checked; Store.save(); render(); }
    else if (t.id === 'part-sem-filter') { AdminViews.ui.participantSemFilter = t.value; render(); }
    else if (t.id === 'sem-cover-file' && t.files && t.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        if (!AdminViews.ui.seminarDraft) AdminViews.ui.seminarDraft = AdminViews.getEmptySeminarDraft();
        AdminViews.ui.seminarDraft.coverImage = reader.result;
        const img = document.getElementById('prev-sem-img');
        if (img) img.src = reader.result;
        showToast('Özel seminer afişiniz yüklendi.', 'success');
      };
      reader.readAsDataURL(t.files[0]);
    }
  });

  /* ========================================================================
     Form Submissions
     ======================================================================== */
  document.addEventListener('submit', (e) => {
    const form = e.target;
    const st = Store.get();

    if (form.id === 'seminar-editor-form') {
      e.preventDefault();
      const draft = AdminViews.ui.seminarDraft || AdminViews.getEmptySeminarDraft();
      const title = document.getElementById('sem-title').value.trim();
      const slug = Store.slugify(document.getElementById('sem-slug').value.trim() || title);
      const saved = Store.saveSeminar({
        ...draft,
        title,
        slug,
        type: document.getElementById('sem-type').value,
        city: document.getElementById('sem-city').value.trim(),
        dateText: document.getElementById('sem-date').value.trim(),
        timeText: document.getElementById('sem-time').value.trim(),
        price: Number(document.getElementById('sem-price').value) || 0,
        capacity: Number(document.getElementById('sem-capacity').value) || 30,
        location: document.getElementById('sem-location').value.trim(),
        meetUrl: document.getElementById('sem-meet').value.trim(),
        slideDeckName: document.getElementById('sem-slides').value.trim(),
        shortDesc: document.getElementById('sem-short').value.trim(),
        detailedDesc: document.getElementById('sem-detailed').value.trim()
      });
      AdminViews.ui.showSeminarForm = false;
      AdminViews.ui.seminarDraft = null;
      render();
      showToast(`"${saved.title}" yayınlandı! Kayıt linki hazır.`, 'success');
    } else if (form.id === 'add-doctor-form') {
      e.preventDefault();
      const fd = new FormData(form);
      Store.addManualDoctor({
        name: fd.get('name'),
        clinic: fd.get('clinic'),
        specialty: fd.get('specialty'),
        city: fd.get('city'),
        district: fd.get('district'),
        phone: fd.get('phone'),
        notes: fd.get('notes')
      });
      closeModal();
      render();
      showToast('Hekim veritabanına eklendi.', 'success');
    } else if (form.id === 'edit-doctor-notes-form') {
      e.preventDefault();
      const docId = form.dataset.id;
      const fd = new FormData(form);
      Store.updateDoctorStatus(docId, fd.get('status'));
      Store.updateDoctorNotes(docId, fd.get('notes'));
      closeModal();
      render();
      showToast('Hekim bilgileri güncellendi.', 'success');
    } else if (form.id === 'settings-form') {
      e.preventDefault();
      Store.updateSettings({
        googleMapsApiKey: document.getElementById('set-gmaps-key').value.trim(),
        googleMeetDefaultUrl: document.getElementById('set-meet-url').value.trim(),
        whatsappMode: document.getElementById('set-wa-mode').value,
        doctorName: document.getElementById('set-doc-name').value.trim(),
        doctorTitle: document.getElementById('set-doc-title').value.trim(),
        websitePrimary: document.getElementById('set-web-1').value.trim(),
        websiteSecondary: document.getElementById('set-web-2').value.trim(),
        instagramUrl: document.getElementById('set-ig').value.trim(),
        facebookUrl: document.getElementById('set-fb').value.trim(),
        coordinatorName: document.getElementById('set-coord-name').value.trim(),
        coordinatorPhone: document.getElementById('set-coord-phone').value.trim(),
        companyName: document.getElementById('set-company').value.trim(),
        bankName: document.getElementById('set-bank').value.trim(),
        iban: document.getElementById('set-iban').value.trim(),
        taxOffice: document.getElementById('set-tax').value.trim()
      });
      render();
      showToast('Tüm sistem ayarları kaydedildi.', 'success');
    } else if (form.id === 'public-register-form') {
      e.preventDefault();
      const sem = st.seminars.find((s) => s.slug === PublicViews.pubState.activeSeminarSlug) || st.seminars[0];
      PublicViews.pubState.regDraft = {
        seminarId: sem.id,
        fullName: document.getElementById('reg-fullname').value.trim(),
        title: document.getElementById('reg-title').value,
        specialty: document.getElementById('reg-spec').value,
        clinic: document.getElementById('reg-clinic').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        phone: document.getElementById('reg-phone').value.trim(),
        city: document.getElementById('reg-city').value
      };
      PublicViews.pubState.regStep = 2;
      render();
    } else if (form.id === 'classroom-login-form') {
      e.preventDefault();
      const userVal = document.getElementById('cls-user').value.trim().toLowerCase();
      const passVal = document.getElementById('cls-pass').value.trim();
      const found = st.participants.find(
        (p) =>
          (p.accessUser.toLowerCase() === userVal || p.email.toLowerCase() === userVal) &&
          p.accessPass === passVal
      );
      if (!found) {
        showToast('Kullanıcı kodu veya şifre hatalı. Lütfen kontrol edin.', 'warn');
        return;
      }
      if (found.paymentStatus !== 'paid') {
        showToast('Ödemeniz henüz onaylanmamış görünüyor. Koordinatör onayı sonrası giriş açılacaktır.', 'warn');
        return;
      }
      PublicViews.pubState.loggedInParticipant = found;
      PublicViews.pubState.currentSlideIndex = 0;
      render();
      showToast(`Hoş geldiniz, ${found.title} ${found.fullName}!`, 'success');
    }
  });

  window.addEventListener('hashchange', render);
  render();
})();
