# « Les Vertus du Sidr » — motion piece (9:16, 24 s, 60 fps)

A 24-second vertical film for social (TikTok / Reels / Shorts) that explains what sidr powder is,
in the brand's own visual language. Every claim on screen comes from the site's sourced guide
(`../poudre-de-sidr.html`).

| Deliverable | Path |
|---|---|
| Final video (1080×1920, 60 fps, H.264 CRF 15 + AAC 256k) | `out/final.mp4` |
| Poster frame (t = 3.9 s) | `out/poster.png` |
| Contact sheet (1 frame/s, taken from the encoded video) | `out/contact.png` |
| Style guide / shot list | `docs/style_guide.md`, `docs/shotlist.md` |

## The film
1. **Hook (0–2 s):** an odometer rolls to **3000**: « depuis plus de 3000 ans, une feuille lave les cheveux ». The camera then zooms *through* the last zero.
2. **L'arbre:** the desert tree seen through a Moorish arch, with « Le sidr. » and سدر wiping in right to left.
3. **La feuille:** the arch morphs into a leaf, which is dried, broken into 1,400 grains and sifted.
4. **Les actifs:** the grains settle into the bowl, followed by saponines / mucilages / flavonoïdes.
5. **Le rituel:** the bowl shrinks into a progress dot, then the camera pans 2–4 c. à soupe → 10–30 min → 1× par semaine.
6. **Origines:** Maroc / Yémen / Inde, each with its *Ziziphus* species.
7. **End card:** the Yemen leaf becomes the logo leaf, then « Les Vertus du Sidr — La tradition, sourcée. »

## How it's built
- `src/scene.js` draws the entire film on a single `<canvas>` as a **pure function of time**:
  `window.seek(t)` always paints the same pixels for the same `t`. It uses no timers, no `Math.random`
  (a sine hash instead) and no CSS animation. Motion uses closed-form damped springs with four
  weights (UI, cards, large type, camera). Shapes morph between resampled polygons that share the
  same point count (arch → leaf).
- `render.mjs` drives headless Chromium through Playwright and screenshots every frame at 60 fps,
  piping the PNGs into FFmpeg (libx264), then muxes in the soundtrack.
- `audio.py` synthesizes the soundtrack with numpy (seeded, so it's deterministic). It runs at 120 BPM
  in D Hijaz: kick, shaker, rim, Karplus-Strong plucks on each type arrival, pads per shot, and
  whooshes timed to peak on every cut, with an FFT convolution reverb.
- Fonts (Fraunces, Inter Tight, IBM Plex Mono, Amiri; all SIL OFL) are bundled in `src/fonts/`.
  The two photos (`src/tree.jpg`, `src/bowl.jpg`) are copies of the site's cover images.

## Commands
Requirements: Node 18+ with `playwright` (global or local), Python 3 with `numpy` + `pillow`,
and `ffmpeg` on the PATH (or `FFMPEG=/path/to/ffmpeg`).

```bash
python3 audio.py                         # → out/soundtrack.wav
node render.mjs                          # → out/video_only.mp4, out/final.mp4, out/poster.png (~9 min)
node render.mjs --mux                    # re-mux after changing only the audio
node render.mjs --stills 1.5,3.9,21      # single frames → out/stills/
node render.mjs --from 8 --to 13 --fps 30 --out out/preview.mp4   # quick silent range preview
./sheet_from_video.sh 1 out/contact.png 8 260   # contact sheet from the encoded video
python3 audio_view.py                    # spectrogram + envelope with cut markers → out/audio_check.png
```
To preview in a browser, open `src/index.html?play` (serve the folder, or allow file access).

## Quality loop (what was checked and fixed)
| Pass | Biggest problems found | Fix |
|---|---|---|
| 1 (stills) | Ritual parallax layers leaked into neighbouring panels; origins exit collided with the flying leaf; process list hit the kicker; “10–30” overflowed | Clipped each panel to its own window; moved exits earlier; re-spaced the list; fit the numerals to width |
| 2 (full render + contact sheet) | Bowl → ritual handoff was broken (half-open page, stray dots, ghost numerals); the camera spring's tail left a 3–5 px sliver; the hook sat high | The page now opens from the moving bowl and the tracker waits for it; camera springs are normalized to land in exactly 1 s; the hook block is re-centered |
| 3 | The shrinking bowl flew across headline text that exited too late; ritual numerals were visible on dark before the page opened; the powder disc sat flat for about 0.3 s; plucks were buried under the kick | Actives text exits 0.25 s earlier; panel content is clipped to the opening page; the bowl photo fades in 0.2 s earlier; the mix was rebalanced (kick −5 dB, plucks +4.6 dB, −16.5 LUFS) |
| 4 (final render) | Contact sheet from the encoded file shows no clipping, overlaps, stray artifacts or dead frames | Determinism checked: seeking back to the same `t` gives byte-identical screenshots |

## Notes
- The safe area is respected for platform UI: key text stays between y = 200 and y = 1560 and away from the right edge.
- Only 9:16 was requested and rendered. The scene uses absolute 1080×1920 layout, so a 1:1 or 16:9 version
  should be *recomposed* (new layout constants per shot), not cropped.
- `../.assetsignore` keeps this folder out of the Cloudflare deployment of the website.
