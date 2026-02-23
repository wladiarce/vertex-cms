import inquirer from 'inquirer';

export interface ScaffolderOptions {
  projectName: string;
  structure: 'nx' | 'standalone';
  frontend: 'ssr' | 'spa' | 'none';
  database: 'mongo' | 'postgres';
  storage: 'local' | 'gcs' | 's3';
  includeExamples: boolean;
  useDocker: boolean;
}

export async function promptUser(projectName: string): Promise<ScaffolderOptions> {
  console.log(`\n┌──────────────────────────────────────────┐`);
  console.log(`│  🔺 create-vertex-app                    │`);
  console.log(`│                                          │`);
  console.log(`│  Creating project: ${projectName.padEnd(20)}  │`);
  console.log(`└──────────────────────────────────────────┘\n`);

  const answers: { structure: 'nx' | 'standalone'; frontend: 'ssr' | 'spa' | 'none'; database: 'mongo' | 'postgres'; storage: 'local' | 'gcs' | 's3'; includeExamples: boolean; useDocker: boolean; } = await inquirer.prompt([
    {
      type: 'list',
      name: 'structure',
      message: 'How would you like to structure the project?',
      choices: [
        { name: 'NX monorepo (recommended for Angular + Nest)', value: 'nx' },
        { name: 'Standalone apps (Not fully supported yet in scaffolder, defaulting to nx)', value: 'nx' } // simplifying to nx out of scope
      ]
    },
    {
      type: 'list',
      name: 'frontend',
      message: 'Choose your frontend mode:',
      choices: [
        { name: 'Angular SSR (Full-stack with Server-Side Rendering)', value: 'ssr' },
        { name: 'Angular SPA (Client-Side Only)', value: 'spa' },
        { name: 'Admin panel only (No public pages)', value: 'none' }
      ]
    },
    {
      type: 'list',
      name: 'database',
      message: 'Choose your database:',
      choices: [
        { name: 'MongoDB (Recommended for rapid prototyping)', value: 'mongo' },
        { name: 'PostgreSQL (Best for structured data)', value: 'postgres' }
      ]
    },
    {
      type: 'list',
      name: 'storage',
      message: 'Choose your storage:',
      choices: [
        { name: 'Local filesystem (Default)', value: 'local' }
        // { name: 'Google Cloud Storage', value: 'gcs' },
        // { name: 'Amazon S3', value: 's3' }
      ]
    },
    {
      type: 'confirm',
      name: 'includeExamples',
      message: 'Include example collections? (Recommended for first-time users)',
      default: true
    },
    {
      type: 'confirm',
      name: 'useDocker',
      message: 'Generate Docker Compose for local development?',
      default: true
    }
  ]);

  return {
    projectName,
    ...answers,
    // Just force these for now based on current template reality
    structure: 'nx',
    storage: 'local'
  };
}
