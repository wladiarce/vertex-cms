/**
 * PUBLISH SCRIPT
 * Usage: node tools/scripts/publish.mjs <version> [tag]
 * Example: node tools/scripts/publish.mjs 0.0.1 latest
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const version = process.argv[2];
const tag = process.argv[3] || 'latest';

if (!version) {
  console.error('Please provide a version: node tools/scripts/publish.mjs 1.0.0');
  process.exit(1);
}

const libs = ['common', 'core', 'public', 'admin'];

console.log(`🚀 Publishing Version: ${version} (tag: ${tag})`);

// 1. Build Everything
console.log('Building libraries...');
try {
  execSync(`npx nx run-many --target=build --projects=${libs.join(',')}`, { stdio: 'inherit' });
} catch (e) {
  console.error('Build failed');
  process.exit(1);
}

// 2. Publish Loop
libs.forEach(lib => {
  const distPath = `dist/libs/${lib}`;
  const pkgPath = join(distPath, 'package.json');

  if (!existsSync(pkgPath)) {
    console.error(`Error: ${pkgPath} not found`);
    return;
  }

  // Update version in dist package.json before publishing
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  pkg.version = version;
  
  // Update internal dependencies to match the new version
  // e.g. @vertex/core depends on @vertex/common. We need to ensure it asks for ^0.0.1
  if (pkg.peerDependencies) {
    Object.keys(pkg.peerDependencies).forEach(dep => {
      if (dep.startsWith('@vertex/')) {
        pkg.peerDependencies[dep] = `^${version}`;
      }
    });
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  console.log(`📦 Publishing @vertex/${lib}...`);
  try {
    // --access public is required for scoped packages (@vertex)
    execSync(`npm publish ${distPath} --access public --tag ${tag}`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to publish ${lib}`);
    // Don't exit, try the others
  }
});

console.log('✅ Done!');