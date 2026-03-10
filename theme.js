// ═══════════════════════════════════════════════════════════════
// GREAT PROPERTIES GA — THEME ENGINE v2
// Archivo central de tema. Cargado en todas las páginas.
// Lee site_settings de Supabase y aplica todo dinámicamente.
// ═══════════════════════════════════════════════════════════════

(async function GPGA_THEME() {
  const SB_URL = 'https://cqwvnvcjxbeskvyqrank.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxd3ZudmNqeGJlc2t2eXFyYW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjg5OTMsImV4cCI6MjA4ODYwNDk5M30.pavJBT9fpyoKPH9zbn-9pcUY72gaOB6qL76QMCtFoWw';
  const H = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY };

  // ── DEFAULTS (fallback si Supabase no responde) ──────────────
  const DEFAULTS = {
    brand_color:     '#c9a84c',
    brand_color_2:   '#0a0a0a',
    font_display:    'Cormorant Garamond',
    font_body:       'DM Sans',
    logo_text:       'Great Properties GA',
    logo_url:        '',
    site_phone:      '404-590-1613',
    site_email:      'info@greatpropertiesga.com',
    hero_title:      'Georgia Real Estate\nDone Right.',
    hero_subtitle:   'We buy, renovate, and sell exceptional properties across all of Georgia. Fast closings. Cash offers. No commissions.',
    hero_image_url:  '',
    hero_video_url:  '',
    footer_text:     "Georgia's trusted real estate investment company. We buy, renovate, and sell properties across all of Georgia.",
    meta_title:      'Great Properties GA, LLC — Georgia Real Estate',
    meta_description:'Great Properties GA buys houses fast across Georgia. Cash offers within 24 hours. Any condition, any city.',
    // Section visibility (true = visible)
    section_hero:       'true',
    section_how_it_works:'true',
    section_properties: 'true',
    section_testimonials:'true',
    section_about_band: 'true',
  };

  // ── APPLY CACHE INSTANTLY (antes de que el browser pinte) ────
  // Esto elimina el "flash" del color por defecto
  const CACHE_KEY = 'gpga_theme_v2';
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const cs = JSON.parse(cached);
      // Aplicar colores y fuentes del cache INMEDIATAMENTE
      const root = document.documentElement;
      if (cs.brand_color)   root.style.setProperty('--brand',      cs.brand_color);
      if (cs.brand_color_2) root.style.setProperty('--brand2',     cs.brand_color_2);
      if (cs.font_display)  root.style.setProperty('--font-display',"'" + cs.font_display + "', Georgia, serif");
      if (cs.font_body)     root.style.setProperty('--font-body',  "'" + cs.font_body    + "', system-ui, sans-serif");
    }
  } catch(e) {}

  // ── FETCH SETTINGS desde Supabase ────────────────────────────
  let s = { ...DEFAULTS };
  try {
    const r = await fetch(SB_URL + '/rest/v1/site_settings?select=key,value', { headers: H });
    if (r.ok) {
      const rows = await r.json();
      rows.forEach(function(row) { if (row.value !== null && row.value !== '') s[row.key] = row.value; });
      // Guardar en cache para la próxima carga (sin flash)
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(s)); } catch(e) {}
    }
  } catch(e) { /* usar cache o defaults */ }

  // ── EXPOSE GLOBALLY for pages that need it ───────────────────
  window.GPGA = { settings: s, SB_URL, SB_KEY, H };

  // ── LOAD GOOGLE FONTS ────────────────────────────────────────
  const displayFont = s.font_display || 'Cormorant Garamond';
  const bodyFont    = s.font_body    || 'DM Sans';
  const fontMap = {
    'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400',
    'Playfair Display':   'Playfair+Display:ital,wght@0,400;0,700;0,900;1,400',
    'Libre Baskerville':  'Libre+Baskerville:ital,wght@0,400;0,700;1,400',
    'EB Garamond':        'EB+Garamond:ital,wght@0,400;0,500;0,700;1,400',
    'DM Sans':            'DM+Sans:wght@300;400;500;600;700',
    'Outfit':             'Outfit:wght@300;400;500;600;700',
    'Jost':               'Jost:wght@300;400;500;600;700',
    'Raleway':            'Raleway:wght@300;400;500;600;700',
  };
  const dq = fontMap[displayFont] || (displayFont.replace(/ /g,'+') + ':wght@400;700');
  const bq = fontMap[bodyFont]    || (bodyFont.replace(/ /g,'+')    + ':wght@300;400;500;600');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=' + dq + '&family=' + bq + '&display=swap';
  document.head.appendChild(link);

  // ── APPLY CSS VARIABLES ──────────────────────────────────────
  function hexToRgb(hex) {
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
    const n = parseInt(hex,16);
    return [(n>>16)&255, (n>>8)&255, n&255];
  }
  function darken(hex, pct) {
    try {
      const [r,g,b] = hexToRgb(hex);
      const f = 1 - pct/100;
      return '#' + [r,g,b].map(c=>Math.max(0,Math.round(c*f)).toString(16).padStart(2,'0')).join('');
    } catch(e) { return hex; }
  }
  function lighten(hex, pct) {
    try {
      const [r,g,b] = hexToRgb(hex);
      return '#' + [r,g,b].map(c=>Math.min(255,Math.round(c+(255-c)*pct/100)).toString(16).padStart(2,'0')).join('');
    } catch(e) { return hex; }
  }

  const brand  = s.brand_color  || '#c9a84c';
  const brand2 = s.brand_color_2|| '#0a0a0a';
  const root   = document.documentElement;

  root.style.setProperty('--brand',        brand);
  root.style.setProperty('--brand-dark',   darken(brand, 20));
  root.style.setProperty('--brand-light',  lighten(brand, 60));
  root.style.setProperty('--brand-rgb',    hexToRgb(brand).join(','));
  root.style.setProperty('--brand2',       brand2);
  root.style.setProperty('--brand2-dark',  darken(brand2, 20));
  root.style.setProperty('--font-display', "'" + displayFont + "', Georgia, serif");
  root.style.setProperty('--font-body',    "'" + bodyFont    + "', system-ui, sans-serif");

  // ── APPLY LOGO ───────────────────────────────────────────────
  if (s.logo_url) {
    document.querySelectorAll('.gpga-logo-icon').forEach(function(el) {
      const img = document.createElement('img');
      img.src = s.logo_url;
      img.className = 'gpga-logo-img';
      img.alt = s.logo_text || 'Logo';
      img.onerror = function() { img.style.display='none'; };
      el.replaceWith(img);
    });
  }
  if (s.logo_text) {
    document.querySelectorAll('.gpga-logo-name').forEach(function(el) { el.textContent = s.logo_text; });
    document.querySelectorAll('.gpga-footer-name').forEach(function(el) { el.textContent = s.logo_text; });
  }

  // ── APPLY CONTACT INFO ───────────────────────────────────────
  if (s.site_phone) {
    const clean = s.site_phone.replace(/\D/g,'');
    document.querySelectorAll('a[href^="tel:"]').forEach(function(el) {
      el.href = 'tel:' + clean;
    });
    document.querySelectorAll('.gpga-phone').forEach(function(el) { el.textContent = s.site_phone; });
  }
  if (s.site_email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(function(el) {
      el.href = 'mailto:' + s.site_email;
    });
    document.querySelectorAll('.gpga-email').forEach(function(el) { el.textContent = s.site_email; });
  }

  // ── APPLY HERO ───────────────────────────────────────────────
  if (s.hero_title) {
    document.querySelectorAll('.gpga-hero-title').forEach(function(el) {
      el.innerHTML = s.hero_title.replace(/\n/g, '<br>');
    });
  }
  if (s.hero_subtitle) {
    document.querySelectorAll('.gpga-hero-subtitle').forEach(function(el) {
      el.textContent = s.hero_subtitle;
    });
  }
  const heroSection = document.querySelector('.gpga-hero');
  if (heroSection) {
    if (s.hero_video_url) {
      const vid = document.createElement('video');
      vid.src = s.hero_video_url;
      vid.autoplay = vid.muted = vid.loop = vid.playsInline = true;
      vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:0.35';
      heroSection.style.position = 'relative';
      heroSection.insertBefore(vid, heroSection.firstChild);
    } else if (s.hero_image_url) {
      heroSection.style.backgroundImage = 'url(' + s.hero_image_url + ')';
      heroSection.style.backgroundSize = 'cover';
      heroSection.style.backgroundPosition = 'center';
    }
  }

  // ── APPLY FOOTER TEXT ────────────────────────────────────────
  if (s.footer_text) {
    document.querySelectorAll('.gpga-footer-desc').forEach(function(el) { el.textContent = s.footer_text; });
  }

  // ── APPLY META ───────────────────────────────────────────────
  if (s.meta_title) document.title = s.meta_title;
  if (s.meta_description) {
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.name='description'; document.head.appendChild(m); }
    m.content = s.meta_description;
  }

  // ── SECTION VISIBILITY ───────────────────────────────────────
  const sectionMap = {
    'section_hero':         '.gpga-hero-wrap',
    'section_how_it_works': '.gpga-section-how',
    'section_properties':   '.gpga-section-props',
    'section_testimonials': '.gpga-section-testimonials',
    'section_about_band':   '.gpga-section-about-band',
  };
  Object.keys(sectionMap).forEach(function(key) {
    if (s[key] === 'false') {
      document.querySelectorAll(sectionMap[key]).forEach(function(el) {
        el.style.display = 'none';
      });
    }
  });

  // ── LEAD FORMS → SUPABASE ────────────────────────────────────
  document.querySelectorAll('.gpga-form').forEach(function(form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const msg = form.querySelector('.gpga-form-msg');
      const orig = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';
      const data = {
        name:    (form.querySelector('[name=name]')||{}).value || null,
        email:   (form.querySelector('[name=email]')||{}).value || null,
        phone:   (form.querySelector('[name=phone]')||{}).value || null,
        zip:     (form.querySelector('[name=zip]')||{}).value || null,
        address: (form.querySelector('[name=address]')||{}).value || null,
        message: (form.querySelector('[name=message]')||{}).value || null,
        subject: (form.querySelector('[name=subject]')||{}).value || null,
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

  // ── TOAST ────────────────────────────────────────────────────
  window.gpgaToast = function(msg, type) {
    let t = document.getElementById('gpga-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'gpga-toast';
      t.style.cssText = 'position:fixed;bottom:28px;right:28px;background:var(--brand);color:#000;padding:14px 22px;border-radius:4px;font-weight:600;font-size:13px;z-index:9999;transform:translateY(100px);opacity:0;transition:all .3s cubic-bezier(.34,1.56,.64,1);font-family:var(--font-body);letter-spacing:.3px;box-shadow:0 8px 32px rgba(0,0,0,.4)';
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

  // ── FAQ ACCORDION ────────────────────────────────────────────
  document.addEventListener('click', function(e) {
    const q = e.target.closest('.gpga-faq-q');
    if (!q) return;
    const item = q.closest('.gpga-faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.gpga-faq-item.open').forEach(function(i) { i.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
  });

  // ── FOOTER YEAR ──────────────────────────────────────────────
  document.querySelectorAll('.gpga-year').forEach(function(el) { el.textContent = new Date().getFullYear(); });

  // ── SCROLL ANIMATIONS ────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('gpga-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.gpga-animate').forEach(function(el) { obs.observe(el); });
  } else {
    document.querySelectorAll('.gpga-animate').forEach(function(el) { el.classList.add('gpga-visible'); });
  }

})();
