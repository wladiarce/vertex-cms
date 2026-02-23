import { Module, DynamicModule, Global } from '@nestjs/common';
import { SchemaDiscoveryService } from './services/schema-discovery.service';
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
import { VertexCoreOptions, DEFAULT_LOCALE_CONFIG, VertexPlugin, DatabaseAdapter } from '@vertex/common';
import { UploadController } from './api/upload.controller';
import { LocaleConfigProvider } from './providers/locale-config.provider';
import { Version } from './collections/version.collection';
import { Upload } from './collections/upload.collection';
import { DatabaseRegistryService } from './services/database-registry.service';
import { VERTEX_DB_ADAPTER } from '@vertex/common';

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
        ContentService,
        VersionService,
        ImageProcessorService,
        AuthService,
        JwtStrategy,
        JwtAuthGuard,
        LocaleConfigProvider,
        PluginRegistryService,
        DatabaseRegistryService
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
        PluginRegistryService,
        DatabaseRegistryService
]
})
export class VertexCoreModule {
  static forRoot(options: VertexCoreOptions): DynamicModule {
    
    // Gather all plugins from named slots and generic array
    const allPlugins = [
      options.storage,
      options.database,
      ...(options.blocks || []),
      // options.auth,
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
            return true;
          },
          inject: [PluginRegistryService]
        },
        // Initialize the database registry using the injected adapter from the plugin
        {
          provide: 'VERTEX_DATABASE_INITIALIZER',
          useFactory: async (registry: DatabaseRegistryService, adapter: DatabaseAdapter) => {
            await registry.registerAdapter(adapter);
            return true;
          },
          inject: [DatabaseRegistryService, VERTEX_DB_ADAPTER]
        },
        // We run a factory to trigger the discovery logic immediately on startup
        {
          provide: 'VERTEX_BOOTSTRAP',
          useFactory: async (discovery: SchemaDiscoveryService, _p: any, _d: any, registry: DatabaseRegistryService) => {
             // Register System collections first, then user collections
             await discovery.registerCollections([Version, Upload, ...options.entities]);

             // Finalize database adapter if needed (e.g. TypeORM needs to rebuild metadata)
             const adapter = registry.getAdapter();
             if (adapter.onDiscoveryComplete) {
               await adapter.onDiscoveryComplete();
             }
          },
          inject: [SchemaDiscoveryService, 'VERTEX_PLUGIN_INITIALIZER', 'VERTEX_DATABASE_INITIALIZER', DatabaseRegistryService]
        }
    ];

    return {
      module: VertexCoreModule,
      imports: [
        ...pluginModules,
      ],
      providers,
      exports: [
        SchemaDiscoveryService,
        PluginRegistryService,
        DatabaseRegistryService
      ]
    };
  }
}
