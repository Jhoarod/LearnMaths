'use strict';

const MateMagia = {
  version: '5.0',
  activeDropdown: null,
  mobileOpen: false,
  player: { score: 0, level: 1, streak: 0, xp: 0 },

  mascotPhrases: [
    '¡Hola! Soy <strong>Max</strong><br><small>Elige una opcion y empecemos</small>',
    '¡Tu puedes con las matematicas!<br><small>¡Cada dia aprendes mas!</small>',
    '¿Sabias que multiplicar es<br>sumar rapido?',
    '¡Practica y seras<br>el mas rapido!',
    '¡Los errores nos hacen<br>mas inteligentes!',
    '¡Vamos, campeon!<br>¡Tu puedes!',
  ],

  navMap: {
    btnAprende: 'dropAprende',
    btnJuega:   'dropJuega',
    btnCompite: 'dropCompite',
    btnMemoria: 'dropMemoria',
  },

  // ── RUTAS ─────────────────────────────────────────────────
  // Desde src/index.html  → views/xxx.html
  // Desde src/views/*.html → el mismo directorio (sin prefijo views/)
  routes: {
    aprende: {
      1: 'views/aprende.html?cifras=1',
      2: 'views/aprende.html?cifras=2',
      3: 'views/aprende.html?cifras=3',
    },
    juego: {
      'operacion-rapida': 'views/juega.html?modo=operacion-rapida',
      globos:             'views/juega.html?modo=globos',
    },
    compite: {
      duelo:  'views/compite.html?modo=duelo',
      torneo: 'views/compite.html?modo=torneo',
    },
    memoria: {
      tarjetas:  'views/memoria.html?modo=tarjetas',
      secuencia: 'views/memoria.html?modo=secuencia',
      flash:     'views/memoria.html?modo=flash',
    },
    progreso: {
      ver: 'views/progreso.html',
    },
  },
};

// ── INICIO ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  loadPlayer();
  updateStats();
  initMascot();
  initNavbarScroll();
  bindEvents();
  initPageContext();
});

// ── DETECTAR VISTA INTERNA ────────────────────────────────────
function enVista() {
  return window.location.pathname.includes('/views/');
}

// ── BIND DE EVENTOS ──────────────────────────────────────────
function bindEvents() {

  document.getElementById('navLogo')
    ?.addEventListener('click', (e) => { e.preventDefault(); goHome(); });

  Object.entries(MateMagia.navMap).forEach(([btnId, dropId]) => {
    document.getElementById(btnId)
      ?.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdown(dropId); });
  });

  document.getElementById('btnProgreso')
    ?.addEventListener('click', (e) => { e.stopPropagation(); goTo('progreso', 'ver'); });

  document.getElementById('hamburger')
    ?.addEventListener('click', (e) => { e.stopPropagation(); toggleMobile(); });

  document.getElementById('overlay')
    ?.addEventListener('click', closeAllDropdowns);

  document.getElementById('mascot')
    ?.addEventListener('click', changeMascotPhrase);

  document.getElementById('btnEmpezar')
    ?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown('dropAprende');
      highlightNav('navAprende');
    });

  document.getElementById('btnJugarDirecto')
    ?.addEventListener('click', (e) => { e.stopPropagation(); goTo('juego', 'operacion-rapida'); });

  document.getElementById('btnBack')
    ?.addEventListener('click', (e) => { e.preventDefault(); goHome(); });

  document.querySelectorAll('.drop-item[data-modulo], .mob-item[data-modulo]')
    .forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(el.dataset.modulo, el.dataset.sub);
      });
    });

  document.querySelectorAll('[data-coming="true"]')
    .forEach(el => {
      el.addEventListener('click', (e) => { e.stopPropagation(); showComingSoon(); });
    });

  document.addEventListener('click', (e) => {
    const nav = document.getElementById('navbar');
    if (nav && !nav.contains(e.target)) {
      closeAllDropdowns();
      if (MateMagia.mobileOpen) closeMobile();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeAllDropdowns(); closeMobile(); }
  });
}

