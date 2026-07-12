'use strict';
/* ============================================================
   MateMagia — compite.js
   Ruleta de multiplicacion con canvas + resultado oculto
   © Proyecto Exclusivo
   ============================================================ */

// ── BANCO DE EJERCICIOS ──────────────────────────────────────
const EJERCICIOS = {
  1: [
    {a:3,b:4},{a:5,b:2},{a:6,b:3},{a:7,b:4},{a:8,b:2},
    {a:9,b:3},{a:4,b:4},{a:6,b:5},{a:7,b:7},{a:8,b:6},
    {a:9,b:5},{a:3,b:8},{a:4,b:7},{a:5,b:6},{a:9,b:9},
  ],
  2: [
    {a:12,b:3},{a:21,b:4},{a:15,b:5},{a:23,b:3},{a:31,b:2},
    {a:14,b:4},{a:25,b:3},{a:32,b:4},{a:41,b:5},{a:13,b:6},
    {a:22,b:4},{a:34,b:3},{a:43,b:2},{a:16,b:5},{a:28,b:3},
  ],
  3: [
    {a:121,b:3},{a:212,b:2},{a:132,b:3},{a:221,b:4},{a:113,b:5},
    {a:312,b:2},{a:123,b:4},{a:231,b:3},{a:321,b:2},{a:142,b:3},
    {a:213,b:4},{a:124,b:5},{a:314,b:2},{a:241,b:3},{a:132,b:4},
  ],
};

// Colores de la ruleta
const COLORES_RULETA = [
  '#2C5FD4','#E84A7F','#4AE8C4','#FFD600','#A14AE8',
  '#E8A14A','#1A3A8F','#70f107','#FF6B6B','#4AC8E8',
  '#E8D14A','#C44AE8','#4AE870','#E8774A','#4A8AE8',
];

const FRASES_BURBUJA = [
  'A ver quien sabe mas!',
  'Piensa bien la respuesta!',
  'Esta es facil, cierto?',
  'Vamos, concentrate!',
  'Tu puedes con esta!',
  'No mires la respuesta todavia!',
];

// ── ESTADO ──────────────────────────────────────────────────
let nivelActual     = 1;
let girando         = false;
let anguloActual    = 0;
let ejercicioActual = null;
let segmentos       = [];

// ── INICIO ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  bindNivel();
  bindRuleta();
  bindRevelar();
  construirSegmentos();
  dibujarRuleta();
  animarBurbujas();
});

// ── NIVEL ────────────────────────────────────────────────────
function bindNivel() {
  document.querySelectorAll('.nivel-btn-c').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nivel-btn-c').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      nivelActual = parseInt(btn.dataset.nivel);
      construirSegmentos();
      dibujarRuleta();
      ocultarEjercicio();
    });
  });
}

// ── SEGMENTOS ────────────────────────────────────────────────
function construirSegmentos() {
  let pool = [];
  if (nivelActual === 0) {
    pool = [...EJERCICIOS[1], ...EJERCICIOS[2], ...EJERCICIOS[3]];
  } else {
    pool = [...EJERCICIOS[nivelActual]];
  }
  // Tomar 10 aleatorios mezclados para la ruleta
  segmentos = mezclar(pool).slice(0, 10).map(e => ({
    op:  `${e.a} x ${e.b}`,
    res: e.a * e.b,
    a:   e.a,
    b:   e.b,
  }));
}

// ── DIBUJAR RULETA ───────────────────────────────────────────
function dibujarRuleta(rotacion = 0) {
  const canvas = document.getElementById('ruletaCanvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const n      = segmentos.length;
  const arco   = (2 * Math.PI) / n;
  const cx     = canvas.width  / 2;
  const cy     = canvas.height / 2;
  const r      = Math.min(cx, cy) - 4;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  segmentos.forEach((seg, i) => {
    const inicio = rotacion + i * arco - Math.PI / 2;
    const fin    = inicio + arco;

    // Sector
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, inicio, fin);
    ctx.closePath();
    ctx.fillStyle = COLORES_RULETA[i % COLORES_RULETA.length];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Texto
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(inicio + arco / 2);
    ctx.textAlign    = 'right';
    ctx.fillStyle    = '#fff';
    ctx.font         = `bold ${n <= 8 ? 14 : 12}px Nunito, sans-serif`;
    ctx.shadowColor  = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur   = 4;
    ctx.fillText(seg.op, r - 10, 5);
    ctx.restore();
  });

  // Centro
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
  ctx.fillStyle = '#0D1F4E';
  ctx.fill();
  ctx.strokeStyle = '#FFD600';
  ctx.lineWidth   = 3;
  ctx.stroke();

  ctx.fillStyle    = '#FFD600';
  ctx.font         = 'bold 16px Fredoka One, cursive';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('x', cx, cy + 1);
}

