#!/usr/bin/env python3
"""Friendly Classroom V2 — 生成 129 張 Outcome 結果圖"""
import os, json, requests, base64, time

API_KEY = ''
env_path = '/Users/kencheng/workspace/vs code/minimax-image-gen/.env'
with open(env_path) as f:
    for line in f:
        if line.startswith('MINIMAX_API_KEY='):
            API_KEY = line.strip().split('=', 1)[1].strip()
            break

HEADERS = {'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'}
OUTPUT_DIR = '/Users/kencheng/workspace/friendly-classroom-v2/assets/images/outcomes'
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_PROMPT = (
    "Hong Kong primary school setting, Studio Ghibli anime cartoon style, "
    "soft pastel watercolor, hand-drawn texture, warm sunlight, "
    "expressive character art, no text, no logos, 16:9 aspect ratio"
)

def moral_to_type(m):
    if m >= 5: return 'good'
    if m >= -4: return 'neutral'
    return 'bad'

def moral_to_scene(m):
    if m >= 5:
        return "warm friendship scene, children smiling and supporting each other, kind atmosphere, positive emotions"
    elif m >= -4:
        return "quiet neutral scene, child walking away thoughtfully, calm atmosphere, reflective mood"
    else:
        return "sad conflict scene, child feeling hurt or alone, emotional distress, sombre atmosphere"

with open('/Users/kencheng/workspace/friendly-classroom-v2/data/scenarios.json') as f:
    scenarios = json.load(f)

images = []
for s in scenarios:
    for i, o in enumerate(s.options):
        m = o.effects[0].get('moralChange', 0) if o.effects else 0
        mtype = moral_to_type(m)
        scene_desc = moral_to_scene(m)
        option_text = o.text[:40]
        prompt = f"{scene_desc}. {option_text}. {BASE_PROMPT}"
        filename = f"{s.id}_opt{i+1}_{mtype}.png"
        images.append({
            'filename': filename,
            'prompt': prompt,
            'moral': m,
            'type': mtype,
            'scenario': s.id,
            'option': i+1,
            'option_text': o.text[:50]
        })

print(f"Total: {len(images)} outcome images to generate")
# Show sample
for img in images[:6]:
    print(f"  {img['filename']} | moral={img['moral']} ({img['type']}) | {img['option_text'][:40]}")

with open('/tmp/fc_outcome_images.json', 'w') as f:
    json.dump(images, f)

print(f"\nSaved {len(images)} image specs to /tmp/fc_outcome_images.json")