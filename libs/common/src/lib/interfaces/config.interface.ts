import { FieldType } from '../constants/field-types';

export interface CollectionHooks {
  // Runs before data is saved to DB. Useful for hashing passwords or validation.
  beforeChange?: (args: { data: any; operation: 'create' | 'update' }) => Promise<any> | any;
  
  // Runs after data is fetched. Useful for sanitizing (removing passwords).
  afterRead?: (args: { doc: any }) => Promise<any> | any;
}

/**
 * Options passed to the @Field() decorator
 */
export interface FieldOptions {
  label?: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  hidden?: boolean; // If true, hidden from API response by default
  defaultValue?: any;

  // For 'number' type
  min?: number;
  
  // For 'select' type
  options?: { label: string; value: string | number }[];
  
  // For 'relationship' type
  relationTo?: string; // The slug of the related collection
  
  // Validation
  minLength?: number;
  maxLength?: number;
}

/**
 * Options passed to the @Collection() decorator
 */
export interface CollectionOptions {
  slug: string; // The URL path (e.g., 'blog-posts')
  singularName?: string;
  pluralName?: string;
  timestamps?: boolean; // auto-add createdAt/updatedAt
  hooks?: CollectionHooks;
  
  // Access Control (Simple RBAC for now)
  access?: {
    read?: string[]; // e.g. ['public', 'admin']
    create?: string[];
    update?: string[];
    delete?: string[];
  };
}

/**
 * The runtime definition generated from the decorators.
 * This is what the Frontend (Admin) receives from the API.
 */
export interface CollectionMetadata extends CollectionOptions {
  name: string; // The class name
  fields: (FieldOptions & { name: string })[]; // Field name is inferred from property key
}