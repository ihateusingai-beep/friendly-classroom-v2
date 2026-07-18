# BATCH3 PROMPTS — Family Domain (Sprint 28.1)

> **Source-of-truth:** all 30 imagePrompts used to generate the v2.13.1
> family-domain scenario illustrations. Use this doc as the regen reference
> if a single PNG needs replacement, or as the starting point if a future
> sprint re-prompting campaign is needed.

> **Re-gen command:** `python3 tools/expansion/gen_family_images.py`
> Reads `data/scenarios/<chunk>.json` `imagePrompt` field for each scenario,
> calls MiniMax image-01 (`response_format: base64`), writes to
> `assets/images/scenarios/<id>.png`. Skips existing PNGs > 1KB.

## 1. Conventions

### 1.1 Style anchor (locked across all 30)

```
, Hong Kong primary school / home environment, anime cartoon style,
warm soft pastel tones, expressive character art,
no text, no logos, no watermarks, 16:9 aspect ratio
```

**Rationale:**
- "Hong Kong primary school / home" anchors the cultural context (HK
  Cantonese primary, family-life themes) so MiniMax doesn't drift to
  generic Western settings.
- "warm soft pastel tones" — keeps the visuals SEN-friendly. The Sprint 27
  warm theme + amber `#F59E0B` family palette are preserved.
- "no text, no logos, no watermarks" — explicit guards against the most
  common image-gen failure mode (mini-CJK-glyphs / fake English / IBM-style
  logo blobs).
- "16:9 aspect ratio" — matches `src/engine.js:1300` `.scenario-image`
  CSS (`object-fit: cover`, max-height 180px) + ED baseline (1376×768).

### 1.2 Character anchor

**小明** — a 7-year-old Hong Kong primary-school boy, recurring protagonist
across all 30 scenarios. Mirrors emotion-detective's single-anchor pattern
(stylistic consistency helps SEN kids track the protagonist).

Secondary characters vary per scenario: mother, father, grandmother
(阿嫲), 5-year-old younger sister, classmate 陳仔, friend.

### 1.3 RiskLevel-2 treatment

Scenarios `st-10` (cyberbullying allyship), `st-11` (stranger DM) carry
`riskLevel: 2`. Their prompts deliberately:
- lean on **emotional reaction** (worried, confused, concerned) on the
  protagonist, NOT a menacing face on the threat
- include **abstract notification icons / dots** on the phone screen —
  no real chat avatars, no real usernames
- sometimes include the **mother / family member in the background** for
  protective framing

This keeps the imagery SEN-safe while still communicating the scenario.

### 1.4 Composition rules

- **Wide framing** (16:9) — child on left-of-center or right-of-center,
  secondary characters on the opposite side
- **Top-of-frame hint** for warm home settings — kitchen light / window
  sunlight / street view
- **Props visible but small** — main emotion carried by **body language
  + facial expression**, not by props
- **No text on labels, signs, posters, t-shirts, books, phones, packaging**
  in the rendered image

---

## 2. The 30 prompts

Each entry below is the full `imagePrompt` value as stored in JSON
(including the §1.1 anchor). Use this verbatim for regen.

### 2.1 healthy-eating (he-1 .. he-15)

