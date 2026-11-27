/* ==========================================================================
   Admin Panel Views — Op. Dr. Hasan Doğan Seminer Operasyon Merkezi
   ========================================================================== */

window.AdminViews = (function () {
  const esc = Store.escapeHtml;

  // Ephemeral UI filters (kept across re-renders)
  const ui = {
    discoverySearch: '',
    discoveryCityFilter: 'ALL',
    discoverySpecFilter: 'ALL',
    discoverySort: 'newest',
    discoveryShowMap: false,
    discoveryRunning: false,
    selectedDiscoveryIds: new Set(),
    doctorSearch: '',
    doctorCityFilter: 'ALL',
    doctorStatusFilter: 'ALL',
    editingSeminarId: null,
    showSeminarForm: false,
    seminarDraft: null,
    participantSemFilter: 'ALL',
    leafletMap: null
  };

  function getInitials(fullName) {
    const cleaned = String(fullName || '')
      .replace(/\b(Prof|Doç|Op|Uzm|Dr)\.\s*/gi, '')
      .trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (cleaned.slice(0, 2) || 'DR').toUpperCase();
  }

  function statusBadge(status) {
    switch (status) {
      case 'sent': return `<span class="badge badge-info"><span class="status-dot"></span>Mesaj Gönderildi</span>`;
      case 'replied': return `<span class="badge badge-warn"><span class="status-dot"></span>Yanıtladı</span>`;
      case 'registered': return `<span class="badge badge-success"><span class="status-dot"></span>Kayıtlı</span>`;
      default: return `<span class="badge badge-neutral"><span class="status-dot"></span>Yeni</span>`;
    }
  }

  function seminarTypeBadge(type) {
    if (type === 'online') return `<span class="badge badge-info">${Icons.video} Online (Google Meet)</span>`;
    if (type === 'hibrit') return `<span class="badge badge-brass">${Icons.globe} Hibrit</span>`;
    return `<span class="badge badge-primary">${Icons.mapPin} Yüz Yüze</span>`;
  }

  /* ========================================================================
     1. PANEL (DASHBOARD)
     ======================================================================== */
  function renderDashboard() {
    const st = Store.get();
    const totalDocs = st.doctors.length;
    const uniqueCities = new Set(st.doctors.map((d) => d.city)).size;
    const sentDocs = st.doctors.filter((d) => ['sent', 'replied', 'registered'].includes(d.status)).length;
    const repliedDocs = st.doctors.filter((d) => ['replied', 'registered'].includes(d.status)).length;
    const totalParts = st.participants.length;
    const paidParts = st.participants.filter((p) => p.paymentStatus === 'paid');
    const totalRevenue = paidParts.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const pendingParts = totalParts - paidParts.length;

    const pctSent = totalDocs ? Math.round((sentDocs / totalDocs) * 100) : 0;
    const pctReplied = sentDocs ? Math.round((repliedDocs / sentDocs) * 100) : 0;
    const pctReg = totalDocs ? Math.round((totalParts / Math.max(1, totalDocs)) * 100) : 0;
    const pctPaid = totalParts ? Math.round((paidParts.length / totalParts) * 100) : 0;

    return `
      <section class="welcome-banner">
        <div>
          <div class="welcome-eyebrow">${esc(st.settings.doctorTitle)}</div>
          <h1>Hoş geldiniz, ${esc(st.settings.doctorName)}</h1>
          <p>Türkiye genelindeki hekimleri Google Maps üzerinden keşfedin, WhatsApp ile seminer afişlerinizi ulaştırın ve online / yüz yüze eğitim kayıtlarınızı tek merkezden yönetin.</p>
        </div>
        <div class="welcome-actions">
          <a href="#/kesif" class="btn btn-on-dark">${Icons.compass} Hekim Keşfine Başla</a>
          <button class="btn btn-on-dark-outline" data-action="quick-new-seminar">${Icons.plus} Yeni Seminer Oluştur</button>
          <a href="#/site" class="btn btn-on-dark-outline">${Icons.globe} Halka Açık Siteyi Gör</a>
        </div>
      </section>

      <section class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Keşfedilen Hekim / Klinik</span>
            <span class="kpi-icon">${Icons.mapPin}</span>
          </div>
          <div class="kpi-value">${totalDocs}</div>
          <div class="kpi-meta">${uniqueCities} farklı ilden Google Maps & kayıt verisi</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">WhatsApp Ulaşımı</span>
            <span class="kpi-icon green">${Icons.whatsapp}</span>
          </div>
          <div class="kpi-value">${sentDocs}</div>
          <div class="kpi-meta">%${pctReplied} geri dönüş / ilgi oranı (${repliedDocs} hekim)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Seminer Kayıtları</span>
            <span class="kpi-icon info">${Icons.userCheck}</span>
          </div>
          <div class="kpi-value">${totalParts}</div>
          <div class="kpi-meta">${st.seminars.length} aktif seminer · ${pendingParts} ödeme bekliyor</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Onaylı Tahsilat</span>
            <span class="kpi-icon brass">${Icons.creditCard}</span>
          </div>
          <div class="kpi-value">${Store.formatTRY(totalRevenue)}</div>
          <div class="kpi-meta">${paidParts.length} hekimin ödemesi ve giriş şifresi onaylı</div>
        </div>
      </section>

      <section class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Dönüşüm Hunisi</h2>
              <p class="card-subtitle">Google Maps keşfinden onaylı seminer katılımına kadar canlı akış</p>
            </div>
            <a href="#/outreach" class="btn btn-secondary btn-sm">${Icons.whatsapp} Kampanya Oluştur</a>
          </div>
          <div class="card-body">
            <div class="funnel-list">
              <div class="funnel-step">
                <div class="funnel-step-head">
                  <span class="funnel-step-name">1. Keşfedilen Hekim & Klinik</span>
                  <span class="funnel-step-val">${totalDocs} hekim (%100)</span>
                </div>
                <div class="progress-track"><div class="progress-fill" style="width: 100%"></div></div>
              </div>
              <div class="funnel-step">
                <div class="funnel-step-head">
                  <span class="funnel-step-name">2. WhatsApp Duyurusu Gönderilen</span>
                  <span class="funnel-step-val">${sentDocs} hekim (%${pctSent})</span>
                </div>
                <div class="progress-track"><div class="progress-fill green" style="width: ${Math.max(4, pctSent)}%"></div></div>
              </div>
              <div class="funnel-step">
                <div class="funnel-step-head">
                  <span class="funnel-step-name">3. Geri Dönüş / Bilgi Talep Eden</span>
                  <span class="funnel-step-val">${repliedDocs} hekim (%${pctReplied})</span>
                </div>
                <div class="progress-track"><div class="progress-fill info" style="width: ${Math.max(4, pctReplied)}%"></div></div>
              </div>
              <div class="funnel-step">
                <div class="funnel-step-head">
                  <span class="funnel-step-name">4. Seminer Kaydı Oluşturan</span>
                  <span class="funnel-step-val">${totalParts} hekim (%${Math.min(100, pctReg)})</span>
                </div>
                <div class="progress-track"><div class="progress-fill brass" style="width: ${Math.max(6, Math.min(100, pctReg * 2))}%"></div></div>
              </div>
              <div class="funnel-step">
                <div class="funnel-step-head">
                  <span class="funnel-step-name">5. Ödemesi Onaylanan & Giriş Tanımlanan</span>
                  <span class="funnel-step-val">${paidParts.length} / ${totalParts} (%${pctPaid})</span>
                </div>
                <div class="progress-track"><div class="progress-fill green" style="width: ${Math.max(4, pctPaid)}%"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Yaklaşan Seminerler</h2>
              <p class="card-subtitle">Yüz yüze ve Google Meet online eğitim takvimi</p>
            </div>
            <a href="#/seminerler" class="btn btn-ghost btn-sm">Tümünü Gör</a>
          </div>
          <div class="card-body">
            <div class="mini-seminar-list">
              ${st.seminars.slice(0, 3).map((sem) => {
                const regCount = st.participants.filter((p) => p.seminarId === sem.id).length;
                return `
                  <div class="mini-seminar-item">
                    <img class="mini-seminar-thumb" src="${esc(sem.coverImage || 'assets/proloterapi-cover.jpg')}" alt="${esc(sem.title)}" />
                    <div class="mini-seminar-info">
                      <h4>${esc(sem.title)}</h4>
                      <div class="mini-seminar-meta">
                        <span>${esc(sem.dateText)}</span>
                        <span>·</span>
                        <span>${esc(sem.city)}</span>
                        <span>·</span>
                        <strong>${regCount}/${sem.capacity} Kayıt</strong>
                      </div>
                    </div>
                    <div class="row-gap">
                      <button class="btn btn-secondary btn-sm" data-action="copy-sem-link" data-id="${esc(sem.id)}" title="Kayıt Linkini Kopyala">${Icons.copy}</button>
                      <a href="#/seminer/${esc(sem.slug)}" class="btn btn-primary btn-sm">Sayfa</a>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Son İşlemler & Hekim Aktiviteleri</h2>
            <p class="card-subtitle">Keşifler, WhatsApp gönderimleri ve otomatik düşen seminer kayıtları</p>
          </div>
          <a href="#/hekimler" class="btn btn-ghost btn-sm">Tüm Hekimler</a>
        </div>
        <div class="card-body">
          <div class="activity-list">
            ${st.activities.slice(0, 6).map((act) => {
              const dotCls = act.type === 'whatsapp' ? 'green' : act.type === 'payment' ? 'brass' : '';
              const icon = act.type === 'whatsapp' ? Icons.whatsapp : act.type === 'payment' ? Icons.creditCard : act.type === 'register' ? Icons.userCheck : Icons.mapPin;
              return `
                <div class="activity-item">
                  <div class="activity-dot ${dotCls}">${icon}</div>
                  <div>
                    <div class="activity-text">${esc(act.text)}</div>
                    <div class="activity-time">${esc(act.time)}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </section>
    `;
  }

  /* ========================================================================
     2. HEKİM KEŞFİ (GOOGLE MAPS 81 PROVINCES ENGINE)
     ======================================================================== */
  function renderDiscovery() {
    const st = Store.get();
    const selCities = new Set(st.discoverySelection.cities);
    const selSpecs = new Set(st.discoverySelection.specialties);
    const hasApiKey = Boolean(st.settings.googleMapsApiKey && st.settings.googleMapsApiKey.trim());

    // Filter discovered doctors
    let filtered = st.doctors.filter((d) => {
      if (ui.discoveryCityFilter !== 'ALL' && d.city !== ui.discoveryCityFilter) return false;
      if (ui.discoverySpecFilter !== 'ALL' && d.specialty !== ui.discoverySpecFilter) return false;
      if (ui.discoverySearch.trim()) {
        const q = ui.discoverySearch.toLowerCase();
        const hay = `${d.name} ${d.clinic} ${d.city} ${d.district} ${d.specialty} ${d.phone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (ui.discoverySort === 'rating') {
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (ui.discoverySort === 'city') {
      filtered = [...filtered].sort((a, b) => a.city.localeCompare(b.city, 'tr'));
    }

    const totalQueries = selCities.size * selSpecs.size;
    const estSeconds = Math.max(2, Math.round(totalQueries * 0.4));
    const discoveredCities = [...new Set(st.doctors.map((d) => d.city))].sort((a, b) => a.localeCompare(b, 'tr'));

    return `
      <div class="api-status-strip">
        <div class="row-gap">
          ${Icons.mapPin}
          ${hasApiKey
            ? `<span><strong>Canlı Google Maps Places API Aktif:</strong> Taramalar doğrudan gerçek Google Maps işletme kayıtlarından çekilir.</span>`
            : `<span><strong>Anında Çalışan Demo Keşif Modu:</strong> 81 il ve branş taramasını hemen deneyebilirsiniz. Gerçek Google Maps verisi için Ayarlar’dan API anahtarı ekleyebilirsiniz.</span>`
          }
        </div>
        <a href="#/ayarlar" class="btn btn-secondary btn-sm">${Icons.key} ${hasApiKey ? 'API Ayarları' : 'Google Maps API Bağla'}</a>
      </div>

      <section class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Yeni Google Maps Hekim Keşfi</h2>
            <p class="card-subtitle">Türkiye’nin 81 ilinden hedef branşlardaki özel muayenehane, klinik ve hekimleri otomatik tarayın</p>
          </div>
          <span class="badge badge-primary tabular-nums">${selCities.size} il × ${selSpecs.size} branş = ${totalQueries} tarama</span>
        </div>
        <div class="card-body">
          <div class="discovery-builder">
            <div>
              <div class="selector-head">
                <span class="selector-title">Şehirler (${selCities.size} / 81 seçili)</span>
                <div class="selector-shortcuts">
                  <button class="shortcut-link" data-action="preset-cities" data-preset="big5">Büyük 5</button>
                  <button class="shortcut-link" data-action="preset-cities" data-preset="marmara">Tüm Marmara</button>
                  <button class="shortcut-link" data-action="preset-cities" data-preset="ege">Ege Bölgesi</button>
                  <button class="shortcut-link" data-action="preset-cities" data-preset="all">Tümünü Seç (81)</button>
                  <button class="shortcut-link" data-action="preset-cities" data-preset="clear">Temizle</button>
                </div>
              </div>
              <div class="pill-grid">
                ${AppData.PROVINCES_81.map((p) => `
                  <button class="pill-btn ${selCities.has(p.name) ? 'selected' : ''}" data-action="toggle-city" data-city="${esc(p.name)}">${esc(p.name)}</button>
                `).join('')}
              </div>
            </div>

            <div class="stack-md">
              <div>
                <div class="selector-head">
                  <span class="selector-title">Hedef Branşlar (${selSpecs.size} seçili)</span>
                  <div class="selector-shortcuts">
                    <button class="shortcut-link" data-action="preset-specs" data-preset="all">Hepsini Seç</button>
                    <button class="shortcut-link" data-action="preset-specs" data-preset="clear">Temizle</button>
                  </div>
                </div>
                <div class="pill-grid" style="max-height: 140px;">
                  ${AppData.SPECIALTIES.map((sp) => `
                    <button class="pill-btn ${selSpecs.has(sp.short) ? 'selected' : ''}" data-action="toggle-spec" data-spec="${esc(sp.short)}">${esc(sp.short)}</button>
                  `).join('')}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="custom-keyword-input">Özel Anahtar Kelime (İsteğe Bağlı)</label>
                <input id="custom-keyword-input" class="form-input" type="text" value="${esc(st.discoverySelection.customKeyword || '')}" placeholder="Örn: proloterapi, manuel terapi, ağrı kliniği, ozon..." />
                <span class="form-hint">Seminerle en ilgili hekimleri nokta atışı hedeflemek için ek arama kelimesi.</span>
              </div>
            </div>
          </div>

          <div class="discovery-footer">
            <span class="text-muted tabular-nums">
              ${totalQueries > 0
                ? `${selCities.size} şehir × ${selSpecs.size} branş taranacak. Tahmini süre: ~${estSeconds} sn.`
                : 'Tarama başlatmak için en az 1 şehir ve 1 branş seçin.'}
            </span>
            <div class="row-gap">
              <button class="btn btn-secondary" data-action="toggle-discovery-map">
                ${Icons.map} ${ui.discoveryShowMap ? 'Haritayı Gizle' : 'Türkiye Haritasında Gör'}
              </button>
              <button id="run-discovery-btn" class="btn btn-primary" data-action="run-discovery" ${totalQueries === 0 || ui.discoveryRunning ? 'disabled' : ''}>
                ${Icons.search} ${ui.discoveryRunning ? 'Google Maps Taranıyor...' : 'Google Maps Keşfini Başlat'}
              </button>
            </div>
          </div>
        </div>
      </section>

      ${ui.discoveryShowMap ? `
        <section class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Türkiye Klinik & Hekim Dağılım Haritası</h2>
              <p class="card-subtitle">Haritadaki işaretçilere tıklayarak hekim iletişim bilgilerini ve WhatsApp bağlantısını açabilirsiniz</p>
            </div>
            <span class="badge badge-primary">${filtered.length} konum gösteriliyor</span>
          </div>
          <div class="card-body">
            <div id="discovery-map" class="map-container"></div>
          </div>
        </section>
      ` : ''}

      <section class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Bulunan Hekimler & Klinikler <span class="badge badge-primary tabular-nums" style="margin-left: 6px;">${filtered.length} kayıt</span></h2>
            <p class="card-subtitle">Seçtiğiniz hekimlere tek tıkla WhatsApp üzerinden seminer afişi ve kayıt linki gönderebilirsiniz</p>
          </div>
          <button class="btn btn-secondary btn-sm" data-action="export-doctors-csv">${Icons.download} Excel (CSV) İndir</button>
        </div>

        ${ui.selectedDiscoveryIds.size > 0 ? `
          <div class="bulk-action-bar">
            <span><strong>${ui.selectedDiscoveryIds.size} hekim</strong> seçildi.</span>
            <div class="row-gap">
              <button class="btn btn-whatsapp btn-sm" data-action="send-selected-to-outreach">${Icons.whatsapp} Seçilenlere WhatsApp Kampanyası Başlat</button>
              <button class="btn btn-on-dark-outline btn-sm" data-action="clear-discovery-selection">Seçimi Temizle</button>
            </div>
          </div>
        ` : ''}

        <div class="table-toolbar">
          <div class="table-filters">
            <div class="search-input-wrap">
              ${Icons.search}
              <input id="disc-search-input" class="form-input" type="search" value="${esc(ui.discoverySearch)}" placeholder="Hekim, klinik veya telefon ara..." />
            </div>
            <select id="disc-city-filter" class="filter-select">
              <option value="ALL">Tüm Şehirler (${discoveredCities.length})</option>
              ${discoveredCities.map((c) => `<option value="${esc(c)}" ${ui.discoveryCityFilter === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            </select>
            <select id="disc-spec-filter" class="filter-select">
              <option value="ALL">Tüm Branşlar</option>
              ${AppData.SPECIALTIES.map((s) => `<option value="${esc(s.short)}" ${ui.discoverySpecFilter === s.short ? 'selected' : ''}>${esc(s.short)}</option>`).join('')}
            </select>
            <select id="disc-sort-select" class="filter-select">
              <option value="newest" ${ui.discoverySort === 'newest' ? 'selected' : ''}>En yeniler</option>
              <option value="rating" ${ui.discoverySort === 'rating' ? 'selected' : ''}>En yüksek Google puanı</option>
              <option value="city" ${ui.discoverySort === 'city' ? 'selected' : ''}>Şehre göre (A-Z)</option>
            </select>
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:38px;"><input type="checkbox" id="disc-select-all" ${filtered.length && filtered.every((d) => ui.selectedDiscoveryIds.has(d.id)) ? 'checked' : ''} /></th>
                <th>Hekim / Klinik</th>
                <th>İletişim</th>
                <th>Google Puanı</th>
                <th>Durum</th>
                <th>Kaynak</th>
                <th style="text-align:right;">İşlem</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr><td colspan="7" class="empty-state"><h4>Eşleşen hekim bulunamadı</h4><p>Filtreleri temizleyin veya yukarıdan yeni bir Google Maps taraması başlatın.</p></td></tr>
              ` : filtered.slice(0, 80).map((doc) => {
                const mapsSearchUrl = doc.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.name + ' ' + doc.clinic + ' ' + doc.city)}`;
                return `
                  <tr>
                    <td><input type="checkbox" class="disc-row-check" data-id="${esc(doc.id)}" ${ui.selectedDiscoveryIds.has(doc.id) ? 'checked' : ''} /></td>
                    <td>
                      <div class="doc-identity">
                        <span class="doc-avatar">${esc(getInitials(doc.name))}</span>
                        <div>
                          <span class="doc-cell-name">${esc(doc.name)}</span>
                          <span class="doc-cell-sub">
                            <span>${esc(doc.clinic)}</span> · <strong>${esc(doc.specialty)}</strong> · ${esc(doc.city)} / ${esc(doc.district)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td class="tabular-nums">
                      <div class="row-gap">
                        <span>${esc(doc.phone)}</span>
                      </div>
                    </td>
                    <td>
                      <span class="rating-pill"><span class="rating-star">★</span> ${Number(doc.rating || 4.7).toFixed(1)} <span class="rating-count">(${doc.reviews || 0})</span></span>
                    </td>
                    <td>${statusBadge(doc.status)}</td>
                    <td>
                      <a href="${esc(mapsSearchUrl)}" target="_blank" rel="noopener" class="badge badge-neutral" title="Google Maps'te Görüntüle">${Icons.mapPin} ${esc(doc.source)}</a>
                    </td>
                    <td style="text-align:right;">
                      <div class="row-gap" style="justify-content:flex-end;">
                        <button class="btn btn-whatsapp btn-sm" data-action="quick-wa-doctor" data-id="${esc(doc.id)}" title="WhatsApp'tan Seminer Daveti Gönder">${Icons.whatsapp} Mesaj At</button>
                        <button class="btn btn-ghost btn-icon" data-action="open-doctor-modal" data-id="${esc(doc.id)}" title="Detay ve Notlar">${Icons.edit}</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function mountDiscoveryMap() {
    if (!ui.discoveryShowMap || typeof L === 'undefined') return;
    const el = document.getElementById('discovery-map');
    if (!el) return;

    if (ui.leafletMap) {
      ui.leafletMap.remove();
      ui.leafletMap = null;
    }

    const map = L.map(el).setView([39.0, 35.2], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const st = Store.get();
    const docs = st.doctors.filter((d) => {
      if (ui.discoveryCityFilter !== 'ALL' && d.city !== ui.discoveryCityFilter) return false;
      if (ui.discoverySpecFilter !== 'ALL' && d.specialty !== ui.discoverySpecFilter) return false;
      return d.lat && d.lng;
    });

    const sem = st.seminars[0];
    docs.slice(0, 120).forEach((doc) => {
      const waMsg = Store.renderOutreachMessage(st.outreachDraft.template, doc, sem, true);
      const waUrl = Store.buildWhatsAppUrl(doc.phone, waMsg);
      const gmapsUrl = doc.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.name + ' ' + doc.city)}`;
      const marker = L.circleMarker([doc.lat, doc.lng], {
        radius: 7,
        fillColor: doc.status === 'registered' ? '#157347' : doc.status === 'sent' ? '#1D5E8C' : '#0F3D3E',
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 190px;">
          <strong style="font-size:13px; color:#102022;">${esc(doc.name)}</strong><br/>
          <span style="font-size:12px; color:#485B5E;">${esc(doc.clinic)}</span><br/>
          <span style="font-size:11px; color:#728588;">${esc(doc.specialty)} · ${esc(doc.city)} · ★ ${doc.rating}</span><br/>
          <div style="margin-top:8px; display:flex; gap:6px;">
            <a href="${esc(waUrl)}" target="_blank" rel="noopener" style="background:#16803C; color:#fff; padding:4px 8px; border-radius:5px; font-size:11px; font-weight:600; text-decoration:none;">WhatsApp</a>
            <a href="${esc(gmapsUrl)}" target="_blank" rel="noopener" style="background:#0F3D3E; color:#fff; padding:4px 8px; border-radius:5px; font-size:11px; font-weight:600; text-decoration:none;">Google Maps</a>
          </div>
        </div>
      `);
    });

    ui.leafletMap = map;
  }

  /* ========================================================================
     3. HEKİMLER (CRM VERİTABANI)
     ======================================================================== */
  function renderDoctors() {
    const st = Store.get();
    const cities = [...new Set(st.doctors.map((d) => d.city))].sort((a, b) => a.localeCompare(b, 'tr'));

    const list = st.doctors.filter((d) => {
      if (ui.doctorCityFilter !== 'ALL' && d.city !== ui.doctorCityFilter) return false;
      if (ui.doctorStatusFilter !== 'ALL' && d.status !== ui.doctorStatusFilter) return false;
      if (ui.doctorSearch.trim()) {
        const q = ui.doctorSearch.toLowerCase();
        if (!`${d.name} ${d.clinic} ${d.city} ${d.specialty} ${d.phone} ${d.notes || ''}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    return `
      <section class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Kayıtlı Hekim Veritabanı (${list.length})</h2>
            <p class="card-subtitle">Tüm illerden keşfedilen ve manuel eklenen hekimlerin iletişim ve takip geçmişi</p>
          </div>
          <div class="row-gap">
            <button class="btn btn-secondary btn-sm" data-action="export-doctors-csv">${Icons.download} Excel (CSV) Dışa Aktar</button>
            <button class="btn btn-primary btn-sm" data-action="open-add-doctor-modal">${Icons.plus} Manuel Hekim Ekle</button>
          </div>
        </div>

        <div class="table-toolbar">
          <div class="table-filters">
            <div class="search-input-wrap">
              ${Icons.search}
              <input id="doc-crm-search" class="form-input" type="search" value="${esc(ui.doctorSearch)}" placeholder="İsim, klinik, telefon veya not ara..." />
            </div>
            <select id="doc-crm-city" class="filter-select">
              <option value="ALL">Tüm İller</option>
              ${cities.map((c) => `<option value="${esc(c)}" ${ui.doctorCityFilter === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            </select>
            <select id="doc-crm-status" class="filter-select">
              <option value="ALL">Tüm Durumlar</option>
              <option value="new" ${ui.doctorStatusFilter === 'new' ? 'selected' : ''}>Yeni</option>
              <option value="sent" ${ui.doctorStatusFilter === 'sent' ? 'selected' : ''}>Mesaj Gönderildi</option>
              <option value="replied" ${ui.doctorStatusFilter === 'replied' ? 'selected' : ''}>Yanıtladı</option>
              <option value="registered" ${ui.doctorStatusFilter === 'registered' ? 'selected' : ''}>Kayıtlı</option>
            </select>
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Hekim & Klinik</th>
                <th>Branş / İl</th>
                <th>Telefon</th>
                <th>İletişim Durumu</th>
                <th>Not</th>
                <th style="text-align:right;">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? `
                <tr><td colspan="6" class="empty-state"><h4>Kayıtlı hekim bulunamadı</h4><p>Google Maps Keşfi sekmesinden yeni hekimler ekleyebilirsiniz.</p></td></tr>
              ` : list.map((doc) => `
                <tr>
                  <td>
                    <div class="doc-identity">
                      <span class="doc-avatar">${esc(getInitials(doc.name))}</span>
                      <div>
                        <span class="doc-cell-name">${esc(doc.name)}</span>
                        <span class="doc-cell-sub">${esc(doc.clinic)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-neutral">${esc(doc.specialty)}</span>
                    <div class="text-muted" style="margin-top:3px;">${esc(doc.city)} / ${esc(doc.district)}</div>
                  </td>
                  <td class="tabular-nums">${esc(doc.phone)}</td>
                  <td>
                    <select class="filter-select" data-action="change-doc-status" data-id="${esc(doc.id)}">
                      <option value="new" ${doc.status === 'new' ? 'selected' : ''}>Yeni</option>
                      <option value="sent" ${doc.status === 'sent' ? 'selected' : ''}>Mesaj Gönderildi</option>
                      <option value="replied" ${doc.status === 'replied' ? 'selected' : ''}>Yanıtladı</option>
                      <option value="registered" ${doc.status === 'registered' ? 'selected' : ''}>Kayıtlı</option>
                    </select>
                  </td>
                  <td style="max-width:220px;"><span class="text-muted">${esc(doc.notes || '—')}</span></td>
                  <td style="text-align:right;">
                    <div class="row-gap" style="justify-content:flex-end;">
                      <button class="btn btn-whatsapp btn-sm" data-action="quick-wa-doctor" data-id="${esc(doc.id)}">${Icons.whatsapp}</button>
                      <button class="btn btn-ghost btn-icon" data-action="open-doctor-modal" data-id="${esc(doc.id)}">${Icons.edit}</button>
                      <button class="btn btn-ghost btn-icon" data-action="delete-doctor" data-id="${esc(doc.id)}" title="Sil">${Icons.trash}</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  /* ========================================================================
     4. WHATSAPP OUTREACH STÜDYOSU
     ======================================================================== */
  function getOutreachTargets() {
    const st = Store.get();
    const draft = st.outreachDraft;
    if (draft.selectedDoctorIds && draft.selectedDoctorIds.length > 0) {
      const idSet = new Set(draft.selectedDoctorIds);
      return st.doctors.filter((d) => idSet.has(d.id));
    }
    return st.doctors.filter((d) => {
      if (draft.targetCity !== 'ALL' && d.city !== draft.targetCity) return false;
      if (draft.targetSpecialty !== 'ALL' && d.specialty !== draft.targetSpecialty) return false;
      if (draft.onlyNew && d.status !== 'new') return false;
      return true;
    });
  }

  function renderOutreach() {
    const st = Store.get();
    const draft = st.outreachDraft;
    const selectedSem = st.seminars.find((s) => s.id === draft.seminarId) || st.seminars[0];
    const targets = getOutreachTargets();
    const previewDoc = targets[0] || st.doctors[0] || { name: 'Op. Dr. Örnek Hekim', clinic: 'Örnek Ortopedi Kliniği', city: 'İzmir' };
    const previewText = Store.renderOutreachMessage(draft.template, previewDoc, selectedSem, draft.includeLinks);
    const cities = [...new Set(st.doctors.map((d) => d.city))].sort((a, b) => a.localeCompare(b, 'tr'));

    return `
      <section class="outreach-grid">
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">WhatsApp Seminer Duyuru Stüdyosu</h2>
              <p class="card-subtitle">Hekimlere kişiselleştirilmiş WhatsApp mesajı, seminer afişi ve otomatik kayıt linki gönderin</p>
            </div>
            <span class="badge badge-success">${Icons.whatsapp} WhatsApp Öncelikli Kanal</span>
          </div>
          <div class="card-body stack-md">
            <div class="form-group">
              <label class="form-label" for="outreach-sem-select">Duyurulacak Seminer</label>
              <select id="outreach-sem-select" class="form-select">
                ${st.seminars.map((s) => `
                  <option value="${esc(s.id)}" ${selectedSem && selectedSem.id === s.id ? 'selected' : ''}>
                    ${esc(s.title)} (${esc(s.dateText)} — ${esc(s.city)})
                  </option>
                `).join('')}
              </select>
            </div>

            ${draft.selectedDoctorIds && draft.selectedDoctorIds.length > 0 ? `
              <div class="api-status-strip">
                <span>Google Maps Keşfi’nden özel olarak <strong>${targets.length} hekim</strong> seçildi.</span>
                <button class="btn btn-secondary btn-sm" data-action="clear-outreach-explicit">Tüm Filtrelere Dön</button>
              </div>
            ` : `
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="outreach-city-select">Hedef Şehir</label>
                  <select id="outreach-city-select" class="form-select">
                    <option value="ALL">Tüm Şehirler (${st.doctors.length} hekim)</option>
                    ${cities.map((c) => `<option value="${esc(c)}" ${draft.targetCity === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="outreach-spec-select">Hedef Branş</label>
                  <select id="outreach-spec-select" class="form-select">
                    <option value="ALL">Tüm Branşlar</option>
                    ${AppData.SPECIALTIES.map((sp) => `<option value="${esc(sp.short)}" ${draft.targetSpecialty === sp.short ? 'selected' : ''}>${esc(sp.short)}</option>`).join('')}
                  </select>
                </div>
              </div>
              <label class="checkbox-label">
                <input type="checkbox" id="outreach-only-new" ${draft.onlyNew ? 'checked' : ''} />
                <span>Sadece henüz WhatsApp mesajı gönderilmemiş yeni hekimleri hedefle</span>
              </label>
            `}

            <div class="form-group">
              <label class="form-label" for="outreach-template">
                <span>WhatsApp Mesaj Şablonu</span>
                <span class="text-muted">Değişken eklemek için tıklayın</span>
              </label>
              <textarea id="outreach-template" class="form-textarea" rows="8">${esc(draft.template)}</textarea>
              <div class="var-chips">
                ${['{{unvan_ad}}', '{{klinik}}', '{{sehir}}', '{{seminer_adi}}', '{{tarih}}', '{{konum}}', '{{kayit_linki}}'].map((v) => `
                  <button type="button" class="var-chip" data-action="insert-var" data-var="${esc(v)}">${esc(v)}</button>
                `).join('')}
              </div>
            </div>

            <label class="checkbox-label">
              <input type="checkbox" id="outreach-include-links" ${draft.includeLinks ? 'checked' : ''} />
              <span>Alt bilgiye <strong>drhasandogan.com</strong>, <strong>proloterapi.com.tr</strong> ve Eğitim Koordinatörü (${esc(st.settings.coordinatorName)}) iletişimini otomatik ekle</span>
            </label>

            <div class="row-between" style="padding-top: 10px; border-top: 1px solid var(--border-subtle);">
              <span class="text-muted">Hedef Kitle: <strong style="color:var(--ink-primary);">${targets.length} hekim</strong></span>
              <div class="row-gap">
                <button class="btn btn-whatsapp" data-action="launch-bulk-campaign" ${targets.length === 0 ? 'disabled' : ''}>
                  ${Icons.send} Toplu Kampanya Başlat (${targets.length} Hekim)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky-preview stack-md">
          <div class="wa-phone-frame">
            <div class="wa-phone-screen">
              <div class="wa-header">
                <div class="wa-avatar">HD</div>
                <div>
                  <div class="wa-header-name">${esc(st.settings.doctorName)}</div>
                  <div class="wa-header-status">Önizleme · Alıcı: ${esc(previewDoc.name)}</div>
                </div>
              </div>
              <div class="wa-chat-body">
                <div class="wa-bubble">
                  ${selectedSem && selectedSem.coverImage ? `<img class="wa-bubble-img" src="${esc(selectedSem.coverImage)}" alt="Seminer Afişi" />` : ''}
                  <div class="wa-bubble-text">${esc(previewText)}</div>
                  <div class="wa-bubble-time">10:15 ✓✓</div>
                </div>
              </div>
            </div>
          </div>
          <p class="text-muted" style="text-align:center;">Aşağıdaki gönderim kuyruğundan her hekime doğrudan kendi WhatsApp’ınızdan tek tıkla gönderebilirsiniz.</p>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Birebir WhatsApp Gönderim Kuyruğu (${targets.length} Hekim)</h2>
            <p class="card-subtitle">“WhatsApp’ta Aç” butonu kişiye özel hazırlanmış mesajla doğrudan WhatsApp uygulamasını açar ve durumu günceller</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Hekim</th>
                <th>Şehir & Branş</th>
                <th>Telefon</th>
                <th>Durum</th>
                <th style="text-align:right;">Gönder</th>
              </tr>
            </thead>
            <tbody>
              ${targets.length === 0 ? `
                <tr><td colspan="5" class="empty-state"><h4>Hedef kitle boş</h4><p>Yukarıdaki şehir/branş filtrelerini genişletin veya Hekim Keşfi’nden yeni hekimler bulun.</p></td></tr>
              ` : targets.slice(0, 40).map((doc) => `
                <tr>
                  <td><span class="doc-cell-name">${esc(doc.name)}</span><span class="doc-cell-sub">${esc(doc.clinic)}</span></td>
                  <td>${esc(doc.city)} · ${esc(doc.specialty)}</td>
                  <td class="tabular-nums">${esc(doc.phone)}</td>
                  <td>${statusBadge(doc.status)}</td>
                  <td style="text-align:right;">
                    <button class="btn btn-whatsapp btn-sm" data-action="send-queue-wa" data-id="${esc(doc.id)}">${Icons.whatsapp} WhatsApp’ta Aç</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Kampanya Geçmişi & Performans</h2>
            <p class="card-subtitle">Gönderilen WhatsApp duyurularının ulaşım ve kayıt dönüşüm metrikleri</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Kampanya Adı</th>
                <th>Tarih</th>
                <th>Gönderilen</th>
                <th>Açılma</th>
                <th>Yanıt</th>
                <th>Kayıt</th>
              </tr>
            </thead>
            <tbody>
              ${st.campaigns.map((c) => `
                <tr>
                  <td><strong>${esc(c.name)}</strong></td>
                  <td>${esc(c.date)}</td>
                  <td class="tabular-nums">${c.sentCount}</td>
                  <td class="tabular-nums">${c.openedCount} (%${Math.round((c.openedCount / Math.max(1, c.sentCount)) * 100)})</td>
                  <td class="tabular-nums">${c.repliedCount}</td>
                  <td><span class="badge badge-success">${c.registeredCount} kayıt</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  /* ========================================================================
     5. SEMİNERLER (PLANLAMA, OLUŞTURMA & CANLI ÖNİZLEME)
     ======================================================================== */
  function getEmptySeminarDraft() {
    const st = Store.get();
    return {
      id: null,
      title: '',
      slug: '',
      shortDesc: '',
      detailedDesc: '',
      type: 'yuz_yuze',
      dateText: '15-16 Ağustos 2026',
      timeText: '09:30 - 17:30',
      location: 'Denizli — Uygulama Merkezi',
      city: 'Denizli',
      meetUrl: st.settings.googleMeetDefaultUrl || '',
      slideDeckName: '',
      price: 25000,
      capacity: 30,
      coverImage: 'assets/proloterapi-cover.jpg'
    };
  }

  function renderSeminars() {
    const st = Store.get();
    if (ui.showSeminarForm) {
      const d = ui.seminarDraft || getEmptySeminarDraft();
      const previewSlug = d.slug || Store.slugify(d.title || 'yeni-seminer');
      return `
        <div class="row-between">
          <div>
            <h2>${d.id ? 'Semineri Düzenle' : 'Yeni Seminer Oluştur'}</h2>
            <p class="text-muted">Bilgileri doldurun; doktorların kayıt olacağı web sayfası linki otomatik oluşturulur.</p>
          </div>
          <button class="btn btn-secondary" data-action="close-seminar-form">${Icons.chevronLeft} Seminer Listesine Dön</button>
        </div>

        <section class="editor-split">
          <form id="seminar-editor-form" class="card">
            <div class="card-header">
              <h3 class="card-title">Temel Bilgiler & Program</h3>
            </div>
            <div class="card-body stack-md">
              <div class="form-group">
                <label class="form-label" for="sem-title">Seminer Başlığı <span class="req">*</span></label>
                <input id="sem-title" class="form-input" required value="${esc(d.title)}" placeholder="Örn: Hackett Proloterapi Atölyesi" />
              </div>

              <div class="form-group">
                <label class="form-label" for="sem-slug">URL Kısaltması <span class="req">*</span></label>
                <input id="sem-slug" class="form-input" required value="${esc(d.slug)}" placeholder="hackett-proloterapi-atolyesi" />
                <span class="form-hint">Oluşacak otomatik kayıt linki: <code>#/seminer/${esc(previewSlug)}</code></span>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="sem-type">Eğitim Türü</label>
                  <select id="sem-type" class="form-select">
                    <option value="yuz_yuze" ${d.type === 'yuz_yuze' ? 'selected' : ''}>Yüz Yüze Uygulamalı</option>
                    <option value="online" ${d.type === 'online' ? 'selected' : ''}>Online Canlı (Google Meet)</option>
                    <option value="hibrit" ${d.type === 'hibrit' ? 'selected' : ''}>Hibrit (Yüz Yüze + Online)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="sem-city">Şehir</label>
                  <input id="sem-city" class="form-input" value="${esc(d.city)}" placeholder="Denizli veya Online (81 İl)" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="sem-date">Tarih <span class="req">*</span></label>
                  <input id="sem-date" class="form-input" required value="${esc(d.dateText)}" placeholder="20-21 Haziran 2026" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="sem-time">Saat</label>
                  <input id="sem-time" class="form-input" value="${esc(d.timeText)}" placeholder="09:30 - 17:30" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="sem-price">Katılım Ücreti (₺)</label>
                  <input id="sem-price" class="form-input" type="number" min="0" step="500" value="${Number(d.price) || 0}" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="sem-capacity">Kontenjan (Kişi)</label>
                  <input id="sem-capacity" class="form-input" type="number" min="1" value="${Number(d.capacity) || 30}" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="sem-location">Konum / Mekan</label>
                <input id="sem-location" class="form-input" value="${esc(d.location)}" placeholder="Örn: Denizli Klinik Uygulama Merkezi veya Online Google Meet" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="sem-meet">Google Meet Odası Linki</label>
                  <input id="sem-meet" class="form-input" type="url" value="${esc(d.meetUrl || '')}" placeholder="https://meet.google.com/..." />
                  <span class="form-hint">Ödemesi onaylanan hekimler şifreleriyle buradan katılır.</span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="sem-slides">Sunum / PDF Dosya Adı</label>
                  <input id="sem-slides" class="form-input" value="${esc(d.slideDeckName || '')}" placeholder="Örn: Bütüncül Tıp Sunumu.pdf" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="sem-short">Kısa Açıklama <span class="req">*</span></label>
                <textarea id="sem-short" class="form-textarea" rows="3" required placeholder="Kart görünümünde ve duyurularda çıkacak kısa özet...">${esc(d.shortDesc)}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label" for="sem-detailed">Detaylı Program & Müfredat</label>
                <textarea id="sem-detailed" class="form-textarea" rows="5" placeholder="Gün gün eğitim akışı, vaka uygulamaları, sertifika detayları...">${esc(d.detailedDesc)}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label" for="sem-cover-file">Seminer Afişi / Kapak Görseli</label>
                <input id="sem-cover-file" class="form-input" type="file" accept="image/*" />
                <div class="row-gap" style="margin-top:6px;">
                  <button type="button" class="shortcut-link" data-action="use-cover-preset" data-src="assets/proloterapi-cover.jpg">Proloterapi Anatomi Kapağı</button>
                  <button type="button" class="shortcut-link" data-action="use-cover-preset" data-src="assets/online-cover.jpg">Online Seminer Kapağı</button>
                </div>
              </div>

              <div class="row-between" style="padding-top:12px; border-top:1px solid var(--border-subtle);">
                <button type="button" class="btn btn-secondary" data-action="close-seminar-form">İptal</button>
                <button type="submit" class="btn btn-primary">${Icons.check} ${d.id ? 'Değişiklikleri Kaydet' : 'Semineri Yayınla & Link Oluştur'}</button>
              </div>
            </div>
          </form>

          <div class="sticky-preview">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Canlı Kart Önizlemesi</h3>
                <span class="badge badge-neutral">Otomatik Güncellenir</span>
              </div>
              <div class="card-body">
                <div class="seminar-card" id="seminar-live-preview">
                  <div class="seminar-card-cover">
                    <img id="prev-sem-img" src="${esc(d.coverImage || 'assets/proloterapi-cover.jpg')}" alt="Afiş Önizleme" />
                    <div class="seminar-cover-badges">
                      <span id="prev-sem-type">${seminarTypeBadge(d.type)}</span>
                      <span class="badge badge-brass" id="prev-sem-price">${Store.formatTRY(d.price)}</span>
                    </div>
                  </div>
                  <div class="seminar-card-body">
                    <h4 class="seminar-card-title" id="prev-sem-title">${esc(d.title || 'Seminer Başlığı')}</h4>
                    <p class="seminar-card-desc" id="prev-sem-short">${esc(d.shortDesc || 'Kısa açıklama burada görünecektir.')}</p>
                    <div class="seminar-meta-grid">
                      <div class="seminar-meta-item">${Icons.calendar} <span id="prev-sem-date">${esc(d.dateText || 'Tarih')}</span></div>
                      <div class="seminar-meta-item">${Icons.mapPin} <span id="prev-sem-city">${esc(d.city || 'Şehir')}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    return `
      <div class="row-between">
        <div>
          <h2>Seminer & Eğitim Yönetimi</h2>
          <p class="text-muted">Yüz yüze uygulamalı kurslarınızı ve Google Meet online eğitimlerinizi tek panelden planlayın.</p>
        </div>
        <button class="btn btn-primary" data-action="open-new-seminar">${Icons.plus} Yeni Seminer Oluştur</button>
      </div>

      <section class="seminar-grid">
        ${st.seminars.map((sem) => {
          const regs = st.participants.filter((p) => p.seminarId === sem.id);
          const paidCount = regs.filter((p) => p.paymentStatus === 'paid').length;
          const pct = Math.min(100, Math.round((regs.length / Math.max(1, sem.capacity)) * 100));
          return `
            <article class="seminar-card">
              <div class="seminar-card-cover">
                <img src="${esc(sem.coverImage || 'assets/proloterapi-cover.jpg')}" alt="${esc(sem.title)}" />
                <div class="seminar-cover-badges">
                  ${seminarTypeBadge(sem.type)}
                  <span class="badge badge-brass">${Store.formatTRY(sem.price)}</span>
                </div>
              </div>
              <div class="seminar-card-body">
                <h3 class="seminar-card-title">${esc(sem.title)}</h3>
                <p class="seminar-card-desc">${esc(sem.shortDesc)}</p>
                <div class="seminar-meta-grid">
                  <div class="seminar-meta-item">${Icons.calendar} <span>${esc(sem.dateText)}</span></div>
                  <div class="seminar-meta-item">${Icons.mapPin} <span>${esc(sem.city)}</span></div>
                  <div class="seminar-meta-item">${Icons.users} <span>${regs.length} / ${sem.capacity} kayıt (${paidCount} onaylı)</span></div>
                  <div class="seminar-meta-item">${Icons.fileText} <span>${esc(sem.slideDeckName ? 'Sunum Ekli' : 'Vaka Programı')}</span></div>
                </div>
                <div class="progress-track"><div class="progress-fill" style="width: ${Math.max(4, pct)}%"></div></div>
              </div>
              <div class="seminar-card-footer">
                <div class="row-gap">
                  <a href="#/seminer/${esc(sem.slug)}" class="btn btn-primary btn-sm">${Icons.externalLink} Kayıt Sayfası</a>
                  <button class="btn btn-secondary btn-sm" data-action="copy-sem-link" data-id="${esc(sem.id)}">${Icons.copy} Link Kopyala</button>
                  <button class="btn btn-whatsapp btn-sm" data-action="promote-seminar" data-id="${esc(sem.id)}">${Icons.whatsapp} Duyur</button>
                </div>
                <div class="row-gap">
                  ${sem.meetUrl ? `<a href="${esc(sem.meetUrl)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">${Icons.video} Google Meet</a>` : ''}
                  <button class="btn btn-ghost btn-icon" data-action="edit-seminar" data-id="${esc(sem.id)}" title="Düzenle">${Icons.edit}</button>
                  <button class="btn btn-ghost btn-icon" data-action="delete-seminar" data-id="${esc(sem.id)}" title="Sil">${Icons.trash}</button>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </section>
    `;
  }

  /* ========================================================================
     6. KATILIMCILAR (ÖDEME ONAYI & GOOGLE MEET ŞİFRE KONTROLÜ)
     ======================================================================== */
  function renderParticipants() {
    const st = Store.get();
    const list = st.participants.filter((p) => {
      if (ui.participantSemFilter !== 'ALL' && p.seminarId !== ui.participantSemFilter) return false;
      return true;
    });

    return `
      <section class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Seminer Katılımcıları & Erişim Kontrolü (${list.length})</h2>
            <p class="card-subtitle">Kayıt linkinden başvuran hekimler anında buraya düşer. Ödeme onaylandığında şifreli Google Meet erişimini WhatsApp’tan iletebilirsiniz.</p>
          </div>
          <div class="row-gap">
            <select id="part-sem-filter" class="filter-select">
              <option value="ALL">Tüm Seminerler</option>
              ${st.seminars.map((s) => `<option value="${esc(s.id)}" ${ui.participantSemFilter === s.id ? 'selected' : ''}>${esc(s.title)}</option>`).join('')}
            </select>
            <button class="btn btn-secondary btn-sm" data-action="export-participants-csv">${Icons.download} Liste İndir (CSV)</button>
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Katılımcı Hekim</th>
                <th>Seminer</th>
                <th>İletişim</th>
                <th>Ödeme Durumu</th>
                <th>Online Giriş Bilgisi</th>
                <th style="text-align:right;">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? `
                <tr><td colspan="6" class="empty-state"><h4>Henüz katılımcı kaydı yok</h4><p>Seminer kayıt linkini hekimlerle paylaştığınızda kayıtlar otomatik burada listelenir.</p></td></tr>
              ` : list.map((p) => {
                const sem = st.seminars.find((s) => s.id === p.seminarId);
                return `
                  <tr>
                    <td>
                      <span class="doc-cell-name">${esc(p.title)} ${esc(p.fullName)}</span>
                      <span class="doc-cell-sub">${esc(p.specialty)} · ${esc(p.clinic)} (${esc(p.city)})</span>
                    </td>
                    <td>
                      <strong>${esc(sem ? sem.title : 'Seminer')}</strong>
                      <div class="text-muted">${esc(p.registeredAt)}</div>
                    </td>
                    <td class="tabular-nums">
                      <div>${esc(p.phone)}</div>
                      <div class="text-muted">${esc(p.email)}</div>
                    </td>
                    <td>
                      ${p.paymentStatus === 'paid'
                        ? `<span class="badge badge-success">${Icons.check} Onaylandı (${Store.formatTRY(p.amount)})</span>`
                        : `<span class="badge badge-warn">Ödeme Bekliyor (${Store.formatTRY(p.amount)})</span>`
                      }
                      <div class="text-muted" style="margin-top:3px;">${esc(p.paymentMethod)}</div>
                    </td>
                    <td>
                      <code style="background:var(--bg-surface-muted); padding:3px 7px; border-radius:5px; font-size:0.78rem;">${esc(p.accessUser)} / ${esc(p.accessPass)}</code>
                    </td>
                    <td style="text-align:right;">
                      <div class="row-gap" style="justify-content:flex-end;">
                        ${p.paymentStatus !== 'paid'
                          ? `<button class="btn btn-primary btn-sm" data-action="confirm-payment" data-id="${esc(p.id)}">${Icons.check} Ödemeyi Onayla</button>`
                          : ''
                        }
                        <button class="btn btn-whatsapp btn-sm" data-action="send-participant-creds" data-id="${esc(p.id)}" title="Google Meet & Giriş Şifresini WhatsApp'tan Gönder">${Icons.whatsapp} Giriş Gönder</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  /* ========================================================================
     7. RAPORLAR (ANALİTİK & İL DAĞILIMI)
     ======================================================================== */
  function renderReports() {
    const st = Store.get();
    const cityCounts = {};
    const specCounts = {};
    st.doctors.forEach((d) => {
      cityCounts[d.city] = (cityCounts[d.city] || 0) + 1;
      specCounts[d.specialty] = (specCounts[d.specialty] || 0) + 1;
    });

    const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxCityVal = topCities.length ? topCities[0][1] : 1;

    const topSpecs = Object.entries(specCounts).sort((a, b) => b[1] - a[1]);
    const maxSpecVal = topSpecs.length ? topSpecs[0][1] : 1;

    return `
      <div class="row-between">
        <div>
          <h2>Raporlar & Dönüşüm Analizi</h2>
          <p class="text-muted">Türkiye genelinde ulaşılan iller, branş dağılımı ve seminer doluluk performansı</p>
        </div>
        <button class="btn btn-secondary" onclick="window.print()">${Icons.fileText} Yazdır / PDF Kaydet</button>
      </div>

      <section class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">İl Bazlı Hekim Dağılımı</h3>
            <span class="badge badge-primary">${Object.keys(cityCounts).length} İl</span>
          </div>
          <div class="card-body">
            <div class="funnel-list">
              ${topCities.map(([city, count]) => `
                <div class="funnel-step">
                  <div class="funnel-step-head">
                    <span class="funnel-step-name">${esc(city)}</span>
                    <span class="funnel-step-val">${count} hekim</span>
                  </div>
                  <div class="progress-track"><div class="progress-fill" style="width:${Math.round((count / maxCityVal) * 100)}%"></div></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Branş Bazlı Hedef Kitle</h3>
            <span class="badge badge-brass">${st.doctors.length} Toplam</span>
          </div>
          <div class="card-body">
            <div class="funnel-list">
              ${topSpecs.map(([spec, count]) => `
                <div class="funnel-step">
                  <div class="funnel-step-head">
                    <span class="funnel-step-name">${esc(spec)}</span>
                    <span class="funnel-step-val">${count} hekim</span>
                  </div>
                  <div class="progress-track"><div class="progress-fill brass" style="width:${Math.round((count / maxSpecVal) * 100)}%"></div></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <h3 class="card-title">Seminer Gelir & Doluluk Özeti</h3>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Seminer</th>
                <th>Tür</th>
                <th>Kayıt / Kontenjan</th>
                <th>Onaylı Ödeme</th>
                <th>Bekleyen Tutar</th>
              </tr>
            </thead>
            <tbody>
              ${st.seminars.map((sem) => {
                const regs = st.participants.filter((p) => p.seminarId === sem.id);
                const paid = regs.filter((p) => p.paymentStatus === 'paid').reduce((a, b) => a + (Number(b.amount) || 0), 0);
                const pend = regs.filter((p) => p.paymentStatus !== 'paid').reduce((a, b) => a + (Number(b.amount) || 0), 0);
                return `
                  <tr>
                    <td><strong>${esc(sem.title)}</strong><div class="text-muted">${esc(sem.dateText)}</div></td>
                    <td>${seminarTypeBadge(sem.type)}</td>
                    <td class="tabular-nums">${regs.length} / ${sem.capacity}</td>
                    <td class="tabular-nums"><strong>${Store.formatTRY(paid)}</strong></td>
                    <td class="tabular-nums">${Store.formatTRY(pend)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  /* ========================================================================
     8. AYARLAR & ENTEGRASYONLAR
     ======================================================================== */
  function renderSettings() {
    const s = Store.get().settings;
    return `
      <form id="settings-form" class="stack-md">
        <div class="row-between">
          <div>
            <h2>Sistem Ayarları & Entegrasyonlar</h2>
            <p class="text-muted">Google Maps API, Google Meet, WhatsApp, şirket/ödeme bilgileri ve sosyal medya bağlantıları</p>
          </div>
          <button type="submit" class="btn btn-primary">${Icons.check} Tüm Ayarları Kaydet</button>
        </div>

        <section class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">1. Google Maps Places API (Canlı Hekim Keşfi)</h3>
              <p class="card-subtitle">Google Cloud Console üzerinden alınan Places API (New) anahtarını girerek gerçek işletme verilerini anlık çekebilirsiniz</p>
            </div>
            <span class="badge ${s.googleMapsApiKey ? 'badge-success' : 'badge-warn'}">${s.googleMapsApiKey ? 'Canlı API Bağlı' : 'Demo Veri Modunda'}</span>
          </div>
          <div class="card-body stack-sm">
            <div class="form-group">
              <label class="form-label" for="set-gmaps-key">Google Maps Places API Anahtarı</label>
              <input id="set-gmaps-key" class="form-input" type="password" value="${esc(s.googleMapsApiKey || '')}" placeholder="AIzaSy..." />
              <span class="form-hint">Anahtar yalnızca kendi tarayıcınızda (localStorage) saklanır; sunucuya gönderilmez.</span>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">2. Google Meet & Online Seminer Ayarları</h3>
              <p class="card-subtitle">Ömür boyu Google Meet hesabınızla doğrudan canlı ekran paylaşımı ve slayt sunumu bağlantısı</p>
            </div>
          </div>
          <div class="card-body form-row">
            <div class="form-group">
              <label class="form-label" for="set-meet-url">Varsayılan Google Meet Odası Linki</label>
              <input id="set-meet-url" class="form-input" type="url" value="${esc(s.googleMeetDefaultUrl)}" />
            </div>
            <div class="form-group">
              <label class="form-label" for="set-wa-mode">WhatsApp Gönderim Modu</label>
              <select id="set-wa-mode" class="form-select">
                <option value="direct" ${s.whatsappMode === 'direct' ? 'selected' : ''}>Doğrudan WhatsApp Web / Uygulama (Ücretsiz · Tek Tık)</option>
                <option value="cloud_api" ${s.whatsappMode === 'cloud_api' ? 'selected' : ''}>WhatsApp Business Cloud API (Otomatik Toplu Gönderim)</option>
              </select>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">3. Web Siteleri, Sosyal Medya & Koordinatör Bilgileri</h3>
              <p class="card-subtitle">Halka açık portalda ve doktorlara giden WhatsApp mesajlarında görünecek resmi bağlantılar</p>
            </div>
          </div>
          <div class="card-body stack-md">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="set-doc-name">Hekim Adı & Unvanı</label>
                <input id="set-doc-name" class="form-input" value="${esc(s.doctorName)}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="set-doc-title">Kurumsal Unvan / Dernek</label>
                <input id="set-doc-title" class="form-input" value="${esc(s.doctorTitle)}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="set-web-1">Resmi Web Sitesi 1</label>
                <input id="set-web-1" class="form-input" type="url" value="${esc(s.websitePrimary)}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="set-web-2">Resmi Web Sitesi 2</label>
                <input id="set-web-2" class="form-input" type="url" value="${esc(s.websiteSecondary)}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="set-ig">Instagram Hesap Linki</label>
                <input id="set-ig" class="form-input" type="url" value="${esc(s.instagramUrl)}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="set-fb">Facebook Sayfa Linki</label>
                <input id="set-fb" class="form-input" type="url" value="${esc(s.facebookUrl)}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="set-coord-name">Eğitim Koordinatörü</label>
                <input id="set-coord-name" class="form-input" value="${esc(s.coordinatorName)}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="set-coord-phone">Koordinatör Telefon / WhatsApp</label>
                <input id="set-coord-phone" class="form-input" value="${esc(s.coordinatorPhone)}" />
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">4. Şirket & Ödeme Altyapısı Bilgileri</h3>
              <p class="card-subtitle">Kayıt sayfasındaki Havale/EFT ve online sanal POS (iyzico / PayTR) adımlarında kullanılır</p>
            </div>
          </div>
          <div class="card-body stack-md">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="set-company">Şirket / Klinik Unvanı</label>
                <input id="set-company" class="form-input" value="${esc(s.companyName)}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="set-bank">Banka Adı</label>
                <input id="set-bank" class="form-input" value="${esc(s.bankName)}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="set-iban">IBAN Numarası</label>
                <input id="set-iban" class="form-input" value="${esc(s.iban)}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="set-tax">Vergi Dairesi & No</label>
                <input id="set-tax" class="form-input" value="${esc(s.taxOffice)}" />
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <h3 class="card-title">Veri Yedekleme & Sıfırlama</h3>
          </div>
          <div class="card-body row-gap">
            <button type="button" class="btn btn-secondary" data-action="backup-json">${Icons.download} Tüm Veriyi JSON Yedekle</button>
            <button type="button" class="btn btn-danger-soft" data-action="reset-demo-data">${Icons.trash} Demo Verilerine Sıfırla</button>
          </div>
        </section>
      </form>
    `;
  }

  return {
    ui,
    getEmptySeminarDraft,
    getOutreachTargets,
    renderDashboard,
    renderDiscovery,
    mountDiscoveryMap,
    renderDoctors,
    renderOutreach,
    renderSeminars,
    renderParticipants,
    renderReports,
    renderSettings
  };
})();
