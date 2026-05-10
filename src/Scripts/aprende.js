'use strict';

/* ============================================================
   MateMagia — aprende.js
   Logica exclusiva de src/views/aprende.html
   Tabs de cifras + animaciones de multiplicacion
   © Proyecto Exclusivo
   ============================================================ */

// ── EJEMPLOS POR NIVEL ──────────────────────────────────────
const EJEMPLOS_1 = [
  { a: 4, b: 3 }, { a: 7, b: 2 }, { a: 6, b: 4 },
  { a: 8, b: 3 }, { a: 5, b: 5 }, { a: 9, b: 2 },
  { a: 3, b: 6 }, { a: 7, b: 4 }, { a: 8, b: 5 },
];

const EJEMPLOS_2 = [
  { a: 23, b: 12 }, { a: 34, b: 21 }, { a: 45, b: 13 },
  { a: 52, b: 24 }, { a: 61, b: 32 }, { a: 43, b: 22 },
];

const EJEMPLOS_3 = [
  { a: 123, b: 321 }, { a: 214, b: 132 }, { a: 312, b: 213 },
  { a: 421, b: 112 }, { a: 231, b: 123 },
];

let idx1 = 0, idx2 = 0, idx3 = 0;
let anim1Running = false, anim2Running = false, anim3Running = false;

// ── INICIO ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAnim1();
  initAnim2();
  initAnim3();
  // Activar tab segun parametro URL
  const params  = new URLSearchParams(window.location.search);
  const cifras  = params.get('cifras') || '1';
  activarTab(cifras);
});

// ── TABS ─────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.cifra-tab').forEach(btn => {
    btn.addEventListener('click', () => activarTab(btn.dataset.cifras));
  });
}

function activarTab(cifras) {
  // Tabs
  document.querySelectorAll('.cifra-tab').forEach(b => b.classList.remove('activo'));
  const tab = document.getElementById(`tab${cifras}`);
  if (tab) tab.classList.add('activo');

  // Paneles
  document.querySelectorAll('.cifra-panel').forEach(p => p.classList.add('oculto'));
  const panel = document.getElementById(`panel${cifras}`);
  if (panel) {
    panel.classList.remove('oculto');
    panel.style.animation = 'none';
    void panel.offsetHeight;
    panel.style.animation = 'fadeSlideIn 0.45s ease both';
  }

  // Actualizar URL sin recargar
  const url = new URL(window.location);
  url.searchParams.set('cifras', cifras);
  window.history.replaceState({}, '', url);
}

// ══════════════════════════════════════════════════════════════
// ANIMACION 1 CIFRA — grupos de puntos
// ══════════════════════════════════════════════════════════════
function initAnim1() {
  renderAnim1();
  document.getElementById('btnPlay1')?.addEventListener('click', playAnim1);
  document.getElementById('btnReset1')?.addEventListener('click', () => {
    idx1 = (idx1 + 1) % EJEMPLOS_1.length;
    resetAnim1();
    renderAnim1();
  });
}

function renderAnim1() {
  const { a, b } = EJEMPLOS_1[idx1];
  document.getElementById('op1Label').textContent = `${a} x ${b}`;
  document.getElementById('res1').style.display = 'none';
  document.getElementById('resNum1').textContent = '';

  const stage = document.getElementById('stage1');
  stage.innerHTML = '';

  for (let g = 0; g < a; g++) {
    const grupo = document.createElement('div');
    grupo.className = 'grupo-puntos';
    grupo.id = `grupo1-${g}`;

    const label = document.createElement('div');
    label.className = 'grupo-label';
    label.textContent = `Grupo ${g + 1}`;

    const fila = document.createElement('div');
    fila.className = 'puntos-fila';

    for (let p = 0; p < b; p++) {
      const punto = document.createElement('div');
      punto.className = 'punto';
      punto.style.animationDelay = `${p * 0.05}s`;
      fila.appendChild(punto);
    }

    grupo.appendChild(label);
    grupo.appendChild(fila);
    stage.appendChild(grupo);
  }

  document.getElementById('btnPlay1').disabled = false;
}

function resetAnim1() {
  anim1Running = false;
  document.querySelectorAll('.grupo-puntos').forEach(g => g.classList.remove('visible'));
  document.getElementById('res1').style.display = 'none';
  document.getElementById('btnPlay1').disabled = false;
}