```
he-1 | 媽媽煮了青菜，你想吃薯條
A Hong Kong 7-year-old boy (小明) sitting at a dinner table with his mother, a plate of stir-fried zucchini and eggs in front of them, mother smiling and waiting patiently, warm dining room light, gentle curious expression on boy's face not angry, two place settings, family dinner scene, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-2 | 阿嫲不停叫你吃多一些水果
An elderly Chinese grandmother (阿嫲) cutting a fresh apple and orange on a kitchen counter for her 7-year-old grandson, fruit plate already with two apples eaten, grandma smiling warmly with love, Hong Kong home kitchen, soft afternoon light, tender caring mood, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-3 | 你只鍾意吃肉，不吃菜
A 7-year-old boy (小明) at a school lunch tray with meat dishes only, vegetables untouched on the side of plate, his father (40s, warm expression) sitting across at the table pointing gently at the vegetables, Hong Kong primary school canteen setting, warm tones, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-4 | 阿妹不肯喝水，只喝汽水
A 7-year-old older sister (小明) standing in living room with younger sister (7yo girl) pouting with arms crossed, both near a fridge with soda cans visible on top, mother standing behind them smiling kindly, Hong Kong apartment interior, warm bright home setting, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-5 | 你成日吃零吃當正餐
A 7-year-old boy (小明) sitting on a sofa in the afternoon holding an empty chip bag and chocolate wrapper, guilty thoughtful expression, Hong Kong apartment living room with kitchen in background, soft warm light, snacking scene, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-6 | 早餐不吃，去返學
A 7-year-old boy (小明) rushing out the door of his Hong Kong apartment in the morning with backpack, school uniform, no breakfast on the table, time-pressured scene, warm bedroom doorway, slightly worried expression, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-7 | 你只喝樽裝水，不喝媽媽煲的水
A 7-year-old boy (小明) holding a bottled water in one hand and pointing at a kettle of boiled water with the other, mother standing nearby looking gently concerned about waste, Hong Kong home kitchen, warm tones, comparison scene, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-8 | 吃飯時你掛住看手機
A 7-year-old boy (小明) at dinner table with a smartphone propped up showing YouTube in front of his plate, father (40s, gentle serious expression) sitting across with hand raised in a calm teaching gesture, Hong Kong home dining scene, warm evening light, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-9 | 阿媽煮了你不鍾意的餸，你寧願不吃
A 7-year-old boy (小明) walking away from the kitchen table where a bowl of bitter melon soup sits untouched, mother looking disappointed, Hong Kong apartment interior, emotional reaction moment, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-10 | 全家人想吃 pizza，定中菜？
A Hong Kong family of four at a restaurant — parents and two children looking at menus, one child holding up a pizza menu happily while mother holding a hotpot menu, family decision scene, warm restaurant interior, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-11 | 你偷偷吃晒一些糖
A 7-year-old boy (小明) looking guilty sitting on the floor next to a candy box with only a few candies left, mother's hand visible nearby, Hong Kong home living room, dim slightly worried warm tones, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-12 | 不喝早餐奶，改喝凍檸茶
A 7-year-old boy (小明) at home near his schoolbag, a cup of warm milk placed beside it, and outside a Hong Kong street stall selling iced lemon tea visible through window, decision moment morning scene, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-13 | 屋企煮飯前你零吃吃到飽
A 7-year-old boy (小明) sitting tired and full on a sofa next to empty cookie and chocolate wrappers at 6pm, mother in kitchen with pots visible looking over with concern, Hong Kong apartment at dinnertime, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-14 | 你提議全家用同一支喝管
A Hong Kong family of four at a restaurant table with one large iced lemon tea, child raising hand making a sharing suggestion, family group scene, warm bright restaurant setting, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
he-15 | 你帶同學返屋企吃飯，要叫媽媽煮他鍾意的事？
A 7-year-old boy (小明) at his home door welcoming his friend (a Hong Kong primary school classmate) holding schoolbags, mother in background kitchen with curry on stove visible, friendly home scene, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

### 2.2 screen-time (st-1 .. st-15)

```
st-1 | 你打機打到半夜 12 點
A 7-year-old boy (小明) sitting on his bed at midnight holding an iPad with game graphics glowing on screen, clock showing 12:00 on the wall, dim bedroom with moonlight, boy looking slightly tired, Hong Kong home bedroom, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-2 | 家務 vs iPad
A 7-year-old boy (小明) on a sofa playing iPad game, mother in background pointing toward a basket of unfolded clothes with slightly tired patient expression, Hong Kong apartment weekend afternoon, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-3 | 你看 YouTube 看到不吃飯
A 7-year-old boy (小明) eating at a dining table while staring at a tablet propped up showing YouTube, plate of food getting cold, warm dining room scene, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-4 | 屋企人聊天，你掛住回 WhatsApp
A father (40s) sitting on sofa looking gently disappointed at his 7-year-old son (小明) who is fully absorbed in a smartphone, father leaning forward as if trying to start a conversation, Hong Kong home evening living room, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-5 | 功課 vs 遊戲新關卡
A 7-year-old boy (小明) at his home desk, school books still closed, looking tempted at a game console in his hand, after-school Hong Kong apartment scene, warm afternoon light, decision moment, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-6 | 你不運動，因為打機太精彩
A father (40s) holding two bicycles by the door looking hopeful, 7-year-old son (小明) on sofa with game controller in hand looking away slightly disinterested, weekend afternoon Hong Kong apartment, warm tones, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-7 | 你想買新遊戲，要儲錢 vs 用曬零用錢
A 7-year-old boy (小明) looking at a smartphone showing a $300 game page on screen, hand reaching toward an empty piggy bank, thoughtful concerned expression, Hong Kong home bedroom, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-8 | 細的扭買東西，你幫他開 YouTube 收買
A 5-year-old younger sister (7yo girl) sitting in a shopping cart mesmerized by YouTube playing on a smartphone held by 7-year-old older brother (小明), mother nearby carrying shopping bags, Hong Kong shopping mall setting, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-9 | 爸爸陪你看波，你一直掛住睇 iPad
A father (40s) sitting on sofa smiling trying to share popcorn during a sports broadcast, 7-year-old son (小明) next to him absorbed in an iPad showing YouTube highlights, weekend father-son moment with subtle loneliness, Hong Kong home living room, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-10 | 社交媒體上有人蝦你朋友
A 7-year-old boy (小明) looking at a smartphone showing a WhatsApp group chat, with concerned empathetic expression, possibly typing a reply, Hong Kong home bedroom, warm tones, allyship moment, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-11 | 陌生人 send 奇怪 message 給你
A 7-year-old boy (小明) holding a smartphone showing a chat from an unknown sender with abstract notification dots, boy looking confused and slightly worried but NOT scared, mother visible in background, Hong Kong home living room, gentle protective scene, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-12 | 你同朋友視像通話到好夜
A 7-year-old boy (小明) holding a tablet showing FaceTime with a friend visible on screen, clock on wall showing 11:00pm, mother in background with hands gently raised, Hong Kong home bedroom night scene, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-13 | 家庭旅行，你要帶 iPad 定行山？
A family of four (father, mother, 7-year-old boy 小明, younger sister) packing for a trip, father holding hiking boots pointing outdoors, boy holding an iPad protectively, family travel decision scene, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-14 | 睡前不停 scrolling 社交媒體
A 7-year-old boy (小明) lying in bed in dim bedroom light, phone on chest showing Instagram/TikTok-style vertical video feed scrolling, tired eyes, late night Hong Kong home bedroom, warm dim tones, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

