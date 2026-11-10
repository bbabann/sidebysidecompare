const $ = (id) => document.getElementById(id);
const screens = ['guide', 'spec', 'end', 'picker'];
const fxRoot = $('fx');
const inkBase = $('inkBase');
const inkOverlay = $('inkOverlay');
const HIDDEN = 'inset(100% 0 0 0)';

let device = null;
let step = -1; // -1 = guide screen, SCALES.length = end screen

const show = (name) => screens.forEach((s) => { $(s).hidden = s !== name; });

// Position of a value on its absolute scale, 0–100.
const levelOf = (scale, value) => {
  const t = (value - scale.min) / (scale.max - scale.min);
  return Math.round(Math.min(1, Math.max(0, t)) * 100);
};

const format = (value, decimals) =>
  value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const countUp = (els, target, decimals, duration = 1600) => {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    els.forEach((node) => { node.textContent = format(target * eased, decimals); });
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

// Run `fn` after the initial state has been painted, so CSS transitions play.
const nextFrame = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

const el = (cls, parent, vars = {}) => {
  const node = document.createElement('div');
  node.className = cls;
  Object.entries(vars).forEach(([k, v]) => node.style.setProperty(k, v));
  parent.appendChild(node);
  return node;
};

const setText = (cls, text) => document.querySelectorAll(cls).forEach((node) => { node.textContent = text; });

// Text tone over each visual. `base` is the main text color ('light' on the dark
// theme, 'dark' over a bright visual); `clip` animates the opposite-colored copy
// so it covers exactly the visual's area. `plain` drops the gradient numerals
// where the visual behind the text is busy.
const applyInk = ({ base = 'light', clip, plain = false } = {}) => {
  inkBase.dataset.tone = base;
  inkBase.classList.toggle('is-plain', plain);
  inkOverlay.dataset.tone = base === 'dark' ? 'light' : 'dark';
  $('progress').dataset.tone = base;
  $('close').dataset.tone = base;
  inkOverlay.style.transition = 'none';
  inkOverlay.style.clipPath = clip ? clip.from : HIDDEN;
  if (!clip) return;
  nextFrame(() => {
    inkOverlay.style.transition = `clip-path ${clip.timing}`;
    inkOverlay.style.clipPath = clip.to;
  });
};

const rand = (min, max) => min + Math.random() * (max - min);

// Small deterministic PRNG (mulberry32).
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// One visual per spec. Each receives the fx layer and a 0–100 level.
const FX = {
  // Brightness: the sun rises from the horizon; higher level = higher sun.
  // The sky jumps from night to day across the middle of the scale.
  sunrise(root, level) {
    el('fx-sky', root);
    const daylight = el('fx-daylight', root);
    const sun = el('fx-sun', root);
    el('fx-ground', root);
    const day = Math.min(1, Math.max(0, (level - 30) / 50));
    const top = 88 - (level / 100) * 76;
    nextFrame(() => {
      daylight.style.opacity = day;
      sun.style.top = `${top}%`;
    });
    if (day >= 0.5) return { base: 'dark' };
    // Night sky: white text, dark text where the sun passes behind it.
    const r = 'min(17vw, 100px)';
    return {
      plain: true,
      clip: { from: `circle(${r} at 50% 100%)`, to: `circle(${r} at 50% ${top}%)`, timing: '2.6s cubic-bezier(0.22, 1, 0.36, 1)' },
    };
  },

  // RAM: glass discs drop in and stack up to the level height.
  stack(root, level) {
    el('fx-pedestal', root);
    const stack = el('fx-stack', root);
    const count = Math.max(1, Math.round((level / 100) * 12));
    const height = (level / 100) * 0.8 * window.innerHeight;
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

  // Battery: charges up smoothly to the level, with a soft sweep of light.
  charge(root, level) {
    const fill = el('fx-charge', root);
    nextFrame(() => { fill.style.height = `${level}%`; });
    return { clip: { from: HIDDEN, to: `inset(${100 - level}% 0 0 0)`, timing: '2.6s cubic-bezier(0.45, 0, 0.25, 1)' } };
  },

  // CPU: the screen fills with light streaks; higher level = more and faster streaks.
  speed(root, level) {
    const band = el('fx-speed', root);
    const duration = 2 - level / 100;
    const count = 12 + Math.round(level * 0.25);
    for (let i = 0; i < count; i++) {
      const streak = el('fx-streak', band, {
        '--w': `${rand(20, 55)}vw`,
        '--d': `${rand(duration * 0.8, duration * 1.2)}s`,
        '--delay': `${rand(0, 1)}s`,
      });
      streak.style.top = `${rand(2, 98)}%`;
    }
    nextFrame(() => { band.style.height = '100%'; });
    return {};
  },

  // Display size: a frame expands from the center; 100 fills the screen.
  frame(root, level) {
    const frame = el('fx-frame', root);
    for (let i = 0; i < 4; i++) el('fx-handle', frame);
    const t = 0.2 + (level / 100) * 0.8;
    nextFrame(() => {
      frame.style.width = `${t * 100}%`;
      frame.style.height = `${t * 100}%`;
    });
    const edge = (100 - t * 100) / 2;
    return { clip: { from: 'inset(48% 47%)', to: `inset(${edge}% ${edge}%)`, timing: '1.6s cubic-bezier(0.65, 0, 0.35, 1)' } };
  },

  // Thickness: a white band on a night sky narrows to a line; slimmer = thinner.
  // Dark text where the band crosses the text.
  slab(root, level) {
    el('fx-night', root);
    const slab = el('fx-slab', root);
    const height = 2 + (1 - level / 100) * 24;
    nextFrame(() => { slab.style.height = `${height}vh`; });
    return {
      clip: { from: 'inset(0 0 0 0)', to: `inset(${(100 - height) / 2}% 0)`, timing: '1.8s cubic-bezier(0.7, 0, 0.2, 1)' },
    };
  },

  // Storage: assorted items fall and pile up until the pile reaches the level.
  // A fixed seed means every device drops the same sequence, so a higher level
  // is the same pile with more on top.
  pile(root, level) {
    const pile = el('fx-pile', root);
    const cols = 8;
    const unit = pile.clientWidth / cols;
    const target = (level / 100) * pile.clientHeight;
    const shapes = [
      { kind: 'box', w: 3, h: 2 },
      { kind: 'crate', w: 2, h: 2 },
      { kind: 'slab', w: 4, h: 1 },
      { kind: 'pill', w: 3, h: 1 },
      { kind: 'ball', w: 2, h: 2 },
      { kind: 'crate', w: 2, h: 3 },
    ];
    const random = seeded(26);
    const heights = new Array(cols).fill(0);
    const mean = () => heights.reduce((a, b) => a + b, 0) / cols;

    for (let i = 0; i < 120 && mean() < target; i++) {
      const shape = shapes[Math.floor(random() * shapes.length)];
      // Land in the lowest spot it fits (ties broken by the seeded random).
      let x = 0;
      let y = Infinity;
      for (let cx = 0; cx <= cols - shape.w; cx++) {
        const rest = Math.max(...heights.slice(cx, cx + shape.w)) + random() * 0.5;
        if (rest < y) { y = rest; x = cx; }
      }
      y = Math.max(...heights.slice(x, x + shape.w));
      const w = shape.w * unit;
      const h = shape.h * unit;
      for (let c = x; c < x + shape.w; c++) heights[c] = y + h;

      const item = el(`fx-item fx-item--${shape.kind}`, pile);
      Object.assign(item.style, { left: `${x * unit + 1}px`, bottom: `${y}px`, width: `${w - 2}px`, height: `${h - 2}px` });
      // Gravity: accelerate down, then a small settle bounce.
      const fall = window.innerHeight;
      item.animate([
        { transform: `translateY(${-fall}px)`, easing: 'cubic-bezier(0.55, 0, 1, 0.45)' },
        { transform: 'translateY(0)', offset: 0.8, easing: 'ease-out' },
        { transform: 'translateY(-6px)', offset: 0.9, easing: 'ease-in' },
        { transform: 'translateY(0)' },
      ], { duration: 900, delay: i * 70, fill: 'backwards' });
    }
    return { plain: true };
  },
};

// Browser / status bar color follows the screen: light guide, dark everything else.
const themeColor = document.querySelector('meta[name="theme-color"]');

const render = () => {
  fxRoot.innerHTML = '';
  themeColor.content = step < 0 ? '#eff9fc' : '#22263a';
  $('close').hidden = step < 0;
  if (step < 0) {
    show('guide');
    guideTrack.scrollLeft = 0;
    setGuideDot(0);
    return;
  }
  if (step >= SCALES.length) {
    $('close').dataset.tone = 'light';
    return show('end');
  }

  const scale = SCALES[step];
  const value = device.specs[scale.key];
  show('spec');
  setText('.js-device', device.name);
  setText('.js-label', scale.label);
  setText('.js-unit', scale.unit);
  $('progress').textContent = `${step + 1} / ${SCALES.length}`;

  applyInk(FX[scale.fx](fxRoot, levelOf(scale, value)));
  countUp(document.querySelectorAll('.js-value'), value, scale.decimals);
};

const advance = () => {
  if (!device || step < 0) return; // the guide has its own Start Compare button
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
  step = -1;
  render();
};

const showPicker = () => {
  const choices = $('choices');
  choices.innerHTML = '';
  Object.keys(DEVICES).forEach((id) => {
    const btn = document.createElement('button');
    btn.className = 'pill';
    btn.type = 'button';
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

// Guide: dots follow the swipe; Start Compare goes straight to the first spec.
const guideTrack = $('guideTrack');
const guideDots = [...$('guideDots').children];
const setGuideDot = (index) => guideDots.forEach((dot, i) => {
  dot.classList.toggle('is-active', i === index);
  dot.setAttribute('aria-selected', i === index);
});
const goToSlide = (index) => guideTrack.scrollTo({ left: index * guideTrack.clientWidth, behavior: 'smooth' });
guideTrack.addEventListener('scroll', () => setGuideDot(Math.round(guideTrack.scrollLeft / guideTrack.clientWidth)), { passive: true });
guideDots.forEach((dot, i) => dot.addEventListener('click', (e) => {
  e.stopPropagation();
  goToSlide(i);
}));
document.addEventListener('keydown', (e) => {
  if (step >= 0) return;
  const index = Math.round(guideTrack.scrollLeft / guideTrack.clientWidth);
  if (e.key === 'ArrowRight') goToSlide(Math.min(index + 1, guideDots.length - 1));
  if (e.key === 'ArrowLeft') goToSlide(Math.max(index - 1, 0));
});
$('startCompare').addEventListener('click', (e) => {
  e.stopPropagation();
  step = 0;
  render();
});
$('close').addEventListener('click', (e) => {
  e.stopPropagation();
  step = -1;
  render();
});

detect().then((id) => (id ? start(id) : showPicker()));

// Offline + installable (PWA). Needs HTTPS or localhost.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* app still works online */ });
}
