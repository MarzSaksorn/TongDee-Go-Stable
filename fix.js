const fs = require('fs');
let content = fs.readFileSync('src/components/HomeView.tsx', 'utf8');
const lines = content.split('\n');
const fixedLines = lines.filter((line, i) => {
  return !(i >= 228 && i <= 238); // 0-indexed, so 229 is 228, 239 is 238
});
fs.writeFileSync('src/components/HomeView.tsx', fixedLines.join('\n'));
console.log('Fixed!');
