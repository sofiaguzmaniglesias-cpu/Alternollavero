// Llavero en 3D con model-viewer
const visor = document.getElementById('llavero');
const barra = document.getElementById('barra');
const btnGirar = document.getElementById('btn-girar');
const btnReset = document.getElementById('btn-reset');

const VISTA_INICIAL = '-25deg 78deg 0.3m';

// Barra de carga
visor.addEventListener('progress', (e) => {
  const p = e.detail.totalProgress;
  barra.style.width = `${p * 100}%`;
  if (p === 1) barra.parentElement.classList.add('oculta');
});

// Colores del llavero (sacados del degradado)
const COLORES = [
  { nombre: 'Naranja', hex: '#c0693b' },
  { nombre: 'Rosa',    hex: '#c06b9a' },
  { nombre: 'Morado',  hex: '#8a5a94' },
  { nombre: 'Azul',    hex: '#323464' },
  { nombre: 'Blanco',  hex: '#f7f4ed' },
];
const BLANCO = 4;
let colorActual = BLANCO; // al entrar, el llavero está en blanco
const btnColor = document.getElementById('btn-color');
const nombreColor = document.getElementById('nombre-color');
const muestras = document.querySelectorAll('.muestra');

function aplicarColor(i) {
  colorActual = i;
  nombreColor.textContent = COLORES[i].nombre;
  muestras.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
  if (!visor.model) return;
  for (const m of visor.model.materials) {
    if (m.name !== 'metal') m.pbrMetallicRoughness.setBaseColorFactor(COLORES[i].hex);
  }
}

// El botón de color va pasando por los 4 colores (desde blanco empieza en naranja)
btnColor.addEventListener('click', () => aplicarColor(colorActual === BLANCO ? 0 : (colorActual + 1) % BLANCO));
document.getElementById('btn-blanco').addEventListener('click', () => aplicarColor(BLANCO));
muestras.forEach((b) => b.addEventListener('click', () => aplicarColor(Number(b.dataset.color))));

// Materiales: pieza en plástico de color y cadena en acero
visor.addEventListener('load', () => {
  for (const m of visor.model.materials) {
    const pbr = m.pbrMetallicRoughness;
    if (m.name === 'metal') {
      pbr.setBaseColorFactor([0.88, 0.89, 0.91, 1]);
      pbr.setMetallicFactor(1);
      pbr.setRoughnessFactor(0.22);
    } else {
      pbr.setBaseColorFactor([0.97, 0.955, 0.93, 1]);
      pbr.setMetallicFactor(0);
      pbr.setRoughnessFactor(0.55);
    }
  }
  aplicarColor(colorActual);
});

// Pausar / reanudar el giro automático
btnGirar.addEventListener('click', () => {
  const girando = visor.hasAttribute('auto-rotate');
  if (girando) {
    visor.removeAttribute('auto-rotate');
    btnGirar.querySelector('.icono').textContent = '▶';
    btnGirar.setAttribute('aria-label', 'Girar');
    btnGirar.title = 'Girar';
  } else {
    visor.setAttribute('auto-rotate', '');
    btnGirar.querySelector('.icono').textContent = '❚❚';
    btnGirar.setAttribute('aria-label', 'Pausar giro');
    btnGirar.title = 'Pausar giro';
  }
  btnGirar.setAttribute('aria-pressed', String(!girando));
});

// Volver a la vista de frente
btnReset.addEventListener('click', () => {
  visor.cameraOrbit = VISTA_INICIAL;
  visor.cameraTarget = '0m 0m 0m';
  visor.fieldOfView = '36deg';
  visor.resetTurntableRotation();
  visor.jumpCameraToGoal();
});

// Cursor personalizado (solo con ratón)
const cursor = document.querySelector('.cursor');
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.documentElement.classList.add('cursor-propio');
  window.addEventListener('pointermove', (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    cursor.classList.add('visible');
    cursor.classList.toggle('sobre-boton', !!e.target.closest('button'));
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('visible'));
  window.addEventListener('pointerdown', () => cursor.classList.add('pulsado'));
  window.addEventListener('pointerup', () => cursor.classList.remove('pulsado'));
}
