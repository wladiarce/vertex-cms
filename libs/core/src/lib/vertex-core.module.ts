import { Module, DynamicModule, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchemaDiscoveryService } from './services/schema-discovery.service';
import { MongooseSchemaFactory } from './schema/mongoose-schema.factory';
import { ContentService } from './services/content.service';
import { ConfigController } from './api/config.controller';
import { ContentController } from './api/content.controller';

export interface VertexCoreOptions {
  mongoUri: string;
  collections: Function[]; // The classes the user created
}

@Global() // Make it global so we don't have to import it everywhere
@Module({
    providers: [
        SchemaDiscoveryService,
        MongooseSchemaFactory,
        ContentService,
    ],
    controllers: [
        ConfigController,
        ContentController
    ],
    exports: [
        SchemaDiscoveryService
]
})
export class VertexCoreModule {
  static forRoot(options: VertexCoreOptions): DynamicModule {
    return {
      module: VertexCoreModule,
      imports: [
        // Initialize Mongoose with the user's URI
        MongooseModule.forRoot(options.mongoUri),
      ],
      providers: [
        {
          provide: 'VERTEX_OPTIONS',
          useValue: options
        },
        // We run a factory to trigger the discovery logic immediately on startup
        {
          provide: 'VERTEX_BOOTSTRAP',
          useFactory: async (discovery: SchemaDiscoveryService) => {
             await discovery.registerCollections(options.collections);
          },
          inject: [SchemaDiscoveryService]
        }
      ]
    };
  }
}