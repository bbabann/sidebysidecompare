# sidebysidecompare

Scan a QR code on a Galaxy phone and it shows that phone's own specs, one per screen, with a blue level that rises to an absolute position. Put several phones side by side and the differences read at a glance — each page knows only its own device.

Live: https://bbabann.github.io/sidebysidecompare/

## Run locally

```sh
python3 -m http.server 8000
```

- http://localhost:8000 — auto-detect (falls back to a device picker)
- http://localhost:8000/?device=s23 or `?device=s26` — force a device

The page opens on a two-step guide (swipe or tap the dots). Start Compare shows the first spec; tap anywhere to advance. The close button and the end screen return to the guide.

## Install (PWA)

Open the Pages URL on the phone, then Chrome menu → "Add to Home screen" / "Install app" (Samsung Internet: menu → "Add page to" → "Home screen"). Needs HTTPS, so it does not install from a LAN `http://` address. Once opened, the app files are cached and it works offline; a new deploy shows up the next time it opens. Bump `CACHE` in `sw.js` to force old files out. The installed app runs fullscreen (no status bar or system navigation bar; an edge swipe shows them briefly); after changing `display` in the manifest, remove and re-install the app to pick it up.

## How it works

- `specs.js` — `SCALES` (fixed min/max per spec, shared by all devices) and `DEVICES` (model-code prefixes + values). Add a device by adding an entry; no other code changes.
- `script.js` — `FX` holds one animation per spec (`fx` key in `SCALES`); each gets only a 0–100 level.
- Detection: `?device=` → `navigator.userAgentData` model (`SM-S911N` → S23) → User-Agent string → picker.
- Client Hints need a secure context (HTTPS or localhost). Over plain `http://<LAN IP>` the phone will show the picker.

## Spec sources

- Galaxy S26: samsung.com/sec specs page (brightness and charging from press coverage)
- Galaxy S23: GSMArena (official samsung.com page no longer available)
