const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/scenarios.json', 'utf8'));

// Parse ID to determine scenario number for title
// s1, s2... s8 → 關卡1, 關卡2...
// s-c2 → 關卡C2, s-b1 → 關卡B1, s-h1 → 關卡H1
// s-door1 → 關卡Door1, s-new1 → 關卡New1

let fixedCount = 0;
data.forEach(scenario => {
  const id = scenario.id;
  
  // Extract type prefix and number from ID
  // s1, s2... numeric
  // s-c2, s-b1, s-h1... type + number
  // s-door1, s-new1... type + number
  
  let title;
  if (/^s\d+$/.test(id)) {
    // s1, s2, s3... → extract number
    const num = id.slice(1);
    title = `關卡${num}`;
  } else {
    // s-c2, s-b1, s-h1, s-door1, s-new1... → keep prefix
    const match = id.match(/^s-([a-z]+)(\d+)$/);
    if (match) {
      const prefix = match[1].toUpperCase();
      const num = match[2];
      title = `關卡${prefix}${num}`;
    } else {
      // fallback: use id as-is
      title = `關卡${id}`;
    }
  }
  
  if (scenario.title !== title) {
    console.log(`${id}: "${scenario.title}" → "${title}"`);
    scenario.title = title;
    fixedCount++;
  }
});

fs.writeFileSync('./src/data/scenarios.json', JSON.stringify(data, null, 2));
console.log(`\nFixed ${fixedCount} scenarios`);