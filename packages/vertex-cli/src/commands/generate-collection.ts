import inquirer from 'inquirer';
import * as path from 'path';
import chalk from 'chalk';
import { getVertexConfig } from '../utils/vertex-config';
import { renderTemplate, toPascalCase } from '../utils/template-engine';
import { writeGeneratedFile, updateAppModule } from '../utils/file-writer';

const COLLECTION_TEMPLATE = `import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: '{{slug}}',
  singularName: '{{singularName}}',
  timestamps: true,
  access: {
    read: ['public'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin']
  }
})
export class {{ClassName}} {
{{#fields}}  @Field({ type: FieldType.{{type}}{{#required}}, required: true{{/required}}{{#localized}}, localized: true{{/localized}} })
  {{name}}!: {{tsType}};

{{/fields}}}
`;

function mapFieldTypeToTS(type: string): string {
  switch (type) {
    case 'Text':
    case 'Email':
    case 'RichText':
    case 'Blocks':
    case 'Select':
      return 'string';
    case 'Number':
      return 'number';
    case 'Boolean':
      return 'boolean';
    case 'Date':
      return 'Date';
    case 'Upload':
      return 'any';
    case 'Relationship':
      return 'any';
    default:
      return 'any';
  }
}

export async function generateCollection(slug: string): Promise<void> {
  try {
    const config = await getVertexConfig();
    const serverPath = path.join(process.cwd(), config.paths.server);
    const collectionsPath = path.join(process.cwd(), config.paths.collections);

    console.log(chalk.blue(`\nGenerating collection: ${slug}\n`));

    const { singularName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'singularName',
        message: 'Singular name (e.g., Article):',
        default: toPascalCase(slug).replace(/s$/, '') // simple singularize
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
          message: 'Field name:',
          validate: (val) => val.trim().length > 0
        },
        {
          type: 'list',
          name: 'type',
          message: 'Field type:',
          choices: ['Text', 'Number', 'Boolean', 'Date', 'Email', 'RichText', 'Upload', 'Relationship', 'Select', 'Blocks']
        },
        {
          type: 'confirm',
          name: 'required',
          message: 'Required?',
          default: false
        },
        {
          type: 'confirm',
          name: 'localized',
          message: 'Localized?',
          default: false
        }
      ]);

      fields.push({
        ...fieldData,
        tsType: mapFieldTypeToTS(fieldData['type'])
      });
    }

    const ClassName = toPascalCase(slug).replace(/s$/, ''); // Article
    
    // Render file
    const fileContent = renderTemplate(COLLECTION_TEMPLATE, {
      slug,
      singularName,
      ClassName,
      fields
    });

    const filePath = path.join(collectionsPath, `${slug}.collection.ts`);
    await writeGeneratedFile(filePath, fileContent);

    // Update App Module
    const importStatement = `import { ${ClassName} } from './collections/${slug}.collection';`;
    await updateAppModule(serverPath, importStatement, ClassName);

    console.log(chalk.green(`\n✔ Created ${filePath}`));
    console.log(chalk.green(`✔ Updated app.module.ts\n`));
    console.log(chalk.cyan('Next steps:'));
    console.log(`  1. Restart your server if it's already running.`);
    console.log(`  2. Check the admin panel to see the new collection.\n`);
    
  } catch (error: any) {
    console.error(chalk.red('\nError generating collection:'), error.message || error);
  }
}