function playAnim1() {
  if (anim1Running) return;
  anim1Running = true;
  document.getElementById('btnPlay1').disabled = true;

  const { a, b } = EJEMPLOS_1[idx1];
  const grupos = document.querySelectorAll('.grupo-puntos');

  grupos.forEach((g, i) => {
    setTimeout(() => {
      g.classList.add('visible');
      if (i === grupos.length - 1) {
        setTimeout(() => {
          const resEl = document.getElementById('res1');
          resEl.style.display = 'block';
          document.getElementById('resNum1').textContent = a * b;
          anim1Running = false;
        }, 500);
      }
    }, i * 350);
  });
}

// ══════════════════════════════════════════════════════════════
// ANIMACION 2 CIFRAS — pasos con fade in
// ══════════════════════════════════════════════════════════════
function initAnim2() {
  renderAnim2();
  document.getElementById('btnPlay2')?.addEventListener('click', playAnim2);
  document.getElementById('btnReset2')?.addEventListener('click', () => {
    idx2 = (idx2 + 1) % EJEMPLOS_2.length;
    resetAnim2();
    renderAnim2();
  });
}

function renderAnim2() {
  const { a, b } = EJEMPLOS_2[idx2];
  document.getElementById('op2Label').textContent = `${a} x ${b}`;
  document.getElementById('m2-a').textContent = a;
  document.getElementById('m2-b').textContent = b;

  const unidades = b % 10;
  const decenas  = Math.floor(b / 10);

  document.getElementById('m2-val1').textContent = `${a} x ${unidades} = ${a * unidades}`;
  document.getElementById('m2-val2').textContent = `${a} x ${decenas} = ${a * decenas} → ${a * decenas * 10}`;
  document.getElementById('m2-val3').textContent = `${a * unidades} + ${a * decenas * 10} = ${a * b}`;

  ['m2-paso1','m2-paso2','m2-paso3'].forEach(id => {
    document.getElementById(id).style.opacity = '0';
  });
  document.getElementById('m2-linea2').style.opacity = '0';
  document.getElementById('btnPlay2').disabled = false;
}

function resetAnim2() {
  anim2Running = false;
  renderAnim2();
}

function playAnim2() {
  if (anim2Running) return;
  anim2Running = true;
  document.getElementById('btnPlay2').disabled = true;

  const pasos = [
    { id: 'm2-paso1', delay: 400 },
    { id: 'm2-paso2', delay: 1400 },
    { id: 'm2-linea2', delay: 2400 },
    { id: 'm2-paso3', delay: 2600 },
  ];

  pasos.forEach(({ id, delay }) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.style.opacity = '1';
    }, delay);
  });

  setTimeout(() => { anim2Running = false; }, 3200);
}

// ══════════════════════════════════════════════════════════════
// ANIMACION 3 CIFRAS — tres pasos + suma
// ══════════════════════════════════════════════════════════════
function initAnim3() {
  renderAnim3();
  document.getElementById('btnPlay3')?.addEventListener('click', playAnim3);
  document.getElementById('btnReset3')?.addEventListener('click', () => {
    idx3 = (idx3 + 1) % EJEMPLOS_3.length;
    resetAnim3();
    renderAnim3();
  });
}

function renderAnim3() {
  const { a, b } = EJEMPLOS_3[idx3];
  document.getElementById('op3Label').textContent = `${a} x ${b}`;
  document.getElementById('m3-a').textContent = a;
  document.getElementById('m3-b').textContent = b;

  const u  = b % 10;
  const d  = Math.floor((b % 100) / 10);
  const c  = Math.floor(b / 100);

  const r1 = a * u;
  const r2 = a * d * 10;
  const r3 = a * c * 100;

  document.getElementById('m3-val1').textContent = `${a} x ${u} = ${r1}`;
  document.getElementById('m3-val2').textContent = `${a} x ${d} = ${a * d} → ${r2}`;
  document.getElementById('m3-val3').textContent = `${a} x ${c} = ${a * c} → ${r3}`;
  document.getElementById('m3-val4').textContent = `${r1} + ${r2} + ${r3} = ${a * b}`;

  ['m3-paso1','m3-paso2','m3-paso3','m3-paso4','m3-linea'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '0';
  });
  document.getElementById('btnPlay3').disabled = false;
}

function resetAnim3() {
  anim3Running = false;
  renderAnim3();
}

function playAnim3() {
  if (anim3Running) return;
  anim3Running = true;
  document.getElementById('btnPlay3').disabled = true;

  const pasos = [
    { id: 'm3-paso1', delay: 400  },
    { id: 'm3-paso2', delay: 1400 },
    { id: 'm3-paso3', delay: 2400 },
    { id: 'm3-linea', delay: 3400 },
    { id: 'm3-paso4', delay: 3600 },
  ];

  pasos.forEach(({ id, delay }) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.style.opacity = '1';
    }, delay);
  });

  setTimeout(() => { anim3Running = false; }, 4400);
}