// ── GIRAR RULETA ─────────────────────────────────────────────
function bindRuleta() {
  document.getElementById('btnGirar')?.addEventListener('click', girarRuleta);
  document.getElementById('btnOtroEjercicio')?.addEventListener('click', () => {
    ocultarEjercicio();
    girarRuleta();
  });
}

function girarRuleta() {
  if (girando) return;
  girando = true;

  const btnGirar = document.getElementById('btnGirar');
  if (btnGirar) btnGirar.disabled = true;

  ocultarEjercicio();

  const vueltasExtra = 5 + Math.random() * 5;  // 5-10 vueltas extra
  const segIdxFinal  = Math.floor(Math.random() * segmentos.length);
  const arco         = (2 * Math.PI) / segmentos.length;

  // Calcular angulo final para que apunte al segmento elegido
  // La flecha apunta hacia arriba (angulo 0 = -PI/2)
  const anguloFinal = anguloActual + vueltasExtra * 2 * Math.PI
                    + (2 * Math.PI - segIdxFinal * arco) - anguloActual % (2 * Math.PI);

  const duracion = 4000 + Math.random() * 1500;
  const inicio   = performance.now();
  const anguloInicio = anguloActual;

  function animar(ts) {
    const t       = Math.min((ts - inicio) / duracion, 1);
    const ease    = 1 - Math.pow(1 - t, 4); // ease out quartic
    const angulo  = anguloInicio + (anguloFinal - anguloInicio) * ease;

    anguloActual = angulo;
    dibujarRuleta(angulo);

    if (t < 1) {
      requestAnimationFrame(animar);
    } else {
      girando = false;
      if (btnGirar) btnGirar.disabled = false;
      ejercicioActual = segmentos[segIdxFinal];
      mostrarEjercicio(ejercicioActual);
    }
  }

  requestAnimationFrame(animar);
}

// ── MOSTRAR / OCULTAR EJERCICIO ───────────────────────────────
function mostrarEjercicio(ej) {
  const zona = document.getElementById('ejercicioZona');
  const op   = document.getElementById('ejercicioOp');
  if (zona) zona.style.display = 'flex';
  if (op)   op.textContent     = ej.op + ' = ?';

  // Resetear tarjeta
  const tarjeta = document.getElementById('resultadoTarjeta');
  if (tarjeta) tarjeta.classList.remove('revelada');

  // Resultado oculto
  document.getElementById('resultadoNum').textContent      = ej.res;
  document.getElementById('resultadoOpCompleta').textContent = `${ej.op} = ${ej.res}`;

  // Emocionar burbujas
  emocionar();
}

function ocultarEjercicio() {
  const zona = document.getElementById('ejercicioZona');
  if (zona) zona.style.display = 'none';
  const tarjeta = document.getElementById('resultadoTarjeta');
  if (tarjeta) tarjeta.classList.remove('revelada');
}

// ── REVELAR RESULTADO ─────────────────────────────────────────
function bindRevelar() {
  document.getElementById('btnRevelar')?.addEventListener('click', () => {
    const tarjeta = document.getElementById('resultadoTarjeta');
    if (tarjeta) tarjeta.classList.add('revelada');
  });

  document.getElementById('resultadoTarjeta')?.addEventListener('click', (e) => {
    if (e.target.id === 'btnRevelar') return;
    const tarjeta = document.getElementById('resultadoTarjeta');
    if (tarjeta && !tarjeta.classList.contains('revelada')) {
      tarjeta.classList.add('revelada');
    }
  });
}

// ── ANIMACION BURBUJAS ────────────────────────────────────────
function animarBurbujas() {
  const burbujas = [
    document.getElementById('burbujaIzq'),
    document.getElementById('burbujasDer'),
  ];
  const frases = [
    ['Lista para girar!', 'Quien sabe mas?', 'A ver que sale!', 'Yo gano seguro!'],
    ['Yo voy a ganar!', 'Concentrate bien!', 'Esta la se!', 'Facil para mi!'],
  ];
  burbujas.forEach((b, bi) => {
    if (!b) return;
    let fi = 0;
    setInterval(() => {
      fi = (fi + 1) % frases[bi].length;
      b.textContent = frases[bi][fi];
    }, 4000 + bi * 1500);
  });
}

function emocionar() {
  const burbujas = [
    document.getElementById('burbujaIzq'),
    document.getElementById('burbujasDer'),
  ];
  burbujas.forEach(b => {
    if (!b) return;
    b.textContent = FRASES_BURBUJA[Math.floor(Math.random() * FRASES_BURBUJA.length)];
    b.classList.add('emocion');
    setTimeout(() => b.classList.remove('emocion'), 1200);
  });
}

// ── UTILIDAD ─────────────────────────────────────────────────
function mezclar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}