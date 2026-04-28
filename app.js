
'use strict';

const MateMagia = {
  version: '3.0',
  activeDropdown: null,
  mobileOpen: false,
  player: { score: 0, level: 1, streak: 0, xp: 0 },

  mascotPhrases: [
    '¡Hola! Soy <strong>Max</strong> <br><small>Elige una opción y empecemos</small>',
    '¡Tú puedes con las matemáticas! <br><small>¡Cada día aprendes más!</small>',
    '¿Sabías que los números<br>están en todas partes? ',
    '¡Practica y serás<br>el más rápido! ',
    '¡Los errores nos hacen<br>más inteligentes! ',
    '¡Vamos, campeón!<br>¡Tú puedes! ',
  ],

  navMap: {
    btnAprende: 'dropAprende',
    btnJuega:   'dropJuega',
    btnCompite: 'dropCompite',
    btnMemoria: 'dropMemoria',
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

  // Logo → ir al inicio
  document.getElementById('navLogo')
    ?.addEventListener('click', (e) => { e.preventDefault(); goHome(); });

  // Botones del navbar con dropdown
  Object.entries(MateMagia.navMap).forEach(([btnId, dropId]) => {
    document.getElementById(btnId)
      ?.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdown(dropId); });
  });

  // Botón Mi Progreso (sin dropdown)
  document.getElementById('btnProgreso')
    ?.addEventListener('click', (e) => { e.stopPropagation(); goTo('progreso', 'ver'); });

  // Hamburger
  document.getElementById('hamburger')
    ?.addEventListener('click', (e) => { e.stopPropagation(); toggleMobile(); });

  // Overlay → cerrar dropdowns
  document.getElementById('overlay')
    ?.addEventListener('click', closeAllDropdowns);

  // Mascota → cambiar frase al hacer clic
  document.getElementById('mascot')
    ?.addEventListener('click', changeMascotPhrase);

  // Botones hero
  document.getElementById('btnEmpezar')
    ?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown('dropAprende');
      highlightNav('navAprende');
    });

  document.getElementById('btnJugarDirecto')
    ?.addEventListener('click', (e) => { e.stopPropagation(); goTo('juego', 'operacion-rapida'); });

  // Drop-items con data-modulo/data-sub (desktop + móvil)
  document.querySelectorAll('.drop-item[data-modulo], .mob-item[data-modulo]')
    .forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const modulo = el.dataset.modulo;
        const sub    = el.dataset.sub;
        goTo(modulo, sub);
      });
    });

  // Items bloqueados / coming soon
  document.querySelectorAll('[data-coming="true"]')
    .forEach(el => {
      el.addEventListener('click', (e) => { e.stopPropagation(); showComingSoon(); });
    });

  // Cerrar dropdowns al hacer clic fuera del navbar
  document.addEventListener('click', (e) => {
    const nav = document.getElementById('navbar');
    if (nav && !nav.contains(e.target)) {
      closeAllDropdowns();
      if (MateMagia.mobileOpen) closeMobile();
    }
  });

  // Tecla ESC → cerrar todo
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeAllDropdowns(); closeMobile(); }
  });
}

// ── PARTÍCULAS ──────────────────────────────────────────────
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const syms   = ['✕','○','△','+','−','×','÷','=','∑','√','∞','%'];
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

  const item   = drop.closest('.nav-item');
  const isOpen = item.classList.contains('open');
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

// ── HAMBURGER / MÓVIL ────────────────────────────────────────
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

// ── NAVEGACIÓN ───────────────────────────────────────────────
function goTo(modulo, sub) {
  closeAllDropdowns();
  if (MateMagia.mobileOpen) closeMobile();

  const labels = {
    aprende: { 1:' ¡Vamos a aprender con 1 cifra!', 2:' ¡2 cifras, tú puedes!', 3:' ¡3 cifras, eres un PRO!' },
    juego:   { 'operacion-rapida':' ¡Cargando Operación Rápida!', globos:' ¡Preparando los globos!' },
    compite: { duelo:' ¡Cargando Duelo Matemático!', torneo:' ¡Cargando Torneo!' },
    memoria: { tarjetas:' ¡Barajando Tarjetas Mágicas!', secuencia:' ¡Cargando Secuencia!', flash:' ¡Flash Mental activado!' },
    progreso:{ ver:' ¡Cargando tu progreso!' },
  };

  const msg = labels[modulo]?.[sub] ?? ' ¡Cargando módulo!';
  showToast(msg);

  console.log(`[MateMagia v${MateMagia.version}] → ${modulo}/${sub}`);
}

function goHome() {
  closeAllDropdowns();
  closeMobile();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showComingSoon() {
  showToast(' ¡Este juego llega muy pronto! Sigue practicando...');
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

// ── ESTADÍSTICAS ─────────────────────────────────────────────
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

console.log(`%cMateMagia v${MateMagia.version} ✓`, 'color:#FFD600;font-weight:bold;font-size:14px;');