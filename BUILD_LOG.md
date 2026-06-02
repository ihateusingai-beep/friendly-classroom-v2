# Build Log - friendly-classroom-v2

## v1.0.0-2026-06-02 - Stable Build

**Date:** 2026-06-02
**Release:** https://github.com/ihateusingai-beep/friendly-classroom-v2/releases/tag/v1.0.0-2026-06-02

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
gh release view v1.0.0-2026-06-02