// ── PARTICULAS ──────────────────────────────────────────────
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const syms   = ['x', '+', '-', '÷', '=', '%', '?'];
  const colors = ['#FFD600','#2C5FD4','#4AE8C4','#E84A7F','#E8A14A','#A14AE8'];
  const count  = window.innerWidth < 600 ? 16 : 30;

  for (let i = 0; i < count; i++) {
    const el    = document.createElement('div');
    const size  = Math.random() * 22 + 10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const sym   = syms[Math.floor(Math.random() * syms.length)];

    el.className   = 'particle';
    el.textContent = sym;
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${size}px;
      color: ${color};
      animation-duration: ${Math.random() * 20 + 14}s;
      animation-delay: ${Math.random() * -25}s;
    `;
    container.appendChild(el);
  }
}

// ── NAVBAR SCROLL ────────────────────────────────────────────
function initNavbarScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 10
      ? '0 4px 32px rgba(0,0,0,0.5)'
      : '0 4px 32px rgba(0,0,0,0.4)';
  }, { passive: true });
}

// ── DROPDOWNS ────────────────────────────────────────────────
function toggleDropdown(dropId) {
  const drop = document.getElementById(dropId);
  if (!drop) return;

  const item    = drop.closest('.nav-item');
  const isOpen  = item.classList.contains('open');
  const overlay = document.getElementById('overlay');

  closeAllDropdowns();

  if (!isOpen) {
    item.classList.add('open');
    MateMagia.activeDropdown = dropId;
    overlay?.classList.add('active');
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.nav-item.open')
    .forEach(el => el.classList.remove('open'));
  MateMagia.activeDropdown = null;
  document.getElementById('overlay')?.classList.remove('active');
}

function highlightNav(navId) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById(navId)?.classList.add('active');
}

// ── HAMBURGER / MOVIL ────────────────────────────────────────
function toggleMobile() {
  MateMagia.mobileOpen ? closeMobile() : openMobile();
}

function openMobile() {
  MateMagia.mobileOpen = true;
  document.getElementById('mobileMenu')?.classList.add('open');
  document.getElementById('hamburger')?.classList.add('open');
}

function closeMobile() {
  MateMagia.mobileOpen = false;
  document.getElementById('mobileMenu')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
}

// ── NAVEGACION ───────────────────────────────────────────────
function goTo(modulo, sub) {
  closeAllDropdowns();
  if (MateMagia.mobileOpen) closeMobile();

  let ruta = MateMagia.routes[modulo]?.[sub];
  if (!ruta) { showToast('Esta seccion no esta disponible aun.'); return; }

  // Desde views/ las rutas no llevan el prefijo views/
  if (enVista()) ruta = ruta.replace('views/', '');

  window.location.href = ruta;
}

function goHome() {
  closeAllDropdowns();
  closeMobile();
  window.location.href = enVista() ? '../index.html' : 'index.html';
}

function showComingSoon() {
  showToast('Este juego llega muy pronto. Sigue practicando.');
}

// ── MASCOTA ──────────────────────────────────────────────────
function initMascot() {
  const bubble = document.getElementById('mascotBubble');
  if (!bubble) return;

  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % MateMagia.mascotPhrases.length;
    bubble.innerHTML = MateMagia.mascotPhrases[idx];
    bubble.style.animation = 'none';
    void bubble.offsetHeight;
    bubble.style.animation = 'bubblePop 0.45s cubic-bezier(0.34,1.56,0.64,1) both';
  }, 7000);
}

function changeMascotPhrase() {
  const bubble = document.getElementById('mascotBubble');
  if (!bubble) return;
  const random = Math.floor(Math.random() * MateMagia.mascotPhrases.length);
  bubble.innerHTML = MateMagia.mascotPhrases[random];
  bubble.style.animation = 'none';
  void bubble.offsetHeight;
  bubble.style.animation = 'bubblePop 0.45s cubic-bezier(0.34,1.56,0.64,1) both';
}

// ── ESTADISTICAS ─────────────────────────────────────────────
function loadPlayer() {
  try {
    const saved = localStorage.getItem('matemagia_player');
    if (saved) Object.assign(MateMagia.player, JSON.parse(saved));
  } catch (_) {}
}

function savePlayer() {
  try {
    localStorage.setItem('matemagia_player', JSON.stringify(MateMagia.player));
  } catch (_) {}
}

function updateStats() {
  const p = MateMagia.player;
  animCount('qScore',  p.score);
  animCount('qLevel',  p.level);
  animCount('qStreak', p.streak);
}

function animCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const dur = 900, t0 = performance.now();
  (function step(ts) {
    const prog = Math.min((ts - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    el.textContent = Math.round(target * ease);
    if (prog < 1) requestAnimationFrame(step);
  })(performance.now());
}

// ── TOAST ────────────────────────────────────────────────────
let _toastTimer;
function showToast(msg, ms = 2800) {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(_toastTimer);
  el.textContent = msg;
  el.classList.add('show');
  _toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

// ── CONTEXTO DE PAGINAS INTERNAS ─────────────────────────────
function initPageContext() {
  if (!enVista()) return;

  const params  = new URLSearchParams(window.location.search);
  const cifras  = params.get('cifras');
  const modo    = params.get('modo');
  const page    = window.location.pathname.split('/').pop();
  const titleEl = document.getElementById('pageTitle');
  const descEl  = document.getElementById('pageDesc');

  const contextos = {
    'aprende.html': {
      1: { title: 'Multiplicacion con 1 Cifra', desc: 'Aprende a multiplicar numeros del 1 al 9 paso a paso.' },
      2: { title: 'Multiplicacion con 2 Cifras', desc: 'Aprende a multiplicar numeros del 10 al 99 de forma sencilla.' },
      3: { title: 'Multiplicacion con 3 Cifras', desc: 'Domina la multiplicacion con numeros de hasta 3 cifras.' },
    },
    'juega.html': {
      'operacion-rapida': { title: 'Operacion Rapida', desc: 'Resuelve la mayor cantidad de multiplicaciones antes de que se acabe el tiempo.' },
      globos:             { title: 'Explota Globos',   desc: 'Revienta el globo con la respuesta correcta. Rapido, que se escapan.' },
    },
    'compite.html': {
      duelo:  { title: 'Duelo Matematico', desc: 'Tu contra un amigo. El que responda mas rapido gana.' },
      torneo: { title: 'Torneo en Clase',  desc: 'Hasta 8 jugadores compitiendo al mismo tiempo.' },
    },
    'memoria.html': {
      tarjetas:  { title: 'Tarjetas Magicas',   desc: 'Encuentra las parejas de multiplicaciones y resultados.' },
      secuencia: { title: 'Secuencia Numerica', desc: 'Memoriza la secuencia y repitela correctamente.' },
      flash:     { title: 'Flash Mental',       desc: 'Numeros que aparecen y desaparecen. Que tan rapida es tu mente?' },
    },
  };

  const clave = cifras || modo;
  const info  = contextos[page]?.[clave];

  if (info && titleEl) titleEl.textContent = info.title;
  if (info && descEl)  descEl.textContent  = info.desc;
}

console.log(`%cMateMagia v${MateMagia.version}`, 'color:#FFD600;font-weight:bold;font-size:14px;');