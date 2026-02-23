import { promises as fs } from 'fs';
import * as path from 'path';

export interface VertexConfig {
  version: string;
  project: {
    name: string;
    type: string;
  };
  paths: {
    server: string;
    client: string;
    collections: string;
    blocks: string;
    blockComponents: string;
  };
  database: {
    plugin: string;
    uri: string;
  };
  frontend: string;
}

export async function getVertexConfig(): Promise<VertexConfig> {
  const configPath = path.join(process.cwd(), 'vertex.json');
  try {
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data) as VertexConfig;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.error('Error: "vertex.json" not found in the current directory.');
      console.error('Make sure you are running the vertex CLI from the root of a VertexCMS project.');
      process.exit(1);
    }
    throw err;
  }
}
