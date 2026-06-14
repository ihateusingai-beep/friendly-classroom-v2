// src/util/escape.js
// HTML attribute / text escaping helpers.
//
// Used in inline `onclick="FC.foo('${x}')"` interpolations and bare
// `aria-label="${x}"` / `<span>${x}</span>` interpolations where `x` is
// user-controlled (e.g. student.name). Without this, a name like
// `Bob'); alert(1); ('` would break out of the attribute and execute
// arbitrary JS. Also defends against HTML injection in text nodes.
//
// Phase 1 (S3) — applied to known risky sites in main.js / teacher.js.
// The architectural fix (Phase 3 S16: delegated event listeners) removes
// the `onclick` string pattern entirely; this helper is the bridge.

export function escapeAttr(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\)/g, '&#41;')
    .replace(/\(/g, '&#40;');
}

// Escape for a JavaScript string literal (single-quoted).
// Used for `onclick="FC.foo('${x}')"` style where the value is inside
// a single-quoted JS string. Only the closing quote + JS-significant
// characters matter; HTML entities are NOT needed inside an attribute
// that the browser parses as JS (the JS parser reads the raw bytes).
// But to be safe across contexts we use the same set as escapeAttr.
export function escapeJsString(s) {
  if (s == null) return '';
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\)/g, '\\u0029')
    .replace(/\(/g, '\\u0028');
}
