import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { COLLECTION_METADATA_KEY, CollectionMetadata, FIELD_METADATA_KEY } from '@vertex/common';
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

      // 2. Combine them into a full definition
      const fullMeta: CollectionMetadata = {
        ...collectionMeta,
        name: entity.name,
        fields: fields
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

  // Not used yet, but required by OnModuleInit interface
  onModuleInit() {} 
}