import { execSync } from 'child_process';
import { ScaffolderOptions } from '../prompts';

export async function installDeps(options: ScaffolderOptions): Promise<void> {
  const cwd = `./${options.projectName}`;
  
  // Install the vertex core stuff
  const deps = [
    '@vertex-cms/core',
    '@vertex-cms/admin',
    '@vertex-cms/common',
    '@vertex-cms/plugin-storage-local'
  ];
  
  if (options.database === 'mongo') {
    deps.push('@vertex-cms/plugin-db-mongo');
  } else {
    deps.push('@vertex-cms/plugin-db-typeorm');
    deps.push('typeorm');
    deps.push('pg');
  }
  
  execSync(`npm install ${deps.join(' ')}`, { cwd, stdio: 'ignore' });
  
  // Install dev dependencies
  const devDeps = [
    '@vertex-cms/cli',
    'ts-node'
  ];
  
  execSync(`npm install --save-dev ${devDeps.join(' ')}`, { cwd, stdio: 'ignore' });
}
