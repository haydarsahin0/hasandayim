/* ==========================================================================
   Motion & Micro-Interaction Choreography Engine
   - Staggered route & scroll-triggered reveals (IntersectionObserver)
   - Smooth ease-out KPI & currency count-up animations
   - Animated progress bar fills
   - Tactile cursor-tracking glass spotlight (--mx, --my)
   - Public portal top scroll progress bar
   ========================================================================== */

window.Motion = (function () {
  let revealObserver = null;
  let pointerBound = false;
  let scrollBound = false;

  const prefersReduced = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function parseNumericDisplay(text) {
    const raw = (text || '').trim();
    // Matches Turkish currency e.g. ₺29.500 or plain integers e.g. 10 or years 1988
    const hasCurrency = raw.includes('₺');
    const digitsOnly = raw.replace(/[^\d]/g, '');
    if (!digitsOnly) return null;
    const value = parseInt(digitsOnly, 10);
    if (Number.isNaN(value)) return null;
    // Detect suffix like " Kitap" or "+ Yayın"
    const suffixMatch = raw.match(/(\+?\s*[A-Za-zÇĞİÖŞÜçğıöşü]+.*)$/);
    const suffix = !hasCurrency && suffixMatch ? suffixMatch[1] : '';
    return { value, hasCurrency, suffix, raw };
  }

  function animateCounter(el, duration = 760) {
    if (prefersReduced()) return;
    const parsed = parseNumericDisplay(el.textContent);
    if (!parsed || parsed.value === 0) return;

    const start = performance.now();
    const target = parsed.value;
    const startVal = target > 1900 && target < 2100 ? target - 18 : 0;

    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(startVal + (target - startVal) * eased);

      if (parsed.hasCurrency) {
        el.textContent = new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          maximumFractionDigits: 0
        }).format(current);
      } else if (parsed.suffix) {
        el.textContent = `${current}${parsed.suffix}`;
      } else {
        el.textContent = String(current);
      }

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = parsed.raw;
      }
    }

    requestAnimationFrame(tick);
  }

  function animateProgressBars() {
    if (prefersReduced()) return;
    const bars = document.querySelectorAll('.progress-fill');
    bars.forEach((bar, idx) => {
      const targetWidth = bar.style.width;
      if (!targetWidth || targetWidth === '0%') return;
      bar.style.transition = 'none';
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        setTimeout(() => {
          bar.style.transition = 'width 720ms cubic-bezier(0.22, 1, 0.36, 1)';
          bar.style.width = targetWidth;
        }, 60 + idx * 55);
      });
    });
  }

  function setupReveals(isRouteChange) {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }

    if (prefersReduced()) return;

    // Immediate staggered mount groups (above the fold)
    const immediateGroups = [
      '.kpi-grid .kpi-card',
      '.clinical-focus-grid .clinical-focus-item',
      '.mini-seminar-list .mini-seminar-item',
      '.activity-list .activity-item',
      '.data-table tbody tr'
    ];

    if (isRouteChange) {
      immediateGroups.forEach((sel) => {
        const nodes = document.querySelectorAll(sel);
        nodes.forEach((node, idx) => {
          if (idx > 14) return;
          node.classList.add('m-stagger-in');
          node.style.animationDelay = `${Math.min(idx * 55, 420)}ms`;
        });
      });
    }

    // Scroll-triggered reveals for sections, seminar cards, social cards & biography items
    const scrollTargets = document.querySelectorAll(
      '.public-section .seminar-card, .public-section .social-card, .bio-grid .card, .bio-timeline-item, .bio-stat-box, .public-section-head'
    );

    if (!scrollTargets.length) return;

    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      );

      scrollTargets.forEach((el, idx) => {
        el.classList.add('scroll-reveal');
        el.style.transitionDelay = `${(idx % 4) * 70}ms`;
        revealObserver.observe(el);
      });
    }
  }

  function bindPointerSpotlight() {
    if (pointerBound || prefersReduced()) return;
    pointerBound = true;

    document.addEventListener(
      'pointermove',
      (e) => {
        const card = e.target.closest(
          '.kpi-card, .seminar-card, .social-card, .public-hero-card, .welcome-banner'
        );
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', `${x.toFixed(1)}%`);
        card.style.setProperty('--my', `${y.toFixed(1)}%`);
      },
      { passive: true }
    );
  }

  function bindScrollProgress() {
    if (scrollBound) return;
    scrollBound = true;

    window.addEventListener(
      'scroll',
      () => {
        const bar = document.getElementById('scroll-progress');
        if (!bar) return;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)) : 0;
        bar.style.transform = `scaleX(${pct / 100})`;
      },
      { passive: true }
    );
  }

  function enhance(options = {}) {
    const isRouteChange = options.isRouteChange !== false;
    bindPointerSpotlight();
    bindScrollProgress();
    setupReveals(isRouteChange);

    if (isRouteChange) {
      document.querySelectorAll('.kpi-value').forEach((el, idx) => {
        setTimeout(() => animateCounter(el, 740 + idx * 80), idx * 50);
      });
      animateProgressBars();
    }

    // Pop-in animation for WhatsApp bubble & slide stage
    const waBubble = document.querySelector('.wa-bubble');
    if (waBubble) {
      waBubble.classList.remove('wa-pop');
      void waBubble.offsetWidth;
      waBubble.classList.add('wa-pop');
    }

    const slideStage = document.querySelector('.slide-stage');
    if (slideStage) {
      slideStage.classList.remove('slide-glide');
      void slideStage.offsetWidth;
      slideStage.classList.add('slide-glide');
    }
  }

  return { enhance, animateCounter };
})();
