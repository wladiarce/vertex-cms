import { execSync } from 'child_process';
import { ScaffolderOptions } from '../prompts';

export async function generateServerApp(options: ScaffolderOptions): Promise<void> {
  const cwd = `./${options.projectName}`;
  
  // Install @nx/nest inside the workspace
  execSync('npm install --save-dev @nx/nest', { cwd, stdio: 'ignore' });
  
  // Generate nest server app
  const serverName = `${options.projectName}-server`;
  execSync(`npx nx g @nx/nest:application ${serverName} --directory=apps/${serverName} --projectNameAndRootFormat=as-provided --strict=true`, { cwd, stdio: 'ignore' });
}
