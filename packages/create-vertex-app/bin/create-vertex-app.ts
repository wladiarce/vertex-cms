#!/usr/bin/env node
import { scaffoldProject } from '../src/scaffolder';

const projectName = process.argv[2];

if (!projectName) {
  console.error('Usage: npx create-vertex-app <project-name>');
  process.exit(1);
}

// Ensure the process uses process.argv
// Trigger scaffold
scaffoldProject(projectName).catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
