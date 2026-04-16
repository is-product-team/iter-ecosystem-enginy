const fs = require('fs');

const keys = fs.readFileSync('used_keys.txt', 'utf8').split('\n').filter(k => k.trim());
const es = JSON.parse(fs.readFileSync('apps/mobile/locales/es.json', 'utf8'));
const ca = JSON.parse(fs.readFileSync('apps/mobile/locales/ca.json', 'utf8'));

function getNestedKey(obj, path) {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

const missingInEs = [];
const missingInCa = [];

for (const key of keys) {
  if (!getNestedKey(es, key)) {
    missingInEs.push(key);
  }
  if (!getNestedKey(ca, key)) {
    missingInCa.push(key);
  }
}

console.log('--- MISSING IN ES ---');
console.log(missingInEs.join('\n'));
console.log('\n--- MISSING IN CA ---');
console.log(missingInCa.join('\n'));
