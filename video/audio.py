"""Minimal rhythmic soundtrack for the sidr film, synthesized from scratch (numpy only).

120 BPM (beat = 0.5 s). Every cue below is tied to an event in src/scene.js; if you move an
animation, move its cue here too. Output: out/soundtrack.wav (48 kHz, 16-bit stereo).
Deterministic: the noise generator is seeded.
"""
import os, wave
import numpy as np

SR = 48000
DUR = 24.0
N = int(SR * DUR)
rng = np.random.default_rng(1405)
here = os.path.dirname(os.path.abspath(__file__))

NOTE = {'C2': 65.41, 'D2': 73.42, 'G2': 98.00, 'A2': 110.0, 'Bb2': 116.54, 'C3': 130.81, 'D3': 146.83,
        'Eb3': 155.56, 'F#3': 185.0, 'G3': 196.0, 'A3': 220.0, 'D4': 293.66, 'Eb4': 311.13, 'F#4': 369.99,
        'G4': 392.0, 'A4': 440.0, 'Bb4': 466.16, 'C5': 523.25, 'D5': 587.33}

dry = np.zeros((2, N))   # goes straight to the mix
send = np.zeros((2, N))  # goes through the reverb too


def put(buf, t, sig, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    buf[0, i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    buf[1, i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def env(n, a, d):
    """attack a (s) then exponential decay with time-constant d (s)."""
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)


def onepole_lp(x, cutoff):
    """one-pole low-pass; cutoff may be an array (Hz per sample)."""
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc); y[i] = acc
    return y


# ------------------------------------------------------------------ instruments
def kick(gain=1.0):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.002, 0.16) * gain * 0.55


def sub_drop():
    n = int(1.6 * SR); t = np.arange(n) / SR
    f = 34 + 40 * np.exp(-t / 0.25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.004, 0.55)


def tick(freq=3200):
    n = int(0.03 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.5 * rng.standard_normal(n)) * env(n, 0.0005, 0.006)


def shaker():
    n = int(0.09 * SR)
    x = rng.standard_normal(n); x = x - onepole_lp(x, 5000)
    return x * env(n, 0.012, 0.025)


def rim():
    n = int(0.12 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 1750 * t) * env(n, 0.0005, 0.015) + 0.6 * rng.standard_normal(n) * env(n, 0.0005, 0.02)
    return x - onepole_lp(x, 900)


def pluck(freq, dur=2.2, bright=0.5):
    """Karplus-Strong string, a little oud-like."""
    n = int(dur * SR); p = int(SR / freq)
    buf = rng.uniform(-1, 1, p)
    buf = onepole_lp(buf, 2000 + 5000 * bright)
    out = np.empty(n); idx = 0
    for i in range(n):
        v = buf[idx]; nxt = buf[(idx + 1) % p]
        buf[idx] = 0.996 * 0.5 * (v + nxt)
        out[i] = v; idx = (idx + 1) % p
    out *= env(n, 0.001, dur * 0.45)
    return out / (np.abs(out).max() + 1e-9)


def pad(freqs, dur, a=0.6, r=0.8):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):  # slow chorus
            for h, amp in ((1, 1.0), (2, 0.35), (3, 0.16), (4, 0.07)):
                x += amp * np.sin(2 * np.pi * f * (1 + det / 100) * h * t + h * det * 10)
    e = np.minimum(1, t / a) * np.minimum(1, (dur - t) / r)
    return x / (len(freqs) * 4.5) * np.clip(e, 0, 1)


def whoosh(length=0.7):
    """filtered noise that swells into the hit point (placed so it peaks at `t`)."""
    n = int(length * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    cut = 300 + 5200 * (t / length) ** 2
    y = onepole_lp(x, cut); y = y - onepole_lp(y, 180)
    return y * (t / length) ** 2.2 * np.exp(-np.maximum(0, t - length * 0.92) / 0.02)


def grain_hiss(length):
    n = int(length * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = x - onepole_lp(x, 2500)
    am = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 9 * t))
    return x * am * np.sin(np.pi * t / length) ** 1.5


# ------------------------------------------------------------------ arrangement
# HOOK: sub drop on frame 0, odometer ticks slowing down, kicker click.
put(dry, 0.0, sub_drop(), 0.9)
tt = 0.0; step = 0.022
while tt < 0.95:
    put(dry, tt, tick(2600 + 1400 * (1 - tt)), 0.18, pan=np.sin(tt * 40) * 0.4)
    tt += step; step *= 1.11
put(send, 0.5, pluck(NOTE['D4'], 1.4, 0.3), 0.22)

