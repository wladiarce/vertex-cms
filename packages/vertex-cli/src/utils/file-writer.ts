import { promises as fs } from 'fs';
import * as path from 'path';

export async function writeGeneratedFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

export async function updateAppModule(
  serverPath: string, 
  importStatement: string, 
  entityName: string
): Promise<void> {
  const modulePath = path.join(serverPath, 'src/app/app.module.ts');
  let content = await fs.readFile(modulePath, 'utf8');

  // Inject import near other imports
  if (!content.includes(importStatement)) {
    content = content.replace(
      '// Collections', 
      `// Collections\n${importStatement}`
    );
  }

  // Inject entity into array inside VertexCoreModule.forRoot({ entities: [...] })
  if (!content.includes(` ${entityName},`) && !content.includes(` ${entityName} `)) {
    const rx = /entities:\s*\[([\s\S]*?)\]/;
    content = content.replace(rx, (match, p1) => {
      const trimmed = p1.trim();
      if (!trimmed) {
        return `entities: [\n        ${entityName}\n      ]`;
      }
      return `entities: [\n        ${trimmed},\n        ${entityName}\n      ]`;
    });
  }

  await fs.writeFile(modulePath, content, 'utf8');
}

export async function updateAppModuleForBlock(
  serverPath: string, 
  importStatement: string, 
  blockName: string
): Promise<void> {
  const modulePath = path.join(serverPath, 'src/app/app.module.ts');
  let content = await fs.readFile(modulePath, 'utf8');

  // Inject import near other imports
  if (!content.includes(importStatement)) {
    content = content.replace(
      '// Blocks', 
      `// Blocks\n${importStatement}`
    );
  }

  // Inject entity into array inside VertexCoreModule.forRoot({ blocks: [...] })
  if (!content.includes(` ${blockName},`) && !content.includes(` ${blockName} `)) {
    const rx = /blocks:\s*\[([\s\S]*?)\]/;
    content = content.replace(rx, (match, p1) => {
      const trimmed = p1.trim();
      if (!trimmed) {
        return `blocks: [\n        ${blockName}\n      ]`;
      }
      return `blocks: [\n        ${trimmed},\n        ${blockName}\n      ]`;
    });
  }

  await fs.writeFile(modulePath, content, 'utf8');
}
