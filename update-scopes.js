const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const targetString = '@vertex/plugin-db-mongo';
const replacementString = '@vertex-cms/plugin-db-mongo';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== '.nx' && file !== 'tmp') {
        walk(fullPath);
      }
    } else if (stats.isFile()) {
      if (file.endsWith('.ts') || file.endsWith('.json') || file.endsWith('.md')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(targetString)) {
          console.log(`Updating ${fullPath}`);
          content = content.split(targetString).join(replacementString);
          fs.writeFileSync(fullPath, content, 'utf8');
        }
      }
    }
  }
}

walk(rootDir);
console.log('Finished updating package references.');
