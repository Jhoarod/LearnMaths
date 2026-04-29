'use strict';

const MateMagia = {
  version: '4.0',
  activeDropdown: null,
  mobileOpen: false,
  player: { score: 0, level: 1, streak: 0, xp: 0 },

  mascotPhrases: [
    '¡Hola! Soy <strong>Max</strong><br><small>Elige una opción y empecemos</small>',
    '¡Tú puedes con las matemáticas!<br><small>¡Cada día aprendes más!</small>',
    '¿Sabías que los números<br>están en todas partes?',
    '¡Practica y serás<br>el más rápido!',
    '¡Los errores nos hacen<br>más inteligentes!',
    '¡Vamos, campeón!<br>¡Tú puedes!',
  ],

  navMap: {
    btnAprende: 'dropAprende',
    btnJuega:   'dropJuega',
    btnCompite: 'dropCompite',
    btnMemoria: 'dropMemoria',
  },

  // Rutas por modulo y sub
  routes: {
    aprende:  {
      1: 'aprende.html?cifras=1',
      2: 'aprende.html?cifras=2',
      3: 'aprende.html?cifras=3',
    },
    juego: {
      'operacion-rapida': 'juega.html?modo=operacion-rapida',
      globos:             'juega.html?modo=globos',
    },
    compite: {
      duelo:  'compite.html?modo=duelo',
      torneo: 'compite.html?modo=torneo',
    },
    memoria: {
      tarjetas:  'memoria.html?modo=tarjetas',
      secuencia: 'memoria.html?modo=secuencia',
      flash:     'memoria.html?modo=flash',
    },
    progreso: {
      ver: 'progreso.html',
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
});

// ── BIND CENTRALIZADO DE EVENTOS ────────────────────────────
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

  const syms   = ['+', '-', 'x', '÷', '=', '%', '?'];
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

  const ruta = MateMagia.routes[modulo]?.[sub];

  if (ruta) {
    window.location.href = ruta;
  } else {
    showToast('Esta seccion no esta disponible aun.');
  }
}

function goHome() {
  closeAllDropdowns();
  closeMobile();
  window.location.href = 'index.html';
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

console.log(`%cMateMagia v${MateMagia.version}`, 'color:#FFD600;font-weight:bold;font-size:14px;');

// ── LOGICA DE PAGINAS INTERNAS ────────────────────────────────
// Se ejecuta en aprende.html, juega.html, compite.html, memoria.html, progreso.html
(function initPageContext() {
  const params  = new URLSearchParams(window.location.search);
  const cifras  = params.get('cifras');
  const modo    = params.get('modo');

  const titleEl = document.getElementById('pageTitle');
  const descEl  = document.getElementById('pageDesc');
  const btnBack = document.getElementById('btnBack');

  if (btnBack) {
    btnBack.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }

  // Contexto segun pagina actual
  const page = window.location.pathname.split('/').pop();

  if (page === 'aprende.html' && cifras && titleEl && descEl) {
    const info = {
      1: { title: 'Aprende con 1 Cifra', desc: 'Suma, resta, multiplica y divide con numeros del 1 al 9. El nivel perfecto para comenzar.' },
      2: { title: 'Aprende con 2 Cifras', desc: 'Operaciones con numeros del 10 al 99. Ya vas dominando las matematicas.' },
      3: { title: 'Aprende con 3 Cifras', desc: 'Operaciones con numeros del 100 al 999. Eres todo un profesional.' },
    };
    if (info[cifras]) {
      titleEl.textContent = info[cifras].title;
      descEl.textContent  = info[cifras].desc;
    }
  }

  if (page === 'juega.html' && modo && titleEl && descEl) {
    const info = {
      'operacion-rapida': { title: 'Operacion Rapida', desc: 'Resuelve la mayor cantidad de operaciones antes de que se acabe el tiempo.' },
      'globos':           { title: 'Explota Globos',   desc: 'Revienta el globo que tenga la respuesta correcta. Rapido, que se escapan.' },
    };
    if (info[modo]) {
      titleEl.textContent = info[modo].title;
      descEl.textContent  = info[modo].desc;
    }
  }

  if (page === 'compite.html' && modo && titleEl && descEl) {
    const info = {
      'duelo':  { title: 'Duelo Matematico', desc: 'Tu contra un amigo. El que responda mas rapido gana.' },
      'torneo': { title: 'Torneo en Clase',  desc: 'Hasta 8 jugadores compitiendo al mismo tiempo. Solo uno puede ser el campeon.' },
    };
    if (info[modo]) {
      titleEl.textContent = info[modo].title;
      descEl.textContent  = info[modo].desc;
    }
  }

  if (page === 'memoria.html' && modo && titleEl && descEl) {
    const info = {
      'tarjetas':  { title: 'Tarjetas Magicas',    desc: 'Encuentra las parejas de operaciones y resultados antes que tu rival.' },
      'secuencia': { title: 'Secuencia Numerica',  desc: 'Memoriza la secuencia de numeros y repitela correctamente.' },
      'flash':     { title: 'Flash Mental',         desc: 'Numeros que aparecen y desaparecen. Que tan rapida es tu mente?' },
    };
    if (info[modo]) {
      titleEl.textContent = info[modo].title;
      descEl.textContent  = info[modo].desc;
    }
  }
})();