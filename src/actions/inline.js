// src/actions/inline.js — Inline handler factories that lived in main.js.
//
// Sprint 14.2: extracted from main.js + main.js's `window.FC.X = ...`
// blocks. Each handler is a plain named function; this module exports
// `getInlineActions(deps)` that closes over the host's render / state /
// _navigate and returns the action table fragment.
//
// Why factory pattern: some of these handlers need main.js's `state`,
// `render`, or `_navigate`. Rather than pass a giant `deps` blob to every
// handler, we close over them once here at wire time.

import { getCurrentScenario } from '../engine.js';
import { getScenarioById } from '../domain/ScenarioEngine.js';
import { speakScenario, speakCreeds, speak as _speak,
         speakOptionText as _speakOptionText,
         speakConsequence as _speakConsequence,
         speakStopAndThink as _speakStopAndThink,
         speakEmotion as _speakEmotion,
         speakChained as _speakChained,
         getEmotionProsody as _getEmotionProsody,
         setTTSLang as _audioSetTTSLang,
         resetAllSettings, setSpacing as _audioSetSpacing, setHC, setVoiceEnabled, isEnabled,
         setReducedMotion } from '../audio.js';
import { addStudent as _addStudent } from '../domain/Progress.js';
import { selectStudent } from '../domain/Student.js';
import { onboardingNext as _onboardingNext, onboardingSkip as _onboardingSkip,
         resetOnboarding as _resetOnboarding } from '../components/Onboarding.js';

const _ALLOWED_HOME_FILTERS = ['value', 'caring', 'all'];

/** Build the inline-actions fragment. `deps` is { render, _navigate, getState, setView }.
 *  Returns an object ready for `Object.assign(actions, ...)` in actions/index.js.
 */
