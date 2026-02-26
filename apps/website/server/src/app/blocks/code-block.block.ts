import { Block, Field, FieldType } from '@vertex-cms/common';

@Block({
  slug: 'code-block',
  name: 'Code Block',
})
export class CodeBlock {
  @Field({ type: FieldType.Select, options: [
    { label: 'TypeScript', value: 'typescript' },
    { label: 'HTML', value: 'html' },
    { label: 'CSS', value: 'css' },
    { label: 'JSON', value: 'json' },
    { label: 'Bash', value: 'bash' }
  ], required: true })
  language: string;

  @Field({ type: FieldType.Text, required: true })
  code: string;
}
