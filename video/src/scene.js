// Les Vertus du Sidr — 24 s motion piece, 1080×1920.
// The whole film is a pure function of time: window.seek(t) always paints the same frame
// for the same t. No timers, no Math.random, no CSS transitions.

(() => {
  'use strict';

  const W = 1080, H = 1920, DURATION = 24;
  const C = {
    f950: '#0f1f15', f800: '#1f3b2c', leaf: '#3f6b45', leafHi: '#6f9a5e',
    khaki: '#8e9a5b', khakiLo: '#6f7a44', cream: '#f4efe2', ink: '#16281c',
    gold: '#d9b36c', goldDeep: '#b98d3e',
  };
  const F = {
    display: (px) => `300 ${px}px Fraunces`,
    displayBold: (px) => `600 ${px}px Fraunces`,
    italic: (px) => `italic 300 ${px}px Fraunces`,
    mono: (px) => `500 ${px}px "IBM Plex Mono"`,
    sans: (px, w = 400) => `${w} ${px}px "Inter Tight"`,
    arabic: (px) => `700 ${px}px Amiri`,
  };

  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');

  // ---------------------------------------------------------------- math
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeIn = (p) => p * p * p;
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  const easeInExpo = (p) => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10));
  const hash = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

  // Closed-form damped spring (step response). Deterministic for any t.
  function spring(t, w, z) {
    if (t <= 0) return 0;
    if (z < 1) {
      const wd = w * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
    }
    return 1 - Math.exp(-w * t) * (1 + w * t);
  }
  // Motion weights: UI snaps, cards settle, big type is heavy, camera is critically damped.
  const CAM_END = spring(1.0, 6.5, 1.0); // camera moves land in exactly 1 s
  const WEIGHT = { ui: [22, 0.62], card: [15, 0.72], type: [11, 0.82], cam: [6.5, 1.0] };
  // Critically damped camera moves have a long exponential tail; normalize so they land exactly.
  const S = (t, t0, kind = 'type') => (kind === 'cam' ? clamp(spring(t - t0, ...WEIGHT.cam) / CAM_END) : spring(t - t0, WEIGHT[kind][0], WEIGHT[kind][1]));

  function mixHex(a, b, p) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (v, s) => (v >> s) & 255;
    const m = (s) => Math.round(lerp(ch(pa, s), ch(pb, s), p));
    return `rgb(${m(16)},${m(8)},${m(0)})`;
  }

  // ---------------------------------------------------------------- type
  function measure(str, font, ls = 0) {
    ctx.save(); ctx.font = font; ctx.letterSpacing = `${ls}px`;
    const w = ctx.measureText(str).width; ctx.restore(); return w;
  }
  function text(str, x, y, font, color, { align = 'left', ls = 0, alpha = 1, dir = 'ltr' } = {}) {
    if (alpha <= 0) return;
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.direction = dir;
    ctx.letterSpacing = `${ls}px`; ctx.globalAlpha *= alpha; ctx.fillText(str, x, y); ctx.restore();
  }
  // Masked rise: the line slides up from behind its own baseline. p: 0 hidden, 1 settled,
  // 1→2 exits upward through the top of the mask.
  function rise(str, x, y, size, font, color, p, { align = 'left', ls = 0, alpha = 1 } = {}) {
    if (p <= 0.001 || p >= 1.999 || alpha <= 0) return;
    ctx.save(); ctx.font = font; ctx.letterSpacing = `${ls}px`;
    const w = ctx.measureText(str).width;
    const x0 = align === 'left' ? x : align === 'center' ? x - w / 2 : x - w;
    ctx.beginPath(); ctx.rect(x0 - 60, y - size * 1.12, w + 120, size * 1.45); ctx.clip();
    ctx.fillStyle = color; ctx.globalAlpha *= alpha; ctx.textAlign = 'left';
    ctx.fillText(str, x0, y + (1 - p) * size * 1.2);
    ctx.restore();
  }
  // Word-by-word rise with stagger; tout = start of the exit.
  function riseWords(str, x, y, size, font, color, t, t0, { stagger = 0.07, kind = 'type', tout = 1e9, outStagger = 0.03, align = 'left', ls = 0, alpha = 1 } = {}) {
    const words = str.split(' ');
    const space = measure(' ', font, ls);
    const widths = words.map((w) => measure(w, font, ls));
    const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
    let cx = align === 'left' ? x : align === 'center' ? x - total / 2 : x - total;
    words.forEach((w, i) => {
      const p = S(t, t0 + i * stagger, kind) + easeIn(prog(t, tout + i * outStagger, tout + i * outStagger + 0.4));
      rise(w, cx, y, size, font, color, p, { ls, alpha });
      cx += widths[i] + space;
    });
  }
  const exitP = (t, tout, d = 0.4) => easeIn(prog(t, tout, tout + d));

  // ---------------------------------------------------------------- shapes
  // Ziziphus leaf: ovate, finely crenulate margin, three veins from the base.
  function leafHalf(s) { return Math.pow(Math.sin(Math.PI * Math.pow(s, 0.82)), 0.92); }
  function leafPoints(L, ratio, n = 120) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const s = i / n; pts.push([leafHalf(s) * L * ratio * 0.5 * (1 + 0.012 * Math.sin(s * 70)), L / 2 - s * L]); }
    for (let i = n - 1; i > 0; i--) { const s = i / n; pts.push([-leafHalf(s) * L * ratio * 0.5 * (1 + 0.012 * Math.sin(s * 70 + 1.3)), L / 2 - s * L]); }
    return pts;
  }
  function resample(poly, n) {
    const segs = []; let total = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push(d); total += d;
    }
    const out = []; let seg = 0, acc = 0;
    for (let k = 0; k < n; k++) {
      const target = (k / n) * total;
      while (acc + segs[seg] < target) { acc += segs[seg]; seg++; }
      const a = poly[seg], b = poly[(seg + 1) % poly.length], p = (target - acc) / (segs[seg] || 1);
      out.push([lerp(a[0], b[0], p), lerp(a[1], b[1], p)]);
    }
    return out;
  }
  // Pointed (Moorish) arch, origin at box center, polygon starts bottom-center like the leaf.
  function archPoints(w, h) {
    const R = w * 0.62, cx = w / 2 - R;
    const rise = Math.sqrt(R * R - cx * cx);
    const ys = -h / 2 + rise;
    const thA = Math.acos(-cx / R);
    const right = [[0, h / 2], [w / 2, h / 2]];
    for (let i = 0; i <= 40; i++) { const th = (i / 40) * thA; right.push([cx + R * Math.cos(th), ys - R * Math.sin(th)]); }
    const left = right.slice(1, -1).reverse().map(([x, y]) => [-x, y]);
    return right.concat(left);
  }
  const MORPH_N = 240;
  const ARCH = resample(archPoints(780, 920), MORPH_N);
  const LEAF = resample(leafPoints(720, 0.58), MORPH_N);
  function xform(pts, x, y, s, rot) {
    const c = Math.cos(rot), sn = Math.sin(rot);
    return pts.map(([px, py]) => [x + s * (px * c - py * sn), y + s * (px * sn + py * c)]);
  }
  function pathPoly(pts) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }

  function drawLeaf(x, y, L, ratio, rot, { fill = C.leaf, vein = C.gold, veinP = 1, veinW = 3, alpha = 1, stroke = null, strokeW = 2, shade = true } = {}) {
    if (alpha <= 0 || L < 3) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= alpha;
    // petiole
    ctx.strokeStyle = fill; ctx.lineWidth = Math.max(2, L * 0.012); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, L / 2 - 2); ctx.quadraticCurveTo(L * 0.02, L * 0.58, L * 0.05, L * 0.64); ctx.stroke();
    const pts = leafPoints(L, ratio); pathPoly(pts);
    if (fill) {
      ctx.fillStyle = fill; ctx.fill();
      if (shade) { // one half catches the light, like a folded leaf
        ctx.save(); ctx.clip();
        const g = ctx.createLinearGradient(-L * ratio / 2, 0, L * ratio / 2, 0);
        g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(0.5, 'rgba(255,255,255,0.0)'); g.addColorStop(0.5, 'rgba(0,0,0,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0.02)');
        ctx.fillStyle = g; ctx.fillRect(-L, -L, 2 * L, 2 * L); ctx.restore();
      }
    }
    if (stroke) { pathPoly(pts); ctx.strokeStyle = stroke; ctx.lineWidth = strokeW; ctx.stroke(); }
    if (veinP > 0) {
      ctx.strokeStyle = vein; ctx.lineWidth = veinW; ctx.lineCap = 'round';
      const veins = [
        (k) => [0, L / 2 - k * L * 0.97],
        (k) => [leafHalf(k * 0.72) * L * ratio * 0.26 * Math.sin(Math.PI * k * 0.9 + 0.1), L / 2 - k * L * 0.74],
        (k) => [-leafHalf(k * 0.72) * L * ratio * 0.26 * Math.sin(Math.PI * k * 0.9 + 0.1), L / 2 - k * L * 0.74],
      ];
      veins.forEach((f, vi) => {
        const p = clamp(veinP * 1.25 - vi * 0.12);
        if (p <= 0) return;
        ctx.beginPath();
        for (let i = 0; i <= 40 * p; i++) { const [vx, vy] = f(i / 40); i ? ctx.lineTo(vx, vy) : ctx.moveTo(vx, vy); }
        ctx.lineWidth = vi ? veinW * 0.7 : veinW; ctx.stroke();
      });
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- assets
  const img = {};
  function loadImg(name, src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => { img[name] = i; res(); }; i.onerror = rej; i.src = src; });
  }
  function drawCover(im, x, y, w, h, fx = 0.5, fy = 0.5, zoom = 1) {
    const s = Math.max(w / im.width, h / im.height) * zoom;
    const dw = im.width * s, dh = im.height * s;
    ctx.drawImage(im, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh);
  }

  // Film grain: a fixed noise tile, offset per frame by a hash of the frame index.
  const grain = document.createElement('canvas'); grain.width = grain.height = 256;
  (() => {
    const g = grain.getContext('2d'); const d = g.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) { const v = 128 + (hash(i, 7) - 0.5) * 200; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
    g.putImageData(d, 0, 0);
  })();
  function drawGrain(t, amount) {
    const f = Math.round(t * 60);
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = amount;
    const ox = Math.floor(hash(f, 1) * 256), oy = Math.floor(hash(f, 2) * 256);
    ctx.translate(-ox, -oy); ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256);
    ctx.restore();
  }

  // The inner counter of the "0" in the hook numeral (measured once from the glyph itself).
  const HOOK = { size: 400, x: 64, y: 1130 };
  let zeroCounter = null, digitCell = 0;
  function measureZero() {
    const c = document.createElement('canvas'); c.width = 600; c.height = 600; const g = c.getContext('2d');
    g.font = F.display(HOOK.size); g.textBaseline = 'alphabetic'; g.fillStyle = '#000';
    const w = g.measureText('0').width; g.fillText('0', 300 - w / 2, 480);
    const d = g.getImageData(0, 0, 600, 600).data; const a = (x, y) => d[(y * 600 + x) * 4 + 3];
    // glyph vertical extent on the center column
    let top = 0, bot = 0; for (let y = 0; y < 600; y++) if (a(300, y) > 128) { top = y; break; }
    for (let y = 599; y >= 0; y--) if (a(300, y) > 128) { bot = y; break; }
    const cy = Math.round((top + bot) / 2);
    let l = 300, r = 300, u = cy, dn = cy;
    while (l > 0 && a(l, cy) < 128) l--; while (r < 599 && a(r, cy) < 128) r++;
    while (u > 0 && a(300, u) < 128) u--; while (dn < 599 && a(300, dn) < 128) dn++;
    zeroCounter = { dx: (l + r) / 2 - 300, dy: cy - 480, rx: (r - l) / 2, ry: (dn - u) / 2 };
    ctx.save(); ctx.font = F.display(HOOK.size);
    digitCell = Math.max(...'0123456789'.split('').map((ch) => ctx.measureText(ch).width)) * 0.92;
    ctx.restore();
  }

  // Particles for the leaf → powder → bowl sequence.
  const N_GRAINS = 1400;
  const grains = [];
  function buildGrains() {
    for (let i = 0; i < N_GRAINS; i++) {
      const s = Math.sqrt(hash(i, 1)) * 0.96 + 0.02; // bias toward the wide part of the leaf
      const v = hash(i, 2) * 2 - 1;
      const r = Math.sqrt(hash(i, 3)) * 0.97, a = hash(i, 4) * Math.PI * 2;
      grains.push({
        lx: v * leafHalf(s) * 720 * 0.58 * 0.5 * 0.96, ly: 360 - s * 720,
        dx: r * Math.cos(a), dy: r * Math.sin(a),
        burst: 18 + hash(i, 5) * 70, bang: hash(i, 6) * Math.PI * 2,
        big: 7 + hash(i, 8) * 11, small: 2.2 + hash(i, 9) * 3.2,
        rot: hash(i, 10) * Math.PI, delay: hash(i, 11) * 0.28,
        tone: hash(i, 12),
      });
    }
  }

  // ---------------------------------------------------------------- layout constants
  const LEAF3 = { x: 560, y: 1000, rot: -0.3 };
  const BOWL = { x: 540, y: 900, r: 262 };
  const BOWL_SRC = { x: 612, y: 300 }; // bowl center in bowl.jpg
  const TRACK = { y: 350, x0: 96, x1: 984 };

  // ---------------------------------------------------------------- scenes
  function bg(color) { ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); }
  function kicker(str, t, t0, tout, color = C.gold, y = 250) {
    const p = S(t, t0, 'ui') + exitP(t, tout, 0.3);
    rise(str, 80, y, 28, F.mono(28), color, p, { ls: 3.4 });
  }

  // 1 — HOOK: odometer 3000, zoom through the last zero ----------------------
  const hookLayer = document.createElement('canvas'); hookLayer.width = W; hookLayer.height = H;
  function drawHook(t, g) {
    const target = [3, 0, 0, 0], turns = [1, 2, 2, 3];
    const size = HOOK.size, cell = digitCell;
    const zp = easeInExpo(prog(t, 1.95, 2.55)); // zoom progress
    const lastCx = HOOK.x + cell * 3.5, cy = HOOK.y + zeroCounter.dy;
    const k = 1 + zp * 26;
    g.save();
    g.fillStyle = C.f950; g.fillRect(0, 0, W, H);
    g.translate(lastCx + zeroCounter.dx, cy); g.scale(k, k); g.translate(-(lastCx + zeroCounter.dx), -cy);
    if (zp > 0) { // punch the counter of the zero so the next shot shows through
      g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath();
      g.ellipse(lastCx + zeroCounter.dx, cy, zeroCounter.rx * 0.98, zeroCounter.ry * 0.98, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    // kicker
    const kp = S(t, -0.12, 'ui');
    g.save(); g.font = F.mono(30); g.letterSpacing = '4px'; g.fillStyle = C.gold;
    g.beginPath(); g.rect(40, 770, 800, 60); g.clip(); g.fillText('DEPUIS PLUS DE', 80, 815 + (1 - kp) * 40); g.restore();
    // odometer
    g.save(); g.font = F.display(size); g.textAlign = 'center'; g.fillStyle = C.cream;
    const top = HOOK.y - size * 0.76, bottom = HOOK.y + size * 0.06, step = size * 0.86;
    for (let d = 0; d < 4; d++) {
      const pos = (tt) => target[d] + 10 * turns[d] * (1 - spring(tt + 0.1, 17 - d * 2.4, 0.72));
      const v = pos(t), vel = Math.abs(v - pos(t - 1 / 120)) * 120; // digits per second
      const x = HOOK.x + cell * (d + 0.5);
      g.save(); g.beginPath(); g.rect(x - cell / 2, top, cell, bottom - top); g.clip();
      const samples = vel > 4 ? 5 : 1, smear = Math.min(0.45, vel / 90);
      for (let sIdx = 0; sIdx < samples; sIdx++) {
        const vv = v - (samples > 1 ? (sIdx / (samples - 1) - 0.5) * smear : 0);
        const base = Math.floor(vv), frac = vv - base;
        g.globalAlpha = 1 / samples * (samples > 1 ? 1.35 : 1);
        for (let j = -1; j <= 1; j++) {
          const digit = ((base + j) % 10 + 10) % 10;
          g.fillText(String(digit), x, HOOK.y + (frac - j) * step);
        }
      }
      g.restore();
    }
    g.restore();
    // hairline under the numeral
    const lp = easeOut(prog(t, 0.35, 1.0));
    g.fillStyle = C.gold; g.fillRect(80, HOOK.y + 70, (cell * 4 - 16) * lp, 3);
    // italic line, word by word
    const lines = [['ans,', 'une', 'feuille'], ['lave', 'les', 'cheveux.']];
    g.font = F.italic(96); g.fillStyle = C.cream;
    let wi = 0;
    lines.forEach((ws, li) => {
      let x = 80; const y = HOOK.y + 210 + li * 112;
      ws.forEach((w) => {
        const p = spring(t - (0.5 + wi * 0.075), ...WEIGHT.type);
        const wW = g.measureText(w).width;
        g.save(); g.beginPath(); g.rect(x - 10, y - 100, wW + 30, 130); g.clip();
        g.fillStyle = w === 'feuille' ? C.gold : C.cream;
        g.fillText(w, x, y + (1 - p) * 115); g.restore();
        x += wW + g.measureText(' ').width; wi++;
      });
    });
    g.restore();
    ctx.drawImage(hookLayer, 0, 0);
  }

  // 2 — THE TREE: arch window, title, Arabic -----------------------------------
  const ARCH_C = { x: 540, y: 720 };
  function morphP(t) { return S(t, 4.55, 'card'); }
  function drawTree(t) {
    bg(C.f950);
    const mp = morphP(t);
    // cream page opens from the leaf center as the arch becomes a leaf
    paperWipe(t);
    // arch → leaf polygon
    const enter = S(t, 2.05, 'cam');
    const archS = lerp(1.18, 1, enter);
    const A = xform(ARCH, ARCH_C.x, ARCH_C.y, archS, 0);
    const Lf = xform(LEAF, LEAF3.x, LEAF3.y, 1, LEAF3.rot);
    const poly = A.map((p, i) => [lerp(p[0], Lf[i][0], mp), lerp(p[1], Lf[i][1], mp)]);
    ctx.save(); pathPoly(poly); ctx.clip();
    ctx.fillStyle = mixHex(C.f800, C.leaf, clamp(mp)); ctx.fillRect(0, 0, W, H);
    const photoA = 1 - prog(t, 4.9, 5.45);
    if (photoA > 0) {
      ctx.globalAlpha = photoA;
      const kb = lerp(1.0, 1.07, prog(t, 2.0, 5.2));
      const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
      const bx = Math.min(...xs), by = Math.min(...ys), bw = Math.max(...xs) - bx, bh = Math.max(...ys) - by;
      drawCover(img.tree, bx, by, bw, bh, 0.64, 0.5, kb);
      const g = ctx.createLinearGradient(0, ARCH_C.y + 100, 0, ARCH_C.y + 460);
      g.addColorStop(0, 'rgba(15,31,21,0)'); g.addColorStop(1, 'rgba(15,31,21,0.55)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
    // thin gold keyline on the arch
    if (mp < 0.5) {
      ctx.save(); ctx.globalAlpha = (1 - mp * 2) * clamp(enter * 1.4 - 0.3); pathPoly(xform(ARCH, ARCH_C.x, ARCH_C.y, archS * 1.035, 0));
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    }
    // Arabic سدر wipes in right-to-left, breaking out of the arch
    const ap = easeInOut(prog(t, 2.55, 3.25)), aOut = exitP(t, 4.45, 0.3);
    if (ap > 0 && aOut < 1) {
      ctx.save(); ctx.font = F.arabic(300); ctx.direction = 'rtl'; ctx.textAlign = 'right';
      const aw = ctx.measureText('سدر').width, ax = 1010, ay = 520;
      ctx.beginPath(); ctx.rect(ax - aw * ap - 20, ay - 330, aw * ap + 40, 460); ctx.clip();
      ctx.globalAlpha = 1 - aOut; ctx.fillStyle = C.gold;
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 8;
      ctx.fillText('سدر', ax, ay - aOut * 60); ctx.restore();
    }
    kicker("01 — L'ARBRE", t, 2.35, 4.4, C.gold, 1300);
    // title: letters rise
    const title = 'Le sidr.'; let x = 76;
    ctx.save(); ctx.font = F.display(210); ctx.letterSpacing = '-4px';
    const out = exitP(t, 4.35, 0.4);
    for (let i = 0; i < title.length; i++) {
      const ch = title[i], w = ctx.measureText(ch).width;
      const p = S(t, 2.45 + i * 0.045, 'type') + out;
      rise(ch, x, 1490, 210, F.display(210), C.cream, p, { ls: -4 });
      x += w - 4;
    }
    ctx.restore();
    rise('ZIZIPHUS SPINA-CHRISTI', 80, 1570, 30, F.mono(30), C.gold, S(t, 3.05, 'ui') + exitP(t, 4.4, 0.3), { ls: 3 });
    riseWords('le jujubier, en français', 80, 1650, 64, F.italic(64), C.cream, t, 3.25, { tout: 4.3, outStagger: 0.02, alpha: 0.85 });
  }

  // 3 — THE LEAF: dries, breaks, is sifted into powder ---------------------------
  function paperWipe(t) {
    const wipe = easeInOut(prog(t, 4.6, 5.25));
    if (wipe <= 0) return;
    ctx.save(); ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(LEAF3.x, LEAF3.y, wipe * 1400, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function drawLeafScene(t) {
    bg(C.f950); paperWipe(t);
    const dry = S(t, 6.0, 'card');
    const brk = t >= 6.7;
    const leafScale = lerp(1, 0.94, dry);
    const sway = Math.sin(t * 1.6) * 0.012;
    const leafColor = mixHex(C.leaf, C.khaki, clamp(dry));
    const px = LEAF3.x, py = LEAF3.y, rot = LEAF3.rot + sway * (1 - clamp(dry));
    // photo still fading out inside the leaf shape (continuity from the arch)
    if (brk) drawGrains(t, px, py, rot, leafScale);
    if (t < 6.85) {
      const veinP = easeInOut(prog(t, 5.25, 6.0));
      drawLeaf(px, py, 720 * leafScale, 0.58, rot, { fill: leafColor, vein: mixHex(C.gold, '#e9dcae', clamp(dry)), veinP, veinW: 4, alpha: 1 - prog(t, 6.7, 6.85) });
      const photoA = 1 - prog(t, 4.9, 5.45);
      if (photoA > 0) {
        ctx.save(); pathPoly(xform(LEAF, px, py, 1, LEAF3.rot)); ctx.clip(); ctx.globalAlpha = photoA;
        const lp = xform(LEAF, px, py, 1, LEAF3.rot), xs = lp.map((q) => q[0]), ys = lp.map((q) => q[1]);
        const bx = Math.min(...xs), by = Math.min(...ys);
        drawCover(img.tree, bx, by, Math.max(...xs) - bx, Math.max(...ys) - by, 0.64, 0.5, 1.07); ctx.restore();
      }
    }

    // header: kicker + headline, then the process list
    kicker('02 — LA FEUILLE', t, 5.2, 8.3, C.goldDeep);
    riseWords('Tout part', 80, 400, 112, F.display(112), C.ink, t, 5.3, { tout: 5.72 });
    riseWords("d'une feuille.", 80, 520, 112, F.display(112), C.ink, t, 5.38, { tout: 5.76 });
    const steps = [['01', 'Séchée.', 6.0], ['02', 'Broyée.', 6.7], ['03', 'Tamisée.', 7.4]];
    steps.forEach(([n, w, t0], i) => {
      // each new word pushes the list up by one line
      let shift = 0; for (let j = i + 1; j < steps.length; j++) shift += S(t, steps[j][2], 'card');
      const y = 610 - shift * 114;
      const dim = lerp(1, 0.28, clamp(shift));
      const p = S(t, t0, 'type') + exitP(t, 8.2 + i * 0.04, 0.35);
      rise(n, 80, y - 58, 28, F.mono(28), C.goldDeep, S(t, t0 + 0.05, 'ui') + exitP(t, 8.2, 0.3), { alpha: dim, ls: 2 });
      rise(w, 150, y, 112, F.italic(112), C.ink, p, { alpha: dim });
    });
  }
  function drawGrains(t, px, py, rot, sc) {
    const burst = S(t, 6.7, 'ui');
    const fine = S(t, 7.4, 'card');
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const fade = 1 - prog(t, 8.85, 9.45);
    if (fade <= 0) return;
    ctx.save(); ctx.globalAlpha = fade;
    for (let i = 0; i < N_GRAINS; i++) {
      const g = grains[i];
      const lx = g.lx * sc, ly = g.ly * sc;
      let x = px + lx * cs - ly * sn, y = py + lx * sn + ly * cs;
      // burst outward from the leaf center
      x += Math.cos(g.bang) * g.burst * burst * (1 - fine * 0.4);
      y += Math.sin(g.bang) * g.burst * burst * (1 - fine * 0.4) + fine * 20;
      // sifting: fall into the bowl disc
      const fp = prog(t, 7.5 + g.delay, 8.45 + g.delay);
      const ex = easeInOut(fp), ey = fp * fp * (3 - 2 * fp);
      const tx = BOWL.x + g.dx * BOWL.r * 0.93, ty = BOWL.y + g.dy * BOWL.r * 0.93;
      x = lerp(x, tx, ex); y = lerp(y, ty, ey) - Math.sin(Math.PI * fp) * 30 * (1 - g.tone);
      const size = lerp(g.big, g.small, clamp(fine));
      const col = g.tone < 0.33 ? C.khakiLo : g.tone < 0.8 ? C.khaki : '#a8b073';
      ctx.fillStyle = col;
      ctx.save(); ctx.translate(x, y); ctx.rotate(g.rot + burst * g.tone * 2);
      if (fine < 0.5) { ctx.beginPath(); ctx.moveTo(-size / 2, -size * 0.3); ctx.lineTo(size * 0.4, -size / 2); ctx.lineTo(size / 2, size * 0.4); ctx.lineTo(-size * 0.2, size / 2); ctx.closePath(); ctx.fill(); }
      else ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    }
    ctx.restore();
  }

  // 4 — THE ACTIVES: bowl + table ----------------------------------------------
  function bowlState(t) {
    // bowl shrinks into the first tracker node of the ritual
    const sp = S(t, 12.2, 'card');
    return { x: lerp(BOWL.x, TRACK.x0, sp), y: lerp(BOWL.y, TRACK.y, sp), r: lerp(BOWL.r, 13, clamp(sp, 0, 1.2)), sp };
  }
  function drawActives(t) {
    // dark field grows from the powder disc
    bg(C.cream);
    const wipe = easeInOut(prog(t, 8.55, 9.35));
    ctx.save(); ctx.fillStyle = C.f950; ctx.beginPath(); ctx.arc(BOWL.x, BOWL.y, BOWL.r + wipe * 1500, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const b = bowlState(t);
    drawBowl(t, b);
    drawActivesText(t);
  }
  function drawBowl(t, b) {
    const photoA = prog(t, 8.6, 9.1);
    // bowl photo, slowly rotating
    ctx.save(); ctx.beginPath(); ctx.arc(b.x, b.y, Math.max(0, b.r), 0, Math.PI * 2); ctx.clip();
    ctx.globalAlpha = prog(t, 8.45, 8.9); ctx.fillStyle = C.khaki; ctx.fill();
    ctx.globalAlpha = photoA * (1 - prog(b.sp, 0.2, 0.7));
    ctx.translate(b.x, b.y); ctx.rotate((t - 8.5) * 0.06);
    const s = (b.r / 262) * 1.12; ctx.scale(s, s);
    ctx.drawImage(img.bowl, -BOWL_SRC.x, -BOWL_SRC.y);
    ctx.restore();
    // gold ring around the bowl
    const ringP = easeInOut(prog(t, 8.9, 9.7)) * (1 - prog(b.sp, 0, 0.3));
    if (ringP > 0) {
      ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 22, Math.PI / 2, Math.PI / 2 + ringP * Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    if (b.sp > 0.3) { ctx.save(); ctx.fillStyle = C.goldDeep; ctx.globalAlpha = prog(b.sp, 0.3, 0.8); ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  }
  function drawActivesText(t) {
    kicker("03 — CE QU'ELLE CONTIENT", t, 9.0, 11.75);
    riseWords('Trois actifs,', 80, 390, 104, F.display(104), C.cream, t, 9.1, { tout: 11.75 });
    riseWords('une poudre.', 80, 500, 104, F.italic(104), C.gold, t, 9.2, { tout: 11.8 });
    // stem from the bowl + table
    const out = exitP(t, 11.8, 0.35);
    const stem = easeInOut(prog(t, 9.7, 10.0));
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.fillStyle = C.gold;
    ctx.fillRect(BOWL.x - 1, BOWL.y + BOWL.r + 22, 2, (1210 - (BOWL.y + BOWL.r + 22)) * stem);
    ctx.restore();
    const rows = [['SAPONINES', 'nettoient en douceur', 10.0], ['MUCILAGES', 'donnent la texture', 10.5], ['FLAVONOÏDES', 'antioxydants', 11.0]];
    rows.forEach(([k, v, t0], i) => {
      const y = 1210 + i * 128;
      const lp = easeInOut(prog(t, t0 - 0.2 + (i ? 0 : 0.1), t0 + 0.35));
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.fillStyle = 'rgba(244,239,226,0.35)';
      if (i === 0) ctx.fillRect(BOWL.x - 460 * lp, y, 920 * lp, 2); else ctx.fillRect(80, y, 920 * lp, 2);
      ctx.restore();
      const p = S(t, t0, 'card') + exitP(t, 11.8 + i * 0.04, 0.35);
      rise(k, 80, y + 82, 30, F.mono(30), C.gold, p, { ls: 3 });
      rise(v, 1000, y + 88, 62, F.italic(62), C.cream, S(t, t0 + 0.06, 'card') + exitP(t, 11.83 + i * 0.04, 0.35), { align: 'right' });
    });
    ctx.save(); ctx.globalAlpha = 1 - out; ctx.fillStyle = 'rgba(244,239,226,0.35)';
    ctx.fillRect(80, 1210 + 3 * 128, 920 * easeInOut(prog(t, 11.2, 11.6)), 2); ctx.restore();
  }

  // 5 + 6 — THE RITUAL strip, panning into ORIGINS --------------------------------
  const PAN = [13.8, 15.1, 16.4];
  const camX = (t) => 1080 * PAN.reduce((a, t0) => a + S(t, t0, 'cam'), 0);
  function drawStrip(t) {
    const cx = camX(t);
    // background: cream opens from the shrinking bowl; the fourth panel is dark
    bg(C.f950);
    const open = easeInOut(prog(t, 12.22, 12.72));
    if (t < 12.72) { // the rest of the actives shot is still leaving while the page opens
      ctx.save(); drawActivesText(t); ctx.restore();
    }
    const b = bowlState(t);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 3240 - cx, H); ctx.clip();
    ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + open * 2100, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    const trackOff = -1080 * S(t, 16.4, 'cam');
    drawTracker(t, cx, trackOff, b);
    ctx.save(); ctx.translate(trackOff, 0); kicker('04 — LE RITUEL', t, 12.55, 1e9, C.goldDeep); ctx.restore();

    const panels = [
      { num: '2–4', unit: 'cuillères à soupe', note: '+ eau chaude, en pâte lisse', t0: 12.65 },
      { num: '10–30', unit: 'minutes de pose', note: 'sur cheveux humides', t0: 14.0 },
      { num: '1×', unit: 'par semaine', note: 'rinçage à l’eau tiède', t0: 15.3 },
    ];
    panels.forEach((p, k) => {
      const rel = k * 1080 - cx;
      if (rel < -1300 || rel > 1300) return;
      ctx.save();
      // while the page is still opening, content only exists on the cream
      if (open < 1) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r + open * 2100, 0, Math.PI * 2); ctx.clip(); }
      // each panel is a window: parallax layers never leak into the neighbour
      ctx.beginPath(); ctx.rect(rel, 0, 1080, H); ctx.clip();
      const np = S(t, p.t0 - 0.25, 'type');
      const sc = lerp(0.9, 1, np);
      ctx.save(); ctx.translate(76 + rel, 930); ctx.scale(sc, sc);
      const size = Math.min(400, 400 * 900 / measure(p.num, F.display(400), -10));
      rise(p.num, 0, 0, size, F.display(size), C.ink, np, { ls: -10 });
      ctx.restore();
      rise(p.unit, 84 + rel * 1.12, 1040, 52, F.sans(52, 600), C.ink, S(t, p.t0, 'ui'));
      rise(p.note, 80 + rel * 1.2, 1132, 68, F.italic(68), C.goldDeep, S(t, p.t0 + 0.08, 'type'));
      if (k === 0) drawSpoons(t, rel, p.t0);
      if (k === 1) drawDial(t, rel, p.t0);
      if (k === 2) drawWater(t, rel, p.t0);
      ctx.restore();
    });
    // hide the kicker as the fourth panel arrives
    drawOrigins(t, 3240 - cx);
    if (t >= 20.25) drawFlyingLeaf(t);
  }
  function drawTracker(t, cx, off, b) {
    const appear = prog(t, 12.6, 13.0);
    if (appear <= 0) { drawBowl(t, b); return; }
    const labels = ['MÉLANGER', 'POSER', 'RINCER'];
    const xs = [TRACK.x0, 540, TRACK.x1];
    const fillTo = lerp(TRACK.x0, TRACK.x1, clamp(cx / 2160));
    ctx.save(); ctx.translate(off, 0);
    ctx.fillStyle = 'rgba(22,40,28,0.18)'; ctx.fillRect(TRACK.x0, TRACK.y - 1, (TRACK.x1 - TRACK.x0) * easeOut(appear), 2);
    ctx.fillStyle = C.goldDeep; ctx.fillRect(TRACK.x0, TRACK.y - 2, fillTo - TRACK.x0, 4);
    xs.forEach((x, i) => {
      if (appear <= 0.02) return;
      const active = fillTo >= x - 1;
      const pop = i === 0 ? 1 : S(t, [0, PAN[0] + 0.35, PAN[1] + 0.35][i], 'ui');
      ctx.beginPath(); ctx.arc(x, TRACK.y, 13, 0, Math.PI * 2);
      ctx.fillStyle = C.cream; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = active ? C.goldDeep : 'rgba(22,40,28,0.35)'; ctx.stroke();
      if (i > 0 && active) { ctx.beginPath(); ctx.arc(x, TRACK.y, 13 * clamp(pop, 0, 1.3), 0, Math.PI * 2); ctx.fillStyle = C.goldDeep; ctx.fill(); }
      const align = i === 0 ? 'left' : i === 1 ? 'center' : 'right';
      const lx = i === 0 ? 80 : i === 1 ? 540 : 1000;
      rise(labels[i], lx, TRACK.y + 62, 24, F.mono(24), active ? C.ink : 'rgba(22,40,28,0.45)', S(t, 12.6 + i * 0.06, 'ui'), { align, ls: 2.5 });
    });
    ctx.restore();
    // node 1 is the bowl itself
    if (t < 13.2) drawBowl(t, b);
    else { ctx.beginPath(); ctx.arc(TRACK.x0 + off, TRACK.y, 13, 0, Math.PI * 2); ctx.fillStyle = C.goldDeep; ctx.fill(); }
  }
  function drawSpoons(t, rel, t0) { // 4 tablespoons: 2 solid, 2 optional
    for (let i = 0; i < 4; i++) {
      const p = S(t, t0 + 0.25 + i * 0.09, 'ui');
      const x = 132 + i * 136 + rel * 0.9, y = 1300;
      ctx.save(); ctx.translate(x, y); ctx.scale(clamp(p, 0, 1.4), clamp(p, 0, 1.4));
      ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2);
      if (i < 2) { ctx.fillStyle = C.khaki; ctx.fill(); } else { ctx.setLineDash([8, 9]); ctx.lineWidth = 3; ctx.strokeStyle = C.khaki; ctx.stroke(); }
      ctx.restore();
    }
  }
  function drawDial(t, rel, t0) {
    const cx = 890 + rel * 0.9, cy = 1310, r = 96;
    const a0 = -Math.PI / 2;
    const sweepA = S(t, t0 + 0.1, 'cam');
    ctx.save(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(22,40,28,0.18)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // 10 → 30 minutes band on a 60-minute dial
    ctx.lineWidth = 12; ctx.lineCap = 'butt'; ctx.strokeStyle = C.goldDeep; ctx.beginPath();
    ctx.arc(cx, cy, r, a0 + Math.PI * 2 * (10 / 60), a0 + Math.PI * 2 * (10 / 60 + (20 / 60) * sweepA)); ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    const ha = a0 + Math.PI * 2 * ((10 + 20 * sweepA) / 60);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * (r - 22), cy + Math.sin(ha) * (r - 22)); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    rise('10 → 30 MIN / 60', 80 + rel * 0.9, 1322, 30, F.mono(30), 'rgba(22,40,28,0.55)', S(t, t0 + 0.2, 'ui'), { ls: 2 });
  }
  function drawWater(t, rel, t0) {
    const p = easeInOut(prog(t, t0 + 0.1, t0 + 0.9));
    ctx.save(); ctx.strokeStyle = C.goldDeep; ctx.lineWidth = 4;
    for (let k = 0; k < 3; k++) {
      ctx.globalAlpha = 1 - k * 0.3; ctx.beginPath();
      for (let x = 0; x <= 920 * p; x += 6) {
        const y = 1270 + k * 40 + Math.sin(x * 0.016 - t * 3 + k * 0.9) * 16;
        x ? ctx.lineTo(80 + x + rel * (0.85 + k * 0.05), y) : ctx.moveTo(80 + rel * (0.85 + k * 0.05), y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6 — ORIGINS (lives in the fourth panel of the strip) ---------------------------
  const ORIGINS = [
    { c: 'Maroc', sp: 'Ziziphus lotus', ratio: 0.72, t0: 17.0 },
    { c: 'Yémen', sp: 'Ziziphus spina-christi', ratio: 0.56, t0: 17.5 },
    { c: 'Inde', sp: 'Ziziphus mauritiana', ratio: 0.82, t0: 18.0 },
  ];
  const ROW_Y = (i) => 790 + i * 230;
  function yemenLeaf(t) { // the Yemen leaf flies to the center and becomes the logo
    const p = S(t, 20.25, 'card');
    return { x: lerp(146, 540, p), y: lerp(ROW_Y(1) - 40, 700, p), L: lerp(116, 520, p), rot: lerp(-0.5, -0.18, p), p };
  }
  function drawFlyingLeaf(t) {
    const y = yemenLeaf(t);
    const veinP = easeInOut(prog(t, 20.55, 21.5));
    drawLeaf(y.x, y.y, y.L, 0.56, y.rot + Math.sin(t * 1.3) * 0.01 * y.p, { fill: mixHex(C.leafHi, C.f800, clamp(y.p)), vein: C.gold, veinP: y.p > 0.5 ? veinP : 1, veinW: lerp(2, 4, clamp(y.p)), stroke: y.p > 0.3 ? 'rgba(217,179,108,0.8)' : null, strokeW: 2, shade: false });
  }
  function drawOrigins(t, ox) {
    if (ox > 1080) return;
    ctx.save(); ctx.translate(ox, 0);
    const exitT = 19.85;
    kicker('05 — ORIGINES', t, 16.75, exitT);
    riseWords('Un arbre,', 80, 400, 104, F.display(104), C.cream, t, 16.85, { tout: exitT });
    riseWords('plusieurs terroirs.', 80, 510, 104, F.italic(104), C.gold, t, 16.95, { tout: exitT + 0.03 });
    ORIGINS.forEach((o, i) => {
      const y = ROW_Y(i);
      const lp = easeInOut(prog(t, o.t0 - 0.15, o.t0 + 0.4)) * (1 - exitP(t, exitT + i * 0.05, 0.3));
      ctx.fillStyle = 'rgba(244,239,226,0.22)'; ctx.fillRect(80, y - 150, 920 * lp, 2);
      const p = S(t, o.t0, 'card');
      if (i !== 1 || t < 20.25) {
        const pop = clamp(S(t, o.t0 + 0.05, 'ui'), 0, 1.2) * (i === 1 ? 1 : 1 - exitP(t, exitT, 0.3));
        drawLeaf(146, y - 40, 116 * pop, o.ratio, -0.5, { fill: C.leafHi, vein: C.gold, veinP: 1, veinW: 2, shade: false });
      }
      rise(o.c, 240, y, 120, F.display(120), C.cream, p + exitP(t, exitT + i * 0.05, 0.35), { ls: -2 });
      rise(o.sp, 244, y + 62, 40, F.italic(40), C.gold, S(t, o.t0 + 0.08, 'type') + exitP(t, exitT + i * 0.05, 0.35));
    });
    ctx.fillStyle = 'rgba(244,239,226,0.22)'; ctx.fillRect(80, ROW_Y(2) + 110, 920 * easeInOut(prog(t, 18.2, 18.6)) * (1 - exitP(t, exitT + 0.15, 0.3)), 2);
    rise('Aucune origine n’est prouvée supérieure.', 80, 1440, 40, F.sans(40), 'rgba(244,239,226,0.72)', S(t, 18.45, 'type') + exitP(t, exitT + 0.1, 0.35));
    rise('La traçabilité compte davantage.', 80, 1512, 54, F.italic(54), C.gold, S(t, 18.6, 'type') + exitP(t, exitT + 0.12, 0.35));
    ctx.restore();
  }

  // 7 — END CARD ----------------------------------------------------------------
  function drawEnd(t) {
    bg(C.f950);
    const push = lerp(1, 1.03, easeInOut(prog(t, 20.5, 24)));
    ctx.save(); ctx.translate(540, 960); ctx.scale(push, push); ctx.translate(-540, -960);
    drawFlyingLeaf(t);
    riseWords('Les Vertus', 540, 1140, 150, F.display(150), C.cream, t, 20.6, { align: 'center', ls: -3 });
    riseWords('du Sidr', 540, 1290, 150, F.italic(150), C.cream, t, 20.7, { align: 'center', ls: -3 });
    const rl = S(t, 21.1, 'card');
    ctx.fillStyle = C.gold; ctx.fillRect(540 - 180 * rl, 1350, 360 * rl, 3);
    rise('La tradition, sourcée.', 540, 1440, 58, F.italic(58), C.gold, S(t, 21.25, 'type'), { align: 'center' });
    rise('LESVERTUSDUSIDR.FR', 540, 1520, 30, F.mono(30), 'rgba(244,239,226,0.75)', S(t, 21.45, 'ui'), { align: 'center', ls: 5 });
    ctx.restore();
  }

  // Persistent chrome: small wordmark top-left (not on the hook or the end card).
  function drawChrome(t) {
    const a = prog(t, 2.3, 2.7) * (1 - prog(t, 20.2, 20.5));
    if (a <= 0) return;
    const paint = (light) => {
      text('LES VERTUS DU SIDR', 80, 130, F.mono(24), light ? C.ink : C.cream, { ls: 3, alpha: a * 0.8 });
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = light ? C.goldDeep : C.gold; ctx.fillRect(80, 150, 44, 2); ctx.restore();
    };
    if (t > 12.42 && t < 20.5) { // split exactly at the edge of the dark panel while panning
      const edge = 3240 - camX(t);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, edge, 200); ctx.clip(); paint(true); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(edge, 0, W, 200); ctx.clip(); paint(false); ctx.restore();
    } else paint(t > 5.02 && t < 8.7);
  }

  // ---------------------------------------------------------------- master timeline
  function seek(t) {
    t = clamp(t, 0, DURATION);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    if (t < 5.0) {
      drawTree(t);
      if (t < 2.55) drawHook(t, hookLayer.getContext('2d'));
    } else if (t < 8.5) {
      drawLeafScene(t);
    } else if (t < 12.22) {
      drawActives(t);
      if (t < 9.45) drawGrains(t, LEAF3.x, LEAF3.y, LEAF3.rot, 0.94);
    } else if (t < 20.5) {
      drawStrip(t);
    } else {
      drawEnd(t);
    }
    drawChrome(t);
    drawGrain(t, 0.07);
  }

  window.DURATION = DURATION;
  window.seek = seek;
  window.ready = (async () => {
    const fams = [F.display(100), F.displayBold(100), F.italic(100), 'italic 500 100px Fraunces', F.mono(30), '400 30px "IBM Plex Mono"', F.sans(40), F.sans(40, 600), F.arabic(100), '400 100px Amiri'];
    await Promise.all(fams.map((f) => document.fonts.load(f, 'Aa0123 سدر éÉ×–’')));
    await Promise.all([loadImg('tree', 'tree.jpg'), loadImg('bowl', 'bowl.jpg')]);
    measureZero(); buildGrains();
    seek(0);
    return true;
  })();
})();
