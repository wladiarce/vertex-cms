export function renderTemplate(templateStr: string, variables: Record<string, any>): string {
  let result = templateStr;
  
  // Very simplistic renderer
  for (const [key, value] of Object.entries(variables)) {
    if (Array.isArray(value)) {
      // Loop replacement: {{#fields}}...{{/fields}}
      const regex = new RegExp(`(\{\{#{key}\}\})([\\\s\\\S]*?)(\{\{/${key}\}\})`, 'g');
      result = result.replace(regex, (match, open, content, close) => {
        return value.map((item) => renderTemplate(content, item)).join('');
      });
    } else if (typeof value === 'boolean') {
      const regex = new RegExp(`(\{\{#{key}\}\})([\\\s\\\S]*?)(\{\{/${key}\}\})`, 'g');
      result = result.replace(regex, (match, open, content, close) => {
        return value ? content : '';
      });
    } else {
      // String replacement: {{key}}
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value?.toString() || '');
    }
  }

  // Clear unreplaced boolean blocks
  result = result.replace(/\{\{#[^}]+\}\}[\s\S]*?\{\{\/[^}]+\}\}/g, '');
  
  return result;
}

export function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
}

export function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}
