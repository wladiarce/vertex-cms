#!/usr/bin/env node
import { Command } from 'commander';
import { generateCollection } from '../src/commands/generate-collection';
import { generateBlock } from '../src/commands/generate-block';
import { migrate } from '../src/commands/migrate';

export const program = new Command();

program
  .name('vertex')
  .version('0.6.0')
  .description('Vertices CLI Tool for VertexCMS Projects');

program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate a new collection or block')
  .action((type, name) => {
    if (type === 'collection') generateCollection(name).catch(console.error);
    else if (type === 'block') generateBlock(name).catch(console.error);
    else console.error('Unknown type for generate. Use "collection" or "block"');
  });

program
  .command('migrate')
  .description('Run database migrations')
  .action(() => {
    migrate().catch(console.error);
  });

program.parse(process.argv);
