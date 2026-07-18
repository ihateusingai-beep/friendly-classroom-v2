/**
 * Sprint 28.1 — Family Domain scenario image presence + provenance tests
 *
 * 5 invariants:
 *   1. every scenario in healthy-eating.json (he-*) has a corresponding PNG
 *      at assets/images/scenarios/<id>.png
 *   2. every scenario in screen-time.json (st-*) has a corresponding PNG
 *      at assets/images/scenarios/<id>.png
 *   3. all 30 PNGs are > 5KB (catches broken / empty / truncated files)
 *   4. every scenario in both JSON files carries a non-empty imagePrompt
 *      field that ends with the 16:9 anchor suffix
 *   5. source assets (assets/images/scenarios/<id>.png) are mirrored to
 *      public/assets/images/scenarios/<id>.png (prebuild-sync parity)
 *
 * Sprint 28.1 ship gate (v2.13.1). Skip on these failures = don't ship.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function loadJSON(relPath) {
    const fp = path.join(ROOT, relPath);
    return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

function chunkIDs(chunks) {
    return chunks.flatMap((c) => c.map((s) => s.id));
}

describe('Sprint 28.1 — Family Domain scenario illustrations', () => {
    const heChunks = [loadJSON('data/scenarios/healthy-eating.json')];
    const stChunks = [loadJSON('data/scenarios/screen-time.json')];
    const heIDs = chunkIDs(heChunks);
    const stIDs = chunkIDs(stChunks);
    const SRC_DIR = path.join(ROOT, 'assets/images/scenarios');
    const PUB_DIR = path.join(ROOT, 'public/assets/images/scenarios');

    it('AC1: every he-* scenario has a PNG at assets/images/scenarios/<id>.png', () => {
        expect(heIDs.length).toBe(15);
        for (const sid of heIDs) {
            const p = path.join(SRC_DIR, `${sid}.png`);
            expect(fs.existsSync(p), `missing PNG for ${sid}`).toBe(true);
        }
    });

    it('AC2: every st-* scenario has a PNG at assets/images/scenarios/<id>.png', () => {
        // Sprint 18.7: st-7 moved to financial-literacy.json — screen-time now 14
        expect(stIDs.length).toBe(14);
        for (const sid of stIDs) {
            const p = path.join(SRC_DIR, `${sid}.png`);
            expect(fs.existsSync(p), `missing PNG for ${sid}`).toBe(true);
        }
    });

    it('AC3: all 29 PNGs > 5KB (no broken / empty / truncated files) — 15 he + 14 st after Sprint 18.7', () => {
        const ids = [...heIDs, ...stIDs];
        const small = ids.filter((sid) => {
            const p = path.join(SRC_DIR, `${sid}.png`);
            if (!fs.existsSync(p)) return false; // AC1/AC2 already pin this
            return fs.statSync(p).size <= 5120;
        });
        expect(small, `these PNGs are ≤5KB: ${small.join(', ')}`).toEqual([]);
    });

    it('AC4: every scenario carries a non-empty imagePrompt ending with the 16:9 anchor suffix', () => {
        const REQUIRED_TAIL = 'no text, no logos, no watermarks, 16:9 aspect ratio';
        const allScenarios = [...heChunks[0], ...stChunks[0]];
        const missing = [];
        for (const s of allScenarios) {
            const p = (s.imagePrompt ?? '').trim();
            if (p.length < 100 || !p.endsWith(REQUIRED_TAIL)) {
                missing.push({
                    id: s.id,
                    len: p.length,
                    suffixOK: p.endsWith(REQUIRED_TAIL),
                });
            }
        }
        expect(missing, JSON.stringify(missing, null, 2)).toEqual([]);
    });

    it('AC5: source assets mirrored to public/assets/images/scenarios/ (prebuild-sync parity)', () => {
        // Sprint 18.7: 14 st-* scenarios (st-7 moved to financial-literacy) — 15 he + 14 st = 29
        const pubIDs = [...heIDs, ...stIDs].filter((sid) => {
            const p = path.join(PUB_DIR, `${sid}.png`);
            return fs.existsSync(p);
        });
        expect(pubIDs.length, 'public/ count').toBe(29);
        for (const sid of heIDs) {
            const p = path.join(PUB_DIR, `${sid}.png`);
            expect(fs.existsSync(p), `missing public PNG for ${sid}`).toBe(true);
        }
        for (const sid of stIDs) {
            const p = path.join(PUB_DIR, `${sid}.png`);
            expect(fs.existsSync(p), `missing public PNG for ${sid}`).toBe(true);
        }
    });
});
