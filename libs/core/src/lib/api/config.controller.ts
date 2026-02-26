import { Controller, Get, Request } from '@nestjs/common';
import { SchemaDiscoveryService } from '../services/schema-discovery.service';
import { LocaleConfigProvider } from '../providers/locale-config.provider';
import { PluginRegistryService } from '../services/plugin-registry.service';

@Controller('api/vertex/config')
export class ConfigController {
  constructor(
    private readonly discovery: SchemaDiscoveryService,
    private readonly localeConfig: LocaleConfigProvider,
    private readonly pluginRegistry: PluginRegistryService
  ) {}

  @Get()
  getConfig(@Request() req: any) {
    let user: any = null;
    const authHeader = req?.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = token.split('.')[1];
        user = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
      } catch (e) {}
    }
    
    let collections = this.discovery.getAllCollections();
    
    // If user has scoped collections, filter
    if (user?.collections?.length) {
      collections = collections.filter(c => user.collections.includes(c.slug));
    }
    
    // Filter out internal collections (starting with _)
    collections = collections.filter(c => !c.slug.startsWith('_'));

    return {
      collections,
      capabilities: {
        storage: this.pluginRegistry.hasCapability('storage'),
        auth: this.pluginRegistry.hasCapability('auth'),
        database: this.pluginRegistry.hasCapability('database'),
        email: this.pluginRegistry.hasCapability('email'),
        readOnly: user?.readOnly || false
      }
    };
  }

  @Get('locales')
  getLocales() {
    // Returns locale configuration for frontend
    return this.localeConfig.getConfig();
  }
}