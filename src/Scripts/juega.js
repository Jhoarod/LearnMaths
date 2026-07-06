'use strict';

/* ============================================================
   MateMagia — juega.js
   Juego de cartas de multiplicacion con personajes
   © Proyecto Exclusivo
   ============================================================ */

// ── DATOS POR NIVEL ─────────────────────────────────────────
const PARES_POR_NIVEL = {
  1: [
    { op: '3 x 4', res: '12' }, { op: '5 x 2', res: '10' },
    { op: '6 x 3', res: '18' }, { op: '7 x 4', res: '28' },
    { op: '8 x 2', res: '16' }, { op: '9 x 3', res: '27' },
  ],
  2: [
    { op: '12 x 3', res: '36'  }, { op: '21 x 4', res: '84'  },
    { op: '15 x 5', res: '75'  }, { op: '23 x 2', res: '46'  },
    { op: '31 x 3', res: '93'  }, { op: '14 x 4', res: '56'  },
  ],
  3: [
    { op: '121 x 3', res: '363' }, { op: '212 x 2', res: '424' },
    { op: '132 x 3', res: '396' }, { op: '221 x 4', res: '884' },
    { op: '113 x 5', res: '565' }, { op: '312 x 2', res: '624' },
  ],
};

const FRASES_CORRECTO = [
  'Excelente! Muy bien!',
  'Eso es! Lo lograste!',
  'Genial! Eres muy listo!',
  'Perfecto! Sigue asi!',
  'Increible! Eres un crack!',
];

const FRASES_INCORRECTO = [
  'Casi! Intentalo de nuevo!',
  'No te rindas! Puedes!',
  'Sigue intentando!',
  'Un error mas y lo tienes!',
  'Animo! Casi lo tienes!',
];

const FRASES_INICIO = ['Buena suerte!', 'Yo te ayudo!'];

// ── ESTADO DEL JUEGO ────────────────────────────────────────
let estado = {
  nivel: 1,
  cartasVolteadas: [],
  cartasEncontradas: 0,
  intentos: 0,
  bloqueado: false,
  timerInterval: null,
  segundos: 0,
  jugando: false,
};

// ── INICIO ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  bindNiveles();
  bindControles();
  nuevaPartida();
});

// ── SELECTOR DE NIVEL ────────────────────────────────────────
function bindNiveles() {
  document.querySelectorAll('.nivel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nivel-btn').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      estado.nivel = parseInt(btn.dataset.nivel);
      nuevaPartida();
    });
  });
}

// ── CONTROLES ────────────────────────────────────────────────
function bindControles() {
  document.getElementById('btnNuevaPartida')
    ?.addEventListener('click', nuevaPartida);

  document.getElementById('btnVerProgreso')
    ?.addEventListener('click', () => {
      window.location.href = 'progreso.html';
    });

  document.getElementById('btnJugarOtraVez')
    ?.addEventListener('click', () => {
      cerrarModal();
      nuevaPartida();
    });

  document.getElementById('btnIrProgreso')
    ?.addEventListener('click', () => {
      window.location.href = 'progreso.html';
    });
}

// ── NUEVA PARTIDA ─────────────────────────────────────────────
function nuevaPartida() {
  // Resetear estado
  detenerTimer();
  estado.cartasVolteadas  = [];
  estado.cartasEncontradas = 0;
  estado.intentos          = 0;
  estado.bloqueado         = false;
  estado.jugando           = false;
  estado.segundos          = 0;

  actualizarStats();
  setReaccion('inicio');
  renderTablero();
  cerrarModal();
}

// ── RENDER DEL TABLERO ────────────────────────────────────────
function renderTablero() {
  const tablero = document.getElementById('tablero');
  if (!tablero) return;

  const pares = PARES_POR_NIVEL[estado.nivel];

  // Crear array de cartas: una por operacion y una por resultado
  let cartas = [];
  pares.forEach((par, i) => {
    cartas.push({ id: i, tipo: 'operacion', texto: par.op,  parejaid: i });
    cartas.push({ id: i, tipo: 'resultado', texto: par.res, parejaid: i });
  });

  // Mezclar
  cartas = mezclar(cartas);

  // Renderizar
  tablero.innerHTML = '';
  cartas.forEach((carta, idx) => {
    const el = document.createElement('div');
    el.className   = 'carta';
    el.dataset.idx      = idx;
    el.dataset.parejaid = carta.parejaid;
    el.dataset.tipo     = carta.tipo;
    el.dataset.texto    = carta.texto;

    el.innerHTML = `
      <div class="carta-trasera">
        <div class="carta-trasera-simbolo">x</div>
      </div>
      <div class="carta-frente">
        <div class="carta-tipo">${carta.tipo === 'operacion' ? 'Operacion' : 'Resultado'}</div>
        <div class="carta-contenido ${carta.tipo === 'resultado' ? 'es-resultado' : ''}">${carta.texto}</div>
      </div>
    `;

    el.addEventListener('click', () => clickCarta(el));
    tablero.appendChild(el);
  });
}

