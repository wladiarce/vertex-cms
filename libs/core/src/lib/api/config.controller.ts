import { Controller, Get } from '@nestjs/common';
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
  getConfig() {
    // Returns the full JSON metadata of all collections
    return {
      collections: this.discovery.getAllCollections(),
      capabilities: {
        storage: this.pluginRegistry.hasCapability('storage'),
        auth: this.pluginRegistry.hasCapability('auth'),
        database: this.pluginRegistry.hasCapability('database'),
        email: this.pluginRegistry.hasCapability('email')
      }
    };
  }

  @Get('locales')
  getLocales() {
    // Returns locale configuration for frontend
    return this.localeConfig.getConfig();
  }
}