export enum FieldType {
  // Primitives
  Text = 'text',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'date',
  Email = 'email',
  RichText = 'rich-text',
  
  // Media
  Upload = 'upload',
  
  // Complex
  Select = 'select',
  Relationship = 'relationship',
  Blocks = 'blocks',
  Repeater = 'repeater'
}

// Helper to check if a type needs a frontend distinct component
export const isPrimitive = (type: FieldType): boolean => {
  return [FieldType.Text, FieldType.Number, FieldType.Email, FieldType.Date, FieldType.Boolean].includes(type);
};