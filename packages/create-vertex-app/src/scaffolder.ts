import { promptUser, ScaffolderOptions } from './prompts';
import { createNxWorkspace } from './steps/create-nx-workspace';
import { generateServerApp } from './steps/generate-server-app';
import { generateClientApp } from './steps/generate-client-app';
import { configurePlugins } from './steps/configure-plugins';
import { generateDocker } from './steps/generate-docker';
import { generateVertexJson } from './steps/generate-vertex-json';
import { generateEnv } from './steps/generate-env';
import { seedContent } from './steps/seed-content';
import { installDeps } from './steps/install-deps';
import chalk from 'chalk';
import ora from 'ora';

export async function scaffoldProject(projectName: string) {
  const options = await promptUser(projectName);

  console.log(`\n🔺 Creating VertexCMS project: ${chalk.bold(projectName)}\n`);

  try {
    await runStep('Creating Nx workspace', () => createNxWorkspace(options));
    await runStep('Generating NestJS server app', () => generateServerApp(options));
    
    if (options.frontend !== 'none') {
      await runStep('Generating Angular client app', () => generateClientApp(options));
    }
    
    await runStep('Configuring plugins', () => configurePlugins(options));
    
    if (options.useDocker) {
      await runStep('Generating Docker Compose', () => generateDocker(options));
    }
    
    await runStep('Writing vertex.json', () => generateVertexJson(options));
    await runStep('Generating .env with JWT secret', () => generateEnv(options));
    
    if (options.includeExamples) {
      await runStep('Creating seed content', () => seedContent(options));
    }
    
    await runStep('Installing dependencies', () => installDeps(options));

    console.log(`\n🎉 Project created successfully!\n`);
    console.log(`  Next steps:`);
    console.log(`  ┌─────────────────────────────────────────┐`);
    console.log(`  │  cd ${projectName}                      │`);
    if (options.useDocker) {
      console.log(`  │  docker compose up -d                   │`);
    }
    if (options.frontend !== 'none') {
      console.log(`  │  npx nx serve ${projectName}-server      │`);
      console.log(`  │  npx nx serve ${projectName}-client      │`);
    } else {
      console.log(`  │  npx nx serve ${projectName}-server      │`);
    }
    console.log(`  │                                         │`);
    console.log(`  │  Admin: http://localhost:4200/admin      │`);
    console.log(`  │  Default login: admin@vertex.dev / admin │`);
    console.log(`  └─────────────────────────────────────────┘\n`);

  } catch (error: any) {
    console.error(chalk.red('\n✖ Process failed:'), error.message || error);
  }
}

async function runStep(name: string, fn: () => Promise<void>) {
  const spinner = ora(name).start();
  try {
    await fn();
    spinner.succeed();
  } catch (err: any) {
    spinner.fail();
    throw err;
  }
}
