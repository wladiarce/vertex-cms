import { Module, DynamicModule, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchemaDiscoveryService } from './services/schema-discovery.service';
import { MongooseSchemaFactory } from './schema/mongoose-schema.factory';
import { ContentService } from './services/content.service';
import { VersionService } from './services/version.service';
import { ImageProcessorService } from './services/image-processor.service';
import { ConfigController } from './api/config.controller';
import { ContentController } from './api/content.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { PluginRegistryService } from './services/plugin-registry.service';
import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { StorageAdapter, VertexCoreOptions, DEFAULT_LOCALE_CONFIG, VertexPlugin } from '@vertex/common';
import { UploadController } from './api/upload.controller';
import { LocaleConfigProvider } from './providers/locale-config.provider';
import { Version } from './collections/version.collection';
import { Upload, UploadMongooseSchema } from './schema/upload.schema';


@Global() // Make it global so we don't have to import it everywhere
@Module({
    imports: [
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
      MongooseModule.forFeature([
        { name: Upload.name, schema: UploadMongooseSchema }
      ])
    ],
    providers: [
        SchemaDiscoveryService,
        MongooseSchemaFactory,
        ContentService,
        VersionService,
        ImageProcessorService,
        AuthService,
        JwtStrategy,
        JwtAuthGuard,
        LocaleConfigProvider,
        PluginRegistryService
    ],
    controllers: [
        ConfigController,
        ContentController,
        AuthController,
        UploadController
    ],
    exports: [
        SchemaDiscoveryService,
        LocaleConfigProvider,
        PluginRegistryService
]
})
export class VertexCoreModule {
  static forRoot(options: VertexCoreOptions): DynamicModule {
    
    // Gather all plugins from named slots and generic array
    const allPlugins = [
      options.storage,
      ...(options.blocks || []),
      // options.auth,
      // options.db,
      ...(options.plugins || [])
    ].filter(Boolean) as VertexPlugin[];

    const pluginModules = allPlugins.map(p => p.module);

    const providers: any[] = [
        {
          provide: 'LOCALE_CONFIG',
          useValue: options.locales || DEFAULT_LOCALE_CONFIG
        },
        {
          provide: 'VERTEX_OPTIONS',
          useValue: options
        },
        // Initialize the plugin registry
        {
          provide: 'VERTEX_PLUGIN_INITIALIZER',
          useFactory: (registry: PluginRegistryService) => {
            registry.init(allPlugins);
          },
          inject: [PluginRegistryService]
        },
        // We run a factory to trigger the discovery logic immediately on startup
        {
          provide: 'VERTEX_BOOTSTRAP',
          useFactory: async (discovery: SchemaDiscoveryService) => {
             // Register Version collection first, then user collections
             await discovery.registerCollections([Version, ...options.entities]);
          },
          inject: [SchemaDiscoveryService]
        }
    ];

    return {
      module: VertexCoreModule,
      imports: [
        // Initialize Mongoose with the user's URI
        MongooseModule.forRoot(options.mongoUri),
        ...pluginModules,
      ],
      providers,
      exports: [
        SchemaDiscoveryService,
        PluginRegistryService,
      ]
    };
  }
}