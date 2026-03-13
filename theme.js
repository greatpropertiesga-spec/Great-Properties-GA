// ═══════════════════════════════════════════════════════════════
// GREAT PROPERTIES GA — THEME ENGINE v3
// Cache-first: aplica TODO desde localStorage en <1ms.
// Luego refresca desde Supabase y actualiza el cache.
// ═══════════════════════════════════════════════════════════════

(async function GPGA_THEME() {
  // ── MIGRATE: delete old cache keys so old brand color doesn't show ──
  try {
    ['gpga_theme_v2', 'gpga_theme', 'gpga_settings'].forEach(function(k){
      localStorage.removeItem(k);
    });
  } catch(e) {}

  const SB_URL = 'https://cqwvnvcjxbeskvyqrank.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxd3ZudmNqeGJlc2t2eXFyYW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjg5OTMsImV4cCI6MjA4ODYwNDk5M30.pavJBT9fpyoKPH9zbn-9pcUY72gaOB6qL76QMCtFoWw';
  const H = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY };
  const CACHE_KEY = 'gpga_theme_v3';

  // ── DEFAULTS ─────────────────────────────────────────────────
  const DEFAULTS = {
    brand_color:          '#1a3a5c',
    brand_color_2:        '#0f2340',
    bg_color:             '#ffffff',
    bg_color_2:           '#f7f5f2',
    text_color:           '#1a1410',
    font_display:         'Cormorant Garamond',
    font_body:            'DM Sans',
    logo_text:            'Great Properties GA',
    logo_tagline:         'Serious About Buying. Serious About Closing.',
    logo_url:             '',
    site_phone:           '404-590-1613',
    site_email:           'info@greatpropertiesga.com',
    hero_title:           'Need to sell quickly?\nWe can help.',
    hero_subtitle:        'Great Properties GA buys houses, condos, land, and commercial properties across all of Georgia — fast, fair, and hassle-free.',
    hero_cta_text:        'Get Your Cash Offer →',
    hero_cta_url:         'sell.html',
    hero_image_url:       '',
    footer_text:          "Georgia's trusted real estate investment company. We buy, renovate, and sell properties across all of Georgia.",
    footer_slogan:        'Serious About Buying. Serious About Closing.',
    meta_title:           'Great Properties GA, LLC — Georgia Real Estate',
    meta_description:     'Great Properties GA buys houses fast across Georgia. Cash offers within 24 hours. Any condition, any city.',
    section_hero:         'true',
    section_how_it_works: 'true',
    section_properties:   'true',
    section_testimonials: 'true',
    section_about_band:   'true',
  };

  // ── STEP 1: APPLY FROM CACHE INSTANTLY (0ms — before paint) ──
  let s = { ...DEFAULTS };
  let hasCached = false;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      // Merge cache over defaults
      Object.keys(cached).forEach(function(k){ if (cached[k] !== null && cached[k] !== '') s[k] = cached[k]; });
      hasCached = true;
    }
  } catch(e) {}

  // Apply visual settings immediately from cache (no flash ever)
  applyCSS(s);
  applyLogo(s);
  applyText(s);
  applyMeta(s);
  applySections(s);

  // ── EXPOSE GLOBALLY EARLY — so pages don't wait on network ──
  window.GPGA = { settings: s, SB_URL, SB_KEY, H };

  // ── STEP 2: FETCH FRESH FROM SUPABASE ────────────────────────
  try {
    const r = await fetch(SB_URL + '/rest/v1/site_settings?select=key,value', { headers: H });
    if (r.ok) {
      const rows = await r.json();
      // Start fresh from defaults, overlay Supabase values
      const fresh = { ...DEFAULTS };
      rows.forEach(function(row) {
        if (row.value !== null && row.value !== '') fresh[row.key] = row.value;
      });
      // Save to cache
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(fresh)); } catch(e) {}
      // Apply if anything changed
      applyCSS(fresh);
      applyLogo(fresh);
      applyText(fresh);
      applyMeta(fresh);
      applySections(fresh);
      s = fresh;
      // Update global with fresh settings
      window.GPGA = { settings: s, SB_URL, SB_KEY, H };
    }
  } catch(e) { /* use cache */ }

  // ── LOAD GOOGLE FONTS ────────────────────────────────────────
  const fontMap = {
    'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400',
    'Playfair Display':   'Playfair+Display:ital,wght@0,400;0,700;0,900;1,400',
    'Libre Baskerville':  'Libre+Baskerville:ital,wght@0,400;0,700;1,400',
    'EB Garamond':        'EB+Garamond:ital,wght@0,400;0,500;0,700;1,400',
    'Merriweather':       'Merriweather:ital,wght@0,300;0,400;0,700;1,400',
    'DM Sans':            'DM+Sans:wght@300;400;500;600;700',
    'Outfit':             'Outfit:wght@300;400;500;600;700',
    'Jost':               'Jost:wght@300;400;500;600;700',
    'Raleway':            'Raleway:wght@300;400;500;600;700',
    'Lato':               'Lato:ital,wght@0,300;0,400;0,700;1,400',
    'Montserrat':         'Montserrat:wght@300;400;500;600;700',
    'Open Sans':          'Open+Sans:wght@300;400;500;600;700',
  };
  const df = s.font_display || 'Cormorant Garamond';
  const bf = s.font_body    || 'DM Sans';
  const dq = fontMap[df] || (df.replace(/ /g,'+') + ':wght@400;700');
  const bq = fontMap[bf] || (bf.replace(/ /g,'+') + ':wght@300;400;500;600');
  if (df !== bf) {
    const lnk = document.createElement('link');
    lnk.rel = 'stylesheet';
    lnk.href = 'https://fonts.googleapis.com/css2?family=' + dq + '&family=' + bq + '&display=swap';
    document.head.appendChild(lnk);
  } else {
    const lnk = document.createElement('link');
    lnk.rel = 'stylesheet';
    lnk.href = 'https://fonts.googleapis.com/css2?family=' + dq + '&display=swap';
    document.head.appendChild(lnk);
  }

  // ── FORMS → SUPABASE ─────────────────────────────────────────
  document.querySelectorAll('.gpga-form').forEach(function(form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const msg = form.querySelector('.gpga-form-msg');
      const orig = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';
      const data = {
        name:    (form.querySelector('[name=name]')   ||{}).value || null,
        email:   (form.querySelector('[name=email]')  ||{}).value || null,
        phone:   (form.querySelector('[name=phone]')  ||{}).value || null,
        zip:     (form.querySelector('[name=zip]')    ||{}).value || null,
        address: (form.querySelector('[name=address]')||{}).value || null,
        message: (form.querySelector('[name=message]')||{}).value || null,
        source:  form.dataset.source || window.location.pathname.split('/').pop() || 'website'
      };
      try {
        const r = await fetch(SB_URL + '/rest/v1/leads', {
          method: 'POST',
          headers: { ...H, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify(data)
        });
        if (!r.ok) throw new Error();
        if (msg) { msg.className='gpga-form-msg success'; msg.textContent='✓ Thank you! We will contact you within 24 hours.'; }
        form.reset();
        gpgaToast('Message sent! We will contact you shortly.');
      } catch(err) {
        if (msg) { msg.className='gpga-form-msg error'; msg.textContent='Something went wrong. Please call us directly.'; }
      }
      btn.disabled = false; btn.textContent = orig;
    });
  });

  // ── UTILITIES ─────────────────────────────────────────────────
  window.gpgaToast = function(msg, type) {
    let t = document.getElementById('gpga-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'gpga-toast';
      t.style.cssText = 'position:fixed;bottom:28px;right:28px;background:var(--brand);color:#000;padding:14px 22px;border-radius:4px;font-weight:600;font-size:13px;z-index:9999;transform:translateY(100px);opacity:0;transition:all .3s cubic-bezier(.34,1.56,.64,1);font-family:var(--font-body);letter-spacing:.3px;box-shadow:0 8px 32px rgba(0,0,0,.2)';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = type === 'err' ? '#c62828' : 'var(--brand)';
    t.style.color = type === 'err' ? '#fff' : '#000';
    requestAnimationFrame(function() {
      t.style.transform = 'translateY(0)'; t.style.opacity = '1';
      setTimeout(function() { t.style.transform='translateY(100px)'; t.style.opacity='0'; }, 3500);
    });
  };

  // FAQ accordion
  document.addEventListener('click', function(e) {
    const q = e.target.closest('.gpga-faq-q');
    if (!q) return;
    const item = q.closest('.gpga-faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.gpga-faq-item.open').forEach(function(i) { i.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
  });

  // Footer year
  document.querySelectorAll('.gpga-year').forEach(function(el) { el.textContent = new Date().getFullYear(); });

  // Scroll animations
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { entry.target.classList.add('gpga-visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.gpga-animate').forEach(function(el) { obs.observe(el); });
  } else {
    document.querySelectorAll('.gpga-animate').forEach(function(el) { el.classList.add('gpga-visible'); });
  }

  // ════════════════════════════════════════════════════════════
  // APPLY FUNCTIONS — called twice: once from cache, once from DB
  // ════════════════════════════════════════════════════════════

  function hexToRgb(hex) {
    hex = (hex||'').replace('#','');
    if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
    const n = parseInt(hex, 16);
    return [(n>>16)&255, (n>>8)&255, n&255];
  }
  function darken(hex, pct) {
    try { const [r,g,b]=hexToRgb(hex); const f=1-pct/100; return '#'+[r,g,b].map(c=>Math.max(0,Math.round(c*f)).toString(16).padStart(2,'0')).join(''); } catch(e){return hex;}
  }
  function lighten(hex, pct) {
    try { const [r,g,b]=hexToRgb(hex); return '#'+[r,g,b].map(c=>Math.min(255,Math.round(c+(255-c)*pct/100)).toString(16).padStart(2,'0')).join(''); } catch(e){return hex;}
  }

  function applyCSS(cfg) {
    const root = document.documentElement;
    const brand  = cfg.brand_color   || '#c9a84c';
    const brand2 = cfg.brand_color_2 || '#0a0a0a';
    const bg     = cfg.bg_color      || '#ffffff';
    const bg2    = cfg.bg_color_2    || '#f7f5f2';
    const txt    = cfg.text_color    || '#1a1410';
    const df     = cfg.font_display  || 'Cormorant Garamond';
    const bf     = cfg.font_body     || 'DM Sans';

    root.style.setProperty('--brand',        brand);
    root.style.setProperty('--brand-dark',   darken(brand, 20));
    root.style.setProperty('--brand-light',  lighten(brand, 60));
    root.style.setProperty('--brand-rgb',    hexToRgb(brand).join(','));
    root.style.setProperty('--brand2',       brand2);
    root.style.setProperty('--bg',           bg);
    root.style.setProperty('--bg-2',         bg2);
    root.style.setProperty('--bg-3',         darken(bg2, 5));
    root.style.setProperty('--surface',      bg === '#ffffff' ? '#fdfcfa' : lighten(bg, 3));
    root.style.setProperty('--text',         txt);
    root.style.setProperty('--text-2',       lighten(txt, 40));
    root.style.setProperty('--text-3',       lighten(txt, 60));
    root.style.setProperty('--white',        txt);
    root.style.setProperty('--font-display', "'" + df + "', Georgia, serif");
    root.style.setProperty('--font-body',    "'" + bf + "', system-ui, sans-serif");
  }

  function applyLogo(cfg) {
    const logoUrl  = cfg.logo_url  || '';
    const logoText = cfg.logo_text || '';
    const tagline  = cfg.logo_tagline || '';

    document.querySelectorAll('.gpga-logo-icon').forEach(function(el) {
      const emoji = el.querySelector('.gpga-logo-emoji');
      if (logoUrl) {
        if (emoji) emoji.style.display = 'none';
        let img = el.querySelector('.gpga-logo-img');
        if (!img) {
          img = document.createElement('img');
          img.className = 'gpga-logo-img';
          img.style.cssText = 'height:48px;width:auto;max-width:180px;object-fit:contain;display:block';
          img.onerror = function() { img.style.display='none'; if(emoji) emoji.style.display=''; };
          el.appendChild(img);
        }
        if (img.src !== logoUrl) img.src = logoUrl;
      } else {
        if (emoji) emoji.style.display = '';
        const img = el.querySelector('.gpga-logo-img');
        if (img) img.style.display = 'none';
      }
    });

    if (logoText) {
      document.querySelectorAll('.gpga-logo-name').forEach(function(el) { el.textContent = logoText; });
      document.querySelectorAll('.gpga-footer-name').forEach(function(el) { el.textContent = logoText; });
    }
    if (tagline) {
      document.querySelectorAll('.gpga-logo-tag').forEach(function(el) { el.textContent = tagline; });
    }
  }

  function applyText(cfg) {
    // Phone
    if (cfg.site_phone) {
      const clean = cfg.site_phone.replace(/\D/g,'');
      document.querySelectorAll('a[href^="tel:"]').forEach(function(el) { el.href = 'tel:' + clean; });
      document.querySelectorAll('.gpga-phone').forEach(function(el) { el.textContent = cfg.site_phone; });
    }
    // Email
    if (cfg.site_email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function(el) { el.href = 'mailto:' + cfg.site_email; });
      document.querySelectorAll('.gpga-email').forEach(function(el) { el.textContent = cfg.site_email; });
    }
    // Hero
    if (cfg.hero_title) {
      document.querySelectorAll('.gpga-hero-title').forEach(function(el) {
        el.innerHTML = cfg.hero_title.replace(/\n/g,'<br>');
      });
    }
    if (cfg.hero_subtitle) {
      document.querySelectorAll('.gpga-hero-subtitle').forEach(function(el) { el.textContent = cfg.hero_subtitle; });
    }
    if (cfg.hero_cta_text) {
      document.querySelectorAll('.gpga-hero-cta').forEach(function(el) { el.textContent = cfg.hero_cta_text; });
    }
    // Footer
    if (cfg.footer_text) {
      document.querySelectorAll('.gpga-footer-desc').forEach(function(el) { el.textContent = cfg.footer_text; });
    }
    if (cfg.footer_slogan) {
      document.querySelectorAll('.gpga-footer-slogan').forEach(function(el) { el.textContent = cfg.footer_slogan; });
    }
    // Hero bg
    const heroSection = document.querySelector('.gpga-hero');
    if (heroSection && cfg.hero_image_url) {
      heroSection.style.backgroundImage = 'url(' + cfg.hero_image_url + ')';
      heroSection.style.backgroundSize = 'cover';
      heroSection.style.backgroundPosition = 'center';
    }
  }

  function applyMeta(cfg) {
    if (cfg.meta_title) document.title = cfg.meta_title;
    if (cfg.meta_description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement('meta'); m.name='description'; document.head.appendChild(m); }
      m.content = cfg.meta_description;
    }
  }

  function applySections(cfg) {
    const map = {
      'section_hero':         '.gpga-hero-wrap',
      'section_how_it_works': '.gpga-section-how',
      'section_properties':   '.gpga-section-props',
      'section_testimonials': '.gpga-section-testimonials',
      'section_about_band':   '.gpga-section-about-band',
    };
    Object.keys(map).forEach(function(key) {
      document.querySelectorAll(map[key]).forEach(function(el) {
        el.style.display = (cfg[key] === 'false') ? 'none' : '';
      });
    });
  }

})();