// ── CLICK EN CARTA ────────────────────────────────────────────
function clickCarta(el) {
  if (estado.bloqueado) return;
  if (el.classList.contains('volteada')) return;
  if (el.classList.contains('encontrada')) return;
  if (estado.cartasVolteadas.length >= 2) return;

  // Iniciar timer al primer click
  if (!estado.jugando) {
    estado.jugando = true;
    iniciarTimer();
  }

  el.classList.add('volteada');
  estado.cartasVolteadas.push(el);

  if (estado.cartasVolteadas.length === 2) {
    estado.intentos++;
    actualizarStats();
    estado.bloqueado = true;

    setTimeout(() => verificarPar(), 700);
  }
}

// ── VERIFICAR PAR ─────────────────────────────────────────────
function verificarPar() {
  const [c1, c2] = estado.cartasVolteadas;
  const mismaPareja = c1.dataset.parejaid === c2.dataset.parejaid;
  const tiposDist   = c1.dataset.tipo !== c2.dataset.tipo;

  if (mismaPareja && tiposDist) {
    // PAR CORRECTO
    c1.classList.add('encontrada');
    c2.classList.add('encontrada');
    estado.cartasEncontradas++;
    actualizarStats();
    setReaccion('correcto');

    if (estado.cartasEncontradas === 6) {
      setTimeout(mostrarVictoria, 600);
    }
  } else {
    // INCORRECTO
    c1.classList.add('incorrecta');
    c2.classList.add('incorrecta');
    setReaccion('incorrecto');

    setTimeout(() => {
      c1.classList.remove('volteada', 'incorrecta');
      c2.classList.remove('volteada', 'incorrecta');
    }, 900);
  }

  estado.cartasVolteadas = [];
  estado.bloqueado = false;
}

// ── TIMER ─────────────────────────────────────────────────────
function iniciarTimer() {
  estado.segundos = 0;
  estado.timerInterval = setInterval(() => {
    estado.segundos++;
    const el = document.getElementById('contadorTiempo');
    if (el) el.textContent = `${estado.segundos}s`;
  }, 1000);
}

function detenerTimer() {
  if (estado.timerInterval) {
    clearInterval(estado.timerInterval);
    estado.timerInterval = null;
  }
}

// ── ESTADISTICAS ──────────────────────────────────────────────
function actualizarStats() {
  const elI = document.getElementById('contadorIntentos');
  const elP = document.getElementById('contadorParejas');
  if (elI) elI.textContent = estado.intentos;
  if (elP) elP.textContent = `${estado.cartasEncontradas} / 6`;
}

// ── REACCIONES DE PERSONAJES ──────────────────────────────────
function setReaccion(tipo) {
  const izq = document.getElementById('reaccionIzq');
  const der = document.getElementById('reaccionDer');
  if (!izq || !der) return;

  let frase = '';
  let clase  = '';

  if (tipo === 'correcto') {
    frase = FRASES_CORRECTO[Math.floor(Math.random() * FRASES_CORRECTO.length)];
    clase = 'correcto';
  } else if (tipo === 'incorrecto') {
    frase = FRASES_INCORRECTO[Math.floor(Math.random() * FRASES_INCORRECTO.length)];
    clase = 'incorrecto';
  } else {
    izq.textContent = FRASES_INICIO[0];
    der.textContent = FRASES_INICIO[1];
    izq.className   = 'personaje-reaccion';
    der.className   = 'personaje-reaccion';
    return;
  }

  [izq, der].forEach(el => {
    el.textContent = frase;
    el.className   = `personaje-reaccion ${clase}`;
    setTimeout(() => { el.className = 'personaje-reaccion'; }, 1400);
  });
}

// ── VICTORIA ─────────────────────────────────────────────────
function mostrarVictoria() {
  detenerTimer();

  const estrellas = calcularEstrellas(estado.intentos, estado.segundos);

  const elIntentos   = document.getElementById('resIntentos');
  const elTiempo     = document.getElementById('resTiempo');
  const elEstrellas  = document.getElementById('resEstrellas');

  if (elIntentos)  elIntentos.textContent  = estado.intentos;
  if (elTiempo)    elTiempo.textContent    = `${estado.segundos}s`;
  if (elEstrellas) elEstrellas.textContent = '★'.repeat(estrellas) + '☆'.repeat(3 - estrellas);

  // Guardar en localStorage
  guardarResultado(estado.nivel, estado.intentos, estado.segundos, estrellas);

  document.getElementById('modalVictoria').style.display = 'flex';
}

function cerrarModal() {
  const m = document.getElementById('modalVictoria');
  if (m) m.style.display = 'none';
}

function calcularEstrellas(intentos, segundos) {
  if (intentos <= 7  && segundos <= 40) return 3;
  if (intentos <= 10 && segundos <= 70) return 2;
  return 1;
}

// ── GUARDAR RESULTADO ─────────────────────────────────────────
function guardarResultado(nivel, intentos, segundos, estrellas) {
  try {
    const key     = 'matemagia_resultados';
    const guardado = JSON.parse(localStorage.getItem(key) || '[]');
    guardado.push({
      fecha:    new Date().toLocaleDateString('es-CO'),
      nivel,
      intentos,
      segundos,
      estrellas,
    });
    // Guardar solo los ultimos 50
    if (guardado.length > 50) guardado.splice(0, guardado.length - 50);
    localStorage.setItem(key, JSON.stringify(guardado));
  } catch (_) {}
}

// ── UTILIDAD: MEZCLAR ARRAY ───────────────────────────────────
function mezclar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}