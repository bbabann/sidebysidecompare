# Changelog

## 2026-11-04 (3)
- Restyled to the reference tone: light lavender-grey background with film grain; deep blue / blue / teal / lavender palette; navy text with no card behind it.
- `specs.js`: added `fx` per spec; removed the thickness `note`.
- `script.js`: replaced the single blue fill with one animation per spec, each sized only by the device's own level on the fixed scale:
  - Peak Brightness `glow` — light bloom on a blue sky, wider with level.
  - RAM `stack` — glass discs drop and stack; more discs and height with level.
  - Battery `liquid` — rising water with a moving surface and bubbles.
  - CPU Speed `speed` — band of light streaks; taller and faster with level.
  - Display Size `frame` — frame with corner handles expands from center.
  - Thickness `slab` — slab presses down; slimmer device = thinner slab.
  - Storage `grid` — perspective grid cells light up from the bottom.
- Height-based visuals stay within the area below the text (`STAGE` / `--stage`, 72%).
- `index.html`: added the fx layer and a floating glass orb on start / end screens.
- Deployed to GitHub Pages; added `qr.png` pointing to the live URL.

## 2026-11-04 (2)
- Replaced the image-compare scaffold with the device spec viewer.
  - `specs.js` (new): absolute `SCALES` for 7 specs (Peak Brightness, RAM, Battery, CPU Speed, Display Size, Thickness, Storage) and `DEVICES` for Galaxy S23 / S26.
  - `index.html`, `style.css`, `script.js`: rewritten. Start → one spec per tap → end. Black background, Samsung blue fill rising to each spec's absolute level, count-up number, `n / 7` progress.
  - Device detection via `?device=`, UA Client Hints model code, legacy UA, then a manual picker.
  - No cross-device comparison copy: each page shows only its own values.
- `README.md`: updated for the new project.

## 2026-11-04
- Initial scaffold: `index.html`, `style.css`, `script.js`, `README.md`.
  - Two image panes with click / drag & drop loading.
  - View modes: "Side by side" and "Slider" (overlay with draggable reveal).
  - Light/dark theme via CSS variables; single-column layout under 640px.
