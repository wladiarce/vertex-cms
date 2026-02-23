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
import { VertexCoreOptions, DEFAULT_LOCALE_CONFIG, VertexPlugin, DatabaseAdapter, VERTEX_DB_ADAPTER } from '@vertex-cms/common';
import { UploadController } from './api/upload.controller';
import { LocaleConfigProvider } from './providers/locale-config.provider';
import { Version } from './collections/version.collection';
import { Upload } from './collections/upload.collection';
import { DatabaseRegistryService } from './services/database-registry.service';
import { ApiToken } from './collections/api-token.collection';
import { TokenService } from './services/token.service';
import { TokenController } from './api/token.controller';
import { Webhook } from './collections/webhook.collection';
import { WebhookLog } from './collections/webhook-log.collection';
import { WebhookService } from './services/webhook.service';
import { WebhookController } from './api/webhook.controller';
import { EmailService } from './services/email.service';
import { EmailTemplateService } from './services/email-template.service';
import { EmailTemplate } from './collections/email-template.collection';
import { PasswordReset } from './collections/password-reset.collection';

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
        DatabaseRegistryService,
        TokenService,
        WebhookService,
        EmailService,
        EmailTemplateService
    ],
    controllers: [
        ConfigController,
        ContentController,
        AuthController,
        UploadController,
        TokenController,
        WebhookController
    ],
    exports: [
        SchemaDiscoveryService,
        LocaleConfigProvider,
        PluginRegistryService,
        DatabaseRegistryService,
        TokenService,
        WebhookService,
        EmailService,
        EmailTemplateService
]
})
export class VertexCoreModule {
  static forRoot(options: VertexCoreOptions): DynamicModule {
    
    // Gather all plugins from named slots and generic array
    const allPlugins = [
      options.storage,
      options.database,
      options.email,
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
              await discovery.registerCollections([Version, Upload, ApiToken, Webhook, WebhookLog, EmailTemplate, PasswordReset, ...options.entities]);

             // Finalize database adapter if needed (e.g. TypeORM needs to rebuild metadata)
             const adapter = registry.getAdapter();
             if (adapter.onDiscoveryComplete) {
               await adapter.onDiscoveryComplete();
             }
           },
           inject: [SchemaDiscoveryService, 'VERTEX_PLUGIN_INITIALIZER', 'VERTEX_DATABASE_INITIALIZER', DatabaseRegistryService]
         },
         // Seed default templates
         {
           provide: 'VERTEX_EMAIL_TEMPLATE_SEEDER',
           useFactory: async (templateService: EmailTemplateService) => {
             await templateService.seedDefaultTemplates();
             return true;
           },
           inject: [EmailTemplateService, 'VERTEX_BOOTSTRAP']
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
        DatabaseRegistryService,
        TokenService,
        WebhookService,
        EmailService,
        EmailTemplateService
      ]
    };
  }
}
