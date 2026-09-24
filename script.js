/* ── Year ──────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Sticky header ────────────────────────────────── */
const header = document.querySelector('[data-header]');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── Smooth scroll ────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', id);
  });
});

/* ── Scroll reveal ────────────────────────────────── */
const reveals = document.querySelectorAll('.reveal');
if (reveals.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
  );
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('visible'));
}

/* ── Steps sequential light-up (looping) ─────────── */
const stepsGrid = document.querySelector('.steps-grid');
if (stepsGrid && 'IntersectionObserver' in window) {
  const steps = [...stepsGrid.querySelectorAll('.step')];
  const interval = 1100;
  let loopTimer = null;

  const runLoop = () => {
    let i = 0;
    const next = () => {
      steps.forEach(s => s.classList.remove('lit'));
      steps[i].classList.add('lit');
      i = (i + 1) % steps.length;
      loopTimer = setTimeout(next, interval);
    };
    next();
  };

  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!loopTimer) runLoop();
    } else {
      clearTimeout(loopTimer);
      loopTimer = null;
      steps.forEach(s => s.classList.remove('lit'));
    }
  }, { threshold: 0.3 }).observe(stepsGrid);
}

/* ── Trust stat flip + count-up ──────────────────── */
const trustGrid = document.querySelector('.trust-grid');
if (trustGrid && 'IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    document.querySelectorAll('.trust-card').forEach((card, i) => {
      setTimeout(() => {
        const numEl = card.querySelector('.trust-num');
        if (!numEl) return;
        const raw = numEl.textContent.trim();
        const cleaned = raw.replace(/,/g, '');
        const match = cleaned.match(/^(\d+(?:\.\d+)?)(.*)/);
        numEl.classList.add('flipping');
        if (match) {
          const target = parseFloat(match[1]);
          const suffix = match[2];
          const formatNum = n => target >= 1000 ? n.toLocaleString() : String(n);
          const duration = 900;
          const start = performance.now();
          const tick = now => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            numEl.textContent = formatNum(Math.round(eased * target)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }, i * 140);
    });
  }, { threshold: 0.4 }).observe(trustGrid);
}

/* ── Coverage map ─────────────────────────────────── */
const mapEl = document.getElementById('map');
if (mapEl && typeof maplibregl !== 'undefined') {
  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [-117.0, 35.2],
    zoom: 5.0,
    scrollZoom: false,
    attributionControl: true
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

  const serviceAreas = [
    { coords: [-117.2, 32.85], name: 'Southern California', detail: 'San Diego · Los Angeles · Orange County' },
    { coords: [-122.0, 37.6],  name: 'Northern California', detail: 'San Francisco Bay Area · Sacramento' },
    { coords: [-112.1, 33.45], name: 'Arizona',             detail: 'Phoenix · Scottsdale · Tucson' }
  ];

  serviceAreas.forEach(area => {
    const el = document.createElement('div');
    el.className = 'map-marker-pulse';

    new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat(area.coords)
      .setPopup(new maplibregl.Popup({ offset: 14 }).setHTML(`<strong>${area.name}</strong><br>${area.detail}`))
      .addTo(map);
  });

/* Re-render once the map scrolls into view (fixes blank-canvas issue) */
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      map.resize();
    }
  }, { threshold: 0.1 }).observe(mapEl);
}

/* ── Partner application form submission ─────────── */
const partnerForm = document.getElementById('partner-form');
if (partnerForm) {
  partnerForm.addEventListener('submit', async e => {
    e.preventDefault();

    const btn = partnerForm.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    const data = {
      first_name:      partnerForm.querySelector('#first_name')?.value  || '',
      last_name:       partnerForm.querySelector('#last_name')?.value   || '',
      email:           partnerForm.querySelector('#email')?.value       || '',
      phone:           partnerForm.querySelector('#phone_1')?.value     || '',
      brokerage:       partnerForm.querySelector('#company_name')?.value|| '',
      license:         partnerForm.querySelector('#license')?.value     || '',
      annual_closings: partnerForm.querySelector('#volume')?.value      || '',
      message:         partnerForm.querySelector('#message')?.value     || '',
      marketing_contact_requested: partnerForm.querySelector('#marketing_contact')?.checked || false,
    };

    try {
      const res = await fetch('https://hook.us2.make.com/biaykfp5xagf5fejers0c8nyvsfn3qx6', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
      if (!res.ok) throw new Error('Request failed');

      partnerForm.innerHTML = `
        <div class="form-success">
          <div class="form-success-check">&#10003;</div>
          <h3>Application Received!</h3>
          <p>We'll review your application and confirm your partner status within 3–5 business days. Keep an eye on your inbox.</p>
        </div>`;
    } catch {
      btn.disabled = false;
      btn.textContent = 'Submit Application';
      let errEl = partnerForm.querySelector('.form-error');
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'form-error';
        partnerForm.appendChild(errEl);
      }
      errEl.textContent = 'Something went wrong. Please try again or email us directly.';
    }
  });
}
