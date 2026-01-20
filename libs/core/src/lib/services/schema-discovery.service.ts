import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { COLLECTION_METADATA_KEY, CollectionMetadata, FIELD_METADATA_KEY, BLOCK_METADATA_KEY, BlockMetadata } from '@vertex/common';
import { MongooseSchemaFactory } from '../schema/mongoose-schema.factory';

@Injectable()
export class SchemaDiscoveryService implements OnModuleInit {
  // We store the generated metadata here to serve it to the Admin UI later
  private readonly collections: Map<string, CollectionMetadata> = new Map();

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly schemaFactory: MongooseSchemaFactory
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

      // Process fields to resolve Block Classes into JSON Metadata
      const processedFields = fields.map((field: any) => {
        if (field.type === 'blocks' && Array.isArray(field.blocks)) {
          return {
            ...field,
            blocks: field.blocks.map((blockClass: Function) => this.extractBlockMetadata(blockClass))
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

      // 4. Create Mongoose Schema & Model
      const schema = this.schemaFactory.createSchema(fullMeta);
      
      // Register the model dynamically with Mongoose
      // We use 'slug' or 'singularName' as the model name
      if (!this.connection.models[collectionMeta.slug]) {
        this.connection.model(collectionMeta.slug, schema);
        console.log(`[VertexCMS] Registered Collection: ${collectionMeta.slug}`);
      }
    }
  }
  
  getCollection(slug: string): CollectionMetadata | undefined {
    return this.collections.get(slug);
  }

  getAllCollections(): CollectionMetadata[] {
    return Array.from(this.collections.values());
  }

  /**
   * Helper to extract metadata from a Block Class
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
        // Recursive: If a block contains other blocks, we'd process them here.
        // For now, let's keep it 1-level deep for simplicity.
        if (f.type === 'blocks' && f.blocks) {
           // We need to resolve the classes to metadata for the API
           f.blocks = f.blocks.map((b: Function) => this.extractBlockMetadata(b));
        }
        return f;
      })
    };
  }

  // Not used yet, but required by OnModuleInit interface
  onModuleInit() {} 
}