# Build Log - friendly-classroom-v2

## v2.2.0-2026-06-04 - Outcome Images + Web Speech TTS

**Date:** 2026-06-04
**Git:** c25898d
**GitHub Pages:** https://ihateusingai-beep.github.io/friendly-classroom-v2/

### Changes Applied
- **46 張 Ghibli 風格場景圖**: assets/images/scenarios/ s1-s-new22 (16:9)
- **129 張 Outcome 結果圖**: assets/images/outcomes/ `{scenario}_opt{N}.png`
  - 好結果 (moral ≥ 5): 温暖友誼場面
  - 中性結果 (-4 to 4): 平静離開場面
  - 壞結果 (< -4): 悲傷衝突場面
- **結果頁顯示 Outcome Image**: engine.js chooseOption() → outcomeImage path
- **Web Speech API TTS**: audio.js speakScenario() 直接用 speak()，移除 MP3 fallback
- **語音零依賴**: 全部改用瀏覽器 Web Speech API

### 關鍵文件
- src/engine.js: chooseOption() 回傳 outcomeImage
- src/audio.js: speakScenario() → speak() 直接 TTS
- assets/images/scenarios/: 46 張場景圖
- assets/images/outcomes/: 129 張結果圖

### Rollback
```bash
cd ~/workspace/friendly-classroom-v2
git reset --hard e9f68ca  # 回滾到 v2.1.0 stable
git push --force origin main
```

---

## v2.0.0-2026-06-03 - Special Ed UX Upgrade

**Date:** 2026-06-03
**Release:** https://github.com/ihateusingai-beep/friendly-classroom-v2/releases/tag/v2.0.0-2026-06-03
**Git:** f51968e

### GitHub Pages
https://ihateusingai-beep.github.io/friendly-classroom-v2/

### Changes Applied
- **巨型按鈕**: .btn min-height 64px, font 1.25em, hover lift效果, box-shadow
- **巨型選項卡**: .option-card min-height 72px, font 1.25em, border 3px
- **結果畫面**: 4em emoji, 漸層背景, bounceIn動畫, pulse效果(good only)
- **情緒動畫**: confetti彩色碎片(20個) + 星星上浮(6個) + 安慰💪bounce
- **Web Audio API SFX**: click/hover/success/fail/celebrate/complete (零外部依賴)
- **Result screen顯示場景圖**: scenario.image 傳入renderResult展示
- **場景圖片修復**: data/scenarios.json空檔案→從git f44a12e恢復(103KB, 46 scenarios)
- **initSFX()**: 全域按鈕自動音效

### 关键文件
- src/style.css: 按鈕/選項卡/結果卡/動畫keyframes
- src/main.js: choose() → triggerConfetti/StarFloat/Comfort + playSFX
- src/audio.js: playSFX() Web Audio API, initSFX()
- src/engine.js: chooseOption() → 回傳scenarioImage+scenarioTitle
- data/scenarios.json: 從git恢復，46 scenarios完整

### 部署狀態
- git push → GitHub Actions → GitHub Pages
- 最新: 09aadd9 committed 2026-06-03 03:46 UTC
- Actions: completed/success 28s

### 額外修正 v2.1.0 (2026-06-03)
8個不合理道德分數修正：
- s-new2 大聲喝止: +10→-10 | s-new2 默默忍受: -5→-15
- s-new5 扮事不關己: -5→-20 | s-new19 行開扮睇唔到: -5→-20
- s-c7 公開指責: +20→-10 | s-c5 立即告知老師: +20→+10
- s-new1 拒絕借: 0→-5 | s-new4 把遮借俾自己跑: +5→+15

### Rollback
```bash
cd ~/FC
git reset --hard f44a12e  # 回滾到上一個stable
git push --force origin main
```

---

## v1.0.0-2026-06-02 - Stable Build

**Date:** 2026-06-02
**Release:** https://github.com/ihateusingai-beep/friendly-classroom-v2/releases/tag/v1.0.0-2026-02

### GitHub Pages
https://ihateusingai-beep.github.io/friendly-classroom-v2/

### Fixes Applied
- CSS import fix (style.css bundled)
- TTS enabled=true default
- MP3 404 → Web Speech API fallback
- Voice selection priority: 粵語→國語→其他

### Audit Results
- 46/46 images: HTTP 200
- 46/46 scenarios: audio available
  - 8 MP3 (s1-s8)
  - 38 TTS fallback (s-c2, s-b1, s-h1-h5, s-b3-b4, s-c3-c9, s-door1-door6, s-new1-new22)
- 0 JS errors

### Rollback Command
gh release view v1.0.0-2026-02