export function getInlineActions({ render, _navigate, getState, setView }) {
  if (!render) throw new Error('[actions/inline] getInlineActions: render is required');
  if (!_navigate) throw new Error('[actions/inline] getInlineActions: _navigate is required');

  return {
    // ── Voice (Sprint 14 inline bridge) ───────────────────────────
    /** data-action="speak" data-arg="${s.id}" — read scenario from cache,
     *  speak it via TTS. Falls back to the currently playing scenario. */
    speak(scenarioId) {
      if (!scenarioId) {
        const cur = getCurrentScenario();
        if (cur) return speakScenario(cur);
        return;
      }
      getScenarioById(scenarioId).then((sc) => {
        if (sc) speakScenario(sc);
      });
    },

    /** data-action="speakOpt" data-arg="${opt.id}" — read the current
     *  scenario's option text and feed to TTS. Falls back to faceOptions
     *  (Sprint 23 / SPEC §23 emotion-detective scenarios).
     *  Sprint 23 Phase 3 (SPEC §22.16.2): for face options, use
     *  emotion-tuned prosody (讀「開心」用高 pitch upbeat rate, 讀「喊」用
     *  低 pitch slow rate) so the audio cue reinforces the visual face cue
     *  — key for ASD cross-modal generalization. */
    speakOpt(optId) {
      if (!optId) return;
      const sc = getCurrentScenario();
      if (!sc) return;
      // Try text options first
      if (Array.isArray(sc.options)) {
        const opt = sc.options.find((o) => o.id === optId);
        if (opt?.text) return _speak(opt.text);
      }
      // Fall back to face options (emotion-detective) — with emotion prosody
      if (Array.isArray(sc.faceOptions)) {
        const face = sc.faceOptions.find((f) => f.id === optId);
        if (face?.label) return _speakEmotion(face.label, face.label);
      }
    },

    /** data-action="speakCreeds" — read creeds from state.resultData and
     *  speak them in sequence. */
    speakCreeds() {
      const creeds = getState()?.resultData?.creeds;
      if (creeds?.length) speakCreeds(creeds);
    },

    // ── Sprint 16: Result 頁 TTS 擴展 (SPEC §17.4.3) ──
    /** data-action="speakOptionText" — read the chosen option's text. */
    speakOptionText() {
      const opt = getState()?.resultData?.option;
      if (opt?.text) _speakOptionText(opt.text);
    },

    /** data-action="speakConsequence" — read the mainComment. */
    speakConsequence() {
      const comment = getState()?.resultData?.mainComment;
      if (comment) _speakConsequence(comment);
    },

    /** data-action="speakStopAndThink" — read stop-and-think panel. */
    speakStopAndThink() {
      const opt = getState()?.resultData?.option;
      if (opt?.stopAndThink) _speakStopAndThink(opt.stopAndThink);
    },

    // ── Sprint 23 (SPEC §23): Emotion-detective result TTS ──
    /** data-action="speakEmotionResult" — read the emotion-detective
     *  mainComment (already shaped as "答啱喇！..." or "答錯咗。正確...").
     *  Sprint 23 Phase 3 (SPEC §22.16.2): apply emotion prosody based on
     *  the emotion the student actually picked (or the correct emotion on
     *  wrong answers) so the audio reinforces the affective label. */
    speakEmotionResult() {
      const rd = getState()?.resultData;
      if (!rd?.mainComment) return;
      // Pick the emotion label to drive prosody: prefer the chosen option
      // for correct answers, fall back to the correct face for wrong answers
      // (so wrong→correct re-exposure uses the correct emotion's prosody).
      const sc = getCurrentScenario();
      const faces = Array.isArray(sc?.faceOptions) ? sc.faceOptions : [];
      let emotionLabel = null;
      if (rd.isCorrect && rd.option?.text) {
        emotionLabel = rd.option.text;
      } else {
        const correctFace = faces.find((f) => f.correct === true);
        emotionLabel = correctFace?.label || rd.option?.text || null;
      }
      return _speakEmotion(rd.mainComment, emotionLabel);
    },

    // ── Sprint 23 Phase 3 (SPEC §22.16.3): Repeat exposure ──
    /** data-action="repeatExposure" — on the emotion-detective result page,
     *  re-read the scenario question + all 3 face labels in the current
     *  (shuffled) display order. Uses emotion prosody per face so the
     *  student gets an audio reinforcement of every option, not just the
     *  correct one. Sequence is concatenated with 「。」 separator so
     *  Web Speech API pauses ~250ms between segments naturally.
     *
     *  Why repeat exposure matters for ASD learners: single-shot TTS may
     *  be missed if attention drifts; a 2nd pass with same shuffled visual
     *  order anchors the visual ↔ audio mapping. */
    repeatExposure() {
      const sc = getCurrentScenario();
      if (!sc || !Array.isArray(sc.faceOptions) || sc.faceOptions.length === 0) return;
      // Use the SAME order as currently rendered (deterministic shuffle
      // by scenarioId — see engine.js renderPlay + SPEC §22.16.1). Since
      // speak() cancels and replays, and we want the user to hear question
      // THEN each face, we run them sequentially with onend chaining.
      const question = sc.question || sc.description || '';
      const parts = [];
      if (question) parts.push({ text: question, emotion: null });
      sc.faceOptions.forEach((f) => {
        if (f?.label) parts.push({ text: f.label, emotion: f.label });
      });
      _speakChained(parts);
    },

    // ── Settings (Sprint 12 bridges) ──────────────────────────────
    /** data-action="doLogin" — teacher-mode password check. */
    doLogin() {
      const pw = document.getElementById('teacher-pw')?.value?.trim() || '';
      const expected = (typeof localStorage !== 'undefined' && localStorage.getItem('fc_teacher_pin')) || 'admin';
      const err = document.getElementById('login-error');
      if (pw === expected) {
        if (err) err.style.display = 'none';
        _navigate('teacher');
      } else if (err) {
        err.style.display = 'block';
      }
    },

    /** data-action="resetSettings" — clear all user settings + reset voice on. */
    resetSettings() {
      resetAllSettings();
      setVoiceEnabled(true);
      render();
    },

    /** data-action="setSpacing" data-arg="narrow|medium|wide". */
    setSpacing(value) {
      _audioSetSpacing(value);
      render();
    },

    /** data-action="toggleHC" — flip high-contrast mode. */
    toggleHC() {
      const current = typeof localStorage !== 'undefined' && localStorage.getItem('fc_hc_mode') === '1';
      setHC(!current);
      render();
    },

    /** data-action="toggleVoice" — flip voice TTS on/off. */
    toggleVoice() {
      setVoiceEnabled(!isEnabled());
      render();
    },

    /** data-action="toggleReducedMotion" — flip reduced-motion CSS
     *  override on <html data-rm>. The settings page toggle was a
     *  silent no-op before Sprint 14.2 (no handler). */
    toggleReducedMotion() {
      const current = typeof localStorage !== 'undefined' && localStorage.getItem('fc_rm_mode') === '1';
      setReducedMotion(!current);
      render();
    },

    // ── Hints + student add (Sprint 13 bridges) ───────────────────
    /** data-action="addStudent" — read #new-student-name, add, auto-select. */
    addStudent() {
      const input = document.getElementById('new-student-name');
      const raw = input?.value || '';
      const name = _addStudent(raw);
      if (!name) {
        if (input) {
          input.focus();
          input.style.borderColor = 'var(--danger)';
          setTimeout(() => { input.style.borderColor = ''; }, 1500);
        }
        return;
      }
      if (input) input.value = '';
      selectStudent(name);
    },

    /** data-action="toggleHints" — expand/collapse #hints-list, auto-reveal first. */
    toggleHints() {
      const btn = document.getElementById('hints-toggle');
      const list = document.getElementById('hints-list');
      const chev = document.getElementById('hints-chev');
      if (!btn || !list) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      list.hidden = expanded;
      if (chev) chev.textContent = expanded ? '▾' : '▴';
      if (!expanded) {
        const first = list.querySelector('.hint-item[data-hint-idx="0"]');
        if (first) first.hidden = false;
      }
    },

    /** data-action="revealNextHint" — reveal next hidden hint; hide btn when done. */
    revealNextHint() {
      const list = document.getElementById('hints-list');
      if (!list) return;
      const items = list.querySelectorAll('.hint-item[data-hint-idx]');
      let nextIdx = -1;
      for (let i = 0; i < items.length; i++) {
        if (items[i].hidden) { nextIdx = i; break; }
      }
      if (nextIdx === -1) {
        const btn = document.getElementById('hint-next');
        if (btn) btn.style.display = 'none';
        return;
      }
      items[nextIdx].hidden = false;
    },

    // ── Home filter (Phase 6) ─────────────────────────────────────
    /** data-action="setHomeFilter" data-arg="value|caring|all". */
    setHomeFilter(filter) {
      if (!_ALLOWED_HOME_FILTERS.includes(filter)) {
        console.warn('[FC] setHomeFilter: invalid filter', filter);
        return;
      }
      localStorage.setItem('fc_home_filter', filter);
      render();
    },

    // ── TTS language switcher ─────────────────────────────────────
    /** data-action="setTTSLang" data-arg="zh-HK|cmn-CN|en-US" — switch
     *  TTS voice and play a one-line test so the user hears the diff. */
    setTTSLang(langId) {
      _audioSetTTSLang(langId);
      const { speak } = window._fcAudio || {};
      if (speak) speak('語言切換測試，你聽到嘅係新嘅發音。');
      if (getState()?.view === 'settings') render();
    },

    // ── Utility ───────────────────────────────────────────────────
    /** data-action="reload" — full page reload (error fallback button). */
    reload() { location.reload(); },

    /** Used in inline event attrs to swallow touch/click on parent. */
    _stopEvt(e) {
      if (!e) return;
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      if (typeof e.preventDefault === 'function') e.preventDefault();
    },

    // ── Sprint 18 P1: First-visit onboarding ──────────────────────
    /** data-action="onboardingNext" — advance carousel slide or finish
     *  on the last step. Returns -1 from the helper if we just finished. */
    onboardingNext() {
      const newStep = _onboardingNext();
      if (newStep < 0) {
        // Just finished (last slide clicked). Route to role-select.
        if (setView) setView('role-select');
      }
      render();
    },

    /** data-action="onboardingSkip" — skip remaining slides and route
     *  to role-select. Marks done. */
    onboardingSkip() {
      _onboardingSkip();
      if (setView) setView('role-select');
      render();
    },

    /** data-action="replayOnboarding" — from settings, clear done flag
     *  + reset step counter + navigate to onboarding view. */
    replayOnboarding() {
      _resetOnboarding();
      if (setView) setView('onboarding');
      render();
    },
  };
}
