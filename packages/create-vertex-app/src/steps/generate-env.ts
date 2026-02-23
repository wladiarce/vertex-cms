import { promises as fs } from 'fs';
import * as path from 'path';
import { ScaffolderOptions } from '../prompts';
import * as crypto from 'crypto';

export async function generateEnv(options: ScaffolderOptions): Promise<void> {
  const envPath = path.join(process.cwd(), options.projectName, '.env');
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  
  const content = `
# VertexCMS Database Configuration
${options.database === 'mongo' 
  ? `VERTEX_MONGO_URI=mongodb://localhost:27017/${options.projectName}` 
  : `VERTEX_POSTGRES_URI=postgresql://postgres:postgres@localhost:5432/${options.projectName}`}

# Application Settings
JWT_SECRET=${jwtSecret}
PORT=3000

# Admin Access
ADMIN_EMAIL=admin@vertex.dev
ADMIN_PASSWORD=admin
  `.trim();

  await fs.writeFile(envPath, content);
}
