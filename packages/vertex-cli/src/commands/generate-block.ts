import inquirer from 'inquirer';
import * as path from 'path';
import chalk from 'chalk';
import { getVertexConfig } from '../utils/vertex-config';
import { renderTemplate, toPascalCase, toCamelCase } from '../utils/template-engine';
import { writeGeneratedFile, updateAppModuleForBlock } from '../utils/file-writer';

const BLOCK_BACKEND = `import { Block, Field, FieldType } from '@vertex-cms/common';

@Block({ slug: '{{slug}}', label: '{{label}}' })
export class {{ClassName}}Block {
{{#fields}}  @Field({ type: FieldType.{{type}}, label: '{{label}}' })
  {{name}}!: {{tsType}};

{{/fields}}}
`;

const BLOCK_FRONTEND = `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-block-{{slug}}',
  standalone: true,
  template: \`<section class="block-{{slug}} p-8">
      <!-- Generated scaffold. Customize this! -->
{{#fields}}      <div>{{ data.{{name}} }}</div>
{{/fields}}    </section>

})
export class {{ClassName}}Component {
  @Input() data: any;
}
;`

function mapFieldTypeToTS(type: string): string {
  switch (type) {
    case 'Text':
    case 'RichText':
    case 'Select':
      return 'string';
    case 'Number':
      return 'number';
    case 'Boolean':
      return 'boolean';
    default:
      return 'any';
  }
}

export async function generateBlock(slug: string): Promise<void> {
  try {
    const config = await getVertexConfig();
    const serverPath = path.join(process.cwd(), config.paths.server);
    const blocksPath = path.join(process.cwd(), config.paths.blocks);
    const blockComponentsPath = config.paths.blockComponents ? path.join(process.cwd(), config.paths.blockComponents) : null;

    console.log(chalk.blue(`\nGenerating block: ${slug}\n`));

    const { label } = await inquirer.prompt([
      {
        type: 'input',
        name: 'label',
        message: 'Display Label (e.g., Hero Section):',
        default: toPascalCase(slug).replace(/([A-Z])/g, ' $1').trim()
      }
    ]);

    const fields: any[] = [];
    let addAnother = true;

    while (addAnother) {
      const { willAdd } = await inquirer.prompt([{
        type: 'confirm',
        name: 'willAdd',
        message: 'Add a field?',
        default: true
      }]);

      if (!willAdd) {
        addAnother = false;
        break;
      }

      const fieldData = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Field name (camelCase):',
          validate: (val) => val.trim().length > 0
        },
        {
          type: 'list',
          name: 'type',
          message: 'Field type:',
          choices: ['Text', 'Number', 'Boolean', 'RichText', 'Upload', 'Select']
        },
        {
          type: 'input',
          name: 'label',
          message: 'Field label (e.g., Headline):',
          default: (answers: any) => toPascalCase(answers.name).replace(/([A-Z])/g, ' $1').trim()
        }
      ]);

      fields.push({
        ...fieldData,
        tsType: mapFieldTypeToTS(fieldData['type'])
      });
    }

    const ClassName = toPascalCase(slug); 
    
    // Render backend file
    const backendContent = renderTemplate(BLOCK_BACKEND, {
      slug,
      label,
      ClassName,
      fields
    });

    const backendPath = path.join(blocksPath, `${slug}.block.ts`);
    await writeGeneratedFile(backendPath, backendContent);

    // Update App Module dynamically for blocks array
    const importStatement = `import { ${ClassName}Block } from './blocks/${slug}.block';`;
    await updateAppModuleForBlock(serverPath, importStatement, `${ClassName}Block`);

    // Render frontend file if configured
    if (blockComponentsPath) {
      const frontendContent = renderTemplate(BLOCK_FRONTEND, {
        slug,
        ClassName,
        fields
      });
      const frontendPath = path.join(blockComponentsPath, `${slug}.component.ts`);
      await writeGeneratedFile(frontendPath, frontendContent);
      console.log(chalk.green(`✔ Created frontend component ${frontendPath}`));
    }

    console.log(chalk.green(`\n✔ Created ${backendPath}`));
    console.log(chalk.green(`✔ Updated app.module.ts\n`));
    console.log(chalk.cyan('Next steps:'));
    console.log(`  1. If using the Angular frontend, remember to register ${ClassName}Component inside your VertexRegistryService.\n`);
    
  } catch (error: any) {
    console.error(chalk.red('\nError generating block:'), error.message || error);
  }
}
