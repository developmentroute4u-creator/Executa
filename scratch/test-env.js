const fs = require('fs');
const path = require('path');

function checkEnvFile(filename) {
  const filepath = path.resolve(__dirname, '..', filename);
  if (!fs.existsSync(filepath)) {
    console.log(`${filename} does not exist.`);
    return;
  }
  const content = fs.readFileSync(filepath, 'utf8');
  console.log(`=== ${filename} ===`);
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0];
    const val = parts.slice(1).join('=');
    console.log(`${key}: ${val ? (val.substring(0, 4) + '...' + val.substring(val.length - 4)) : 'empty'}`);
  });
}

checkEnvFile('.env');
checkEnvFile('.env.local');
