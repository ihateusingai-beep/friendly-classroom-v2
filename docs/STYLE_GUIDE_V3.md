# 友愛教室 V3 — 文字風格指南 (STYLE_GUIDE_V3)

> **版本**:v1.0 (2026-06-22)
> **範圍**:scenario `options[].text` + `options[].effects[].comment` + `options[].stopAndThink.{badBehavior,consequence}`
> **配合**:SPEC.md §17.2 + §17.7 R-V3.7-1
> **不涵蓋**:scenario `title` / `description`(破壞 image prompt 對齊)/ `creed text`(EDB 官方 wording)/ Settings / Toast / Banner

---

## 1. 核心原則

1. **對齊香港小學中文課程** — 用粵語書面語,即「香港中文」嘅 standard written form
2. **正向鼓勵為主** — 尤其答啱 feedback,答錯反思避免責備(SEN 學生友善 framing)
3. **完整句為主** — 避免「你 + 形容詞」式短句,要有 subject + predicate + object
4. **第二人稱統一「你」** — 唔用「您」(對 SEN 小學生太 formal)
5. **第三人稱按角色性別** — 用「他」(男) / 「她」(女),唔用「佢」

---

## 2. 口語 → 書面語 對照表(30 個常用)

### 2.1 人稱

| 口語(舊) | 書面語(新) | 類別 |
|---|---|---|
| 你 | 你 | 第二人稱(不變) |
| 你哋 | 你們 | 第二人稱複數 |
| 佢 | 他 / 她 | 第三人稱單數(按角色性別) |
| 佢哋 | 他們 / 她們 | 第三人稱複數 |

### 2.2 判斷 / 否定

| 口語(舊) | 書面語(新) | 類別 |
|---|---|---|
| 係 | 是 | 判斷句 |
| 唔係 | 不是 | 否定判斷 |
| 有 | 有 | 存在(不變) |
| 冇 | 沒有 | 否定存在 |

### 2.3 所有格 / 位置 / 否定 / 完成貌

| 口語(舊) | 書面語(新) | 類別 |
|---|---|---|
| 嘅 | 的 | 所有格(結構助詞) |
| 喺 | 在 | 位置介詞 |
| 唔 | 不 | 否定副詞 |
| 冇 | 沒有 / 未 | 否定(已完成 / 未完成) |
| 咗 | 了 | 完成貌 |
| 嚟 | 來 | 趨向補語 |
| 去咗 | 去了 | 完成貌 + 趨向 |
| 過咗 | 過了 | 經驗貌 |

### 2.4 疑問詞

| 口語(舊) | 書面語(新) | 類別 |
|---|---|---|
| 邊個 | 哪一個 / 誰 | 疑問代詞 |
| 咩 | 什麼 | 疑問代詞 |
| 點解 | 為什麼 | 疑問副詞 |
| 點樣 | 怎樣 / 如何 | 疑問方式 |
| 邊度 | 哪裡 | 疑問地點 |
| 幾多 | 多少 | 疑問數量 |

### 2.5 時間

| 口語(舊) | 書面語(新) | 類別 |
|---|---|---|
| 而家 | 現在 | 時間副詞 |
| 今日 | 今天 | 時間名詞 |
| 聽日 | 明天 | 時間名詞 |
| 琴日 | 昨天 | 時間名詞 |
| 先前 / 之前 | 之前 / 從前 | 時間名詞 |
| 跟住 | 然後 / 接著 | 時間連詞 |

### 2.6 指示 / 量詞

| 口語(舊) | 書面語(新) | 類別 |
|---|---|---|
| 呢個 | 這個 | 指示代詞 |
| 嗰個 | 那個 | 指示代詞 |
| 嗰 | 那 | 指示代詞 |
| 啲 | 這些 / 那些 | 量詞 |

### 2.7 動詞

| 口語(舊) | 書面語(新) | 類別 |
|---|---|---|
| 睇 | 看 / 觀察 | 視覺動詞 |
| 諗 | 想 / 思考 | 思維動詞 |
| 話 | 說 | 言語動詞 |
| 走開 | 離開 | 位移動詞 |
| 攞 | 拿 | 拿取動詞 |
| 畀 | 給 | 給予動詞 |
| 食 | 吃 | 飲食動詞 |
| 飲 | 喝 | 飲食動詞 |
| 瞓 | 睡覺 | 動作動詞 |

### 2.8 連詞

| 口語(舊) | 書面語(新) | 類別 |
|---|---|---|
| 同埋 | 和 / 與 | 並列連詞 |
| 不過 | 但是 | 轉折連詞 |
| 因為 ... 所以 | 因為 ... 所以 | 連詞(完整) |

