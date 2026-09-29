#!/usr/bin/env bash
# Pull frames out of the *encoded* video (what viewers get) and tile them.
# usage: ./sheet_from_video.sh <step seconds> <out.png> [cols] [thumb width]
set -e
cd "$(dirname "$0")"
step=${1:-1}; out=${2:-out/contact.png}
rm -rf out/contact && mkdir -p out/contact
python3 - "$step" <<'PY'
import subprocess, sys
step = float(sys.argv[1]); t = step / 2
while t < 24:
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{t:.3f}', '-i', 'out/final.mp4', '-frames:v', '1', f'out/contact/t{t:05.2f}.png'], check=True)
    t += step
PY
COLS=${3:-6} TW=${4:-300} python3 contact.py "$out" out/contact
