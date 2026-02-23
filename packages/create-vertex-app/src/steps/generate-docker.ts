import { promises as fs } from 'fs';
import * as path from 'path';
import { ScaffolderOptions } from '../prompts';

export async function generateDocker(options: ScaffolderOptions): Promise<void> {
  const dockerPath = path.join(process.cwd(), options.projectName, 'docker-compose.yaml');

  let content = '';

  if (options.database === 'mongo') {
    content = `
services:
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
`.trim();
  } else {
    content = `
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${options.projectName}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
`.trim();
  }

  await fs.writeFile(dockerPath, content);
}
