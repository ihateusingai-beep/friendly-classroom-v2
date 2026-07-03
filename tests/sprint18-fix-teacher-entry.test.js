// tests/sprint18-fix-teacher-entry.test.js
// Sprint 18.2.1 — Teacher entry-point regression guards.
//
// Background: S18.1 (v2.11.0) shipped 老師 / 家長 mode entry points but
// production build was broken due to ESBuild tree-shaking dropping the
// `_loadTeacher` dep-injection entry from `wireActions({...})` call AND
// `main.js render()` post-render hook referenced `updateAnalyticsSummary`
// without importing it. This file pins the source-level invariants that
// prevent those regressions from coming back.

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');

function read(rel) {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

import { join } from 'node:path';

describe('Sprint 18.2.1 — Teacher entry point invariants', () => {
  const mainSrc = read('main.js');
  const authSrc = read('domain/Auth.js');
  const hubSrc = read('games/Hub.js');

  it('§1 main.js imports updateAnalyticsSummary from domain/IO.js (was missing, threw ReferenceError on settings view)', () => {
    // Production bundle exposed: "updateAnalyticsSummary is not defined"
    // because main.js called it from a post-render hook without importing.
    expect(mainSrc).toMatch(
      /import\s*\{[^}]*\bupdateAnalyticsSummary\b[^}]*\}\s*from\s*['"]\.\/domain\/IO\.js['"]/
    );
  });

  it('§2 main.js render() case "login" dynamic-imports teacher chunk on demand (no longer needs `_loadTeacher` injection)', () => {
    // Old brittle pattern: relied on `_loadTeacher` dep from wireActions call,
    // which ESBuild tree-shook in production builds.
    const loginIdx = mainSrc.indexOf("case 'login'");
    expect(loginIdx).toBeGreaterThan(-1);
    const loginSlice = mainSrc.slice(loginIdx, loginIdx + 700);
    expect(loginSlice).toContain("import('./teacher.js')");
  });

  it('§3 main.js render() case "teacher" dynamic-imports teacher chunk on demand', () => {
    const teacherIdx = mainSrc.indexOf("case 'teacher'");
    expect(teacherIdx).toBeGreaterThan(-1);
    const teacherSlice = mainSrc.slice(teacherIdx, teacherIdx + 700);
    expect(teacherSlice).toContain("import('./teacher.js')");
  });

  it('§4 Auth.js chooseRole 唔再 await `_loadTeacher()` (render() handles chunk load)', () => {
    expect(authSrc).not.toMatch(/chooseRole[\s\S]{0,400}await\s+_loadTeacher\(\)/);
  });

  it('§5 Hub.js goTeacher 唔再用 `_loadTeacher` parameter (render() handles chunk load)', () => {
    expect(hubSrc).not.toMatch(/goTeacher[\s\S]{0,400}await\s+_loadTeacher\(/);
    expect(hubSrc).toMatch(/export\s+async\s+function\s+goTeacher\s*\(\s*\)/);
  });

  it('§6 data-action="goTeacher" still registered in actions registry (regression guard)', () => {
    const actionsSrc = read('actions/index.js');
    // Either as bare key in Object.assign table OR via explicit registration
    expect(actionsSrc).toMatch(/goTeacher/);
  });

  it('§7 data-action="chooseRole" still registered (Path A regression guard)', () => {
    const actionsSrc = read('actions/index.js');
    expect(actionsSrc).toMatch(/chooseRole/);
  });
});