import { execSync } from 'child_process';
import { ScaffolderOptions } from '../prompts';

export async function generateClientApp(options: ScaffolderOptions): Promise<void> {
  const cwd = `./${options.projectName}`;
  const clientName = `${options.projectName}-client`;
  
  // Install @nx/angular
  execSync('npm install --save-dev @nx/angular', { cwd, stdio: 'ignore' });
  
  // Generate angular app
  const ssrFlag = options.frontend === 'ssr' ? '--ssr' : '--ssr=false';
  execSync(`npx nx g @nx/angular:application ${clientName} --directory=apps/${clientName} --projectNameAndRootFormat=as-provided --style=scss --standalone=true --routing=true ${ssrFlag}`, { cwd, stdio: 'ignore' });
}
