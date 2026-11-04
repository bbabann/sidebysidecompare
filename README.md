# sidebysidecompare

Scan a QR code on a Galaxy phone and it shows that phone's own specs, one per screen, with a blue level that rises to an absolute position. Put several phones side by side and the differences read at a glance — each page knows only its own device.

Live: https://bbabann.github.io/sidebysidecompare/

## Run locally

```sh
python3 -m http.server 8000
```

- http://localhost:8000 — auto-detect (falls back to a device picker)
- http://localhost:8000/?device=s23 or `?device=s26` — force a device

Tap anywhere to advance.

## How it works

- `specs.js` — `SCALES` (fixed min/max per spec, shared by all devices) and `DEVICES` (model-code prefixes + values). Add a device by adding an entry; no other code changes.
- `script.js` — `FX` holds one animation per spec (`fx` key in `SCALES`); each gets only a 0–100 level.
- Detection: `?device=` → `navigator.userAgentData` model (`SM-S911N` → S23) → User-Agent string → picker.
- Client Hints need a secure context (HTTPS or localhost). Over plain `http://<LAN IP>` the phone will show the picker.

## Spec sources

- Galaxy S26: samsung.com/sec specs page (brightness and charging from press coverage)
- Galaxy S23: GSMArena (official samsung.com page no longer available)