---

## 3. 文風規則

### 3.1 句式結構

1. **完整句優先** — subject + predicate + object
   - ❌ `你好勇敢！`(短句,欠結構)
   - ✅ `你的選擇很勇敢，保護了自己的安全。`

2. **長度控制**
   - option text ≤ **30 字**
   - effects comment ≤ **40 字**
   - stopAndThink badBehavior ≤ **25 字**
   - stopAndThink consequence ≤ **80 字**

3. **句子分隔** — 用全形句號「。」分句,避免長複合句

### 3.2 語氣分級

| 結果 | 圖案 | 語氣 | 例 |
|---|---|---|---|
| Positive(moralChange ≥ 0) | 🌟 | 正面鼓勵,具體指出好行為 | `你識得尊重朋友的感受，是很好的聆聽者！` |
| Negative(moralChange < 0) | 🤔 | 邀請反思,語氣溫和,避免責備 | `讓我們再想一想還有沒有更好的方法。` |

**❌ 禁用**:
- `你做錯了`(直接責備)
- `你不應該這樣做`(否定學生)
- `你真笨`(能力否定)
- `壞學生 / 衰仔`(人格標籤)

**✅ 推薦**:
- `讓我們再想一想`(邀請反思)
- `停一停,想一想`(stop-and-think template 標準起手式)
- `請你再選出正確的回應吧`(正向邀請重試)
- `你的選擇很勇敢, ...`(positive feedback 結構)

### 3.3 Emoji 規則

1. **每段最多 1 個 emoji**,放句首(可選)
2. **emoji 入句中斷句**:❌ 唔可以做(影響 TTS 朗讀)
   - ❌ `你好🌟勇敢！`
   - ✅ `你好勇敢！🌟`(emoji 句尾)
   - ✅ `🌟 你好勇敢！`(emoji 句首)
3. **emoji 用法**:
   - 🌟 = positive feedback / 表揚
   - 🤔 = negative feedback / 反思
   - ❤️ = 關愛 / 友愛
   - 💪 = 鼓勵 / 堅強
4. **TTS 入面嘅 emoji**:`stripEmojiForTTS` helper 自動移除(speech synthesis 唔識讀)

### 3.4 標點

1. **全形中文標點**:`，。！？「」`,唔用半形 `, . ! ?`
2. **引號** — dialogue 用「」,嵌套用『』
   - ❌ `"我哋一齊去玩"`
   - ✅ `「我們一起去玩」`
3. **列表分隔** — 用「、」,唔用英文逗號
4. **省略號** — 用「……」(六點),唔用「...」(三點)

### 3.5 數字

1. **阿拉伯數字**:1/2/3(數量、年份、號碼)
2. **唔用中文數字**:一/二/三(容易混淆)
3. **百分比**:用「%」,唔用「百分之」
   - ✅ `增加了 20%`
   - ❌ `增加了百分之二十`

---

## 4. 不可用詞(blacklist)

`tools/style/audit-scenarios.mjs` (CI script)會掃以下口語 marker,出現即 fail build:

```
你哋, 佢, 佢哋, 係, 唔係, 嘅, 喺, 唔, 咗, 嚟,
邊個, 咩, 點解, 點樣, 而家, 今日, 聽日, 啲, 嗰,
呢個, 嗰個, 睇, 諗, 話, 走開, 攞, 畀, 同埋,
好啦, 啦, 喎, 嘅, 嘢, 嘅話, 食, 飲, 瞓,
邊度, 幾多, 琴日, 先前, 跟住, 不過
```

> ⚠️ 注意:`scenario.description` 同 `scenario.title` **唔係** blacklist scope(unchanged scope),audit script 只掃:
> - `options[].text`
> - `options[].effects[].comment`
> - `options[].stopAndThink.badBehavior`
> - `options[].stopAndThink.consequence`

---

## 5. 答錯反饋 Template 標準格式

所有 negative options 嘅 stopAndThink panel 必須用以下 template(由 `src/domain/Feedback.js:formatStopAndThink()` 自動 render):

```
🤔 再想想

停一停，想一想：
如果你 [badBehavior]，會有什麼影響？
就是 [consequence]，這樣是 {isLoselose ? '雙輸結局' : '單輸結局'}。
請你再選出正確的回應吧！
```

### 5.1 BadBehavior 撰寫指引

- **第三人稱** 為主:`和小明一起排擠小華`
- **或 第二人稱 + 行為動詞**:`不尊重朋友的感受`
- **避免**:具體姓名 + 攻擊性描述(例如:`欺負小明` 太直接 → `和小明爭吵` 中性啲)

