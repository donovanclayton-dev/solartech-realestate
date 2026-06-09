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
if (mapEl && typeof L !== 'undefined') {
  const map = L.map('map', {
    center: [36.2, -116.8],
    zoom: 5,
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19,
    className: 'map-labels-layer'
  }).addTo(map);

  const markerIcon = L.divIcon({
    className: 'map-marker-wrap',
    html: '<div class="map-marker-pulse"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -14]
  });

  const serviceAreas = [
    { coords: [32.85, -117.2], name: 'Southern California', detail: 'San Diego · Los Angeles · Orange County' },
    { coords: [37.6, -122.0],  name: 'Northern California', detail: 'San Francisco Bay Area · Sacramento' },
    { coords: [33.45, -112.1], name: 'Arizona',             detail: 'Phoenix · Scottsdale · Tucson' }
  ];

  serviceAreas.forEach(area => {
    L.marker(area.coords, { icon: markerIcon })
      .addTo(map)
      .bindPopup(`<strong>${area.name}</strong><br>${area.detail}`);
  });

  /* Re-render tiles once the map scrolls into view (fixes blank tile issue) */
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      map.invalidateSize();
    }
  }, { threshold: 0.1 }).observe(mapEl);
}

