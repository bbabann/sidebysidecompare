const $ = (id) => document.getElementById(id);
const screens = ['start', 'spec', 'end', 'picker'];
const fxRoot = $('fx');

let device = null;
let step = -1; // -1 = start screen, SCALES.length = end screen

const show = (name) => screens.forEach((s) => { $(s).hidden = s !== name; });

// Position of a value on its absolute scale, 0–100.
const levelOf = (scale, value) => {
  const t = (value - scale.min) / (scale.max - scale.min);
  return Math.round(Math.min(1, Math.max(0, t)) * 100);
};

const format = (value, decimals) =>
  value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const countUp = (el, target, decimals, duration = 1600) => {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = format(target * eased, decimals);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

// Share of the screen below the text, matching --stage in style.css.
const STAGE = 0.72;

// Run `fn` after the initial state has been painted, so CSS transitions play.
const nextFrame = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

const el = (cls, parent, vars = {}) => {
  const node = document.createElement('div');
  node.className = cls;
  Object.entries(vars).forEach(([k, v]) => node.style.setProperty(k, v));
  parent.appendChild(node);
  return node;
};

const rand = (min, max) => min + Math.random() * (max - min);

// One visual per spec. Each receives the fx layer and a 0–100 level.
const FX = {
  // Brightness: a light bloom whose reach grows with the level.
  glow(root, level) {
    el('fx-dusk', root);
    const glow = el('fx-glow', root, { '--size': `${40 + level * 1.8}vmax` });
    nextFrame(() => glow.classList.add('is-on'));
  },

  // RAM: glass discs drop in and stack up to the level height.
  stack(root, level) {
    el('fx-pedestal', root);
    const stack = el('fx-stack', root);
    const count = Math.max(1, Math.round((level / 100) * 12));
    const height = (level / 100) * 0.62 * window.innerHeight;
    const discs = [];
    for (let i = 0; i < count; i++) {
      const disc = el('fx-disc', stack, {
        '--tilt': `${i % 2 ? 4 : -5}deg`,
        '--delay': `${i * 110}ms`,
      });
      disc.style.bottom = `${count > 1 ? (i * height) / (count - 1) : 0}px`;
      discs.push(disc);
    }
    nextFrame(() => discs.forEach((d) => d.classList.add('is-on')));
  },

  // Battery: liquid rises with a moving surface and bubbles.
  liquid(root, level) {
    const liquid = el('fx-liquid', root);
    for (let i = 0; i < 14; i++) {
      const bubble = el('fx-bubble', liquid, {
        '--s': `${rand(4, 10)}px`,
        '--d': `${rand(3, 6)}s`,
        '--delay': `${rand(0, 4)}s`,
      });
      bubble.style.left = `${rand(0, 100)}%`;
    }
    nextFrame(() => { liquid.style.height = `${level * STAGE}%`; });
  },

  // CPU: a band of light streaks; higher level = taller band, faster streaks.
  speed(root, level) {
    const band = el('fx-speed', root);
    const duration = 1.4 - level / 100;
    for (let i = 0; i < 22; i++) {
      const streak = el('fx-streak', band, {
        '--w': `${rand(20, 55)}vw`,
        '--d': `${rand(duration * 0.8, duration * 1.2)}s`,
        '--delay': `${rand(0, 1)}s`,
      });
      streak.style.top = `${rand(2, 98)}%`;
    }
    nextFrame(() => { band.style.height = `${level * STAGE}%`; });
  },

  // Display size: a frame expands from the stage center; 100 fills the stage.
  frame(root, level) {
    const frame = el('fx-frame', root);
    for (let i = 0; i < 4; i++) el('fx-handle', frame);
    const t = 0.2 + (level / 100) * 0.8;
    nextFrame(() => {
      frame.style.width = `${t * 100}%`;
      frame.style.height = `${t * STAGE * 100}%`;
    });
  },

  // Thickness: a slab presses down; higher level (slimmer) = thinner slab.
  slab(root, level) {
    const slab = el('fx-slab', root);
    nextFrame(() => { slab.style.height = `${6 + (1 - level / 100) * 40}vh`; });
  },

  // Storage: grid cells light up from the bottom, level% of all cells.
  grid(root, level) {
    const cols = 8;
    const rows = 12;
    const lit = Math.round((level / 100) * cols * rows);
    const grid = el('fx-grid', root);
    const on = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const order = (rows - 1 - r) * cols + c;
        const cell = el('fx-cell', grid, { '--delay': `${order * 14}ms` });
        if (order < lit) on.push(cell);
      }
    }
    nextFrame(() => on.forEach((cell) => cell.classList.add('is-on')));
  },
};

const render = () => {
  fxRoot.innerHTML = '';
  if (step < 0) return show('start');
  if (step >= SCALES.length) return show('end');

  const scale = SCALES[step];
  const value = device.specs[scale.key];
  show('spec');
  $('specDevice').textContent = device.name;
  $('specLabel').textContent = scale.label;
  $('specUnit').textContent = scale.unit;
  $('progress').textContent = `${step + 1} / ${SCALES.length}`;

  FX[scale.fx](fxRoot, levelOf(scale, value));
  countUp($('specValue'), value, scale.decimals);
};

const advance = () => {
  if (!device) return;
  step = step >= SCALES.length ? -1 : step + 1;
  render();
};

const findByModel = (model) => {
  if (!model) return null;
  const code = model.toUpperCase();
  return Object.keys(DEVICES).find((id) => DEVICES[id].models.some((prefix) => code.startsWith(prefix)));
};

// Order: ?device= override → UA Client Hints model → legacy UA string.
const detect = async () => {
  const override = new URLSearchParams(location.search).get('device');
  if (override && DEVICES[override]) return override;

  try {
    if (navigator.userAgentData?.getHighEntropyValues) {
      const { model } = await navigator.userAgentData.getHighEntropyValues(['model']);
      const id = findByModel(model);
      if (id) return id;
    }
  } catch (e) { /* not available */ }

  const legacy = navigator.userAgent.match(/SM-[A-Z0-9]+/i);
  return findByModel(legacy && legacy[0]);
};

const start = (id) => {
  device = DEVICES[id];
  $('deviceName').textContent = device.name;
  step = -1;
  render();
};

const showPicker = () => {
  const choices = $('choices');
  choices.innerHTML = '';
  Object.keys(DEVICES).forEach((id) => {
    const btn = document.createElement('button');
    btn.textContent = DEVICES[id].name;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      start(id);
    });
    choices.appendChild(btn);
  });
  show('picker');
};

$('app').addEventListener('click', advance);

detect().then((id) => (id ? start(id) : showPicker()));
