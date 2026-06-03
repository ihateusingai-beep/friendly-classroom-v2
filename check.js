import { readFileSync } from 'fs';
const d = JSON.parse(readFileSync('./src/data/scenarios.json','utf8'));
d.forEach(s=>{
  const hasName = 'name' in s;
  const hasTitle = 'title' in s;
  console.log(`${s.id} | name:${hasName} | title:${hasTitle} | nameVal:${s.name||'N/A'} | titleVal:${s.title||'N/A'}`);
});