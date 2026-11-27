/* ==========================================================================
   Public Portal Views — Op. Dr. Hasan Doğan Hekim Eğitim Portalı,
   Otomatik Seminer Kayıt Sayfası & Şifreli Google Meet Eğitim Odası
   ========================================================================== */

window.PublicViews = (function () {
  const esc = Store.escapeHtml;

  const pubState = {
    regStep: 1, // 1 = Form, 2 = Payment, 3 = Confirmed
    regDraft: null,
    confirmedParticipant: null,
    activeSeminarSlug: null,
    loggedInParticipant: null,
    currentSlideIndex: 0,
    classroomNote: ''
  };

  function renderPublicNav(activeTab) {
    const s = Store.get().settings;
    return `
      <header class="public-nav">
        <div class="public-nav-inner">
          <a href="#/site" class="public-logo-link">
            <img class="public-logo-img" src="assets/logo-hasan-dogan.png" alt="${esc(s.doctorName)}" />
          </a>
          <nav class="public-nav-links" aria-label="Ana menü">
            <a href="#/site" class="${activeTab === 'home' ? 'active' : ''}">Eğitimler</a>
            <a href="${esc(s.websitePrimary)}" target="_blank" rel="noopener">drhasandogan.com</a>
            <a href="${esc(s.websiteSecondary)}" target="_blank" rel="noopener">proloterapi.com.tr</a>
            <a href="#/canli-giris" class="${activeTab === 'classroom' ? 'active' : ''}">Online Eğitim Girişi</a>
          </nav>
          <div class="row-gap">
            <a href="#/canli-giris" class="btn btn-secondary btn-sm">${Icons.video} Canlı Ders Girişi</a>
            <a href="#/panel" class="btn btn-primary btn-sm">${Icons.dashboard} Yönetim Paneli</a>
          </div>
        </div>
      </header>
    `;
  }

  function renderPublicFooter() {
    const s = Store.get().settings;
    const coordWa = Store.buildWhatsAppUrl(
      s.coordinatorPhone,
      'Merhaba, Op. Dr. Hasan Doğan eğitim ve seminerleri hakkında bilgi almak istiyorum.'
    );
    return `
      <footer class="public-footer">
        <div class="public-container row-between">
          <div class="stack-sm">
            <div class="footer-logo-plate">
              <img src="assets/logo-hasan-dogan.png" alt="${esc(s.doctorName)}" />
            </div>
            <strong style="color:#fff; font-size:0.95rem;">${esc(s.doctorName)} — ${esc(s.doctorTitle)}</strong>
            <span>Bilgi & Kayıt Hattı: ${esc(s.coordinatorName)} (${esc(s.coordinatorRole)}) · <a href="${esc(coordWa)}" target="_blank" rel="noopener">${esc(s.coordinatorPhone)}</a></span>
          </div>
          <div class="row-gap">
            <a href="${esc(s.websitePrimary)}" target="_blank" rel="noopener">drhasandogan.com</a>
            <span>·</span>
            <a href="${esc(s.websiteSecondary)}" target="_blank" rel="noopener">proloterapi.com.tr</a>
            <span>·</span>
            <a href="${esc(s.instagramUrl)}" target="_blank" rel="noopener">Instagram</a>
            <span>·</span>
            <a href="${esc(s.facebookUrl)}" target="_blank" rel="noopener">Facebook</a>
          </div>
        </div>
      </footer>
    `;
  }

  /* ========================================================================
     1. HALKA AÇIK ANA SAYFA (#/site)
     ======================================================================== */
  function renderPublicHome() {
    const st = Store.get();
    const s = st.settings;
    const featured = st.seminars[0];
    const coordWa = Store.buildWhatsAppUrl(
      s.coordinatorPhone,
      'Merhaba, Op. Dr. Hasan Doğan seminer kayıtları hakkında bilgi almak istiyorum.'
    );

    return `
      <div class="public-shell">
        ${renderPublicNav('home')}

        <section class="public-hero">
          <div class="public-container public-hero-grid">
            <div>
              <div class="hero-instructor-chip">
                <img src="assets/hasan-dogan.jpg" alt="${esc(s.doctorName)}" />
                <div>
                  <div class="hero-instructor-name">${esc(s.doctorName)}</div>
                  <div class="hero-instructor-role">${esc(s.doctorTitle)}</div>
                </div>
              </div>
              <h1>Hekimlere Özel Proloterapi &amp; Bütüncül Tıp Eğitimleri</h1>
              <p class="public-hero-lead">
                ${esc(s.doctorName)} liderliğinde, Türkiye’nin 81 ilinden hekimlere yönelik uygulamalı yüz yüze Klasik Hackett Proloterapi atölyeleri ve Google Meet üzerinden canlı interaktif online vaka seminerleri.
              </p>
              <div class="row-gap">
                ${featured ? `<a href="#/seminer/${esc(featured.slug)}" class="btn btn-on-dark btn-lg">Yaklaşan Seminere Kayıt Ol ${Icons.arrowRight}</a>` : ''}
                <a href="#/canli-giris" class="btn btn-on-dark-outline btn-lg">${Icons.video} Online Eğitim Odası Girişi</a>
              </div>
              <div class="external-links-bar">
                <a class="ext-link-pill" href="${esc(s.websitePrimary)}" target="_blank" rel="noopener">${Icons.globe} www.drhasandogan.com</a>
                <a class="ext-link-pill" href="${esc(s.websiteSecondary)}" target="_blank" rel="noopener">${Icons.globe} www.proloterapi.com.tr</a>
                <a class="ext-link-pill" href="${esc(s.instagramUrl)}" target="_blank" rel="noopener">${Icons.instagram} Instagram Yayınları</a>
                <a class="ext-link-pill" href="${esc(s.facebookUrl)}" target="_blank" rel="noopener">${Icons.facebook} Facebook Yayınları</a>
              </div>
            </div>

            ${featured ? `
              <div class="public-hero-card">
                <div class="seminar-card-cover" style="height:200px;">
                  <img src="${esc(featured.coverImage || 'assets/proloterapi-cover.jpg')}" alt="${esc(featured.title)}" />
                  <div class="seminar-cover-badges">
                    <span class="badge badge-primary">Öne Çıkan Eğitim</span>
                    <span class="badge badge-brass">${Store.formatTRY(featured.price)}</span>
                  </div>
                </div>
                <div class="card-body stack-sm">
                  <h3 style="font-size:1.18rem;">${esc(featured.title)}</h3>
                  <p class="text-muted">${esc(featured.shortDesc)}</p>
                  <div class="seminar-meta-grid">
                    <div class="seminar-meta-item">${Icons.calendar} <span>${esc(featured.dateText)}</span></div>
                    <div class="seminar-meta-item">${Icons.mapPin} <span>${esc(featured.city)}</span></div>
                  </div>
                  <a href="#/seminer/${esc(featured.slug)}" class="btn btn-primary" style="width:100%;">Programı İncele &amp; Kayıt Ol ${Icons.arrowRight}</a>
                </div>
              </div>
            ` : ''}
          </div>
        </section>

        <section class="public-section">
          <div class="public-container">
            <div class="public-section-head">
              <div>
                <span class="badge badge-primary" style="margin-bottom:8px;">2026 Eğitim Takvimi</span>
                <h2>Aktif Yüz Yüze &amp; Online Seminerler</h2>
              </div>
              <a href="${esc(coordWa)}" target="_blank" rel="noopener" class="btn btn-whatsapp">${Icons.whatsapp} Bilgi &amp; Kayıt: ${esc(s.coordinatorPhone)}</a>
            </div>

            <div class="seminar-grid">
              ${st.seminars.map((sem) => {
                const regs = st.participants.filter((p) => p.seminarId === sem.id).length;
                const remaining = Math.max(0, sem.capacity - regs);
                return `
                  <article class="seminar-card">
                    <div class="seminar-card-cover">
                      <img src="${esc(sem.coverImage || 'assets/proloterapi-cover.jpg')}" alt="${esc(sem.title)}" />
                      <div class="seminar-cover-badges">
                        <span class="badge ${sem.type === 'online' ? 'badge-info' : 'badge-primary'}">${sem.type === 'online' ? 'Online · Google Meet' : 'Yüz Yüze Uygulamalı'}</span>
                        <span class="badge badge-brass">${Store.formatTRY(sem.price)}</span>
                      </div>
                    </div>
                    <div class="seminar-card-body">
                      <h3 class="seminar-card-title">${esc(sem.title)}</h3>
                      <p class="seminar-card-desc">${esc(sem.shortDesc)}</p>
                      <div class="seminar-meta-grid">
                        <div class="seminar-meta-item">${Icons.calendar} <span>${esc(sem.dateText)}</span></div>
                        <div class="seminar-meta-item">${Icons.mapPin} <span>${esc(sem.location)}</span></div>
                        <div class="seminar-meta-item">${Icons.users} <span>Kalan Kontenjan: ${remaining} kişi</span></div>
                        <div class="seminar-meta-item">${Icons.shield} <span>Sertifikalı Hekim Eğitimi</span></div>
                      </div>
                    </div>
                    <div class="seminar-card-footer">
                      <span class="text-muted">${esc(sem.timeText)}</span>
                      <a href="#/seminer/${esc(sem.slug)}" class="btn btn-primary">Detay &amp; Kayıt Ol ${Icons.arrowRight}</a>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </div>
        </section>

        <section class="public-section" style="background:var(--bg-surface); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
          <div class="public-container">
            <div class="public-section-head">
              <div>
                <span class="badge badge-brass" style="margin-bottom:8px;">Sosyal Medya &amp; Bilimsel Yayınlar</span>
                <h2>Instagram, Facebook &amp; Web Yayınları</h2>
              </div>
              <div class="row-gap">
                <a href="${esc(s.instagramUrl)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">${Icons.instagram} Instagram’da Takip Et</a>
                <a href="${esc(s.facebookUrl)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">${Icons.facebook} Facebook Sayfası</a>
              </div>
            </div>

            <div class="social-grid">
              ${st.socialPosts.map((post) => `
                <article class="social-card">
                  <div class="row-between">
                    <span class="badge ${post.platform === 'Instagram' ? 'badge-brass' : post.platform === 'Facebook' ? 'badge-info' : 'badge-primary'}">
                      ${post.platform === 'Instagram' ? Icons.instagram : post.platform === 'Facebook' ? Icons.facebook : Icons.globe}
                      ${esc(post.platform)}
                    </span>
                    <span class="text-muted">${esc(post.date)}</span>
                  </div>
                  <h3 style="font-size:1rem;">${esc(post.title)}</h3>
                  <p class="text-muted" style="line-height:1.55;">${esc(post.excerpt)}</p>
                  <div style="margin-top:auto; padding-top:8px;">
                    <a href="${esc(post.url)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="width:100%;">Yayına Git ${Icons.externalLink}</a>
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
        </section>

        ${renderPublicFooter()}
      </div>
    `;
  }

  /* ========================================================================
     2. SEMİNER KAYIT & ÖDEME SAYFASI (#/seminer/:slug)
     ======================================================================== */
  function renderSeminarRegister(slug) {
    const st = Store.get();
    const s = st.settings;
    const sem = st.seminars.find((x) => x.slug === slug) || st.seminars[0];

    if (!sem) {
      return `<div class="public-shell">${renderPublicNav('')}<div class="public-section public-container empty-state"><h2>Seminer bulunamadı</h2><a href="#/site" class="btn btn-primary" style="margin-top:12px;">Tüm Eğitimlere Dön</a></div>${renderPublicFooter()}</div>`;
    }

    if (pubState.activeSeminarSlug !== sem.slug) {
      pubState.activeSeminarSlug = sem.slug;
      pubState.regStep = 1;
      pubState.regDraft = null;
      pubState.confirmedParticipant = null;
    }

    const regs = st.participants.filter((p) => p.seminarId === sem.id).length;
    const remaining = Math.max(0, sem.capacity - regs);

    let rightPanelHtml = '';
    if (pubState.regStep === 1) {
      const d = pubState.regDraft || {};
      rightPanelHtml = `
        <form id="public-register-form" class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Hekim Kayıt Formu</h2>
              <p class="card-subtitle">Kayıt bilgileriniz anında eğitim koordinasyon paneline iletilir</p>
            </div>
            <span class="badge badge-primary">Adım 1 / 2</span>
          </div>
          <div class="card-body stack-md">
            <div class="form-group">
              <label class="form-label" for="reg-fullname">Ad Soyad <span class="req">*</span></label>
              <input id="reg-fullname" class="form-input" required value="${esc(d.fullName || '')}" placeholder="Örn: Ahmet Yılmaz" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="reg-title">Unvan <span class="req">*</span></label>
                <select id="reg-title" class="form-select" required>
                  ${['Dr.', 'Uzm. Dr.', 'Op. Dr.', 'Doç. Dr.', 'Prof. Dr.'].map((t) => `<option value="${t}" ${d.title === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-spec">Branş <span class="req">*</span></label>
                <select id="reg-spec" class="form-select" required>
                  ${AppData.SPECIALTIES.map((sp) => `<option value="${esc(sp.short)}" ${d.specialty === sp.short ? 'selected' : ''}>${esc(sp.short)}</option>`).join('')}
                  <option value="Diğer" ${d.specialty === 'Diğer' ? 'selected' : ''}>Diğer Tıp Branşı</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-clinic">Klinik / Hastane</label>
              <input id="reg-clinic" class="form-input" value="${esc(d.clinic || '')}" placeholder="Örn: Özel Muayenehane veya Hastane Adı" />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">E-posta <span class="req">*</span></label>
              <input id="reg-email" class="form-input" type="email" required value="${esc(d.email || '')}" placeholder="doktor@klinik.com" />
              <span class="form-hint">Giriş bilgileri ve sertifika buraya gönderilecek.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-phone">Telefon <span class="req">*</span></label>
              <input id="reg-phone" class="form-input" type="tel" required value="${esc(d.phone || '')}" placeholder="+90 (5XX) XXX XX XX" />
              <span class="form-hint">WhatsApp bilgilendirmesi olarak da kullanacağız.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-city">Şehir <span class="req">*</span></label>
              <select id="reg-city" class="form-select" required>
                <option value="">Şehir seçiniz...</option>
                ${AppData.PROVINCES_81.map((p) => `<option value="${esc(p.name)}" ${d.city === p.name ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
              </select>
            </div>

            <label class="checkbox-label">
              <input type="checkbox" id="reg-kvkk" required checked />
              <span>Kişisel verilerimin işlenmesini ve eğitim bilgilendirmesi amaçlı iletişim kurulmasını kabul ediyorum. <a href="#" data-action="open-kvkk-modal">KVKK Aydınlatma Metni</a></span>
            </label>

            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">Ödeme adımına geç ${Icons.arrowRight}</button>
          </div>
        </form>
      `;
    } else if (pubState.regStep === 2) {
      const d = pubState.regDraft;
      rightPanelHtml = `
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Ödeme &amp; Kayıt Tamamlama</h2>
              <p class="card-subtitle">${esc(d.title)} ${esc(d.fullName)} · ${esc(sem.title)}</p>
            </div>
            <span class="badge badge-brass">Adım 2 / 2</span>
          </div>
          <div class="card-body stack-md">
            <div class="seminar-meta-grid" style="grid-template-columns:1fr;">
              <div class="row-between">
                <span>Eğitim Katılım Ücreti</span>
                <strong style="font-size:1.15rem; color:var(--primary);">${Store.formatTRY(sem.price)}</strong>
              </div>
            </div>

            <div class="stack-sm">
              <strong style="font-size:0.9rem;">Seçenek 1: Online Kredi Kartı (Anında Onay &amp; Şifre)</strong>
              <p class="text-muted">Ödeme onaylandığında Google Meet giriş kullanıcı adınız ve şifreniz anında oluşturulur. (${esc(s.paymentGateway)})</p>
              <button class="btn btn-primary btn-lg" style="width:100%;" data-action="complete-registration" data-method="card">
                ${Icons.creditCard} Online Ödemeyi Tamamla (${Store.formatTRY(sem.price)})
              </button>
            </div>

            <div style="border-top:1px solid var(--border-subtle); padding-top:14px;" class="stack-sm">
              <strong style="font-size:0.9rem;">Seçenek 2: Havale / EFT ile Ön Kayıt</strong>
              <div style="background:var(--bg-surface-subtle); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; font-size:0.83rem;" class="stack-sm">
                <div><strong>Alıcı:</strong> ${esc(s.companyName)}</div>
                <div><strong>Banka:</strong> ${esc(s.bankName)}</div>
                <div><strong>IBAN:</strong> <code>${esc(s.iban)}</code></div>
                <div class="text-muted">Açıklama kısmına adınızı ve seminer adını yazınız. Onay sonrası şifreniz WhatsApp’tan gönderilir.</div>
              </div>
              <button class="btn btn-secondary" style="width:100%;" data-action="complete-registration" data-method="iban">
                Havale / EFT ile Kaydı Oluştur
              </button>
            </div>

            <button class="btn btn-ghost btn-sm" data-action="reg-back-step1">${Icons.chevronLeft} Form Bilgilerine Dön</button>
          </div>
        </div>
      `;
    } else if (pubState.regStep === 3 && pubState.confirmedParticipant) {
      const p = pubState.confirmedParticipant;
      rightPanelHtml = `
        <div class="card">
          <div class="card-header" style="background:var(--status-success-soft);">
            <div>
              <h2 class="card-title" style="color:var(--status-success);">${Icons.check} Kaydınız Başarıyla Alındı!</h2>
              <p class="card-subtitle">${esc(p.title)} ${esc(p.fullName)}, kaydınız yönetim paneline anlık olarak işlendi.</p>
            </div>
          </div>
          <div class="card-body stack-md">
            ${p.paymentStatus === 'paid' ? `
              <div style="background:var(--primary-soft); border:1px solid rgba(15,61,62,0.2); border-radius:var(--radius-md); padding:16px;" class="stack-sm">
                <strong style="color:var(--primary);">Size Özel Online Eğitim Giriş Bilgileri</strong>
                <div class="row-between"><span>Kullanıcı Kodu:</span> <strong style="font-size:1.05rem;"><code>${esc(p.accessUser)}</code></strong></div>
                <div class="row-between"><span>Erişim Şifresi:</span> <strong style="font-size:1.05rem;"><code>${esc(p.accessPass)}</code></strong></div>
                <p class="text-muted">Bu bilgilerle Online Eğitim Odası’na giriş yapıp Op. Dr. Hasan Doğan’ın Google Meet canlı yayınına ve slayt sunumuna bağlanabilirsiniz.</p>
              </div>
              <a href="#/canli-giris" class="btn btn-primary btn-lg" style="width:100%;">${Icons.video} Online Eğitim Odasına Git</a>
            ` : `
              <div style="background:var(--status-warn-soft); border-radius:var(--radius-md); padding:16px;" class="stack-sm">
                <strong style="color:var(--status-warn);">Ön Kaydınız Oluşturuldu (Havale / EFT Onayı Bekleniyor)</strong>
                <p class="text-muted">Ödemeniz onaylandığında Eğitim Koordinatörümüz ${esc(s.coordinatorName)} tarafından giriş şifreniz WhatsApp üzerinden iletilecektir.</p>
              </div>
            `}
            <div class="row-between">
              <a href="#/site" class="btn btn-secondary btn-sm">Tüm Eğitimlere Dön</a>
              <a href="#/katilimcilar" class="btn btn-ghost btn-sm">Panelde Kaydı Gör →</a>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="public-shell">
        ${renderPublicNav('home')}

        <section class="public-section" style="padding-top:30px;">
          <div class="public-container">
            <div style="margin-bottom:16px;">
              <a href="#/site" class="btn btn-ghost btn-sm">${Icons.chevronLeft} Tüm Seminerlere Dön</a>
            </div>

            <div class="register-grid">
              <div class="stack-md">
                <div class="card" style="overflow:hidden;">
                  <div class="seminar-card-cover" style="height:260px;">
                    <img src="${esc(sem.coverImage || 'assets/proloterapi-cover.jpg')}" alt="${esc(sem.title)}" />
                    <div class="seminar-cover-badges">
                      <span class="badge ${sem.type === 'online' ? 'badge-info' : 'badge-primary'}">${sem.type === 'online' ? 'Online · Google Meet' : 'Yüz Yüze Uygulamalı'}</span>
                      <span class="badge badge-brass">${Store.formatTRY(sem.price)}</span>
                    </div>
                  </div>
                  <div class="card-body stack-md">
                    <div>
                      <h1 style="font-size:1.65rem; margin-bottom:8px;">${esc(sem.title)}</h1>
                      <p style="color:var(--ink-secondary);">${esc(sem.shortDesc)}</p>
                    </div>

                    <div class="seminar-meta-grid">
                      <div class="seminar-meta-item">${Icons.calendar} <span><strong>Tarih:</strong> ${esc(sem.dateText)}</span></div>
                      <div class="seminar-meta-item">${Icons.mapPin} <span><strong>Konum:</strong> ${esc(sem.location)}</span></div>
                      <div class="seminar-meta-item">${Icons.users} <span><strong>Kontenjan:</strong> ${remaining} / ${sem.capacity} müsait</span></div>
                      <div class="seminar-meta-item">${Icons.phone} <span><strong>Koordinatör:</strong> ${esc(s.coordinatorPhone)}</span></div>
                    </div>

                    <div style="white-space:pre-line; font-size:0.9rem; color:var(--ink-secondary); line-height:1.65;">
                      ${esc(sem.detailedDesc)}
                    </div>
                  </div>
                </div>

                <div class="card">
                  <div class="card-body stack-sm">
                    <div class="row-between">
                      <div class="row-gap" style="gap:14px;">
                        <img class="doctor-portrait-card" src="assets/hasan-dogan.jpg" alt="${esc(s.doctorName)}" />
                        <div>
                          <h3 style="font-size:1.05rem;">Eğitmen: ${esc(s.doctorName)}</h3>
                          <p class="text-muted">${esc(s.doctorTitle)}</p>
                        </div>
                      </div>
                      <span class="badge badge-primary">Resmi Eğitim Portalı</span>
                    </div>
                    <p class="text-muted">Hekimimiz ve Bilimsel Proloterapi Derneği hakkında daha fazla bilgi, makale ve yayınlar için resmi kanallarımızı ziyaret edebilirsiniz:</p>
                    <div class="row-gap">
                      <a href="${esc(s.websitePrimary)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">${Icons.globe} drhasandogan.com</a>
                      <a href="${esc(s.websiteSecondary)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">${Icons.globe} proloterapi.com.tr</a>
                      <a href="${esc(s.instagramUrl)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">${Icons.instagram} Instagram</a>
                      <a href="${esc(s.facebookUrl)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">${Icons.facebook} Facebook</a>
                    </div>
                  </div>
                </div>
              </div>

              <div>${rightPanelHtml}</div>
            </div>
          </div>
        </section>

        ${renderPublicFooter()}
      </div>
    `;
  }

  /* ========================================================================
     3. ŞİFRELİ ONLINE EĞİTİM ODASI (GOOGLE MEET + SLAYT TAKİP) (#/canli-giris)
     ======================================================================== */
  function renderOnlineClassroom() {
    const st = Store.get();
    const s = st.settings;
    const part = pubState.loggedInParticipant;

    if (!part) {
      return `
        <div class="public-shell">
          ${renderPublicNav('classroom')}

          <section class="public-section">
            <div class="public-container" style="max-width:490px;">
              <div class="card">
                <div class="card-header">
                  <div>
                    <h1 class="card-title" style="font-size:1.25rem;">Online Seminer Katılımcı Girişi</h1>
                    <p class="card-subtitle">Ödeme sonrası tarafınıza iletilen kullanıcı kodu ve şifre ile Google Meet canlı eğitimine bağlanın</p>
                  </div>
                </div>
                <form id="classroom-login-form" class="card-body stack-md">
                  <div class="form-group">
                    <label class="form-label" for="cls-user">Kullanıcı Kodu veya E-posta</label>
                    <input id="cls-user" class="form-input" required placeholder="Örn: DR-2026" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="cls-pass">Erişim Şifresi</label>
                    <input id="cls-pass" class="form-input" type="password" required placeholder="Örn: PROLO2026" />
                  </div>
                  <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">${Icons.video} Eğitim Odasına Giriş Yap</button>

                  <div style="background:var(--bg-surface-subtle); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px; font-size:0.81rem;" class="stack-sm">
                    <strong>Demo Test Girişi (Örnek Onaylı Hekim):</strong>
                    <div class="row-between">
                      <span>Kod: <code>DR-2026</code> · Şifre: <code>PROLO2026</code></span>
                      <button type="button" class="btn btn-secondary btn-sm" data-action="fill-demo-classroom">Tek Tıkla Gir</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </section>

          ${renderPublicFooter()}
        </div>
      `;
    }

    const sem = st.seminars.find((x) => x.id === part.seminarId) || st.seminars.find((x) => x.type === 'online') || st.seminars[0];
    const meetLink = (sem && sem.meetUrl) || s.googleMeetDefaultUrl;
    const slides = AppData.SAMPLE_SLIDES;
    const idx = Math.max(0, Math.min(slides.length - 1, pubState.currentSlideIndex));
    const slide = slides[idx];

    return `
      <div class="public-shell">
        ${renderPublicNav('classroom')}

        <section class="public-section" style="padding-top:28px;">
          <div class="public-container stack-md">
            <div class="welcome-banner">
              <div class="welcome-profile">
                <img class="doctor-portrait-ring" src="assets/hasan-dogan.jpg" alt="${esc(s.doctorName)}" />
                <div>
                  <span class="badge badge-brass" style="margin-bottom:8px;">Doğrulanmış Katılımcı: ${esc(part.title)} ${esc(part.fullName)}</span>
                  <h1 style="font-size:1.75rem;">${esc(sem ? sem.title : 'Online Proloterapi Semineri')}</h1>
                  <p>Op. Dr. Hasan Doğan’ın Google Meet canlı yayınına tek tıkla katılabilir, eş zamanlı ekran paylaşımı ve sunum slaytlarını aşağıdan takip edebilirsiniz.</p>
                </div>
              </div>
              <div class="welcome-actions">
                <a href="${esc(meetLink)}" target="_blank" rel="noopener" class="btn btn-on-dark btn-lg">${Icons.video} Google Meet Canlı Yayınına Katıl</a>
                <button class="btn btn-on-dark-outline" data-action="classroom-logout">Çıkış Yap</button>
              </div>
            </div>

            <div class="classroom-grid">
              <div class="card">
                <div class="card-header">
                  <div>
                    <h2 class="card-title">Sunum Slayt Takibi — ${esc(sem ? sem.slideDeckName || 'Eğitim Sunumu' : 'Sunum')}</h2>
                    <p class="card-subtitle">Bölüm: ${esc(slide.section)} · Slayt ${slide.num} / ${slides.length} (Örnek Önizleme)</p>
                  </div>
                  <div class="row-gap">
                    <button class="btn btn-secondary btn-sm" data-action="slide-prev" ${idx === 0 ? 'disabled' : ''}>${Icons.chevronLeft} Önceki</button>
                    <button class="btn btn-secondary btn-sm" data-action="slide-next" ${idx === slides.length - 1 ? 'disabled' : ''}>Sonraki ${Icons.chevronRight}</button>
                  </div>
                </div>
                <div class="card-body">
                  <div class="slide-stage">
                    <div>
                      <span class="badge badge-brass" style="margin-bottom:14px;">${esc(slide.section)}</span>
                      <h2>${esc(slide.title)}</h2>
                      <ul class="slide-bullets">
                        ${slide.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}
                      </ul>
                    </div>
                    <div class="row-between" style="padding-top:20px; border-top:1px solid rgba(255,255,255,0.14); font-size:0.8rem; color:rgba(255,255,255,0.72);">
                      <span>${esc(s.doctorName)} · ${esc(s.doctorTitle)}</span>
                      <span>Slayt ${idx + 1} / ${slides.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="stack-md">
                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">Canlı Oturum Bilgileri</h3>
                  </div>
                  <div class="card-body stack-sm" style="font-size:0.86rem;">
                    <div class="row-between"><span class="text-muted">Tarih &amp; Saat</span><strong>${esc(sem ? sem.dateText + ' · ' + sem.timeText : '')}</strong></div>
                    <div class="row-between"><span class="text-muted">Platform</span><strong>Google Meet (Ekran Paylaşımlı)</strong></div>
                    <div class="row-between"><span class="text-muted">Giriş Kodunuz</span><code>${esc(part.accessUser)}</code></div>
                    <a href="${esc(meetLink)}" target="_blank" rel="noopener" class="btn btn-primary" style="width:100%; margin-top:6px;">${Icons.externalLink} Google Meet Odasını Aç</a>
                  </div>
                </div>

                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">Hekim Ders Notlarım</h3>
                  </div>
                  <div class="card-body stack-sm">
                    <textarea id="classroom-notes-input" class="form-textarea" rows="5" placeholder="Eğitim sırasında klinik notlarınızı buraya alabilirsiniz...">${esc(pubState.classroomNote)}</textarea>
                    <span class="form-hint">Notlarınız bu tarayıcıda saklanır.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        ${renderPublicFooter()}
      </div>
    `;
  }

  return {
    pubState,
    renderPublicHome,
    renderSeminarRegister,
    renderOnlineClassroom
  };
})();
