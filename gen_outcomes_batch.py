#!/usr/bin/env python3
"""FC V2 — Batch outcome image generator — all 129 images"""
import os, json, requests, base64, time

API_KEY_PATH = '/Users/kencheng/workspace/vs code/minimax-image-gen/.env'
with open(API_KEY_PATH) as f:
    for line in f:
        if line.startswith('MINIMAX_API_KEY='):
            API_KEY = line.strip().split('=', 1)[1].strip()
            break

HEADERS = {'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'}
OUTPUT_DIR = '/Users/kencheng/workspace/friendly-classroom-v2/assets/images/outcomes'
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE = (
    "Hong Kong primary school setting, Studio Ghibli anime cartoon style, "
    "soft pastel watercolor, hand-drawn texture, warm sunlight, "
    "expressive character art, no text, no logos, 16:9 aspect ratio"
)

def moral_to_scene(m):
    if m >= 5:   return "warm friendship scene, children smiling supporting each other, kind positive atmosphere, happy emotions"
    elif m >= -4: return "quiet neutral scene, child walking away thoughtfully, calm reflective atmosphere"
    else:        return "sad emotional scene, child looking hurt or isolated, sombre atmosphere, feeling upset"

with open('/Users/kencheng/workspace/friendly-classroom-v2/data/scenarios.json') as f:
    scenarios = json.load(f)

images = []
for s in scenarios:
    for i, o in enumerate(s.options):
        m = o.effects[0].get('moralChange', 0) if o.effects else 0
        scene_desc = moral_to_scene(m)
        prompt = f"{scene_desc}. {BASE}"
        fname = f"{s.id}_opt{i+1}.png"
        images.append({'fname': fname, 'prompt': prompt, 'moral': m, 'sid': s.id, 'opt': i+1})

total = len(images)
print(f"Total: {total} images")

ok, errors = 0, []
for idx, img in enumerate(images):
    out_path = f"{OUTPUT_DIR}/{img['fname']}"
    if os.path.exists(out_path) and os.path.getsize(out_path) > 500:
        print(f"[{idx+1}/{total}] ⏭ {img['fname']} already exists")
        ok += 1
        continue

    payload = {
        'model': 'image-01',
        'prompt': img['prompt'],
        'aspect_ratio': '16:9',
        'response_format': 'base64'
    }

    try:
        resp = requests.post(
            'https://api.minimax.io/v1/image_generation',
            headers=HEADERS, json=payload, timeout=180
        )
        data = resp.json()
        data_data = data.get('data')
        if data_data is None:
            code = data.get('base_resp', {}).get('status_code', 0)
            msg = data.get('base_resp', {}).get('status_msg', 'unknown')
            print(f"[{idx+1}/{total}] ❌ {img['fname']}: {msg} (code={code})")
            errors.append((img['fname'], msg))
            if code == 2056:
                print("QUOTA EXHAUSTED — stopping")
                break
            continue

        b64_list = data_data.get('image_base64', [])
        img_bytes = base64.b64decode(b64_list[0]) if isinstance(b64_list, list) else base64.b64decode(b64_list)
        with open(out_path, 'wb') as f:
            f.write(img_bytes)

        print(f"[{idx+1}/{total}] ✅ {img['fname']} (moral={img['moral']})")
        ok += 1
        time.sleep(2)

    except Exception as e:
        print(f"[{idx+1}/{total}] ❌ {img['fname']}: {e}")
        errors.append((img['fname'], str(e)))

print(f"\n=== DONE ===")
print(f"OK: {ok}/{total}")
print(f"ERRORS: {len(errors)}")
for fname, err in errors:
    print(f"  {fname}: {err}")