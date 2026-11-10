# Changelog

## 2026-11-10 (2)
- Added the pre-experience guide from Figma "UX Orion EX App" (node 1007:15568), replacing the "Tap to start" screen.
  - `index.html` / `style.css`: "Compare S26 Series" title, two swipeable slides (phone outline with sun + horizon; two phones side by side) with captions, indicator dots, and a Start Compare button. Light gradient background.
  - `script.js`: Start Compare goes straight to Peak Brightness (1 / 7). The close button and "Tap to restart" return to the guide. Dots follow the swipe; they are also clickable, and ← / → keys work. Taps on the guide no longer advance the specs.
  - `assets/` (new): `guide-phone.png`, `guide-hands.png` (downscaled to 640px), `guide-glow.svg`, `guide-line.svg`, exported from Figma.
  - Removed: the start screen (`#start`, device name + "Tap to start"), and the Figma status bar (the real device has its own).

## 2026-11-10
- Restyled to the Figma "Seowhan Ideation" feature screens (node 387:15261). Structure, animations, spec values and detection unchanged.
- `style.css`: replaced the light lavender theme with a dark navy base (radial top glow, no film grain); Samsung Sharp Sans Bold titles/numerals (`--font-display`, mapped via `local()` where installed; fonts not bundled) and One UI Sans body (`--font-body`); blue gradient numerals (#7794FF → #AEC4FF → #7AA8E0); Figma pill button and 36px close button; all seven fx recolored to blue / lavender / glass on dark.
- `index.html`: start / end hint text → pill buttons with arrow-circle icon; added close button (back to start); theme color #22263a.
- `script.js`: text tone defaults to light on the dark theme (dark only over bright visuals); `plain` option drops gradient numerals over busy visuals (brightness night, storage); close button handler; picker buttons use the pill style.
- Comparison elements from the Figma compare sheet (Compare with, "thinner than …") intentionally not used.

## 2026-11-04 (4)
- Layout: text centered; visuals fill the whole screen behind it.
- Dual-tone text (`index.html` `#inkBase` / `#inkOverlay`, `applyInk` in `script.js`): the same text is drawn twice and the opposite-colored copy is clipped to the visual's area, so text flips white/dark exactly at the visual's edge. Removed the text halo.
- `specs.js`: `fx` renamed `glow` → `sunrise`, `liquid` → `charge`, `grid` → `pile`.
- Peak Brightness `sunrise`: the sun rises from the horizon (higher level = higher sun); sky switches from night to day across the middle of the scale. Night: white text, dark inside the sun.
- Battery `charge`: smooth charge-up with a soft upward light sweep (no waves or bubbles). White text on the filled part.
- CPU Speed `speed`: fills the full screen; more streaks at higher level; each streak starts slow then snaps fast. White text and counter.
- Display Size `frame`: deeper blue; white text inside the frame.
- Thickness `slab`: horizontal white band on a night background narrows from full screen to a line (slimmer = thinner); dark text where it crosses.
- Storage `pile`: assorted items (box, crate, slab, pill, ball) fall with gravity and a settle bounce, landing in the lowest spot, until the pile reaches the level. Fixed seed, so a higher level is the same pile with more on top.

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
