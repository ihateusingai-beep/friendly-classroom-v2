#!/usr/bin/env python3
"""Friendly Classroom V2 — 批量生成 46 張 Ghibli 風格場景圖"""
import os, json, requests, base64, time

# Load API key
API_KEY = None
env_path = '/Users/kencheng/workspace/vs code/minimax-image-gen/.env'
with open(env_path) as f:
    for line in f:
        if line.startswith('MINIMAX_API_KEY='):
            API_KEY = line.strip().split('=', 1)[1].strip()
            break

HEADERS = {'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'}
OUTPUT_DIR = '/Users/kencheng/workspace/friendly-classroom-v2/assets/images/scenarios'
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_PROMPT = (
    "Hong Kong primary school setting, Studio Ghibli anime cartoon style, "
    "soft pastel watercolor, hand-drawn texture, warm sunlight, "
    "expressive character art, no text, no logos, 16:9 aspect ratio"
)

# Load scenarios
with open('/Users/kencheng/workspace/friendly-classroom-v2/data/scenarios.json') as f:
    scenarios = json.load(f)

print(f"Loaded {len(scenarios)} scenarios")
print(f"API Key: {'OK' if API_KEY else 'MISSING'}")

results = []
errors = []

for i, s in enumerate(scenarios):
    sid = s['id']
    desc = s['description']

    # Skip if already exists
    out_path = f'{OUTPUT_DIR}/{sid}.png'
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        print(f"[{i+1}/{len(scenarios)}] ⏭️  {sid} already exists, skipping")
        results.append((sid, 'skipped'))
        continue

    prompt = f"{desc}. {BASE_PROMPT}"
    payload = {
        'model': 'image-01',
        'prompt': prompt,
        'aspect_ratio': '16:9',
        'response_format': 'base64'
    }

    try:
        resp = requests.post(
            'https://api.minimax.io/v1/image_generation',
            headers=HEADERS,
            json=payload,
            timeout=180
        )
        data = resp.json()

        data_data = data.get('data')
        if data_data is None:
            code = data.get('base_resp', {}).get('status_code', 0)
            msg = data.get('base_resp', {}).get('status_msg', 'unknown')
            print(f"[{i+1}/{len(scenarios)}] ❌ {sid}: {msg} (code={code})")
            errors.append((sid, msg))
            if code == 2056:
                print("QUOTA EXHAUSTED — stopping")
                break
            continue

        b64_list = data_data.get('image_base64', [])
        if isinstance(b64_list, list):
            img_bytes = base64.b64decode(b64_list[0])
        else:
            img_bytes = base64.b64decode(b64_list)

        with open(out_path, 'wb') as f:
            f.write(img_bytes)

        print(f"[{i+1}/{len(scenarios)}] ✅ {sid} → {out_path}")
        results.append((sid, 'ok'))
        time.sleep(2)  # rate limit

    except Exception as e:
        print(f"[{i+1}/{len(scenarios)}] ❌ {sid}: {e}")
        errors.append((sid, str(e)))

print("\n=== SUMMARY ===")
print(f"OK: {sum(1 for _, r in results if r=='ok')}")
print(f"SKIPPED: {sum(1 for _, r in results if r=='skipped')}")
print(f"ERRORS: {len(errors)}")
for sid, err in errors:
    print(f"  {sid}: {err}")