'use strict';

/* ============================================================
   MateMagia — progreso.js
   Tabla de progreso del salon gestionada por el profesor
   Almacenamiento: localStorage (sin BD)
   © Proyecto Exclusivo
   ============================================================ */

const KEY_ESTUDIANTES = 'matemagia_estudiantes';
const KEY_RESULTADOS  = 'matemagia_resultados';

// ── ESTADO ──────────────────────────────────────────────────
let pendienteEliminar = null; // id del estudiante a eliminar
let pendienteLimpiar  = false;

// ── INICIO ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  bindEventos();
  renderTabla();
});

// ── BIND DE EVENTOS ──────────────────────────────────────────
function bindEventos() {
  // Agregar estudiante
  document.getElementById('btnAgregar')
    ?.addEventListener('click', agregarEstudiante);

  // Enter en el input
  document.getElementById('inputNombre')
    ?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') agregarEstudiante();
    });

  // Limpiar todo
  document.getElementById('btnLimpiarTodo')
    ?.addEventListener('click', () => {
      pendienteLimpiar = true;
      pendienteEliminar = null;
      mostrarModal(
        'Limpiar todo',
        'Se eliminaran todos los estudiantes y su progreso. Esta accion no se puede deshacer.'
      );
    });

  // Bloquear panel (oculta los controles de edicion)
  document.getElementById('btnLock')
    ?.addEventListener('click', toggleBloqueo);

  // Mini modal
  document.getElementById('miniModalConfirm')
    ?.addEventListener('click', confirmarAccion);

  document.getElementById('miniModalCancel')
    ?.addEventListener('click', cerrarModal);
}

// ── AGREGAR ESTUDIANTE ────────────────────────────────────────
function agregarEstudiante() {
  const input = document.getElementById('inputNombre');
  const nombre = input?.value.trim();

  if (!nombre) {
    mostrarToast('Escribe el nombre del estudiante.');
    return;
  }

  const estudiantes = cargarEstudiantes();

  // Verificar duplicado
  const existe = estudiantes.some(e => e.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe) {
    mostrarToast(`"${nombre}" ya esta en la lista.`);
    return;
  }

  estudiantes.push({
    id:          Date.now(),
    nombre,
    estrellas:   0,
    partidas:    0,
    mejorTiempo: null,
    fechaAgregado: new Date().toLocaleDateString('es-CO'),
  });

  guardarEstudiantes(estudiantes);
  if (input) input.value = '';
  renderTabla();
  mostrarToast(`${nombre} agregado correctamente.`);
}

// ── ELIMINAR ESTUDIANTE ───────────────────────────────────────
function solicitarEliminar(id, nombre) {
  pendienteEliminar = id;
  pendienteLimpiar  = false;
  mostrarModal('Eliminar estudiante', `Se eliminara a "${nombre}" y todo su progreso.`);
}

function confirmarAccion() {
  if (pendienteLimpiar) {
    localStorage.removeItem(KEY_ESTUDIANTES);
    localStorage.removeItem(KEY_RESULTADOS);
    mostrarToast('Todos los datos fueron eliminados.');
  } else if (pendienteEliminar !== null) {
    let estudiantes = cargarEstudiantes();
    estudiantes = estudiantes.filter(e => e.id !== pendienteEliminar);
    guardarEstudiantes(estudiantes);
    mostrarToast('Estudiante eliminado.');
  }

  pendienteEliminar = null;
  pendienteLimpiar  = false;
  cerrarModal();
  renderTabla();
}

// ── EDITAR ESTRELLAS ──────────────────────────────────────────
function agregarEstrella(id) {
  const estudiantes = cargarEstudiantes();
  const est = estudiantes.find(e => e.id === id);
  if (!est) return;
  est.estrellas = Math.min(est.estrellas + 1, 15); // max 15 estrellas
  est.partidas  = (est.partidas || 0) + 1;
  guardarEstudiantes(estudiantes);
  renderTabla();
}

function quitarEstrella(id) {
  const estudiantes = cargarEstudiantes();
  const est = estudiantes.find(e => e.id === id);
  if (!est || est.estrellas <= 0) return;
  est.estrellas--;
  guardarEstudiantes(estudiantes);
  renderTabla();
}

