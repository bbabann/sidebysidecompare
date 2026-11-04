// Absolute scales shared by every device. A device never knows about any other
// device, so each visual depends only on its own value and these fixed ranges.
// When min > max, a lower value scores higher (e.g. thickness).
// `fx` picks the animation in script.js.
const SCALES = [
  { key: 'brightness', label: 'Peak Brightness', unit: 'nits', min: 1000, max: 3000, decimals: 0, fx: 'glow' },
  { key: 'ram',        label: 'RAM',             unit: 'GB',   min: 4,    max: 16,   decimals: 0, fx: 'stack' },
  { key: 'battery',    label: 'Battery',         unit: 'mAh',  min: 3000, max: 5000, decimals: 0, fx: 'liquid' },
  { key: 'cpu',        label: 'CPU Speed',       unit: 'GHz',  min: 2.5,  max: 4.0,  decimals: 2, fx: 'speed' },
  { key: 'display',    label: 'Display Size',    unit: 'inch', min: 5.5,  max: 7.0,  decimals: 1, fx: 'frame' },
  { key: 'thickness',  label: 'Thickness',       unit: 'mm',   min: 8.5,  max: 6.5,  decimals: 1, fx: 'slab' },
  { key: 'storage',    label: 'Storage',         unit: 'GB',   min: 64,   max: 512,  decimals: 0, fx: 'grid' },
];

// `models` are model-code prefixes (regional suffixes like N, B, U are ignored).
const DEVICES = {
  s23: {
    name: 'Galaxy S23',
    models: ['SM-S911'],
    specs: { brightness: 1750, ram: 8, battery: 3900, cpu: 3.36, display: 6.1, thickness: 7.6, storage: 128 },
  },
  s26: {
    name: 'Galaxy S26',
    models: ['SM-S942'],
    specs: { brightness: 2600, ram: 12, battery: 4300, cpu: 3.8, display: 6.3, thickness: 7.2, storage: 256 },
  },
};
