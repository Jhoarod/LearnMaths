/* ============================================================
   MateMagia — app_v2.js
   Navbar interactivo con dropdowns y menú móvil
   © Proyecto Exclusivo — Todos los derechos reservados
   ============================================================ */

'use strict';

const MateMagia = {
  version: '2.0',
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
};

// ── INICIO ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  loadPlayer();
  updateStats();
  initMascot();
  initNavbarScroll();
});

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

    el.className  = 'particle';
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
function toggleDropdown(dropId, e) {
  if (e) e.stopPropagation();

  const drop = document.getElementById(dropId);
  if (!drop) return;

  const item    = drop.closest('.nav-item');
  const isOpen  = item.classList.contains('open');
  const overlay = document.getElementById('overlay');

  // Cerrar todos primero
  closeAllDropdowns();

  if (!isOpen) {
    item.classList.add('open');
    MateMagia.activeDropdown = dropId;
    if (overlay) overlay.classList.add('active');
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.nav-item.open').forEach(el => el.classList.remove('open'));
  MateMagia.activeDropdown = null;
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.remove('active');
}

// Highlight nav activo
function highlightNav(navId) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(navId);
  if (el) el.classList.add('active');
}

// ── HAMBURGER (MÓVIL) ────────────────────────────────────────
function toggleMobile() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('hamburger');
  if (!menu || !btn) return;

  MateMagia.mobileOpen = !MateMagia.mobileOpen;
  menu.classList.toggle('open', MateMagia.mobileOpen);
  btn.classList.toggle('open',  MateMagia.mobileOpen);
}

// Cerrar mobile al hacer clic fuera
document.addEventListener('click', (e) => {
  const nav = document.getElementById('navbar');
  if (nav && !nav.contains(e.target)) {
    closeAllDropdowns();
    if (MateMagia.mobileOpen) {
      MateMagia.mobileOpen = false;
      document.getElementById('mobileMenu')?.classList.remove('open');
      document.getElementById('hamburger')?.classList.remove('open');
    }
  }
});

// ── NAVEGACIÓN ───────────────────────────────────────────────
function goTo(modulo, sub, e) {
  if (e) e.stopPropagation();
  closeAllDropdowns();

  const labels = {
    aprende: { 1:' ¡Vamos a aprender con 1 cifra!', 2:' ¡2 cifras, tú puedes!', 3:' ¡3 cifras, eres un PRO!' },
    juego:   { 'operacion-rapida':' ¡Cargando Operación Rápida!', globos:' ¡Preparando los globos!' },
    compite: { duelo:'⚔️ ¡Cargando Duelo Matemático!', torneo:' ¡Cargando Torneo!' },
    memoria: { tarjetas:' ¡Barajando Tarjetas Mágicas!', secuencia:' ¡Cargando Secuencia!', flash:' ¡Flash Mental activado!' },
    progreso:{ ver:' ¡Cargando tu progreso!' },
  };

  const msg = labels[modulo]?.[sub] ?? '🚀 ¡Cargando módulo!';
  showToast(msg);

  // Cerrar menú móvil si está abierto
  if (MateMagia.mobileOpen) toggleMobile();

  console.log(`[MateMagia v${MateMagia.version}] → ${modulo}/${sub}`);
}

function goHome(e) {
  if (e) e.preventDefault();
  closeAllDropdowns();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showComingSoon(e) {
  if (e) e.stopPropagation();
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
  const phrases = MateMagia.mascotPhrases;
  const random  = Math.floor(Math.random() * phrases.length);
  bubble.innerHTML = phrases[random];
  bubble.style.animation = 'none';
  void bubble.offsetHeight;
  bubble.style.animation = 'bubblePop 0.45s cubic-bezier(0.34,1.56,0.64,1) both';
}

// ── ESTADÍSTICAS ──────────────────────────────────────────────
function loadPlayer() {
  try {
    const saved = localStorage.getItem('matemagia_v2');
    if (saved) Object.assign(MateMagia.player, JSON.parse(saved));
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
  const start = 0, dur = 900, t0 = performance.now();
  (function step(ts) {
    const prog = Math.min((ts - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    el.textContent = Math.round(start + (target - start) * ease);
    if (prog < 1) requestAnimationFrame(step);
  })(performance.now());
}

// ── TOAST ──────────────────────────────────────────────────────
let _toastTimer;
function showToast(msg, ms = 2800) {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(_toastTimer);
  el.textContent = msg;
  el.classList.add('show');
  _toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

// ── EXPONER GLOBALS ──────────────────────────────────────────
window.MateMagia      = MateMagia;
window.toggleDropdown = toggleDropdown;
window.closeAllDropdowns = closeAllDropdowns;
window.toggleMobile   = toggleMobile;
window.goTo           = goTo;
window.goHome         = goHome;
window.showComingSoon = showComingSoon;
window.changeMascotPhrase = changeMascotPhrase;
window.highlightNav   = highlightNav;

console.log(`%cMateMagia v${MateMagia.version} ✓`, 'color:#FFD600;font-weight:bold;font-size:14px;');