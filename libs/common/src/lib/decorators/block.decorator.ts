import 'reflect-metadata';

export interface BlockOptions {
  slug: string; // Internal ID (e.g. 'hero')
  label?: string; // Display name (e.g. 'Hero Section')
  icon?: string; // Optional icon for the Admin UI picker
}

export const BLOCK_METADATA_KEY = 'vertex:block';

export function Block(options: BlockOptions): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(BLOCK_METADATA_KEY, options, target);
  };
}