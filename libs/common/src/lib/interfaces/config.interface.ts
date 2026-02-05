import { FieldType } from '../constants/field-types';

/**
 * Document status for draft/publish system
 */
export enum DocumentStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived'
}

/**
 * Locale configuration for i18n support
 */
export interface LocaleConfiguration {
  default: string;
  supported: string[];
  names?: Record<string, string>;
}

/**
 * Options for initializing VertexCoreModule
 */
export interface VertexCoreOptions {
  mongoUri: string;
  entities: Function[];
  locales?: LocaleConfiguration;
  storageAdapter?: any; // new (...args: any[]) => StorageAdapter - avoiding circular dependency
}

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
  localized?: boolean; // If true, field supports multiple languages (stored as { en: "value", es: "valor" })

  // For 'number' type
  min?: number;
  
  // For 'select' type
  options?: { label: string; value: string | number }[];
  
  // For 'relationship' type
  relationTo?: string; // The slug of the related collection
  relationMany?: boolean; // If true, field stores array of ObjectIds (many-to-many)
  
  // Validation
  minLength?: number;
  maxLength?: number;

  // For 'blocks' type
  blocks?: Function[]; // Array of Classes (e.g., [HeroBlock, TextBlock])
}

/**
 * Options passed to the @Collection() decorator
 */
export interface CollectionOptions {
  slug: string; // The URL path (e.g., 'blog-posts')
  singularName?: string;
  pluralName?: string;
  timestamps?: boolean; // auto-add createdAt/updatedAt
  drafts?: boolean; // Enable draft/publish system (default: true)
  maxVersions?: number; // Maximum versions to keep (default: 5)
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
  // fields: (FieldOptions & { name: string })[]; // Field name is inferred from property key
  fields: (FieldOptions & { name: string;  blocks?: BlockMetadata[] | undefined; })[]; // Field name is inferred from property key
}

// We also need a metadata interface for the API response
export interface BlockMetadata {
  slug: string;
  label: string;
  // fields: (FieldOptions & { name: string })[];
  fields: (FieldOptions & { name: string; blocks?: BlockMetadata[] | undefined; })[];
}

// Update CollectionMetadata to include available blocks (optional but helpful)
// Actually, the FieldOptions in the collection already carries the block data, 
// but we need to resolve the Class Constructors into JSON Metadata for the frontend.