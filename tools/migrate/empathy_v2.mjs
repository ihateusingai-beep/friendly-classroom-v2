// tools/migrate/empathy_v2.mjs
// Sprint 16 — DEPRECATED. Use tools/migrate/scenarios_v2.mjs instead.
//
// This file is kept as a thin wrapper for backward compatibility with
// references in docs and chat history. New code should invoke scenarios_v2.mjs
// directly with `<topic>` or `--all` flag.

import { spawnSync } from 'node:child_process';

const result = spawnSync('node', ['tools/migrate/scenarios_v2.mjs', 'empathy', ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd(),
});
process.exit(result.status ?? 1);
