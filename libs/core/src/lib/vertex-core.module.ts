import { Module, DynamicModule, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchemaDiscoveryService } from './services/schema-discovery.service';
import { MongooseSchemaFactory } from './schema/mongoose-schema.factory';
import { ContentService } from './services/content.service';
import { ConfigController } from './api/config.controller';
import { ContentController } from './api/content.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { StorageAdapter } from '@vertex/common';
import { LocalStorageAdapter } from './storage/local-storage.adapter';
import { UploadController } from './api/upload.controller';

export interface VertexCoreOptions {
  mongoUri: string;
  collections: Function[]; // The classes the user created
  storageAdapter?: new (...args: any[]) => StorageAdapter;
}

@Global() // Make it global so we don't have to import it everywhere
@Module({
    imports: [
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    ],
    providers: [
        SchemaDiscoveryService,
        MongooseSchemaFactory,
        ContentService,
        AuthService,
        JwtStrategy,
        JwtAuthGuard
    ],
    controllers: [
        ConfigController,
        ContentController,
        AuthController,
        UploadController
    ],
    exports: [
        SchemaDiscoveryService
]
})
export class VertexCoreModule {
  static forRoot(options: VertexCoreOptions): DynamicModule {

    // Default to LocalStorage if none provided
    const AdapterClass = options.storageAdapter || LocalStorageAdapter;
    
    return {
      module: VertexCoreModule,
      imports: [
        // Initialize Mongoose with the user's URI
        MongooseModule.forRoot(options.mongoUri),
      ],
      providers: [
        {
          provide: StorageAdapter,
          useClass: AdapterClass 
        },
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
      ],
      exports: [
        SchemaDiscoveryService,
        StorageAdapter,
      ]
    };
  }
}