# Transitions: whooshes that peak exactly on the visual hit.
for hit, g in ((2.05, 0.55), (4.62, 0.4), (8.5, 0.45), (12.3, 0.45), (13.8, 0.3), (15.1, 0.3), (16.4, 0.4), (20.3, 0.45)):
    w = whoosh(0.7); put(send, hit - 0.7 * 0.92, w, g)

# Kick: full pulse on dense shots, half-time on minimal shots.
for b in range(int(DUR * 2)):
    t = b * 0.5
    if 2.0 <= t < 5.0 and b % 2 == 0: put(dry, t, kick(), 0.75)
    elif 5.0 <= t < 8.5 and b % 4 == 0: put(dry, t, kick(), 0.65)
    elif 8.5 <= t < 16.5 and b % 2 == 0: put(dry, t, kick(), 0.8)
    elif 16.5 <= t < 20.0 and b % 4 == 0: put(dry, t, kick(), 0.6)
# Shaker 8ths on the actives + ritual, rim on 2 and 4 in the ritual.
for k in range(int(8.5 * 4), int(16.5 * 4)):
    t = k * 0.25
    put(dry, t, shaker(), 0.10 if k % 2 else 0.16, pan=0.35 if k % 2 else -0.25)
for b in range(int(12.5 * 2), int(16.5 * 2)):
    if b % 4 in (1, 3): put(send, b * 0.5, rim(), 0.22)

# Plucks on type arrivals (D Hijaz).
plucks = [
    (2.5, 'D4', 0.30), (2.62, 'A4', 0.18), (3.05, 'Bb4', 0.18), (3.5, 'A4', 0.16),
    (5.3, 'D4', 0.24), (6.0, 'F#4', 0.26), (6.7, 'G4', 0.26), (7.4, 'A4', 0.28),
    (9.1, 'D4', 0.24), (10.0, 'D5', 0.22), (10.5, 'C5', 0.22), (11.0, 'Bb4', 0.22),
    (12.65, 'A4', 0.24), (14.0, 'Bb4', 0.24), (15.3, 'C5', 0.24),
    (16.85, 'D4', 0.22), (17.0, 'D4', 0.2), (17.5, 'F#4', 0.22), (18.0, 'A4', 0.22), (18.45, 'D5', 0.2),
    (20.6, 'D4', 0.3), (20.72, 'A4', 0.24), (20.84, 'D5', 0.24), (21.25, 'F#4', 0.2), (21.45, 'A4', 0.16),
]
for t, note, g in plucks:
    put(send, t, pluck(NOTE[note], 2.4, 0.55), g * 1.7, pan=(sum(map(ord, note)) % 7 - 3) / 10)

# Click on the "Broyée" snap and a hiss while the grains fall.
put(dry, 6.7, tick(1800), 0.35); put(dry, 6.7, kick(0.5), 0.4)
put(send, 6.7, grain_hiss(2.0), 0.045)

# Pads per shot.
chords = [(0.0, 5.0, ['D2', 'A2', 'D3']), (4.8, 8.7, ['G2', 'Bb2', 'D3']), (8.5, 12.7, ['D2', 'F#3', 'A3']),
          (12.4, 16.7, ['C3', 'Eb3', 'G3']), (16.4, 20.7, ['G2', 'Bb2', 'D3']), (20.4, 24.0, ['D2', 'A2', 'D3', 'F#3'])]
for a, b, notes in chords:
    put(send, a, pad([NOTE[x] for x in notes], b - a, a=0.35 if a > 0 else 0.05, r=1.4 if b >= 24 else 0.4), 0.42)

# ------------------------------------------------------------------ reverb + master
def reverb(x, seconds=2.0, seed=0):
    r = np.random.default_rng(seed)
    n = int(seconds * SR); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t / (seconds / 6.5))
    ir = onepole_lp(ir, 6000); ir /= np.sqrt((ir ** 2).sum())
    L = 1 << int(np.ceil(np.log2(len(x) + n)))
    y = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[: len(x)]
    return y


wet = np.stack([reverb(send[0], seed=1), reverb(send[1], seed=2)])
mix = dry + send + 0.35 * wet
tail = np.ones(N); tail[-int(0.4 * SR):] = np.linspace(1, 0, int(0.4 * SR))
mix *= tail
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix *= 10 ** (-1 / 20) / np.abs(mix).max()

os.makedirs(os.path.join(here, 'out'), exist_ok=True)
pcm = (mix.T * 32767).astype('<i2')
with wave.open(os.path.join(here, 'out/soundtrack.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote out/soundtrack.wav', f'{DUR}s')