### 5.2 Consequence 撰寫指引

- **眾人感受 + 真實後果**:`小華會感到被誤會而傷心，其他同學會認為你們不公平，小明亦會錯過了解真相的機會`
- **必須包含至少 1 個 emotional impact**(`傷心`/`難過`/`不舒服`/`失望`)
- **必須包含至少 1 個 real consequence**(`影響友誼`/`失去信任`/`錯過機會`)
- **避免**:純粹講規則(`違反校規` 太抽象)

### 5.3 IsLoselose 判定

- **`true`(預設)**:雙輸 — 自己 + 對方都受影響(90% 嘅 negative case)
- **`false`**:單輸 — 只有自己受影響(少數,e.g. 自我放棄、逃避責任)

---

## 6. 改寫範例(empathy topic 試水溫)

### Example 1:`s6-a`(原文 → 改寫)

**原文(option text)**:
```
「係呀！小華太衰啦！我都唔同佢玩！」
```

**改寫(書面語)**:
```
「是啊！小華太過分了！我也不跟他玩了！」
```

**原文(effects comment)**:
```
你同小明一齊排斥小華。但係之後你先知，小華係唔小心整壞既嘢，佢本來想道歉但搵唔倒機會。小華喊咗，你覺得自己做錯咗...
```

**改寫(書面語)**:
```
你和小明一起排擠小華。但之後你才知道，小華是不小心弄壞的，他本來想道歉但找不到機會。小華哭了，你覺得自己做錯了。
```

**新增 stopAndThink**:
```json
{
  "badBehavior": "和小明一起排擠小華",
  "consequence": "小華會感到被誤會而傷心，其他同學會認為你們不公平，小明亦會錯過了解真相的機會",
  "isLoselose": true
}
```

### Example 2:`s6-c`(positive — 唔加 stopAndThink)

**改寫(option text)**:
```
「或者他不是故意的？你有問過他嗎？」
```

> ✅ positive case moralChange ≥ 0,**唔加** stopAndThink,保持簡潔正向 feedback

---

## 7. CI Integration

### 7.1 Audit Script

`tools/style/audit-scenarios.mjs`(Sprint 16 新增):

```bash
node tools/style/audit-scenarios.mjs
# 掃 17 個 scenario JSON file
# 對齊 §4 blacklist + §3 長度規則
# 出現 violation → process.exit(1)
```

### 7.2 CI Pipeline

```yaml
# .github/workflows/ci.yml 加 step
- name: Style audit
  run: node tools/style/audit-scenarios.mjs
```

### 7.3 Pre-commit Hook

```bash
# .git/hooks/pre-commit
node tools/style/audit-scenarios.mjs || {
  echo "❌ Style audit failed. 見 docs/STYLE_GUIDE_V3.md §4"
  exit 1
}
```

---

## 8. Migration 策略

### 8.1 Sprint 16(empathy topic 試水溫,~10 scenarios)

1. 用 `gen_empathy_v2.py` 批量 replace 口語 marker
2. Manual review 每個 option text + effects comment
3. 全部 negative options 加 stopAndThink field
4. 跑 `tools/style/audit-scenarios.mjs` 確保 0 violation
5. 跑 Playwright e2e 確保 render OK

### 8.2 Sprint 17(剩 16 topics,~250 scenarios)

跟 Sprint 16 嘅 pattern,逐 topic 做。

### 8.3 Sprint 18+(Settings / Toast / Banner)

`docs/STYLE_GUIDE_V3.md` 嘅 scope **不涵蓋** Settings / Toast / Banner。呢啲 UI 文字嘅書面語化留 Sprint 18+(§3.1 UI 改進 sprint)。

---

## 9. 例外情況

### 9.1 Scenario description(unchanged scope)

`description` 同 `title` **唔改**,因為:
- 改 `description` 會破壞 image prompt 對齊(AI image gen 用 description 做 reference)
- 改 `title` 會影響 topic card UI label

### 9.2 Creeds text(unchanged scope)

`creeds.js` VALUE_CREEDS / LEGACY_CREEDS **唔改**,因為:
- EDB 官方 wording,改動觸及合規
- 已 Sprint 5+6 國語 MP3 → 粵語 TTS fallback chain 處理

### 9.3 Bank game mode

Bank 沿用獨立 settlement visual (`renderBankResult`)。Bank 係獨立 game mode，自有 visual feedback (Sprint 5+)，moral-choice / emotion-detective 嘅 stop-and-think panel 唔適用。

---

*Style Guide 日期:2026-06-22 | 配合 SPEC.md §17 + Sprint 16 開工 | 維護者: Mavis + kencheng*
