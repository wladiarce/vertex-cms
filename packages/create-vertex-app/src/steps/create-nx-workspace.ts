import { execSync } from 'child_process';
import { ScaffolderOptions } from '../prompts';

export async function createNxWorkspace(options: ScaffolderOptions): Promise<void> {
  // Use create-nx-workspace to initialize the folder
  // We use preset=npm to create an empty workspace and install our deps later
  const cmd = `npx create-nx-workspace@latest ${options.projectName} --preset=apps --pm=npm --nxCloud=skip --interactive=false`;
  execSync(cmd, { stdio: 'ignore' });
}