// ── RENDER TABLA ──────────────────────────────────────────────
function renderTabla() {
  const estudiantes = cargarEstudiantes();
  const tbody       = document.getElementById('tablaBody');
  const vacia       = document.getElementById('tablaVacia');
  const tabla       = document.getElementById('tablaProgreso');

  if (!tbody) return;

  if (estudiantes.length === 0) {
    tbody.innerHTML = '';
    vacia?.classList.add('visible');
    if (tabla) tabla.style.display = 'none';
    return;
  }

  vacia?.classList.remove('visible');
  if (tabla) tabla.style.display = 'table';

  // Ordenar por estrellas descendente
  const ordenados = [...estudiantes].sort((a, b) => b.estrellas - a.estrellas);

  tbody.innerHTML = ordenados.map((est, idx) => {
    const pos     = idx + 1;
    const medalla = pos === 1 ? '<span class="medalla-1">1</span>'
                  : pos === 2 ? '<span class="medalla-2">2</span>'
                  : pos === 3 ? '<span class="medalla-3">3</span>'
                  : `<span class="medalla-n">${pos}</span>`;

    const estrellas = renderEstrellas(est.estrellas);
    const mejor     = est.mejorTiempo ? `${est.mejorTiempo}s` : '—';

    return `
      <tr data-id="${est.id}">
        <td class="td-pos">${medalla}</td>
        <td class="td-nombre">${escapeHtml(est.nombre)}</td>
        <td class="td-estrellas">
          <div class="estrellas-ctrl">
            <button class="estrella-btn menos" data-id="${est.id}" title="Quitar estrella">-</button>
            <span class="estrellas-display">${estrellas}</span>
            <button class="estrella-btn mas" data-id="${est.id}" title="Dar estrella">+</button>
          </div>
        </td>
        <td class="td-partidas">${est.partidas || 0}</td>
        <td class="td-mejor">${mejor}</td>
        <td class="td-acciones">
          <button class="btn-eliminar" data-id="${est.id}" data-nombre="${escapeHtml(est.nombre)}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');

  // Bind de botones generados dinamicamente
  tbody.querySelectorAll('.estrella-btn.mas').forEach(btn => {
    btn.addEventListener('click', () => agregarEstrella(parseInt(btn.dataset.id)));
  });

  tbody.querySelectorAll('.estrella-btn.menos').forEach(btn => {
    btn.addEventListener('click', () => quitarEstrella(parseInt(btn.dataset.id)));
  });

  tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => solicitarEliminar(parseInt(btn.dataset.id), btn.dataset.nombre));
  });
}

function renderEstrellas(n) {
  const llenas  = Math.min(n, 15);
  const vacias  = Math.max(0, 3 - llenas % 3 === 3 ? 0 : 3 - llenas % 3);
  let html = '';

  for (let i = 0; i < llenas; i++) {
    html += '<span class="estrella-on">&#9733;</span>';
  }
  // Mostrar huecos solo si tiene menos de 3 estrellas totales
  if (llenas < 3) {
    for (let i = 0; i < 3 - llenas; i++) {
      html += '<span class="estrella-off">&#9733;</span>';
    }
  }

  if (llenas === 0) return '<span class="estrella-off">&#9733;&#9733;&#9733;</span>';
  return html || '<span class="estrella-off">&#9733;&#9733;&#9733;</span>';
}

// ── BLOQUEO DEL PANEL ─────────────────────────────────────────
function toggleBloqueo() {
  const agregar  = document.querySelector('.agregar-zona');
  const footer   = document.querySelector('.panel-footer');
  const acciones = document.querySelectorAll('.td-acciones, .th-acciones, .estrella-btn');
  const btnLock  = document.getElementById('btnLock');

  const bloqueado = agregar?.style.display === 'none';

  if (!bloqueado) {
    if (agregar) agregar.style.display = 'none';
    if (footer)  footer.style.display  = 'none';
    acciones.forEach(el => { el.style.display = 'none'; });
    if (btnLock) btnLock.textContent = 'Desbloquear panel';
    mostrarToast('Panel bloqueado. Solo lectura.');
  } else {
    if (agregar) agregar.style.display = '';
    if (footer)  footer.style.display  = '';
    acciones.forEach(el => { el.style.display = ''; });
    if (btnLock) btnLock.textContent = 'Bloquear panel';
    mostrarToast('Panel desbloqueado.');
  }
}

// ── MINI MODAL ────────────────────────────────────────────────
function mostrarModal(titulo, texto) {
  document.getElementById('miniModalTitulo').textContent = titulo;
  document.getElementById('miniModalTexto').textContent  = texto;
  document.getElementById('miniModal').style.display     = 'flex';
}

function cerrarModal() {
  document.getElementById('miniModal').style.display = 'none';
}

// ── STORAGE ──────────────────────────────────────────────────
function cargarEstudiantes() {
  try {
    return JSON.parse(localStorage.getItem(KEY_ESTUDIANTES) || '[]');
  } catch (_) { return []; }
}

function guardarEstudiantes(arr) {
  try {
    localStorage.setItem(KEY_ESTUDIANTES, JSON.stringify(arr));
  } catch (_) {}
}

// ── UTILIDADES ────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mostrarToast(msg) {
  // Usa el showToast de app.js si existe, sino crea uno basico
  if (typeof showToast === 'function') {
    showToast(msg);
  } else {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2800);
  }
}

// Estilos inline para botones de estrellas (complementa el CSS)
const style = document.createElement('style');
style.textContent = `
  .estrellas-ctrl {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .estrella-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,214,0,0.3);
    background: transparent;
    color: var(--amarillo, #FFD600);
    font-size: 0.9rem;
    font-weight: 900;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, border-color 0.2s;
    line-height: 1;
    font-family: 'Nunito', sans-serif;
  }
  .estrella-btn:hover {
    background: rgba(255,214,0,0.15);
    border-color: #FFD600;
  }
  .estrellas-display {
    font-size: 1rem;
    letter-spacing: 1px;
    min-width: 60px;
    text-align: center;
  }
`;
document.head.appendChild(style);