# Style guide — « Les Vertus du Sidr » motion piece

No reference video was supplied in `refs/`. The visual grammar below is taken from the
brand itself: `style.css` (colors, Fraunces serif), the logo, and the 23 editorial
photographs in the repo root (warm natural light, linen, raw wood, khaki powder, ceramic bowls,
desert tree at golden hour). We keep the brand's grammar and push it toward an editorial
magazine / museum-label feel.

## What the reference material tells us
| Observation (site + photos) | What we do with it in motion |
|---|---|
| Deep forest green + gold + cream, never saturated | 3 surfaces only: forest (`#0f1f15`/`#1f3b2c`), cream (`#f4efe2`), gold (`#d9b36c`) as the single accent. Khaki (`#8e9a5b`) exists only as *material* (powder). |
| Fraunces serif headings, sans body | Fraunces 300 for display (very large, tight tracking), Fraunces italic for voice, IBM Plex Mono for "label" information (species, chapters), Inter Tight for units. |
| Photos: top-down or 3/4, soft window light, lots of negative space | Photos are never full-bleed wallpaper: they live inside *shapes that mean something* (Moorish arch, leaf, bowl circle). |
| Content tone: sourced, careful, no hype | Copy only states what the site sources (3 000 years of use, saponins/mucilages/flavonoids, 2–4 tbsp, 10–30 min, species by origin). No miracle claims. |
| Arabic name سدر is central to the subject | Arabic set in Amiri, gold, used as a graphic element; revealed right-to-left. |

## Typography
- Display: Fraunces 300, 150–330 px on a 1080×1920 canvas, tracking −1 to −3 %.
- Accent/voice: Fraunces 300 italic, 52–110 px.
- Labels: IBM Plex Mono 500, 24–30 px, uppercase, tracking +12 %.
- Units / body: Inter Tight 400/600, 40–50 px.
- Minimum on-screen size: 24 px (chrome only); anything a viewer must read ≥ 40 px.
- Text is left-aligned on an 80 px margin; centered text only on the end card.

## Color
| Token | Hex | Role |
|---|---|---|
| forest-950 | `#0f1f15` | dark scenes background |
| forest-800 | `#1f3b2c` | secondary dark / leaf shadow |
| leaf | `#3f6b45` | fresh leaf |
| khaki | `#8e9a5b` | dried leaf / powder |
| cream | `#f4efe2` | light scenes background, text on dark |
| ink | `#16281c` | text on cream |
| gold | `#d9b36c` | the only accent: rules, Arabic, active states |

## Motion grammar
- Everything is a deterministic function of `t` (see `src/scene.js`).
- Four spring weights (ω, ζ): **UI** (22, 0.62) snappy with overshoot; **cards / shapes** (15, 0.72);
  **large type** (11, 0.82) heavy, almost no overshoot; **camera** (6.5, 1.0) critically damped.
- Text enters through masks (rise from its own baseline) — never plain fades.
- Transitions are made from objects on screen: zoom *through* the last "0" of 3000,
  arch morphs into a leaf, the leaf turns into powder, the powder becomes the bowl, the bowl
  shrinks into the progress dot, the camera pans from the ritual into the origins, a leaf
  from the origins list becomes the logo.
- Light/dark alternates every shot to build rhythm (dark → dark photo → cream → dark → cream → dark → dark).

## Sound grammar
- 120 BPM (0.5 s per beat, 2 s per bar); every shot boundary lands on a beat.
- Palette: soft kick, shaker, plucked string (Karplus-Strong) in D Hijaz (D E♭ F♯ G A B♭ C),
  warm pad, filtered-noise whooshes into each transition, small clicks on type arrivals.
