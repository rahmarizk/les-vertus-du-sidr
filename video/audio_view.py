"""Draw the soundtrack's envelope and spectrogram with the shot cuts marked (sync check)."""
import os, wave, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
here = os.path.dirname(os.path.abspath(__file__))
w = wave.open(os.path.join(here, 'out/soundtrack.wav'))
sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).mean(1) / 32768
W, H = 2400, 520
img = Image.new('RGB', (W, H), '#111'); d = ImageDraw.Draw(img)
hop = len(x) // W
# spectrogram (top)
for i in range(W):
    seg = x[i * hop:i * hop + 2048]
    if len(seg) < 2048: break
    s = np.abs(np.fft.rfft(seg * np.hanning(2048)))[:700]
    s = np.clip((20 * np.log10(s + 1e-6) + 20) / 60, 0, 1)
    for j in range(0, 700, 3):
        v = int(255 * s[j]); d.point((i, 300 - j * 300 // 700), fill=(v, int(v * .8), int(v * .4)))
# envelope (bottom)
for i in range(W):
    seg = x[i * hop:(i + 1) * hop]; r = np.sqrt((seg ** 2).mean()) if len(seg) else 0
    h = int(r * 500); d.line((i, 420 - h, i, 420 + h), fill='#7fae6c')
font = ImageFont.truetype(os.path.join(here, 'src/fonts/IBMPlexMono-500.ttf'), 16)
for c in [2.05, 4.62, 5.0, 8.5, 12.3, 13.8, 15.1, 16.4, 20.3]:
    X = int(c / 24 * W); d.line((X, 0, X, H), fill='#d9b36c'); d.text((X + 3, 302), f'{c}', fill='#d9b36c', font=font)
img.save(os.path.join(here, 'out/audio_check.png'))