```
st-15 | 家人聊天，你用耳機隔離了
A 7-year-old boy (小明) sitting at dinner table wearing over-ear headphones with YouTube on his phone screen, family members around the table looking quietly sad, disconnected family scene, Hong Kong apartment dining room, Hong Kong primary school / home environment, anime cartoon style, warm soft pastel tones, expressive character art, no text, no logos, no watermarks, 16:9 aspect ratio
```

---

## 3. Generation pipeline

```bash
# Setup: API key lives in /Users/kencheng/workspace/vs code/minimax-image-gen/.env
# as plain text line "MINIMAX_API_KEY=sk-...". gen_family_images.py reads
# that file directly (does NOT require env var).
cd ~/workspace/friendly-classroom-v2
python3 tools/expansion/gen_family_images.py
```

### 3.1 Idempotency

Script **skips** PNGs that already exist > 1KB. To force re-gen of one
PNG: delete it (`mavis-trash assets/images/scenarios/he-1.png`) then re-run.

### 3.2 Cost

MiniMax image-01, 1280×720 (16:9), one image at a time:

| Metric | Value |
|---|---|
| Per-image latency | ~12–19s |
| 30 images sequential | ~6–10 min |
| Per-image cost | ~¥0.5 |
| 30-image batch | ~¥15 |

### 3.3 Failure handling

- **HTTPError** — printed, continues to next scenario; check log tail for
  rate-limit (429) / quota (2056) status codes
- **Empty data** — MiniMax sometimes returns safety-refusal; scenario is
  skipped, surfaced in summary as `err`
- **Decode error** — b64 string fails; one-off retriable by re-running
  the same prompt

If first 5 attempts all fail → **STOP**, abort the batch, diagnose
endpoint / quota before continuing. (Built into the script via
`_FAIL_RATE_THRESHOLD` — manual observation only.)

---

## 4. v2.13.1 QA samples (for visual consistency baseline)

These 4 thumbnails came out clean in the v2.13.1 ship:

| Scenario | Expected anchor | Expected mood |
|---|---|---|
| `he-1` | 小明 (red/orange top) + mother at dining table | gentle curious, not angry |
| `he-7` | 小明 holding bottle + mother holding kettle | comparison / concern |
| `st-1` | 小明 on bed at midnight + clock + iPad | slightly tired |
| `st-11` | 小明 holding phone + abstract notifications + mother in BG | confused, NOT scared |

If a future regen drifts from these reference points:
1. Re-prompt with stricter anchor prefix.
2. Add `extra negative constraint` like `"no older characters, no teenagers"`.
3. If still drifting → switch to character-reference-image model (future
   v2.14.x feature, out of scope for v28.1).
