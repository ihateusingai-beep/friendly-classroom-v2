import fs from 'fs';
const dir = '/tmp/fc-audit';
const files = fs.readdirSync(dir).filter(f => f.startsWith('axe-') && f.endsWith('.json'));
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(`${dir}/${f}`));
  console.log(`\n=== ${f} ===`);
  for (const v of d.violations || []) {
    console.log(`\n[${v.impact}] ${v.id} — ${v.help}`);
    for (const n of v.nodes) {
      console.log(`  target: ${JSON.stringify(n.target)}`);
      console.log(`  summary: ${(n.failureSummary || '').slice(0, 400)}`);
    }
  }
  for (const i of d.incomplete || []) {
    console.log(`\n[incomplete] ${i.id} (${i.nodes.length} nodes)`);
    for (const n of i.nodes.slice(0, 3)) {
      console.log(`  target: ${JSON.stringify(n.target)}`);
      console.log(`  summary: ${(n.failureSummary || '').slice(0, 200)}`);
    }
  }
}
