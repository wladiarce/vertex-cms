import { promises as fs } from 'fs';
import * as path from 'path';
import { ScaffolderOptions } from '../prompts';

export async function generateVertexJson(options: ScaffolderOptions): Promise<void> {
  const jsonPath = path.join(process.cwd(), options.projectName, 'vertex.json');

  const content = {
    $schema: "https://vertexcms.dev/schemas/vertex.json",
    version: "0.6.0",
    project: {
      name: options.projectName,
      type: "full-stack",
      structure: options.structure
    },
    paths: {
      server: `apps/${options.projectName}-server`,
      client: options.frontend !== 'none' ? `apps/${options.projectName}-client` : '',
      collections: `apps/${options.projectName}-server/src/app/collections`,
      blocks: `apps/${options.projectName}-server/src/app/blocks`,
      blockComponents: options.frontend !== 'none' ? `apps/${options.projectName}-client/src/app/components/blocks` : ''
    },
    database: {
      plugin: options.database,
      uri: options.database === 'mongo' ? `mongodb://localhost:27017/${options.projectName}` : `postgresql://postgres:postgres@localhost:5432/${options.projectName}`
    },
    storage: {
      plugin: options.storage,
      uploadDir: "uploads"
    },
    frontend: options.frontend,
    locales: {
      default: "en",
      supported: ["en"]
    }
  };

  await fs.writeFile(jsonPath, JSON.stringify(content, null, 2));
}
