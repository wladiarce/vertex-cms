import { Injectable, OnModuleInit } from '@nestjs/common';
import { COLLECTION_METADATA_KEY, CollectionMetadata, FIELD_METADATA_KEY, BLOCK_METADATA_KEY, BlockMetadata, RepeaterMetadata } from '@vertex-cms/common';
import { DatabaseRegistryService } from './database-registry.service';

@Injectable()
export class SchemaDiscoveryService implements OnModuleInit {
  // We store the generated metadata here to serve it to the Admin UI later
  private readonly collections: Map<string, CollectionMetadata> = new Map();

  constructor(
    private readonly dbRegistry: DatabaseRegistryService,
  ) {}

  /**
   * Called automatically when the user imports VertexCoreModule.
   * This is where the magic happens.
   */
  async registerCollections(entities: Function[]) {
    for (const entity of entities) {
      // 1. Read the Class Metadata
      const collectionMeta: CollectionMetadata = Reflect.getMetadata(COLLECTION_METADATA_KEY, entity);
      const fields = Reflect.getMetadata(FIELD_METADATA_KEY, entity) || [];

      if (!collectionMeta) {
        console.warn(`Entity ${entity.name} is missing @Collection decorator.`);
        continue;
      }

      // Process fields to resolve Block/Repeater Classes into JSON Metadata
      const processedFields = fields.map((field: any) => {
        if (field.type === 'blocks' && Array.isArray(field.blocks)) {
          return {
            ...field,
            blocks: field.blocks.map((blockClass: Function) => this.extractBlockMetadata(blockClass))
          };
        }
        if (field.type === 'repeater' && field.repeaterBlock) {
          const { repeaterBlock, ...rest } = field; // strip the Function — not JSON-serializable
          return {
            ...rest,
            repeaterFields: this.extractRepeaterMetadata(repeaterBlock)
          };
        }
        return field;
      });

      // 2. Combine them into a full definition
      const fullMeta: CollectionMetadata = {
        ...collectionMeta,
        name: entity.name,
        fields: processedFields
      };

      // 3. Store for internal use (API generation)
      this.collections.set(collectionMeta.slug, fullMeta);

      // 4. Register with the active database adapter
      await this.dbRegistry.getAdapter().registerCollection(fullMeta);
      console.log(`[VertexCMS] Registered Collection: ${collectionMeta.slug}`);
    }
  }
  
  getCollection(slug: string): CollectionMetadata | undefined {
    return this.collections.get(slug);
  }

  getAllCollections(): CollectionMetadata[] {
    return Array.from(this.collections.values());
  }

  /**
   * Helper: extract metadata from a @Block-decorated class
   */
  private extractBlockMetadata(blockClass: Function): BlockMetadata {
    const blockOptions = Reflect.getMetadata(BLOCK_METADATA_KEY, blockClass);
    const fields = Reflect.getMetadata(FIELD_METADATA_KEY, blockClass) || [];

    if (!blockOptions) {
      throw new Error(`Class ${blockClass.name} is missing @Block decorator`);
    }

    return {
      slug: blockOptions.slug,
      label: blockOptions.label || blockOptions.slug,
      fields: fields.map((f: any) => {
        if (f.type === 'blocks' && f.blocks) {
           f.blocks = f.blocks.map((b: Function) => this.extractBlockMetadata(b));
        }
        if (f.type === 'repeater' && f.repeaterBlock) {
          const { repeaterBlock, ...rest } = f;
          return { ...rest, repeaterFields: this.extractRepeaterMetadata(repeaterBlock) };
        }
        return f;
      })
    };
  }

  /**
   * Helper: extract metadata from a @RepeatBlock-decorated class
   */
  private extractRepeaterMetadata(cls: Function): RepeaterMetadata {
    const fields = Reflect.getMetadata(FIELD_METADATA_KEY, cls) || [];
    return { fields };
  }

  // Not used yet, but required by OnModuleInit interface
  onModuleInit() {} 
}