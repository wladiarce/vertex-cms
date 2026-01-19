import 'reflect-metadata';
import { FieldOptions } from '../interfaces/config.interface';

export const FIELD_METADATA_KEY = 'vertex:fields';

export function Field(options: FieldOptions): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    // 1. Get existing fields or initialize empty array
    const existingFields = Reflect.getMetadata(FIELD_METADATA_KEY, target.constructor) || [];
    
    // 2. Add new field definition
    const newField = {
      ...options,
      name: propertyKey.toString() // Infer the field name from the property
    };

    // 3. Save back to metadata
    Reflect.defineMetadata(FIELD_METADATA_KEY, [...existingFields, newField], target.constructor);
  };
}