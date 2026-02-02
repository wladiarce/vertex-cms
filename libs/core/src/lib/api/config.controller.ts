import { Controller, Get } from '@nestjs/common';
import { SchemaDiscoveryService } from '../services/schema-discovery.service';
import { LocaleConfigProvider } from '../providers/locale-config.provider';

@Controller('api/vertex/config')
export class ConfigController {
  constructor(
    private readonly discovery: SchemaDiscoveryService,
    private readonly localeConfig: LocaleConfigProvider
  ) {}

  @Get()
  getConfig() {
    // Returns the full JSON metadata of all collections
    return {
      collections: this.discovery.getAllCollections()
    };
  }

  @Get('locales')
  getLocales() {
    // Returns locale configuration for frontend
    return this.localeConfig.getConfig();
  }
}