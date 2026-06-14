#!/usr/bin/env python3
"""Generate emoji placeholder images for missing s-self outcome PNGs.

User-perceived issue: result page shows blank outcome image because 525
s-self outcome PNGs were never written to source/assets/images/outcomes/.
prebuild-sync.sh rsyncs with --delete, so any future build would wipe
anything written directly to public/. Source of truth is assets/.

Run from repo root:
  python3 gen_sself_placeholders.py
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

EMOJI_BANK = ['⚖️', '🤝', '🎯', '❤️', '🆘', '🚧', '🛡️', '🌱', '💪', '🌟']
EMOJI_FONT = '/System/Library/Fonts/Apple Color Emoji.ttc'
LABEL_FONT = '/Library/Fonts/Arial Unicode.ttf'
OUT_DIR = 'assets/images/outcomes'
W, H = 256, 192


def make_png(scenario_id: str, option_idx: int, path: str) -> None:
    """Render one placeholder PNG and save to path."""
    try:
        num = int(scenario_id.split('-')[-1])
    except ValueError:
        num = 0
    emoji = EMOJI_BANK[num % len(EMOJI_BANK)]

    img = Image.new('RGB', (W, H), (245, 240, 230))
    draw = ImageDraw.Draw(img)

    # Center emoji
    efont = ImageFont.truetype(EMOJI_FONT, 96)
    bb = draw.textbbox((0, 0), emoji, font=efont)
    ew, eh = bb[2] - bb[0], bb[3] - bb[1]
    draw.text(((W - ew) / 2 - bb[0], (H - eh) / 2 - bb[1] - 12),
              emoji, font=efont, embedded_color=True)

    # Footer label
    lfont = ImageFont.truetype(LABEL_FONT, 14)
    label = f'{scenario_id}  opt{option_idx}'
    lbb = draw.textbbox((0, 0), label, font=lfont)
    lw = lbb[2] - lbb[0]
    draw.text(((W - lw) / 2, 168), label, font=lfont, fill=(120, 120, 120))

    img.save(path, 'PNG', optimize=True)


def main():
    if not os.path.exists('data/scenarios.json'):
        print('ERROR: data/scenarios.json not found (run from repo root)')
        sys.exit(1)

    import json
    with open('data/scenarios.json') as f:
        scenarios = json.load(f)

    os.makedirs(OUT_DIR, exist_ok=True)
    written = 0
    skipped = 0
    for s in scenarios:
        sid = s['id']
        if not sid.startswith('s-self-'):
            continue
        for i in range(len(s.get('options', []))):
            filename = f'{sid}_opt{i+1}.png'
            out_path = os.path.join(OUT_DIR, filename)
            if os.path.exists(out_path):
                skipped += 1
                continue
            make_png(sid, i + 1, out_path)
            written += 1
    print(f'Wrote {written} placeholders, skipped {skipped} existing')


if __name__ == '__main__':
    main()
