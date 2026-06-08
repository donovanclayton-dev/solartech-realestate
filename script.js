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

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  const markerIcon = L.divIcon({
    className: 'map-marker-wrap',
    html: '<div class="map-marker-pulse"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -14]
  });

  const serviceAreas = [
    {
      coords: [32.85, -117.2],
      name: 'Southern California',
      detail: 'San Diego · Los Angeles · Orange County'
    },
    {
      coords: [37.6, -122.0],
      name: 'Northern California',
      detail: 'San Francisco Bay Area · Sacramento'
    },
    {
      coords: [33.45, -112.1],
      name: 'Arizona',
      detail: 'Phoenix · Scottsdale · Tucson'
    }
  ];

  serviceAreas.forEach(area => {
    L.marker(area.coords, { icon: markerIcon })
      .addTo(map)
      .bindPopup(`<strong>${area.name}</strong><br>${area.detail}`);
  });
}

/* ── Form submission ──────────────────────────────── */
const form = document.querySelector('.connect-form');
if (form) {
  form.addEventListener('submit', e => {
    const action = form.getAttribute('action') || '';
    if (action.includes('REPLACE_WITH_YOUR_ID')) {
      e.preventDefault();
      const name = form.querySelector('#name')?.value.trim() || 'there';
      alert(
        `Thanks, ${name}!\n\nPlease send your application directly to:\nmarketing@solartechonline.com\n\nWe'll confirm your partner status within 24 hours.`
      );
    }
  });
}
