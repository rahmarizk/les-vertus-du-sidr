"""Tile out/contact/*.png into out/contact.png with timestamps (6 columns)."""
import glob, os, sys
from PIL import Image, ImageDraw, ImageFont
here = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[2] if len(sys.argv) > 2 else 'out/contact'
files = sorted(glob.glob(os.path.join(here, src, 't*.png')))
cols, tw = int(os.environ.get("COLS", 6)), int(os.environ.get("TW", 300))
th = tw * 1920 // 1080
rows = (len(files) + cols - 1) // cols
pad, lab = 12, 34
sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + pad + lab) + pad), '#111')
font = ImageFont.truetype(os.path.join(here, 'src/fonts/IBMPlexMono-500.ttf'), 20)
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    t = float(os.path.basename(f)[1:-4])
    x = pad + (i % cols) * (tw + pad); y = pad + (i // cols) * (th + pad + lab)
    sheet.paste(Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS), (x, y + lab))
    d.text((x, y + 6), f'{t:05.2f}s', fill='#d9b36c', font=font)
sheet.save(os.path.join(here, sys.argv[1] if len(sys.argv) > 1 else 'out/contact.png'))
print('contact sheet:', len(files), 'frames')
